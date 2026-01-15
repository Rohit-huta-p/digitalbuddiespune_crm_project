"use client";

import React, { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  List,
  MoreHorizontal,
  Edit,
  Trash,
  Shuffle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Custom type definition
type Task = {
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

export default function MainTable({
  tasks,
  loading,
}: {
  tasks: Task[];
  loading: boolean;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (statusFilter)
      filtered = filtered.filter((task) => task.status === statusFilter);
    if (priorityFilter)
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    return filtered;
  }, [tasks, statusFilter, priorityFilter]);

  const columns = useMemo(
    () => [
      // ======== SELECT COLUMN (always visible) ========
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          /*================== UI HERE ================*/
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
          const priority =
            info.getValue() ?? ("-" as "high" | "medium" | "low");
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

      // ======== ACTIONS COLUMN (always visible) ========
      columnHelper.display({
        id: "actions",
        header: () => "Actions",
        cell: ({ row }) => (
          /*================== UI HERE ================*/
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Task actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => console.log("Edit task:", row.original)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 hover:text-red-600 cursor-pointer"
                onClick={() => console.log("Delete task:", row.original)}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        meta: { className: "w-20 text-center" },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: { globalFilter, columnVisibility, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableMultiRowSelection: true,
    getRowId: (row) => row.id.toString(),
  });

  const selectedTasks = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <div className="space-y-4 rounded-md">
      <div className="flex flex-wrap justify-between gap-2 items-center">
        <Input
          placeholder="Search all tasks..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="flex-1 min-w-[200px] max-w-sm"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Shuffle className="mr-1 h-4 w-4" /> Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              {["open", "pending", "closed"].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter === status}
                  onCheckedChange={() =>
                    setStatusFilter((prev) => (prev === status ? null : status))
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-1 h-4 w-4" /> Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
              {["high", "medium", "low"].map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={priorityFilter === priority}
                  onCheckedChange={() =>
                    setPriorityFilter((prev) =>
                      prev === priority ? null : priority
                    )
                  }
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setStatusFilter(null);
              setPriorityFilter(null);
            }}
          >
            Reset Filters
          </Button>

          <Button variant="outline" size="sm" disabled={!selectedTasks.length}>
            Action on {selectedTasks.length} selected
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <List size={18} className="mr-1" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((col) => !["select", "actions"].includes(col.id))
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={() =>
                      col.toggleVisibility(!col.getIsVisible())
                    }
                  >
                    {flexRender(col.columnDef.header, { column: col } as any)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/*================== UI HERE ================*/}
        <Table className="min-w-full border-2 rounded-md border-zinc-800">
          <TableHeader className="rounded-t-md">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={(header.column.columnDef.meta as any)?.className}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-accent p-1 rounded-md transition-colors hover:text-primary select-none">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() &&
                        !header.column.getIsSorted() && (
                          <Shuffle className="size-3" />
                        )}
                      {header.column.getIsSorted() === "asc" && (
                        <span>
                          <ChevronDown className="size-4" />
                        </span>
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <span>
                          <ChevronUp className="size-4" />
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/*================== UI HERE ================*/}
          <TableBody className="rounded-b-md">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.getIsSelected() ? "bg-muted" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as any)?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  No tasks available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {/*================== UI HERE ================*/}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length}>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft />
                    </Button>
                    <span className="text-sm">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
