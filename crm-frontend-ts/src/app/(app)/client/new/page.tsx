"use client";
// /app/(app)/client/new/page.tsx
import { Main } from "@/components/layout/main";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ClientCreatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phno, setPhno] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateClient = async () => {
    if (!name || !phno || !email || !password) {
      toast.error("Please fill out all the fields.");
      return;
    }

    try {
      const response = await fetch("/api/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phno,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message || "Failed to create client");
      }

      toast.success(result.message || "Client created successfully");
      router.push("/client");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      console.error("Client creation error:", err);
    }
  };

  return (
    <Main className="w-full h-full  flex items-center justify-center">
      <Card className="w-full max-w-xl shadow-xl border border-muted rounded-2xl">
        <CardHeader className="text-center space-y-1 bg-muted/50 rounded-t-2xl px-6 py-5">
          <CardTitle className="text-3xl font-bold tracking-tight">
            ✨ Add New Client
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill out the details to register a new client
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. Bhavarth Nagavkar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phno">Phone Number</Label>
            <Input
              id="phno"
              placeholder="e.g. 1234567809"
              value={phno}
              onChange={(e) => setPhno(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Set a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full mt-6 text-base rounded-xl"
            size="lg"
            onClick={handleCreateClient}
          >
            🚀 Create Client
          </Button>
        </CardContent>
      </Card>
    </Main>
  );
}
