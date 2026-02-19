"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
      handleLoad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLeadId]);

  const handleLoad = async () => {
    if (!leadId) {
      toast.error("Please enter a Lead ID");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`/api/lead/${leadId}/follow-ups`);

      const data = res.data;

      if (data.success) {
        setFollowUps(data.followUps || []);
        if (data.followUps.length === 0) {
          toast.info("No follow-ups found for this lead");
        } else {
          toast.success(`Found ${data.followUps.length} follow-up(s)`);
        }
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

  return (
    <div className="w-full flex justify-center mt-40 px-4">
      <Card className="w-full max-w-4xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            View Follow-ups
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              placeholder="Enter Lead ID"
              type="number"
            />
            <Button onClick={handleLoad} disabled={loading}>
              {loading ? "Loading..." : "Load Follow-ups"}
            </Button>
          </div>

          {followUps.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Follow-up History</h3>
              {followUps.map((followUp, index) => (
                <Card key={index} className="border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-800">
                        {followUp.note}
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Call Time:</span>{" "}
                          {new Date(followUp.callTime).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={`px-2 py-1 rounded ${followUp.callStatus === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : followUp.callStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {followUp.callStatus}
                          </span>
                        </p>
                        {followUp.createdAt && (
                          <p>
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(followUp.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
