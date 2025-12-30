import { useState } from "react";
import { useGetSolarUnitForUserQuery } from "@/lib/redux/query";
import { useUser } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BarChart3, List } from "lucide-react";
import AnomalyStatsCards from "./components/AnomalyStatsCards";
import AnomalyList from "./components/AnomalyList";
import AnomalyCharts from "./components/AnomalyCharts";
import AnomalyFilters from "./components/AnomalyFilters";
import DataCard from "./components/DataCard";

/**
 * Anomalies Page
 * 
 * Displays detected anomalies for the user's solar unit with:
 * - Summary statistics
 * - Interactive filtering
 * - Visualization charts
 * - Anomaly list with actions
 */
const AnomaliesPage = () => {
  const { user, isLoaded } = useUser();
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    data: solarUnit, 
    isLoading: isLoadingSolarUnit, 
    isError: isErrorSolarUnit, 
    error: errorSolarUnit 
  } = useGetSolarUnitForUserQuery();

  if (!isLoaded || isLoadingSolarUnit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading anomaly data...</p>
        </div>
      </div>
    );
  }

  if (isErrorSolarUnit || !solarUnit) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Solar Unit Found</h2>
          <p className="text-muted-foreground">
            You need to have a solar unit assigned to view anomaly detection data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-primary" />
            Anomaly Detection
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage anomalies detected in your solar energy system
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
          <span className="font-medium">Solar Unit:</span> {solarUnit.serialNumber}
        </div>
      </div>

      {/* Stats Summary */}
      <AnomalyStatsCards />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="detection" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Live Detection
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Charts */}
        <TabsContent value="overview" className="space-y-6">
          <AnomalyCharts />
        </TabsContent>

        {/* Anomalies Tab - List with Filters */}
        <TabsContent value="anomalies" className="space-y-6">
          <AnomalyFilters filters={filters} onFilterChange={setFilters} />
          <AnomalyList filters={filters} />
        </TabsContent>

        {/* Live Detection Tab - Original DataCard for Teaching */}
        <TabsContent value="detection" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Interactive Detection Demo
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              This section shows live anomaly detection on recent data. Adjust the detection 
              method and thresholds to see how different algorithms identify anomalies.
            </p>
          </div>
          <DataCard solarUnitId={solarUnit._id} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AnomaliesPage;
