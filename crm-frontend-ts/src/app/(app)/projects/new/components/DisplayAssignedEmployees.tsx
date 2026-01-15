import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const DisplayAssignedEmployees = ({ employees, participants }: any) => {
  const assignedEmployees = employees.filter((employee: any) =>
    participants.some((participant: any) => participant.id === employee.id)
  );

  return (
    <div className="flex flex-col gap-1">
      {assignedEmployees.map((employee: any) => {
        const participant = participants.find((p: any) => p.id === employee.id);
        return (
          <div
            key={employee.id}
            className="flex items-center justify-between w-full bg-zinc-300/25 dark:bg-zinc-700/25"
          >
            <CardHeader>
              <CardTitle>{employee.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pr-3 ">
              <p className="text-blue-600 dark:text-blue-500 px-3 py-1 bg-blue-500/25 rounded-md text-sm">
                {participant?.role || "N/A"}
              </p>
            </CardContent>
          </div>
        );
      })}
    </div>
  );
};

export default DisplayAssignedEmployees;
