import SellerEventList from "@/components/SellerEventList";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export default async function SellerEventsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  //   console.log(userId);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* Navigation & Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link
                href="/tickets"
                className="flex items-center text-gray-600 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to My Tickets
              </Link>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
                <p className="mt-2 text-gray-600">
                  Manage, track sales and view all your events in one place.
                </p>
              </div>
            </div>
            <Link
              href="/seller/new-event"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              New Event
            </Link>
          </div>
        </div>
        {/* Event List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <SellerEventList />
        </div>
      </div>
    </div>
  );
}
