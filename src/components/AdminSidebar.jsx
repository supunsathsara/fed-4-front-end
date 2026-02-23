import { Settings, Zap, FileText, Users, Activity } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SolarPulseLogoLink } from "@/components/Logo";

// Menu items for admin navigation.
const items = [
  {
    title: "Solar Units",
    url: "/admin/solar-units",
    icon: <Zap className="w-8 h-8" size={32} />,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: <Users className="w-8 h-8" size={32} />,
  },
  {
    title: "Invoices",
    url: "/admin/invoices",
    icon: <FileText className="w-8 h-8" size={32} />,
  },
  {
    title: "Audit Logs",
    url: "/admin/audit-logs",
    icon: <Activity className="w-8 h-8" size={32} />,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: <Settings className="w-8 h-8" size={32} />,
  },
];

const AdminSideBarTab = ({ item }) => {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  return (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={item.url}>
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-3xl font-bold text-foreground py-6">
            <SolarPulseLogoLink size="small" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4">
              {items.map((item) => (
                <AdminSideBarTab key={item.url} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
