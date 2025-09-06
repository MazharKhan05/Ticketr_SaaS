import React from "react";
import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "./ui/button";

function SearchBar() {
  return (
    <div>
      <Form action={"/search"} className="relative">
        <input
          type="text"
          name="q"
          placeholder="Search for events"
          className="w-full py-3 px-4 pl-12 bg-white rounded-xl border border-gray-200 shadow-sm focus:outline-none 
            focus:border-transparent transition-all duration-200"
        />
        {/* <Suspense> */}
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        {/* </Suspense> */}
        <Button
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white font-medium 
            transition-colors duration-200"
        >
          Search
        </Button>
      </Form>
    </div>
  );
}

export default SearchBar;
