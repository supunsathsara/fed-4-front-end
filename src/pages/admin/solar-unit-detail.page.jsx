import { useParams, useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Zap, Calendar, Gauge, User, UserPlus, UserMinus } from "lucide-react";
import { format } from "date-fns";
import { useGetSolarUnitByIdQuery, useGetUnassignedUsersQuery, useAssignSolarUnitMutation, useUnassignSolarUnitMutation } from "@/lib/redux/query";
import { useState } from "react";

export default function SolarUnitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: solarUnit, isLoading: isLoadingSolarUnit, isError: isErrorSolarUnit, error: errorSolarUnit } = useGetSolarUnitByIdQuery(id);
  const { data: unassignedUsers, isLoading: isLoadingUsers } = useGetUnassignedUsersQuery(undefined, { skip: !showAssignForm });
  const [assignSolarUnit, { isLoading: isAssigning }] = useAssignSolarUnitMutation();
  const [unassignSolarUnit, { isLoading: isUnassigning }] = useUnassignSolarUnitMutation();
  
  if (isLoadingSolarUnit) {
    return <div>Loading...</div>;
  }

  if (isErrorSolarUnit) {
    return <div>Error: {errorSolarUnit.message}</div>;
  }

  const handleEdit = () => {
    navigate(`/admin/solar-units/${solarUnit._id}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete with confirmation
    console.log("Delete solar unit:", solarUnit._id);
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    try {
      await assignSolarUnit({ id: solarUnit._id, userId: selectedUserId }).unwrap();
      setShowAssignForm(false);
      setSelectedUserId("");
    } catch (error) {
      console.error("Failed to assign:", error);
    }
  };

  const handleUnassign = async () => {
    try {
      await unassignSolarUnit(solarUnit._id).unwrap();
    } catch (error) {
      console.error("Failed to unassign:", error);
    }
  };

  const assignedUser = typeof solarUnit.userId === 'object' ? solarUnit.userId : null;

  return (
    <main className="mt-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/solar-units")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-4xl font-bold text-foreground">
          {solarUnit.serialNumber}
        </h1>
      </div>

      <p className="text-gray-600 mb-8">
        View and manage solar unit details and performance
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Status</h2>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  solarUnit.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : solarUnit.status === "MAINTENANCE"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {solarUnit.status}
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-muted-foreground">
              {solarUnit.status === "ACTIVE"
                ? "This solar unit is currently operational and generating energy."
                : solarUnit.status === "MAINTENANCE"
                  ? "This solar unit is currently under maintenance."
                  : "This solar unit is currently inactive."}
            </p>
          </Card>

          {/* Assigned User Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Assigned User</h2>
              {assignedUser ? (
                <div className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Assigned
                </div>
              ) : (
                <div className="px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Not Assigned
                </div>
              )}
            </div>
            <Separator className="my-4" />

            {assignedUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {assignedUser.firstName} {assignedUser.lastName || ''}
                    </p>
                    <p className="text-sm text-muted-foreground">{assignedUser.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 mt-3"
                  onClick={handleUnassign}
                  disabled={isUnassigning}
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  {isUnassigning ? "Unassigning..." : "Unassign User"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  No user is currently assigned to this solar unit.
                </p>
                {!showAssignForm ? (
                  <Button
                    size="sm"
                    onClick={() => setShowAssignForm(true)}
                    className="gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign User
                  </Button>
                ) : (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingUsers ? (
                            <SelectItem value="" disabled>Loading users...</SelectItem>
                          ) : unassignedUsers?.length === 0 ? (
                            <SelectItem value="" disabled>No unassigned users</SelectItem>
                          ) : (
                            unassignedUsers?.map((user) => (
                              <SelectItem key={user._id} value={user._id}>
                                {user.email}{user.firstName ? ` (${user.firstName} ${user.lastName || ''})` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAssign}
                      disabled={!selectedUserId || isAssigning}
                    >
                      {isAssigning ? "Assigning..." : "Assign"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAssignForm(false);
                        setSelectedUserId("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Technical Specifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Technical Specifications
            </h2>
            <Separator className="my-4" />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Capacity</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {(solarUnit.capacity / 1000).toFixed(1)} kW
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                </div>
                <p className="text-2xl font-bold text-foreground font-mono">
                  {solarUnit.serialNumber}
                </p>
              </div>
            </div>
          </Card>

          {/* Installation Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Installation Information
            </h2>
            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <p className="text-sm text-muted-foreground">
                    Installation Date
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {format(new Date(solarUnit.installationDate), "MMMM d, yyyy")}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Unit ID</p>
                <p className="text-sm font-mono text-foreground">
                  {solarUnit._id}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div>
          <Card className="p-6 sticky top-4">
            <h3 className="font-semibold text-foreground mb-4">Actions</h3>
            <div className="space-y-3">
              <Button onClick={handleEdit} className="w-full">
                Edit Details
              </Button>
              <Button variant="outline" className="w-full">
                View Performance
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-full text-red-600 hover:text-red-700"
              >
                Delete Unit
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
