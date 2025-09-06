"use server";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex";
import { stripe } from "@/lib/stripe";

export async function refundEventTickets(eventId: Id<"events">) {
  const convex = getConvexClient();

  const event = await convex.query(api.events.getById, { eventId });
  if (!event) {
    throw new Error("Event not found");
  }

  // get event user;s stripe connectId
  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    {
      userId: event.userId,
    }
  );

  if (!stripeConnectId) {
    throw new Error("Stripe connect Id not found!");
  }

  // get all valid tickets
  const tickets = await convex.query(api.tickets.getValidTicketsForEvent, {
    eventId,
  });

  const results = await Promise.allSettled(
    tickets.map(async (ticket) => {
      try {
        if (!ticket.paymentIntentId) {
          throw new Error("Payment intent not found!");
        }

        // issue refund throgh stripe
        await stripe.refunds.create(
          {
            payment_intent: ticket.paymentIntentId,
            reason: "requested_by_customer",
          },
          {
            stripeAccount: stripeConnectId,
          }
        );

        await convex.mutation(api.tickets.updateTicketStatus, {
          ticketId: ticket._id,
          status: "refunded",
        });
        return { success: true, ticketId: ticket._id };
      } catch (error) {
        console.error("Failed to refund ticket!", ticket._id, error);
        return { success: false, ticketId: ticket._id, error };
      }
    })
  );

  const allSuccess = results.every(
    (result) => result.status === "fulfilled" && result.value.success
  );
  if (!allSuccess) {
    throw new Error("Some of refunds failed, please check logs and try again.");
  }

  //cancel event instead of deleting it
  await convex.mutation(api.events.cancelEvent, { eventId });
  return { success: true };
}
