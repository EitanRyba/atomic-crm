// Domain configuration for selling and implementing Humand.
// Values are stable identifiers stored in the database; labels are what the
// user sees (Spanish, the language this CRM is used in).
// The "won", "postponed" and "lost" values are relied upon by the code
// (dashboard charts, Kanban dialogs, database constraints): keep them.

import type { DealStage, DealStageTag } from "@/components/atomic-crm/types";

export const humandDealStages: DealStage[] = [
  {
    value: "first-contact",
    label: "Primer contacto",
    humandStage: "Prospección",
    description:
      "Antes del pipeline de Humand: primer mensaje o llamada a la empresa, todavía sin respuesta o sin reunión.",
  },
  {
    value: "lead",
    label: "Lead",
    humandStage: "Lead",
    description:
      "La empresa respondió y hay interés en conocer Humand. Se busca agendar la primera reunión.",
  },
  {
    value: "early-stage",
    label: "Early stage",
    humandStage: "Early Stage",
    description:
      "Hubo una primera reunión, pero sin interés explícito, con implementación a más de 6 meses o con una reunión corta.",
  },
  {
    value: "discovery",
    label: "Coordinación · Discovery",
    humandStage: "Discovery",
    description:
      "Se entienden los dolores, procesos y herramientas actuales de la empresa y se identifica a quiénes deciden.",
  },
  {
    value: "champion",
    label: "2da call · Champion",
    humandStage: "Champion Engaged",
    description:
      "Hay una persona interna que impulsa el proyecto (champion) y participa de la segunda reunión.",
  },
  {
    value: "decision-maker",
    label: "3ra call · Decision maker",
    humandStage: "Decision Maker Engaged",
    description:
      "Participa quien toma la decisión final. Puede incluir llamadas técnicas con IT o a Compras.",
  },
  {
    value: "negotiation",
    label: "Negociación",
    humandStage: "Decision Maker Engaged",
    description:
      "Se trabaja el business case, la urgencia y el precio con quien decide. Todavía no se envió el contrato.",
  },
  {
    value: "pilot",
    label: "Piloto",
    humandStage: "Pilot",
    description:
      "Camino opcional: se hizo el kick-off del piloto y la implementación arranca antes de firmar. El contrato aún no se envió.",
  },
  {
    value: "agreement",
    label: "Acuerdo / contrato",
    humandStage: "Final Negotiation",
    description:
      "Empieza cuando se envía el contrato: revisión legal, descuentos, condiciones de pago y facturación.",
  },
  {
    value: "won",
    label: "Ganado",
    humandStage: "Won",
    description:
      "El contrato se firmó o llegó el primer pago. La implementación puede haber empezado antes (piloto) o empezar ahora.",
  },
  {
    value: "postponed",
    label: "Pospuesto",
    humandStage: "Postponed",
    description:
      "La empresa pidió retomar más adelante. Se registra la fecha para volver a contactarla y el motivo.",
  },
  {
    value: "lost",
    label: "Perdido",
    humandStage: "Lost",
    description:
      "Dijo que no explícitamente, o no respondió a 5-7 seguimientos a lo largo de al menos 3 meses.",
  },
];

// Stages listed here are left out of the dashboard "pipeline" widget,
// which only shows deals still in play.
export const humandDealPipelineStatuses = ["won", "postponed", "lost"];

const tag = (
  stage: string,
  value: string,
  label: string,
  color: string,
): DealStageTag => ({ stage, value, label, color });

// Tags a deal can carry while it sits in a stage ("post-its"). They are
// removed (kept in the history) when the deal changes stage.
export const humandDealStageTags: DealStageTag[] = [
  tag("first-contact", "no-response", "Sin respuesta", "#f2c6c2"),
  tag("first-contact", "replied", "Respondió", "#c6e8c2"),
  tag("lead", "first-meeting-scheduled", "1ra reunión agendada", "#c6dcf2"),
  tag("lead", "no-show", "No se presentó", "#f2c6c2"),
  tag("lead", "no-fit", "No fit", "#e0d4c4"),
  tag("early-stage", "implements-6m", "Implementa en +6 meses", "#f2e3b3"),
  tag(
    "early-stage",
    "no-explicit-interest",
    "Sin interés explícito",
    "#e0d4c4",
  ),
  tag("early-stage", "short-meeting", "Reunión de menos de 30 min", "#f2d8b3"),
  tag("early-stage", "reactivate-later", "Reactivar más adelante", "#d9cdf2"),
  tag("discovery", "pain-identified", "Dolor identificado", "#c6e8c2"),
  tag("discovery", "missing-decision-makers", "Faltan decisores", "#f2d8b3"),
  tag(
    "champion",
    "second-meeting-scheduled",
    "2da reunión agendada",
    "#c6dcf2",
  ),
  tag(
    "champion",
    "second-meeting-pending",
    "2da reunión sin agendar",
    "#f2d8b3",
  ),
  tag("champion", "proposal-sent", "Propuesta enviada", "#d9cdf2"),
  tag(
    "decision-maker",
    "third-meeting-scheduled",
    "3ra reunión agendada",
    "#c6dcf2",
  ),
  tag("decision-maker", "third-meeting-pending", "Sin agendar", "#f2d8b3"),
  tag("decision-maker", "it-technical-call", "Call técnica con IT", "#d9cdf2"),
  tag(
    "decision-maker",
    "procurement-involved",
    "Compras involucrado",
    "#f2e3b3",
  ),
  tag("negotiation", "business-case-sent", "Business case enviado", "#c6dcf2"),
  tag("negotiation", "price-discussion", "Precio en discusión", "#f2d8b3"),
  tag("negotiation", "urgency-defined", "Urgencia definida", "#c6e8c2"),
  tag("pilot", "kickoff-done", "Kick-off hecho", "#c6e8c2"),
  tag("pilot", "contract-not-sent", "Contrato sin enviar", "#f2d8b3"),
  tag("agreement", "legal-review", "En revisión legal", "#d9cdf2"),
  tag("agreement", "discount-discussion", "Descuento en discusión", "#f2d8b3"),
  tag(
    "agreement",
    "payment-terms-discussion",
    "Condiciones de pago en discusión",
    "#f2e3b3",
  ),
  tag("agreement", "billing-in-progress", "Facturación en curso", "#c6dcf2"),
  tag("won", "payment-pending", "Pendiente de pago", "#f2d8b3"),
  tag("won", "invoiced", "Facturado", "#c6dcf2"),
  tag("won", "first-payment-received", "Primer pago recibido", "#c6e8c2"),
  tag(
    "won",
    "implementation-not-started",
    "Implementación no iniciada",
    "#f2c6c2",
  ),
  tag("won", "kickoff-done", "Kick-off hecho", "#d9cdf2"),
  tag(
    "won",
    "implementation-in-progress",
    "Implementación en curso",
    "#f2e3b3",
  ),
];

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
