"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type FilterValues = {
  organType: string;
  city: string;
  hospital: string;
  bloodGroup: string;
  urgency: string;
};

type FilterBarProps = {
  filters: ('city' | 'hospital' | 'bloodGroup' | 'organType' | 'urgency')[];
  onFilterChange: (filters: FilterValues) => void;
  onClearFilters: () => void;
  onSortChange: (value: string) => void;
  sortOption?: { key: string; label: string }[];
  cities: string[];
  hospitals: string[];
  organTypes?: string[];
  sortBy: string;
  activeFilters: FilterValues;
  resultsCount?: number;
};

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencies = ["All", "Low", "Medium", "High"];
const defaultOrganTypes = ["All", "Kidney", "Liver", "Heart", "Lungs", "Cornea"];

const sortOptions = [
  { key: "latest", label: "Latest" },
  { key: "oldest", label: "Oldest" },
  { key: "highUrgency", label: "High Urgency" },
  { key: "lowUrgency", label: "Low Urgency" },
  { key: "deadlineSoon", label: "Nearest Deadline" },
  { key: "deadlineFar", label: "Furthest Deadline" },
];

export function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  onSortChange,
  cities,
  hospitals,
  organTypes = defaultOrganTypes,
  activeFilters,
  sortBy,
  resultsCount = 0,
}: FilterBarProps) {
  const appliedCount = Object.values(activeFilters).filter(
    v => v && v !== "All"
  ).length;

  const handleChange = (type: keyof FilterValues, value: string) => {
    onFilterChange({ ...activeFilters, [type]: value });
  };

  return (
    <div className="flex justify-between bg-green-400 py-3 px-4 mb-5 border-b shadow-sm rounded-md">

      {/* Filters */}
      <div className="flex items-center gap-4 flex-nowrap overflow-x-auto">

        {filters.includes("city") && (
          <div className="flex flex-col text-gray-900">
            <span className="text-xs mb-1">City</span>
            <Select value={activeFilters.city} onValueChange={val => handleChange("city", val)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                {["All", ...cities].map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filters.includes("hospital") && (
          <div className="flex flex-col text-gray-900">
            <span className="text-xs mb-1">Hospital</span>
            <Select value={activeFilters.hospital} onValueChange={val => handleChange("hospital", val)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Hospital" /></SelectTrigger>
              <SelectContent>
                {["All", ...hospitals].map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filters.includes("organType") && (
          <div className="flex flex-col text-gray-900">
            <span className="text-xs mb-1">Organ Type</span>
            <Select value={activeFilters.organType} onValueChange={val => handleChange("organType", val)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Organ Type" /></SelectTrigger>
              <SelectContent>
                {organTypes.map(o => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filters.includes("bloodGroup") && (
          <div className="flex flex-col text-gray-900">
            <span className="text-xs mb-1">Blood Group</span>
            <Select value={activeFilters.bloodGroup} onValueChange={val => handleChange("bloodGroup", val)}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Blood Group" /></SelectTrigger>
              <SelectContent>
                {bloodGroups.map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filters.includes("urgency") && (
          <div className="flex flex-col text-gray-900">
            <span className="text-xs mb-1">Urgency</span>
            <Select value={activeFilters.urgency} onValueChange={val => handleChange("urgency", val)}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                {urgencies.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {appliedCount > 0 && (
          <div className="flex flex-col text-gray-900">
            <span className="text-xs mb-1">Reset</span>
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="text-red-600 border-red-500 hover:bg-red-500 hover:text-white"
            >
              Clear
            </Button>
          </div>
        )}

        {/* ✅ Added unique keys here */}
        {appliedCount > 0 ? (
          <span key="result-count" className={`items-center ${resultsCount === 0 ? "text-red-600" : "text-gray-900"}`}>
            {resultsCount} result{resultsCount > 1 ? "s" : ""} found
          </span>
        ) : (
          <span key="no-results" className="italic text-black-300">No filters applied</span>
        )}
      </div>

      {/* Sort */}
      <div className="flex flex-col text-gray-900">
        <span className="text-xs mb-1">Sort By</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            {sortOptions.map(s => (
              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
