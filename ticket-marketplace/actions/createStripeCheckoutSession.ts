"use server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DURATIONS } from "@/convex/constants";
import baseUrl from "@/lib/baseUrl";
import { getConvexClient } from "@/lib/convex";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export type StripeCheckoutMetadata = {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
};
export async function createStripeCheckoutSession({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const convex = getConvexClient();

  const event = await convex.query(api.events.getById, { eventId });
  if (!event) {
    throw new Error("Event not found");
  }

  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });
  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("User is not in the queue or offer not available");
  }

  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    { userId: event.userId }
  );

  if (!stripeConnectId) {
    throw new Error("Stripe Connect account not found for owner of the event!");
  }
  if (!queuePosition.offerExpiresAt) {
    throw new Error("Offer expiration time not found for the queue position!");
  }

  const metaData: StripeCheckoutMetadata = {
    eventId,
    userId,
    waitingListId: queuePosition._id,
  };
  // Create a Stripe Checkout session
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.name,
              description: event.description,
            },
            unit_amount: Math.round(event.price * 100), // $20.00
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(event.price * 0.01 * 100), // 1% fee
      },
      expires_at: Math.floor(Date.now() / 1000) + DURATIONS.TICKET_OFFER / 1000,
      mode: "payment",
      success_url: `${baseUrl}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/event/${eventId}`,
      metadata: metaData,
    },
    {
      stripeAccount: stripeConnectId, // Connect account ID of the event owner
    }
  );

  return { sessionId: session.id, sessionUrl: session.url };
}
