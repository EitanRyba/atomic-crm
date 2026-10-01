// Domain configuration for selling and implementing Humand.
// Values are stable identifiers stored in the database; labels are what the
// user sees (Spanish, the language this CRM is used in).
// "won" and "lost" values are kept because the dashboard charts rely on them.

export const humandDealStages = [
  { value: "identified", label: "Prospecto identificado" },
  { value: "first-contact", label: "Primer contacto" },
  { value: "meeting-scheduled", label: "Reunión agendada" },
  { value: "demo-done", label: "Demo realizada" },
  { value: "proposal-sent", label: "Propuesta enviada" },
  { value: "in-negociation", label: "Negociación" },
  { value: "won", label: "Ganado" },
  { value: "implementation", label: "En implementación" },
  { value: "lost", label: "Perdido" },
];

// Stages listed here are left out of the dashboard "pipeline" widget,
// which only shows deals still in play.
export const humandDealPipelineStatuses = ["won", "implementation"];

export const humandDealCategories = [
  { value: "russell-bedford", label: "Russell Bedford" },
  { value: "referral", label: "Referido" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "event", label: "Evento" },
  { value: "inbound", label: "Inbound" },
  { value: "other", label: "Otro" },
];

export const humandTaskTypes = [
  { value: "none", label: "Ninguno" },
  { value: "call", label: "Llamada" },
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "meeting", label: "Reunión" },
  { value: "demo", label: "Demo" },
  { value: "follow-up", label: "Seguimiento" },
];

export const humandNoteStatuses = [
  { value: "cold", label: "Frío", color: "#7dbde8" },
  { value: "warm", label: "Tibio", color: "#e8cb7d" },
  { value: "hot", label: "Caliente", color: "#e88b7d" },
  { value: "in-contract", label: "Cliente", color: "#a4e87d" },
];

export const humandCompanySectors = [
  { value: "accounting-audit", label: "Contabilidad y auditoría" },
  { value: "professional-services", label: "Servicios profesionales" },
  { value: "retail", label: "Retail y consumo masivo" },
  { value: "manufacturing", label: "Industria y manufactura" },
  { value: "logistics", label: "Logística y transporte" },
  { value: "health-care", label: "Salud" },
  { value: "hospitality", label: "Gastronomía y hotelería" },
  { value: "financials", label: "Banca y finanzas" },
  { value: "information-technology", label: "Tecnología" },
  { value: "education", label: "Educación" },
  { value: "energy", label: "Energía y minería" },
  { value: "construction", label: "Construcción e inmobiliario" },
  { value: "public-sector", label: "Sector público" },
  { value: "other", label: "Otro" },
];
