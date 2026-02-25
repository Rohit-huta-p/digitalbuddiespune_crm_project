"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { TasksImportDialog } from "./tasks-import-dialog";
import { TasksMutateDrawer } from "./tasks-mutate-drawer";
import { useTasks } from "../context/tasks-context";
import axios from "axios";
import { toast } from "sonner";

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, refreshTasks } = useTasks();
  return (
    <>
      <TasksMutateDrawer
        key="task-create"
        open={open === "create"}
        onOpenChange={() => setOpen("create")}
      />

      <TasksImportDialog
        key="tasks-import"
        open={open === "import"}
        onOpenChange={() => setOpen("import")}
      />

      {currentRow && (
        <>
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="task-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={async () => {
              try {
                const res = await axios.post("/api/delete-tasks", {
                  id: currentRow.id,
                });
                if (res.data.error) throw res.data.error;
                toast.success("Task deleted successfully!");
              } catch (err: any) {
                console.error("Delete task error:", err);
                toast.error(err?.message || "Failed to delete task");
              } finally {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 500);
                refreshTasks();
              }
            }}
            className="max-w-md"
            title={`Delete this task: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a task with the ID{" "}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  );
}
