import {
  withLifecycleCallbacks,
  type CreateParams,
  type DataProvider,
  type Identifier,
  type ResourceCallbacks,
  type UpdateParams,
} from "ra-core";
import fakeRestDataProvider from "ra-data-fakerest";

import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  DeleteCompanyContactsMode,
  Sale,
  SalesFormData,
  SignUpData,
  Task,
} from "../../types";
import type { ConfigurationContextValue } from "../../root/ConfigurationContext";
import { getActivityLog } from "../commons/activity";
import { getCompanyAvatar } from "../commons/getCompanyAvatar";
import { getContactAvatar } from "../commons/getContactAvatar";
import { mergeContacts } from "../commons/mergeContacts";
import type { CrmDataProvider } from "../types";
import {
  authProvider as defaultAuthProvider,
  USER_STORAGE_KEY,
} from "./authProvider";
import generateData from "./dataGenerator";
import type { Db } from "./dataGenerator/types";
import { withSupabaseFilterAdapter } from "./internal/supabaseAdapter";

const TASK_MARKED_AS_DONE = "TASK_MARKED_AS_DONE";
const TASK_MARKED_AS_UNDONE = "TASK_MARKED_AS_UNDONE";
const TASK_DONE_NOT_CHANGED = "TASK_DONE_NOT_CHANGED";

const processCompanyLogo = async (params: any) => {
  let logo = params.data.logo;

  if (typeof logo !== "object" || logo === null || !logo.src) {
    logo = await getCompanyAvatar(params.data);
  } else if (logo.rawFile instanceof File) {
    const base64Logo = await convertFileToBase64(logo);
    logo = { src: base64Logo, title: logo.title };
  }

  return {
    ...params,
    data: {
      ...params.data,
      logo,
    },
  };
};

async function processContactAvatar(
  params: UpdateParams<Contact>,
): Promise<UpdateParams<Contact>>;

async function processContactAvatar(
  params: CreateParams<Contact>,
): Promise<CreateParams<Contact>>;

async function processContactAvatar(
  params: CreateParams<Contact> | UpdateParams<Contact>,
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
  const { data } = params;
  if (data.avatar?.src || !data.email_jsonb || !data.email_jsonb.length) {
    return params;
  }
  const avatarUrl = await getContactAvatar(data);

  // Clone the data and modify the clone
  const newData = { ...data, avatar: { src: avatarUrl || undefined } };

  return { ...params, data: newData };
}

async function fetchAndUpdateCompanyData(
  params: UpdateParams<Contact>,
  dataProvider: DataProvider,
): Promise<UpdateParams<Contact>>;

async function fetchAndUpdateCompanyData(
  params: CreateParams<Contact>,
  dataProvider: DataProvider,
): Promise<CreateParams<Contact>>;

async function fetchAndUpdateCompanyData(
  params: CreateParams<Contact> | UpdateParams<Contact>,
  dataProvider: DataProvider,
): Promise<CreateParams<Contact> | UpdateParams<Contact>> {
  const { data } = params;
  const newData = { ...data };

  if (!newData.company_id) {
    return params;
  }

  const { data: company } = await dataProvider.getOne("companies", {
    id: newData.company_id,
  });

  if (!company) {
    return params;
  }

  newData.company_name = company.name;
  newData.company_is_placeholder = company.is_placeholder ?? false;
  newData.company_is_client = company.is_client ?? false;
  newData.company_is_referral = company.is_referral ?? false;
  return { ...params, data: newData };
}

/**
 * The database protects the "Por definir" company with triggers; the fake
 * backend mirrors those rules so that the demo behaves the same way.
 */
const assertValidCompanyChange = (
  data: Partial<Company>,
  previous: Partial<Company> | undefined,
  placeholderIds: Identifier[],
) => {
  if (
    previous &&
    data.is_placeholder !== undefined &&
    data.is_placeholder !== (previous.is_placeholder ?? false)
  ) {
    throw new Error("The placeholder flag of a company cannot be changed");
  }
  const isPlaceholder = previous?.is_placeholder ?? data.is_placeholder;
  if (!isPlaceholder) {
    if (
      data.referred_by_company_id != null &&
      placeholderIds.includes(data.referred_by_company_id)
    ) {
      throw new Error("A company cannot be referred by the system company");
    }
    return;
  }
  if (previous && data.name !== undefined && data.name !== previous.name) {
    throw new Error("The system company cannot be renamed");
  }
  if (data.is_client || data.is_referral || data.referred_by_company_id) {
    throw new Error("The system company cannot have categories");
  }
};

export interface CreateFakeRestDataProviderOptions {
  db?: Db;
  latency?: number;
  authProvider?: Pick<typeof defaultAuthProvider, "getIdentity">;
  silent?: boolean;
}

const processConfigLogo = async (logo: any): Promise<string> => {
  if (typeof logo === "string") return logo;
  if (logo?.rawFile instanceof File) {
    return (await convertFileToBase64(logo)) as string;
  }
  return logo?.src ?? "";
};

const preserveAttachmentMimeType = <
  NoteType extends { attachments?: Array<{ rawFile?: File; type?: string }> },
>(
  note: NoteType,
): NoteType => ({
  ...note,
  attachments: (note.attachments ?? []).map((attachment) => ({
    ...attachment,
    type: attachment.type ?? attachment.rawFile?.type,
  })),
});

export const createDataProvider = ({
  db = generateData(),
  latency = 300,
  authProvider,
  silent = false,
}: CreateFakeRestDataProviderOptions = {}): CrmDataProvider => {
  const baseDataProvider = fakeRestDataProvider(db, !silent, latency);
  let taskUpdateType = TASK_DONE_NOT_CHANGED;
  const getIdentity = async () =>
    authProvider?.getIdentity?.() ?? defaultAuthProvider.getIdentity?.();

  const updateCompany = async (
    companyId: Identifier,
    updateFn: (company: Company) => Partial<Company>,
  ) => {
    const { data: company } = await dataProvider.getOne<Company>("companies", {
      id: companyId,
    });

    return await dataProvider.update("companies", {
      id: companyId,
      data: {
        ...updateFn(company),
      },
      previousData: company,
    });
  };

  const listAll = async <RecordType extends { id: Identifier }>(
    resource: string,
    filter: Record<string, unknown>,
  ) =>
    (
      await baseDataProvider.getList<RecordType>(resource, {
        filter,
        pagination: { page: 1, perPage: 10_000 },
        sort: { field: "id", order: "ASC" },
      })
    ).data;

  const getPlaceholderIds = async () =>
    (await listAll<Company>("companies", { is_placeholder: true })).map(
      (company) => company.id,
    );

  /**
   * companies_summary computes nb_contacts and nb_referred_clients; the fake
   * backend stores them, so they are recomputed whenever they may change.
   */
  const syncCompanyCounts = async (companyIds: Array<Identifier | null>) => {
    const ids = [...new Set(companyIds)].filter(
      (id): id is Identifier => id != null,
    );
    await Promise.all(
      ids.map(async (id) => {
        const [companies, contacts, referredClients] = await Promise.all([
          listAll<Company>("companies", { id }),
          listAll<Contact>("contacts", { company_id: id }),
          listAll<Company>("companies", { referred_by_company_id: id }),
        ]);
        if (!companies[0]) return;
        await baseDataProvider.update<Company>("companies", {
          id,
          data: {
            nb_contacts: contacts.length,
            nb_referred_clients: referredClients.length,
          },
          previousData: companies[0],
        });
      }),
    );
  };

  const getReferredByName = async (referredById?: Identifier | null) => {
    if (referredById == null) return null;
    const [referrer] = await listAll<Company>("companies", {
      id: referredById,
    });
    return referrer?.name ?? null;
  };

  // The company of each contact before its update, to recount both companies
  const previousCompanyIds = new Map<Identifier, Identifier | null>();
  // The referral company of each company before its update
  const previousReferrerIds = new Map<Identifier, Identifier | null>();

  const dataProviderWithCustomMethod: CrmDataProvider = {
    ...baseDataProvider,
    async getList(resource: string, params: any) {
      if (resource === "activity_log") {
        const { filter = {}, pagination } = params;
        const all = await getActivityLog(
          withSupabaseFilterAdapter(baseDataProvider),
          filter.company_id,
          filter.sales_id,
        );
        const { page, perPage } = pagination;
        const start = (page - 1) * perPage;
        return { data: all.slice(start, start + perPage), total: all.length };
      }
      return baseDataProvider.getList(resource, params);
    },
    unarchiveDeal: async (deal: Deal) => {
      // get all deals where stage is the same as the deal to unarchive
      const { data: deals } = await baseDataProvider.getList<Deal>("deals", {
        filter: { stage: deal.stage },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "index", order: "ASC" },
      });

      // set index for each deal starting from 1, if the deal to unarchive is found, set its index to the last one
      const updatedDeals = deals.map((d, index) => ({
        ...d,
        index: d.id === deal.id ? 0 : index + 1,
        archived_at: d.id === deal.id ? null : d.archived_at,
      }));

      return await Promise.all(
        updatedDeals.map((updatedDeal) =>
          dataProvider.update("deals", {
            id: updatedDeal.id,
            data: updatedDeal,
            previousData: deals.find((d) => d.id === updatedDeal.id),
          }),
        ),
      );
    },
    signUp: async ({
      email,
      password,
      first_name,
      last_name,
    }: SignUpData): Promise<{
      id: string;
      email: string;
      password: string;
    }> => {
      const user = await baseDataProvider.create("sales", {
        data: {
          email,
          first_name,
          last_name,
        },
      });

      return {
        ...user.data,
        password,
      };
    },
    salesCreate: async ({ ...data }: SalesFormData): Promise<Sale> => {
      const response = await dataProvider.create("sales", {
        data: {
          ...data,
          password: "new_password",
        },
      });

      return response.data;
    },
    salesUpdate: async (
      id: Identifier,
      data: Partial<Omit<SalesFormData, "password">>,
    ): Promise<Sale> => {
      const { data: previousData } = await dataProvider.getOne<Sale>("sales", {
        id,
      });

      if (!previousData) {
        throw new Error("User not found");
      }

      const { data: sale } = await dataProvider.update<Sale>("sales", {
        id,
        data,
        previousData,
      });
      return { ...sale, user_id: sale.id.toString() };
    },
    isInitialized: async (): Promise<boolean> => {
      const sales = await dataProvider.getList<Sale>("sales", {
        filter: {},
        pagination: { page: 1, perPage: 1 },
        sort: { field: "id", order: "ASC" },
      });
      if (sales.data.length === 0) {
        return false;
      }
      return true;
    },
    updatePassword: async (id: Identifier): Promise<true> => {
      const currentUser = await getIdentity();
      if (!currentUser) {
        throw new Error("User not found");
      }
      const { data: previousData } = await dataProvider.getOne<Sale>("sales", {
        id: currentUser.id,
      });

      if (!previousData) {
        throw new Error("User not found");
      }

      await dataProvider.update("sales", {
        id,
        data: {
          password: "demo_newPassword",
        },
        previousData,
      });

      return true;
    },
    mergeContacts: async (sourceId: Identifier, targetId: Identifier) => {
      return mergeContacts(sourceId, targetId, baseDataProvider);
    },
    deleteCompany: async (
      companyId: Identifier,
      contactsMode: DeleteCompanyContactsMode,
    ): Promise<number> => {
      const [company] = await listAll<Company>("companies", { id: companyId });
      if (!company) {
        throw new Error(`Company ${companyId} not found`);
      }
      if (company.is_placeholder) {
        throw new Error("The system company cannot be deleted");
      }
      const contacts = await listAll<Contact>("contacts", {
        company_id: companyId,
      });

      if (contactsMode === "move") {
        const [placeholderId] = await getPlaceholderIds();
        if (placeholderId == null) {
          throw new Error('The system company "Por definir" is missing');
        }
        for (const contact of contacts) {
          await dataProvider.update<Contact>("contacts", {
            id: contact.id,
            data: { company_id: placeholderId },
            previousData: contact,
          });
        }
      } else {
        for (const contact of contacts) {
          await dataProvider.delete<Contact>("contacts", {
            id: contact.id,
            previousData: contact,
          });
        }
      }

      // Like the database: the deals go with the company, and the clients it
      // referred are no longer referred by anyone
      const [deals, referredClients] = await Promise.all([
        listAll<Deal>("deals", { company_id: companyId }),
        listAll<Company>("companies", { referred_by_company_id: companyId }),
      ]);
      await Promise.all([
        ...deals.map((deal) =>
          baseDataProvider.delete("deals", { id: deal.id, previousData: deal }),
        ),
        ...referredClients.map((client) =>
          baseDataProvider.update("companies", {
            id: client.id,
            data: { referred_by_company_id: null, referred_by_name: null },
            previousData: client,
          }),
        ),
      ]);
      await baseDataProvider.delete("companies", {
        id: companyId,
        previousData: company,
      });
      await syncCompanyCounts([company.referred_by_company_id ?? null]);

      return contacts.length;
    },
    getConfiguration: async (): Promise<ConfigurationContextValue> => {
      const { data } = await baseDataProvider.getOne("configuration", {
        id: 1,
      });
      return (data?.config as ConfigurationContextValue) ?? {};
    },
    updateConfiguration: async (
      config: ConfigurationContextValue,
    ): Promise<ConfigurationContextValue> => {
      const { data: prev } = await baseDataProvider.getOne("configuration", {
        id: 1,
      });
      await baseDataProvider.update("configuration", {
        id: 1,
        data: { config },
        previousData: prev,
      });
      return config;
    },
  };

  const dataProvider = withLifecycleCallbacks(
    withSupabaseFilterAdapter(dataProviderWithCustomMethod),
    [
      {
        resource: "configuration",
        beforeUpdate: async (params) => {
          const config = params.data.config;
          if (config) {
            config.lightModeLogo = await processConfigLogo(
              config.lightModeLogo,
            );
            config.darkModeLogo = await processConfigLogo(config.darkModeLogo);
          }
          return params;
        },
      },
      {
        resource: "sales",
        beforeCreate: async (params) => {
          const { data } = params;
          // If administrator role is not set, we simply set it to false
          if (data.administrator == null) {
            data.administrator = false;
          }
          return params;
        },
        afterSave: async (data) => {
          // Since the current user is stored in localStorage in fakerest authProvider
          // we need to update it to keep information up to date in the UI
          const currentUser = await getIdentity();
          if (currentUser?.id === data.id) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
          }
          return data;
        },
        beforeDelete: async (params) => {
          if (params.meta?.identity?.id == null) {
            throw new Error("Identity MUST be set in meta");
          }

          const newSaleId = params.meta.identity.id as Identifier;

          const [companies, contacts, contactNotes, deals] = await Promise.all([
            dataProvider.getList("companies", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
            dataProvider.getList("contacts", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
            dataProvider.getList("contact_notes", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
            dataProvider.getList("deals", {
              filter: { sales_id: params.id },
              pagination: {
                page: 1,
                perPage: 10_000,
              },
              sort: { field: "id", order: "ASC" },
            }),
          ]);

          await Promise.all([
            dataProvider.updateMany("companies", {
              ids: companies.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
            dataProvider.updateMany("contacts", {
              ids: contacts.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
            dataProvider.updateMany("contact_notes", {
              ids: contactNotes.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
            dataProvider.updateMany("deals", {
              ids: deals.data.map((company) => company.id),
              data: {
                sales_id: newSaleId,
              },
            }),
          ]);

          return params;
        },
      } satisfies ResourceCallbacks<Sale>,
      {
        resource: "contacts",
        beforeCreate: async (createParams, dataProvider) => {
          const params = {
            ...createParams,
            data: {
              ...createParams.data,
              first_seen:
                createParams.data.first_seen ?? new Date().toISOString(),
              last_seen:
                createParams.data.last_seen ?? new Date().toISOString(),
            },
          };
          const newParams = await processContactAvatar(params);
          return fetchAndUpdateCompanyData(newParams, dataProvider);
        },
        afterCreate: async (result) => {
          if (result.data.company_id != null) {
            await updateCompany(result.data.company_id, (company) => ({
              nb_contacts: (company.nb_contacts ?? 0) + 1,
            }));
          }

          return result;
        },
        beforeUpdate: async (params) => {
          if (params.data.company_id !== undefined) {
            const [stored] = await listAll<Contact>("contacts", {
              id: params.id,
            });
            previousCompanyIds.set(params.id, stored?.company_id ?? null);
          }
          const newParams = await processContactAvatar(params);
          return fetchAndUpdateCompanyData(newParams, dataProvider);
        },
        afterUpdate: async (result) => {
          if (previousCompanyIds.has(result.data.id)) {
            const previousCompanyId = previousCompanyIds.get(result.data.id);
            previousCompanyIds.delete(result.data.id);
            if (previousCompanyId !== result.data.company_id) {
              await syncCompanyCounts([
                previousCompanyId ?? null,
                result.data.company_id ?? null,
              ]);
            }
          }
          return result;
        },
        afterDelete: async (result) => {
          if (result.data.company_id != null) {
            await updateCompany(result.data.company_id, (company) => ({
              nb_contacts: (company.nb_contacts ?? 1) - 1,
            }));
          }

          return result;
        },
      } satisfies ResourceCallbacks<Contact>,
      {
        resource: "tasks",
        afterCreate: async (result, dataProvider) => {
          // update the task count in the related contact
          const { contact_id } = result.data;
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          await dataProvider.update("contacts", {
            id: contact_id,
            data: {
              nb_tasks: (contact.nb_tasks ?? 0) + 1,
            },
            previousData: contact,
          });
          return result;
        },
        beforeUpdate: async (params) => {
          const { data, previousData } = params;
          if (previousData.done_date !== data.done_date) {
            taskUpdateType = data.done_date
              ? TASK_MARKED_AS_DONE
              : TASK_MARKED_AS_UNDONE;
          } else {
            taskUpdateType = TASK_DONE_NOT_CHANGED;
          }
          return params;
        },
        afterUpdate: async (result, dataProvider) => {
          // update the contact: if the task is done, decrement the nb tasks, otherwise increment it
          const { contact_id } = result.data;
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          if (taskUpdateType !== TASK_DONE_NOT_CHANGED) {
            await dataProvider.update("contacts", {
              id: contact_id,
              data: {
                nb_tasks:
                  taskUpdateType === TASK_MARKED_AS_DONE
                    ? (contact.nb_tasks ?? 0) - 1
                    : (contact.nb_tasks ?? 0) + 1,
              },
              previousData: contact,
            });
          }
          return result;
        },
        afterDelete: async (result, dataProvider) => {
          // update the task count in the related contact
          const { contact_id } = result.data;
          const { data: contact } = await dataProvider.getOne("contacts", {
            id: contact_id,
          });
          await dataProvider.update("contacts", {
            id: contact_id,
            data: {
              nb_tasks: (contact.nb_tasks ?? 0) - 1,
            },
            previousData: contact,
          });
          return result;
        },
      } satisfies ResourceCallbacks<Task>,
      {
        resource: "companies",
        beforeCreate: async (params) => {
          const createParams = await processCompanyLogo(params);
          // The database defaults
          const data = {
            is_client: true,
            is_referral: false,
            is_placeholder: false,
            referred_by_company_id: null,
            nb_contacts: 0,
            nb_deals: 0,
            nb_referred_clients: 0,
            ...createParams.data,
          };
          assertValidCompanyChange(data, undefined, await getPlaceholderIds());

          return {
            ...createParams,
            data: {
              ...data,
              referred_by_name: await getReferredByName(
                data.referred_by_company_id,
              ),
              created_at: new Date().toISOString(),
            },
          };
        },
        afterCreate: async (result) => {
          await syncCompanyCounts([result.data.referred_by_company_id ?? null]);
          return result;
        },
        beforeUpdate: async (params) => {
          const [stored] = await listAll<Company>("companies", {
            id: params.id,
          });
          assertValidCompanyChange(
            params.data,
            stored,
            await getPlaceholderIds(),
          );
          const updateParams = await processCompanyLogo(params);
          if (updateParams.data.referred_by_company_id === undefined) {
            return updateParams;
          }
          previousReferrerIds.set(
            params.id,
            stored?.referred_by_company_id ?? null,
          );
          return {
            ...updateParams,
            data: {
              ...updateParams.data,
              referred_by_name: await getReferredByName(
                updateParams.data.referred_by_company_id,
              ),
            },
          };
        },
        afterUpdate: async (result, dataProvider) => {
          // get all contacts of the company and for each contact, update the
          // company fields that contacts_summary joins
          const { id, name, is_placeholder, is_client, is_referral } =
            result.data;
          const { data: contacts } = await dataProvider.getList("contacts", {
            filter: { company_id: id },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: "id", order: "ASC" },
          });

          const contactIds = contacts.map((contact) => contact.id);
          await dataProvider.updateMany("contacts", {
            ids: contactIds,
            data: {
              company_name: name,
              company_is_placeholder: is_placeholder ?? false,
              company_is_client: is_client ?? false,
              company_is_referral: is_referral ?? false,
            },
          });

          // the referred clients show the name of their referral company
          const referredClients = await listAll<Company>("companies", {
            referred_by_company_id: id,
          });
          await Promise.all(
            referredClients
              .filter((client) => client.referred_by_name !== name)
              .map((client) =>
                baseDataProvider.update("companies", {
                  id: client.id,
                  data: { referred_by_name: name },
                  previousData: client,
                }),
              ),
          );

          if (previousReferrerIds.has(id)) {
            const previousReferrerId = previousReferrerIds.get(id);
            previousReferrerIds.delete(id);
            await syncCompanyCounts([
              previousReferrerId ?? null,
              result.data.referred_by_company_id ?? null,
            ]);
          }
          return result;
        },
        beforeDelete: async (params) => {
          const [company] = await listAll<Company>("companies", {
            id: params.id,
          });
          if (company?.is_placeholder) {
            throw new Error("The system company cannot be deleted");
          }
          const contacts = await listAll<Contact>("contacts", {
            company_id: params.id,
          });
          if (contacts.length > 0) {
            // contacts_company_id_fkey is "on delete restrict"
            throw new Error(
              "This company still has contacts: use deleteCompany instead",
            );
          }
          return params;
        },
      } satisfies ResourceCallbacks<Company>,
      {
        resource: "deals",
        beforeSave: async (data) => {
          if (
            data.company_id != null &&
            (await getPlaceholderIds()).includes(data.company_id)
          ) {
            throw new Error("Deals cannot be linked to the system company");
          }
          return data;
        },
        beforeCreate: async (params) => {
          return {
            ...params,
            data: {
              ...params.data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
        },
        afterCreate: async (result) => {
          await updateCompany(result.data.company_id, (company) => ({
            nb_deals: (company.nb_deals ?? 0) + 1,
          }));

          return result;
        },
        beforeUpdate: async (params) => {
          return {
            ...params,
            data: {
              ...params.data,
              updated_at: new Date().toISOString(),
            },
          };
        },
        afterDelete: async (result) => {
          await updateCompany(result.data.company_id, (company) => ({
            nb_deals: (company.nb_deals ?? 1) - 1,
          }));

          return result;
        },
      } satisfies ResourceCallbacks<Deal>,
      {
        resource: "contact_notes",
        beforeSave: async (params) => preserveAttachmentMimeType(params),
      } satisfies ResourceCallbacks<ContactNote>,
      {
        resource: "deal_notes",
        beforeSave: async (params) => preserveAttachmentMimeType(params),
      } satisfies ResourceCallbacks<DealNote>,
    ],
  ) as CrmDataProvider;

  return dataProvider;
};

export const dataProvider = createDataProvider();

/**
 * Convert a `File` object returned by the upload input into a base 64 string.
 * That's not the most optimized way to store images in production, but it's
 * enough to illustrate the idea of dataprovider decoration.
 */
const convertFileToBase64 = (file: { rawFile: Blob }): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    // We know result is a string as we used readAsDataURL
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file.rawFile);
  });
