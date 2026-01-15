"use client";

import { useState } from "react";
import CheckInPage from "@/components/attendance/check-in";
import CheckOutPage from "@/components/attendance/check-out";
import AttendanceRangePage from "@/components/attendance/attendance-range";

export default function AttendanceManagementPage() {
  const [activePage, setActivePage] = useState<string>("");
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="relative min-h-screen p-4">
      {/* Main Content Area */}
      {activePage === "checkin" && <CheckInPage />}
      {activePage === "checkout" && <CheckOutPage />}
      {activePage === "range" && <AttendanceRangePage />}

      {activePage === "" && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Attendance Management
            </h1>
            <p className="text-gray-600">
              Select an option from the menu to get started
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed top-24 right-6 flex flex-col items-end gap-3 z-50">
        {openMenu && (
          <div className="flex flex-col gap-3 animate-fadeIn items-end">
            <button
              onClick={() => {
                setActivePage("checkin");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Check-In
            </button>

            <button
              onClick={() => {
                setActivePage("checkout");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Check-Out
            </button>

            <button
              onClick={() => {
                setActivePage("range");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Attendance Report
            </button>
          </div>
        )}

        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="h-14 w-14 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:bg-gray-800 transition"
        >
          <span
            className={`text-3xl transform transition ${
              openMenu ? "rotate-45" : "rotate-0"
            }`}
          >
            +
          </span>
        </button>
      </div>
    </div>
  );
}
