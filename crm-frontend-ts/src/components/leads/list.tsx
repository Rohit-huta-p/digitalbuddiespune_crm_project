/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Lead {
  id: number;
  name: string;
  phoneNumber: string;
  business: string;
  employee?: {
    id: number;
    name?: string;
  };
  status?: string;
}

export default function LeadsList({
  onSelectLead: _onSelectLead,
  onViewFollowUps,
  onAddFollowUp,
  onUpdateStatus,
}: {
  onSelectLead?: (_id: number) => void;
  onViewFollowUps?: (_id: number) => void;
  onAddFollowUp?: (_id: number) => void;
  onUpdateStatus?: (_id: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/lead/list");
      const data = res.data;
      if (data.success) {
        setLeads(data.leads || []);
      } else {
        toast.error(data.error?.message || "Failed to load leads");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to load leads");
      } else {
        toast.error("Failed to load leads");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <div className="w-full px-4 mt-40">
      <Card className="w-full shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">All Leads</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total: {leads.length}</div>
            <div className="flex gap-2">
              <Button onClick={loadLeads} disabled={loading} className="h-9">
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm text-gray-600 dark:text-gray-400 border-b">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Business</th>
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: Lead) => (
                  <tr key={lead.id} className="border-t">
                    <td className="py-2 pr-4 text-sm">{lead.id}</td>
                    <td className="py-2 pr-4 text-sm">{lead.name}</td>
                    <td className="py-2 pr-4 text-sm">{lead.phoneNumber}</td>
                    <td className="py-2 pr-4 text-sm">{lead.business}</td>
                    <td className="py-2 pr-4 text-sm">
                      {lead.employee ? `${lead.employee.id}${lead.employee.name ? ` — ${lead.employee.name}` : ""}` : "-"}
                    </td>
                    <td className="py-2 pr-4 text-sm">{lead.status || "-"}</td>
                    <td className="py-2 pr-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            onViewFollowUps?.(lead.id);
                          }}
                        >
                          View Follow-ups
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            onAddFollowUp?.(lead.id);
                          }}
                        >
                          Add Follow-up
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            onUpdateStatus?.(lead.id);
                          }}
                        >
                          Update Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
