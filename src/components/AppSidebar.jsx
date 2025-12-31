import { ChartLine, LayoutDashboard, TriangleAlert, FileText } from "lucide-react";
import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { SolarPulseLogoLink } from "@/components/Logo";
import { useGetPendingInvoiceCountQuery } from "@/lib/redux/query";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard className="w-8 h-8" size={32} />,
  },
  {
    title: "Anomalies",
    url: "/dashboard/anomalies",
    icon: <TriangleAlert className="w-8 h-8" size={32} />,
  },
  {
    title: "Invoices",
    url: "/dashboard/invoices",
    icon: <FileText className="w-8 h-8" size={32} />,
    hasBadge: true,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: <ChartLine className="w-8 h-8" size={32} />,
  },
];

const SideBarTab = ({ item, pendingCount }) => {
  let location = useLocation();
  let isActive = location.pathname === item.url;

  return (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link
          to={item.url}
        >
          {item.icon}
          <span>{item.title}</span>
          {item.hasBadge && pendingCount > 0 && (
            <SidebarMenuBadge className="bg-orange-500 text-white">
              {pendingCount}
            </SidebarMenuBadge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AppSidebar() {
  const { data: pendingData } = useGetPendingInvoiceCountQuery();
  const pendingCount = pendingData?.count || 0;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-3xl font-bold text-foreground py-6">
            <SolarPulseLogoLink size="small" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4 text">
              {items.map((item) => (
                <SideBarTab key={item.url} item={item} pendingCount={pendingCount} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
