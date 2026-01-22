
"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ViewBloodRequestsTab } from "@/components/dashboard/donor/view-blood-requests-tab";
import { ViewEventsTab } from "@/components/dashboard/donor/view-events-tab";
import { ViewHospitalDetail} from '@/components/dashboard/donor/view-hospital-details'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Calendar, User, Mail, Droplet, Link, Hospital, HeartHandshake, UserCircle2, UserCircle2Icon, Baby } from "lucide-react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { useRouter } from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function DonorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [log,setLog] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  useEffect(() => {
    
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userType");
      if(!token ){
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Please Login first",
        });
        router.push("/login?role=donor")
        setLog(false);
      }
      else 
        setLog(true);
      if(role != "donor") router.push("/hospital-dashboard");
      if (userJson) {
      setUser(JSON.parse(userJson));
    }
    }
    
  }, []);
  const donorStats = user ? [
      { label: "Blood Group", value: user.bloodGroup, icon: <Droplet /> },
      { label: "City", value: user.city, icon: <User /> },
      { label: "Contact", value: user.contact, icon: <Mail /> },
      { label: "Age", value:user.age, icon: <Baby />},
    ] : [];

  const tabs = [
    { value: "blood", label: "Blood Requests", icon: <Droplets className="mr-2 h-4 w-4" /> },
    { value: "events", label: "Events", icon: <Calendar className="mr-2 h-4 w-4" /> },
    { value: "hospital",label:"Hospital details",icon:<Hospital className="mr-2 h-4 w-4" />}
  ];
  const Login = [
    {icon:"Login",label:"",value:"/login?role=donor"},
    {icon:"Register",label:"",value:"/register?role=donor"},
  ]
  return (
    <DashboardShell
      title="Donor Dashboard"
      description="View requests and events to make a difference."
    >
      {user && (
         <div className="mb-8">
          <DashboardStats
            userName={user.name}
            userEmail={user.email}
            userRole="Donor"
            stats={donorStats}
          />
        </div>
      )}

      {log  && <Tabs defaultValue="blood" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 h-auto">
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
         <TabsContent value="blood" className="mt-6">
            <ViewBloodRequestsTab />
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <ViewEventsTab />
          </TabsContent>
          <TabsContent value="hospital" className="mt-6">
            <ViewHospitalDetail />
          </TabsContent>
      </Tabs>}

    </DashboardShell>
  );
}
