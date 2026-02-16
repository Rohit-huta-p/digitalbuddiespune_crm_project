"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AttendanceRangePage() {
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [isAdminOrHR, setIsAdminOrHR] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    from: "",
    to: "",
  });
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    // Fetch employee ID and then look up details
    const fetchEmployeeDetails = async () => {
      try {
        // 1. Get logged-in ID
        const authRes = await axios.get("/api/auth/me");
        const authData = authRes.data;

        if (authData.authenticated && authData.employeeId) {
          console.log("Employee ID loaded:", authData.employeeId);
          setEmployeeId(authData.employeeId);

          // 2. Get all employees to find the name
          // (Optimization: In a real app, we'd have a get-by-id endpoint or store name in cookie)
          try {
            const empRes = await axios.post("/api/employees");
            if (empRes.data?.attributes?.employees) {
              const fetchedEmployees = empRes.data.attributes.employees;
              setEmployees(fetchedEmployees);
              const me = fetchedEmployees.find((e: any) => String(e.id) === String(authData.employeeId));
              if (me) {
                setEmployeeName(me.name);
                // Check if role involves admin capabilities (1=Admin, 2=HR, or string equivalents)
                const roleValue = Number(me.role);
                if (roleValue === 1 || roleValue === 2 || me.role === "ADMIN" || me.role === "HR") {
                  setIsAdminOrHR(true);
                }
              }
            }
          } catch (e) {
            console.error("Failed to fetch employee details", e);
          }

        } else {
          toast.error("Please login first to use attendance features");
        }
      } catch (err: any) {
        console.error("Failed to load employee ID:", err);
        toast.error("Please login first to use attendance features");
      }
    };

    fetchEmployeeDetails();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!employeeId) {
      toast.error("Employee ID not loaded. Please refresh the page.");
      return;
    }

    if (!form.from || !form.to) {
      toast.error("Please select date range");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/attendance/range", {
        employeeId: parseInt(employeeId),
        from: form.from,
        to: form.to,
      });

      const data = res.data;

      if (data.success) {
        setAttendance(data.attendance || []);
        if (data.attendance.length === 0) {
          toast.info("No attendance records found for this period");
        } else {
          toast.success(`Found ${data.attendance.length} record(s)`);
        }
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.error?.title || "Failed to load attendance";
      toast.error(errorMsg);
      console.error("Attendance range error:", err.response?.data);
      setAttendance([]);
    }

    setLoading(false);
  };

  const calculateWorkHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return "In Progress";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full flex justify-center mt-20 px-4">
      <Card className="w-full max-w-4xl shadow-md border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Attendance Report
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-transparent border border-input dark:border-input p-3 rounded-lg">
            {isAdminOrHR ? (
              <div className="flex flex-col space-y-2">
                <span className="text-sm font-medium">Select Employee Report:</span>
                <Select
                  value={employeeId ? String(employeeId) : ""}
                  onValueChange={(val) => {
                    setEmployeeId(val);
                    const selectedEmp = employees.find((e) => String(e.id) === String(val));
                    if (selectedEmp) setEmployeeName(selectedEmp.name);
                  }}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-black">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.name} (ID: {emp.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Employee:</strong> {employeeName ? `${employeeName} (ID: ${employeeId})` : `ID: ${employeeId || "Loading..."}`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.from ? format(new Date(form.from), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.from ? new Date(form.from) : undefined}
                    onSelect={(date) =>
                      setForm({ ...form, from: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.to ? format(new Date(form.to), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.to ? new Date(form.to) : undefined}
                    onSelect={(date) =>
                      setForm({ ...form, to: date ? format(date, "yyyy-MM-dd") : "" })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={loading || !employeeId}
            onClick={handleSubmit}
          >
            {loading ? "Loading..." : !employeeId ? "Loading Employee..." : "Get Attendance Report"}
          </Button>

          {attendance.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Attendance Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border p-2 text-left dark:text-white text-black">Date</th>
                      <th className="border p-2 text-left dark:text-white text-black">Check-In</th>
                      <th className="border p-2 text-left dark:text-white text-black">Check-Out</th>
                      <th className="border p-2 text-left dark:text-white text-black">Work Hours</th>
                      <th className="border p-2 text-left dark:text-white text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50 hover:dark:bg-gray-900">
                        <td className="border p-2">
                          {record.attendanceDate || new Date(record.checkIn).toLocaleDateString()}
                        </td>
                        <td className="border p-2">
                          {record.checkIn
                            ? new Date(record.checkIn).toLocaleTimeString()
                            : "N/A"}
                        </td>
                        <td className="border p-2">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString()
                            : "Not checked out"}
                        </td>
                        <td className="border p-2">
                          {calculateWorkHours(record.checkIn, record.checkOut)}
                        </td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            record.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                                record.status === 'HALF_DAY' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                            }`}>
                            {record.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
