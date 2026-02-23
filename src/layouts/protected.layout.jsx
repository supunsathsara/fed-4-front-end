import { Outlet, Navigate, useLocation } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useGetCurrentUserQuery } from "@/lib/redux/query";

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  // Skip the current user check for admin users
  const isAdmin = user?.publicMetadata?.role === "admin";
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUserQuery(undefined, {
    skip: !isSignedIn || isAdmin,
  });

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  // Admin users bypass onboarding checks
  if (isAdmin) {
    return <Outlet />;
  }

  // Wait for user data to load
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access to the onboarding status page
  if (location.pathname === "/onboarding") {
    return <Outlet />;
  }

  // Check user status — redirect non-active users to onboarding page
  const userStatus = currentUser?.status;
  if (userStatus && userStatus !== "ACTIVE") {
    return <Navigate to="/onboarding" />;
  }

  return <Outlet />;
}
