"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const { fetchUser } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Fetch location from browser
    const getLocation = (): Promise<{
      latitude: string;
      longitude: string;
    }> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              latitude: pos.coords.latitude.toString(),
              longitude: pos.coords.longitude.toString(),
            }),
          (err) => reject(err),
          { enableHighAccuracy: true }
        );
      });
    };

    try {
      const { latitude, longitude } = await getLocation();

      const res = await axios.post(
        "/api/login",
        {
          employeeId,
          password,
          latitude,
          longitude,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const markLoginRes = await fetch("/api/attendance/mark-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });

      const markLoginData = await markLoginRes.json();

      if (markLoginData.success) {
        toast.success("Login marked successfully");
      }

      if (res.data.success) {
        fetchUser();
        toast.success("Login successful");
        router.push("/home");
      } else {
        toast.error("Invalid credentials");
        setError("Invalid credentials");
      }
    } catch (err: any) {
      if (err.code === 1) {
        toast.error(
          "Location access denied. Please allow location permissions."
        );
        setError("Location permission denied.");
      } else if (err.response?.data?.error) {
        const { error, details } = err.response.data;
        toast.error(`${error}: ${details}`);
        setError(`${error}: ${details}`);
      } else {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred");
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="id">Employee ID</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="Your ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                onClick={(e) => handleSubmit(e)}
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        Login with your office credentials
      </div>
    </div>
  );
}
