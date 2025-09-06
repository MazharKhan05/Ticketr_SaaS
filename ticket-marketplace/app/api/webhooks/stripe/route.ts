import { StripeCheckoutMetadata } from "@/actions/createStripeCheckoutSession";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  console.log("webhook called");

  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  console.log("webhook signature: ", signature ? "Present" : "Missing");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    console.log("Webhook event constructed successfully", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  const convex = getConvexClient();

  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed event");
    const session = event.data.object as Stripe.Checkout.Session;

    const metaData = session.metadata as StripeCheckoutMetadata;
    console.log("Session metadata: ", metaData);
    console.log("Convex client: ", convex);

    try {
      const result = await convex.mutation(api.events.purchaseTicket, {
        eventId: metaData.eventId,
        userId: metaData.userId,
        waitingListId: metaData.waitingListId,
        paymentInfo: {
          paymentIntentId: session.payment_intent as string,
          amount: session.amount_total ?? 0,
        },
      });
      console.log("Purcase ticket mutation completed:", result);
    } catch (err) {
      console.error("Error processing webhook:", err);
      return new Response(`Webhook Error: ${(err as Error).message}`, {
        status: 500,
      });
    }
  }
  return new Response(null, {
    status: 200,
  });
}
