"use server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function createStripeConnectAccountLink(accountId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not defined");
  }

  try {
    const headersList = await headers();
    const requestOrigin = headersList.get("origin") || "";

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${requestOrigin}/connect/return/${accountId}`,
      return_url: `${requestOrigin}/connect/return/${accountId}`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Error creating Stripe Connect account link:", error);
    if (error instanceof Error) {
      throw new Error(
        `Failed to create Stripe Connect account link: ${error.message}`
      );
    }
    throw new Error("Failed to create Stripe Connect account link");
  }
}
