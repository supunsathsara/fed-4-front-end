import { useState } from "react";
import { useGetAuditLogsQuery, useGetAuditLogStatsQuery } from "@/lib/redux/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  UserCheck,
  UserX,
  UserPlus,
  Zap,
  ZapOff,
  Link,
  Unlink,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const ACTION_CONFIG = {
  USER_CREATED: { label: "User Created", icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
  USER_APPROVED: { label: "User Approved", icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
  USER_REJECTED: { label: "User Rejected", icon: UserX, color: "text-red-600", bg: "bg-red-50" },
  USER_SUSPENDED: { label: "User Suspended", icon: Shield, color: "text-orange-600", bg: "bg-orange-50" },
  USER_REACTIVATED: { label: "User Reactivated", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  SOLAR_UNIT_CREATED: { label: "Solar Unit Created", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
  SOLAR_UNIT_UPDATED: { label: "Solar Unit Updated", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  SOLAR_UNIT_DELETED: { label: "Solar Unit Deleted", icon: ZapOff, color: "text-red-600", bg: "bg-red-50" },
  SOLAR_UNIT_ASSIGNED: { label: "Solar Unit Assigned", icon: Link, color: "text-green-600", bg: "bg-green-50" },
  SOLAR_UNIT_UNASSIGNED: { label: "Solar Unit Unassigned", icon: Unlink, color: "text-orange-600", bg: "bg-orange-50" },
  INVOICE_GENERATED: { label: "Invoice Generated", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50" },
  INVOICE_PAID: { label: "Invoice Paid", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  ANOMALY_ACKNOWLEDGED: { label: "Anomaly Acknowledged", icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
  ANOMALY_RESOLVED: { label: "Anomaly Resolved", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  ANOMALY_FALSE_POSITIVE: { label: "Anomaly False Positive", icon: AlertTriangle, color: "text-gray-600", bg: "bg-gray-50" },
};

const TARGET_TYPE_OPTIONS = [
  { value: "all", label: "All Resources" },
  { value: "User", label: "Users" },
  { value: "SolarUnit", label: "Solar Units" },
  { value: "Invoice", label: "Invoices" },
  { value: "Anomaly", label: "Anomalies" },
];

const ITEMS_PER_PAGE = 20;

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPerformerName(performedBy) {
  if (!performedBy) return "System";
  if (typeof performedBy === "string") return performedBy;
  const { firstName, lastName, email } = performedBy;
  if (firstName) return `${firstName} ${lastName || ""}`.trim();
  return email || "Unknown";
}

function getDetailsSummary(action, details) {
  if (!details) return null;
  switch (action) {
    case "USER_CREATED":
      return details.email ? `New user: ${details.email}` : null;
    case "USER_APPROVED":
      return details.userEmail ? `Approved: ${details.userEmail}` : null;
    case "USER_REJECTED":
      return details.reason ? `Reason: ${details.reason}` : details.userEmail;
    case "USER_SUSPENDED":
      return details.reason ? `Reason: ${details.reason}` : details.userEmail;
    case "USER_REACTIVATED":
      return details.userEmail
        ? `${details.userEmail} (${details.previousStatus} → ${details.newStatus})`
        : null;
    case "SOLAR_UNIT_CREATED":
      return details.serialNumber ? `Serial: ${details.serialNumber}` : null;
    case "SOLAR_UNIT_UPDATED":
      return details.serialNumber ? `Serial: ${details.serialNumber}` : null;
    case "SOLAR_UNIT_DELETED":
      return details.serialNumber ? `Deleted: ${details.serialNumber}` : null;
    case "SOLAR_UNIT_ASSIGNED":
      return details.userEmail
        ? `${details.serialNumber} → ${details.userEmail}`
        : details.serialNumber;
    case "SOLAR_UNIT_UNASSIGNED":
      return details.serialNumber ? `Unassigned: ${details.serialNumber}` : null;
    case "ANOMALY_ACKNOWLEDGED":
    case "ANOMALY_RESOLVED":
    case "ANOMALY_FALSE_POSITIVE":
      return details.anomalyType
        ? `${details.anomalyType} (${details.severity})`
        : null;
    default:
      return null;
  }
}

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [page, setPage] = useState(0);

  const queryParams = {
    limit: String(ITEMS_PER_PAGE),
    offset: String(page * ITEMS_PER_PAGE),
  };
  if (actionFilter !== "all") queryParams.action = actionFilter;
  if (targetTypeFilter !== "all") queryParams.targetType = targetTypeFilter;

  const { data: logsData, isLoading, isFetching, refetch } = useGetAuditLogsQuery(queryParams);
  const { data: stats } = useGetAuditLogStatsQuery();

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Build action filter options based on selected target type
  const actionOptions = Object.entries(ACTION_CONFIG).filter(([key]) => {
    if (targetTypeFilter === "all") return true;
    if (targetTypeFilter === "User") return key.startsWith("USER_");
    if (targetTypeFilter === "SolarUnit") return key.startsWith("SOLAR_UNIT_");
    if (targetTypeFilter === "Invoice") return key.startsWith("INVOICE_");
    if (targetTypeFilter === "Anomaly") return key.startsWith("ANOMALY_");
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activity and changes</p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.last24h}</p>
                  <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.last7d}</p>
                  <p className="text-sm text-muted-foreground">Last 7 Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select
                value={targetTypeFilter}
                onValueChange={(val) => {
                  setTargetTypeFilter(val);
                  setActionFilter("all");
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by resource" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val);
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionOptions.map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 flex items-center justify-end text-sm text-muted-foreground">
              {total} event{total !== 1 ? "s" : ""} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No audit logs found</p>
              <p className="text-sm">Activity will appear here as actions are performed</p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => {
                const config = ACTION_CONFIG[log.action] || {
                  label: log.action,
                  icon: Activity,
                  color: "text-gray-600",
                  bg: "bg-gray-50",
                };
                const Icon = config.icon;
                const detail = getDetailsSummary(log.action, log.details);

                return (
                  <div
                    key={log._id}
                    className="flex gap-4 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Timeline dot */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      {index < logs.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium text-sm">{config.label}</p>
                        <span className="text-xs text-muted-foreground shrink-0" title={formatDateTime(log.createdAt)}>
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {getPerformerName(log.performedBy)}
                      </p>
                      {detail && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {detail}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
