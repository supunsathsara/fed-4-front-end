import { useState } from "react";
import { useGetAdminInvoicesQuery, useTriggerInvoiceGenerationMutation } from "@/lib/redux/query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Calendar,
  User
} from "lucide-react";
import { format } from "date-fns";

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { 
      icon: Clock, 
      color: "text-orange-700", 
      bg: "bg-orange-100",
      label: "Pending" 
    },
    PAID: { 
      icon: CheckCircle, 
      color: "text-green-700", 
      bg: "bg-green-100",
      label: "Paid" 
    },
    FAILED: { 
      icon: XCircle, 
      color: "text-red-700", 
      bg: "bg-red-100",
      label: "Failed" 
    },
  };

  const { icon: Icon, color, bg, label } = config[status] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

/**
 * Filter Tabs
 */
const FilterTabs = ({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    { value: undefined, label: "All", count: counts?.total || 0 },
    { value: "PENDING", label: "Pending", count: counts?.PENDING || 0 },
    { value: "PAID", label: "Paid", count: counts?.PAID || 0 },
    { value: "FAILED", label: "Failed", count: counts?.FAILED || 0 },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {filters.map((filter) => (
        <Button
          key={filter.value || "all"}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeFilter === filter.value 
              ? "bg-primary-foreground/20" 
              : "bg-muted"
          }`}>
            {filter.count}
          </span>
        </Button>
      ))}
    </div>
  );
};

/**
 * Admin Invoices Page
 */
const AdminInvoicesPage = () => {
  const [statusFilter, setStatusFilter] = useState(undefined);
  
  const { data, isLoading, isError, error, refetch } = useGetAdminInvoicesQuery({ status: statusFilter });
  const [triggerGeneration, { isLoading: isGenerating }] = useTriggerInvoiceGenerationMutation();

  const handleTriggerGeneration = async () => {
    try {
      const result = await triggerGeneration().unwrap();
      alert(`Invoice generation complete!\nProcessed: ${result.processed}\nCreated: ${result.invoicesCreated}\nErrors: ${result.errors}`);
      refetch();
    } catch (error) {
      alert("Failed to generate invoices: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load invoices: {error?.message || "Unknown error"}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { invoices, counts, overdueCount } = data || { invoices: [], counts: {}, overdueCount: 0 };

  return (
    <main className="p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            All Invoices
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage invoices across all users
          </p>
        </div>
        <Button onClick={handleTriggerGeneration} disabled={isGenerating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Invoices'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{counts?.total || 0}</p>
          </CardContent>
        </Card>
        <Card className={counts?.PENDING > 0 ? "border-orange-300 bg-orange-50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-orange-600">{counts?.PENDING || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Paid</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{counts?.PAID || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{counts?.FAILED || 0}</p>
          </CardContent>
        </Card>
        <Card className={overdueCount > 0 ? "border-red-300 bg-red-50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Overdue</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{overdueCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <FilterTabs 
        activeFilter={statusFilter} 
        onFilterChange={setStatusFilter} 
        counts={counts} 
      />

      {/* Invoice Table */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold text-lg">No invoices found</p>
            <p className="text-muted-foreground">
              {statusFilter ? `No ${statusFilter.toLowerCase()} invoices` : "No invoices have been generated yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Invoice</th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Solar Unit</th>
                    <th className="text-left p-4 font-medium">Billing Period</th>
                    <th className="text-right p-4 font-medium">Energy</th>
                    <th className="text-right p-4 font-medium">Amount</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const isOverdue = invoice.paymentStatus === "PENDING" && new Date(invoice.dueDate) < new Date();
                    return (
                      <tr 
                        key={invoice._id} 
                        className={`border-b hover:bg-muted/50 ${isOverdue ? 'bg-red-50' : ''}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">{invoice.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {invoice.userId?.firstName} {invoice.userId?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{invoice.userId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {invoice.solarUnitId?.serialNumber || "N/A"}
                        </td>
                        <td className="p-4 text-sm">
                          {format(new Date(invoice.billingPeriodStart), "MMM d")} - {format(new Date(invoice.billingPeriodEnd), "MMM d")}
                        </td>
                        <td className="p-4 text-right text-sm">
                          {invoice.totalEnergyGenerated.toFixed(1)} kWh
                        </td>
                        <td className="p-4 text-right font-medium">
                          ${(invoice.amountCents / 100).toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={invoice.paymentStatus} />
                          {isOverdue && (
                            <span className="block text-xs text-red-600 mt-1">Overdue</span>
                          )}
                        </td>
                        <td className={`p-4 text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                          {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default AdminInvoicesPage;
