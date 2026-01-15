"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Client {
  clientId: number;
  name: string;
  phno: string;
  email: string;
  companyId: number;
  numberOfPosts?: number;
  numberOfVideos?: number;
  numberOfShoots?: number;
  totalTarget?: number;
  completedPosts?: number;
  completedVideos?: number;
  completedShoots?: number;
}

export default function ViewAllClientsPage() {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const handleFetch = async () => {
    setLoading(true);

    try {
      const res = await axios.get("/api/getAll-clients");

      const data = res.data;

      if (data.success && data.data) {
        setClients(data.data);
        toast.success("Clients fetched successfully");
      } else {
        toast.error(data.error?.message || "Something went wrong");
        setClients([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to fetch clients");
      setClients([]);
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-6xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            View All Clients
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full" disabled={loading} onClick={handleFetch}>
            {loading ? "Fetching..." : "Load All Clients"}
          </Button>

          {clients.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left text-sm font-semibold">ID</th>
                    <th className="p-3 text-left text-sm font-semibold">Name</th>
                    <th className="p-3 text-left text-sm font-semibold">Phone</th>
                    <th className="p-3 text-left text-sm font-semibold">Email</th>
                    <th className="p-3 text-left text-sm font-semibold">Company ID</th>
                    <th className="p-3 text-left text-sm font-semibold">Posts</th>
                    <th className="p-3 text-left text-sm font-semibold">Videos</th>
                    <th className="p-3 text-left text-sm font-semibold">Shoots</th>
                    <th className="p-3 text-left text-sm font-semibold">Total Target</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.clientId} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{client.clientId}</td>
                      <td className="p-3 text-sm">{client.name}</td>
                      <td className="p-3 text-sm">{client.phno}</td>
                      <td className="p-3 text-sm">{client.email}</td>
                      <td className="p-3 text-sm">{client.companyId}</td>
                      <td className="p-3 text-sm">
                        {client.completedPosts || 0}/{client.numberOfPosts || 0}
                      </td>
                      <td className="p-3 text-sm">
                        {client.completedVideos || 0}/{client.numberOfVideos || 0}
                      </td>
                      <td className="p-3 text-sm">
                        {client.completedShoots || 0}/{client.numberOfShoots || 0}
                      </td>
                      <td className="p-3 text-sm">{client.totalTarget || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {clients.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-4">
              No clients loaded. Click the button above to fetch clients.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
