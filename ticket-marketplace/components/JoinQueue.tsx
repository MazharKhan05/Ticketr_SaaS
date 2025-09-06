"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import Spinner from "./Spinner";
import { WAITING_LIST_STATUS } from "@/convex/constants";
import { Clock, OctagonXIcon } from "lucide-react";

function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string;
}) {
  const { toast } = useToast();
  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId,
  });
  const availability = useQuery(api.events.getEventAvailability, {
    eventId,
  });
  const event = useQuery(api.events.getById, { eventId });
  const isEventOwner = event?.userId === userId;
  console.log("userTicket for event:", userTicket);
  console.log("queuePosition:", queuePosition);
  console.log("availability:", availability);

  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({
        eventId,
        userId,
      });
      if (result.success) {
        console.log("Successfully joined the queue");
        toast({
          title: "Success!",
          description: `You have successfully joined the queue for ${event?.name}.`,
          variant: "default",
        });
      }
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too many times")
      ) {
        toast({
          title: "Slow down there!",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Oops! Something went wrong",
          description: "Failed to join queue. Please try again later.",
          variant: "destructive",
        });
      }
    }
  };
  if (queuePosition === undefined || availability === undefined || !event)
    return <Spinner />;
  // if (!userTicket) return null;
  const isPastEvent = event.eventDate < Date.now();

  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt < Date.now())) && (
        <>
          {isEventOwner ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
              <OctagonXIcon className="w-5 h-5" />
              <span>You cannot buy ticket for your own event!</span>
            </div>
          ) : isPastEvent ? (
            <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
              <Clock className="w-5 h-5" />
              <span>This event has already Ended.</span>
            </div>
          ) : availability.purchasedCount >= availability?.totalTickets ? (
            <div className="text-center p-4">
              <p className="text-lg font-semibold text-red-600">
                Sorry, this event is sold out.
              </p>
            </div>
          ) : (
            <button
              className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
              onClick={handleJoinQueue}
              disabled={isPastEvent || isEventOwner}
            >
              Join Waiting List
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default JoinQueue;
