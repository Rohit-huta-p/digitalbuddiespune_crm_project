"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function SocialDeletePage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!id) {
      toast.error("Please enter an ID");
      return;
    }

    if (!confirm(`Are you sure you want to delete entry #${id}?`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.delete(`/api/socialmediacalendar/${id}`);

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Deleted successfully");
        setId("");
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Delete failed");
      } else {
        toast.error("Delete failed");
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-2xl shadow-md rounded-xl border border-red-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            🗑️ Delete Social Entry
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">⚠️ Warning</p>
            <p className="text-red-600 text-sm mt-1">
              This action cannot be undone. The entry will be permanently deleted.
            </p>
          </div>

          <Input
            placeholder="Enter Social Media Entry ID to delete"
            type="number"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <Button
            onClick={handleDelete}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete Entry"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
