/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SelectDropdown } from "@/components/select-dropdown";
import { Task } from "../data/schema";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MultiSelect } from "./multiselect-dropdown";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useTasks } from "@/components/tasks/context/tasks-context";

interface Props {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void;
  currentRow?: Task;
}
const formSchema = z.object({
  taskName: z.string().min(1, "Task name is required."),
  description: z.string().min(1, "Description is required."),
  deadlineTimestamp: z.date().refine((val) => !isNaN(val.getTime()), {
    message: "Invalid date format.",
  }),
  status: z.enum(["open", "closed", "pending"], {
    errorMap: () => ({ message: "Invalid status value." }),
  }),
  assignedBy: z.string().min(1, "Assigned by is required."),
  email: z.string().email("Invalid email format."),
  assignedToEmployeeId: z
    .array(z.number())
    .min(1, "At least one employee ID is required."),
});

type TasksForm = z.infer<typeof formSchema>;

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow;
  const { user } = useAuth();
  const { refreshTasks } = useTasks();
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.post("/api/employees");
        if (res.data?.attributes?.employees) {
          setEmployees(res.data.attributes.employees);
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  const form = useForm<TasksForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
        taskName: currentRow.taskName,
        description: currentRow.description,
        deadlineTimestamp: currentRow.deadlineTimestamp
          ? new Date(currentRow.deadlineTimestamp)
          : undefined,
        status: currentRow.status as "open" | "closed" | "pending", // Ensure correct enum type
        assignedBy: String(currentRow.assignedBy), // Convert assignedBy to string
        email: currentRow.email ?? undefined,
        assignedToEmployeeId: currentRow.assignedToEmployeeId, // Ensure it's number[]
      }
      : {
        taskName: "",
        description: "",
        deadlineTimestamp: new Date(),
        status: "open",
        assignedBy: user?.name || "",
        email: user?.email || "",
        assignedToEmployeeId: [] as number[],
      },
  });

  // Update assignedBy when user loads (if creating new task)
  useEffect(() => {
    if (!isUpdate && user) {
      form.setValue("assignedBy", user.name);
      form.setValue("email", user.email);
    }
  }, [user, isUpdate, form]);

  const onSubmit = async (data: TasksForm) => {
    // do something with the form data
    onOpenChange(false);
    form.reset();

    console.log(data);

    if (isUpdate) {
      try {
        const response = await axios.post(
          "/api/update-tasks",
          {
            id: currentRow?.id,
            ...data,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.data.error) {
          throw response.data.error;
        }

        toast.success(response.data.message);
      } catch (error: string | any) {
        console.log(error);
        toast.error("CODE " + error.status + " " + error.message);
      }
      refreshTasks();
      return;
    }
    try {
      const res = await axios.post("/api/create-tasks", data, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(res.data);
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(err.message || "Failed to create task");
    } finally {
      refreshTasks();
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        form.reset();
      }}
    >
      <SheetContent className="flex flex-col overflow-y-scroll">
        <SheetHeader className="text-left">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Task</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the task by providing necessary info."
              : "Add a new task by providing necessary info."}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="tasks-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-5"
          >
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter a task name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter a description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadlineTimestamp"
              render={({ field }) => (
                <FormItem className="space-y-1 w-full flex flex-col">
                  <FormLabel className="pb-1">Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Status</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a status"
                    items={[
                      { label: "Open", value: "open" },
                      { label: "Closed", value: "closed" },
                      { label: "Pending", value: "pending" },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedBy"
              render={({ field }) => (
                <FormItem className="space-y-1 ">
                  <FormLabel>Assigned By</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Assigned By" readOnly className="bg-gray-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter an email"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedToEmployeeId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <MultiSelect
                      values={field.value.map(String)} // Convert numbers to strings
                      onChange={(values) => field.onChange(values.map(Number))} // Convert strings back to numbers
                      options={employees.map((emp) => ({
                        label: `${emp.name} (ID: ${emp.id})`,
                        value: String(emp.id),
                      }))}
                      placeholder="Search and select employee(s)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="tasks-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
