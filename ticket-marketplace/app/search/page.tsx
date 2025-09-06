"use client";

import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";
import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { SearchIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

function Search() {
  const searchParams = useSearchParams();
  // const [searchQuery, setSearchQuery] = useState("");
  // const [searchResults, setSearchResults] = useState<
  //   | {
  //       _id: Id<"events">;
  //       _creationTime: number;
  //       imageStorageId?: Id<"_storage"> | undefined;
  //       is_cancelled?: boolean | undefined;
  //       name: string;
  //       description: string;
  //       location: string;
  //       eventDate: number;
  //       price: number;
  //       totalTickets: number;
  //       userId: string;
  //     }[]
  //   | undefined
  // >([]);
  // const params = new URLSearchParams(window?.location?.search);
  const query = searchParams.get("q") || "";
  const searchResults = useQuery(api.events.search, {
    searchTerm: query,
  });

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const params = new URLSearchParams(window.location.search);
  //     setSearchQuery(params.get("q") || "");
  //   }
  // }, []);
  if (!searchResults) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  const upcomingEvents = searchResults
    .filter((event) => event.eventDate > Date.now())
    .sort((a, b) => a.eventDate - b.eventDate);
  const pastEvents = searchResults
    .filter((event) => event.eventDate <= Date.now())
    .sort((a, b) => b.eventDate - a.eventDate);
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <SearchIcon className="w-5 h-5" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Search Results for {query}
            </h1>
            <p className="mt-2 text-gray-600">
              {searchResults.length} results found
            </p>
          </div>
        </div>
        {searchResults.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No results found
            </h3>
            <p className="text-gray-600 mt-1">
              Try adjusting your search terms or browse all events.
            </p>
          </div>
        )}

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} eventId={event._id} />
              ))}
            </div>
          </div>
        )}

        {/* Past events */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Past Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event._id} eventId={event._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
