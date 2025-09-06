"use client";

import { createStripeConnectLoginLink } from "@/actions/createStripeConnectLoginLink";
import {
  AccountStatus,
  getStripeAccountStatus,
} from "@/actions/getStripeConnectAccountStatus";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { CalendarDays, Cog, DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { createStripeConnectConsumer } from "@/actions/createStripeConnectConsumer";
import { createStripeConnectAccountLink } from "@/actions/createStripeConnectAccountLink";

function SellerDashboard() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [errror, setError] = useState(false);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(
    null
  );
  const router = useRouter();
  const { user } = useUser();

  const stripeConnectId = useQuery(api.users.getUsersStripeConnectId, {
    userId: user?.id ?? "",
  });

  const isReadyToAcceptPayments =
    accountStatus?.isActive && accountStatus?.payouts_enabled;
  useEffect(() => {
    if (stripeConnectId) {
      fetchAccountStatus();
    }
  }, [stripeConnectId]);

  if (stripeConnectId === undefined) {
    return <Spinner />;
  }

  const handleManageAccount = async () => {
    try {
      if (stripeConnectId && accountStatus?.isActive) {
        const loginUrl = await createStripeConnectLoginLink(stripeConnectId);
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error("Error creating Stripe Connect login link:", error);
      setError(true);
    }
  };

  const fetchAccountStatus = async () => {
    if (stripeConnectId) {
      try {
        const status = await getStripeAccountStatus(stripeConnectId);
        setAccountStatus(status);
      } catch (error) {
        console.error("Error fetching account status:", error);
        setError(true);
      }
    }
  };
  console.log("Account Status:", stripeConnectId, accountStatus);
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold">Seller Dashboard</h2>
          <p className="mt-2 text-blue-100">
            Manage your seller profile & payments settings.
          </p>
        </div>
        {/* main content  */}
        {isReadyToAcceptPayments && (
          <>
            <div className="bg-white p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Sell tickets for your events
              </h2>
              <p className="text-gray-700 mb-4">
                List your tickets for sale and manage your events easily.
              </p>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-center gap-4">
                  <Link
                    href="/seller/new-event"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Event
                  </Link>
                  <Link
                    href="/seller/events"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    View My Events
                  </Link>
                </div>
              </div>
            </div>
            <hr className="my-8 border-gray-200" />
          </>
        )}
        {/* Account Onboarding seller */}
        <div className="p-6">
          {!stripeConnectId && !accountCreatePending && (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">
                Start Accepting Payments
              </h3>
              <p className="text-gray-600 mb-6">
                Create your seller account to start receiving payments securely
                through Stripe.
              </p>
              <button
                onClick={async () => {
                  setAccountCreatePending(true);
                  try {
                    await createStripeConnectConsumer();
                    router.refresh();
                  } catch (error) {
                    console.error(
                      "Error creating Stripe Connect account:",
                      error
                    );
                    setAccountCreatePending(false);
                    setError(true);
                  } finally {
                    setAccountCreatePending(false);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Seller Account
              </button>
            </div>
          )}
          {/* Account Status Section */}
          {stripeConnectId && accountStatus && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Card Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-500">
                    Account Status
                  </h3>
                  <div className="mt-2 flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${accountStatus.isActive ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    <span className="text-lg font-semibold">
                      {accountStatus.isActive ? "Active" : "Pending Setup"}
                    </span>
                  </div>
                </div>
                {/* Payment Status Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-gray-500">
                    Payment Capability
                  </h3>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <DollarSign
                        className={`w-5 h-5 mr-2 ${accountStatus.charges_enabled ? "text-green-500" : "text-gray-400"}`}
                      />
                      <span>
                        {accountStatus.charges_enabled
                          ? "Can Accept Payments"
                          : "Cannot Accept Payments yet!"}
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <DollarSign
                        className={`w-5 h-5 mr-2 ${accountStatus.payouts_enabled ? "text-green-500" : "text-gray-400"}`}
                      />
                      <span>
                        {accountStatus.payouts_enabled
                          ? "Can Receive Payouts"
                          : "Cannot Receive Payouts yet!"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* account setup requirements */}
              {accountStatus.requiresInformation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-yellow-600 mb-3">
                    Required Account Information
                  </h3>
                  {accountStatus.requirements.currently_due.length > 0 && (
                    <div className="mb-3">
                      <p className="text-yellow-800 font-medium mb-2">
                        Action Required:
                      </p>
                      <ul className="pl-3 list-disc text-sm text-yellow-700">
                        {accountStatus.requirements.currently_due.map(
                          (item, index) => (
                            <li key={index}>{item.replace(/_/g, " ")}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {accountStatus.requirements.eventually_due.length > 0 && (
                    <div className="mb-3">
                      <p className="text-yellow-800 font-medium mb-2">
                        Eventually Required:
                      </p>
                      <ul className="pl-3 list-disc text-sm text-yellow-700">
                        {accountStatus.requirements.eventually_due.map(
                          (item, index) => (
                            <li key={index}>{item.replace(/_/g, " ")}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {/* Show Add information btn, if info are required */}
                  {!accountLinkCreatePending && (
                    <button
                      onClick={async () => {
                        setAccountLinkCreatePending(true);
                        try {
                          const { url } =
                            await createStripeConnectAccountLink(
                              stripeConnectId
                            );
                          router.push(url);
                        } catch (error) {
                          console.error(
                            "Error creating Stripe Connect account link:",
                            error
                          );
                          setAccountLinkCreatePending(false);
                          setError(true);
                        } finally {
                          setAccountLinkCreatePending(false);
                        }
                      }}
                      className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Complete Requirement
                    </button>
                  )}
                </div>
              )}
              {/* Manage Account Button */}
              <div className="flex flex-wrap gap-3 mt-6">
                {accountStatus.isActive && (
                  <button
                    onClick={handleManageAccount}
                    className="bg-blue-600 text-white px-3 py-2 flex items-center rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Cog className="w-4 h-4 mr-2" />
                    Seller Dashboard
                  </button>
                )}
                <button
                  onClick={fetchAccountStatus}
                  className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Refresh Status
                </button>
              </div>
              {errror && (
                <div className="mt-4 bg-red-100 text-red-600 p-3 rounded-lg">
                  Unable to access Stripe dashboard. Please complete all
                  requirements and try again.
                </div>
              )}
            </div>
          )}
          {/* Loading States */}
          {accountCreatePending && (
            <div className="text-center py-4 text-gray-600">
              <Spinner />
              <p className="mt-2">Creating your seller account...</p>
            </div>
          )}
          {accountLinkCreatePending && (
            <div className="text-center py-4 text-gray-600">
              <Spinner />
              <p className="mt-2">Preparing account setup...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
