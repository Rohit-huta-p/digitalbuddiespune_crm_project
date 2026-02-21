"use client";

import { useState } from "react";
import CreateLeadPage from "@/components/leads/create-lead";
import AddFollowUpPage from "@/components/leads/add-followup";
import ViewFollowUpsPage from "@/components/leads/view-followups";
import UpdateLeadStatusPage from "@/components/leads/update-status";
import LeadsList from "@/components/leads/list";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";

export default function LeadsManagementPage() {
  const [activePage, setActivePage] = useState<string>("list");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Helper to render back button when inside a sub-view
  const renderBackButton = () => {
    if (activePage === "list") return null;
    return (
      <Button
        variant="ghost"
        onClick={() => {
          setActivePage("list");
          setSelectedLeadId(null);
        }}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Leads
      </Button>
    );
  };

  return (
    <Main>
      <div className="px-4 py-10 space-y-4">

        {/* Sub-view Header (If not list) */}
        {activePage !== "list" && (
          <div className="w-full max-w-5xl mx-auto">
            {renderBackButton()}
          </div>
        )}

        {/* Main Header (Only for List View) */}
        {activePage === "list" && (
          <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">🎯 Lead Management</h1>
            <Button
              onClick={() => setActivePage("create")}
              className="font-semibold"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Lead
            </Button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="w-full max-w-5xl mx-auto">
          {activePage === "create" && <CreateLeadPage />}

          {activePage === "followup" && (
            <AddFollowUpPage defaultLeadId={selectedLeadId ?? undefined} />
          )}

          {activePage === "view-followups" && (
            <ViewFollowUpsPage defaultLeadId={selectedLeadId ?? undefined} />
          )}

          {activePage === "status" && (
            <UpdateLeadStatusPage defaultLeadId={selectedLeadId ?? undefined} />
          )}

          {activePage === "list" && (
            <LeadsList
              onViewFollowUps={(id) => {
                setSelectedLeadId(id);
                setActivePage("view-followups");
              }}
              onAddFollowUp={(id) => {
                setSelectedLeadId(id);
                setActivePage("followup");
              }}
              onUpdateStatus={(id) => {
                setSelectedLeadId(id);
                setActivePage("status");
              }}
            />
          )}
        </div>
      </div>
    </Main>
  );
}
