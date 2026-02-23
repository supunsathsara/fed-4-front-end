import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useGetUsersWithStatusQuery,
  useGetSolarUnitsQuery,
  useGetPendingUsersQuery,
  useAssignSolarUnitMutation,
  useUnassignSolarUnitMutation,
  useApproveUserMutation,
  useRejectUserMutation,
  useSuspendUserMutation,
  useReactivateUserMutation,
} from "@/lib/redux/query";
import { User, Zap, UserPlus, UserMinus, Clock, CheckCircle, XCircle, ShieldOff, Shield, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const statusBadge = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", className: "bg-blue-100 text-blue-800" },
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800" },
  SUSPENDED: { label: "Suspended", className: "bg-orange-100 text-orange-800" },
};

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [selectedSolarUnitId, setSelectedSolarUnitId] = useState("");
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [suspendingUserId, setSuspendingUserId] = useState(null);
  const [reasonText, setReasonText] = useState("");
  const navigate = useNavigate();

  const { data: users, isLoading: isLoadingUsers, isError, error } = useGetUsersWithStatusQuery();
  const { data: pendingUsers, isLoading: isLoadingPending } = useGetPendingUsersQuery();
  const { data: solarUnits } = useGetSolarUnitsQuery();
  const [assignSolarUnit, { isLoading: isAssigning }] = useAssignSolarUnitMutation();
  const [unassignSolarUnit, { isLoading: isUnassigning }] = useUnassignSolarUnitMutation();
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
  const [reactivateUser, { isLoading: isReactivating }] = useReactivateUserMutation();

  if (isLoadingUsers) {
    return (
      <main className="mt-4">
        <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-muted-foreground mb-8">Loading users...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mt-4">
        <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
        <p className="text-red-500">Error loading users: {error?.message || "Unknown error"}</p>
      </main>
    );
  }

  // Get unassigned solar units for the assignment dropdown
  const unassignedSolarUnits = solarUnits?.filter((unit) => !unit.userId) || [];

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      filterStatus === user.status;

    return matchesSearch && matchesFilter;
  }) || [];

  const totalUsers = users?.length || 0;
  const pendingCount = users?.filter((u) => u.status === "PENDING").length || 0;
  const activeCount = users?.filter((u) => u.status === "ACTIVE").length || 0;
  const approvedCount = users?.filter((u) => u.status === "APPROVED").length || 0;

  const handleAssign = async (userId) => {
    if (!selectedSolarUnitId) return;
    try {
      await assignSolarUnit({ id: selectedSolarUnitId, userId }).unwrap();
      setAssigningUserId(null);
      setSelectedSolarUnitId("");
    } catch (err) {
      console.error("Failed to assign:", err);
    }
  };

  const handleUnassign = async (solarUnitId) => {
    try {
      await unassignSolarUnit(solarUnitId).unwrap();
    } catch (err) {
      console.error("Failed to unassign:", err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveUser(userId).unwrap();
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectUser({ id: userId, reason: reasonText }).unwrap();
      setRejectingUserId(null);
      setReasonText("");
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await suspendUser({ id: userId, reason: reasonText }).unwrap();
      setSuspendingUserId(null);
      setReasonText("");
    } catch (err) {
      console.error("Failed to suspend:", err);
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await reactivateUser(userId).unwrap();
    } catch (err) {
      console.error("Failed to reactivate:", err);
    }
  };

  return (
    <main className="mt-4">
      <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage user onboarding, approvals, and solar unit assignments
      </p>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Awaiting Assignment</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue={pendingCount > 0 ? "pending" : "all"}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending Approval {pendingCount > 0 && <span className="ml-1 bg-yellow-200 text-yellow-900 text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <User className="w-4 h-4" />
            All Users
          </TabsTrigger>
        </TabsList>

        {/* Pending Approval Tab */}
        <TabsContent value="pending">
          <div className="space-y-3">
            {isLoadingPending ? (
              <p className="text-muted-foreground">Loading pending users...</p>
            ) : pendingUsers?.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">All caught up!</p>
                <p className="text-muted-foreground mt-1">No pending user approvals at this time.</p>
              </Card>
            ) : (
              pendingUsers?.map((user) => (
                <Card key={user._id} className="p-5 border-l-4 border-l-yellow-400">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : "No Name Set"}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Registered {new Date(user.createdAt).toLocaleDateString()} at{" "}
                            {new Date(user.createdAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rejectingUserId === user._id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Reason for rejection (optional)"
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            className="w-64"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user._id)}
                            disabled={isRejecting}
                          >
                            {isRejecting ? "..." : "Confirm Reject"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setRejectingUserId(null); setReasonText(""); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user._id)}
                            disabled={isApproving}
                            className="gap-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isApproving ? "..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectingUserId(user._id)}
                            className="gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="all">
          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="w-full max-w-md">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const badge = statusBadge[user.status] || statusBadge.PENDING;
              return (
                <Card key={user._id} className="p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : "No Name Set"}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">Role: {user.role || "staff"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status-specific actions */}
                      {user.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user._id)}
                            disabled={isApproving}
                            className="gap-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectingUserId(user._id)}
                            className="gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {user.status === "APPROVED" && (
                        <>
                          {assigningUserId === user._id ? (
                            <div className="flex items-center gap-2">
                              <Select value={selectedSolarUnitId} onValueChange={setSelectedSolarUnitId}>
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Select solar unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unassignedSolarUnits.length === 0 ? (
                                    <SelectItem value="" disabled>No available units</SelectItem>
                                  ) : (
                                    unassignedSolarUnits.map((unit) => (
                                      <SelectItem key={unit._id} value={unit._id}>
                                        {unit.serialNumber} ({(unit.capacity / 1000).toFixed(1)}kW)
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleAssign(user._id)}
                                disabled={!selectedSolarUnitId || isAssigning}
                              >
                                {isAssigning ? "..." : "Assign"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAssigningUserId(null);
                                  setSelectedSolarUnitId("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-xs text-blue-600 font-medium">Needs Solar Unit</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAssigningUserId(user._id)}
                                className="gap-1"
                              >
                                <Zap className="w-4 h-4" />
                                Assign Unit
                              </Button>
                              {suspendingUserId === user._id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    placeholder="Reason (optional)"
                                    value={reasonText}
                                    onChange={(e) => setReasonText(e.target.value)}
                                    className="w-48"
                                  />
                                  <Button size="sm" variant="destructive" onClick={() => handleSuspend(user._id)} disabled={isSuspending}>
                                    {isSuspending ? "..." : "Confirm"}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => { setSuspendingUserId(null); setReasonText(""); }}>Cancel</Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSuspendingUserId(user._id)}
                                  className="gap-1 text-orange-600 hover:text-orange-700"
                                >
                                  <ShieldOff className="w-4 h-4" />
                                  Suspend
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {user.status === "ACTIVE" && (
                        <>
                          {user.solarUnit && (
                            <div className="text-right">
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span
                                  className="text-sm font-medium text-foreground cursor-pointer hover:underline"
                                  onClick={() => navigate(`/admin/solar-units/${user.solarUnit.solarUnitId}`)}
                                >
                                  {user.solarUnit.serialNumber}
                                </span>
                              </div>
                            </div>
                          )}
                          {suspendingUserId === user._id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Reason (optional)"
                                value={reasonText}
                                onChange={(e) => setReasonText(e.target.value)}
                                className="w-48"
                              />
                              <Button size="sm" variant="destructive" onClick={() => handleSuspend(user._id)} disabled={isSuspending}>
                                {isSuspending ? "..." : "Confirm"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setSuspendingUserId(null); setReasonText(""); }}>Cancel</Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSuspendingUserId(user._id)}
                              className="gap-1 text-orange-600 hover:text-orange-700"
                            >
                              <ShieldOff className="w-4 h-4" />
                              Suspend
                            </Button>
                          )}
                        </>
                      )}

                      {(user.status === "REJECTED" || user.status === "SUSPENDED") && (
                        <div className="flex items-center gap-2">
                          {user.rejectionReason && (
                            <span className="text-xs text-muted-foreground max-w-48 truncate" title={user.rejectionReason}>
                              {user.rejectionReason}
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivate(user._id)}
                            disabled={isReactivating}
                            className="gap-1"
                          >
                            <RotateCcw className="w-4 h-4" />
                            {isReactivating ? "..." : "Reactivate"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline reject form */}
                  {rejectingUserId === user._id && user.status === "PENDING" && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Input
                        placeholder="Reason for rejection (optional)"
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(user._id)}
                        disabled={isRejecting}
                      >
                        {isRejecting ? "..." : "Confirm Reject"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setRejectingUserId(null); setReasonText(""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "No users match the current filters."
                  : "No users found."}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
