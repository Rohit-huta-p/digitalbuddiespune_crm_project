"use client";

import { useState } from "react";
import CheckInPage from "@/components/attendance/check-in";
import CheckOutPage from "@/components/attendance/check-out";
import AttendanceRangePage from "@/components/attendance/attendance-range";
import { Plus } from "lucide-react";

export default function AttendanceManagementPage() {
  const [activePage, setActivePage] = useState<string>("range");
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="relative min-h-screen p-4">
      {/* Main Content Area */}
      {activePage === "range" && <AttendanceRangePage />}
      {activePage === "checkin" && <CheckInPage />}
      {activePage === "checkout" && <CheckOutPage />}



      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6 flex flex-col items-end gap-3 z-50">
        {openMenu && (
          <div className="flex flex-col gap-3 animate-fadeIn items-end">
            <button
              onClick={() => {
                setActivePage("range");
                setOpenMenu(false);
              }}
              className="bg-white text-black dark:text-white dark:bg-gray-800 shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Attendance Report
            </button>
            <button
              onClick={() => {
                setActivePage("checkin");
                setOpenMenu(false);
              }}
              className="bg-white text-black dark:text-white dark:bg-gray-800 shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Check-In
            </button>

            <button
              onClick={() => {
                setActivePage("checkout");
                setOpenMenu(false);
              }}
              className="bg-white text-black dark:text-white dark:bg-gray-800 shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Check-Out
            </button>

          </div>
        )}

        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="h-14 w-14 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xl hover:bg-gray-800 transition"
        >
          <span
            className={`text-3xl transform transition ${openMenu ? "rotate-45" : "rotate-0"
              }`}
          >
            <Plus />
          </span>
        </button>
      </div>
    </div>
  );
}
