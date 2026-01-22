"use client";

import { useState, useEffect } from "react";
import { DonationEvent } from "@/lib/types";
import { FilterBar, FilterValues } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin, Calendar, Loader2 } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { format, formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteItem, getItems } from "@/lib/actions";
import { EmptyState } from "../empty-state";
import cities from "@/lib/cities.json";
import { EventForm } from "./forms/event-form";

export function EventsTab() {
  const [items, setItems] = useState<DonationEvent[]>([]);
  const [filteredItems, setFilteredItems] = useState<DonationEvent[]>([]);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");

  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    city: "All",
    hospital: "All",
    bloodGroup: "All",
    urgency: "All",
    organType: "All",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getItems("events", token);
        const transformedData = data.map((item: any) => ({
          ...item,
          id: item._id,
          location: item.city
        }));
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

  // Filter + Sort
  useEffect(() => {
    let filtered = items;

    if (activeFilters.city !== "All") filtered = filtered.filter(i => i.city === activeFilters.city);
    if (activeFilters.hospital !== "All") filtered = filtered.filter(i => i.name === activeFilters.hospital);

    // ✅ Sorting logic
    if (sortBy === "latest") {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sortBy === "oldest") {
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    setFilteredItems(filtered);
  }, [activeFilters, items, sortBy]);

  const handleFilterChange = (filters: FilterValues) => setActiveFilters(filters);

  const handleClearFilters = () => {
    setActiveFilters({
      city: "All",
      hospital: "All",
      bloodGroup: "All",
      urgency: "All",
      organType: "All",
    });
  };

  const hospitals = Array.from(new Set(items.map(i => i.name)));

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const result = await deleteItem(id, "events", token);
    if (result.success) {
      setItems(prev => prev.filter(item => item.id !== id));
      setFilteredItems(prev => prev.filter(item => item.id !== id));
      toast({variant:"success", title: "Success", description: "Event deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const handleSuccess = (newEvent: DonationEvent) => {
    setItems(prev => [newEvent, ...prev]);
    setFilteredItems(prev => [newEvent, ...prev]);
    setIsModalOpen(false);
  };

  if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-800 text-xl font-bold font-headline">Manage Donation Events</h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Event</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm onSuccess={handleSuccess} cities={cities} />
          </DialogContent>
        </Dialog>
      </div>

      { 
        <FilterBar
        filters={["city", "hospital"]}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        cities={cities}
        hospitals={hospitals}
        activeFilters={activeFilters}
        resultsCount={filteredItems.length} 
        onSortChange={setSortBy} sortBy={sortBy}      />
      
      }

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No Events Found"
          message="No events match your filters."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 capitalize">
          {filteredItems.map(item => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const isOwner = user?._id === item.hospital;
            return (
              <DashboardCard
                key={item.id}
                title={
                  <div className="flex flex-col w-full">
                    <span className="font-semibold text-lg">
                      {item?.title || "Untitled Event"}
                    </span>
                  </div>
                }
                description={
                  <div>
                    <span>Organized by {item?.name || 'Hospital'}</span><br />
                    <span>Posted at <strong>{format(new Date(item.createdAt), 'PP')}</strong></span>
                  </div>
                }
                details={[
                  { icon: <Calendar size={16}/>, label: <>Start: <strong>{format(new Date(item.startDateTime), 'PPp')}</strong></> },
                  { icon: <Calendar size={16}/>, label: <>End: <strong>{format(new Date(item.endDateTime), 'PPp')}</strong></> },
                  { icon: <MapPin size={16} />, label: item.location || "N/A" },
                ]}
                actions={<><strong>{formatDistanceToNow(new Date(item.endDateTime),{addSuffix:true})}</strong></>}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
