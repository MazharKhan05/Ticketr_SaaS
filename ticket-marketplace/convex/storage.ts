import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return ctx.storage.getUrl(storageId);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  const storageId = await ctx.storage.generateUploadUrl();
  return storageId;
});

export const updateEventImage = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, { eventId, storageId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    await ctx.db.patch(eventId, { imageStorageId: storageId ?? undefined });
  },
});

export const deleteEventImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    await ctx.storage.delete(storageId);
  },
});
