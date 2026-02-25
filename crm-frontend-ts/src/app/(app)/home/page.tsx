"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Main } from "@/components/layout/main";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Info, X, CircleCheck } from "lucide-react";
import axios from "axios";
import TaskTable from "@/components/alpha/tasks";
import TasksProvider from "@/components/tasks/context/tasks-context";
import { TasksDialogs } from "@/components/tasks/components/tasks-dialogs";

type Participant = {
  id: string;
  name: string;
  role: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  status: string;
  participants: Participant[];
};

const HomePage = () => {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { user } = useAuth();
  const router = useRouter();

  const storedStatus =
    typeof window !== "undefined"
      ? localStorage.getItem("attendanceStatus")
      : null;

  const fetchTasks = async () => {
    try {
      if (!user?.id) return; // wait for user to be available
      setLoading(true);
      const response = await axios.post("/api/get-tasks-by-employee", {
        id: user.id,
        companyId: user.companyId,
      });
      const taskManagementData = response.data?.data || [];

      const filteredTasks = (taskManagementData as any[])
        .filter(Boolean)
        .filter((task: any) => {
          // Check assignedToEmployeeId array (numbers or strings)
          if (task.assignedToEmployeeId && Array.isArray(task.assignedToEmployeeId)) {
            if (task.assignedToEmployeeId.some((id: any) => String(id) === String(user.id))) {
              return true;
            }
          }
          // Fallback to checking the details array if ID array is missing or didn't match
          if (task.assignedEmployeeDetails && Array.isArray(task.assignedEmployeeDetails)) {
            if (task.assignedEmployeeDetails.some((emp: any) => String(emp.id) === String(user.id))) {
              return true;
            }
          }
          // Final fallback for older schemas
          const assigned = task.assignedEmployees || [];
          const assignedArr = Array.isArray(assigned) ? assigned : [assigned];
          return assignedArr.map(String).includes(String(user.id));
        });

      setTasks(filteredTasks);
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/project-group/get-all?num=1&size=6", {
        method: "POST",
      });
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const checkAttendance = async () => {
    const checkRes = await fetch("/api/attendance/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const checkData = await checkRes.json();

    if (!checkRes.ok || checkData?.error) {
      throw new Error(checkData.error?.message || "Failed to check attendance");
    }

    if (checkData.isPresent) {
      setAttendanceMarked(true);
    } else {
      setAttendanceMarked(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    checkAttendance();
  }, []);

  return (
    <TasksProvider refreshTasks={fetchTasks}>
      <TasksDialogs />
      <Main>
        <div className="mb-9 flex items-start flex-col justify-between space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome {user?.name}
          </h1>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {/* Attendance Card */}
          <Card>
            <CardHeader className="flex flex-row items-left justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {attendanceMarked ? (
                <Alert variant="success" className="mb-4">
                  <CircleCheck className="h-4 w-4" />
                  <AlertTitle>Status</AlertTitle>
                  <AlertDescription>Attendance Marked</AlertDescription>
                </Alert>
              ) : (
                <Alert className="mb-4 bg-red-700 text-white p-3">
                  <X className="h-4 w-4 text-white" />
                  <AlertTitle>Status</AlertTitle>
                  <AlertDescription>Attendance Not Marked</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={() => router.push("/attendance")}
                className="w-full"
              >
                Mark Attendance
              </Button>
            </CardContent>
          </Card>

          {/* Joined Groups */}
          <Card className="hidden md:flex items-center justify-center text-muted">
            <X className="h-12 w-12" />
          </Card>

          {/* Notifications */}
          <Card className="hidden md:flex items-center justify-center text-muted">
            <X className="h-12 w-12" />
          </Card>

          {/* Placeholder */}
          <Card className="hidden md:flex items-center justify-center text-muted">
            <X className="h-12 w-12" />
          </Card>
        </div>

        {/* Calendar */}
        <section className="mb-10 flex flex-col lg:flex-row w-full gap-4">
          <Card className="w-full lg:w-1/3">
            <CardHeader>
              <CardTitle>📆 Calendar</CardTitle>
              <CardDescription>Check your upcoming tasks & events</CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <div className="min-h-[260px]">
                <Calendar
                  className="rounded-md border"
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="w-full lg:w-2/3">
            <CardHeader>
              <CardDescription>Check what you need to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[420px] -mx-4 overflow-auto px-4 py-2">
                <TaskTable
                  loading={loading}
                  hideToolbar
                  defaultCompact
                  tasks={
                    selectedDate
                      ? tasks.filter((task: any) => {
                        const dl = task.deadline || task.deadlineTimestamp;
                        if (!dl) return false;
                        const taskDate = new Date(dl);
                        const compareDate = new Date(selectedDate);

                        // Compare just the YYYY-MM-DD strings to avoid timezone/hour offset bugs
                        return (
                          taskDate.getFullYear() === compareDate.getFullYear() &&
                          taskDate.getMonth() === compareDate.getMonth() &&
                          taskDate.getDate() === compareDate.getDate()
                        );
                      })
                      : tasks
                  }
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Projects */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📁 Your Projects</h2>
            <Button variant="outline" onClick={() => router.push("/projects")}>
              View All
            </Button>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  onClick={() =>
                    router.push(`/projects/${project.id}`)
                  }
                  className="cursor-pointer transition hover:shadow-md p-4 rounded-lg border border-border dark:bg-zinc-900 bg-white"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-primary line-clamp-1">
                        🛠️ {project.name}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                      {project.description}
                    </p>
                    <p className="text-xs">
                      <strong>Team:</strong>{" "}
                      {project.participants.map((p) => p.name).join(", ") || "—"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </Main>
    </TasksProvider>
  );
};

export default HomePage;
