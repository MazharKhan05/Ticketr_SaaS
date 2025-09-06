"use server";
import { api } from "@/convex/_generated/api";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Convex URL is not defined");
}
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function createStripeConnectConsumer() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const existingConsumerConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    { userId }
  );
  if (existingConsumerConnectId) {
    return { account: existingConsumerConnectId };
  }

  const account = await stripe.accounts.create({
    type: "express",
    capabilities: {
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
  });

  await convex.mutation(api.users.updateOrCreateUserStripeConnectId, {
    userId,
    stripeConnectId: account.id,
  });
  return { account: account.id };
}
