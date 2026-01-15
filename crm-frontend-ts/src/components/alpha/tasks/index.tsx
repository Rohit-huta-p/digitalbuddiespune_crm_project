"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns, Task } from "./columns";
import { TableFilters } from "./filters";

export default function TaskTable({
  tasks,
  itemsPerPage,
  loading,
  columns,
  noSearch = false,
  noFilters = false,
  noCompleteButton = false,
  fetchTasks,
}: {
  tasks: Task[];
  itemsPerPage?: number;
  loading?: boolean;
  columns?: any;
  noSearch?: boolean;
  noFilters?: boolean;
  noCompleteButton?: boolean;
  fetchTasks?: () => void;
}) {
  const isLoading = !!loading;

  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => (!statusFilter || t.status === statusFilter) && (!priorityFilter || t.priority === priorityFilter));
  }, [tasks, statusFilter, priorityFilter]);

  const table = useReactTable({
    data: filteredTasks,
    columns: columns || getColumns(),
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
    initialState: {
      pagination: {
        pageSize: itemsPerPage || 10,
      },
    },
  });

  // Derive counts for skeletons
  const pageSize = table.getState().pagination.pageSize;
  const columnsCount = (columns?.length as number | undefined) ?? getColumns().length;

  return (
    <div className="space-y-4 mt-5" aria-busy={isLoading}>
      <div className="flex flex-col items-start md:flex-row md:items-center gap-5 justify-between">
        {!noSearch && (
          <Input
            placeholder={isLoading ? "Loading..." : "Search tasks..."}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
            disabled={isLoading}
          />
        )}

        <div className={isLoading ? "pointer-events-none opacity-60" : ""}>
          <TableFilters
            noFilters={noFilters}
            fetchTasks={fetchTasks}
            noCompleteButton={noCompleteButton}
            selectedTasks={table.getSelectedRowModel().rows.map((row) => row.original)}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            setStatusFilter={setStatusFilter}
            setPriorityFilter={setPriorityFilter}
            table={table}
            resetFilters={() => {
              setStatusFilter(null);
              setPriorityFilter(null);
            }}
            selectedCount={table.getSelectedRowModel().rows.length}
          />
        </div>
      </div>

      <div className={isLoading ? "rounded-md border border-zinc-800" : ""}>
        <Table className="border rounded-md border-zinc-800">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : (header.column.columnDef.header as React.ReactNode)}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Skeleton rows while loading
              Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: columnsCount }).map((__, j) => (
                    <TableCell key={`skeleton-cell-${i}-${j}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {typeof cell.column.columnDef.cell === "function" ? cell.column.columnDef.cell(cell.getContext()) : cell.column.columnDef.cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="text-center">
                  No tasks available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              {table.getPageCount() > 1 && (
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground inline-flex items-center gap-2">
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage() || isLoading}
                        className="disabled:opacity-50"
                        aria-label="Previous page"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || isLoading}
                        className="disabled:opacity-50"
                        aria-label="Next page"
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  </div>
                </TableCell>
              )}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
