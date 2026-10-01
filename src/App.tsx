import { CRM } from "@/components/atomic-crm/root/CRM";
import {
  humandCompanySectors,
  humandDealCategories,
  humandDealPipelineStatuses,
  humandDealStages,
  humandNoteStatuses,
  humandTaskTypes,
} from "./humandConfiguration";

/**
 * Application entry point
 *
 * Customize Atomic CRM by passing props to the CRM component:
 *  - companySectors
 *  - darkTheme
 *  - dealCategories
 *  - dealPipelineStatuses
 *  - dealStages
 *  - lightTheme
 *  - darkModeLogo / lightModeLogo
 *  - noteStatuses
 *  - taskTypes
 *  - title
 * ... as well as all the props accepted by shadcn-admin-kit's <Admin> component.
 *
 * Logos must be an imported asset, an absolute URL, or a data URI — never a
 * route-relative path like "./img/logo.png", which breaks on nested routes.
 *
 * This instance is configured for selling and implementing Humand
 * (see ./humandConfiguration.ts). Labels can also be edited later from the
 * in-app Settings page, which stores them in the database.
 */
const App = () => (
  <CRM
    title="Humand CRM"
    currency="USD"
    companySectors={humandCompanySectors}
    dealCategories={humandDealCategories}
    dealPipelineStatuses={humandDealPipelineStatuses}
    dealStages={humandDealStages}
    noteStatuses={humandNoteStatuses}
    taskTypes={humandTaskTypes}
  />
);

export default App;
