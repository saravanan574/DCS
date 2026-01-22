
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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { createItem } from "@/lib/actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DonationEvent } from "@/lib/types";
import { CityCombobox } from "./city-combobox";
import React from "react";


const formSchema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters."),
  city: z.string().min(1, "City is required."),
  startDateTime: z.date({ required_error: "Start date and time is required." }),
  endDateTime: z.date({ required_error: "End date and time is required." }),
}).refine(data => data.endDateTime > data.startDateTime, {
  message: "End date/time must be after start date/time",
  path: ["endDateTime"],
});


interface EventFormProps {
  onSuccess: (newEvent: DonationEvent) => void;
  cities: string[];
}

export function EventForm({ onSuccess, cities }: EventFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      city: "",
      startDateTime: undefined, // will be filled by user
      endDateTime: undefined,
    },
    
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;
  
    const result = await createItem("events", values, token); // values now contain startDateTime & endDateTime
  
    if (result.success) {
      toast({variant:"success", title: "Success", description: "Event created successfully." });
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
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Community Blood Drive" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>City</FormLabel>
              <CityCombobox
                cities={cities}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        {/* START DATE & TIME */}
<FormField
  control={form.control}
  name="startDateTime"
  render={({ field }) => {
    // current form values
    const startVal: Date | null = field.value ? new Date(field.value) : null;

    // compute min date for calendar = today (midnight)
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // compute current time string for min time when chosen date is today
    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // minTime for start time input: if date is today -> nowTimeStr, else "00:00"
    const startDateIsToday =
      startVal &&
      startVal.toDateString() === new Date().toDateString();

    const startMinTime = startDateIsToday ? nowTimeStr : "00:00";

    // helper to update date while preserving time
    const setStartDatePreserveTime = (date?: Date) => {
      if (!date) return;
      const newDate = new Date(date);
      const old = field.value ? new Date(field.value) : new Date();
      newDate.setHours(old.getHours(), old.getMinutes(), 0, 0);

      // If selected new start is today and time is before now, bump time to now
      if (newDate.toDateString() === new Date().toDateString()) {
        const nowD = new Date();
        if (newDate.getTime() < nowD.getTime()) {
          newDate.setHours(nowD.getHours(), nowD.getMinutes(), 0, 0);
        }
      }

      field.onChange(newDate);
      form.clearErrors("startDateTime");

      // re-validate end
      const end = form.getValues("endDateTime");
      if (end && new Date(end).getTime() >= newDate.getTime()) {
        // ok
        form.clearErrors("endDateTime");
      } else if (end) {
        form.setError("endDateTime", { type: "manual", message: "End must be after start." });
      }
    };

    // when time changed on start
    const onStartTimeChange = (timeStr: string) => {
      // timeStr "HH:MM"
      const [hh, mm] = timeStr.split(":").map(Number);
      const current = field.value ? new Date(field.value) : new Date();
      const updated = new Date(current);
      updated.setHours(hh, mm, 0, 0);

      // don't allow selecting a past time if date is today
      if (updated < new Date()) {
        form.setError("startDateTime", { type: "manual", message: "Start must be in the future." });
        return;
      } else {
        form.clearErrors("startDateTime");
      }

      field.onChange(updated);

      // re-validate end
      const end = form.getValues("endDateTime");
      if (end && new Date(end).getTime() <= updated.getTime()) {
        form.setError("endDateTime", { type: "manual", message: "End must be after start." });
      } else {
        form.clearErrors("endDateTime");
      }
    };

    const startInvalid = !!form.formState.errors.startDateTime;

    return (
      <FormItem>
        <FormLabel>Start Date & Time</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-medium",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? format(new Date(field.value), "PPPp") : "Select start date & time"}
                <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
              </Button>
            </FormControl>
          </PopoverTrigger>

          <PopoverContent align="start" className="p-4 space-y-3 w-[320px]">
            <Calendar
              mode="single"
              selected={startVal || undefined}
              onSelect={(d) => setStartDatePreserveTime(d)}
              disabled={(date) => date < todayMidnight}
              initialFocus
            />

            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none"><path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Select Time
              </label>

              <input
                type="time"
                step={60}
                min={startMinTime}
                value={
                  field.value
                    ? format(new Date(field.value), "HH:mm")
                    : startDateIsToday
                    ? nowTimeStr
                    : format(new Date(), "HH:mm")
                }
                onChange={(e) => onStartTimeChange(e.target.value)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-sm focus:outline-none",
                  startInvalid
                    ? "border-red-500 ring-red-200 ring-2"
                    : "border-gray-300 focus:ring-2 focus:ring-primary"
                )}
              />
              {startInvalid && (
                <p className="text-xs text-red-600">{String(form.formState.errors.startDateTime?.message)}</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    );
  }}
/>

{/* END DATE & TIME */}
<FormField
  control={form.control}
  name="endDateTime"
  render={({ field }) => (
    <FormItem>
      <FormLabel>End Date & Time</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full text-left border-2",
                !field.value && "text-muted-foreground",
                form.getValues("startDateTime") &&
                  field.value &&
                  new Date(field.value) <= new Date(form.getValues("startDateTime")) &&
                  "border-red-500"
              )}
            >
              {field.value ? format(field.value, "PPPp") : <span>Select end date & time</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex flex-col gap-2">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) => {
              const start = form.getValues("startDateTime");
              if (!start) return date < new Date(); // disable past days
              // allow same day or after start date
              return date < new Date(new Date(start));
            }}
            initialFocus
          />
          <input
            type="time"
            className="border rounded-md px-2 py-1 w-full"
            value={
              field.value ? format(new Date(field.value), "HH:mm") : ""
            }
            onChange={(e) => {
              const start = form.getValues("startDateTime");
              const selectedDate = field.value || start || new Date();
              const [hours, minutes] = e.target.value.split(":").map(Number);
              const updated = new Date(selectedDate);
              updated.setHours(hours, minutes, 0, 0);
              field.onChange(updated);
            }}
            min={
              (() => {
                const start = form.getValues("startDateTime");
                if (!start) return "";
                const startDate = new Date(start);
                const endDate = new Date(field.value || start);
                return (
                  startDate.toDateString() === endDate.toDateString() &&
                  format(startDate, "HH:mm")
                ) || ""
              })()
            }
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>





        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Event
        </Button>
      </form>
    </Form>
  );
}
