"use client";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    }
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col  items-center justify-center bg-background/50 text-center py-16 px-6 rounded-2xl border-2 border-dashed bg-muted/80">
            <div className="mb-4 text-primary">{icon}</div>
            <h3 className="text-xl font-semibold font-headline text-foreground">{title}</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">{message}</p>
            {action && (
                <Button onClick={action.onClick} className="mt-6">
                    {action.label}
                </Button>
            )}
        </div>
    )
}
