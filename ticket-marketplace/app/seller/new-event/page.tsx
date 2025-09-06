import EventForm from "@/components/EventForm";
import React from "react";

function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">Create New Event</h1>
          <p className="mt-2 text-sm">
            Fill out the form below to create a new event.
          </p>
        </div>
        <div className="p-6">
          <EventForm mode="create" />
        </div>
      </div>
    </div>
  );
}

export default NewEventPage;
