"use client";

import { useState } from "react";
import CreateLeadPage from "@/components/leads/create-lead";
import AddFollowUpPage from "@/components/leads/add-followup";
import ViewFollowUpsPage from "@/components/leads/view-followups";
import UpdateLeadStatusPage from "@/components/leads/update-status";

export default function LeadsManagementPage() {
  const [activePage, setActivePage] = useState<string>("");
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="relative min-h-screen p-4">
      {/* Main Content Area */}
      {activePage === "create" && <CreateLeadPage />}
      {activePage === "followup" && <AddFollowUpPage />}
      {activePage === "view-followups" && <ViewFollowUpsPage />}
      {activePage === "status" && <UpdateLeadStatusPage />}

      {activePage === "" && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Lead Management
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
                setActivePage("create");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Create New Lead
            </button>

            <button
              onClick={() => {
                setActivePage("followup");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Add Follow-up
            </button>

            <button
              onClick={() => {
                setActivePage("view-followups");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              View Follow-ups
            </button>

            <button
              onClick={() => {
                setActivePage("status");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Update Lead Status
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
