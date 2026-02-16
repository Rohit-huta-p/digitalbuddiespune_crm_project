"use client";

import MainTable from "@/components/alpha/tasks";
import { Main } from "@/components/layout/main";
import { TasksPrimaryButtons } from "@/components/tasks/components/tasks-primary-buttons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { IconRefresh } from "@tabler/icons-react";
import { TasksDialogs } from "@/components/tasks/components/tasks-dialogs";
import TasksProvider from "@/components/tasks/context/tasks-context";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { user } = useAuth();
  console.log(user);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/get-all-tasks");
      const taskManagementData = response.data.data || [];
      console.log("TASKS", taskManagementData);

      // if (Array.isArray(taskManagementData)) {
      //   const filteredTasks = taskManagementData.filter((task: any) =>
      //     task.assignedToEmployeeId?.some((id: any) => String(id) === String(user?.id))
      //   );
      setTasks(taskManagementData);
      // } else {
      //   setTasks([]);
      // }
    } catch (err: any) {
      console.log(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return (
    <TasksProvider refreshTasks={fetchTasks}>
      <TasksDialogs />
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">Here&apos;s a list of your tasks for this month!</p>
          </div>
          <div className="flex items-center gap-8">
            <TasksPrimaryButtons />
            <Button variant={"secondary"} className="space-x-1" onClick={() => fetchTasks()}>
              Refresh
              <IconRefresh className={loading ? "animate-spin" : ""} size={18} />
            </Button>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <MainTable tasks={tasks} loading={loading} fetchTasks={fetchTasks} />
        </div>
      </Main>
    </TasksProvider>
  );
}
