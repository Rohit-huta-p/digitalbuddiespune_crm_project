"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UpdateClientWorkPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    completedPosts: "",
    completedVideos: "",
    completedShoots: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.clientId) {
      toast.error("Please enter Client ID");
      return;
    }

    if (!form.completedPosts && !form.completedVideos && !form.completedShoots) {
      toast.error("Please enter at least one completion value");
      return;
    }

    setLoading(true);

    try {
      const payload: {
        clientId: number;
        completedPosts?: number;
        completedVideos?: number;
        completedShoots?: number;
      } = { clientId: parseInt(form.clientId) };

      if (form.completedPosts) payload.completedPosts = parseInt(form.completedPosts);
      if (form.completedVideos) payload.completedVideos = parseInt(form.completedVideos);
      if (form.completedShoots) payload.completedShoots = parseInt(form.completedShoots);

      const res = await axios.put("/api/update-work", payload);

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Work progress updated successfully");
        setForm({
          clientId: "",
          completedPosts: "",
          completedVideos: "",
          completedShoots: "",
        });
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to update work progress");
      } else {
        toast.error("Failed to update work progress");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Update Client Work Progress
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            placeholder="Client ID *"
            type="number"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="completedPosts"
              value={form.completedPosts}
              onChange={handleChange}
              placeholder="Completed Posts"
              type="number"
            />

            <Input
              name="completedVideos"
              value={form.completedVideos}
              onChange={handleChange}
              placeholder="Completed Videos"
              type="number"
            />

            <Input
              name="completedShoots"
              value={form.completedShoots}
              onChange={handleChange}
              placeholder="Completed Shoots"
              type="number"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Tip: Enter only the fields you want to update. Leave others blank.
            </p>
          </div>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Updating..." : "Update Work Progress"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
