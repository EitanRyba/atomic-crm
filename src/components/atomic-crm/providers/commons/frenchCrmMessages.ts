import type { CrmMessages } from "./englishCrmMessages";

export const frenchCrmMessages = {
  resources: {
    companies: {
      name: "Entreprise |||| Entreprises",
      forcedCaseName: "Entreprise",
      categories: {
        client: "Client",
        referral: "Apporteur",
      },
      no_contact_defined: "Aucun contact défini",
      referred_clients: "Clients recommandés",
      no_referred_clients:
        "Elle n'a encore recommandé aucune entreprise cliente.",
      placeholder: {
        name: "À définir",
        filter: "Entreprise à définir",
        notice:
          "Entreprise système pour les contacts sans entreprise assignée. Assignez chaque contact à sa véritable entreprise.",
      },
      filters: {
        category: "Catégorie",
        referred_by: "Recommandée par",
        contacts: "Contacts",
      },
      validation: {
        category_required: "Cochez au moins une catégorie",
      },
      delete_dialog: {
        title:
          "Que faisons-nous de son %{smart_count} contact ? |||| Que faisons-nous de ses %{smart_count} contacts ?",
        description:
          "Vous allez supprimer l'entreprise « %{name} » et ses affaires.",
        move: "Les déplacer vers « Por definir »",
        delete: "Les supprimer aussi",
        confirm_title: "Supprimer l'entreprise « %{name} » ?",
        confirm_description:
          "Ses affaires seront supprimées aussi. Cette action est irréversible.",
        success: "Entreprise supprimée",
        error: "Impossible de supprimer l'entreprise",
      },
      fields: {
        name: "Nom de l'entreprise",
        website: "Site web",
        linkedin_url: "LinkedIn",
        phone_number: "Numéro de téléphone",
        created_at: "Date de création",
        nb_contacts: "Nombre de contacts",
        revenue: "Chiffre d'affaires",
        sector: "Secteur",
        size: "Taille",
        tax_identifier: "Identifiant fiscal",
        address: "Adresse",
        city: "Ville",
        zipcode: "Code postal",
        state_abbr: "État",
        country: "Pays",
        description: "Description",
        context_links: "URLs de contexte",
        sales_id: "Responsable de compte",
        continent: "Continent",
        network: "Réseau / association",
        headcount: "Effectif (employés)",
        headcount_source: "Source de l’effectif",
        current_competitor: "Concurrent actuel",
        is_client: "Entreprise cliente",
        is_referral: "Entreprise apporteuse",
        referred_by_company_id: "Recommandée par",
      },
      empty: {
        description: "Il semble que la liste de vos entreprises soit vide.",
        title: "Aucune entreprise trouvée",
      },
      import: {
        title: "Importer des entreprises",
      },
      field_categories: {
        contact: "Contact",
        additional_info: "Informations supplémentaires",
        address: "Adresse",
        context: "Contexte",
        prospecting: "Prospection Humand",
        categories: "Catégories",
      },
      action: {
        create: "Créer une entreprise",
        edit: "Modifier l'entreprise",
        new: "Nouvelle entreprise",
        show: "Afficher l'entreprise",
      },
      added_on: "Ajoutée le %{date}",
      followed_by: "Suivie par %{name}",
      followed_by_you: "Suivie par vous",
      no_contacts: "Aucun contact",
      nb_contacts: "%{smart_count} contact |||| %{smart_count} contacts",
      nb_deals: "%{smart_count} affaire |||| %{smart_count} affaires",
      sizes: {
        one_employee: "1 employé",
        two_to_nine_employees: "2-9 employés",
        ten_to_forty_nine_employees: "10-49 employés",
        fifty_to_two_hundred_forty_nine_employees: "50-249 employés",
        two_hundred_fifty_or_more_employees: "250 employés ou plus",
      },
      continents: {
        america: "Amériques",
        europe: "Europe",
        asia: "Asie",
        africa: "Afrique",
        oceania: "Océanie",
      },
      competitors: {
        whatsapp_excel: "WhatsApp + panneau d’affichage + Excel",
        none: "Aucun",
        other: "Autre",
      },
      autocomplete: {
        create_error:
          "Une erreur s'est produite lors de la création de l'entreprise",
        create_item: "Créer %{item}",
        create_label: "Commencez à taper pour créer une nouvelle entreprise",
      },
    },
    contacts: {
      name: "Contact |||| Contacts",
      forcedCaseName: "Contact",
      placeholder_badge: "Entreprise à définir",
      assign_company: {
        action: "Assigner une entreprise",
        description:
          "Choisissez la véritable entreprise du contact. |||| Choisissez la véritable entreprise des %{smart_count} contacts sélectionnés.",
        success:
          "Entreprise assignée |||| Entreprise assignée à %{smart_count} contacts",
        error: "Impossible d'assigner l'entreprise",
      },
      validation: {
        company_required:
          "Choisissez l'entreprise du contact. Si vous ne la connaissez pas encore, choisissez « Por definir »",
      },
      field_categories: {
        background_info: "Informations complémentaires",
        identity: "Identité",
        misc: "Divers",
        personal_info: "Informations personnelles",
        position: "Poste",
      },
      fields: {
        first_name: "Prénom",
        last_name: "Nom",
        last_seen: "Dernière activité",
        title: "Titre",
        company_id: "Entreprise",
        email_jsonb: "Adresses e-mail",
        email: "E-mail",
        phone_jsonb: "Numéros de téléphone",
        phone_number: "Numéro de téléphone",
        linkedin_url: "URL LinkedIn",
        background: "Informations de contexte",
        has_newsletter: "Abonné à la newsletter",
        sales_id: "Responsable de compte",
        buyer_role: "Rôle dans l’achat",
      },
      action: {
        add: "Ajouter un contact",
        add_first: "Ajoutez votre premier contact",
        create: "Créer un contact",
        edit: "Modifier le contact",
        export_vcard: "Exporter en vCard",
        new: "Nouveau contact",
        show: "Afficher le contact",
      },
      background: {
        last_activity_on: "Dernière activité le %{date}",
        added_on: "Ajouté le %{date}",
        followed_by: "Suivi par %{name}",
        followed_by_you: "Suivi par vous",
        status_none: "Aucun",
      },
      position_at: "%{title} chez",
      position_at_company: "%{title} chez %{company}",
      empty: {
        description: "Il semble que votre liste de contacts soit vide.",
        title: "Aucun contact trouvé",
      },
      import: {
        title: "Importer des contacts",
      },
      inputs: {
        genders: {
          male: "Monsieur",
          female: "Madame",
          nonbinary: "Indéterminé",
        },
        personal_info_types: {
          work: "Pro",
          home: "Perso",
          other: "Autre",
        },
        buyer_roles: {
          partner: "Associé",
          hr: "RH / People",
          internal_comms: "Communication interne",
          it: "IT",
          management: "Direction",
          other: "Autre",
        },
      },
      list: {
        error_loading: "Erreur lors du chargement des contacts",
      },
      bulk_tag: {
        action: "Étiqueter",
        back: "Retour aux étiquettes",
        create_description:
          "Créez une nouvelle étiquette et appliquez-la aux contacts sélectionnés.",
        description:
          "Choisissez une étiquette existante ou créez-en une pour les contacts sélectionnés.",
        empty:
          "Aucune étiquette pour le moment. Créez-en une pour étiqueter les contacts sélectionnés.",
        error: "Impossible d'ajouter l'étiquette aux contacts",
        noop: "Les contacts sélectionnés ont déjà cette étiquette",
        success:
          "Étiquette ajoutée à %{smart_count} contact |||| Étiquette ajoutée à %{smart_count} contacts",
        title: "Ajouter une étiquette aux contacts",
      },
      merge: {
        action: "Fusionner avec un autre contact",
        confirm: "Fusionner les contacts",
        current_contact: "Contact actuel (sera supprimé)",
        description: "Fusionnez ce contact avec un autre.",
        error: "Échec de la fusion des contacts",
        merging: "Fusion...",
        no_additional_data: "Aucune donnée supplémentaire à fusionner",
        select_target: "Veuillez sélectionner un contact avec lequel fusionner",
        success: "Contacts fusionnés avec succès",
        target_contact: "Contact cible (sera conservé)",
        title: "Fusionner les contacts",
        warning_description:
          "Toutes les données seront transférées au deuxième contact. Cette action ne peut pas être annulée.",
        warning_title: "Avertissement : opération destructrice",
        what_will_be_merged: "Ce qui sera fusionné :",
      },
      filters: {
        company: "Entreprise",
        company_placeholder: "Entreprise à définir",
        before_last_month: "Avant le mois dernier",
        before_this_month: "Avant ce mois-ci",
        before_this_week: "Avant cette semaine",
        managed_by_me: "Géré par moi",
        search: "Rechercher nom, entreprise...",
        this_week: "Cette semaine",
        today: "Aujourd'hui",
        tags: "Étiquettes",
        tasks: "Tâches",
      },
      hot: {
        empty_change_status:
          'Changez le statut d\'un contact en ajoutant une note à ce contact et en cliquant sur "afficher les options".',
        empty_hint: 'Les contacts avec un statut "chaud" apparaîtront ici.',
        title: "Contacts chauds",
      },
    },
    deals: {
      name: "Affaire |||| Affaires",
      fields: {
        name: "Nom",
        description: "Description",
        company_id: "Entreprise",
        contact_ids: "Contacts",
        category: "Catégorie",
        amount: "Budget",
        expected_closing_date: "Date de clôture prévue",
        stage: "Étape",
        lost_reason: "Motif de perte",
        lost_reason_detail: "Détail",
        postponed_until: "Reprendre le",
        postponed_reason: "Motif du report",
      },
      action: {
        back_to_deal: "Retour à l'affaire",
        create: "Créer une affaire",
        new: "Nouvelle affaire",
      },
      field_categories: {
        misc: "Divers",
      },
      filters: {
        only_mine: "Seulement les affaires que je gère",
      },
      archived: {
        action: "Archiver",
        error: "Erreur : affaire non archivée",
        list_title: "Affaires archivées",
        success: "Affaire archivée",
        title: "Affaire archivée",
        view: "Afficher les affaires archivées",
      },
      inputs: {
        linked_to: "Lié à",
      },
      unarchived: {
        action: "Renvoyer au tableau",
        error: "Erreur : affaire non désarchivée",
        success: "Affaire désarchivée",
      },
      updated: "Affaire mise à jour",
      empty: {
        before_create: "avant de créer une affaire.",
        description: "Il semble que votre liste d'affaires soit vide.",
        title: "Aucune affaire trouvée",
      },
      import: {
        title: "Importer des affaires",
      },
      invalid_date: "Date invalide",
      outcome: {
        lost_title: "Marquer « %{name} » comme perdue",
        lost_help:
          "Pour Humand, une affaire est perdue quand l'entreprise dit non explicitement, ou après 5 à 7 relances sans réponse sur au moins 3 mois.",
        postponed_title: "Reporter « %{name} »",
        postponed_help:
          "Choisissez quand recontacter l'entreprise. L'affaire apparaît sur le tableau de bord une semaine avant cette date.",
        choose_reason: "Choisissez un motif",
        confirm: "Confirmer",
        lost_reason_required: "Choisissez pourquoi l'affaire est perdue.",
        postponed_until_future:
          "La date de reprise doit être postérieure à aujourd'hui.",
        postponed_reason_required: "Indiquez pourquoi l'affaire est reportée.",
        resume_on: "Reprendre le %{date}",
        move_error: "L'affaire n'a pas pu être déplacée. Réessayez.",
        lost_reasons: {
          said_no: "A dit non",
          no_response: "Sans réponse",
          wrong_contact: "Mauvais contact",
          contact_left: "Le contact a quitté l'entreprise",
          pilot_churn: "Abandon pendant le pilote",
          unspecified: "Aucun motif enregistré",
        },
      },
      tags: {
        title: "Étiquettes",
        add: "Étiquette",
        description: "Description",
        description_placeholder: "Ajoutez une courte note (facultatif)",
        remove: "Retirer l'étiquette",
        added_by: "Ajoutée par %{name} le %{date}",
        edited_by: "Modifiée par %{name} le %{date}",
        history: "Étiquettes précédentes (%{smart_count})",
        removed_stage_change:
          "Ajoutée le %{added}, retirée le %{removed} au changement d'étape",
        removed_manual: "Ajoutée le %{added}, retirée à la main le %{removed}",
        error: "L'étiquette n'a pas pu être enregistrée. Réessayez.",
      },
      board: {
        show_closed: "Afficher reportées et perdues",
        hide_closed: "Masquer reportées et perdues",
        stage_info: "À propos de cette étape",
        humand_stage: "Étape Humand : %{stage}",
      },
    },
    contracts: {
      name: "Contrat |||| Contrats",
      fields: {
        company_id: "Entreprise cliente",
        deal_id: "Affaire gagnée",
        referral_company_id: "Entreprise apporteuse",
        first_payment_month: "Premier paiement",
        end_month: "Dernier mois facturé",
        fee_history: "Abonnement mensuel (USD)",
        commission_rules: "Ma commission",
        subcommission_rules: "Sous-commission à l'apporteur",
        notes: "Notes",
        current_fee: "Abonnement actuel",
        current_commission: "Commission actuelle",
        status: "Statut",
      },
      rule_fields: {
        fee_from_month: "À partir du mois",
        amount: "Abonnement mensuel (USD)",
        from_month: "Du mois de contrat",
        to_month: "Au mois de contrat (vide : sans fin)",
        percent: "% de l'abonnement",
        kind: "Type",
        value: "Valeur",
      },
      help: {
        first_payment_month:
          "Mois du premier paiement du client à Humand : mois 1 du contrat.",
        end_month: "Seulement si le contrat est terminé.",
        fee_history:
          "Ajoutez une ligne à chaque changement d'abonnement (par exemple quand le nombre d'utilisateurs change). Chaque montant s'applique à partir de son mois.",
        commission_rules:
          "% de l'abonnement que Humand vous verse, par mois de contrat. Par défaut : 50 % les mois 1 à 12, puis 30 %.",
        subcommission_rules:
          "Ce que vous devez à l'apporteur : un % de votre commission ou un montant fixe en USD par mois, sur une plage de mois de contrat (laissez la fin vide s'il n'y en a pas). Plusieurs lignes s'additionnent.",
      },
      subcommission_kinds: {
        percent: "% de ma commission",
        fixed: "Montant fixe (USD)",
      },
      statuses: {
        active: "Actif",
        ended: "Terminé",
        awaiting_payment: "En attente du premier paiement",
      },
      action: {
        new: "Nouveau contrat",
        edit: "Modifier le contrat",
        open: "Voir le contrat",
        create_from_deal: "Créer le contrat",
      },
      validation: {
        end_before_start:
          "Le dernier mois facturé doit suivre le premier paiement.",
        fee_required: "Indiquez l'abonnement mensuel.",
        fee_incomplete: "Chaque abonnement a besoin d'un mois et d'un montant.",
        fee_duplicate_month: "Deux abonnements commencent le même mois.",
        commission_incomplete:
          "Chaque ligne de commission a besoin d'un premier mois (1 ou plus), d'un dernier mois postérieur ou vide, et d'un % entre 0 et 100.",
        commission_overlap:
          "Deux lignes de commission couvrent les mêmes mois.",
        subcommission_incomplete:
          "Chaque ligne de sous-commission a besoin d'un type, d'une valeur (100 au plus pour un %), d'un premier mois (1 ou plus) et d'un dernier mois postérieur ou vide.",
      },
    },
    notes: {
      name: "Note |||| Notes",
      forcedCaseName: "Note",
      fields: {
        status: "Statut",
        date: "Date",
        attachments: "Pièces jointes",
        contact_id: "Contact",
        deal_id: "Affaire",
      },
      action: {
        add: "Ajouter une note",
        add_first: "Ajoutez votre première note",
        delete: "Supprimer la note",
        edit: "Modifier la note",
        update: "Mettre à jour la note",
        add_this: "Ajouter cette note",
      },
      sheet: {
        create: "Créer une note",
        create_for: "Créer une note pour %{name}",
        edit: "Modifier la note",
        edit_for: "Modifier la note pour %{name}",
      },
      deleted: "Note supprimée",
      empty: "Aucune note pour l'instant",
      author_added: "%{name} a ajouté une note",
      you_added: "Vous avez ajouté une note",
      me: "Moi",
      list: {
        error_loading: "Erreur lors du chargement des notes",
      },
      note_for_contact: "Note pour %{name}",
      stepper: {
        hint: "Accédez à une page de contact et ajoutez une note",
      },
      added: "Note ajoutée",
      inputs: {
        add_note: "Ajouter une note",
        options_hint: "(joindre des fichiers ou modifier les détails)",
        show_options: "Afficher les options",
      },
      actions: {
        attach_document: "Joindre un document",
      },
      validation: {
        note_or_attachment_required: "Une note ou une pièce jointe est requise",
      },
    },
    sales: {
      name: "Utilisateur |||| Utilisateurs",
      fields: {
        first_name: "Prénom",
        last_name: "Nom",
        email: "E-mail",
        secondary_email: "E-mail secondaire",
        secondary_emails: "E-mails secondaires",
        administrator: "Admin",
        disabled: "Désactivé",
      },
      create: {
        error:
          "Une erreur s'est produite lors de la création de l'utilisateur.",
        success:
          "Utilisateur créé. Ils recevront prochainement un email pour définir leur mot de passe.",
        title: "Créer un nouvel utilisateur",
      },
      edit: {
        error: "Une erreur s'est produite. Veuillez réessayer.",
        record_not_found: "Enregistrement introuvable",
        success: "Utilisateur mis à jour avec succès",
        title: "Modifier %{name}",
      },
      action: {
        new: "Nouvel utilisateur",
      },
    },
    tasks: {
      name: "Tâche |||| Tâches",
      forcedCaseName: "Tâche",
      fields: {
        text: "Description",
        due_date: "Date d'échéance",
        type: "Type",
        contact_id: "Contact",
        due_short: "échéance",
      },
      action: {
        add: "Ajouter une tâche",
        create: "Créer une tâche",
        edit: "Modifier la tâche",
      },
      actions: {
        postpone_next_week: "Reporté à la semaine prochaine",
        postpone_tomorrow: "Reporter à demain",
        title: "Actions de tâche",
      },
      added: "Tâche ajoutée",
      deleted: "Tâche supprimée avec succès",
      dialog: {
        create: "Créer une tâche",
        create_for: "Créer une tâche pour %{name}",
      },
      sheet: {
        edit: "Modifier la tâche",
        edit_for: "Modifier la tâche pour %{name}",
      },
      empty: "Aucune tâche pour l'instant",
      empty_list_hint: "Les tâches ajoutées à vos contacts apparaîtront ici.",
      filters: {
        later: "Plus tard",
        overdue: "En retard",
        this_week: "Cette semaine",
        today: "Aujourd'hui",
        tomorrow: "Demain",
        with_pending: "Avec des tâches en attente",
      },
      regarding_contact: "(Concernant : %{name})",
      updated: "Tâche mise à jour",
    },
    tags: {
      name: "Étiquette |||| Étiquettes",
      action: {
        add: "Ajouter une étiquette",
        create: "Créer une nouvelle étiquette",
      },
      dialog: {
        color: "Couleur",
        create_title: "Créer une nouvelle étiquette",
        edit_title: "Modifier l'étiquette",
        name_label: "Nom de l'étiquette",
        name_placeholder: "Saisir le nom de l'étiquette",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Réinitialiser le mot de passe",
    },
    auth: {
      first_name: "Prénom",
      last_name: "Nom",
      confirm_password: "Confirmer le mot de passe",
      confirmation_required:
        "Veuillez suivre le lien que nous venons de vous envoyer par email pour confirmer votre compte.",
      recovery_email_sent:
        "Si vous êtes un utilisateur enregistré, vous devriez recevoir prochainement un e-mail de récupération de mot de passe.",
      sign_in_failed: "Échec de la connexion.",
      sign_in_google_workspace: "Connectez-vous avec Google Workplace",
      signup: {
        create_account: "Créer un compte",
        create_first_user:
          "Créez le premier compte utilisateur pour terminer la configuration.",
        creating: "Création...",
        initial_user_created: "Utilisateur initial créé avec succès",
      },
      welcome_title: "Bienvenue sur Atomic CRM",
    },
    common: {
      account_manager: "Responsable de compte",
      activity: "Activité",
      added: "ajoutée",
      details: "Détails",
      last_activity_with_date: "dernière activité %{date}",
      load_more: "Charger plus",
      misc: "Divers",
      past: "Passé",
      read_more: "En savoir plus",
      retry: "Réessayer",
      show_less: "Afficher moins",
      task_count: "%{smart_count} tâche |||| %{smart_count} tâches",
      copied: "Copié !",
      copy: "Copier",
      loading: "Chargement...",
      me: "Moi",
    },
    billing: {
      title: "Facturation",
      chart: "Commission par mois",
      net: "Net pour moi",
      subcommission: "Sous-commission",
      fee: "Abonnement",
      commission: "Ma commission",
      month: "Mois",
      contract_month: "(mois %{month})",
      subcommission_status: "Sous-commission",
      projected: "Prévue",
      paid: "Payée",
      pending: "À payer",
      mark_paid: "Marquer payée",
      mark_pending: "Marquer à payer",
      empty: "Aucun contrat n'est facturé sur ces mois.",
      from: "Du",
      to: "Au",
      all: "Toutes",
      only_pending: "Seulement les sous-commissions à payer",
      pending_subcommission: "Sous-commissions à payer",
      status_error:
        "La sous-commission n'a pas pu être mise à jour. Réessayez.",
    },
    notifications: {
      title: "Notifications",
      unread:
        "%{smart_count} notification non lue |||| %{smart_count} notifications non lues",
      mark_all_read: "Tout marquer comme lu",
      empty: "Aucune notification pour l'instant.",
      new: "Nouveau",
      error: "Les notifications n'ont pas pu être mises à jour. Réessayez.",
    },
    changelog: {
      title: "Notes de version",
    },
    activity: {
      added_company: "%{name} a ajouté l'entreprise",
      you_added_company: "Vous avez ajouté l'entreprise",
      added_contact: "%{name} a ajouté le contact",
      you_added_contact: "Vous avez ajouté le contact",
      added_note: "%{name} a ajouté une note sur",
      you_added_note: "Vous avez ajouté une note sur",
      added_note_about_deal: "%{name} a ajouté une note sur l'affaire",
      you_added_note_about_deal: "Vous avez ajouté une note sur l'affaire",
      added_deal: "%{name} a ajouté l'affaire",
      you_added_deal: "Vous avez ajouté l'affaire",
      at_company: "chez",
      to: "à",
      load_more: "Charger plus d'activité",
    },
    dashboard: {
      pending: {
        title: "À compléter",
        companies_without_contacts: "Entreprises sans contact défini",
        contacts_without_company: "Contacts sans entreprise assignée",
        see_all: "Voir tout",
      },
      deals_chart: "Revenus des affaires à venir",
      deals_pipeline: "Pipeline des affaires",
      latest_activity: "Dernière activité",
      latest_activity_error:
        "Erreur lors du chargement de la dernière activité",
      latest_notes: "Mes dernières notes",
      latest_notes_added_ago: "ajouté %{timeAgo}",
      stepper: {
        install: "Installer Atomic CRM",
        progress: "%{step}/3 terminé",
        whats_next: "Et ensuite ?",
      },
      upcoming_tasks: "Tâches à venir",
      postponed: {
        title: "Affaires reportées à reprendre",
        back_to: "Revenir à %{stage}",
        moved: "« %{name} » est revenue à %{stage}",
      },
    },
    data_import: {
      placeholder_contacts:
        "%{smart_count} contact a été placé dans « Por definir ». |||| %{smart_count} contacts ont été placés dans « Por definir ».",
      duplicate_companies:
        "%{smart_count} entreprise existait déjà et a été réutilisée. |||| %{smart_count} entreprises existaient déjà et ont été réutilisées.",
      button: "Importer un fichier CSV",
      complete:
        "Import terminé. %{importCount} enregistrements importés, %{errorCount} erreurs",
      csv_file: "Fichier CSV",
      error:
        "Échec de l'importation de ce fichier. Veuillez vous assurer que vous avez fourni un fichier CSV valide.",
      in_progress: "Import en cours…",
      progress:
        "%{importCount} / %{rowCount} enregistrements importés, avec %{errorCount} erreurs.",
      remaining_time: "Temps restant estimé :",
      resource: "Ressource",
      sample_download: "Télécharger un exemple CSV",
      sample_hint:
        "Voici un exemple de fichier CSV que vous pouvez utiliser comme modèle",
      start: "Démarrer l'import",
      stop: "Arrêter l'importation",
      stopped:
        "Import arrêté. %{importCount} enregistrements importés, %{errorCount} erreurs",
      title: "Importer des données",
    },
    header: {
      import_data: "Importer depuis JSON",
    },
    image_editor: {
      change: "Changer",
      drop_hint:
        "Déposez un fichier à télécharger ou cliquez pour le sélectionner.",
      editable_content: "Contenu modifiable",
      title: "Télécharger et redimensionner l'image",
      update_image: "Mettre à jour l'image",
    },
    import: {
      action: {
        download_error_report: "Téléchargez le rapport d'erreur",
        import: "Importer",
        import_another: "Importer un autre fichier",
      },
      error: {
        unable: "Impossible d'importer ce fichier.",
      },
      idle: {
        description_1:
          "Vous pouvez importer des ventes, des entreprises, des contacts, des entreprises, des notes et des tâches.",
        description_2:
          "Les données doivent se trouver dans un fichier JSON correspondant à l'exemple suivant :",
      },
      status: {
        all_success: "Tous les enregistrements ont été importés avec succès.",
        complete: "Importation terminée.",
        failed: "Échoué",
        imported: "Importé",
        in_progress: "Import en cours, veuillez ne pas quitter cette page.",
        some_failed: "Certains enregistrements n'ont pas été importés.",
        table_caption: "Statut d'importation",
      },
      title: "Importer depuis JSON",
    },
    settings: {
      about: "À propos",
      companies: {
        sectors: "Secteurs",
      },
      dark_mode_logo: "Logo du mode sombre",
      deals: {
        categories: "Catégories",
        currency: "Devise",
        pipeline_help:
          "Sélectionnez les étapes d'affaire à considérer comme des affaires dans le pipeline.",
        pipeline_statuses: "Statuts des pipelines",
        stages: "Étapes",
        stage_tags: "Étiquettes par étape",
        stage_tags_help:
          "Étiquettes qu'une affaire peut porter dans une étape. Elles sont retirées (et gardées dans l'historique) quand l'affaire change d'étape.",
        stage_tags_incomplete:
          "Chaque étiquette a besoin d'une étape et d'un nom.",
        stage_tags_duplicate:
          "Deux étiquettes de la même étape ont le même nom.",
      },
      light_mode_logo: "Logo du mode clair",
      notes: {
        statuses: "Statuts",
      },
      reset_defaults: "Réinitialiser aux valeurs par défaut",
      save_error: "Échec de l'enregistrement de la configuration",
      saved: "Configuration enregistrée avec succès",
      saving: "Enregistrement...",
      tasks: {
        types: "Types",
      },
      preferences: "Préférences",
      title: "Paramètres",
      app_title: "Titre de l'application",
      sections: {
        branding: "Image de marque",
      },
      validation: {
        duplicate: "%{display_name} en double : %{items}",
        in_use:
          "Impossible de supprimer %{display_name} encore utilisés par des affaires : %{items}",
        validating: "Validation\u2026",
        entities: {
          categories: "catégories",
          stages: "étapes",
        },
      },
    },
    theme: {
      dark: "Sombre",
      label: "Thème",
      light: "Clair",
      system: "Système",
    },
    language: "Langue",
    navigation: {
      label: "Navigation CRM",
    },
    profile: {
      google_calendar: {
        title: "Google Agenda",
        description:
          "Connectez votre Google Agenda : vos tâches avec une échéance y apparaîtront comme événements, mis à jour quand vous les modifiez, terminez ou supprimez dans le CRM.",
        connect: "Connecter Google Agenda",
        disconnect: "Déconnecter",
        connected_as: "Connecté en tant que %{email}",
        connected_notice: "Google Agenda connecté : vos tâches y apparaîtront.",
        error: "Google Agenda n'a pas pu être connecté. Réessayez.",
      },
      add_secondary_email: "Ajouter un e-mail",
      email_taken: "%{email} est déjà utilisée par un autre utilisateur",
      no_secondary_emails: "Aucun",
      secondary_email_invalid: "%{email} n'est pas une adresse e-mail valide",
      secondary_email_is_primary: "%{email} est déjà votre adresse principale",
      secondary_email_taken:
        "%{email} est déjà utilisée par un autre utilisateur",
      too_many_secondary_emails:
        "Vous ne pouvez pas ajouter plus de 10 adresses e-mail secondaires",
      secondary_emails_help:
        "Autres adresses depuis lesquelles vous envoyez des e-mails. Laissez-en une vide pour la supprimer.",
      inbound: {
        description:
          "Vous pouvez commencer à envoyer des e-mails vers l'adresse de réception de votre serveur, par exemple en l'ajoutant au champ %{field}. Atomic CRM traitera les e-mails et ajoutera des notes aux contacts correspondants.",
        title: "E-mail entrant",
      },
      mcp: {
        title: "Serveur MCP",
        description:
          "Utilisez cette URL pour connecter votre assistant IA aux données de votre CRM via le Model Context Protocol (MCP).",
      },
      password: {
        change: "Changer le mot de passe",
      },
      password_reset_sent:
        "Un e-mail de réinitialisation du mot de passe a été envoyé à votre adresse e-mail",
      record_not_found: "Enregistrement introuvable",
      title: "Profil",
      updated: "Votre profil a été mis à jour",
      update_error: "Une erreur s'est produite. Veuillez réessayer",
    },
    validation: {
      invalid_url: "Doit être une URL valide",
      invalid_linkedin_url: "L'URL doit provenir de linkedin.com",
    },
  },
} satisfies CrmMessages;
