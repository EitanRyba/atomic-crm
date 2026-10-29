// Texts of the digest notifications and emails. The CRM is used in Spanish;
// set DIGEST_LOCALE=en for English.
const catalogs = {
  es: {
    dailySubject: "Tu día en Humand CRM",
    weeklySubject: "Tu semana en Humand CRM",
    greeting: (name: string) => `Hola ${name},`,
    overdueTasks: "Tareas atrasadas",
    todayTasks: "Tareas de hoy",
    weekTasks: "Tareas de la semana",
    resumedDeals: "Oportunidades pospuestas que volvieron a Discovery",
    staleTags: "Reuniones sin agendar hace más de 7 días",
    pendingSubcommissions: "Subcomisiones de meses pasados pendientes de pago",
    months: (count: number) => (count === 1 ? "1 mes" : `${count} meses`),
    resumedTitle: (deal: string) => `"${deal}" volvió a Discovery`,
    resumedBody: (date: string) =>
      `Estaba pospuesta hasta el ${date}. Es momento de retomar el contacto.`,
    digestTitle: (count: number) =>
      count === 1 ? "1 cosa para revisar" : `${count} cosas para revisar`,
    openCrm: "Abrir el CRM",
    footer: "Recibís este resumen porque tenés una cuenta en Humand CRM.",
  },
  en: {
    dailySubject: "Your day in Humand CRM",
    weeklySubject: "Your week in Humand CRM",
    greeting: (name: string) => `Hi ${name},`,
    overdueTasks: "Overdue tasks",
    todayTasks: "Today's tasks",
    weekTasks: "This week's tasks",
    resumedDeals: "Postponed deals back in Discovery",
    staleTags: "Meetings not scheduled for more than 7 days",
    pendingSubcommissions: "Unpaid sub-commissions of past months",
    months: (count: number) => (count === 1 ? "1 month" : `${count} months`),
    resumedTitle: (deal: string) => `"${deal}" is back in Discovery`,
    resumedBody: (date: string) =>
      `It was postponed until ${date}. Time to get back in touch.`,
    digestTitle: (count: number) =>
      count === 1 ? "1 thing to review" : `${count} things to review`,
    openCrm: "Open the CRM",
    footer: "You get this digest because you have a Humand CRM account.",
  },
};

export type Messages = (typeof catalogs)["es"];

export const getMessages = (): Messages =>
  Deno.env.get("DIGEST_LOCALE") === "en" ? catalogs.en : catalogs.es;
