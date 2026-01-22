"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface Stat {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface DashboardStatsProps {
  userName: string;
  userEmail: string;
  userRole: string;
  stats: Stat[];
}

export function DashboardStats({ userName, userEmail, userRole, stats }: DashboardStatsProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-muted/40 p-6 flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${userName}`} />
          <AvatarFallback>{getInitials(userName)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="font-headline text-2xl">{userName}</CardTitle>
            <Badge variant={userRole === 'Hospital' ? 'default' : 'secondary'}>{userRole}</Badge>
          </div>
          <CardDescription>{userEmail}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 bg-background rounded-lg shadow-inner border">
              <div className="text-primary mx-auto h-6 w-6 mb-2">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
