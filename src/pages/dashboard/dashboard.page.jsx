import { useGetSolarUnitForUserQuery } from "@/lib/redux/query";
import DataChart from "./components/DataChart";
import WeatherWidget from "./components/WeatherWidget";
import CapacityFactorChart from "./components/CapacityFactorChart";
import { useUser } from "@clerk/clerk-react";

const DashboardPage = () => {
  const { user, isLoaded } = useUser();

  const { data: solarUnit, isLoading: isLoadingSolarUnit, isError: isErrorSolarUnit, error: errorSolarUnit } = useGetSolarUnitForUserQuery();

  if (isLoadingSolarUnit) {
    return <div>Loading...</div>;
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
