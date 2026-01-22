"use client";
interface DashboardShellProps {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}


export function DashboardShell({ title, description, headerAction, children }: DashboardShellProps) {
  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-red-400 font-bold tracking-tight font-headline">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {headerAction}
      </div>
      {children}
    </div>
  );
}
