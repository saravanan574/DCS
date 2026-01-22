"use client"

import { useState, useEffect } from "react";
import {  HospitalDetail } from "@/lib/types";
import { FilterBar, FilterValues } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, Loader2, Italic, Mail, PhoneCallIcon } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "../empty-state";
import { getPublicItems } from "@/lib/actions";
import cities from "@/lib/cities.json";
import { toast } from "@/hooks/use-toast";

export function ViewHospitalDetail() {
  const [items, setItems] = useState<HospitalDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<HospitalDetail[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    city: "All",
    hospital: "All",
    bloodGroup: "All", // placeholder to satisfy FilterValues type
    urgency: "All",   // placeholder
    organType:"All",
  });
  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPublicItems("hospitals");
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter by city and hospital
  useEffect(() => {
    let filtered = items;
    if (activeFilters.city !== "All") filtered = filtered.filter(i => i.location === activeFilters.city);
    if (activeFilters.hospital !== "All") filtered = filtered.filter(i => i.name === activeFilters.hospital);
    setFilteredItems(filtered);
  }, [activeFilters, items]);

  const handleFilterChange = (filters: FilterValues) => {
    setActiveFilters(filters);
  }

  const handleClearFilters = () => {
    setActiveFilters({
      city: "All",
      hospital: "All",
      organType:"All",
      bloodGroup: "All",
      urgency: "All"
    });
  }
  if(loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  const hospitals = Array.from(new Set(items.map(i => i.name)));

  return (
    <div>
      {/* Filter Bar */}
      {filteredItems.length === 0 ? null:
      <FilterBar
        filters={["hospital", "city"]}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        cities={cities}
        hospitals={hospitals}
        activeFilters={activeFilters}
        resultsCount={filteredItems.length}
      />}
       {filteredItems.length === 0 ? (
        <EmptyState 
            icon={<Calendar className="h-12 w-12" />}
            title="No Upcoming Events"
            message="There are no donation events scheduled at the moment that match your criteria. Please check back soon!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 capitalize">
          {filteredItems.map(item =>{return(
            <DashboardCard
              key={item._id}
              title={<div className="flex flex-col gap-2">
              <span className="font-semibold text-lg">
                {item?.name || "Untitled Event"}<span className={`mx-2 px-2 py-1 text-xs bg-red-600 text-red-100 font-medium rounded-full `}>
                  Hospital
                </span>
              </span>
            </div>}
              description={<div className="flex items-center ">
                <MapPin size={16} color="red" /><span className="italic text-white-700">{item.location}</span>
              </div>}
              details={[
                { icon: <Mail size={16} color="red" />, label: <><a href={`mailto:${item.email}?subject=Inquiry`}  className = "lowercase">{item.email}</a></> },
                { icon: <PhoneCallIcon size={16} />, label: <a href={`tel:${item.phone}?subject=Inquiry`}  className = "lowercase">{item.phone}</a> },
              ]}
            />
          )})}
        </div>
      )}
    </div>
  );
}
