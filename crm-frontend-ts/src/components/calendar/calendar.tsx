/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  viewMonthGrid,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-shadcn/dist/index.css";
import "./override.css";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Main } from "../layout/main";

// Define a tuple for views so that it meets the type [View, ...View[]]
const calendarViews: [
  ReturnType<typeof createViewDay>,
  ReturnType<typeof createViewWeek>,
  ReturnType<typeof createViewMonthGrid>,
  ReturnType<typeof createViewMonthAgenda>
] = [
    createViewDay(),
    createViewWeek(),
    createViewMonthGrid(),
    createViewMonthAgenda(),
  ];

interface CalendarWithEventsService {
  eventsService: {
    getAll: () => any;
  };
}

const CalendarApp = ({ className }: { className?: string }) => {
  const plugins = [createEventsServicePlugin()];
  const { theme } = useTheme();
  const [activeTheme, setActiveTheme] = useState<string>(theme || "light");

  useEffect(() => {
    if (theme) {
      setActiveTheme(theme);
    }
  }, [theme]);

  const calendarConfig = {
    views: calendarViews,
    defaultView: viewMonthGrid.name,
    events: [
      {
        id: "1",
        title: "Event 1",
        start: "2025-02-07",
        end: "2025-02-08",
      },
    ],
    isDark: activeTheme === "dark",
    theme: "shadcn",
  };

  const calendar = useNextCalendarApp(calendarConfig, plugins);

  useEffect(() => {
    const calWithEvents = calendar as unknown as CalendarWithEventsService;
    if (calWithEvents?.eventsService) {
      calWithEvents.eventsService.getAll();
    }
  }, [calendar]);

  return (
    <Main fixed className={className}>
      <ScheduleXCalendar calendarApp={calendar} />
    </Main>
  );
};

export default CalendarApp;
