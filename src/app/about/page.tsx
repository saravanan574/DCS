"use client"
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Target, Users, HeartHandshake } from 'lucide-react';
import Image from 'next/image';
import { Router } from 'express';

export default function AboutPage() {
    const aboutImage = PlaceHolderImages.find(p => p.id === 'about');
    return (
        <div className="text-background">
            <div className="container py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-foreground">
                            Connecting Donors, Saving Lives
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Donor Connect was born from a simple yet powerful idea: to create a seamless, technology-driven bridge between the generosity of donors and the urgent needs of hospitals.
                        </p>
                    </div>
                    {aboutImage && (
                        <div className="rounded-2xl overflow-hidden shadow-lg">
                             <Image
                                src={aboutImage.imageUrl}
                                alt="Team working together"
                                width={800}
                                height={600}
                                className="object-cover"
                                data-ai-hint={aboutImage.imageHint}
                            />
                        </div>
                    )}
                </div>

                <div className="mt-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold tracking-tight font-headline text-foreground">Our Core Mission</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            We are dedicated to revolutionizing the donation process, making it faster, more transparent, and accessible for everyone. We believe that by connecting communities, we can overcome shortages and ensure that every patient receives the life-saving care they deserve.
                        </p>
                    </div>

                    <div className="mt-16 grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-card rounded-2xl shadow-md text-center">
                            <div className="inline-block p-4 bg-primary/10 rounded-full">
                                <Target className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold font-headline text-foreground">Our Vision</h3>
                            <p className="mt-2 text-muted-foreground">A world where no life is lost due to a shortage of blood or organs.</p>
                        </div>
                        <div className="p-8 bg-card rounded-2xl shadow-md text-center">
                             <div className="inline-block p-4 bg-primary/10 rounded-full">
                                <HeartHandshake className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold font-headline text-foreground">Our Approach</h3>
                            <p className="mt-2 text-muted-foreground">Leveraging technology to create an efficient, centralized platform for donation requests and fulfillment.</p>
                        </div>
                        <div className="p-8 bg-card rounded-2xl shadow-md text-center">
                             <div className="inline-block p-4 bg-primary/10 rounded-full">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold font-headline text-foreground">Our Community</h3>
                            <p className="mt-2 text-muted-foreground">Building a network of compassionate donors and dedicated healthcare professionals.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
