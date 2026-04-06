import React from "react";

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white rounded-2xl shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
