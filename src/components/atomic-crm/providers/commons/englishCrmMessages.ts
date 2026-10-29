export const englishCrmMessages = {
  resources: {
    companies: {
      name: "Company |||| Companies",
      forcedCaseName: "Company",
      categories: {
        client: "Client",
        referral: "Referral",
      },
      no_contact_defined: "No contact defined",
      referred_clients: "Referred clients",
      no_referred_clients: "It has not referred any client company yet.",
      placeholder: {
        name: "To be defined",
        filter: "Company to be defined",
        notice:
          "System company for contacts with no assigned company. Assign each contact to its real company.",
      },
      filters: {
        category: "Category",
        referred_by: "Referred by",
        contacts: "Contacts",
      },
      validation: {
        category_required: "Select at least one category",
      },
      delete_dialog: {
        title:
          "What do we do with its %{smart_count} contact? |||| What do we do with its %{smart_count} contacts?",
        description:
          "You are about to delete the company “%{name}” and its deals.",
        move: "Move them to «Por definir»",
        delete: "Delete them too",
        confirm_title: "Delete the company “%{name}”?",
        confirm_description:
          "Its deals will be deleted too. This action cannot be undone.",
        success: "Company deleted",
        error: "Could not delete the company",
      },
      fields: {
        name: "Company name",
        website: "Website",
        linkedin_url: "LinkedIn URL",
        phone_number: "Phone number",
        created_at: "Created at",
        nb_contacts: "Number of contacts",
        revenue: "Revenue",
        sector: "Sector",
        size: "Size",
        tax_identifier: "Tax Identifier",
        address: "Address",
        city: "City",
        zipcode: "Zip code",
        state_abbr: "State",
        country: "Country",
        description: "Description",
        context_links: "Context links",
        sales_id: "Account manager",
        continent: "Continent",
        network: "Network / association",
        headcount: "Headcount (employees)",
        headcount_source: "Headcount source",
        current_competitor: "Current competitor",
        is_client: "Client company",
        is_referral: "Referral company",
        referred_by_company_id: "Referred by",
      },
      empty: {
        description: "It seems your company list is empty.",
        title: "No companies found",
      },
      import: {
        title: "Import companies",
      },
      field_categories: {
        contact: "Contact",
        additional_info: "Additional information",
        address: "Address",
        context: "Context",
        prospecting: "Humand prospecting",
        categories: "Categories",
      },
      action: {
        create: "Create Company",
        edit: "Edit company",
        new: "New Company",
        show: "Show company",
      },
      added_on: "Added on %{date}",
      followed_by: "Followed by %{name}",
      followed_by_you: "Followed by you",
      no_contacts: "No contact",
      nb_contacts: "%{smart_count} contact |||| %{smart_count} contacts",
      nb_deals: "%{smart_count} deal |||| %{smart_count} deals",
      sizes: {
        one_employee: "1 employee",
        two_to_nine_employees: "2-9 employees",
        ten_to_forty_nine_employees: "10-49 employees",
        fifty_to_two_hundred_forty_nine_employees: "50-249 employees",
        two_hundred_fifty_or_more_employees: "250 or more employees",
      },
      continents: {
        america: "Americas",
        europe: "Europe",
        asia: "Asia",
        africa: "Africa",
        oceania: "Oceania",
      },
      competitors: {
        whatsapp_excel: "WhatsApp + bulletin board + Excel",
        none: "None",
        other: "Other",
      },
      autocomplete: {
        create_error: "An error occurred while creating the company",
        create_item: "Create %{item}",
        create_label: "Start typing to create a new company",
      },
    },
    contacts: {
      name: "Contact |||| Contacts",
      forcedCaseName: "Contact",
      placeholder_badge: "Company to be defined",
      assign_company: {
        action: "Assign company",
        description:
          "Choose the real company of the contact. |||| Choose the real company of the %{smart_count} selected contacts.",
        success:
          "Company assigned |||| Company assigned to %{smart_count} contacts",
        error: "Could not assign the company",
      },
      validation: {
        company_required:
          "Choose the contact's company. If you don't know it yet, choose «Por definir»",
      },
      field_categories: {
        background_info: "Background info",
        identity: "Identity",
        misc: "Misc",
        personal_info: "Personal info",
        position: "Position",
      },
      fields: {
        first_name: "First name",
        last_name: "Last name",
        last_seen: "Last seen",
        title: "Title",
        company_id: "Company",
        email_jsonb: "Email addresses",
        email: "Email",
        phone_jsonb: "Phone numbers",
        phone_number: "Phone number",
        linkedin_url: "LinkedIn URL",
        background: "Background info (bio, how you met, etc)",
        has_newsletter: "Has newsletter",
        sales_id: "Account manager",
        buyer_role: "Buying role",
      },
      action: {
        add: "Add contact",
        add_first: "Add your first contact",
        create: "Create contact",
        edit: "Edit contact",
        export_vcard: "Export to vCard",
        new: "New Contact",
        show: "Show contact",
      },
      background: {
        last_activity_on: "Last activity on %{date}",
        added_on: "Added on %{date}",
        followed_by: "Followed by %{name}",
        followed_by_you: "Followed by you",
        status_none: "None",
      },
      position_at: "%{title} at",
      position_at_company: "%{title} at %{company}",
      empty: {
        description: "It seems your contact list is empty.",
        title: "No contacts found",
      },
      import: {
        title: "Import contacts",
      },
      inputs: {
        genders: {
          male: "He/Him",
          female: "She/Her",
          nonbinary: "They/Them",
        },
        personal_info_types: {
          work: "Work",
          home: "Home",
          other: "Other",
        },
        buyer_roles: {
          partner: "Partner",
          hr: "HR / People",
          internal_comms: "Internal communications",
          it: "IT",
          management: "Management",
          other: "Other",
        },
      },
      list: {
        error_loading: "Error loading contacts",
      },
      bulk_tag: {
        action: "Tag",
        back: "Back to tags",
        create_description:
          "Create a new tag and apply it to the selected contacts.",
        description:
          "Choose an existing tag or create a new one for the selected contacts.",
        empty: "No tags yet. Create one to tag the selected contacts.",
        error: "Failed to add tag to contacts",
        noop: "Selected contacts already have this tag",
        success:
          "Tag added to %{smart_count} contact |||| Tag added to %{smart_count} contacts",
        title: "Add tag to contacts",
      },
      merge: {
        action: "Merge with another contact",
        confirm: "Merge Contacts",
        current_contact: "Current Contact (will be deleted)",
        description: "Merge this contact with another one.",
        error: "Failed to merge contacts",
        merging: "Merging...",
        no_additional_data: "No additional data to merge",
        select_target: "Please select a contact to merge with",
        success: "Contacts merged successfully",
        target_contact: "Target Contact (will be kept)",
        title: "Merge Contact",
        warning_description:
          "All data will be transferred to the second contact. This action cannot be undone.",
        warning_title: "Warning: Destructive Operation",
        what_will_be_merged: "What will be merged:",
      },
      filters: {
        company: "Company",
        company_placeholder: "Company to be defined",
        before_last_month: "Before last month",
        before_this_month: "Before this month",
        before_this_week: "Before this week",
        managed_by_me: "Managed by me",
        search: "Search name, company...",
        this_week: "This week",
        today: "Today",
        tags: "Tags",
        tasks: "Tasks",
      },
      hot: {
        empty_change_status:
          'Change the status of a contact by adding a note to that contact and clicking on "show options".',
        empty_hint: 'Contacts with a "hot" status will appear here.',
        title: "Hot Contacts",
      },
    },
    deals: {
      name: "Deal |||| Deals",
      fields: {
        name: "Name",
        description: "Description",
        company_id: "Company",
        contact_ids: "Contacts",
        category: "Category",
        amount: "Budget",
        expected_closing_date: "Expected closing date",
        stage: "Stage",
        lost_reason: "Lost reason",
        lost_reason_detail: "Details",
        postponed_until: "Resume on",
        postponed_reason: "Why it is postponed",
      },
      action: {
        back_to_deal: "Back to deal",
        create: "Create deal",
        new: "New Deal",
      },
      field_categories: {
        misc: "Misc",
      },
      filters: {
        only_mine: "Only deals I manage",
      },
      archived: {
        action: "Archive",
        error: "Error: deal not archived",
        list_title: "Archived Deals",
        success: "Deal archived",
        title: "Archived Deal",
        view: "View archived deals",
      },
      inputs: {
        linked_to: "Linked to",
      },
      unarchived: {
        action: "Send back to the board",
        error: "Error: deal not unarchived",
        success: "Deal unarchived",
      },
      updated: "Deal updated",
      empty: {
        before_create: "before creating a deal.",
        description: "It seems your deal list is empty.",
        title: "No deals found",
      },
      import: {
        title: "Import deals",
      },
      invalid_date: "Invalid date",
      outcome: {
        lost_title: 'Mark "%{name}" as lost',
        lost_help:
          "Humand counts a deal as lost when the company explicitly says no, or after 5 to 7 follow-ups without an answer over at least 3 months.",
        postponed_title: 'Postpone "%{name}"',
        postponed_help:
          "Choose when to get back to this company. The deal shows up on the dashboard a week before that date.",
        choose_reason: "Choose a reason",
        confirm: "Confirm",
        lost_reason_required: "Choose why the deal is lost.",
        postponed_until_future: "The date to resume must be after today.",
        postponed_reason_required: "Write why the deal is postponed.",
        resume_on: "Resume on %{date}",
        move_error: "The deal could not be moved. Please try again.",
        lost_reasons: {
          said_no: "Said no",
          no_response: "No response",
          wrong_contact: "Wrong contact",
          contact_left: "The contact left the company",
          pilot_churn: "Churned during the pilot",
          unspecified: "No reason recorded",
        },
      },
      tags: {
        title: "Tags",
        add: "Tag",
        description: "Description",
        description_placeholder: "Add a short note (optional)",
        remove: "Remove tag",
        added_by: "Added by %{name} on %{date}",
        edited_by: "Edited by %{name} on %{date}",
        history: "Previous tags (%{smart_count})",
        removed_stage_change:
          "Added on %{added}, removed on %{removed} when the deal changed stage",
        removed_manual: "Added on %{added}, removed by hand on %{removed}",
        error: "The tag could not be saved. Please try again.",
      },
      board: {
        show_closed: "Show postponed and lost",
        hide_closed: "Hide postponed and lost",
        stage_info: "About this stage",
        humand_stage: "Humand stage: %{stage}",
      },
    },
    contracts: {
      name: "Contract |||| Contracts",
      fields: {
        company_id: "Client company",
        deal_id: "Won deal",
        referral_company_id: "Referral company",
        first_payment_month: "First payment",
        end_month: "Last month billed",
        fee_history: "Monthly fee (USD)",
        commission_rules: "My commission",
        subcommission_rules: "Sub-commission to the referral company",
        notes: "Notes",
        current_fee: "Current fee",
        current_commission: "Current commission",
        status: "Status",
      },
      rule_fields: {
        fee_from_month: "From month",
        amount: "Monthly fee (USD)",
        from_month: "From contract month",
        to_month: "To contract month (empty: no end)",
        percent: "% of the fee",
        kind: "Type",
        value: "Value",
      },
      help: {
        first_payment_month:
          "Month the client first paid Humand: contract month 1.",
        end_month: "Only if the contract ended.",
        fee_history:
          "Add a line each time the fee changes (for example, when the number of users changes). Each fee applies from its month on.",
        commission_rules:
          "% of the fee Humand pays you, by contract month. By default: 50% during months 1 to 12, then 30%.",
        subcommission_rules:
          "What you owe the referral company: a % of your commission or a fixed USD amount per month, for a range of contract months (leave the end empty if it has none). Several lines add up.",
      },
      subcommission_kinds: {
        percent: "% of my commission",
        fixed: "Fixed amount (USD)",
      },
      statuses: {
        active: "Active",
        ended: "Ended",
        awaiting_payment: "Awaiting first payment",
      },
      action: {
        new: "New contract",
        edit: "Edit contract",
        open: "Open contract",
        create_from_deal: "Create contract",
      },
      validation: {
        end_before_start:
          "The last month billed must come after the first payment.",
        fee_required: "Add the monthly fee.",
        fee_incomplete: "Every fee needs a month and an amount.",
        fee_duplicate_month: "Two fees start the same month.",
        commission_incomplete:
          "Every commission line needs a first month (1 or more), a last month after it or empty, and a % between 0 and 100.",
        commission_overlap: "Two commission lines cover the same months.",
        subcommission_incomplete:
          "Every sub-commission line needs a type, a value (at most 100 for a %), a first month (1 or more) and a last month after it or empty.",
      },
    },
    notes: {
      name: "Note |||| Notes",
      forcedCaseName: "Note",
      fields: {
        status: "Status",
        date: "Date",
        attachments: "Attachments",
        contact_id: "Contact",
        deal_id: "Deal",
      },
      action: {
        add: "Add note",
        add_first: "Add your first note",
        delete: "Delete note",
        edit: "Edit note",
        update: "Update note",
        add_this: "Add this note",
      },
      sheet: {
        create: "Create note",
        create_for: "Create note for %{name}",
        edit: "Edit note",
        edit_for: "Edit note for %{name}",
      },
      deleted: "Note deleted",
      empty: "No notes yet",
      author_added: "%{name} added a note",
      you_added: "You added a note",
      me: "Me",
      list: {
        error_loading: "Error loading notes",
      },
      note_for_contact: "Note for %{name}",
      stepper: {
        hint: "Go to a contact page and add a note",
      },
      added: "Note added",
      inputs: {
        add_note: "Add a note",
        options_hint: "(attach files, or change details)",
        show_options: "Show options",
      },
      actions: {
        attach_document: "Attach document",
      },
      validation: {
        note_or_attachment_required: "A note or an attachment is required",
      },
    },
    sales: {
      name: "User |||| Users",
      fields: {
        first_name: "First name",
        last_name: "Last name",
        email: "Email",
        secondary_email: "Secondary email",
        secondary_emails: "Secondary emails",
        administrator: "Admin",
        disabled: "Disabled",
      },
      create: {
        error: "An error occurred while creating the user.",
        success:
          "User created. They will soon receive an email to set their password.",
        title: "Create a new user",
      },
      edit: {
        error: "An error occurred. Please try again.",
        record_not_found: "Record not found",
        success: "User updated successfully",
        title: "Edit %{name}",
      },
      action: {
        new: "New user",
      },
    },
    tasks: {
      name: "Task |||| Tasks",
      forcedCaseName: "Task",
      fields: {
        text: "Description",
        due_date: "Due date",
        type: "Type",
        contact_id: "Contact",
        due_short: "due",
      },
      action: {
        add: "Add task",
        create: "Create task",
        edit: "Edit task",
      },
      actions: {
        postpone_next_week: "Postpone to next week",
        postpone_tomorrow: "Postpone to tomorrow",
        title: "task actions",
      },
      added: "Task added",
      deleted: "Task deleted successfully",
      dialog: {
        create: "Create task",
        create_for: "Create task for %{name}",
      },
      sheet: {
        edit: "Edit task",
        edit_for: "Edit task for %{name}",
      },
      empty: "No tasks yet",
      empty_list_hint: "Tasks added to your contacts will appear here.",
      filters: {
        later: "Later",
        overdue: "Overdue",
        this_week: "This week",
        today: "Today",
        tomorrow: "Tomorrow",
        with_pending: "With pending tasks",
      },
      regarding_contact: "(Re: %{name})",
      updated: "Task updated",
    },
    tags: {
      name: "Tag |||| Tags",
      action: {
        add: "Add tag",
        create: "Create new tag",
      },
      dialog: {
        color: "Color",
        create_title: "Create a new tag",
        edit_title: "Edit tag",
        name_label: "Tag name",
        name_placeholder: "Enter tag name",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Reset Password",
    },
    auth: {
      first_name: "First name",
      last_name: "Last name",
      confirm_password: "Confirm password",
      confirmation_required:
        "Please follow the link we just sent you by email to confirm your account.",
      recovery_email_sent:
        "If you're a registered user, you should receive a password recovery email shortly.",
      sign_in_failed: "Failed to log in.",
      sign_in_google_workspace: "Sign in with Google Workplace",
      signup: {
        create_account: "Create account",
        create_first_user:
          "Create the first user account to complete the setup.",
        creating: "Creating...",
        initial_user_created: "Initial user successfully created",
      },
      welcome_title: "Welcome to Atomic CRM",
    },
    common: {
      account_manager: "Account manager",
      activity: "Activity",
      added: "added",
      details: "Details",
      last_activity_with_date: "last activity %{date}",
      load_more: "Load more",
      misc: "Misc",
      past: "Past",
      read_more: "Read more",
      retry: "Retry",
      show_less: "Show less",
      copied: "Copied!",
      copy: "Copy",
      loading: "Loading...",
      me: "Me",
      task_count: "%{smart_count} task |||| %{smart_count} tasks",
    },
    billing: {
      title: "Billing",
      chart: "Commission per month",
      net: "Net for me",
      subcommission: "Sub-commission",
      fee: "Fee",
      commission: "My commission",
      month: "Month",
      contract_month: "(month %{month})",
      subcommission_status: "Sub-commission",
      projected: "Projected",
      paid: "Paid",
      pending: "Pending",
      mark_paid: "Mark paid",
      mark_pending: "Mark pending",
      empty: "No contract has billing in these months.",
      from: "From",
      to: "To",
      all: "All",
      only_pending: "Only pending sub-commissions",
      pending_subcommission: "Sub-commissions to pay",
      status_error:
        "The sub-commission could not be updated. Please try again.",
    },
    notifications: {
      title: "Notifications",
      unread:
        "%{smart_count} unread notification |||| %{smart_count} unread notifications",
      mark_all_read: "Mark all as read",
      empty: "No notifications yet.",
      new: "New",
      error: "The notifications could not be updated. Please try again.",
    },
    changelog: {
      title: "Changelog",
    },
    activity: {
      added_company: "%{name} added company",
      you_added_company: "You added company",
      added_contact: "%{name} added",
      you_added_contact: "You added",
      added_note: "%{name} added a note about",
      you_added_note: "You added a note about",
      added_note_about_deal: "%{name} added a note about deal",
      you_added_note_about_deal: "You added a note about deal",
      added_deal: "%{name} added deal",
      you_added_deal: "You added deal",
      at_company: "at",
      to: "to",
      load_more: "Load more activity",
    },
    dashboard: {
      pending: {
        title: "Pending items",
        companies_without_contacts: "Companies without a defined contact",
        contacts_without_company: "Contacts without an assigned company",
        see_all: "See all",
      },
      deals_chart: "Upcoming Deal Revenue",
      deals_pipeline: "Deals Pipeline",
      latest_activity: "Latest Activity",
      latest_activity_error: "Error loading latest activity",
      latest_notes: "My Latest Notes",
      latest_notes_added_ago: "added %{timeAgo}",
      stepper: {
        install: "Install Atomic CRM",
        progress: "%{step}/3 done",
        whats_next: "What's next?",
      },
      upcoming_tasks: "Upcoming Tasks",
      postponed: {
        title: "Postponed deals to resume",
        back_to: "Back to %{stage}",
        moved: '"%{name}" is back in %{stage}',
      },
    },
    data_import: {
      placeholder_contacts:
        "%{smart_count} contact went to «Por definir». |||| %{smart_count} contacts went to «Por definir».",
      duplicate_companies:
        "%{smart_count} company already existed and was reused. |||| %{smart_count} companies already existed and were reused.",
      button: "Import CSV",
      complete:
        "Import complete. Imported %{importCount} records, with %{errorCount} errors",
      csv_file: "CSV File",
      error:
        "Failed to import this file, please make sure you provided a valid CSV file.",
      in_progress: "Import in progress…",
      progress:
        "Imported %{importCount} / %{rowCount} records, with %{errorCount} errors.",
      remaining_time: "Estimated remaining time:",
      resource: "Resource",
      sample_download: "Download CSV sample",
      sample_hint: "Here is a sample CSV file you can use as a template",
      start: "Start import",
      stop: "Stop import",
      stopped:
        "Import stopped. Imported %{importCount} records, with %{errorCount} errors",
      title: "Import data",
    },
    header: {
      import_data: "Import from JSON",
    },
    image_editor: {
      change: "Change",
      drop_hint: "Drop a file to upload, or click to select it.",
      editable_content: "Editable content",
      title: "Upload and resize image",
      update_image: "Update Image",
    },
    import: {
      action: {
        download_error_report: "Download the error report",
        import: "Import",
        import_another: "Import another file",
      },
      error: {
        unable: "Unable to import this file.",
      },
      idle: {
        description_1:
          "You can import sales, companies, contacts, companies, notes, and tasks.",
        description_2:
          "Data must be in a JSON file matching the following sample:",
      },
      status: {
        all_success: "All records were imported successfully.",
        complete: "Import complete.",
        failed: "Failed",
        imported: "Imported",
        in_progress:
          "Import in progress, please don't navigate away from this page.",
        some_failed: "Some records were not imported.",
        table_caption: "Import status",
      },
      title: "Import from JSON",
    },
    settings: {
      about: "About",
      companies: {
        sectors: "Sectors",
      },
      dark_mode_logo: "Dark Mode Logo",
      deals: {
        categories: "Categories",
        currency: "Currency",
        pipeline_help:
          "Select which deal stages should count as pipeline deals.",
        pipeline_statuses: "Pipeline Statuses",
        stages: "Stages",
        stage_tags: "Tags per stage",
        stage_tags_help:
          "Tags a deal can carry while it sits in a stage. They are removed (and kept in the history) when the deal changes stage.",
        stage_tags_incomplete: "Every tag needs a stage and a name.",
        stage_tags_duplicate: "Two tags of the same stage have the same name.",
      },
      light_mode_logo: "Light Mode Logo",
      notes: {
        statuses: "Statuses",
      },
      reset_defaults: "Reset to Defaults",
      save_error: "Failed to save configuration",
      saved: "Configuration saved successfully",
      saving: "Saving...",
      tasks: {
        types: "Types",
      },
      preferences: "Preferences",
      title: "Settings",
      app_title: "App Title",
      sections: {
        branding: "Branding",
      },
      validation: {
        duplicate: "Duplicate %{display_name}: %{items}",
        in_use:
          "Cannot remove %{display_name} that are still used by deals: %{items}",
        validating: "Validating\u2026",
        entities: {
          categories: "categories",
          stages: "stages",
        },
      },
    },
    theme: {
      dark: "Dark",
      label: "Theme",
      light: "Light",
      system: "System",
    },
    language: "Language",
    navigation: {
      label: "CRM navigation",
    },
    profile: {
      google_calendar: {
        title: "Google Calendar",
        description:
          "Connect your Google Calendar and your tasks with a due date will show up there as events, updated whenever you change, complete or delete them in the CRM.",
        connect: "Connect Google Calendar",
        disconnect: "Disconnect",
        connected_as: "Connected as %{email}",
        connected_notice:
          "Google Calendar connected: your tasks will show up there.",
        error: "Google Calendar could not be connected. Please try again.",
      },
      add_secondary_email: "Add an email",
      email_taken: "%{email} is already used by another user",
      no_secondary_emails: "None",
      secondary_email_invalid: "%{email} is not a valid email address",
      secondary_email_is_primary: "%{email} is already your main address",
      secondary_email_taken: "%{email} is already used by another user",
      too_many_secondary_emails:
        "You cannot add more than 10 secondary email addresses",
      secondary_emails_help:
        "Other addresses you send emails from. Leave one empty to remove it.",
      inbound: {
        description:
          "You can start sending emails to your server's inbound email address, e.g. by adding it to the %{field} field. Atomic CRM will process the emails and add notes to the corresponding contacts.",
        title: "Inbound email",
      },
      mcp: {
        title: "MCP Server",
        description:
          "Use this URL to connect your AI assistant to your CRM data via the Model Context Protocol (MCP).",
      },
      password: {
        change: "Change password",
      },
      password_reset_sent:
        "A reset password email has been sent to your email address",
      record_not_found: "Record not found",
      title: "Profile",
      updated: "Your profile has been updated",
      update_error: "An error occurred. Please try again",
    },
    validation: {
      invalid_url: "Must be a valid URL",
      invalid_linkedin_url: "URL must be from linkedin.com",
    },
  },
} as const;

type MessageSchema<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? MessageSchema<T[K]>
      : never;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

export type CrmMessages = MessageSchema<typeof englishCrmMessages>;
export type PartialCrmMessages = DeepPartial<CrmMessages>;
