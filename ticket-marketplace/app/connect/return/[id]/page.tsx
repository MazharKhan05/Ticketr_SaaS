import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

function ReturnPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
            <div className="mb-3 flex justify-center">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold">Account Connected!</h1>
            <p className="mt-2 text-sm text-green-200">
              Your Stripe account has been successfully connected.
            </p>
          </div>
          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-1">
                  What happens next?
                </h3>
                <ul className="text-sm text-green-600 space-y-2">
                  <li>
                    You can now manage your events and tickets directly from the
                    dashboard.
                  </li>
                  <li>
                    Your account is ready to accept payments for your events.
                  </li>
                  <li>
                    Finds will be transferred to your bank account
                    automatically.
                  </li>
                </ul>
              </div>
              <Link
                href="/seller"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Go to Seller Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnPage;
