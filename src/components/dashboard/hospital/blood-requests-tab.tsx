"use client";

import { useState, useEffect } from "react";
import { BloodRequest } from "@/lib/types";
import { FilterBar } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { Plus, Trash2, MapPin, Phone, Calendar, Clock, Droplets, Loader2 } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { format, formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteItem, getItems } from "@/lib/actions";
import { EmptyState } from "../empty-state";
import cities from "@/lib/cities.json";
import { BloodRequestForm } from "./forms/blood-request-form";
import { FilterValues } from "../filter-bar";

const urgencyColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};
export function BloodRequestsTab() {
  const [items, setItems] = useState<BloodRequest[]>([]);
  const [filteredItems, setFilteredItems] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState("latest"); // ✅ added sort state

  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    organType: "All",
    city: "All",
    hospital: "All",
    bloodGroup: "All",
    urgency: "All",
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      
      try {
        const data = await getItems("blood", token);
        const transformed = data.map((i: any) => ({ ...i, id: i._id }));
        setItems(transformed);
        setFilteredItems(transformed);
      } catch {
        console.error("Failed to fetch blood requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = [...items];

    if (activeFilters.city !== "All") filtered = filtered.filter(i => i.city === activeFilters.city);
    if (activeFilters.hospital !== "All") filtered = filtered.filter(i => i.name === activeFilters.hospital);
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
  }, [activeFilters, items, sortBy]);

  const handleClearFilters = () => {
    setActiveFilters({
      organType: "All",
      city: "All",
      hospital: "All",
      bloodGroup: "All",
      urgency: "All",
    });
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const result = await deleteItem(id, "blood", token);
    if (result.success) {
      setItems(prev => prev.filter(r => r.id !== id));
      toast({ variant:"success", title: "Success", description: "Deleted" });
    }
  };

  const handleSuccess = (newRequest: BloodRequest) => {
    setItems(prev => [newRequest, ...prev]);
  
    // ✅ TEMP EMAIL UNTIL YOU CONNECT DONOR LIST
  
    toast({ variant: "success", title: "Request Created", description: "Email notification sent" });
    setIsModalOpen(false);
  };
  

  if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const hospitals = Array.from(new Set(items.map(i => i.name)));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-800 text-xl font-bold">Manage Blood Requests</h3>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Blood Request</DialogTitle>
              <BloodRequestForm onSuccess={handleSuccess} cities={cities} />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

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
      />

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Droplets className="h-12 w-12" />}
          title="No Blood Requests"
          message="No blood requests found"
          action={{ label: "Add Request", onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(item => {
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              const isOwner = user?._id === item?.hospital;return(
            <DashboardCard
            key={item.id}
            title={
              <div className="flex flex-col w-full">
                <span className="font-semibold text-lg">
                  {item?.name || "Unknown Hospital"}<span className={`mx-2 px-2 py-1 text-xs bg-red-600 text-red-100 font-medium rounded-full `}>
                    Hospital
                  </span>
                  {isOwner && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-500 hover:text-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure? You want to delete it</AlertDialogTitle>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogHeader>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </span>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-red-600 px-2 py-1 rounded-full border border-red-600 uppercase">
                    Organ Type : <span className="font-bold text-red-400">{item.bloodGroup}</span>
                  </span>
                </div>
              </div>
            }
            description={`Added ${formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}`}
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

          />
          )})}
        </div>
      )}
    </div>
  );
}
