"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Main } from "@/components/layout/main";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn, formatWorkHours } from "@/lib/utils";
import {
  CircleCheck,
  Info,
  Clock,
  LogIn,
  LogOut,
  CalendarIcon,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Timer
} from "lucide-react";

type SortField = "date" | "checkIn" | "checkOut" | "workHours" | "status";

export default function UnifiedAttendancePage() {
  // === Timer & Status State (from old attendance) ===
  const [isPresent, setIsPresent] = useState(false);
  const [status, setStatus] = useState<"none" | "ongoing" | "completed">("none");
  const [workedTime, setWorkedTime] = useState<string | null>(null);
  const [logoutTime, setLogoutTime] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // === User & Roles State ===
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [isAdminOrHR, setIsAdminOrHR] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // === Report State ===
  const [loadingReport, setLoadingReport] = useState(false);
  const [form, setForm] = useState({
    from: format(new Date(new Date().setDate(1)), "yyyy-MM-dd"), // default to start of current month
    to: format(new Date(), "yyyy-MM-dd"), // default to today
  });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // === UI State ===
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [isCompact, setIsCompact] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // === 1. INITIALIZE TIMER & AUTH ===
  useEffect(() => {
    // Timer Restore
    const start = localStorage.getItem("attendanceStartTime");
    const end = localStorage.getItem("attendanceEndTime");
    const localStatus = localStorage.getItem("attendanceStatus");

    if (localStatus === "ongoing" && start && !end) {
      setStatus("ongoing");
      updateOngoingTime();
      setIsPresent(true); // Assuming ongoing means present
    } else if (localStatus === "completed" && start && end) {
      setStatus("completed");
      setWorkedTime(formatWorkHours(start, end, true));
      setLogoutTime(new Date(end).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
      setIsPresent(false);
    }

    const interval = setInterval(() => {
      if (status === "ongoing") updateOngoingTime();
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const fetchAuthAndEmployees = async () => {
      try {
        // 1. Get logged-in ID
        const authRes = await axios.get("/api/auth/me");
        const authData = authRes.data;

        if (authData.authenticated && authData.employeeId) {
          setEmployeeId(String(authData.employeeId));

          // 2. Fallback check for current day attendance (old pattern)
          const checkRes = await fetch("/api/attendance/check", { method: "POST" });
          const checkData = await checkRes.json();
          if (checkRes.ok && checkData?.isPresent) {
            setIsPresent(true);
            if (status !== "ongoing") {
              setStatus("ongoing");
              if (!localStorage.getItem("attendanceStartTime")) {
                const now = new Date().toISOString();
                localStorage.setItem("attendanceStartTime", now);
                localStorage.setItem("attendanceStatus", "ongoing");
              }
            }
          } else if (status !== "ongoing" && status !== "completed") {
            setIsPresent(false);
            setStatus("none");
          }

          // 3. Get all employees (for Admin/HR view)
          try {
            const empRes = await axios.post("/api/employees");
            if (empRes.data?.attributes?.employees) {
              const fetchedEmployees = empRes.data.attributes.employees;
              setEmployees(fetchedEmployees);
              const me = fetchedEmployees.find((e: any) => String(e.id) === String(authData.employeeId));
              if (me) {
                setEmployeeName(me.name);
                const roleValue = Number(me.role);
                if (roleValue === 1 || roleValue === 2 || me.role === "ADMIN" || me.role === "HR") {
                  setIsAdminOrHR(true);
                }
              }
            }
          } catch (e) {
            console.error("Failed to fetch employees", e);
          }

          // Automatically fetch default report for current month
          handleFetchReport(String(authData.employeeId), form.from, form.to);

        } else {
          toast.error("Please login first to use attendance features");
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };

    fetchAuthAndEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // === TIMER HELPERS ===
  const updateOngoingTime = () => {
    const start = localStorage.getItem("attendanceStartTime");
    if (start) {
      const now = new Date().toISOString();
      setWorkedTime(formatWorkHours(start, now, true));
    }
  };


  // === ACTIONS ===
  const handleCheckIn = async () => {
    if (!employeeId) return toast.error("Employee ID not loaded.");
    setLoadingAction(true);

    try {
      const res = await axios.post("/api/attendance/check-in", { employeeId: parseInt(employeeId) });
      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Check-in recorded successfully!");

        // Start local timer
        const now = new Date().toISOString();
        localStorage.setItem("attendanceStartTime", now);
        localStorage.removeItem("attendanceEndTime");
        localStorage.setItem("attendanceStatus", "ongoing");
        setIsPresent(true);
        setStatus("ongoing");
        setWorkedTime("0h 0m 0s");

        // Refresh report
        handleFetchReport(employeeId, form.from, form.to);
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      handleApiError(err, "check-in");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConfirmLogoutModal = () => {
    if (status === "ongoing" || isPresent) setConfirmDialogOpen(true);
    else toast.info("You are not currently checked in.");
  };

  const executeCheckOut = async () => {
    if (!employeeId) return toast.error("Employee ID not loaded.");
    setConfirmDialogOpen(false);
    setLoadingAction(true);

    try {
      const res = await axios.post("/api/attendance/check-out", { employeeId: parseInt(employeeId) });
      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Check-out recorded successfully!");

        // Stop local timer
        const now = new Date().toISOString();
        const start = localStorage.getItem("attendanceStartTime");
        if (start) {
          const worked = formatWorkHours(start, now, true);
          setWorkedTime(worked);
        }
        localStorage.setItem("attendanceEndTime", now);
        localStorage.setItem("attendanceStatus", "completed");
        setLogoutTime(new Date(now).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
        setStatus("completed");
        setIsPresent(false);

        // Refresh report
        handleFetchReport(employeeId, form.from, form.to);
      } else {
        toast.error(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      handleApiError(err, "check-out");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleApiError = (err: any, action: string) => {
    if (axios.isAxiosError(err) && err.response && err.response.data) {
      const errorMsg = err.response.data.error?.message || err.response.data.message || err.response.data.error?.title || "";
      const httpStatus = err.response.status;

      if (httpStatus === 500 && (errorMsg.toLowerCase().includes("hibernate") || errorMsg.toLowerCase().includes("type definition"))) {
        toast.error("Server configuration error", { description: "Action likely succeeded but hit a backend bug. Refreshing report." });
        handleFetchReport(employeeId, form.from, form.to);
        return;
      }

      if (action === "check-in" && (errorMsg.toLowerCase().includes("duplicate") || errorMsg.toLowerCase().includes("already") || httpStatus === 409)) {
        toast.error("You have already checked in today!");
        // Sync local state safely
        setIsPresent(true);
        if (status !== "ongoing") setStatus("ongoing");
        return;
      }

      if (action === "check-out" && (errorMsg.toLowerCase().includes("not found") || errorMsg.toLowerCase().includes("check in first") || httpStatus === 404)) {
        toast.error("You haven't checked in yet today!");
        setIsPresent(false);
        if (status !== "none") setStatus("none");
        return;
      }

      toast.error(errorMsg || `Failed to record ${action}`);
    } else {
      toast.error(`Error during ${action}`);
    }
  };

  const handleFetchReport = async (empId: string, fromDate: string, toDate: string) => {
    if (!empId) return;
    if (!fromDate || !toDate) return toast.error("Please select a date range");

    setLoadingReport(true);
    try {
      const res = await axios.post("/api/attendance/range", {
        employeeId: parseInt(empId),
        from: fromDate,
        to: toDate,
      });

      if (res.data.success) {
        setAttendanceRecords(res.data.attendance || []);
      } else {
        toast.error(res.data.error?.message || "Failed to load report");
      }
    } catch (err) {
      console.error("Report fetch error", err);
      // Silent error generally, unless manually triggered
    } finally {
      setLoadingReport(false);
    }
  };


  // === RENDERING HELPERS ===
  const filteredRecords = attendanceRecords
    .filter((record) => {
      const searchStr = `${record.status} ${record.attendanceDate || new Date(record.checkIn).toLocaleDateString()}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const getVal = (r: any) => {
        if (sortField === "date") return new Date(r.attendanceDate || r.checkIn).getTime();
        if (sortField === "checkIn") return r.checkIn ? new Date(r.checkIn).getTime() : 0;
        if (sortField === "checkOut") return r.checkOut ? new Date(r.checkOut).getTime() : 0;
        if (sortField === "status") return String(r.status || "").localeCompare(r.status || "");
        if (sortField === "workHours") {
          const inTime = r.checkIn ? new Date(r.checkIn).getTime() : 0;
          const outTime = r.checkOut ? new Date(r.checkOut).getTime() : new Date().getTime(); // temp
          return outTime - inTime;
        }
        return 0;
      };

      const valA = getVal(a);
      const valB = getVal(b);

      if (typeof valA === "number" && typeof valB === "number") {
        return valB - valA; // Descending for dates/times
      }
      return String(valA).localeCompare(String(valB));
    });

  const getStatusIcon = (st: string) => {
    switch (st) {
      case 'PRESENT': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'LATE': return <Timer className="w-4 h-4 text-yellow-600" />;
      case 'HALF_DAY': return <Info className="w-4 h-4 text-orange-600" />;
      case 'ABSENT': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Main>
      <div className="px-4 py-10 space-y-8">

        {/* HEADER */}
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">📍 Attendance Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={status === "ongoing" || isPresent ? "secondary" : "default"}
              onClick={handleCheckIn}
              disabled={loadingAction || isPresent || status === "ongoing"}
              className={cn(
                "flex-1 md:flex-none font-semibold",
                !isPresent && status !== "ongoing" && "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Check In
            </Button>
            <Button
              variant={status === "ongoing" ? "destructive" : "secondary"}
              onClick={handleConfirmLogoutModal}
              disabled={loadingAction || status !== "ongoing"}
              className="flex-1 md:flex-none font-semibold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert
            variant={isPresent ? "success" : "default"}
            className={cn(
              "border shadow-sm flex items-center justify-between",
              isPresent ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-card border-border"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn("p-2 rounded-full", isPresent ? "bg-green-100 dark:bg-green-900/30" : "bg-yellow-100 dark:bg-yellow-900/30")}>
                {isPresent ? <CircleCheck className="h-6 w-6 text-green-600 dark:text-green-500" /> : <Info className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />}
              </div>
              <div>
                <AlertTitle className="text-lg font-semibold m-0">
                  {isPresent ? "You're Active!" : "Not Checked In"}
                </AlertTitle>
                <AlertDescription className="text-muted-foreground mt-1 text-sm">
                  {isPresent
                    ? status === "ongoing"
                      ? "Your timer is running. Stay productive!"
                      : "You've completed your shift for today."
                    : "Please click Check In to begin your day."}
                </AlertDescription>
              </div>
            </div>
          </Alert>

          {workedTime && (
            <Alert className="border shadow-sm bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900 flex items-center">
              <div className="flex items-start gap-4">
                <div className={"p-2 rounded-full bg-blue-100 dark:bg-blue-900/30"}>
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                </div>
                <div>
                  <AlertTitle className="text-lg font-semibold m-0 flex items-center gap-2">
                    {status === "completed" ? "Total Time Logged" : "Time Elapsed"}
                  </AlertTitle>
                  <AlertDescription className="font-mono text-xl font-bold text-foreground mt-1">
                    {workedTime}
                  </AlertDescription>
                  {logoutTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Checked out at: {logoutTime}
                    </p>
                  )}
                </div>
              </div>
            </Alert>
          )}
        </div>

        {/* REPORT SECTION */}
        <Card className="w-full max-w-5xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex flex-col md:flex-row md:items-end justify-between gap-4">
              <span>📅 Attendance Records</span>

              {/* ADMIN SELECTOR */}
              {isAdminOrHR && (
                <div className="flex items-center gap-2 text-sm font-normal w-full md:w-auto">
                  <Label className="whitespace-nowrap">Report For:</Label>
                  <Select
                    value={employeeId}
                    onValueChange={(val) => {
                      setEmployeeId(val);
                      const selectedEmp = employees.find((e) => String(e.id) === String(val));
                      if (selectedEmp) setEmployeeName(selectedEmp.name);
                      // Auto fetch report for new person
                      handleFetchReport(val, form.from, form.to);
                    }}
                  >
                    <SelectTrigger className="w-full md:w-[200px] h-8 bg-background">
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
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* FILTERS & DATE RANGE */}
            <div className="flex flex-col md:flex-row items-end gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-9", !form.from && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.from ? format(new Date(form.from), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={form.from ? new Date(form.from) : undefined} onSelect={(date) => setForm({ ...form, from: date ? format(date, "yyyy-MM-dd") : "" })} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-9", !form.to && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.to ? format(new Date(form.to), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={form.to ? new Date(form.to) : undefined} onSelect={(date) => setForm({ ...form, to: date ? format(date, "yyyy-MM-dd") : "" })} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Button
                className="w-full md:w-auto h-9"
                onClick={() => handleFetchReport(employeeId, form.from, form.to)}
                disabled={loadingReport || !employeeId}
              >
                {loadingReport ? "Fetching..." : "Fetch Report"}
              </Button>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2">
              <div className="relative w-full md:w-1/2 lg:w-1/3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-9 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Label htmlFor="sort" className="text-sm text-muted-foreground">Sort By</Label>
                  <select
                    id="sort"
                    className="border rounded-md px-3 py-1.5 text-sm bg-background"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                  >
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                    <option value="workHours">Work Hours</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 border-l border-border pl-4">
                  <Switch id="compact-toggle" checked={isCompact} onCheckedChange={setIsCompact} />
                  <Label htmlFor="compact-toggle" className="text-sm cursor-pointer">Compact</Label>
                </div>
              </div>
            </div>

            {/* LIST VIEW */}
            <div className="space-y-3">
              {loadingReport ? (
                <div className="p-8 text-center text-muted-foreground border rounded-xl bg-muted/10">Loading attendance data...</div>
              ) : filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-xl bg-muted/10">No attendance records found.</div>
              ) : (
                <div className="space-y-2 border rounded-xl p-1 bg-muted/5">
                  {filteredRecords.map((record, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col md:flex-row items-start md:items-center justify-between bg-card border rounded-lg hover:shadow-sm transition-all overflow-hidden gap-4",
                        isCompact ? "p-3" : "p-4"
                      )}
                    >
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="hidden sm:flex h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center border border-blue-100 dark:border-blue-900/50">
                          <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                          <p className={cn("font-semibold", isCompact ? "text-sm" : "text-base")}>
                            {record.attendanceDate ? format(new Date(record.attendanceDate), 'EEEE, MMM do') :
                              record.checkIn ? format(new Date(record.checkIn), 'EEEE, MMM do') : "Unknown Date"}
                          </p>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                            record.status === 'PRESENT' ? 'bg-green-100/80 text-green-700 dark:bg-green-900/30' :
                              record.status === 'IN_PROGRESS' ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/30' :
                                record.status === 'LATE' ? 'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/30' :
                                  record.status === 'HALF_DAY' ? 'bg-orange-100/80 text-orange-700 dark:bg-orange-900/30' :
                                    'bg-red-100/80 text-red-700 dark:bg-red-900/30'
                          )}>
                            {getStatusIcon(record.status)}
                            {record.status || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 w-full gap-4 md:border-l md:pl-6">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Check In</p>
                          <p className={cn("font-medium", isCompact ? "text-sm" : "text-base")}>
                            {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : <span className="text-muted-foreground italic">N/A</span>}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Check Out</p>
                          <p className={cn("font-medium", isCompact ? "text-sm" : "text-base")}>
                            {record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : <span className="text-muted-foreground italic">—</span>}
                          </p>
                        </div>
                        <div className="col-span-2 lg:col-span-1 space-y-1 bg-muted/40 p-2 lg:-my-2 rounded-md">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold lg:hidden">Work Hours</p>
                          <p className={cn(
                            "font-bold flex items-center gap-1.5 h-full lg:justify-end",
                            isCompact ? "text-sm" : "text-base",
                            !record.checkOut ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                          )}>
                            <Clock className="h-4 w-4 opacity-70" />
                            {formatWorkHours(record.checkIn, record.checkOut)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Logout Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Check-Out</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4 text-sm text-muted-foreground">
            <p>This will permanently log your departure time for today and end your shift.</p>
            {workedTime && (
              <div className="bg-muted p-3 rounded-md mt-2">
                <p className="font-semibold text-foreground">Current Session: {workedTime}</p>
                <p className="text-xs mt-1">Make sure you have completed your required hours.</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeCheckOut} disabled={loadingAction}>
              {loadingAction ? "Recording..." : "Yes, Check Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Main>
  );
}
