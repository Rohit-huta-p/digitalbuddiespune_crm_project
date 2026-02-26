"use client";

import { useEffect, useState } from "react";
import { Main } from "@/components/layout/main";
import TasksProvider from "@/components/tasks/context/tasks-context";
import { columns } from "@/components/tasks/components/columns";
import { DataTable } from "@/components/tasks/components/data-table";
import { TasksDialogs } from "@/components/tasks/components/tasks-dialogs";
import { TasksPrimaryButtons } from "@/components/tasks/components/tasks-primary-buttons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectList,
  MultiSelectSearch,
  MultiSelectEmpty,
  MultiSelectValue,
} from "@/components/ui/multiselect";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Task } from "@/components/tasks/data/schema";

type Participant = {
  id: string;
  name: string;
  role: string;
  phone: string;
};


type ProjectType = {
  id: number;
  description: string;
  createdAt: string;
  name: string;
  createdById: number;
  groupLeaderIds: number[];
  participants: Participant[];
  status: string;
};

const ProjectsIndividualView = ({ params }: { params: { view: string } }) => {
  const { user } = useAuth();

  const { view: projectGroupId } = params;
  const [project, setProject] = useState<ProjectType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openMembersModal, setOpenMembersModal] = useState(false);

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [newTask, setNewTask] = useState({
    taskName: "",
    description: "",
    deadlineTimestamp: "",
    priority: "medium",
  });

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/project-group/get-by-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectGroupId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || "Project error");
      setProject(result.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error fetching project");
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const res = await fetch(`/api/project-group/get-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectGroupId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || "Task error");

      const formattedTasks = result.data.tasks.map((task: any) => ({
        ...task,
        id: task.taskId, // maps `taskId` to expected `id`
        assignedToEmployeeId: task.assignedEmployees ?? [],
        email: "unknown@example.com", // fallback or inject real email if available
      }));

      setTasks(formattedTasks);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error loading tasks");
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProjectDetails(), fetchProjectTasks()]);
      toast.success("Project details loaded");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateTask = async () => {
    if (
      !newTask.taskName ||
      !newTask.description ||
      !newTask.deadlineTimestamp ||
      selectedEmployees.length === 0
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch(`/api/project-group/tasks/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectGroupId,
          tasks: [
            {
              assignedBy: user?.id,
              ...newTask,
              deadlineTimestamp: new Date(newTask.deadlineTimestamp)
                .toISOString()
                .replace("T", " ")
                .slice(0, 19), // Format: yyyy-MM-dd HH:mm:ss
              assignedEmployees: selectedEmployees.map(Number),
            },
          ],
        }),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result?.error?.message || "Task creation failed");

      toast.success(result.message || "Task scheduled successfully");
      setOpenTaskDialog(false);
      setNewTask({
        taskName: "",
        description: "",
        deadlineTimestamp: "",
        priority: "medium",
      });
      setSelectedEmployees([]);
      fetchProjectTasks();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const formatDate = (dateStr: string | undefined) =>
    dateStr ? new Date(dateStr).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "N/A";

  return (
    <TasksProvider refreshTasks={loadAll}>
      <Main>
        {loading || !project ? (
          <p className="text-muted-foreground">Loading project details...</p>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-lg text-muted-foreground">
                {project.description || "No description provided."}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-700/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-500"
                >
                  Status: {project.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-zinc-100 dark:bg-zinc-600/20 text-zinc-700 dark:text-zinc-300"
                >
                  Created at: {formatDate(project.createdAt)}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-100 dark:bg-blue-700/20 text-blue-800 dark:text-blue-300"
                >
                  Total Tasks: {tasks.length}
                </Badge>
              </div>

              {/* Group Leaders and View Members */}
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                {project.participants
                  ?.filter((p) => project.groupLeaderIds.includes(Number(p.id)))
                  .map((leader) => (
                    <Badge
                      key={leader.id}
                      className="bg-purple-100 text-purple-800 dark:bg-purple-700/20 dark:text-purple-300 border border-purple-300 dark:border-purple-800 py-2 px-3"
                    >
                      🧑‍💼 {leader.name}
                    </Badge>
                  ))}
                {project.participants.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenMembersModal(true)}
                  >
                    View All Members
                  </Button>
                )}
              </div>

              <Button
                onClick={loadAll}
                variant="secondary"
                size="sm"
                className="mt-4 w-fit"
              >
                <IconRefresh size={16} className="mr-1" />
                Refresh Project
              </Button>
            </div>

            {/* Tasks Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">📋 Project Tasks</h2>
                  <p className="text-muted-foreground text-sm">
                    All tasks assigned under this project.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setOpenTaskDialog(true)}
                    className="mt-4 w-fit"
                  >
                    ➕ Add New Task
                  </Button>
                </div>
              </div>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks added yet.</p>
              ) : (
                <div className="-mx-4 px-4">
                  <DataTable data={tasks} columns={columns} loading={loading} />
                </div>
              )}
            </div>

            <TasksDialogs />

            {/* Members Modal */}
            <Dialog open={openMembersModal} onOpenChange={setOpenMembersModal}>
              <DialogContent className="max-w-lg sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>👥 Project Members</DialogTitle>
                  <DialogDescription>
                    View all members with their roles and contact details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {project.participants.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-lg border p-4 bg-muted/10 shadow-sm"
                    >
                      <h4 className="text-base font-semibold text-primary">
                        {member.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {member.role.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        📞 {member.phone}
                      </p>
                      {project.groupLeaderIds.includes(Number(member.id)) && (
                        <Badge className="mt-2 bg-primary/10 text-primary text-xs border-primary/20">
                          Group Leader
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
              <DialogContent className="max-w-md bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-zinc-900 dark:text-white text-xl font-semibold">
                    ➕ Schedule New Task
                  </DialogTitle>
                  <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                    Assign a task to selected team members.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Task Name"
                    value={newTask.taskName}
                    onChange={(e) =>
                      setNewTask({ ...newTask, taskName: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Task Description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />

                  <div>
                    <label className="text-sm text-zinc-700 dark:text-white mb-1 block">
                      Deadline
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.deadlineTimestamp ? (
                            format(new Date(newTask.deadlineTimestamp), "PPPp")
                          ) : (
                            <span className="text-zinc-500">
                              Pick a deadline
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            newTask.deadlineTimestamp
                              ? new Date(newTask.deadlineTimestamp)
                              : undefined
                          }
                          onSelect={(date) =>
                            setNewTask({
                              ...newTask,
                              deadlineTimestamp: date?.toISOString() ?? "",
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-700 dark:text-white mb-1 block">
                      Priority
                    </label>
                    <Select
                      onValueChange={(val) =>
                        setNewTask({ ...newTask, priority: val })
                      }
                      value={newTask.priority}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-700 dark:text-white mb-1 block">
                      Assign To
                    </label>
                    <MultiSelect
                      value={selectedEmployees}
                      onValueChange={setSelectedEmployees}
                    >
                      <MultiSelectTrigger className="bg-background border border-zinc-300 dark:border-zinc-700 text-foreground">
                        <MultiSelectValue>
                          {selectedEmployees.length > 0
                            ? selectedEmployees
                              .map(
                                (id) =>
                                  project?.participants?.find(
                                    (p) => p.id === id
                                  )?.name || "Unknown"
                              )
                              .join(", ")
                            : "Select members"}
                        </MultiSelectValue>
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        <MultiSelectSearch placeholder="Search employees..." />
                        <MultiSelectList>
                          <MultiSelectGroup heading="Participants">
                            {project?.participants?.map((emp) => (
                              <MultiSelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                              </MultiSelectItem>
                            ))}
                          </MultiSelectGroup>
                        </MultiSelectList>
                        <MultiSelectEmpty>No match found</MultiSelectEmpty>
                      </MultiSelectContent>
                    </MultiSelect>
                  </div>

                  <Button onClick={handleCreateTask} className="w-full">
                    Submit Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </Main>
    </TasksProvider>
  );
};

export default ProjectsIndividualView;
