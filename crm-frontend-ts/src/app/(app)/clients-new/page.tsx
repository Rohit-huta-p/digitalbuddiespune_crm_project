"use client";

import { useState } from "react";
import CreateClientPage from "@/components/clients/create-client";
import UpdateClientPage from "@/components/clients/update-client";
import ViewAllClientsPage from "@/components/clients/view-all-clients";
import GetClientProjectsPage from "@/components/clients/get-client-projects";
import DeleteClientPage from "@/components/clients/delete-client";
import UpdateClientWorkPage from "@/components/clients/update-client-work";

export default function ClientManagementPage() {
  const [activePage, setActivePage] = useState<string>("");
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="relative min-h-screen p-4">
      {/* Main Content Area */}
      {activePage === "create" && <CreateClientPage />}
      {activePage === "update" && <UpdateClientPage />}
      {activePage === "view-all" && <ViewAllClientsPage />}
      {activePage === "projects" && <GetClientProjectsPage />}
      {activePage === "delete" && <DeleteClientPage />}
      {activePage === "work-progress" && <UpdateClientWorkPage />}

      {activePage === "" && (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Client Management
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
              Create Client
            </button>

            <button
              onClick={() => {
                setActivePage("update");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Update Client
            </button>

            <button
              onClick={() => {
                setActivePage("view-all");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              View All Clients
            </button>

            <button
              onClick={() => {
                setActivePage("projects");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Get Client Projects
            </button>

            <button
              onClick={() => {
                setActivePage("work-progress");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
            >
              Update Work Progress
            </button>

            <button
              onClick={() => {
                setActivePage("delete");
                setOpenMenu(false);
              }}
              className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-red-50 text-red-600"
            >
              Delete Client
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
