"use client";

import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

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
  createdAt?: string;
  participants: Participant[];
  groupLeaderIds: number[];
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);

  const projectsPerPage = 6;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/project-group/get-all?num=${page}&size=${projectsPerPage}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to fetch projects");
      }

      setProjects(result.projects || []);
      setTotalProjects(result.totalProjects || 0);
    } catch (err: any) {
      toast.error(err.message || "Error loading projects");
      console.error("Project fetch error:", err);
      setProjects([]);
      setTotalProjects(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page]);

  useEffect(() => {
    let data = [...projects];

    if (search.trim() !== "") {
      data = data.filter((project) =>
        `${project.projectName} ${project.projectDesc}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((project) => project.status === statusFilter);
    }

    if (sortBy === "recent") {
      data.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );
    } else if (sortBy === "members") {
      data.sort((a, b) => b.participants.length - a.participants.length);
    }

    setFiltered(data);
  }, [search, statusFilter, sortBy, projects]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const handleDeleteProject = async (projectGroupId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project? This action is irreversible."
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/project-group/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectGroupId }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message || "Project deleted successfully");
        fetchProjects();
      } else {
        toast.error(result.error?.message || "Something went wrong");
      }
    } catch (err) {
      toast.error("Failed to delete project");
      console.error(err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalProjects / projectsPerPage));

  return (
    <Main>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          📁 Projects
        </h2>
        <Button onClick={() => router.push("/projects/new")}>
          + Create New
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select onValueChange={setStatusFilter} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setSortBy} defaultValue="recent">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Newest First</SelectItem>
            <SelectItem value="members">Most Members</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Cards */}
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No matching projects found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => {
              const leader = project.participants.find((p) =>
                project.groupLeaderIds.includes(Number(p.id))
              );
              const others = project.participants.length - (leader ? 1 : 0);

              return (
                <Card
                  key={project.projectGroupId}
                  onClick={() =>
                    router.push(`/projects/${project.projectGroupId}`)
                  }
                  className="hover:shadow-xl transition-all cursor-pointer border border-muted hover:border-primary bg-white dark:bg-zinc-900/80"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-semibold text-primary">
                        {project.projectName}
                      </CardTitle>
                      <Badge
                        variant={
                          project.status === "open" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {project.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      {project.projectDesc}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(project.createdAt)}
                    </p>
                    <p className="text-sm font-medium">
                      👤 Group Leader: {leader?.name || "N/A"}{" "}
                      {others > 0 && (
                        <span className="text-muted-foreground">
                          &nbsp;and {others} other member{others > 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </CardContent>

                  <CardFooter className="mt-2 border-t pt-3 flex justify-between text-xs text-muted-foreground">
                    <span>Total Members: {project.participants.length}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/projects/${project.projectGroupId}`);
                        }}
                      >
                        Open
                      </Button>
                      {user?.role === "Admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.projectGroupId);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ⬅ Prev
              </Button>
              <span className="text-sm py-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ➡
              </Button>
            </div>
          )}
        </>
      )}
    </Main>
  );
};

export default ProjectsPage;
