import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

export type Task = {
  id: number;
  taskName: string;
  description: string;
  status: string;
  priority: string | null;
  assignedBy: number;
  assignedToEmployeeId: number[];
  deadlineTimestamp: string;
};

const columnHelper = createColumnHelper<Task>();

export const getColumns = () => [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
        }
        onCheckedChange={() => table.toggleAllPageRowsSelected()}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        aria-label="Select row"
        className="ml-1"
      />
    ),
    meta: { className: "w-12" },
  }),

  columnHelper.accessor("taskName", {
    header: "Task Name",
    cell: (info) => info.getValue(),
    meta: { className: "min-w-[150px]" },
  }),

  columnHelper.accessor("deadlineTimestamp", {
    header: "Deadline",
    cell: (info) => {
      const date = new Date(info.getValue());
      const today = new Date().setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const day = date.toLocaleString("default", { day: "numeric" });
      const month = date.toLocaleString("default", { month: "long" });
      const time = date.toLocaleString("default", {
        hour: "numeric",
        minute: "2-digit",
      });

      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(tomorrow);
      tomorrowStart.setHours(0, 0, 0, 0);

      const isToday = dateStart.getTime() === todayStart.getTime();
      const isTomorrow = dateStart.getTime() === tomorrowStart.getTime();

      return (
        <div className="text-sm whitespace-nowrap">
          {isToday ? "Today" : isTomorrow ? "Tomorrow" : `${day} ${month}`}{" "}
          <span className="p-1 border-[1.5px] rounded-md bg-zinc-900">
            {time}
          </span>
        </div>
      );
    },
  }),

  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
    meta: { className: "table-cell" },
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status: "open" | "pending" | "closed" = info.getValue() as
        | "open"
        | "pending"
        | "closed";
      return (
        <div
          className={`px-2 py-1 rounded-full text-sm font-medium text-center ${
            status === "open"
              ? "bg-blue-900/25 text-blue-300 border border-blue-900"
              : status === "pending"
              ? "bg-yellow-900/25 text-yellow-300 border border-yellow-900"
              : "bg-green-900/25 text-green-300 border border-green-900"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    },
  }),

  columnHelper.accessor("priority", {
    header: "Priority",
    cell: (info) => {
      const priority = info.getValue() ?? ("-" as "high" | "medium" | "low");
      return (
        <div
          className={`px-2 py-1 rounded-full text-sm font-medium text-center ${
            priority === "high"
              ? "bg-red-900/25 text-red-500 font-bold border border-red-900"
              : priority === "medium"
              ? "bg-yellow-900/25 text-yellow-300 border border-yellow-900"
              : "bg-green-900/25 text-green-300 border border-green-900"
          }`}
        >
          {priority === "-"
            ? "-"
            : priority.charAt(0).toUpperCase() + priority.slice(1)}
        </div>
      );
    },
  }),

  columnHelper.accessor("assignedBy", {
    header: "By",
    cell: (info) =>
      (info.getValue() as number) === 1
        ? "Admin"
        : (info.getValue() as number) === 2
        ? "HR"
        : "Project Lead",
    meta: { className: "table-cell w-20" },
  }),

  columnHelper.display({
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Task actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => console.log("Edit", row.original)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => console.log("Delete", row.original)}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { className: "w-20 text-center" },
  }),
];
