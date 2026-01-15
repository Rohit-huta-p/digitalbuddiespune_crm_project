"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SocialViewPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleLoad = async () => {
    if (!id) {
      toast.error("Please enter an ID");
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
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Server Error");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-2xl shadow-md rounded-xl border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            📌 Social Entry Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Social Media Entry ID"
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <Button onClick={handleLoad} disabled={loading}>
              {loading ? "Loading..." : "Load"}
            </Button>
          </div>

          {data && (
            <div className="space-y-3 text-sm mt-6 border-t pt-4">
              <p><b>ID:</b> {data.id}</p>
              <p><b>Client ID:</b> {data.clientId}</p>
              <p><b>Title:</b> {data.title}</p>
              <p><b>Media Type:</b> {data.mediaType}</p>
              <p><b>Reference Link:</b> {data.referenceLink}</p>
              <p><b>Media Link:</b> {data.mediaLink}</p>
              <p><b>Color Format:</b> {data.colorFormat}</p>
              <p><b>Scheduled At:</b> {data.scheduledAt}</p>
              <p><b>Status:</b> {data.status}</p>
              <p><b>Created By:</b> {data.createdBy}</p>
              <p><b>Created At:</b> {data.createdAt}</p>
              <p><b>Notes:</b> {data.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
