
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useRouter } from "next/navigation";
import { login, register } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { HospitalData } from "@/lib/hospital-details.json";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import cities from "@/lib/cities.json";
import { Slider, SliderRange } from "@radix-ui/react-slider";
import { type } from "os";


type AuthFormMode = "login" | "register";

const baseSchema = {
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Invalid email format (e.g., user@example.com)",
  }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
};

const phoneRegex = new RegExp(/[0-9]{10}/);
const licenseIdRegex = new RegExp(/^[A-Z]{3}\/[0-9]{4}$/); // e.g., MCI/1234

const registerDonorSchema = z.object({
  ...baseSchema,
  contactNumber: z
    .string()
    .min(1, { message: "Contact number is required" })
    .regex(phoneRegex, "Invalid 10-digit Indian mobile number format."),
    
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Invalid email format",
  }),
  age: z.coerce.number({
    required_error: "Age is required",
    invalid_type_error: "Age must be a number",
  })
    .min(18, { message: "Donor must be at least 18 years old" })
    .max(65, { message: "Donor cannot be older than 65 years old" }),
  name: z.string().min(2, { message: "Name is required." }),
  city: z.string().min(1, { message: "City is required." }),
  bloodGroup: z.string().min(1, { message: "Blood group is required." }),
});

const registerHospitalSchema = z.object({
  ...baseSchema,
  licenseId: z
    .string()
    .min(1, { message: "License ID is required" })
    .regex(licenseIdRegex, "Invalid License ID format (Expected format: ABC/1234)"),
    
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Invalid email format",
  }),
  name: z.string().min(2, { message: "Hospital name is required." }),
  city: z.string().min(1, { message: "City is required." }),
  contactNumber: z.string().min(10, { message: "A valid contact number is required." }),
});

const loginSchema = z.object(baseSchema);


export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const hospitalData = HospitalData;
  const defaultRole = searchParams.get("role") === 'hospital' ? 'hospital' : 'donor';
  const [role, setRole] = useState<'donor' | 'hospital'>(defaultRole);
  const [hospitalNamePopoverOpen, setHospitalNamePopoverOpen] = useState(false);

// ...
  const currentSchema = mode === 'login' 
    ? loginSchema 
    : (role === 'donor' ? registerDonorSchema : registerHospitalSchema);

  const form = useForm<z.infer<typeof loginSchema | typeof registerDonorSchema | typeof registerHospitalSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === 'register' ? {
        name: "",
        city: "",
        contactNumber: "",
        age:"",
        bloodGroup: "",
        licenseId: "",
      } : {}),
    },
     reValidateMode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof currentSchema>) => {
    setIsLoading(true);
    if (mode === 'login') {
      const result = await login(values, role);
      if (result.success) {
        toast({
          variant:"success",
          title: "Login Successful",
          description: `Welcome! Redirecting you to your dashboard.`,
        });
        localStorage.setItem('token', result.token!);
        localStorage.setItem('user', JSON.stringify(result.user));

        localStorage.setItem('userType', role);
        /*localStorage.setItem('hospital',JSON.stringify(result.name));*/
        router.push(role === 'donor' ? '/donor-dashboard' : '/hospital-dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: result.error,
        });
        setIsLoading(false);
      }
    } else { // register mode
      const result = await register(values, role);
       if (result.success) {
        toast({
          variant:"success",
          title: "Registration Successful",
          description: "Please log in with your new account.",
        });
        router.push(`/login?role=${role}`);
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.error,
        });
        setIsLoading(false);
      }
    }
  };

  const title = mode === "login" ? "Welcome Back" : "Create an Account";
  const description = mode === "login"
    ? "Sign in to access your dashboard."
    : "Join our network to save lives.";
  
  const handleTabChange = (value: string) => {
    const newRole = value as 'donor' | 'hospital';
    setRole(newRole);
    // Reset form state when role changes
    form.reset({
      email: "",
      password: "",
       ...(mode === 'register' ? {
        name: "",
        city: "",
        contactNumber: "",
        bloodGroup: "",
        licenseId: "",
      } : {}),
    });
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('role', value);
    router.replace(`${window.location.pathname}?${newParams.toString()}`);
  }

  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={role} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger value="donor"  className="flex-1 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-red-100 data-[state=active]:shadow-none">Donor</TabsTrigger>
            <TabsTrigger value="hospital"  className="flex-1 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-red-100 data-[state=active]:shadow-none">Hospital</TabsTrigger>
          </TabsList>
          <TabsContent value={role}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">

              {mode === 'register' && (
                <FormField
                  key="name" // Key remains important
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col"> {/* Use flex-col for popover */}
                      <FormLabel>{role === 'donor' ? 'Full Name' : 'Hospital Name'}</FormLabel>
                      <FormControl>
                        {role === 'donor' ? (
                          // Donor field remains a simple Input
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                          />
                          ) : (
    // START OF REFINED HOSPITAL COMBOBOX
    <Popover open={hospitalNamePopoverOpen} onOpenChange={setHospitalNamePopoverOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          {/* Use the Button for the trigger, but also render the CommandInput inside the Popover 
            to handle the actual typing and searching. */}
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value
              ? hospitalData.find((h) => h.name === field.value)?.name
              : "Type or Select Hospital Name"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          {/* 💡 Crucial: CommandInput handles the typing/filtering */}
          <CommandInput 
            placeholder="Search hospital..." 
            value={field.value} // Link input value to field
            onValueChange={(value) => form.setValue("name", value)} // Allow typing
          />
          <CommandList>
            <CommandEmpty>No hospital found. Type to enter a new hospital.</CommandEmpty>
            <CommandGroup>
              {hospitalData.map((hospital) => (
                <CommandItem
                  value={hospital.name}
                  key={hospital.name}
                  onSelect={(currentValue) => {
                    const selectedName = hospital.name;
                    
                    // Set the name value
                    form.setValue("name", selectedName, { shouldValidate: true });
                    
                    // 🔑 KEY LOGIC: If a hospital is selected from the list, autofill the IDs.
                    if (selectedName === hospital.name) {
                      form.setValue("licenseId", hospital.licenseId, { shouldValidate: true });
                      form.setValue("email", hospital.email, { shouldValidate: true });
                    }

                    setHospitalNamePopoverOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      field.value === hospital.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {hospital.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    // END OF REFINED HOSPITAL COMBOBOX
  )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

                {mode === 'register' && role === 'hospital' && (
                  <FormField
                    control={form.control}
                    name="licenseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Your hospital's license ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mode === 'register' && (
                  <>
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{role === 'hospital' ? 'Location' : 'City'}</FormLabel>
                          <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? cities.find(
                                        (city) => city.toLowerCase() === field.value.toLowerCase()
                                      )
                                    : "Select city"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                               <Command>
                                <CommandInput placeholder="Search city..." />
                                <CommandList>
                                  <CommandEmpty>No city found.</CommandEmpty>
                                  <CommandGroup>
                                    {cities.map((city) => (
                                      <CommandItem
                                        value={city}
                                        key={city}
                                        onSelect={(currentValue) => {
                                          const finalValue = currentValue === field.value ? "" : currentValue;
                                          form.setValue("city", finalValue, { shouldValidate: true });
                                          setCityPopoverOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value?.toLowerCase() === city.toLowerCase()
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {city}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {role === 'donor' && (<>
                      <FormField
                          control={form.control}
                          name="bloodGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blood Group</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a blood group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                                    <SelectItem key={group} value={group}>{group}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type = "number" {...field}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </>)}
                     <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remember me</FormLabel>
                      </div>
                    </FormItem>
                    <Link href="#" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link href={`/register?role=${role}`} className="font-medium text-primary hover:underline">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href={`/login?role=${role}`} className="font-medium text-primary hover:underline">
                    Login
                  </Link>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
