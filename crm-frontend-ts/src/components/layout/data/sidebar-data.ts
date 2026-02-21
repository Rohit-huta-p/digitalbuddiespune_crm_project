import {
  IconCash,
  IconChecklist,
  IconDeviceImacPlus,
  IconLayoutDashboard,
  IconUserScreen,
  IconUsersGroup,
  IconVocabulary,
  IconAddressBook,
  IconCalendarEvent,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "eagledev",
    email: "eagledev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Digital Buddies",
      logo: "/logo.png",
      plan: "",
    },
  ],
  navGroups: [
    {
      title: "Admin",
      role: "Admin",
      items: [
        {
          title: "Admin Dashboard",
          url: "/admin",
          icon: IconUsersGroup,
        },
        {
          title: "Clients",
          url: "/clients",
          icon: IconAddressBook,
        },
      ],
    },
    {
      title: "HR Management",
      role: "Hr",
      items: [
        {
          title: "Employees",
          url: "/employees",
          icon: IconUsersGroup,
        },
        {
          title: "Salaries",
          url: "/salaries",
          icon: IconVocabulary,
        },
        {
          title: "Billings",
          url: "/billing",
          icon: IconCash,
        },
      ],
    },
    {
      title: "General",
      role: "Employee",
      items: [
        {
          title: "Home",
          url: "/home",
          icon: IconLayoutDashboard,
        },

        {
          title: "Projects",
          url: "/projects",
          icon: IconUserScreen,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: IconChecklist,
        },
        // {
        //   title: "Calendar",
        //   url: "/calendar",
        //   icon: Calendar,
        // },
        // {
        //   title: "Chats",
        //   url: "/chats",
        //   badge: "3",
        //   icon: IconMessages,
        // },

        {
          title: "Attendance",
          url: "/attendance",
          // badge: "Not Marked",
          icon: IconDeviceImacPlus,
        },
        // {
        //   title: "Attendance Management",
        //   url: "/attendance-new",
        //   icon: IconClipboardCheck,
        // },
        {
          title: "Lead Management",
          url: "/leads",
          icon: IconAddressBook,
        },
      ],
    },
    {
      title: "Social Media",
      role: "Employee",
      items: [
        {
          title: "Social Media Calendar",
          url: "/socialmediacalendar",
          // badge: "Not Marked",
          icon: IconCalendarEvent,
        },
      ],
    },
  ],
};
