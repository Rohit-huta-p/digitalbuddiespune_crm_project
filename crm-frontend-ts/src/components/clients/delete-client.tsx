"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DeleteClientPage() {
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");

  const handleDelete = async () => {
    if (!clientId) {
      toast.error("Please enter Client ID");
      return;
    }

    if (!confirm(`Are you sure you want to delete client #${clientId}?`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.delete(
        `/api/delete-client?clientId=${clientId}`
      );

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Client deleted successfully");
        setClientId("");
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to delete client");
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-md shadow-md border rounded-2xl border-red-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Delete Client
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ Warning: This action cannot be undone. Deleting a client will
              permanently remove all their data.
            </p>
          </div>

          <Input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Client ID *"
            type="number"
          />

          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting..." : "Delete Client"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
