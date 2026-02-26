"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SocialEntry {
  id: number;
  title: string;
  clientId: number;
  mediaType: string;
  status: "SCHEDULED" | "DRAFT" | "POSTED";
  scheduledAt: string;
  mediaLink?: string;
  notes?: string;
}

export default function SocialListByStatusPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<SocialEntry[]>([]);

  const handleFetch = async () => {
    if (!status) {
      toast.error("Select a status");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/socialmediacalendar/social-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (result.success) {
        setList(result.data || []);
        toast.success(`Found ${result.data?.length || 0} entries`);
      } else {
        toast.error(result.error?.message || "Failed to load data");
        setList([]);
      }
    } catch {
      toast.error("Server Error");
      setList([]);
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-20 px-4">
      <Card className="w-full max-w-3xl shadow-md rounded-xl border">
        <CardHeader>
          <CardTitle className="flex flex-col text-2xl font-bold text-gray-800 dark:text-gray-300">
            <span>Social Media</span>
            <span className="text-gray-400 text-sm">(List By Status)</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Selection */}
          <div className="flex gap-4 items-end">
            <div className="w-full space-y-2">
              <Label>Select Status</Label>
              <Select onValueChange={setStatus} value={status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="POSTED">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button disabled={loading || !status} onClick={handleFetch} className="mb-px">
              {loading ? "Loading..." : "Fetch Posts"}
            </Button>
          </div>

          {/* Results */}
          {list.length > 0 ? (
            <div className="space-y-3 mt-5">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Posts ({list.length})
              </h3>
              {list.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-muted/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground mr-2">#{item.id}</span>
                      <span className="font-bold text-lg">{item.title}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      item.status === 'POSTED' ? "bg-green-100 text-green-800" :
                        item.status === 'SCHEDULED' ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                    )}>
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mt-2">
                    <p><span className="font-semibold">Media:</span> {item.mediaType}</p>
                    <p><span className="font-semibold">Scheduled:</span> {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : 'N/A'}</p>

                    {item.notes && (
                      <p className="col-span-2 mt-2 bg-white p-2 rounded border text-xs italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            list.length === 0 && !loading && status && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-xl mt-4">
                <p>No social media entries found for this status.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
