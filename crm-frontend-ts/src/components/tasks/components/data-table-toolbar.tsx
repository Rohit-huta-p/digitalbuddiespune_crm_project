/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "../components/data-table-view-options";
import { statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { IconCheck } from "@tabler/icons-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const handleUpdateTasks = async (row: any) => {
    if (row.length === 0) {
      return;
    }

    // TODO: Fix this
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={
            (table.getColumn("taskName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("taskName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2">
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
        {table.getSelectedRowModel().rows.length > 0 ? (
          <Button
            onClick={() =>
              table
                .getSelectedRowModel()
                .rows.map((row) =>
                  handleUpdateTasks(row.original).then(() =>
                    table.resetRowSelection()
                  )
                )
            }
            className="space-x-1 rounded-md bg-green-500/25 text-green-500 hover:bg-green-500/45 border border-dashed border-green-500/45 transition-all font-bold"
          >
            Complete Selected <IconCheck size={14} />
          </Button>
        ) : (
          <Button
            disabled
            className="space-x-1 opacity-25 !cursor-not-allowed rounded-md bg-green-500/25 text-green-500 hover:bg-green-500/45 border border-dashed border-green-500/45 transition-all font-bold"
          >
            Complete Selected <IconCheck size={14} />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
