"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function SocialListByClientPage() {
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  const handleFetch = async () => {
    if (!clientId) {
      toast.error("Enter Client ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/socialmediacalendar/social-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: Number(clientId) }),
      });

      const result = await res.json();

      if (result.success) {
        setList(result.data || []);
        toast.success(`Found ${result.data?.length || 0} entries`);
      } else {
        toast.error(result.error?.message || "Failed to load data");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Server error");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-3xl shadow-md rounded-xl border">
        <CardHeader>
          <CardTitle className="text-2xl">
            📌 Social Media List By Client
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Input + Button */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
            <Button disabled={loading} onClick={handleFetch}>
              {loading ? "Loading..." : "Fetch"}
            </Button>
          </div>

          {/* Results */}
          {list.length > 0 && (
            <div className="space-y-3 mt-5">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 bg-muted/20 shadow-sm"
                >
                  <p><b>ID:</b> {item.id}</p>
                  <p><b>Title:</b> {item.title}</p>
                  <p><b>Media:</b> {item.mediaType}</p>
                  <p><b>Scheduled At:</b> {item.scheduledAt}</p>
                  <p><b>Status:</b> {item.status}</p>
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
