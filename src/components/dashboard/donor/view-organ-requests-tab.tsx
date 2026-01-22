"use client"

import { useState } from "react";
import { organRequests } from "@/lib/data";
import { OrganRequest } from "@/lib/types";
import { FilterBar } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, Clock, Hospital, HeartPulse } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { format, formatDistanceToNow } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EmptyState } from "../empty-state";

const urgencyColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

export function ViewOrganRequestsTab() {
  const [items, setItems] = useState<OrganRequest[]>(organRequests);

  const handleFilter = (type: string, value: string) => console.log("Filtering by", type, value);
  
  return (
    <div>
      
      {items.length === 0 ? (
        <EmptyState 
            icon={<HeartPulse className="h-12 w-12" />}
            title="No Active Organ Requests"
            message="There are currently no active organ requests. Check back later!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => {
            console.log(item);
            return(
            <Collapsible key={item.id} asChild>
              <DashboardCard
                title={`Need: ${item.organType}`}
                description={`Posted by ${item.hospitalName}`}
                details={[
                  { icon: <MapPin size={16} />, label: item.city },
                  { icon: <Clock size={16} />, label: <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColors[item.urgency]}`}>{item.urgency} Urgency</span> },
                ]}
                actions={
                   <div className="flex justify-between w-full items-center">
                    <p className="text-xs text-muted-foreground">
                      Posted {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                    <CollapsibleTrigger asChild>
                      <Button variant="link" className="pr-0">View More</Button>
                    </CollapsibleTrigger>
                  </div>
                }
              >
                <CollapsibleContent className="space-y-3 text-sm animate-in fade-in pt-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-primary"><Hospital size={16} /></span>
                    <span className="text-foreground">{item.hospitalName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-primary"><Calendar size={16} /></span>
                    <span className="text-foreground">Deadline: {format(new Date(item.deadline), 'PP')}</span>
                  </div>
                   <Button asChild className="w-full mt-2">
                      <a href={`tel:6374917497`}>
                        <Phone className="mr-2 h-4 w-4" /> Contact Hospital
                      </a>
                   </Button>
                </CollapsibleContent>
              </DashboardCard>
            </Collapsible>
          )})}
        </div>
      )}
    </div>
  );
}
