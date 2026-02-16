"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Main } from "@/components/layout/main";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Project } from "@/types/project";
import { ProjectList } from "./_components/project-list";
import { ProjectEmptyState } from "./_components/project-empty-state";
import { ProjectWorkspace } from "./_components/project-workspace";
import { ProjectListSkeleton } from "./_components/project-list-skeleton";
import { ProjectWorkspaceSkeleton } from "./_components/project-workspace-skeleton";

const PAGE_SIZE = 10;

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId")
    ? Number(searchParams.get("projectId"))
    : null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        num: String(page),
        size: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(
        `/api/project-group/get-all?${params.toString()}`,
        { method: "POST" }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to fetch projects");
      }

      setProjects(result.projects || []);
      setTotalProjects(result.totalProjects || 0);
    } catch (err: any) {
      toast.error(err.message || "Error loading projects");
      setProjects([]);
      setTotalProjects(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("projectId", String(id));
    router.replace(`/projects?${params.toString()}`, { scroll: false });
  };

  const handleDeselectProject = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("projectId");
    router.replace(`/projects?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleProjectDeleted = () => {
    handleDeselectProject();
    fetchProjects();
  };

  return (
    <Main fixed className="!p-0 h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        {/* LEFT PANEL — Project List */}
        <aside
          className={cn(
            "border-r bg-card/50 flex flex-col shrink-0 transition-all duration-200",
            "w-full md:w-80 lg:w-96",
            selectedProjectId != null && "hidden md:flex"
          )}
        >
          <ProjectList
            projects={projects}
            totalProjects={totalProjects}
            selectedProjectId={selectedProjectId}
            page={page}
            pageSize={PAGE_SIZE}
            search={search}
            statusFilter={statusFilter}
            loading={loading}
            onSelectProject={handleSelectProject}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onPageChange={setPage}
          />
        </aside>

        {/* RIGHT PANEL — Workspace */}
        <section
          className={cn(
            "flex-1 min-w-0 bg-background",
            selectedProjectId == null && "hidden md:flex"
          )}
        >
          {/* Mobile back button */}
          {selectedProjectId != null && (
            <div className="md:hidden border-b p-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleDeselectProject}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to projects
              </Button>
            </div>
          )}

          {selectedProjectId == null ? (
            <ProjectEmptyState />
          ) : (
            <ProjectWorkspace
              key={selectedProjectId}
              projectId={selectedProjectId}
              onProjectDeleted={handleProjectDeleted}
            />
          )}
        </section>
      </div>
    </Main>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <Main fixed className="!p-0 h-[calc(100vh-4rem)]">
          <div className="flex h-full">
            <aside className="w-full md:w-80 lg:w-96 border-r bg-card/50">
              <ProjectListSkeleton />
            </aside>
            <section className="flex-1 hidden md:flex">
              <ProjectWorkspaceSkeleton />
            </section>
          </div>
        </Main>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
