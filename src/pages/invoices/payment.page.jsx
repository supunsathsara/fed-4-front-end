import { useParams, Link } from "react-router-dom";
import { useGetInvoiceByIdQuery } from "@/lib/redux/query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Calendar, Zap, DollarSign } from "lucide-react";
import { format } from "date-fns";
import CheckoutForm from "./components/CheckoutForm";

/**
 * Payment Page
 * 
 * Shows invoice summary and Stripe Embedded Checkout
 */
const PaymentPage = () => {
  const { id } = useParams();
  const { data: invoice, isLoading, isError, error } = useGetInvoiceByIdQuery(id);

  if (isLoading) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load invoice: {error?.message || "Unknown error"}</p>
            <Link to="/dashboard/invoices">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (invoice.paymentStatus === "PAID") {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <Card className="border-green-300 bg-green-50">
          <CardContent className="pt-6 text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700">Already Paid</h2>
            <p className="text-green-600 mt-2">
              Invoice {invoice.invoiceNumber} was paid on {format(new Date(invoice.paidAt), "MMM d, yyyy")}
            </p>
            <Link to="/dashboard/invoices">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link to="/dashboard/invoices" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Invoices
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pay Invoice</h1>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Invoice Summary - Left Side */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {invoice.invoiceNumber}
            </CardTitle>
            <CardDescription>
              {invoice.solarUnitId?.serialNumber || "Solar Unit"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Billing Period
              </span>
              <span className="font-medium text-right">
                {format(new Date(invoice.billingPeriodStart), "MMM d")} - 
                {format(new Date(invoice.billingPeriodEnd), "MMM d, yyyy")}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Energy Generated
              </span>
              <span className="font-medium">
                {invoice.totalEnergyGenerated.toFixed(2)} kWh
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Rate
              </span>
              <span className="font-medium">
                ${(invoice.amountCents / invoice.totalEnergyGenerated / 100).toFixed(4)} / kWh
              </span>
            </div>
            
            <div className="flex justify-between items-center py-4 bg-primary/5 rounded-lg px-4 -mx-2">
              <span className="font-semibold text-lg">Total Due</span>
              <span className="font-bold text-2xl text-primary">
                ${(invoice.amountCents / 100).toFixed(2)}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Due by {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
            </p>
          </CardContent>
        </Card>

        {/* Stripe Checkout - Right Side */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter your payment information below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutForm invoiceId={invoice._id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
