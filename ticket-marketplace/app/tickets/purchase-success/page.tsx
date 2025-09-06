import Ticket from "@/components/Ticket";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

async function TicketSuccess() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const convex = getConvexClient();
  const tickets = await convex.query(api.events.getUserTickets, {
    userId,
  });
  const latestTicket = tickets[tickets.length - 1];
  if (!latestTicket) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ticket Purchase Successful!
          </h1>
          <p className="mt-2 text-gray-600">
            Your ticket has been confirmed and ready to use.
          </p>
        </div>
        <Ticket ticketId={latestTicket._id} />
      </div>
    </div>
  );
}

export default TicketSuccess;
