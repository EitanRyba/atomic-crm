import { useMemo } from "react";
import {
  type Identifier,
  useGetIdentity,
  useGetList,
  useTimeout,
  useTranslate,
} from "ra-core";
import { useIsMobile } from "@/hooks/use-mobile";

import { TaskListFilter } from "./TasksListFilter";
import {
  isBeforeFriday,
  isDone,
  isDueLater,
  isDueThisWeek,
  isDueToday,
  isDueTomorrow,
  isOverdue,
  isRecentlyDone,
} from "./tasksPredicate";

export const TasksListByDueDate = ({
  filterByDeal,
  emptyPlaceholder,
  pendingPlaceholder,
}: {
  filterByDeal?: Identifier;
  emptyPlaceholder?: React.ReactNode;
  pendingPlaceholder?: React.ReactNode;
}) => {
  const { identity } = useGetIdentity();
  const isMobile = useIsMobile();
  const translate = useTranslate();

  const { data: tasks, isPending } = useGetList(
    "tasks",
    {
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "due_date", order: "ASC" },
      filter: {
        ...(filterByDeal != null
          ? { deal_id: filterByDeal }
          : { sales_id: identity?.id }),
      },
    },
    { enabled: filterByDeal != null ? true : !!identity },
  );

  const showDeal = filterByDeal == null;

  const ongoingTasks = useMemo(
    () => tasks?.filter((task) => !isDone(task) || isRecentlyDone(task)) || [],
    [tasks],
  );

  const overdueTasks = useMemo(
    () =>
      ongoingTasks?.filter((task) => {
        return isOverdue(task.due_date);
      }) || [],
    [ongoingTasks],
  );

  const dueTodayTasks = useMemo(
    () =>
      ongoingTasks?.filter((task) => {
        return isDueToday(task.due_date);
      }) || [],
    [ongoingTasks],
  );

  const dueTomorrowTasks = useMemo(
    () => ongoingTasks?.filter((task) => isDueTomorrow(task.due_date)) || [],
    [ongoingTasks],
  );

  const dueThisWeekTasks = useMemo(
    () => ongoingTasks?.filter((task) => isDueThisWeek(task.due_date)) || [],
    [ongoingTasks],
  );

  const dueLaterTasks = useMemo(
    () => ongoingTasks?.filter((task) => isDueLater(task.due_date)) || [],
    [ongoingTasks],
  );

  const oneSecondHasPassed = useTimeout(1000);

  if (isPending && oneSecondHasPassed) {
    return pendingPlaceholder ?? null;
  }

  if (isPending) {
    return null;
  }

  if (!ongoingTasks.length) {
    return emptyPlaceholder ?? null;
  }

  return (
    <div className="flex flex-col gap-4">
      <TaskListFilter
        tasks={overdueTasks}
        title={translate("resources.tasks.filters.overdue")}
        showDeal={showDeal}
        isMobile={isMobile}
      />
      <TaskListFilter
        tasks={dueTodayTasks}
        title={translate("resources.tasks.filters.today")}
        showDeal={showDeal}
        isMobile={isMobile}
      />
      <TaskListFilter
        tasks={dueTomorrowTasks}
        title={translate("resources.tasks.filters.tomorrow")}
        showDeal={showDeal}
        isMobile={isMobile}
      />
      {(!filterByDeal || (filterByDeal && isBeforeFriday())) && (
        <TaskListFilter
          tasks={dueThisWeekTasks}
          title={translate("resources.tasks.filters.this_week")}
          showDeal={showDeal}
          isMobile={isMobile}
        />
      )}
      <TaskListFilter
        tasks={dueLaterTasks}
        title={translate("resources.tasks.filters.later")}
        showDeal={showDeal}
        isMobile={isMobile}
      />
    </div>
  );
};
