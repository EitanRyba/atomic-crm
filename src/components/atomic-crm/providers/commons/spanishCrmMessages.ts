import type { CrmMessages } from "./englishCrmMessages";

export const spanishCrmMessages = {
  resources: {
    companies: {
      name: "Empresa |||| Empresas",
      forcedCaseName: "Empresa",
      categories: {
        client: "Cliente",
        referral: "Referido",
      },
      no_contact_defined: "Sin contacto definido",
      referred_clients: "Clientes referidos",
      no_referred_clients: "Todavía no refirió ninguna empresa cliente.",
      placeholder: {
        name: "Por definir",
        filter: "Empresa por definir",
        notice:
          "Empresa del sistema para contactos sin empresa asignada. Asigná cada contacto a su empresa real.",
      },
      filters: {
        category: "Categoría",
        referred_by: "Referida por",
        contacts: "Contactos",
      },
      validation: {
        category_required: "Marcá al menos una categoría",
      },
      delete_dialog: {
        title:
          "¿Qué hacemos con sus %{smart_count} contacto? |||| ¿Qué hacemos con sus %{smart_count} contactos?",
        description: "Vas a eliminar la empresa «%{name}» y sus oportunidades.",
        move: "Moverlos a «Por definir»",
        delete: "Eliminarlos también",
        confirm_title: "¿Eliminar la empresa «%{name}»?",
        confirm_description:
          "Se van a eliminar también sus oportunidades. Esta acción no se puede deshacer.",
        success: "Empresa eliminada",
        error: "No se pudo eliminar la empresa",
      },
      fields: {
        name: "Nombre de la empresa",
        website: "Sitio web",
        linkedin_url: "URL de LinkedIn",
        phone_number: "Teléfono",
        created_at: "Creada el",
        nb_contacts: "Cantidad de contactos",
        revenue: "Facturación",
        sector: "Sector",
        size: "Tamaño",
        tax_identifier: "CUIT / ID fiscal",
        address: "Dirección",
        city: "Ciudad",
        zipcode: "Código postal",
        state_abbr: "Provincia / Estado",
        country: "País",
        description: "Descripción",
        context_links: "Links de contexto",
        sales_id: "Responsable de la cuenta",
        continent: "Continente",
        network: "Red / asociación",
        headcount: "Dotación (empleados)",
        headcount_source: "Fuente de la dotación",
        current_competitor: "Competidor actual",
        is_client: "Empresa cliente",
        is_referral: "Empresa de referido",
        referred_by_company_id: "Referida por",
      },
      empty: {
        description: "Todavía no cargaste ninguna empresa.",
        title: "No hay empresas",
      },
      import: {
        title: "Importar empresas",
      },
      field_categories: {
        contact: "Contacto",
        additional_info: "Información adicional",
        address: "Dirección",
        context: "Contexto",
        prospecting: "Prospección Humand",
        categories: "Categorías",
      },
      action: {
        create: "Crear empresa",
        edit: "Editar empresa",
        new: "Nueva empresa",
        show: "Ver empresa",
      },
      added_on: "Agregada el %{date}",
      followed_by: "A cargo de %{name}",
      followed_by_you: "A tu cargo",
      no_contacts: "Sin contactos",
      nb_contacts: "%{smart_count} contacto |||| %{smart_count} contactos",
      nb_deals: "%{smart_count} oportunidad |||| %{smart_count} oportunidades",
      sizes: {
        one_employee: "1 empleado",
        two_to_nine_employees: "2-9 empleados",
        ten_to_forty_nine_employees: "10-49 empleados",
        fifty_to_two_hundred_forty_nine_employees: "50-249 empleados",
        two_hundred_fifty_or_more_employees: "250 empleados o más",
      },
      continents: {
        america: "América",
        europe: "Europa",
        asia: "Asia",
        africa: "África",
        oceania: "Oceanía",
      },
      competitors: {
        whatsapp_excel: "WhatsApp + cartelera + Excel",
        none: "Ninguno",
        other: "Otro",
      },
      autocomplete: {
        create_error: "Hubo un error al crear la empresa",
        create_item: "Crear %{item}",
        create_label: "Escribí para crear una empresa nueva",
      },
    },
    contacts: {
      name: "Contacto |||| Contactos",
      forcedCaseName: "Contacto",
      placeholder_badge: "Empresa por definir",
      assign_company: {
        action: "Asignar empresa",
        description:
          "Elegí la empresa real del contacto. |||| Elegí la empresa real de los %{smart_count} contactos seleccionados.",
        success:
          "Empresa asignada |||| Empresa asignada a %{smart_count} contactos",
        error: "No se pudo asignar la empresa",
      },
      validation: {
        company_required:
          "Elegí la empresa del contacto. Si todavía no la sabés, elegí «Por definir»",
      },
      field_categories: {
        background_info: "Antecedentes",
        identity: "Identidad",
        misc: "Otros",
        personal_info: "Datos de contacto",
        position: "Puesto",
      },
      fields: {
        first_name: "Nombre",
        last_name: "Apellido",
        last_seen: "Última actividad",
        title: "Cargo",
        company_id: "Empresa",
        email_jsonb: "Emails",
        email: "Email",
        phone_jsonb: "Teléfonos",
        phone_number: "Teléfono",
        linkedin_url: "URL de LinkedIn",
        background: "Antecedentes (bio, cómo lo conociste, etc.)",
        has_newsletter: "Recibe newsletter",
        sales_id: "Responsable de la cuenta",
        buyer_role: "Rol en la compra",
      },
      action: {
        add: "Agregar contacto",
        add_first: "Agregá tu primer contacto",
        create: "Crear contacto",
        edit: "Editar contacto",
        export_vcard: "Exportar a vCard",
        new: "Nuevo contacto",
        show: "Ver contacto",
      },
      background: {
        last_activity_on: "Última actividad el %{date}",
        added_on: "Agregado el %{date}",
        followed_by: "A cargo de %{name}",
        followed_by_you: "A tu cargo",
        status_none: "Ninguno",
      },
      position_at: "%{title} en",
      position_at_company: "%{title} en %{company}",
      empty: {
        description: "Todavía no cargaste ningún contacto.",
        title: "No hay contactos",
      },
      import: {
        title: "Importar contactos",
      },
      inputs: {
        genders: {
          male: "Él",
          female: "Ella",
          nonbinary: "Elle",
        },
        personal_info_types: {
          work: "Trabajo",
          home: "Personal",
          other: "Otro",
        },
        buyer_roles: {
          partner: "Socio",
          hr: "RRHH / People",
          internal_comms: "Comunicación interna",
          it: "IT",
          management: "Dirección",
          other: "Otro",
        },
      },
      list: {
        error_loading: "Error al cargar los contactos",
      },
      bulk_tag: {
        action: "Etiquetar",
        back: "Volver a las etiquetas",
        create_description:
          "Creá una etiqueta nueva y aplicala a los contactos seleccionados.",
        description:
          "Elegí una etiqueta existente o creá una nueva para los contactos seleccionados.",
        empty:
          "Todavía no hay etiquetas. Creá una para etiquetar los contactos seleccionados.",
        error: "No se pudo etiquetar a los contactos",
        noop: "Los contactos seleccionados ya tienen esta etiqueta",
        success:
          "Etiqueta agregada a %{smart_count} contacto |||| Etiqueta agregada a %{smart_count} contactos",
        title: "Etiquetar contactos",
      },
      merge: {
        action: "Fusionar con otro contacto",
        confirm: "Fusionar contactos",
        current_contact: "Contacto actual (se va a eliminar)",
        description: "Fusioná este contacto con otro.",
        error: "No se pudieron fusionar los contactos",
        merging: "Fusionando...",
        no_additional_data: "No hay datos adicionales para fusionar",
        select_target: "Elegí el contacto con el que querés fusionar",
        success: "Contactos fusionados",
        target_contact: "Contacto destino (se conserva)",
        title: "Fusionar contacto",
        warning_description:
          "Todos los datos pasan al segundo contacto. Esta acción no se puede deshacer.",
        warning_title: "Atención: acción irreversible",
        what_will_be_merged: "Qué se va a fusionar:",
      },
      filters: {
        company: "Empresa",
        company_placeholder: "Empresa por definir",
        before_last_month: "Antes del mes pasado",
        before_this_month: "Antes de este mes",
        before_this_week: "Antes de esta semana",
        managed_by_me: "A mi cargo",
        search: "Buscar nombre, empresa...",
        this_week: "Esta semana",
        today: "Hoy",
        tags: "Etiquetas",
        tasks: "Tareas",
      },
      hot: {
        empty_change_status:
          'Para cambiar el estado de un contacto, agregale una nota y tocá "mostrar opciones".',
        empty_hint: 'Los contactos en estado "caliente" van a aparecer acá.',
        title: "Contactos calientes",
      },
    },
    deals: {
      name: "Oportunidad |||| Oportunidades",
      fields: {
        name: "Nombre",
        description: "Descripción",
        company_id: "Empresa",
        contact_ids: "Contactos",
        category: "Origen",
        amount: "Monto estimado",
        expected_closing_date: "Fecha estimada de cierre",
        stage: "Etapa",
        lost_reason: "Motivo de pérdida",
        lost_reason_detail: "Detalle",
        postponed_until: "Retomar el",
        postponed_reason: "Motivo",
      },
      action: {
        back_to_deal: "Volver a la oportunidad",
        create: "Crear oportunidad",
        new: "Nueva oportunidad",
      },
      field_categories: {
        misc: "Otros",
      },
      filters: {
        only_mine: "Solo las mías",
      },
      archived: {
        action: "Archivar",
        error: "Error: no se pudo archivar la oportunidad",
        list_title: "Oportunidades archivadas",
        success: "Oportunidad archivada",
        title: "Oportunidad archivada",
        view: "Ver oportunidades archivadas",
      },
      inputs: {
        linked_to: "Vinculada a",
      },
      unarchived: {
        action: "Devolver al tablero",
        error: "Error: no se pudo desarchivar la oportunidad",
        success: "Oportunidad desarchivada",
      },
      updated: "Oportunidad actualizada",
      empty: {
        before_create: "antes de crear una oportunidad.",
        description: "Todavía no cargaste ninguna oportunidad.",
        title: "No hay oportunidades",
      },
      import: {
        title: "Importar oportunidades",
      },
      invalid_date: "Fecha inválida",
      outcome: {
        lost_title: 'Marcar "%{name}" como perdida',
        lost_help:
          "Para Humand una oportunidad está perdida cuando la empresa dice que no explícitamente, o después de 5 a 7 seguimientos sin respuesta a lo largo de al menos 3 meses.",
        postponed_title: 'Posponer "%{name}"',
        postponed_help:
          "Elegí cuándo volver a contactar a la empresa. La oportunidad aparece en el inicio una semana antes de esa fecha.",
        choose_reason: "Elegí un motivo",
        confirm: "Confirmar",
        lost_reason_required: "Elegí por qué se perdió la oportunidad.",
        postponed_until_future:
          "La fecha para retomar tiene que ser posterior a hoy.",
        postponed_reason_required: "Escribí por qué se pospone.",
        resume_on: "Retomar el %{date}",
        move_error: "No se pudo mover la oportunidad. Probá de nuevo.",
        lost_reasons: {
          said_no: "Dijo que no",
          no_response: "Sin respuesta",
          wrong_contact: "Contacto equivocado",
          contact_left: "El contacto dejó la empresa",
          pilot_churn: "Churn durante el piloto",
          unspecified: "Sin motivo registrado",
        },
      },
      tags: {
        title: "Etiquetas",
        add: "Etiqueta",
        description: "Descripción",
        description_placeholder: "Agregá una nota breve (opcional)",
        remove: "Quitar etiqueta",
        added_by: "Agregada por %{name} el %{date}",
        edited_by: "Editada por %{name} el %{date}",
        history: "Etiquetas anteriores (%{smart_count})",
        removed_stage_change:
          "Agregada el %{added}, quitada el %{removed} al cambiar de etapa",
        removed_manual: "Agregada el %{added}, quitada a mano el %{removed}",
        error: "No se pudo guardar la etiqueta. Probá de nuevo.",
      },
      board: {
        show_closed: "Mostrar pospuestos y perdidos",
        hide_closed: "Ocultar pospuestos y perdidos",
        stage_info: "Sobre esta etapa",
        humand_stage: "Etapa Humand: %{stage}",
      },
    },
    notes: {
      name: "Nota |||| Notas",
      forcedCaseName: "Nota",
      fields: {
        status: "Estado",
        date: "Fecha",
        attachments: "Adjuntos",
        contact_id: "Contacto",
        deal_id: "Oportunidad",
      },
      action: {
        add: "Agregar nota",
        add_first: "Agregá tu primera nota",
        delete: "Eliminar nota",
        edit: "Editar nota",
        update: "Actualizar nota",
        add_this: "Agregar esta nota",
      },
      sheet: {
        create: "Crear nota",
        create_for: "Crear nota para %{name}",
        edit: "Editar nota",
        edit_for: "Editar nota de %{name}",
      },
      deleted: "Nota eliminada",
      empty: "Todavía no hay notas",
      author_added: "%{name} agregó una nota",
      you_added: "Agregaste una nota",
      me: "Yo",
      list: {
        error_loading: "Error al cargar las notas",
      },
      note_for_contact: "Nota para %{name}",
      stepper: {
        hint: "Entrá a la ficha de un contacto y agregá una nota",
      },
      added: "Nota agregada",
      inputs: {
        add_note: "Agregar una nota",
        options_hint: "(adjuntar archivos o cambiar detalles)",
        show_options: "Mostrar opciones",
      },
      actions: {
        attach_document: "Adjuntar documento",
      },
      validation: {
        note_or_attachment_required: "Escribí una nota o adjuntá un archivo",
      },
    },
    sales: {
      name: "Usuario |||| Usuarios",
      fields: {
        first_name: "Nombre",
        last_name: "Apellido",
        email: "Email",
        secondary_email: "Email secundario",
        secondary_emails: "Emails secundarios",
        administrator: "Administrador",
        disabled: "Deshabilitado",
      },
      create: {
        error: "Hubo un error al crear el usuario.",
        success:
          "Usuario creado. Le va a llegar un email para elegir su contraseña.",
        title: "Crear un usuario nuevo",
      },
      edit: {
        error: "Hubo un error. Probá de nuevo.",
        record_not_found: "No se encontró el registro",
        success: "Usuario actualizado",
        title: "Editar a %{name}",
      },
      action: {
        new: "Nuevo usuario",
      },
    },
    tasks: {
      name: "Tarea |||| Tareas",
      forcedCaseName: "Tarea",
      fields: {
        text: "Descripción",
        due_date: "Vencimiento",
        type: "Tipo",
        contact_id: "Contacto",
        due_short: "vence",
      },
      action: {
        add: "Agregar tarea",
        create: "Crear tarea",
        edit: "Editar tarea",
      },
      actions: {
        postpone_next_week: "Pasar a la semana que viene",
        postpone_tomorrow: "Pasar a mañana",
        title: "acciones de la tarea",
      },
      added: "Tarea agregada",
      deleted: "Tarea eliminada",
      dialog: {
        create: "Crear tarea",
        create_for: "Crear tarea para %{name}",
      },
      sheet: {
        edit: "Editar tarea",
        edit_for: "Editar tarea de %{name}",
      },
      empty: "Todavía no hay tareas",
      empty_list_hint:
        "Las tareas que agregues a tus contactos van a aparecer acá.",
      filters: {
        later: "Más adelante",
        overdue: "Vencidas",
        this_week: "Esta semana",
        today: "Hoy",
        tomorrow: "Mañana",
        with_pending: "Con tareas pendientes",
      },
      regarding_contact: "(Re: %{name})",
      updated: "Tarea actualizada",
    },
    tags: {
      name: "Etiqueta |||| Etiquetas",
      action: {
        add: "Agregar etiqueta",
        create: "Crear etiqueta",
      },
      dialog: {
        color: "Color",
        create_title: "Crear una etiqueta",
        edit_title: "Editar etiqueta",
        name_label: "Nombre de la etiqueta",
        name_placeholder: "Escribí el nombre",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Restablecer contraseña",
    },
    auth: {
      first_name: "Nombre",
      last_name: "Apellido",
      confirm_password: "Confirmar contraseña",
      confirmation_required:
        "Abrí el link que te mandamos por email para confirmar tu cuenta.",
      recovery_email_sent:
        "Si tenés una cuenta, en breve te llega un email para recuperar la contraseña.",
      sign_in_failed: "No se pudo iniciar sesión.",
      sign_in_google_workspace: "Ingresar con Google Workspace",
      signup: {
        create_account: "Crear cuenta",
        create_first_user:
          "Creá la primera cuenta de usuario para terminar la configuración.",
        creating: "Creando...",
        initial_user_created: "Usuario inicial creado",
      },
      welcome_title: "Bienvenido a Humand CRM",
    },
    common: {
      account_manager: "Responsable de la cuenta",
      activity: "Actividad",
      added: "agregó",
      details: "Detalles",
      last_activity_with_date: "última actividad %{date}",
      load_more: "Cargar más",
      misc: "Otros",
      past: "Pasadas",
      read_more: "Leer más",
      retry: "Reintentar",
      show_less: "Mostrar menos",
      copied: "¡Copiado!",
      copy: "Copiar",
      loading: "Cargando...",
      me: "Yo",
      task_count: "%{smart_count} tarea |||| %{smart_count} tareas",
    },
    changelog: {
      title: "Novedades",
    },
    activity: {
      added_company: "%{name} agregó la empresa",
      you_added_company: "Agregaste la empresa",
      added_contact: "%{name} agregó a",
      you_added_contact: "Agregaste a",
      added_note: "%{name} agregó una nota sobre",
      you_added_note: "Agregaste una nota sobre",
      added_note_about_deal: "%{name} agregó una nota sobre la oportunidad",
      you_added_note_about_deal: "Agregaste una nota sobre la oportunidad",
      added_deal: "%{name} agregó la oportunidad",
      you_added_deal: "Agregaste la oportunidad",
      at_company: "en",
      to: "a",
      load_more: "Cargar más actividad",
    },
    dashboard: {
      pending: {
        title: "Pendientes de completar",
        companies_without_contacts: "Empresas sin contacto definido",
        contacts_without_company: "Contactos sin empresa asignada",
        see_all: "Ver todos",
      },
      deals_chart: "Ingresos esperados por oportunidades",
      deals_pipeline: "Pipeline de oportunidades",
      latest_activity: "Actividad reciente",
      latest_activity_error: "Error al cargar la actividad reciente",
      latest_notes: "Mis últimas notas",
      latest_notes_added_ago: "agregada %{timeAgo}",
      stepper: {
        install: "Instalar el CRM",
        progress: "%{step}/3 listo",
        whats_next: "¿Qué sigue?",
      },
      upcoming_tasks: "Próximas tareas",
      postponed: {
        title: "Pospuestos para retomar",
        back_to: "Volver a %{stage}",
        moved: '"%{name}" volvió a %{stage}',
      },
    },
    data_import: {
      placeholder_contacts:
        "%{smart_count} contacto quedó en «Por definir». |||| %{smart_count} contactos quedaron en «Por definir».",
      duplicate_companies:
        "%{smart_count} empresa ya existía y se reutilizó. |||| %{smart_count} empresas ya existían y se reutilizaron.",
      button: "Importar CSV",
      complete:
        "Importación terminada: %{importCount} registros importados, %{errorCount} errores",
      csv_file: "Archivo CSV",
      error: "No se pudo importar el archivo. Revisá que sea un CSV válido.",
      in_progress: "Importando…",
      progress:
        "Importados %{importCount} / %{rowCount} registros, con %{errorCount} errores.",
      remaining_time: "Tiempo restante estimado:",
      resource: "Tipo de registro",
      sample_download: "Descargar CSV de ejemplo",
      sample_hint: "Este CSV de ejemplo te sirve como plantilla",
      start: "Empezar importación",
      stop: "Detener importación",
      stopped:
        "Importación detenida: %{importCount} registros importados, %{errorCount} errores",
      title: "Importar datos",
    },
    header: {
      import_data: "Importar desde JSON",
    },
    image_editor: {
      change: "Cambiar",
      drop_hint: "Arrastrá un archivo para subirlo, o hacé clic para elegirlo.",
      editable_content: "Contenido editable",
      title: "Subir y recortar imagen",
      update_image: "Actualizar imagen",
    },
    import: {
      action: {
        download_error_report: "Descargar el reporte de errores",
        import: "Importar",
        import_another: "Importar otro archivo",
      },
      error: {
        unable: "No se pudo importar el archivo.",
      },
      idle: {
        description_1:
          "Podés importar usuarios, empresas, contactos, notas y tareas.",
        description_2:
          "Los datos tienen que estar en un archivo JSON con este formato:",
      },
      status: {
        all_success: "Se importaron todos los registros.",
        complete: "Importación terminada.",
        failed: "Con error",
        imported: "Importados",
        in_progress: "Importando, no salgas de esta página.",
        some_failed: "Algunos registros no se importaron.",
        table_caption: "Estado de la importación",
      },
      title: "Importar desde JSON",
    },
    settings: {
      about: "Acerca de",
      companies: {
        sectors: "Sectores",
      },
      dark_mode_logo: "Logo en modo oscuro",
      deals: {
        categories: "Orígenes",
        currency: "Moneda",
        pipeline_help:
          "Elegí qué etapas cuentan como oportunidades en el pipeline.",
        pipeline_statuses: "Etapas del pipeline",
        stages: "Etapas",
        stage_tags: "Etiquetas por etapa",
        stage_tags_help:
          "Etiquetas que puede llevar una oportunidad mientras está en una etapa. Se quitan (y quedan en el historial) cuando cambia de etapa.",
        stage_tags_incomplete: "Cada etiqueta necesita una etapa y un nombre.",
        stage_tags_duplicate:
          "Hay dos etiquetas con el mismo nombre en la misma etapa.",
      },
      light_mode_logo: "Logo en modo claro",
      notes: {
        statuses: "Estados",
      },
      reset_defaults: "Volver a los valores por defecto",
      save_error: "No se pudo guardar la configuración",
      saved: "Configuración guardada",
      saving: "Guardando...",
      tasks: {
        types: "Tipos",
      },
      preferences: "Preferencias",
      title: "Configuración",
      app_title: "Nombre de la app",
      sections: {
        branding: "Marca",
      },
      validation: {
        duplicate: "%{display_name} duplicadas: %{items}",
        in_use:
          "No se pueden quitar %{display_name} que usan algunas oportunidades: %{items}",
        validating: "Validando…",
        entities: {
          categories: "orígenes",
          stages: "etapas",
        },
      },
    },
    theme: {
      dark: "Oscuro",
      label: "Tema",
      light: "Claro",
      system: "Sistema",
    },
    language: "Idioma",
    navigation: {
      label: "Navegación del CRM",
    },
    profile: {
      add_secondary_email: "Agregar un email",
      email_taken: "%{email} ya lo usa otro usuario",
      no_secondary_emails: "Ninguno",
      secondary_email_invalid: "%{email} no es un email válido",
      secondary_email_is_primary: "%{email} ya es tu email principal",
      secondary_email_taken: "%{email} ya lo usa otro usuario",
      too_many_secondary_emails:
        "No podés agregar más de 10 emails secundarios",
      secondary_emails_help:
        "Otras direcciones desde las que mandás emails. Dejá una vacía para quitarla.",
      inbound: {
        description:
          "Podés mandar emails a la dirección de entrada de tu servidor, por ejemplo poniéndola en el campo %{field}. El CRM procesa los emails y agrega notas a los contactos correspondientes.",
        title: "Email entrante",
      },
      mcp: {
        title: "Servidor MCP",
        description:
          "Usá esta URL para conectar tu asistente de IA a los datos del CRM mediante el Model Context Protocol (MCP).",
      },
      password: {
        change: "Cambiar contraseña",
      },
      password_reset_sent:
        "Te mandamos un email para restablecer la contraseña",
      record_not_found: "No se encontró el registro",
      title: "Perfil",
      updated: "Tu perfil se actualizó",
      update_error: "Hubo un error. Probá de nuevo",
    },
    validation: {
      invalid_url: "Tiene que ser una URL válida",
      invalid_linkedin_url: "La URL tiene que ser de linkedin.com",
    },
  },
} satisfies CrmMessages;
