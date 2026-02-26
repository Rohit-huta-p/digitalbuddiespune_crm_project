"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  History,
  Hash,
  MessageSquare,
  Clock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface FollowUp {
  note: string;
  callTime: string;
  callStatus: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
}

export default function ViewFollowUpsPage({ defaultLeadId }: { defaultLeadId?: number }) {
  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState(defaultLeadId ? String(defaultLeadId) : "");
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    if (defaultLeadId) {
      setLeadId(String(defaultLeadId));
      handleLoad(String(defaultLeadId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLeadId]);

  const handleLoad = async (idToLoad?: string) => {
    const targetId = idToLoad || leadId;
    if (!targetId) {
      toast.error("Please enter a Lead ID");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`/api/lead/${targetId}/follow-ups`);

      const data = res.data;

      if (data.success) {
        setFollowUps(data.followUps || []);
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to load follow-ups");
      } else {
        toast.error("Failed to load follow-ups");
      }
      setFollowUps([]);
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusTagClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="w-full flex justify-center mt-2 px-2">
      <Card className="w-full max-w-4xl shadow-sm border rounded-2xl">
        <CardHeader className="bg-muted/30 border-b pb-4 mb-4">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Follow-up History
            </div>
            {followUps.length > 0 && (
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {followUps.length} Records
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* LOAD CONTROLS (Only show if no defaultLeadId is strictly passed, or just show it disabled/locked) */}
          <div className="flex flex-col md:flex-row items-end gap-3 p-4 bg-muted/20 border rounded-xl">
            <div className="flex-1 w-full space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Target Lead ID
              </Label>
              <Input
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                placeholder="Enter Lead ID to lookup"
                type="number"
                disabled={!!defaultLeadId}
                className="bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLoad();
                }}
              />
            </div>
            <Button
              onClick={() => handleLoad()}
              disabled={loading || !leadId}
              className="w-full md:w-auto mt-2 md:mt-0"
              variant="secondary"
            >
              {loading ? "Loading..." : "Load History"}
            </Button>
          </div>

          {/* TIMELINE VIEW (ACTIVITY FEED) */}
          <div className="pt-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground border rounded-xl bg-muted/10">Loading history...</div>
            ) : followUps.length > 0 ? (
              <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4">
                {followUps.map((followUp, index) => (
                  <div key={index} className="relative pl-6 sm:pl-8 group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[17px] top-1 bg-background rounded-full p-1 border-2 border-muted group-hover:border-blue-200 transition-colors">
                      {getStatusIcon(followUp.callStatus)}
                    </div>

                    <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                        {/* Note & Content */}
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-foreground text-sm flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{followUp.note}</span>
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span className={cn(
                          "px-2.5 py-0.5 text-xs font-semibold rounded-full border whitespace-nowrap",
                          getStatusTagClass(followUp.callStatus)
                        )}>
                          {followUp.callStatus}
                        </span>
                      </div>

                      {/* Footer Timestamps */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span className="uppercase tracking-wider">Scheduled:</span>
                          <span className="text-foreground">{new Date(followUp.callTime).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata", weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}</span>
                        </div>

                        {followUp.createdAt && (
                          <div className="flex items-center gap-1.5 border-l-0 sm:border-l pl-0 sm:pl-6">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="uppercase tracking-wider">Logged on:</span>
                            <span className="text-foreground">{new Date(followUp.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground border rounded-xl bg-card">
                No follow-up records exist yet for this lead.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
