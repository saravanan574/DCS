"use client"

import { useState } from "react";
import { availableOrgans } from "@/lib/data";
import { AvailableOrgan } from "@/lib/types";
import { FilterBar, FilterValues } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Hospital, Heart } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "../empty-state";

export function ViewAvailableOrgansTab() {
  const [items, setItems] = useState<AvailableOrgan[]>(availableOrgans);
  const [filteredItems, setFilteredItems] = useState<AvailableOrgan[]>([]);

  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    organType:"All",
    city: "All",
    hospital: "All",
    bloodGroup: "All", // not used here but FilterBar expects it
    urgency: "All" // not used here but FilterBar expects it
  });
  const handleFilter = (type: string, value: string) => console.log("Filtering by", type, value);
  
  return (
    <div>
      
       {items.length === 0 ? (
        <EmptyState 
            icon={<Heart className="h-12 w-12" />}
            title="No Available Organs Listed"
            message="There are currently no available organs listed. Check back later!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <DashboardCard
              key={item.id}
              title={`Available: ${item.organType}`}
              description={`Listed by ${item.hospitalName}`}
              details={[
                { icon: <Hospital size={16} />, label: item.hospitalName },
                { icon: <MapPin size={16} />, label: item.city },
              ]}
              actions={
                <div className="flex justify-between w-full items-center">
                  <p className="text-xs text-muted-foreground">
                    Listed {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                  <Button asChild>
                    <a href={`tel:${item.contact}`}>
                      <Phone className="mr-2 h-4 w-4" /> Contact
                    </a>
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
