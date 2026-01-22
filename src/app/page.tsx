"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle, Droplets, HeartPulse, Hospital, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero'); 
  const featureImage1 = PlaceHolderImages.find(p => p.id === 'quick-requests'); 
  const featureImage2 = PlaceHolderImages.find(p => p.id === 'track-organs'); 
  const featureImage3 = PlaceHolderImages.find(p => p.id === 'local-events');
  const [log, setLog] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) setLog(false);
    }
  }, []);

  const features = [
    {
      icon: <Droplets className="h-8 w-8 text-primary" />,
      title: "Quick Blood Requests",
      description: "Hospitals can post urgent blood needs in seconds, reaching thousands of local donors instantly.",
      image: featureImage1
    },
    {
      icon: <HeartPulse className="h-8 w-8 text-primary" />,
      title: "Track Organ Availability",
      description: "Get real-time updates on available organs for transplants, streamlining a critical process.",
      image: featureImage2
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Join Local Donation Events",
      description: "Discover and participate in blood drives and donation camps happening near you.",
      image: featureImage3
    }
  ];

  const login = [
    {
      icon: <Hospital className="h-12 w-12 text-primary" />,
      name: "Hospital",
      dashboard: "Login as Hospital",
      link: "/login?role=hospital",
      dashboard2: "Register as Hospital",
      link2: "/register?role=hospital",
      detail: "Please make a connection",
      image: PlaceHolderImages.find(p => p.id === "hospital") // Example image
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      name: "Donor",
      dashboard: "Login as Donor",
      link: "/login?role=donor",
      dashboard2: "Register as Donor",
      link2: "/register?role=donor",
      detail: "Please make a connection",
      image: PlaceHolderImages.find(p => p.id === "donor") // Example image
    }
  ];
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative text-primary-foreground">
        <div className="w-full h-[500px] relative">
          <Image
            // src={heroImage?.imageUrl || "/bg.jpg"}
            src={"/hero.jpg"}
            alt="Hero Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-center text-white p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-headline">
              Donor Connect — Join the Movement to Save Lives.
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl">
              Bridging the gap between donors and those in need.
            </p>
          </div>
        </div>

        {log && (
          <div className="flex justify-center mt-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl">
            {login.map((log, index) => (
              <Card
                key={index}
                className="bg-card shadow-lg hover:shadow-2xl transition-transform duration-300 rounded-3xl overflow-hidden mx-auto flex flex-col items-center w-full md:w-[420px] hover:-translate-y-1"
              >
                {/* Wider Image */}
                {log.image && (
                  <div className="relative w-full h-64">
                    <Image
                      src={log.image.imageUrl}
                      alt={log.image.description}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25"></div>
                  </div>
                )}
        
                {/* Icon */}
                <div className="mt-3">
                  <div className="p-4 bg-primary/20 rounded-full shadow-md inline-block">
                    {log.icon}
                  </div>
                </div>
        
                {/* Title */}
                <h3 className="mt-3 text-lg md:text-xl font-semibold text-center">{log.name}</h3>
        
                {/* Description + Buttons */}
                <div className="px-6 pb-6 pt-3 text-center flex flex-col gap-3 w-full">
                  <p className="text-sm md:text-base text-muted-foreground">{log.detail}</p>
        
                  <div className="flex flex-col sm:flex-row justify-center gap-3 mt-2">
                    <Button
                      asChild
                      className="flex-1 rounded-lg bg-sky-500 text-sm text-red-100 hover:bg-sky-600 transition"
                    >
                      <Link href={log.link2}>{log.dashboard2}</Link>
                    </Button>
                    <Button
                      asChild
                      className="flex-1 rounded-lg bg-red-100 text-sm text-primary hover:bg-red-200 transition"
                    >
                      <Link href={log.link}>{log.dashboard}</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-muted/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight font-headline text-foreground">Powerful Features for a Noble Cause</h2>
            <p className="mt-4 text-lg text-red-500">Everything you need to make a difference, all in one place.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden group">
                <div className="overflow-hidden">
                  <Image
                    src={feature?.image?.imageUrl || ""}
                    alt={feature?.image?.description || ""}
                    width={600}
                    height={400}
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-primary/10 rounded-full">{feature.icon}</div>
                  <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground px-6 pb-6">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
