import { useGetSolarUnitForUserQuery } from "@/lib/redux/query";
import DataChart from "./components/DataChart";
import WeatherWidget from "./components/WeatherWidget";
import CapacityFactorChart from "./components/CapacityFactorChart";
import { useUser } from "@clerk/clerk-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const DashboardSkeleton = () => (
  <main className="mt-4 pb-8">
    {/* Header */}
    <Skeleton className="h-10 w-56 rounded-lg" />
    <Skeleton className="h-4 w-80 mt-3 rounded" />

    {/* Weather widget placeholder */}
    <div className="mt-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </Card>
    </div>

    {/* Charts grid */}
    <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </Card>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </Card>
    </div>
  </main>
);

const DashboardPage = () => {
  const { user, isLoaded } = useUser();

  const { data: solarUnit, isLoading: isLoadingSolarUnit, isError: isErrorSolarUnit, error: errorSolarUnit } = useGetSolarUnitForUserQuery();

  if (isLoadingSolarUnit) {
    return <DashboardSkeleton />;
  }

  if (isErrorSolarUnit) {
    return <div>Error: {errorSolarUnit.message}</div>;
  }

  console.log(solarUnit);

  return (
    <main className="mt-4 pb-8">
      <h1 className="text-4xl font-bold text-foreground">{user?.firstName}'s House</h1>
      <p className="text-gray-600 mt-2">
        Welcome back to your Solar Energy Production Dashboard
      </p>
      
      {/* Weather Widget */}
      <div className="mt-6">
        <WeatherWidget />
      </div>
      
      {/* Charts Grid */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Energy Production Chart */}
        <DataChart solarUnitId={solarUnit._id} />
        
        {/* Capacity Factor Chart */}
        <CapacityFactorChart solarUnitId={solarUnit._id} />
      </div>
    </main>
  );
};

export default DashboardPage;
