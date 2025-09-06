import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SellerDashboard from "@/components/SellerDashboard";

async function SellerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return (
    <div className="min-h-screen bg-gray-50">
      <SellerDashboard />
    </div>
  );
}

export default SellerPage;
