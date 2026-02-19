"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Main } from "@/components/layout/main";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/employees/data-table";
import { TasksMutateDrawer } from "@/components/tasks/components/tasks-mutate-drawer";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";
import { EmployeeMutateDrawer } from "@/components/employees/components/employee-mutate-drawer";
import { toast } from "sonner";

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
  createdAt?: string;
  participants: Participant[];
  groupLeaderIds: number[];
};

const HRPage = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees", { method: "POST" });
      const data = await res.json();
      setEmployees(data.attributes.employees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

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

  const handleDeleteEmployee = async (user: User) => {
    console.log("handleDeleteEmployee called for:", user);
    try {
      const res = await fetch("/api/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, companyId: 1 }),
      });
      console.log("Delete response status:", res.status);
      const result = await res.json();
      console.log("Delete result:", result);

      if (!res.ok) {
        // Parse the nested backend error for a cleaner message
        let message = "Failed to delete employee";
        const raw = result.error || "";
        if (raw.includes("foreign key constraint") || raw.includes("DataIntegrityViolation")) {
          message = `Cannot delete ${user.name} — they are assigned to active projects. Remove them from all projects first.`;
        } else if (typeof raw === "string" && raw.length < 200) {
          message = raw;
        }
        throw new Error(message);
      }
      toast.success(`${user.name} deleted successfully`);
      fetchEmployees();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete employee");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  return (
    <Main>
      {/* Welcome */}
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-2">👋 Welcome, HR!</h1>
        <p className="text-muted-foreground text-sm">Manage employees and projects from one clean and efficient dashboard.</p>
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-5">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: "New Project",
              route: "/projects/new",
              className: "bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white",
            },
            {
              title: "Add Employee",
              route: "/employees/new",
              className: "bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white",
            },
            {
              title: "Attendance",
              route: "/attendance",
              className: "bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 text-white",
            },
            { title: "All Salaries", route: "/salaries", className: "bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white" },
            {
              title: "Mark Paid",
              route: "/salaries/mark-paid",
              className: "bg-purple-500 dark:bg-purple-600 hover:bg-purple-600 dark:hover:bg-purple-700 text-white",
            },
            { title: "Billing", route: "/billing", className: "bg-pink-500 dark:bg-pink-600 hover:bg-pink-600 dark:hover:bg-pink-700 text-white" },
          ].map((action) => (
            <Card
              key={action.title}
              onClick={() => router.push(action.route)}
              className={cn(
                "cursor-pointer flex items-center py-8 justify-center bg-white dark:bg-zinc-900/60 border border-muted hover:dark:bg-zinc-800 transition p-5 rounded-xl",
                action.className
              )}
            >
              <h3 className="text-lg font-bold">{action.title}</h3>
            </Card>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">📁 Projects Overview</h2>
          <Button onClick={() => router.push("/projects")} variant="outline">
            View All Projects
          </Button>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                onClick={() => router.push(`/projects/${project.id}`)}
                key={project.id}
                className="p-5 bg-gradient-to-br cursor-pointer from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800 border border-primary/20 hover:shadow-lg transition-all rounded-lg"
              >
                <CardContent>
                  <h3 className="text-xl font-bold mb-1 text-primary">🛠️ {project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <p className="text-sm mb-1">
                    <strong>Status:</strong> {project.status}
                  </p>
                  <p className="text-sm">
                    <strong>Team:</strong> {project.participants.map((p) => p.name).join(", ") || "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Employees Table */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">👨‍💼 Employees</h2>
        <div className="overflow-auto border rounded-xl shadow-sm">
          <DataTable
            data={employees}
            onEdit={(user) => {
              setSelectedEmployee(user);
              setOpen(true);
            }}
            onDelete={handleDeleteEmployee}
          />
        </div>
      </section>

      <EmployeeMutateDrawer open={open} onOpenChange={() => setOpen(!open)} />
    </Main>
  );
};

export default HRPage;

