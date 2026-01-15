import { cn } from "@/lib/utils";
import { SearchProvider } from "@/context/search-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import SkipToMain from "@/components/skip-to-main";
import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import dynamic from "next/dynamic";

const ClientTaskActions = dynamic(
  () => import("@/components/tasks/sidebar/client-task-action"),
  {
    ssr: false,
  }
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id="content"
          className={cn(
            "ml-auto w-full max-w-full",
            "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
            "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
            "transition-[width] duration-200 ease-linear",
            "flex h-svh flex-col",
            "group-data-[scroll-locked=1]/body:h-full",
            "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh"
          )}
        >
          <Header fixed>
            <div className="ml-auto flex items-center space-x-4">
              <div className="flex gap-2">
                <ClientTaskActions />
                <Link href="/projects/new">
                  <Button className="space-x-1">Create Project</Button>
                </Link>
              </div>
              <ThemeSwitch />
              <ProfileDropdown />
            </div>
          </Header>
          {children}
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
