"use client";
// app/(app)/client/page.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Main } from "@/components/layout/main";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Client {
  clientId: number;
  name: string;
  email: string;
  phno: string;
}

interface Project {
  projectGroupId: number;
  projectName: string;
  projectDesc: string;
  status: string;
  groupLeaderIds: number[];
}

type SortField = "name" | "email" | "phno";

export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [isCompact, setIsCompact] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/get-all-clients", { method: "POST" });
      const data = await res.json();
      setClients(data.data || []);
    } catch (err) {
      toast.error("Failed to load clients");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      const res = await fetch(`/api/delete-client?clientId=${selectedClient.clientId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error?.message || "Failed to delete client");
      }

      toast.success(result.message || "Client deleted successfully");

      setClients((prev) =>
        prev.filter((c) => c.clientId !== selectedClient.clientId)
      );

      setDialogOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      console.error("Delete error:", error);
    }
  };

  const handleShowProjects = async (client: Client) => {
    setSelectedClient(client);
    setProjectModalOpen(true);
    setProjects([]);
    setLoadingProjects(true);

    try {
      const res = await fetch("/api/client-get-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.clientId.toString(),
          companyId: "1",
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error?.message || "Could not fetch projects");
      }

      setProjects(result.projects || []);
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong while fetching projects"
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  const filteredClients = clients
    .filter((client) =>
      `${client.name} ${client.email} ${client.phno}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      a[sortField].localeCompare(b[sortField], "en", { sensitivity: "base" })
    );

  return (
    <Main>
      <div className="px-4 py-10 space-y-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-bold">👥 All Clients</CardTitle>
            <div className="flex justify-end">
              <Button
                onClick={() => router.push("/client/new")}
                className="mb-4"
              >
                ➕ Add New Client
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <Input
                placeholder="🔍 Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2"
              />
              <div className="flex items-center gap-4">
                <Label htmlFor="sort">Sort By</Label>
                <select
                  id="sort"
                  className="border rounded-md px-3 py-2 text-sm"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="phno">Phone</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="compact-toggle"
                  checked={isCompact}
                  onCheckedChange={setIsCompact}
                />
                <Label htmlFor="compact-toggle">Compact Mode</Label>
              </div>
            </div>

            <div className="space-y-2 divide-y border rounded-md overflow-hidden">
              {filteredClients.length === 0 && (
                <p className="text-muted-foreground text-sm px-4 py-6 text-center">
                  No clients found.
                </p>
              )}
              {filteredClients.map((client) => (
                <div
                  key={client.clientId}
                  className={cn(
                    "flex flex-col md:flex-row justify-between items-start md:items-center p-4 transition-all gap-4",
                    isCompact ? "text-sm" : "text-base"
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {client.email}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      📞 <span className="font-medium">Phone:</span>{" "}
                      {client.phno}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size={isCompact ? "sm" : "default"}
                      onClick={() => handleShowProjects(client)}
                    >
                      📁 Show Projects
                    </Button>
                    <Button
                      variant="destructive"
                      size={isCompact ? "sm" : "default"}
                      onClick={() => {
                        setSelectedClient(client);
                        setDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Confirm Delete</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedClient?.name}</span>? This
              action cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Projects Modal */}
      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projects for {selectedClient?.name}</DialogTitle>
          </DialogHeader>

          {loadingProjects ? (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects found.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {projects.map((proj) => (
                <div
                  key={proj.projectGroupId}
                  className="rounded-xl border border-border/60 bg-white/60 dark:bg-zinc-900/30 backdrop-blur-md p-4 shadow-sm space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {proj.projectName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {proj.projectDesc}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium px-3 py-1 rounded-full",
                        proj.status === "open"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : proj.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {proj.status.charAt(0).toUpperCase() +
                        proj.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="text-sm"
                      onClick={() =>
                        router.push(`/projects/${proj.projectGroupId}`)
                      }
                    >
                      🔗 Open Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Main>
  );
}
