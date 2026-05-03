import type { Metadata } from "next";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — MeteoProxy",
  description: "Panel de control meteorológico — datos en tiempo real",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
