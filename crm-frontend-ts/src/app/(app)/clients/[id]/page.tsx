"use client";
// /clients/[id]/page.tsx
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Mail,
    Phone,
    FolderOpen,
    Receipt,
    Activity,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────
interface ClientDetail {
    clientId: number;
    name: string;
    email: string;
    phno: string;
    workDonePercentage?: number;
    pendingPercentage?: number;
    totalPosts?: number;
    completedPosts?: number;
    totalVideos?: number;
    completedVideos?: number;
    totalShoots?: number;
    completedShoots?: number;
}

interface Project {
    id: number;
    name: string;
    description: string;
    status: string;
    groupLeaderIds: number[];
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function ClientProfilePage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    const [client, setClient] = useState<ClientDetail | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    console.log("Client Projects: ", projects);

    const [loading, setLoading] = useState(true);
    const [loadingProjects, setLoadingProjects] = useState(true);

    useEffect(() => {
        fetchClient();
        fetchProjects();
    }, [clientId]);

    // ── Fetch Client ──────────────────────────────────────────────────────
    const fetchClient = async () => {
        try {
            const res = await fetch("/api/get-all-clients", { method: "POST" });
            const data = await res.json();
            const found = (data.data || []).find(
                (c: ClientDetail) => c.clientId === Number(clientId)
            );
            if (found) {
                setClient(found);
            } else {
                toast.error("Client not found");
            }
        } catch {
            toast.error("Failed to load client details");
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch Projects ────────────────────────────────────────────────────
    const fetchProjects = async () => {
        setLoadingProjects(true);
        try {
            const res = await fetch("/api/client-get-projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId, companyId: "1" }),
            });
            const result = await res.json();
            console.log("Projects API Result:", result);
            // Handle multiple response shapes: paginated content, direct projects array, or attributes wrapper
            const projectsData =
                result.attributes?.content ||
                result.attributes?.projects ||
                result.projects ||
                result.data?.projects ||
                (Array.isArray(result.attributes) ? result.attributes : []);
            setProjects(projectsData);
        } catch {
            // Projects may not exist — that's ok
        } finally {
            setLoadingProjects(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────
    const getProgress = () => {
        if (!client) return 0;
        const total =
            (client.totalPosts || 0) +
            (client.totalVideos || 0) +
            (client.totalShoots || 0);
        const done =
            (client.completedPosts || 0) +
            (client.completedVideos || 0) +
            (client.completedShoots || 0);
        if (total === 0) return 0;
        return Math.round((done / total) * 100);
    };

    const statusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "open":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
            case "pending":
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
            case "closed":
                return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
            default:
                return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
        }
    };

    // ── Loading State ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <Main>
                <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <div className="h-6 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-40 rounded-xl bg-muted/50 animate-pulse" />
                    <div className="h-60 rounded-xl bg-muted/50 animate-pulse" />
                </div>
            </Main>
        );
    }

    if (!client) {
        return (
            <Main>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-lg font-medium text-muted-foreground">
                        Client not found
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push("/clients")}
                    >
                        Back to Clients
                    </Button>
                </div>
            </Main>
        );
    }

    const progress = getProgress();

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <Main>
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Back */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/clients")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Clients
                </Button>

                {/* ── Client Header Card ─────────────────────────────── */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-primary">
                                    {client.name.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {client.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" />
                                        {client.email}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" />
                                        {client.phno}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="flex-1 max-w-xs h-2.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                progress >= 80
                                                    ? "bg-emerald-500"
                                                    : progress >= 50
                                                        ? "bg-amber-500"
                                                        : progress > 0
                                                            ? "bg-orange-500"
                                                            : "bg-zinc-300 dark:bg-zinc-600"
                                            )}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{progress}%</span>
                                    <span className="text-xs text-muted-foreground">
                                        work completed
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Deliverable Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                            {[
                                {
                                    label: "Posts",
                                    done: client.completedPosts || 0,
                                    total: client.totalPosts || 0,
                                },
                                {
                                    label: "Videos",
                                    done: client.completedVideos || 0,
                                    total: client.totalVideos || 0,
                                },
                                {
                                    label: "Shoots",
                                    done: client.completedShoots || 0,
                                    total: client.totalShoots || 0,
                                },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-2xl font-bold">
                                        {stat.done}
                                        <span className="text-base font-normal text-muted-foreground">
                                            /{stat.total}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Tabs ────────────────────────────────────────────── */}
                <Tabs defaultValue="projects" className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto">
                        <TabsTrigger
                            value="projects"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
                        >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Projects
                        </TabsTrigger>
                        <TabsTrigger
                            value="billing"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
                        >
                            <Receipt className="h-4 w-4 mr-2" />
                            Billing
                        </TabsTrigger>
                        <TabsTrigger
                            value="activity"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 pt-2"
                        >
                            <Activity className="h-4 w-4 mr-2" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Projects Tab ───────────────────────────────────── */}
                    <TabsContent value="projects" className="mt-6">
                        {loadingProjects ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 rounded-xl bg-muted/50 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    No projects associated with this client yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.map((proj) => (
                                    <Card
                                        key={proj.id}
                                        className="hover:bg-accent/30 transition-colors cursor-pointer"
                                        onClick={() =>
                                            router.push(`/projects/?projectId=${proj.id}`)
                                        }
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold">{proj.name}</p>
                                                <p className="text-sm text-muted-foreground mt-1 truncate">
                                                    {proj.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={cn(
                                                        "text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                                                        statusColor(proj.status)
                                                    )}
                                                >
                                                    {proj.status}
                                                </span>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground/40" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Billing Tab ─────────────────────────────────────── */}
                    <TabsContent value="billing" className="mt-6">
                        <div className="text-center py-12">
                            <Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Billing integration coming soon
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                View and manage invoices for this client.
                            </p>
                        </div>
                    </TabsContent>

                    {/* ── Activity Tab ────────────────────────────────────── */}
                    <TabsContent value="activity" className="mt-6">
                        <div className="text-center py-12">
                            <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Activity timeline coming soon
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Track interactions, meetings, and updates.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </Main>
    );
}
