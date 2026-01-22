"use client"

import { useState, useEffect } from "react";
import { AvailableOrgan } from "@/lib/types";
import { FilterBar, FilterValues } from "../filter-bar";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin, Phone, Heart, Loader2 } from "lucide-react";
import { DashboardCard } from "../dashboard-card";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteItem, getItems } from "@/lib/actions";
import { EmptyState } from "../empty-state";
import cities from "@/lib/cities.json";
import { AvailableOrganForm } from "./forms/available-organ-form";

const urgencyOrder = { High: 1, Medium: 2, Low: 3 };
export function AvailableOrgansTab() {
  
  const [items, setItems] = useState<AvailableOrgan[]>([]);
  const [filteredItems, setFilteredItems] = useState<AvailableOrgan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleClearFilters = () => {
    setActiveFilters({
      organType: "All",
      city: "All",
      hospital: "All",
      bloodGroup: "All",
      urgency: "All",
    });
  };
  const [activeFilters, setActiveFilters] = useState<FilterValues>({
    organType:"All",
    city: "All",
    hospital: "All",
    bloodGroup: "All", // not used here but FilterBar expects it
    urgency: "All", // not used here but FilterBar expects it
  });
  const [sortBy, setSortBy] = useState("latest"); // ✅ added sort state
  const organSortOptions = [
    { key: "latest", label: "Latest" },
    { key: "oldest", label: "Oldest" },
  ];
  
  const hospitals = Array.from(new Set(items.map(i => i.name))); // unique hospital names

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getItems("available-organs", token);
        const transformedData = data.map((item: any) => ({ ...item, id: item._id }));
        setItems(transformedData);
        setFilteredItems(transformedData);
      } catch (error) {
        console.error("Failed to fetch available organs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Update filteredItems whenever activeFilters or items change
  useEffect(() => {
    let filtered = items;
  
    if (activeFilters.city !== "All") filtered = filtered.filter(i => i.city === activeFilters.city);
    if (activeFilters.hospital !== "All") filtered = filtered.filter(i => i.name === activeFilters.hospital);
    if (activeFilters.organType !== "All") filtered = filtered.filter(i => i.organType === activeFilters.organType);
  
    // ✅ Apply sorting
    if (sortBy === "latest") filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "oldest") filtered = [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
    setFilteredItems(filtered);
  }, [activeFilters, items, sortBy]);

  const handleFilterChange = (filters: FilterValues) => {
    setActiveFilters(filters);
  }

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const result = await deleteItem(id, "available-organs", token);
    if (result.success) {
      setItems(prev => prev.filter(item => item.id !== id));
      setFilteredItems(prev => prev.filter(item => item.id !== id));
      toast({variant:"success", title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  const handleSuccess = (newItem: AvailableOrgan) => {
    setItems(prev => [newItem, ...prev]);
    setFilteredItems(prev => [newItem, ...prev]);
    setIsModalOpen(false);
  }

  if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 text-xl font-bold font-headline">Manage Available Organs</h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Organ</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Available Organ</DialogTitle>
            </DialogHeader>
            <AvailableOrganForm onSuccess={handleSuccess} cities={cities} />
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar
  filters={["city","hospital","organType"]}
  activeFilters={activeFilters}
  onFilterChange={setActiveFilters}
  onClearFilters={handleClearFilters}
  onSortChange={setSortBy}   
  sortOption={organSortOptions}  // ✅ pass sort action
  sortBy={sortBy}              // ✅ pass current sort
  cities={cities}
  hospitals={hospitals}
  resultsCount={filteredItems.length}
/>

      {/* Organ Cards */}
      {filteredItems.length === 0 ? (
        <EmptyState 
          icon={<Heart className="h-12 w-12" />}
          title="No Available Organs"
          message="You haven't listed any available organs. Click 'Add Organ' to post one."
          action={{ label: "Add First Organ", onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const isOwner = user?._id === item?.hospital;

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
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
                        Organ Type : <span className="font-bold text-red-400">{item.organType}</span>
                      </span>
                    </div>
                  </div>
                }
                description={`Added ${formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}`}
                details={[
                  { icon: <MapPin size={16} />, label: item.city },
                  { icon: <Phone size={16} />, label: item.contact },
                ]}
              />
            )
          })}
        </div>
      )}
    </div>
  );
}
