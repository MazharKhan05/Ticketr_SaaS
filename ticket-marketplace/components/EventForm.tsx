"use client";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useStorageUrl } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import Image from "next/image";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Evemt Name is required"),
  description: z.string().min(1, "Event Description is required"),
  location: z.string().min(1, "Event Location is required"),
  eventDate: z
    .date()
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Event Date must be in the future"
    ),
  price: z.number().min(0, "Price must be a positive number"),
  totalTickets: z.number().min(1, "Total Tickets must be at least 1"),
});
type FormData = z.infer<typeof formSchema>;

interface InitialEventData {
  _id: Id<"events">;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  imageStorageId?: Id<"_storage">;
}
interface EventFormProps {
  mode: "create" | "edit";
  initialData?: InitialEventData;
}
function EventForm({ mode, initialData }: EventFormProps) {
  const { user } = useUser();
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const currentImageUrl = useStorageUrl(initialData?.imageStorageId);

  // image upload
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateEventImage = useMutation(api.storage.updateEventImage);
  const deleteEventImage = useMutation(api.storage.deleteEventImage);

  const [removedCurrentImage, setRemovedCurrentImage] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      eventDate: initialData ? new Date(initialData.eventDate) : new Date(),
      price: initialData?.price || 0,
      totalTickets: initialData?.totalTickets || 1,
    },
  });

  async function onSubmit(data: FormData) {
    if (!user?.id) return;

    startTransition(async () => {
      try {
        let imageStorageId = null;
        if (selectedImage) {
          imageStorageId = await handleImageUpload(selectedImage);
          if (!imageStorageId) return; // Handle upload failure
        }
        if (mode === "edit" && initialData?.imageStorageId) {
          if (removedCurrentImage) {
            await deleteEventImage({
              storageId: initialData.imageStorageId,
            });
          }
        }
        if (mode === "create") {
          const eventId = await createEvent({
            ...data,
            userId: user.id,
            eventDate: data.eventDate.getTime(),
          });
          if (imageStorageId) {
            await updateEventImage({
              eventId,
              storageId: imageStorageId as Id<"_storage">,
            });
          }
          router.push(`/event/${eventId}`);
        } else {
          if (!initialData?._id) {
            throw new Error("Event is required for update");
          }
          await updateEvent({
            eventId: initialData._id,
            ...data,
            eventDate: data.eventDate.getTime(),
          });

          if (imageStorageId || removedCurrentImage) {
            await updateEventImage({
              eventId: initialData._id,
              storageId: imageStorageId as Id<"_storage">,
            });
          }
          toast({
            title: "Event Updated",
            description: "Your event has been updated successfully.",
          });
          router.push(`/event/${initialData._id}`);
        }
      } catch (error) {
        console.error("Event form submission failed:", error);
        toast({
          title: "Event Submission Failed",
          description:
            "There was an error submitting the event. Please try again.",
          variant: "destructive",
        });
      }
    });
  }
  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
      if (!result.ok) {
        throw new Error("Failed to upload image");
      }
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({
        title: "Image Upload Failed",
        description:
          "There was an error uploading the image. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder="event name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Description</FormLabel>
                <FormControl>
                  <Input placeholder="event description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <Input placeholder="event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      );
                    }}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    } // Format date for input
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Price per ticket</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      className="pl-6" // Add padding to accommodate the dollar sign
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                      value={field.value || ""} // Ensure value is a string for input
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalTickets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Total tickets Available</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    className="pl-6" // Add padding to accommodate the dollar sign
                    onChange={(e) => {
                      field.onChange(Number(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Event Image
            </label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                <div className="relative w-32 h-32 aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview || currentImageUrl!}
                    alt="Event Image"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 p-1"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                      if (imageInput.current) {
                        imageInput.current.value = "";
                      }
                      setRemovedCurrentImage(true);
                    }}
                  >
                    x
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInput}
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                />
              )}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:bg-blue-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "create" ? "Creating Event..." : "Updating Event..."}
            </>
          ) : mode === "create" ? (
            "Create Event"
          ) : (
            "Update Event"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default EventForm;
