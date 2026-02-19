"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Info } from "lucide-react";

export default function CheckInPage() {
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  useEffect(() => {
    // Fetch employee ID from server-side API (httpOnly cookies can't be read by JS)
    const fetchEmployeeId = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        const data = res.data;

        if (data.authenticated && data.employeeId) {
          console.log("Employee ID loaded:", data.employeeId);
          setEmployeeId(data.employeeId);
        } else {
          toast.error("Please login first to use attendance features");
        }
      } catch (err: unknown) {
        console.error("Failed to load employee ID:", err);
        toast.error("Please login first to use attendance features");
      }
    };

    fetchEmployeeId();
  }, []);

  const handleSubmit = async () => {
    if (!employeeId) {
      toast.error("Employee ID not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/attendance/check-in", {
        employeeId: parseInt(employeeId),
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Check-in recorded successfully!");
        setAlreadyCheckedIn(true);
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        console.error("Check-in error:", err.response.data);

        // Check for duplicate entry error (already checked in today)
        const errorMsg = err.response.data.error?.message ||
          err.response.data.message ||
          err.response.data.error?.title ||
          "";

        const status = err.response.status;

        // Handle 500 errors (usually backend serialization issues)
        if (status === 500) {
          // Check if it's a Hibernate/serialization error
          if (errorMsg.toLowerCase().includes("hibernate") ||
            errorMsg.toLowerCase().includes("bytebuddy") ||
            errorMsg.toLowerCase().includes("type definition")) {
            toast.error("Server configuration error", {
              description: "The attendance was likely recorded, but there's a backend issue. Please refresh and check your attendance report.",
              duration: 6000,
            });
          } else {
            toast.error("Server error occurred", {
              description: errorMsg || "Please try again or contact support.",
              duration: 5000,
            });
          }
          return;
        }

        const isDuplicateError = errorMsg.toLowerCase().includes("duplicate") ||
          errorMsg.toLowerCase().includes("already") ||
          errorMsg.toLowerCase().includes("constraint") ||
          status === 409;

        if (isDuplicateError) {
          toast.error("You have already checked in today!", {
            description: "Please use Check-Out to record your departure time.",
            duration: 5000,
          });
          setAlreadyCheckedIn(true);
        } else {
          toast.error(errorMsg || "Failed to record check-in");
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex justify-center mt-20 px-4">
      <Card className="w-full max-w-2xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Employee Check-In
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Employee ID:</strong> {employeeId || "Loading..."}
            </p>
          </div>

          {alreadyCheckedIn ? (
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
                ✅ You have already checked in today!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Please use the <strong>Check-Out</strong> page to record your departure time.
              </p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/attendance-new'}
              >
                Go to Check-Out Page
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-800 p-2 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-100">
                  <Info className="inline-block mr-2" /> This will record your check-in with the <strong>current date and time</strong> automatically.
                </p>
              </div>

              <Button
                className="w-full"
                disabled={loading || !employeeId}
                onClick={handleSubmit}
              >
                {loading ? "Recording..." : !employeeId ? "Loading..." : "Record Check-In Now"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
