import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { useDataProvider, useNotify, useTranslate } from "ra-core";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { CrmDataProvider } from "../providers/types";

const STATUS_KEY = ["googleCalendarStatus"];

/**
 * Profile: connect or disconnect the user's Google Calendar. Once connected,
 * their tasks with a due date become calendar events.
 */
export const GoogleCalendarCard = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: status, isPending } = useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => dataProvider.googleCalendarStatus(),
  });

  // Back from Google: tell how it went, once
  const result = searchParams.get("google_calendar");
  useEffect(() => {
    if (!result) return;
    notify(
      result === "connected"
        ? "crm.profile.google_calendar.connected_notice"
        : "crm.profile.google_calendar.error",
      { type: result === "connected" ? "success" : "error" },
    );
    const next = new URLSearchParams(searchParams);
    next.delete("google_calendar");
    setSearchParams(next, { replace: true });
    queryClient.invalidateQueries({ queryKey: STATUS_KEY });
  }, [result, notify, queryClient, searchParams, setSearchParams]);

  const connect = useMutation({
    mutationFn: () =>
      dataProvider.googleCalendarConnect(
        `${window.location.origin}${window.location.pathname}`,
      ),
    onSuccess: (url) => {
      window.location.assign(url);
    },
    onError: () =>
      notify("crm.profile.google_calendar.error", { type: "error" }),
  });

  const disconnect = useMutation({
    mutationFn: () => dataProvider.googleCalendarDisconnect(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STATUS_KEY }),
    onError: () =>
      notify("crm.profile.google_calendar.error", { type: "error" }),
  });

  return (
    <Card>
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          {translate("crm.profile.google_calendar.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translate("crm.profile.google_calendar.description")}
        </p>
        {isPending ? null : status?.connected ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm">
              <CalendarCheck className="size-4 text-green-600" />
              {translate("crm.profile.google_calendar.connected_as", {
                email: status.google_email ?? "",
              })}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={disconnect.isPending}
              onClick={() => disconnect.mutate()}
            >
              {translate("crm.profile.google_calendar.disconnect")}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            disabled={connect.isPending}
            onClick={() => connect.mutate()}
          >
            {translate("crm.profile.google_calendar.connect")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
