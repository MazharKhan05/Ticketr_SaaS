"use client";

import Ticket from "@/components/Ticket";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { useEffect } from "react";

function MyTicket() {
  const params = useParams();
  const { user } = useUser();
  const ticketId = params.id as Id<"tickets">;
  const ticket = useQuery(api.tickets.getTicketWithDetails, { ticketId });

  useEffect(() => {
    if (!user) redirect("/");
    if (!ticket || ticket.userId !== user.id) redirect("/");

    if (!ticket.event) redirect("/");
  }, [user, ticket]);

  if (!ticket || !ticket.event) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 space-y-8">
          {/* Navigation & Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/tickets"
              className="flex items-center text-gray-600 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to My Tickets
            </Link>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-800 transition-colors">
                <Download className="w-5 h-5" />
                Save
              </button>
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                <Share2 className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
          {/* Event info */}
          <div
            className={`bg-white p-6 rounded-lg shadow-sm border ${ticket?.event?.is_cancelled ? "border-red-300" : "border-gray-200"}}`}
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {ticket?.event?.name}
            </h1>
            <p className="mt-1 text-gray-600">
              {new Date(ticket?.event?.eventDate).toLocaleDateString()} at{" "}
              {ticket?.event?.location}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full font-medium ${ticket?.event?.is_cancelled ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
              >
                {ticket?.event?.is_cancelled ? "Cancelled" : "Valid Ticket"}
              </span>
              <span className="text-sm text-gray-500">
                Purchased on{" "}
                {new Date(ticket?.purchasedAt).toLocaleDateString()}
              </span>
            </div>
            {ticket?.event?.is_cancelled && (
              <p className="mt-4 text-sm text-red-600">
                This event has been cancelled. A refund will be processed if it
                has not been already.
              </p>
            )}
          </div>
        </div>
        {/* Ticket info */}
        <Ticket ticketId={ticket?._id} />
        {/* Additional Info */}
        <div
          className={`mt-8 rounded-lg p-4 border ${ticket?.event?.is_cancelled ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}
        >
          <h3
            className={`text-sm font-medium ${ticket?.event?.is_cancelled ? "text-red-800" : "text-blue-800"}`}
          >
            Need Help?
          </h3>
        </div>
      </div>
    </div>
  );
}

export default MyTicket;
