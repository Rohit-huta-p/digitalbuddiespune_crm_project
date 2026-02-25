"use client";
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectSearch,
  MultiSelectList,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectEmpty,
} from "@/components/ui/multiselect";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

interface Project {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

export default function CreateTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}) {
  const { user } = useAuth();

  const [isProjectTask, setIsProjectTask] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    deadlineTimestamp: "",
    status: "pending",
    priority: "medium",
    assignedToEmployeeId: [] as string[],
  });

  useEffect(() => {
    axios
      .post("/api/employees")
      .then((res) => setEmployees(res.data.attributes.employees))
      .catch(console.error);

    axios
      .post("/api/project-group/get-all?num=1&size=35")
      .then((res) => {
        console.log("Projects", res.data.projects);
        setProjects(res.data.projects);
      })
      .catch(console.error);
  }, []);

  const resetForm = () => {
    setFormData({
      taskName: "",
      description: "",
      deadlineTimestamp: "",
      status: "pending",
      priority: "medium",
      assignedToEmployeeId: [],
    });
    setSelectedProjectId(null);
    setIsProjectTask(false);
  };

  const handleSubmit = async () => {
    const endpoint = isProjectTask
      ? "/api/project-group/tasks/schedule"
      : "/api/create-tasks";

    let payload;

    if (isProjectTask) {
      if (!selectedProjectId) {
        toast.error("Please select a project group.");
        return;
      }

      payload = {
        projectGroupId: selectedProjectId,
        companyId: "1",
        tasks: [
          {
            taskName: formData.taskName,
            assignedBy: user?.id,
            description: formData.description,
            deadlineTimestamp: new Date(formData.deadlineTimestamp)
              .toISOString()
              .slice(0, 19),
            priority: formData.priority,
            assignedEmployees: formData.assignedToEmployeeId.map(Number),
          },
        ],
      };
    } else {
      payload = {
        ...formData,
        assignedToEmployeeId: formData.assignedToEmployeeId.map(Number),
        companyId: "1",
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.success) {
      toast.success("✅ Task Created: " + formData.taskName);
      onOpenChange(false);
      resetForm();
    } else {
      toast.error(json.error?.message || "Task creation failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-white text-xl font-semibold flex items-center">
            <Plus className="mr-2" /> <span>Schedule New Task</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Assign a task to selected team members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-zinc-700 dark:text-white">
              Is this a project task?
            </Label>
            <Switch
              checked={isProjectTask}
              onCheckedChange={setIsProjectTask}
            />
          </div>

          {isProjectTask && (
            <div>
              <Label className="mb-1 block text-sm text-zinc-700 dark:text-white">
                Select Project
              </Label>
              <Select
                value={selectedProjectId ?? ""}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project group" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={String(project.id)}
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Input
            placeholder="Task Name"
            value={formData.taskName}
            onChange={(e) =>
              setFormData({ ...formData, taskName: e.target.value })
            }
          />
          <Textarea
            placeholder="Task Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div>
            <Label className="text-sm text-zinc-700 dark:text-white mb-1 block">
              Deadline
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadlineTimestamp ? (
                    format(new Date(formData.deadlineTimestamp), "PPPp")
                  ) : (
                    <span className="text-zinc-500">Pick a deadline</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.deadlineTimestamp
                      ? new Date(formData.deadlineTimestamp)
                      : undefined
                  }
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      deadlineTimestamp: date?.toISOString() ?? "",
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm text-zinc-700 dark:text-white mb-1 block">
              Priority
            </Label>
            <Select
              onValueChange={(val) =>
                setFormData({ ...formData, priority: val })
              }
              value={formData.priority}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isProjectTask && (
            <div>
              <Label className="text-sm text-zinc-700 dark:text-white mb-1 block">
                Status
              </Label>
              <Select
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val })
                }
                value={formData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-sm text-zinc-700 dark:text-white mb-1 block">
              Assign To
            </Label>
            <MultiSelect
              value={formData.assignedToEmployeeId}
              onValueChange={(val: string[]) =>
                setFormData({ ...formData, assignedToEmployeeId: val })
              }
            >
              <MultiSelectTrigger className="bg-background border border-zinc-300 dark:border-zinc-700 text-foreground">
                <MultiSelectValue placeholder="Select employees" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectSearch placeholder="Search employees..." />
                <MultiSelectList>
                  <MultiSelectGroup heading="Employees">
                    {employees.map((emp) => (
                      <MultiSelectItem key={emp.id} value={String(emp.id)}>
                        {emp.name}
                      </MultiSelectItem>
                    ))}
                  </MultiSelectGroup>
                </MultiSelectList>
                <MultiSelectEmpty>No matches found.</MultiSelectEmpty>
              </MultiSelectContent>
            </MultiSelect>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
