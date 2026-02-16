"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Main } from "@/components/layout/main";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    Search,
    Plus,
    Trash2,
    Mail,
    Phone,
    ChevronRight,
    Users,
    Loader2,
    LayoutList,
    LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────
interface Client {
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

type SortField = "name" | "email" | "phno";

// ─── Progress helpers ───────────────────────────────────────────────────
function getProgress(client: Client) {
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
}

function progressColor(pct: number) {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-400";
    if (pct > 0) return "bg-orange-400";
    return "bg-zinc-200 dark:bg-zinc-700";
}

function avatarGradient(name: string) {
    const gradients = [
        "from-violet-500 to-purple-600",
        "from-sky-500 to-blue-600",
        "from-emerald-500 to-teal-600",
        "from-rose-500 to-pink-600",
        "from-amber-500 to-orange-600",
        "from-indigo-500 to-blue-600",
        "from-cyan-500 to-teal-600",
        "from-fuchsia-500 to-pink-600",
    ];
    const idx = name.charCodeAt(0) % gradients.length;
    return gradients[idx];
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function ClientsPage() {
    const router = useRouter();

    // Data
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    // Toolbar
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<SortField>("name");
    const [isCompact, setIsCompact] = useState(false);

    // Sheet (Create)
    const [sheetOpen, setSheetOpen] = useState(false);
    const [formName, setFormName] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Delete
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    // ── Fetch ─────────────────────────────────────────────────────────────
    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/get-all-clients", { method: "POST" });
            const data = await res.json();
            setClients(data.data || []);
        } catch {
            toast.error("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    // ── Create ────────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!formName || !formPhone || !formEmail || !formPassword) {
            toast.error("Please fill out all fields.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/create-client", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formName,
                    phno: formPhone,
                    email: formEmail,
                    password: formPassword,
                }),
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result?.error?.message || "Failed to create client");
            }

            toast.success(result.message || "Client created!");
            resetForm();
            setSheetOpen(false);
            fetchClients();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormName("");
        setFormPhone("");
        setFormEmail("");
        setFormPassword("");
    };

    // ── Delete ────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!clientToDelete) return;
        setDeleting(true);

        try {
            const res = await fetch(
                `/api/delete-client?clientId=${clientToDelete.clientId}`,
                { method: "DELETE" }
            );
            const result = await res.json();

            if (!res.ok) {
                let message = "Failed to delete client";
                const raw = result?.error?.message || result?.error || "";
                if (raw.includes("foreign key constraint") || raw.includes("DataIntegrityViolation")) {
                    message = `Cannot delete ${clientToDelete.name} — they have associated projects. Remove all project associations first.`;
                } else if (typeof raw === "string" && raw.length < 200) {
                    message = raw;
                }
                throw new Error(message);
            }

            toast.success(`${clientToDelete.name} deleted successfully`);
            setClients((prev) =>
                prev.filter((c) => c.clientId !== clientToDelete.clientId)
            );
            setDeleteDialogOpen(false);
            setClientToDelete(null);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setDeleting(false);
        }
    };

    // ── Filter + Sort ─────────────────────────────────────────────────────
    const filteredClients = clients
        .filter((c) =>
            `${c.name} ${c.email} ${c.phno}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) =>
            a[sortField].localeCompare(b[sortField], "en", { sensitivity: "base" })
        );

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <Main>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* ━━━ Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {clients.length} total client{clients.length !== 1 && "s"}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            resetForm();
                            setSheetOpen(true);
                        }}
                        className="gap-2 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Client
                    </Button>
                </div>

                <Separator />

                {/* ━━━ Toolbar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-muted/40 border-transparent focus:bg-background focus:border-input transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <Select
                            value={sortField}
                            onValueChange={(v) => setSortField(v as SortField)}
                        >
                            <SelectTrigger className="w-[130px] bg-muted/40 border-transparent">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phno">Phone</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Compact Toggle */}
                        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
                            <LayoutList
                                className={cn(
                                    "h-4 w-4 transition-colors",
                                    isCompact
                                        ? "text-foreground"
                                        : "text-muted-foreground/50"
                                )}
                            />
                            <Switch
                                id="compact"
                                checked={isCompact}
                                onCheckedChange={setIsCompact}
                            />
                            <LayoutGrid
                                className={cn(
                                    "h-4 w-4 transition-colors",
                                    !isCompact
                                        ? "text-foreground"
                                        : "text-muted-foreground/50"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* ━━━ Client List ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {loading ? (
                    <div className="space-y-2">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "rounded-xl bg-muted/40 animate-pulse",
                                    isCompact ? "h-14" : "h-[72px]"
                                )}
                            />
                        ))}
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <p className="font-medium text-muted-foreground">
                            {clients.length === 0 ? "No clients yet" : "No results found"}
                        </p>
                        <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs text-center">
                            {clients.length === 0
                                ? "Add your first client to get started."
                                : "Try a different search term."}
                        </p>
                        {clients.length === 0 && (
                            <Button
                                variant="outline"
                                className="mt-5 gap-2"
                                onClick={() => setSheetOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Add Client
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredClients.map((client) => {
                            const progress = getProgress(client);
                            return (
                                <div
                                    key={client.clientId}
                                    onClick={() => router.push(`/clients/${client.clientId}`)}
                                    className={cn(
                                        "group relative flex items-center gap-4 rounded-xl border border-transparent",
                                        "hover:border-border hover:bg-accent/40 cursor-pointer",
                                        "transition-all duration-150 ease-out",
                                        isCompact ? "px-3 py-2.5" : "px-4 py-3.5"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={cn(
                                            "flex-shrink-0 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold shadow-sm",
                                            avatarGradient(client.name),
                                            isCompact ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
                                        )}
                                    >
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={cn(
                                                "font-medium text-foreground truncate",
                                                isCompact ? "text-sm" : "text-[15px]"
                                            )}
                                        >
                                            {client.name}
                                        </p>
                                        {!isCompact && (
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 truncate">
                                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                                    {client.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                    {client.phno}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress */}
                                    <div className="hidden md:flex items-center gap-2.5 w-36">
                                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    progressColor(progress)
                                                )}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[11px] font-medium text-muted-foreground tabular-nums w-7 text-right">
                                            {progress}%
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-0.5">
                                        <button
                                            className={cn(
                                                "p-1.5 rounded-md text-muted-foreground/40",
                                                "opacity-0 group-hover:opacity-100",
                                                "hover:text-destructive hover:bg-destructive/10",
                                                "transition-all duration-150"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setClientToDelete(client);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ━━━ Footer Stats ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {!loading && clients.length > 0 && (
                    <div className="text-xs text-muted-foreground/60 pt-2">
                        Showing {filteredClients.length} of {clients.length} clients
                    </div>
                )}
            </div>

            {/* ━━━ Create Client Sheet ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
                    <SheetHeader className="pb-6">
                        <SheetTitle className="text-xl">Add New Client</SheetTitle>
                        <SheetDescription>
                            Fill in the details below to register a new client account.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="sheet-name" className="text-sm font-medium">
                                Full Name
                            </Label>
                            <Input
                                id="sheet-name"
                                placeholder="e.g. Bhavarth Nagavkar"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="bg-muted/40 border-transparent focus:bg-background focus:border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sheet-phone" className="text-sm font-medium">
                                Phone Number
                            </Label>
                            <Input
                                id="sheet-phone"
                                placeholder="e.g. 9876543210"
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                className="bg-muted/40 border-transparent focus:bg-background focus:border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sheet-email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="sheet-email"
                                type="email"
                                placeholder="e.g. client@example.com"
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                className="bg-muted/40 border-transparent focus:bg-background focus:border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sheet-password" className="text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                id="sheet-password"
                                type="password"
                                placeholder="Set a login password"
                                value={formPassword}
                                onChange={(e) => setFormPassword(e.target.value)}
                                className="bg-muted/40 border-transparent focus:bg-background focus:border-input"
                            />
                        </div>

                        <Separator className="my-2" />

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setSheetOpen(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 gap-2"
                                onClick={handleCreate}
                                disabled={submitting}
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? "Creating..." : "Create Client"}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ━━━ Delete Dialog ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {clientToDelete?.name}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="gap-2"
                        >
                            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Main>
    );
}
