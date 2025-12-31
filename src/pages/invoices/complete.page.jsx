import { useSearchParams, Link } from "react-router-dom";
import { useGetSessionStatusQuery } from "@/lib/redux/query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, FileText, ArrowLeft } from "lucide-react";

/**
 * Payment Complete Page
 * 
 * Shows payment result after Stripe checkout redirect
 */
const PaymentCompletePage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { data, isLoading, isError } = useGetSessionStatusQuery(sessionId, {
    skip: !sessionId,
  });

  if (!sessionId) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center py-12">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Invalid Session</h2>
            <p className="text-muted-foreground mt-2">
              No payment session found. Please try again.
            </p>
            <Link to="/dashboard/invoices">
              <Button className="mt-6">
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-5 w-64 mx-auto" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center py-12">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-muted-foreground mt-2">
              Failed to verify payment status. Please check your invoices.
            </p>
            <Link to="/dashboard/invoices">
              <Button className="mt-6">
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const isSuccess = data?.paymentStatus === "paid";
  const amount = data?.amountTotal ? (data.amountTotal / 100).toFixed(2) : "0.00";

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Link to="/dashboard/invoices" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Invoices
      </Link>

      {isSuccess ? (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="pt-6 text-center py-12">
            <div className="relative inline-block">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                <div className="bg-green-500 rounded-full p-1">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-green-700 mt-6">
              Payment Successful!
            </h1>
            
            <p className="text-green-600 mt-2 text-lg">
              Thank you for your payment
            </p>
            
            <div className="mt-6 p-4 bg-white rounded-lg inline-block">
              <p className="text-muted-foreground text-sm">Amount Paid</p>
              <p className="text-3xl font-bold text-foreground">${amount}</p>
              {data?.invoiceNumber && (
                <p className="text-sm text-muted-foreground mt-1">
                  Invoice: {data.invoiceNumber}
                </p>
              )}
            </div>
            
            <p className="text-green-600 mt-6 text-sm">
              A confirmation email has been sent to your registered email address.
            </p>
            
            <Link to="/dashboard/invoices">
              <Button className="mt-8" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                View All Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6 text-center py-12">
            <XCircle className="h-20 w-20 text-red-500 mx-auto" />
            
            <h1 className="text-3xl font-bold text-red-700 mt-6">
              Payment Failed
            </h1>
            
            <p className="text-red-600 mt-2 text-lg">
              Your payment could not be processed
            </p>
            
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Please check your payment details and try again. If the problem persists, 
              please contact your bank or try a different payment method.
            </p>
            
            {data?.invoiceNumber && (
              <Link to={`/dashboard/invoices/${data.invoiceId}/pay`}>
                <Button className="mt-8" size="lg" variant="destructive">
                  Try Again
                </Button>
              </Link>
            )}
            
            <Link to="/dashboard/invoices">
              <Button variant="outline" className="mt-4 ml-4" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default PaymentCompletePage;
