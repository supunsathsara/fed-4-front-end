import { useGetCurrentUserQuery } from "@/lib/redux/query";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, ShieldOff, Zap } from "lucide-react";

const statusConfig = {
  PENDING: {
    icon: Clock,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    title: "Account Pending Approval",
    description:
      "Your account has been created and is currently awaiting admin approval. You'll be able to access the dashboard once an administrator reviews and approves your account.",
    hint: "This usually takes less than 24 hours. You'll receive access once approved.",
  },
  APPROVED: {
    icon: CheckCircle,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Account Approved!",
    description:
      "Great news — your account has been approved! An administrator will assign a solar unit to your account shortly. Once a solar unit is assigned, you'll have full access to the dashboard.",
    hint: "A solar unit will be assigned to you soon. Check back later!",
  },
  REJECTED: {
    icon: XCircle,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Account Not Approved",
    description:
      "Unfortunately, your account registration was not approved. If you believe this is an error, please contact your system administrator.",
    hint: null,
  },
  SUSPENDED: {
    icon: ShieldOff,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    title: "Account Suspended",
    description:
      "Your account has been temporarily suspended. Please contact your system administrator for more information.",
    hint: null,
  },
};

export default function OnboardingPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const { data: currentUser, isLoading, refetch } = useGetCurrentUserQuery();

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  // If user is active, redirect to dashboard
  if (currentUser?.status === "ACTIVE") {
    return <Navigate to="/dashboard" />;
  }

  // Admin bypass
  if (user?.publicMetadata?.role === "admin") {
    return <Navigate to="/admin" />;
  }

  const status = currentUser?.status || "PENDING";
  const config = statusConfig[status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className={`p-8 ${config.bgColor} ${config.borderColor} border-2`}>
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className={`w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center`}>
              <StatusIcon className={`w-10 h-10 ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>

            {/* User Info */}
            <div className="text-sm text-muted-foreground">
              <p>
                Signed in as <span className="font-medium text-foreground">{user?.primaryEmailAddress?.emailAddress}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{config.description}</p>

            {/* Rejection Reason */}
            {status === "REJECTED" && currentUser?.rejectionReason && (
              <div className="w-full bg-white rounded-lg p-4 border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
                <p className="text-sm text-red-700">{currentUser.rejectionReason}</p>
              </div>
            )}

            {/* Suspension Reason */}
            {status === "SUSPENDED" && currentUser?.rejectionReason && (
              <div className="w-full bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-sm font-medium text-orange-800 mb-1">Reason:</p>
                <p className="text-sm text-orange-700">{currentUser.rejectionReason}</p>
              </div>
            )}

            {/* Hint */}
            {config.hint && (
              <div className="w-full bg-white/70 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{config.hint}</p>
              </div>
            )}

            {/* Workflow Steps */}
            {(status === "PENDING" || status === "APPROVED") && (
              <div className="w-full bg-white rounded-lg p-5 space-y-4">
                <p className="text-sm font-semibold text-foreground text-left">How it works:</p>
                <div className="space-y-3">
                  <WorkflowStep
                    number={1}
                    title="Sign Up"
                    description="Create your account"
                    completed={true}
                  />
                  <WorkflowStep
                    number={2}
                    title="Admin Approval"
                    description="Account reviewed by admin"
                    completed={status !== "PENDING"}
                    active={status === "PENDING"}
                  />
                  <WorkflowStep
                    number={3}
                    title="Solar Unit Assigned"
                    description="Get a solar unit linked to your account"
                    completed={false}
                    active={status === "APPROVED"}
                  />
                  <WorkflowStep
                    number={4}
                    title="Dashboard Access"
                    description="Monitor your energy production"
                    completed={false}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => refetch()}
              >
                Check Status
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, description, completed, active }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          completed
            ? "bg-green-100 text-green-700"
            : active
              ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <div className="text-left">
        <p className={`text-sm font-medium ${completed ? "text-green-700" : active ? "text-blue-700" : "text-gray-400"}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
