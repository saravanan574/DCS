"use client";

import { useState, useEffect } from "react";
import { BloodRequest } from "@/lib/types";
import { FilterBar, FilterValues } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, Clock, Hospital, Droplets, Loader2 } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "../empty-state";
import { getPublicItems } from "@/lib/actions";
import cities from "@/lib/cities.json";
import { toast } from "@/hooks/use-toast";

const urgencyColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

export function ViewBloodRequestsTab() {
  const [items, setItems] = useState<BloodRequest[]>([]);
  const [filteredItems, setFilteredItems] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest"); // ✅ added sort state

  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    organType: "All",
    city: "All",
    hospital: "All",
    bloodGroup: "All",
    urgency: "All",
  });

  // Fetch public blood requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getPublicItems("blood");
        const transformedData = data.map((item: any) => ({
          ...item,
          id: item._id,
          hospitalName: item.hospital?.name || "N/A",
        }));
        setItems(transformedData);
        setFilteredItems(transformedData);
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Try again" });
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Apply filters whenever activeFilters or items change
  useEffect(() => {
    let filtered = [...items];

    if (activeFilters.city !== "All") filtered = filtered.filter(i => i.city === activeFilters.city);
    if (activeFilters.hospital !== "All") filtered = filtered.filter(i => i.hospitalName === activeFilters.hospital);
    if (activeFilters.bloodGroup !== "All") filtered = filtered.filter(i => i.bloodGroup === activeFilters.bloodGroup);
    if (activeFilters.urgency !== "All") filtered = filtered.filter(i => i.urgency === activeFilters.urgency);
    const urgencyOrder = { High: 1, Medium: 2, Low: 3 };

if (sortBy === "latest") filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
if (sortBy === "oldest") filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
if (sortBy === "highUrgency") filtered.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
if (sortBy === "lowUrgency") filtered.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);

// ✅ Deadline sort
if (sortBy === "deadlineSoon") {
  filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
}
if (sortBy === "deadlineFar") {
  filtered.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
}

    setFilteredItems(filtered);
  }, [activeFilters, items]);

  const handleFilterChange = (filters: FilterValues) => setActiveFilters(filters);
  const handleClearFilters = () =>
    setActiveFilters({
      organType: "All",
      city: "All",
      hospital: "All",
      bloodGroup: "All",
      urgency: "All",
    });

  // Generate unique hospital names for filter
  const hospitals = Array.from(new Set(items.map(i => i.hospitalName)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      {
      <FilterBar
      filters={["hospital", "city", "bloodGroup", "urgency"]}
      onFilterChange={setActiveFilters}
      onClearFilters={handleClearFilters}
      activeFilters={activeFilters}
      sortBy={sortBy}
      onSortChange={setSortBy}
      cities={cities}
      hospitals={hospitals}
      resultsCount={filteredItems.length}
    />}

      {/* Requests List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Droplets className="h-12 w-12" />}
          title="No Active Blood Requests"
          message="There are currently no active blood requests matching your criteria."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
             return( <DashboardCard
            key={item.id}
            title={
              <div className="flex flex-col w-full">
                <span className="font-semibold text-lg">
                  {item?.name || "Unknown Hospital"}<span className={`mx-2 px-2 py-1 text-xs bg-red-600 text-red-100 font-medium rounded-full `}>
                    Hospital
                  </span>

                </span>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-red-600 px-2 py-1 rounded-full border border-red-600 uppercase">
                    Blood Group: <span className="font-bold text-red-400">{item.bloodGroup}</span>
                  </span>
                </div>
              </div>
            }
            description={`Requested at ${formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}`}
            details={[
              { icon: <MapPin size={16} />, label: item.city },
              { icon: <Phone size={16} />, label: item.contact },
              { icon: <Calendar size={16} />, label: `Deadline: ${format(new Date(item.deadline), "PP")}` },
              {
                icon: <Clock size={16} />,
                label: (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColors[item.urgency]}`}>
                    {item.urgency} Urgency
                  </span>
                ),
              },
            ]}
            actions = {<><Calendar size={16} color = "red"/><strong>{formatDistanceToNow(new Date(item.deadline),{addSuffix:true})} left  </strong></>}

          />)
})}
        </div>
      )}
    </div>
  );
}
