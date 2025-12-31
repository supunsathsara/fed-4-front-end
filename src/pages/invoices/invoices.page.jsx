import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useGetInvoicesQuery, useGetPendingInvoiceCountQuery } from "@/lib/redux/query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Calendar,
  Zap,
  DollarSign,
  AlertCircle
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
      border: "border-orange-300",
      label: "Pending" 
    },
    PAID: { 
      icon: CheckCircle, 
      color: "text-green-700", 
      bg: "bg-green-100",
      border: "border-green-300",
      label: "Paid" 
    },
    FAILED: { 
      icon: XCircle, 
      color: "text-red-700", 
      bg: "bg-red-100",
      border: "border-red-300",
      label: "Failed" 
    },
  };

  const { icon: Icon, color, bg, border, label } = config[status] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color} ${border} border`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

/**
 * Invoice Card Component
 */
const InvoiceCard = ({ invoice }) => {
  const isOverdue = invoice.paymentStatus === "PENDING" && new Date(invoice.dueDate) < new Date();
  
  return (
    <Card className={`${isOverdue ? "border-red-300 bg-red-50/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={invoice.paymentStatus} />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </span>
              )}
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {invoice.invoiceNumber}
            </CardTitle>
            <CardDescription>
              {invoice.solarUnitId?.serialNumber || "Solar Unit"}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              ${(invoice.amountCents / 100).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {invoice.totalEnergyGenerated.toFixed(1)} kWh
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Billing Period:</span>
          </div>
          <div className="text-sm text-right">
            {format(new Date(invoice.billingPeriodStart), "MMM d")} - {format(new Date(invoice.billingPeriodEnd), "MMM d, yyyy")}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due Date:</span>
          </div>
          <div className={`text-sm text-right ${isOverdue ? "text-red-600 font-medium" : ""}`}>
            {format(new Date(invoice.dueDate), "MMM d, yyyy")}
          </div>
        </div>
        
        {invoice.paymentStatus === "PENDING" && (
          <Link to={`/dashboard/invoices/${invoice._id}/pay`}>
            <Button className="w-full" size="lg">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          </Link>
        )}
        
        {invoice.paymentStatus === "PAID" && invoice.paidAt && (
          <div className="text-sm text-center text-green-600">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Paid on {format(new Date(invoice.paidAt), "MMM d, yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Filter Tabs Component
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
 * Invoices Page
 */
const InvoicesPage = () => {
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState(undefined);
  
  const { data, isLoading, isError, error } = useGetInvoicesQuery({ status: statusFilter });

  if (isLoading) {
    return (
      <main className="p-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64 mb-8" />
        <div className="flex gap-2 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
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

  const { invoices, counts } = data || { invoices: [], counts: {} };

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Invoices
        </h1>
        <p className="text-muted-foreground mt-1">
          View and pay your solar energy invoices
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
      </div>

      {/* Filter Tabs */}
      <FilterTabs 
        activeFilter={statusFilter} 
        onFilterChange={setStatusFilter} 
        counts={counts} 
      />

      {/* Invoice Grid */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold text-lg">No invoices found</p>
            <p className="text-muted-foreground">
              {statusFilter ? `No ${statusFilter.toLowerCase()} invoices` : "You don't have any invoices yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice._id} invoice={invoice} />
          ))}
        </div>
      )}
    </main>
  );
};

export default InvoicesPage;
