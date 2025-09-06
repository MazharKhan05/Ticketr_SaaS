"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReleaseTicket from "./ReleaseTicket";
import { createStripeCheckoutSession } from "@/actions/createStripeCheckoutSession";

function PurchaseTicket({ eventId }: { eventId: Id<"events"> }) {
  const router = useRouter();
  const { user } = useUser();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const offerExpiresAt = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = offerExpiresAt < Date.now();

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Offer expired");
        return;
      }
      const diff = offerExpiresAt - Date.now();
      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (minutes) {
        setTimeRemaining(
          `${minutes}minute${minutes === 1 ? "" : "s"} ${seconds} second${seconds === 1 ? "" : "s"}`
        );
      } else {
        setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
      }
    };
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [offerExpiresAt, isExpired]);
  if (!user || !queuePosition) return null;
  // create stripe checkout session
  const handlePurchase = async () => {
    if (!user.id || !queuePosition._id) return;
    setIsLoading(true);
    try {
      const { sessionUrl } = await createStripeCheckoutSession({
        eventId,
      });
      if (sessionUrl) {
        router.push(sessionUrl);
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to redirect to checkout. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-amber-200">
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Ticket Reserved
                </h3>
                <p className="text-sm text-gray-500">
                  Expires in {timeRemaining}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              A ticket has been reserved for you. Please complete your purchase
              within the next {timeRemaining} to secure your spot.
            </div>
          </div>
        </div>
        <button
          onClick={handlePurchase}
          disabled={isExpired || isLoading}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gradient-to-l transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Redirecting to checkout..."
            : "Purchase Your Ticket Now!"}
        </button>
        <div className="mt-4">
          <ReleaseTicket eventId={eventId} waitingListId={queuePosition._id} />
        </div>
      </div>
    </div>
  );
}

export default PurchaseTicket;
