"use client";

import React, { useState } from "react";

// Import All Pages
import SocialRangePage from "./socialrangecomponent";
import SocialCreateForm from "./socialcreatecomponent";
import SocialUpdateForm from "./socialmediaupdatecomponent";
import SocialListByClientPage from "./socialbyclientcomponent";
import SocialListByStatusPage from "./SocialListByStatuscomponent";
import SocialViewPage from "./socialGetByIdcomponent";
import SocialDeletePage from "./social-delete";

export default function SocialMediaCalendarJunction() {
  // Which page to display
  const [activePage, setActivePage] = useState("");

  // Toggle for floating menu
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="relative min-h-screen p-4">

      {/* ------------------------------------------------------------------ */}
      {/* MAIN ROUTER AREA – Only one component displays at a time */}
      {/* ------------------------------------------------------------------ */}

      {activePage === "range" && <SocialRangePage />}
      {activePage === "create" && <SocialCreateForm />}
      {activePage === "update" && <SocialUpdateForm />}
      {activePage === "client" && <SocialListByClientPage />}
      {activePage === "status" && <SocialListByStatusPage />}
      {activePage === "view" && <SocialViewPage />}
      {activePage === "delete" && <SocialDeletePage />}

      {/* ------------------------------------------------------------------ */}
      {/* FLOATING ACTION BUTTON */}
      {/* ------------------------------------------------------------------ */}

     {/* FLOATING ACTION BUTTON */}
<div className="fixed top-24 right-6 flex flex-col items-end gap-3 z-50">

  {/* Menu Items */}
  {openMenu && (
    <div className="flex flex-col gap-3 animate-fadeIn items-end">

      <button
        onClick={() => { setActivePage("range"); setOpenMenu(false); }}
        className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
      >
        Date Range Search
      </button>

      <button
        onClick={() => { setActivePage("create"); setOpenMenu(false); }}
        className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
      >
        Create Entry
      </button>

      <button
        onClick={() => { setActivePage("update"); setOpenMenu(false); }}
        className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
      >
        Update Entry
      </button>

      <button
        onClick={() => { setActivePage("client"); setOpenMenu(false); }}
        className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
      >
        List by Client
      </button>

      <button
        onClick={() => { setActivePage("status"); setOpenMenu(false); }}
        className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
      >
        List by Status
      </button>

      <button
        onClick={() => { setActivePage("view"); setOpenMenu(false); }}
        className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
      >
        View by ID
      </button>

      <button
        onClick={() => { setActivePage("delete"); setOpenMenu(false); }}
        className="bg-white shadow-lg px-4 py-2 rounded-xl text-sm hover:bg-red-50 text-red-600"
      >
        Delete Entry
      </button>

    </div>
  )}

  {/* Main Floating Button */}
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
