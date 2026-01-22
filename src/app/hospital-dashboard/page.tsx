"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BloodRequestsTab } from "@/components/dashboard/hospital/blood-requests-tab";
import { EventsTab } from "@/components/dashboard/hospital/events-tab";
import { AvailableOrgansTab } from "@/components/dashboard/hospital/available-organs-tab";
import { OrganRequestsTab } from "@/components/dashboard/hospital/organ-requests-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Heart, HeartPulse, Calendar, Loader2 } from "lucide-react";
import { getItems } from "@/lib/actions";
import { DashboardStats, Stat } from "@/components/dashboard/dashboard-stats";
import { useRouter } from "next/navigation";

export default function HospitalDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user safely
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    const role = localStorage.getItem("userType");
    if(role != "donor") router.push("/hospital-dashboard");
    if (!userJson) {
      setLoading(false);
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userJson));
  }, []);

  // Load stats only after user is set
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [blood, organs, available, events] = await Promise.all([
          getItems("blood", token),
          getItems("organ", token),
          getItems("available-organs", token),
          getItems("events", token),
        ]);

        setStats([
          { label: "Blood Requests", value: blood.length, icon: <Droplets /> },
          { label: "Organ Requests", value: organs.length, icon: <HeartPulse /> },
          { label: "Available Organs", value: available.length, icon: <Heart /> },
          { label: "Events", value: events.length, icon: <Calendar /> },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  if (loading) {
    return (
      <DashboardShell title="Hospital Dashboard" description="">
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!user) return null;

  const tabs = [
    { value: "blood", label: "Blood Requests", icon: <Droplets className="mr-2 h-4 w-4" /> },
    { value: "organ-requests", label: "Organ Requests", icon: <HeartPulse className="mr-2 h-4 w-4" /> },
    { value: "available-organs", label: "Available Organs", icon: <Heart className="mr-2 h-4 w-4" /> },
    { value: "events", label: "Events", icon: <Calendar className="mr-2 h-4 w-4" /> },
  ];

  return (
    <DashboardShell
      title="Hospital Dashboard"
      description="Manage your requests, available organs, and events."
    >
      <div className="mb-8">
        <DashboardStats
          userName={user.name}
          userEmail={user.email}
          userRole="Hospital"
          stats={stats}
        />
      </div>

      <Tabs defaultValue="blood" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 py-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-500"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="blood" className="mt-3"><BloodRequestsTab /></TabsContent>
        <TabsContent value="organ-requests" className="mt-5"><OrganRequestsTab /></TabsContent>
        <TabsContent value="available-organs" className="mt-6"><AvailableOrgansTab /></TabsContent>
        <TabsContent value="events" className="mt-6"><EventsTab /></TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
