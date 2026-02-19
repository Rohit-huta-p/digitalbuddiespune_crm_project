"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Project {
  socialMediaCalendarId: number;
  clientId: number;
  companyId: number;
  startDate: string;
  endDate: string;
  contentIdea: string;
  socialPlatform: string;
  status: string;
  // Add other fields as needed
}

export default function GetClientProjectsPage() {
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  const handleFetch = async () => {
    if (!clientId) {
      toast.error("Please enter Client ID");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `/api/get-client-projects?clientId=${clientId}`
      );

      const data = res.data;

      if (data.success && data.data) {
        setProjects(data.data);
        toast.success(`Fetched ${data.data.length} projects`);
      } else {
        toast.error(data.error?.message || "Something went wrong");
        setProjects([]);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        toast.error(err.response.data.error?.message || "Failed to fetch projects");
      } else {
        toast.error("Failed to fetch projects");
      }
      setProjects([]);
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-6xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Get Client Projects
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Client ID *"
              type="number"
              className="flex-1"
            />
            <Button disabled={loading} onClick={handleFetch}>
              {loading ? "Fetching..." : "Load Projects"}
            </Button>
          </div>

          {projects.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left text-sm font-semibold">Project ID</th>
                    <th className="p-3 text-left text-sm font-semibold">Client ID</th>
                    <th className="p-3 text-left text-sm font-semibold">Company ID</th>
                    <th className="p-3 text-left text-sm font-semibold">Start Date</th>
                    <th className="p-3 text-left text-sm font-semibold">End Date</th>
                    <th className="p-3 text-left text-sm font-semibold">Content Idea</th>
                    <th className="p-3 text-left text-sm font-semibold">Platform</th>
                    <th className="p-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.socialMediaCalendarId} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{project.socialMediaCalendarId}</td>
                      <td className="p-3 text-sm">{project.clientId}</td>
                      <td className="p-3 text-sm">{project.companyId}</td>
                      <td className="p-3 text-sm">
                        {new Date(project.startDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(project.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate" title={project.contentIdea}>
                        {project.contentIdea}
                      </td>
                      <td className="p-3 text-sm">{project.socialPlatform}</td>
                      <td className="p-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs ${project.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {projects.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-4">
              No projects loaded. Enter a Client ID and click Load Projects.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
