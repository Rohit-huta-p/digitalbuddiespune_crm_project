"use client";
// app/projects/new/page.tsx
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectSearch,
  MultiSelectList,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectValue,
  MultiSelectEmpty,
} from "@/components/ui/multiselect";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



const allowedRoles = [
  "Frontend_Developer",
  "Backend_Developer",
  "Tester",
  "Manager",
  "Social_Media_Manager",
  "Video_Editor",
  "Graphic_Designer",
  "Videography",
  "Photography",
];

export default function ProjectsCreatePage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [participants, setParticipants] = useState<
    { id: string; role: string }[]
  >([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [groupLeaders, setGroupLeaders] = useState<string[]>([]);
  const [addClient, setAddClient] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    axios
      .post("/api/employees")
      .then((res) => setEmployees(res.data.attributes.employees))
      .catch(console.error);

    axios
      .post("/api/get-all-clients")
      .then((res) => {
        const fetchedClients = res.data.data || [];
        const formattedClients = fetchedClients.map((c: any) => ({
          id: String(c.clientId),
          name: c.name || c.clientName || `Client ${c.clientId}`,
        }));
        setClients(formattedClients);
      })
      .catch(console.error);
  }, []);

  const assignParticipants = () => {
    if (!selectedRole || selectedEmployees.length === 0) return;

    if (!allowedRoles.includes(selectedRole)) {
      toast.error("Invalid role selected.");
      return;
    }

    const newOnes = selectedEmployees.map((id) => ({ id, role: selectedRole }));
    const unique = newOnes.filter(
      (newEmp) => !participants.some((p) => p.id === newEmp.id)
    );

    if (unique.length === 0) {
      toast.info("Selected employees are already added.");
      return;
    }

    setParticipants((prev) => [...prev, ...unique]);
    setSelectedEmployees([]);
    setSelectedRole("");
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setGroupLeaders((prev) => prev.filter((g) => g !== id));
  };

  const createProject = async () => {
    console.log("PROJECT NAME", projectName)
    console.log("PROJECT DESC", projectDesc)
    console.log("PARTICIPANTS", participants)
    console.log("GROUP LEADERS", groupLeaders)
    console.log("CLIENT ID", clientId)
    console.log("CLIENTS", clients)
    if (!projectName) {
      toast.error("Please enter a Project Name.");
      return;
    }

    if (participants.length === 0) {
      if (selectedEmployees.length > 0) {
        toast.error("Please click '+ Add' to assign the selected employees.");
      } else {
        toast.error("Please assign at least one participant.");
      }
      return;
    }

    for (const leaderId of groupLeaders) {
      if (!participants.find((p) => p.id === leaderId)) {
        toast.error("All group leaders must be part of participants.");
        return;
      }
    }

    try {
      const response = await fetch("/api/project-group/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          projectDesc,
          groupLeaderIds: groupLeaders.map(Number),
          clientId: addClient ? clientId : "",
          participants,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to create project");
      }

      toast.success(result.message || "Project created successfully");
      router.push("/projects");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      console.error("API Error:", err);
    }
  };

  return (
    <Main>
      <Card className="max-w-4xl mx-auto border shadow-lg rounded-xl">
        <CardHeader className="bg-muted/50 rounded-t-xl px-6 py-4">
          <CardTitle className="text-2xl font-bold">
            🛠️ Create New Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-10 p-6">
          {/* Basic Info */}
          <section className="space-y-4">
            <div>
              <Label htmlFor="name">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="Short description of the project"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                rows={4}
              />
            </div>
          </section>

          <hr className="border-muted" />

          {/* Participants */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">
                Assign Participants <span className="text-red-500">*</span>
              </Label>
              <Button
                size="sm"
                variant="default"
                onClick={assignParticipants}
                disabled={!selectedRole || !selectedEmployees.length}
              >
                + Add
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <MultiSelect
                  onValueChange={setSelectedEmployees}
                  value={selectedEmployees}
                >
                  <MultiSelectTrigger>
                    <MultiSelectValue placeholder="Select employees" />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectSearch placeholder="Search employees..." />
                    <MultiSelectList>
                      <MultiSelectGroup heading="Employees">
                        {employees.map((emp) => (
                          <MultiSelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectList>
                    <MultiSelectEmpty>No matches found.</MultiSelectEmpty>
                  </MultiSelectContent>
                </MultiSelect>
              </div>
              <Select onValueChange={setSelectedRole} value={selectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    {allowedRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {participants.map((p) => {
                const emp = employees.find((e) => e.id === p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 border rounded-md bg-muted/10"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{emp?.name}</span>
                      <Badge variant="outline" className="w-fit mt-1 text-xs">
                        {p.role.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(p.id)}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          <hr className="border-muted" />

          {/* Leaders + Client */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-semibold">
                Group Leaders <span className="text-red-500">*</span>
              </Label>
              <div className="rounded-md border bg-background px-3 py-2 shadow-sm">
                <MultiSelect
                  onValueChange={setGroupLeaders}
                  value={groupLeaders}
                >
                  <MultiSelectTrigger className="h-10">
                    <MultiSelectValue placeholder="Select leaders from participants" />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectSearch placeholder="Search..." />
                    <MultiSelectList>
                      <MultiSelectGroup heading="Employees">
                        {employees.map((emp) => (
                          <MultiSelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectGroup>
                    </MultiSelectList>
                    <MultiSelectEmpty>No matches</MultiSelectEmpty>
                  </MultiSelectContent>
                </MultiSelect>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="toggle-client"
                  checked={addClient}
                  onCheckedChange={setAddClient}
                />
                <Label htmlFor="toggle-client">Include Client</Label>
              </div>
              <Select
                disabled={!addClient}
                onValueChange={setClientId}
                value={clientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Clients</SelectLabel>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </section>
          <Button className="w-full mt-8" size="lg" onClick={createProject}>
            🚀 Create Project
          </Button>
        </CardContent>
      </Card>
    </Main>
  );
}
