"use client"

import { useState, useEffect } from "react";
import { OrganRequest } from "@/lib/types";
import { FilterBar, FilterValues } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { Plus,Trash2, MapPin, Phone,Clock, HeartPulse, Loader2, Calendar } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { format, formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel,AlertDialogDescription, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteItem, getItems } from "@/lib/actions";
import { EmptyState } from "../empty-state";
import cities from "@/lib/cities.json";
import { OrganRequestForm } from "./forms/organ-request-form";

const urgencyColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

export function OrganRequestsTab() {
  const [items, setItems] = useState<OrganRequest[]>([]);
  const [filteredItems, setFilteredItems] = useState<OrganRequest[]>([]);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
const [sortBy, setSortBy] = useState("latest");

  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    city: "All",
    hospital: "All",
    bloodGroup: "All",
    urgency: "All",
    organType:"All",
  });

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getItems("organ", token);
        const transformedData = data.map((item: any) => ({ ...item, id: item._id }));
        setItems(transformedData);
        setFilteredItems(transformedData);
      } catch (error) {
        console.error("Failed to fetch organ requests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleFilterChange = (filters: FilterValues) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      city: "All",
      hospital: "All",
      bloodGroup: "All",
      urgency: "All",
      organType:"All",
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...items];
  
    if (activeFilters.city !== "All") filtered = filtered.filter(i => i.city === activeFilters.city);
    if (activeFilters.organType !== "All") filtered = filtered.filter(i => i.organType === activeFilters.organType);
    if (activeFilters.urgency !== "All") filtered = filtered.filter(i => i.urgency === activeFilters.urgency);
  
    // ✅ Sort Logic
    const urgencyOrder = { High: 1, Medium: 2, Low: 3 };
  
    if (sortBy === "latest") filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "oldest") filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sortBy === "highUrgency") filtered.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
    if (sortBy === "lowUrgency") filtered.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
    if (sortBy === "deadlineSoon") {
      filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    if (sortBy === "deadlineFar") {
      filtered.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
    }
    
    setFilteredItems(filtered);
  }, [activeFilters, items, sortBy]);
  
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const result = await deleteItem(id, "organ", token);
    if (result.success) {
      setItems(prev => prev.filter(item => item.id !== id));
      setFilteredItems(prev => prev.filter(item => item.id !== id));
      toast({variant:"success", title: "Success", description: "Organ Request deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const handleSuccess = (newRequest: OrganRequest) => {
    setItems(prev => [newRequest, ...prev]);
    setFilteredItems(prev => [newRequest, ...prev]);
    setIsModalOpen(false);
  };

  const hospitals = Array.from(new Set(items.map(i => i.name)));

  if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-800 text-xl font-bold font-headline">Manage Organ Requests</h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Request</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Organ Request</DialogTitle>
            </DialogHeader>
            <OrganRequestForm onSuccess={handleSuccess} cities={cities} />
          </DialogContent>
        </Dialog>
      </div>
      {
      <FilterBar
          filters={["city", "hospital", "organType", "urgency"]}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          cities={cities}
          hospitals={hospitals}
          activeFilters={activeFilters}
          resultsCount={filteredItems.length} 
          onSortChange={setSortBy} sortBy={sortBy}      />}

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<HeartPulse className="h-12 w-12" />}
          title="No Organ Requests"
          message="You haven't posted any organ requests yet. Click 'Add Request' to get started."
          action={{ label: "Add First Request", onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Filter Bar */}
      
          {filteredItems.map(item => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const isOwner = user?._id === item.hospital;
            return (
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
                            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-500 hover:text-red-100">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure? You want to delete it </AlertDialogTitle>
                              <AlertDialogDescription>This will permanently remove this organ request.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </span>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-red-600 px-2 py-1 rounded-full border border-red-600 uppercase">
                        Organ Type: <span className="text-md font-bold text-red-400 px-2 py-1">{item.organType}</span>
                      </span>
                      
                    </div>
                  </div>
                }
                description={`Requested at ${formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}`}
                details={[
                  { icon: <MapPin size={16} />, label: <strong>{item.city}</strong> },
                  { icon: <Clock size={16}/> ,label: <strong>{format(new Date(item.deadline), "PP")}</strong> },
                  { icon: <Phone size={16} />, label: <strong>{item.contact}</strong> },
                  { icon: <Clock size={16} />,label : (<span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColors[item.urgency]}`}>
                        {item.urgency} Urgency
                      </span>)}
                ]}
                actions = {<><Calendar size={16} color = "red"/><strong>{formatDistanceToNow(new Date(item.deadline),{addSuffix:true})} left  </strong></>}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
