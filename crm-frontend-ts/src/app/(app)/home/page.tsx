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
import { CircleCheck, Info, X } from "lucide-react";
import axios from "axios";
import TaskTable from "@/components/alpha/tasks";

type Participant = {
  id: string;
  name: string;
  role: string;
};

type Project = {
  projectGroupId: number;
  projectName: string;
  projectDesc: string;
  status: string;
  participants: Participant[];
};

const HomePage = () => {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const { user } = useAuth();
  const router = useRouter();

  const storedStatus =
    typeof window !== "undefined"
      ? localStorage.getItem("attendanceStatus")
      : null;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/get-all-tasks");
      const taskManagementData = response.data.data;
      console.log("TASKS", taskManagementData);

      const filteredTasks = taskManagementData.filter((task: any) =>
        task.assignedToEmployeeId.includes(user?.id)
      );
      setTasks(filteredTasks);

      setLoading(false);
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

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
      <section className="mb-10 flex flex-row w-full">
        <Card className="max-w-sm border-r-0 rounded-r-none">
          <CardHeader>
            <CardTitle>📆 Calendar</CardTitle>
            <CardDescription>
              Check your upcoming tasks & events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              className="rounded-md border"
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </CardContent>
        </Card>

        {/* Tasks */}

        <Card className="w-full rounded-l-none">
          <CardHeader>
            <CardDescription>Check what you need to complete</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12">
              <TaskTable
                itemsPerPage={5}
                loading={loading}
                tasks={
                  selectedDate
                    ? tasks.filter((task: any) => {
                        if (!task.deadlineTimestamp) return false;
                        const taskDate = new Date(task.deadlineTimestamp);
                        const compareDate = new Date(selectedDate);
                        // Reset time portions for accurate date comparison
                        taskDate.setHours(0, 0, 0, 0);
                        compareDate.setHours(0, 0, 0, 0);
                        return taskDate.getTime() === compareDate.getTime();
                      })
                    : tasks
                }
                noSearch
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
                key={project.projectGroupId}
                onClick={() =>
                  router.push(`/projects/${project.projectGroupId}`)
                }
                className="cursor-pointer transition hover:shadow-md p-4 rounded-lg border border-border dark:bg-zinc-900 bg-white"
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-primary line-clamp-1">
                      🛠️ {project.projectName}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                    {project.projectDesc}
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
  );
};

export default HomePage;
