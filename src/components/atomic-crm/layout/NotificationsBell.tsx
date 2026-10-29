import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import {
  useDataProvider,
  useGetIdentity,
  useGetList,
  useLocaleState,
  useNotify,
  useTranslate,
} from "ra-core";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { Notification } from "../types";

const RESOURCE = "notifications";
const SHOWN = 20;
// The digest writes once a day: checking every 5 minutes is plenty
const REFRESH_MS = 5 * 60 * 1000;

/** The bell: the latest notifications of the signed-in user. */
export const NotificationsBell = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const [locale = "es"] = useLocaleState();
  const navigate = useNavigate();
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useGetList<Notification>(
    RESOURCE,
    {
      pagination: { page: 1, perPage: SHOWN },
      sort: { field: "created_at", order: "DESC" },
      filter: { sales_id: identity?.id },
    },
    { enabled: identity?.id != null, refetchInterval: REFRESH_MS },
  );
  const unread = notifications.filter((item) => !item.read_at);

  const markRead = async (items: Notification[]) => {
    if (!items.length) return;
    try {
      await dataProvider.updateMany(RESOURCE, {
        ids: items.map((item) => item.id),
        data: { read_at: new Date().toISOString() },
      });
    } catch {
      notify("crm.notifications.error", { type: "error" });
    } finally {
      await queryClient.invalidateQueries({ queryKey: [RESOURCE] });
    }
  };

  const openNotification = async (item: Notification) => {
    setOpen(false);
    if (!item.read_at) await markRead([item]);
    if (item.link) navigate(item.link);
  };

  const label = translate("crm.notifications.title");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unread.length
              ? translate("crm.notifications.unread", {
                  smart_count: unread.length,
                })
              : label
          }
        >
          <Bell className="size-5" />
          {unread.length ? (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-white">
              {unread.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-sm font-semibold">{label}</span>
          {unread.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markRead(unread)}
            >
              {translate("crm.notifications.mark_all_read")}
            </Button>
          ) : null}
        </div>
        {notifications.length ? (
          <ul className="max-h-[60vh] divide-y overflow-y-auto">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-muted"
                  onClick={() => openNotification(item)}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {!item.read_at ? (
                      <span
                        className="size-2 shrink-0 rounded-full bg-primary"
                        aria-label={translate("crm.notifications.new")}
                      />
                    ) : null}
                    {item.title}
                  </span>
                  {item.body ? (
                    <span className="line-clamp-6 whitespace-pre-line text-xs text-muted-foreground">
                      {item.body}
                    </span>
                  ) : null}
                  <span className="text-[11px] text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.created_at))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            {translate("crm.notifications.empty")}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};
