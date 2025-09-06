"use client";
import { createStripeConnectAccountLink } from "@/actions/createStripeConnectAccountLink";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

function RefreshPage() {
  const params = useParams();
  const connectAccountId = params.id as string;
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    React.useState(false);
  const [error, setError] = React.useState<boolean>(false);

  useEffect(() => {
    const createAccountLink = async () => {
      if (connectAccountId) {
        setAccountLinkCreatePending(true);
        setError(false);
        try {
          const { url } =
            await createStripeConnectAccountLink(connectAccountId);
          window.location.href = url;
        } catch (err) {
          console.error("Error creating account link:", err);
          setError(true);
        }
        setAccountLinkCreatePending(false);
      }
    };
    createAccountLink();
  }, [connectAccountId]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-2xl font-bold">Account Setup</h1>
            <p className="mt-2 text-sm">
              Complete your account setup to start selling tickets.
            </p>
          </div>
          {/* Content */}
          <div className="p-6">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800 mb-1">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-red-600">
                    Please try again later or contact support.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">
                  {accountLinkCreatePending
                    ? "Creating account link..."
                    : "Redirecting to Stripe..."}
                </p>
                {connectAccountId && (
                  <p className="text-sm text-gray-500 mt-2">
                    Account ID: {connectAccountId}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefreshPage;
