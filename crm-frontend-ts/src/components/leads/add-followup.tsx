"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Hash, MessageSquarePlus, Clock } from "lucide-react";

export default function AddFollowUpPage({ defaultLeadId }: { defaultLeadId?: number }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leadId: defaultLeadId ? String(defaultLeadId) : "",
    note: "",
    callTime: "",
    callStatus: "PENDING",
  });

  useEffect(() => {
    if (defaultLeadId) setForm((f) => ({ ...f, leadId: String(defaultLeadId) }));
  }, [defaultLeadId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.leadId || !form.note || !form.callTime) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`/api/lead/${form.leadId}/follow-up`, {
        note: form.note,
        callTime: form.callTime,
        callStatus: form.callStatus,
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Follow-up added successfully");
        setForm({ leadId: "", note: "", callTime: "", callStatus: "PENDING" });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to add follow-up");
      } else {
        toast.error("Failed to add follow-up");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-2 px-2">
      <Card className="w-full max-w-2xl shadow-sm border rounded-2xl">
        <CardHeader className="bg-muted/30 border-b pb-4 mb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-blue-600" />
            Add Follow-up Log
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Lead ID
            </Label>
            <Input
              name="leadId"
              value={form.leadId}
              onChange={handleChange}
              placeholder="e.g. 12"
              type="number"
              className="bg-muted/20"
              disabled={!!defaultLeadId} // Prevent changing ID if navigating from a specific lead
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Follow-up Note
            </Label>
            <Textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="e.g., Client requested a callback tomorrow morning regarding pricing..."
              rows={4}
              className="resize-none bg-muted/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Scheduled Call Time
              </Label>
              <Input
                name="callTime"
                value={form.callTime}
                onChange={handleChange}
                type="datetime-local"
                className="bg-muted/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Status</Label>
              <Select
                value={form.callStatus}
                onValueChange={(val) => setForm({ ...form, callStatus: val })}
              >
                <SelectTrigger className="w-full bg-muted/20">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full h-11 text-base shadow-sm mt-4" disabled={loading} onClick={handleSubmit}>
            {loading ? "Saving Follow-up..." : "Save Follow-up"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
