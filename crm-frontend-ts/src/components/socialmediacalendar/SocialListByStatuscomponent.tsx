"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function SocialListByStatusPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  const handleFetch = async () => {
    if (!status) {
      toast.error("Enter a status: SCHEDULED / PUBLISHED");
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
        toast.success("Data loaded");
      } else {
        toast.error(result.error?.message || "Failed to load");
      }
    } catch (err) {
      toast.error("Server Error");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-3xl shadow-md rounded-xl border">
        <CardHeader>
          <CardTitle className="text-2xl">
            📌 Social List by Status
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Input Row */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter Status (SCHEDULED / PUBLISHED)"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
            <Button disabled={loading} onClick={handleFetch}>
              {loading ? "Loading..." : "Fetch"}
            </Button>
          </div>

          {/* Records */}
          {list.length > 0 && (
            <div className="space-y-3 mt-5">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-muted/25 shadow-sm"
                >
                  <p><b>ID:</b> {item.id}</p>
                  <p><b>Title:</b> {item.title}</p>
                  <p><b>Status:</b> {item.status}</p>
                  <p><b>Media:</b> {item.mediaType}</p>
                  <p><b>Scheduled At:</b> {item.scheduledAt}</p>
                  <p><b>Notes:</b> {item.notes}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
