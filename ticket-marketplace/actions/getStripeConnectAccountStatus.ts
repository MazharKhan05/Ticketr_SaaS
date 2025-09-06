"use server";
import { api } from "@/convex/_generated/api";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Convex URL is not defined");
}
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export type AccountStatus = {
  isActive: boolean;
  requiresInformation: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
};
export async function getStripeAccountStatus(
  stripeAccountId: string
): Promise<AccountStatus> {
  if (!stripeAccountId) {
    throw new Error("Stripe account ID is required");
  }

  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);

    return {
      isActive:
        account.details_submitted &&
        !account.requirements?.currently_due?.length,
      requiresInformation: !!(
        account.requirements?.currently_due?.length ||
        account.requirements?.eventually_due?.length ||
        account.requirements?.past_due?.length
      ),
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
      },
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    };
  } catch (error) {
    console.error("Error retrieving Stripe account status:", error);
    throw new Error("Failed to retrieve Stripe account status");
  }
}
