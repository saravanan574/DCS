"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
import React from "react";
  
  interface Detail {
    icon: React.ReactNode;
    label: string | React.ReactNode;
  }
  
  interface DashboardCardProps {
    title: React.ReactNode; // Hospital name
    group?: string; // Blood/Organ type
    description?: React.ReactNode; // Posted time etc.
    details: Detail[];
    actions?: React.ReactNode; // Delete button etc.
    children?: React.ReactNode;
    
  }
  
  export function DashboardCard({
    title,
    group,
    description,
    details,
    actions,
    children,
  }: DashboardCardProps) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 rounded-lg border border-gray-200 flex flex-col h-full bg-white">
        
        {/* Header: Hospital Name + Group Inline */}
        <CardHeader className="flex flex-col gap-1 px-5 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <CardTitle className="font-headline text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              {group && (
                <span className="text-sm font-bold text-red-600 px-3 py-1 rounded-full border border-red-600 uppercase">
                  {group}
                </span>
              )}
            </div>
          </div>
          {description && (
            <p className="text-gray-500 text-sm border-b-2 pb-2">{description}</p>
          )}
        </CardHeader>
  
        {/* Content */}
        <CardContent className="flex-grow space-y-3 px-5 py-2">
          {details.map((detail, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors cursor-default"
            >
              <span className="text-red-600">{detail.icon}</span>
              <span>{detail.label}</span>
            </div>
          ))}
  
          {children && <div className="pt-2">{children}</div>}
        </CardContent>
  
        {/* Actions/Footer */}
        {actions && (
          <CardFooter className="px-5 py-3 border-t border-gray-200 bg-red-50 flex justify-end gap-2">
            {actions}
          </CardFooter>
        )}
      </Card>
    );
  }
  