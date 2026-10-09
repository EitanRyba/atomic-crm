import { Info } from "lucide-react";
import { useTranslate } from "ra-core";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Explains what the "Por definir" system company is for, on the pages where
 * it replaces the usual company actions.
 */
export const PlaceholderCompanyNotice = ({
  className,
}: {
  className?: string;
}) => {
  const translate = useTranslate();
  return (
    <Alert className={className}>
      <Info />
      <AlertDescription>
        {translate("resources.companies.placeholder.notice")}
      </AlertDescription>
    </Alert>
  );
};
