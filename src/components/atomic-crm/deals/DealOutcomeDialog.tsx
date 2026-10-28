import { useTranslate } from "ra-core";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { Deal } from "../types";
import {
  LOST_REASONS,
  LOST_STAGE,
  defaultPostponedUntil,
  lostReasonKey,
  todayAsDateValue,
} from "./dealOutcome";

export type DealOutcomeStage = "lost" | "postponed";

export type DealOutcomeData = Pick<
  Deal,
  "lost_reason" | "lost_reason_detail" | "postponed_until" | "postponed_reason"
>;

interface DealOutcomeDialogProps {
  stage: DealOutcomeStage;
  dealName: string;
  onConfirm: (data: DealOutcomeData) => void;
  onCancel: () => void;
}

/**
 * Asks why a deal is lost, or until when it is postponed, before moving it to
 * the "Perdido" or "Pospuesto" column.
 */
export const DealOutcomeDialog = ({
  stage,
  dealName,
  onConfirm,
  onCancel,
}: DealOutcomeDialogProps) => {
  const translate = useTranslate();
  const isLost = stage === LOST_STAGE;
  const [lostReason, setLostReason] = useState("");
  const [detail, setDetail] = useState("");
  const [postponedUntil, setPostponedUntil] = useState(defaultPostponedUntil);
  const [postponedReason, setPostponedReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isLost) {
      if (!lostReason) {
        setError("resources.deals.outcome.lost_reason_required");
        return;
      }
      onConfirm({
        lost_reason: lostReason,
        lost_reason_detail: detail.trim() || null,
      });
      return;
    }
    if (!postponedUntil || postponedUntil <= todayAsDateValue()) {
      setError("resources.deals.outcome.postponed_until_future");
      return;
    }
    if (!postponedReason.trim()) {
      setError("resources.deals.outcome.postponed_reason_required");
      return;
    }
    onConfirm({
      postponed_until: postponedUntil,
      postponed_reason: postponedReason.trim(),
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        {/* noValidate: show our translated errors instead of the browser's */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>
              {translate(
                isLost
                  ? "resources.deals.outcome.lost_title"
                  : "resources.deals.outcome.postponed_title",
                { name: dealName },
              )}
            </DialogTitle>
            <DialogDescription>
              {translate(
                isLost
                  ? "resources.deals.outcome.lost_help"
                  : "resources.deals.outcome.postponed_help",
              )}
            </DialogDescription>
          </DialogHeader>

          {isLost ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lost_reason">
                  {translate("resources.deals.fields.lost_reason")}
                </Label>
                <Select
                  value={lostReason}
                  onValueChange={(value) => {
                    setLostReason(value);
                    setError(null);
                  }}
                >
                  <SelectTrigger id="lost_reason" className="w-full">
                    <SelectValue
                      placeholder={translate(
                        "resources.deals.outcome.choose_reason",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {LOST_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {translate(lostReasonKey(reason))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lost_reason_detail">
                  {translate("resources.deals.fields.lost_reason_detail")}
                </Label>
                <Textarea
                  id="lost_reason_detail"
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="postponed_until">
                  {translate("resources.deals.fields.postponed_until")}
                </Label>
                <Input
                  id="postponed_until"
                  type="date"
                  min={todayAsDateValue()}
                  value={postponedUntil}
                  onChange={(event) => {
                    setPostponedUntil(event.target.value);
                    setError(null);
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="postponed_reason">
                  {translate("resources.deals.fields.postponed_reason")}
                </Label>
                <Textarea
                  id="postponed_reason"
                  value={postponedReason}
                  onChange={(event) => {
                    setPostponedReason(event.target.value);
                    setError(null);
                  }}
                  rows={3}
                />
              </div>
            </>
          )}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {translate(error)}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              {translate("ra.action.cancel")}
            </Button>
            <Button type="submit">
              {translate("resources.deals.outcome.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
