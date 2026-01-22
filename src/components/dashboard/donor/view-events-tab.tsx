"use client"

import { useState, useEffect } from "react";
import { DonationEvent } from "@/lib/types";
import { FilterBar, FilterValues } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, Loader2, Italic } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "../empty-state";
import { getPublicItems } from "@/lib/actions";
import cities from "@/lib/cities.json";
import { toast } from "@/hooks/use-toast";

export function ViewEventsTab() {
  const [items, setItems] = useState<DonationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<DonationEvent[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    city: "All",
    hospital: "All",
    bloodGroup: "All", // placeholder to satisfy FilterValues type
    urgency: "All",   // placeholder
    organType:"All",
  });
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPublicItems("events");
        const transformedData = data.map((item: any) => ({
          ...item,
          hospital:item.name,
          id: item._id,
          location: item.city
        }));
        console.log(data);
        setItems(transformedData);
        setFilteredItems(transformedData);
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
    if (activeFilters.city !== "All") filtered = filtered.filter(i => i.city === activeFilters.city);
    if (activeFilters.hospital !== "All") filtered = filtered.filter(i => i.name === activeFilters.hospital);
    if (sortBy === "latest") {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === "oldest") {
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
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
  const hospitals = Array.from(new Set(items.map(i => i.hospital)));

  return (
    <div>
      {/* Filter Bar */}
      <FilterBar
        filters={["city", "hospital"]}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        cities={cities}
        hospitals={hospitals}
        activeFilters={activeFilters}
        resultsCount={filteredItems.length} 
        onSortChange={setSortBy} sortBy={sortBy} />
    
       {filteredItems.length === 0 ? (
        <EmptyState 
            icon={<Calendar className="h-12 w-12" />}
            title="No Upcoming Events"
            message="There are no donation events scheduled at the moment that match your criteria. Please check back soon!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 capitalize">
          {filteredItems.map(item =>{;return(
            <DashboardCard
              key={item.id}
              title={item.title}
              description={<>Organized by <span className="italic text-white-700">{item.name}</span></>}
              details={[
                { icon: <Calendar size={16} color="green"/>, label: <>Start: <strong>{format(new Date(item.startDateTime), 'PPp')}</strong></> },
                { icon: <Calendar size={16} color="red" />, label: <>End: <strong>{format(new Date(item.endDateTime), 'PPp')}</strong></> },
                { icon: <MapPin size={16} />, label: item.location || "N/A" },
              ]}
              actions = {<><Calendar size={16} color = "red"/><strong>{formatDistanceToNow(new Date(item.endDateTime),{addSuffix:true})} left  </strong></>}
            />
          )})}
        </div>
      )}
    </div>
  );
}
