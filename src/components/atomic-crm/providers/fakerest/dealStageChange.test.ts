import type { Deal, DealTagAssignment } from "../../types";
import { buildCompany, buildDeal, createCrmDb } from "@/test/StoryWrapper";
import { createDataProvider } from "./dataProvider";

const lostDeal = buildDeal({
  id: 1,
  stage: "lost",
  lost_reason: "said-no",
  lost_reason_detail: "Chose a rival",
  lost_at: "2026-10-01T10:00:00.000Z",
});

const setup = () =>
  createDataProvider({
    db: createCrmDb({
      companies: [buildCompany({ id: 1 })],
      deals: [buildDeal({ id: 2, name: "Intranet", stage: "lead" }), lostDeal],
      deal_tag_assignments: [
        {
          id: 1,
          deal_id: 2,
          stage: "lead",
          tag_value: "first-meeting-scheduled",
          description: "Tuesday 10am",
          created_at: "2026-10-01T10:00:00.000Z",
        },
      ],
    }),
    latency: 0,
    silent: true,
  });

const getTags = async (dataProvider: ReturnType<typeof setup>) =>
  (
    await dataProvider.getList<DealTagAssignment>("deal_tag_assignments", {
      filter: {},
      pagination: { page: 1, perPage: 100 },
      sort: { field: "id", order: "ASC" },
    })
  ).data;

describe("FakeRest deal stage change", () => {
  it("removes the tags of the previous stage and keeps them as history", async () => {
    // Arrange
    const dataProvider = setup();
    const { data: deal } = await dataProvider.getOne<Deal>("deals", { id: 2 });

    // Act
    await dataProvider.update("deals", {
      id: 2,
      data: { stage: "discovery" },
      previousData: deal,
    });

    // Assert
    const [tag] = await getTags(dataProvider);
    expect(tag.removed_reason).toBe("stage_change");
    expect(tag.removed_at).toBeTruthy();
    expect(tag.description).toBe("Tuesday 10am");
  });

  it("keeps the tags when the deal only moves inside its column", async () => {
    // Arrange
    const dataProvider = setup();
    const { data: deal } = await dataProvider.getOne<Deal>("deals", { id: 2 });

    // Act
    await dataProvider.update("deals", {
      id: 2,
      data: { index: 3 },
      previousData: deal,
    });

    // Assert
    const [tag] = await getTags(dataProvider);
    expect(tag.removed_at).toBeFalsy();
  });

  it("clears the loss details when a lost deal is reopened", async () => {
    // Arrange
    const dataProvider = setup();

    // Act
    const { data: reopened } = await dataProvider.update<Deal>("deals", {
      id: 1,
      data: { stage: "discovery" },
      previousData: lostDeal,
    });

    // Assert
    expect(reopened).toMatchObject({
      stage: "discovery",
      lost_reason: null,
      lost_reason_detail: null,
      lost_at: null,
    });
  });

  it("dates a postponement when a deal is postponed", async () => {
    // Arrange
    const dataProvider = setup();
    const { data: deal } = await dataProvider.getOne<Deal>("deals", { id: 2 });

    // Act
    const { data: postponed } = await dataProvider.update<Deal>("deals", {
      id: 2,
      data: {
        stage: "postponed",
        postponed_until: "2027-01-28",
        postponed_reason: "New board",
      },
      previousData: deal,
    });

    // Assert
    expect(postponed.postponed_until).toBe("2027-01-28");
    expect(postponed.postponed_at).toBeTruthy();
  });
});
