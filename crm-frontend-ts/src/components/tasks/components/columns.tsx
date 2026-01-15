import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import dayjs from "dayjs";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        disabled={row.getValue("status") === "closed"}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "assignedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned By" />
    ),
    cell: ({ row }) => (
      <div
        className="w-[80px]"
        style={{
          textDecoration:
            row.getValue("status") === "closed" ? "line-through" : "none",
          opacity: row.getValue("status") === "closed" ? 0.5 : 1,
        }}
      >
        {row.getValue("assignedBy") == 1 ? "Admin" : "HR"}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "taskName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          {/* {label && <Badge variant="outline">{label.label}</Badge>} */}
          <span
            className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]"
            style={{
              textDecoration:
                row.getValue("status") === "closed" ? "line-through" : "none",
              opacity: row.getValue("status") === "closed" ? 0.5 : 1,
            }}
          >
            {row.getValue("taskName")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="flex w-[100px] items-center"
          style={{
            textDecoration:
              row.getValue("status") === "closed" ? "line-through" : "none",
            opacity: row.getValue("status") === "closed" ? 0.5 : 1,
          }}
        >
          <Badge
            variant="secondary"
            className={
              (row.getValue("status") as string) == "open"
                ? "text-green-500 text-md"
                : (row.getValue("status") as string) == "pending"
                ? "text-blue-500 text-md"
                : "text-red-500 text-md"
            }
          >
            {(row.getValue("status") as string).charAt(0).toUpperCase() +
              (row.getValue("status") as string).slice(1)}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue("status"));
    },
  },
  {
    accessorKey: "assignedTimestamp",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Assigned At"
        className="w-[120px]"
      />
    ),
    cell: ({ row }) => {
      const assignedAt = row.getValue("assignedTimestamp");
      if (
        !assignedAt ||
        typeof assignedAt !== "string" ||
        assignedAt.length === 0
      ) {
        return null;
      }

      const date = dayjs(assignedAt);
      if (!date.isValid()) {
        return null;
      }

      return (
        <div
          className="text-sm"
          style={{
            textDecoration:
              row.getValue("status") === "closed" ? "line-through" : "none",
            opacity: row.getValue("status") === "closed" ? 0.5 : 1,
          }}
        >
          {date.format("DD/MM/YYYY HH:mm")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "deadlineTimestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => {
      const deadline = row.getValue("deadlineTimestamp");
      if (!deadline || typeof deadline !== "string" || deadline.length === 0) {
        return null;
      }

      const date = dayjs(deadline);
      const now = dayjs();
      const difference = date.diff(now);

      if (difference < 0) {
        return (
          <div
            style={{
              textDecoration:
                row.getValue("status") === "closed" ? "line-through" : "none",
              opacity: row.getValue("status") === "closed" ? 0.5 : 1,
            }}
          >
            Expired
          </div>
        );
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(difference / (1000 * 60 * 60)) % 24;
      const minutes = Math.floor(difference / (1000 * 60)) % 60;

      if (days > 0) {
        return (
          <div
            style={{
              textDecoration:
                row.getValue("status") === "closed" ? "line-through" : "none",
              opacity: row.getValue("status") === "closed" ? 0.5 : 1,
            }}
          >
            {days}d {hours}h {minutes}m remaining
          </div>
        );
      } else if (hours > 0) {
        return (
          <div
            style={{
              textDecoration:
                row.getValue("status") === "closed" ? "line-through" : "none",
              opacity: row.getValue("status") === "closed" ? 0.5 : 1,
            }}
          >
            {hours}h {minutes}m remaining
          </div>
        );
      } else {
        return (
          <div
            style={{
              textDecoration:
                row.getValue("status") === "closed" ? "line-through" : "none",
              opacity: row.getValue("status") === "closed" ? 0.5 : 1,
            }}
          >
            {minutes}m remaining
          </div>
        );
      }
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
