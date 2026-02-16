"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Main } from "@/components/layout/main";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreateClientPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [phno, setPhno] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!name || !phno || !email || !password) {
            toast.error("Please fill out all fields.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/create-client", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phno, email, password }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result?.error?.message || "Failed to create client");
            }

            toast.success(result.message || "Client created successfully");
            router.push("/clients");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Main>
            <div className="max-w-xl mx-auto px-4 py-8">
                {/* Back link */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 mb-6 -ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/clients")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Clients
                </Button>

                <Card className="border shadow-sm">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold tracking-tight">
                            Add New Client
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Enter the client details to create a new account.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-5">
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
                                placeholder="e.g. 9876543210"
                                value={phno}
                                onChange={(e) => setPhno(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="e.g. client@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Set a login password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full mt-2"
                            size="lg"
                            onClick={handleCreate}
                            disabled={submitting}
                        >
                            {submitting ? "Creating..." : "Create Client"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </Main>
    );
}
