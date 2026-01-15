import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, List, Shuffle } from "lucide-react";
import { Table } from "@tanstack/react-table";

type Props = {
  statusFilter: string | null;
  setStatusFilter: (value: string | null) => void;
  priorityFilter: string | null;
  setPriorityFilter: (value: string | null) => void;
  table: Table<any>;
  fetchTasks: any;
  resetFilters: () => void;
  selectedCount: number;
  selectedTasks: any[];
  noCompleteButton?: boolean;
  noFilters?: boolean;
};

export const TableFilters = ({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  table,
  fetchTasks,
  resetFilters,
  selectedCount,
  selectedTasks,
  noCompleteButton,
  noFilters,
}: Props) => {
  // add this helper above/exported with your component (same file is fine)
  async function completeTasksBulk(selectedTasks: any[]) {
    // collect unique task IDs (guards against duplicate rows)
    const ids = Array.from(new Set(selectedTasks.map((t) => String(t.id))));

    const requests = ids.map((id) =>
      fetch("/api/update-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "closed", // <-- use "completed" if your backend expects that
          companyId: "1", // safe even though server injects it
        }),
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.error?.message ?? json?.message ?? `Update failed for task ${id}`);
        }
        return json.message as string;
      })
    );

    return Promise.all(requests);
  }
  return (
    <div className="flex flex-wrap gap-3">
      {!noFilters && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Shuffle className="mr-1 h-4 w-4" /> Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            {["open", "pending", "closed"].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter === status}
                onCheckedChange={(checked) => {
                  setStatusFilter(checked ? status : null);
                }}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!noFilters && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="mr-1 h-4 w-4" /> Priority
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            {["high", "medium", "low"].map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={priorityFilter === priority}
                onCheckedChange={(checked) => {
                  setPriorityFilter(checked ? priority : null);
                }}
              >
                {priority}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {priorityFilter || statusFilter ? (
        <Button variant="destructive" onClick={resetFilters}>
          Reset Filters
        </Button>
      ) : null}

      {!noCompleteButton && (
        <Button
          className="bg-green-800/25 text-green-500 border-2 font-bold border-green-800 hover:bg-green-800/45 border-dashed"
          onClick={async () => {
            try {
              const messages = await completeTasksBulk(selectedTasks);
              console.log("Tasks completed:", messages);
              // TODO: optionally refresh table data or clear selection here
              fetchTasks();
            } catch (err: any) {
              console.error("Bulk complete failed:", err?.message || err);
              // TODO: surface error via toast/snackbar if available
            }
          }}
          disabled={!selectedCount}
        >
          Complete {selectedCount} {selectedCount === 1 ? "Task" : "Tasks"}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <List className="mr-1 h-4 w-4" /> Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
          {table
            .getAllColumns()
            .filter((col) => !["select", "actions"].includes(col.id))
            .map((col) => (
              <DropdownMenuCheckboxItem key={col.id} checked={col.getIsVisible()} onCheckedChange={() => col.toggleVisibility()}>
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
