"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function SocialViewPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [socialEntries, setSocialEntries] = useState<any[]>([]);

  // Fetch all social entries on mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await axios.get("/api/socialmediacalendar/social-all");
        if (res.data.success) {
          setSocialEntries(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch entries", err);
        toast.error("Failed to load list of entries");
      }
    };
    fetchEntries();
  }, []);

  const handleLoad = async () => {
    if (!id) {
      toast.error("Please select an ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/socialmediacalendar/${id}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
        toast.success("Data loaded successfully");
      } else {
        toast.error(result.error?.message || "Failed to load data");
        setData(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Server Error");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-20 px-4">
      <Card className="w-full max-w-2xl shadow-md rounded-xl border">
        <CardHeader>
          <CardTitle className="flex flex-col text-2xl font-bold text-gray-800 dark:text-gray-300">
            <span>Social Entry Details</span>
            <span className="text-gray-400 text-sm">(View By ID)</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ID Selection */}
          <div className="flex gap-4 items-end">
            <div className="w-full space-y-2">
              <Label>Select Entry ID</Label>
              <Select onValueChange={setId} value={id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Social Entry" />
                </SelectTrigger>
                <SelectContent>
                  {socialEntries.map((entry) => (
                    <SelectItem key={entry.id} value={String(entry.id)}>
                      #{entry.id} - {entry.title} ({entry.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLoad} disabled={loading || !id} className="mb-px">
              {loading ? "Loading..." : "Load Data"}
            </Button>
          </div>

          {/* Details Display */}
          {data ? (
            <div className="mt-6 border rounded-lg p-6 bg-muted/20 space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold">{data.title}</h3>
                  <p className="text-sm text-muted-foreground">ID: {data.id}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                  data.status === 'POSTED' ? "bg-green-100 text-green-800" :
                    data.status === 'SCHEDULED' ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                )}>
                  {data.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="font-semibold text-gray-500 block">Client ID</span>
                  <span>{data.clientId || "N/A"}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-gray-500 block">Media Type</span>
                  <span>{data.mediaType || "N/A"}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-gray-500 block">Scheduled At</span>
                  <span>{data.scheduledAt ? new Date(data.scheduledAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-gray-500 block">Color Format</span>
                  <div className="flex items-center gap-2">
                    {data.colorFormat && (
                      <div
                        className="w-4 h-4 rounded-full border shadow-sm"
                        style={{ backgroundColor: data.colorFormat }}
                      />
                    )}
                    <span>{data.colorFormat || "N/A"}</span>
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="font-semibold text-gray-500 block">Reference Link</span>
                  <a href={data.referenceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {data.referenceLink || "N/A"}
                  </a>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="font-semibold text-gray-500 block">Media Link</span>
                  <a href={data.mediaLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {data.mediaLink || "N/A"}
                  </a>
                </div>
                <div className="col-span-2 space-y-1 mt-2">
                  <span className="font-semibold text-gray-500 block">Notes</span>
                  <div className="bg-white p-3 rounded border text-gray-700 italic">
                    {data.notes || "No notes available."}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t mt-4 flex justify-between">
                <span>Created By: {data.createdBy}</span>
                <span>Created At: {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>

            </div>
          ) : (
            !loading && id && <div className="text-center text-gray-500 py-8">Select an entry and click Load to see details.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
