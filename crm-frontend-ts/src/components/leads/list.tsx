/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  User,
  Building,
  Phone,
  Briefcase,
  Search,
  History,
  Activity
} from "lucide-react";

interface Lead {
  id: number;
  name: string;
  phoneNumber: string;
  business: string;
  employee?: {
    id: number;
    name?: string;
  };
  status?: string;
}

type SortField = "name" | "business" | "status" | "id";

export default function LeadsList({
  onSelectLead: _onSelectLead,
  onViewFollowUps,
  onUpdateStatus,
}: {
  onSelectLead?: (_id: number) => void;
  onViewFollowUps?: (_id: number) => void;
  onUpdateStatus?: (_id: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [isCompact, setIsCompact] = useState(false);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/lead/list");
      const data = res.data;
      if (data.success) {
        setLeads(data.leads || []);
      } else {
        toast.error(data.error?.message || "Failed to load leads");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to load leads");
      } else {
        toast.error("Failed to load leads");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = leads
    .filter((lead) => {
      const searchStr = `${lead.name} ${lead.business} ${lead.phoneNumber} ${lead.employee?.name || ""} ${lead.status || ""}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortField === "id") return b.id - a.id; // Newest by default based on ID
      const valA = String(a[sortField] || "").toLowerCase();
      const valB = String(b[sortField] || "").toLowerCase();
      return valA.localeCompare(valB);
    });

  const getStatusColor = (status: string | undefined) => {
    const s = (status || "").toLowerCase();
    if (s.includes("won") || s.includes("success") || s.includes("converted")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
    if (s.includes("lost") || s.includes("dead") || s.includes("junk")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
    if (s.includes("hot") || s.includes("warm") || s.includes("active")) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    if (s.includes("follow") || s.includes("progress")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  };

  return (
    <Card className="w-full shadow-md border rounded-2xl overflow-hidden">
      <CardContent className="p-0">

        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-card border-b">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, business, phone..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Label htmlFor="sort" className="text-sm font-medium text-muted-foreground">Sort</Label>
              <select
                id="sort"
                className="border rounded-md px-3 py-1.5 text-sm bg-background"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
              >
                <option value="id">Latest</option>
                <option value="name">Name</option>
                <option value="business">Business</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 border-l pl-4">
              <Switch id="compact-toggle" checked={isCompact} onCheckedChange={setIsCompact} />
              <Label htmlFor="compact-toggle" className="text-sm cursor-pointer whitespace-nowrap">Compact</Label>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 border-l pl-4">
              <Button variant="outline" size="sm" onClick={loadLeads} disabled={loading}>
                {loading ? "..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>

        {/* LIST VIEW */}
        <div className="p-5 bg-muted/20">
          {loading && leads.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-medium border rounded-xl bg-card">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-medium border rounded-xl bg-card">
              {searchTerm ? "No leads matched your search." : "No leads found. Create one to get started!"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center justify-between bg-card border rounded-xl shadow-sm hover:shadow-md transition-all gap-4 overflow-hidden relative group",
                    isCompact ? "p-3" : "p-5"
                  )}
                >
                  {/* LEFT INFO SIDE */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Primary Details */}
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500",
                        isCompact ? "w-10 h-10" : "w-12 h-12"
                      )}>
                        <User className={isCompact ? "w-5 h-5" : "w-6 h-6"} />
                      </div>
                      <div className="space-y-1">
                        <h3 className={cn("font-bold text-foreground leading-none", isCompact ? "text-base" : "text-lg")}>
                          {lead.name}
                          <span className="text-xs text-muted-foreground ml-2 font-normal hidden group-hover:inline-block">#{lead.id}</span>
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 pt-1">
                          <Building className="w-3.5 h-3.5" />
                          {lead.business || "No Business Listed"}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {lead.phoneNumber || "No Phone"}
                        </p>
                      </div>
                    </div>

                    {/* Secondary Details & Status */}
                    <div className="flex flex-col justify-center space-y-3 md:border-l md:pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Status</span>
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", getStatusColor(lead.status))}>
                          {lead.status || "UNASSIGNED"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Owner</span>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                          {lead.employee ? lead.employee.name || `ID: ${lead.employee.id}` : <span className="text-muted-foreground italic">Unassigned</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className={cn(
                    "flex flex-wrap items-center gap-2 lg:border-l lg:pl-4",
                    isCompact ? "pt-2 border-t lg:border-t-0" : "pt-4 border-t lg:border-t-0 lg:pt-0"
                  )}>
                    <Button
                      variant="secondary"
                      size={isCompact ? "sm" : "default"}
                      className="flex-1 lg:flex-none whitespace-nowrap"
                      onClick={() => onViewFollowUps?.(lead.id)}
                    >
                      <History className="w-4 h-4 mr-1.5" />
                      Follow-ups
                    </Button>
                    <Button
                      variant="default"
                      size={isCompact ? "sm" : "default"}
                      className="flex-1 lg:flex-none whitespace-nowrap"
                      onClick={() => onUpdateStatus?.(lead.id)}
                    >
                      <Activity className="w-4 h-4 mr-1.5" />
                      Update
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
