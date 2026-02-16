"use client";

import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { Task } from "../data/schema";

type TasksDialogType = "create" | "update" | "delete" | "import";

interface TasksContextType {
  open: TasksDialogType | null;
  setOpen: (str: TasksDialogType | null) => void;
  currentRow: Task | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>;
  refreshTasks: () => void | Promise<void>;
}

const TasksContext = React.createContext<TasksContextType | null>(null);

interface Props {
  children: React.ReactNode;
  refreshTasks?: () => void | Promise<void>;
}

export default function TasksProvider({ children, refreshTasks = () => { } }: Props) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Task | null>(null);
  return (
    <TasksContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, refreshTasks }}>
      {children}
    </TasksContext.Provider>
  );
}

export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext);

  if (!tasksContext) {
    throw new Error("useTasks has to be used within <TasksContext>");
  }

  return tasksContext;
};
