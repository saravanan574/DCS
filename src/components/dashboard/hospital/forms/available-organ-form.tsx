
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createItem } from "@/lib/actions";
import { AvailableOrgan } from "@/lib/types";
import { CityCombobox } from "./city-combobox";

const formSchema = z.object({
  organType: z.string().min(1, "Organ type is required."),
  city: z.string().min(1, "City is required."),
  contact: z.string().min(10, "A valid contact number is required."),
});

const organTypes = ["Kidney", "Liver", "Heart", "Lungs", "Pancreas", "Intestine", "Cornea", "Skin"];

interface AvailableOrganFormProps {
  onSuccess: (newItem: AvailableOrgan) => void;
  cities: string[];
}

export function AvailableOrganForm({ onSuccess, cities }: AvailableOrganFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organType: "",
      city: "",
      contact: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
      setIsLoading(false);
      return;
    }

    const result = await createItem("available-organs", values, token);

    if (result.success) {
      toast({variant:"success", title: "Success", description: "Available organ listed successfully." });
      onSuccess(result.data);
      form.reset();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

    {/* Organ Type */}
    <FormField
      control={form.control}
      name="organType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Organ Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="bg-white border border-gray-300 text-gray-900 rounded-md h-11 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select an organ" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white">
              {organTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* City */}
    <FormField
      control={form.control}
      name="city"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>City</FormLabel>
          <div className="w-full">
            <CityCombobox
              cities={cities}
              value={field.value}
              onChange={field.onChange} 
              label={""}            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />

    {/* Contact */}
    <FormField
      control={form.control}
      name="contact"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact Number</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g., 9876543210"
              {...field}
              className="bg-white border border-gray-300 rounded-md h-11 px-3 focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <Button type="submit" className="w-full h-11" disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Organ
    </Button>
  </form>
</Form>

  );
}
