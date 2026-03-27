import React, { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuantumCardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  icon?: ReactNode;
  glow?: boolean;
}

export function QuantumCard({ children, title, className, icon, glow = false }: QuantumCardProps) {
  return (
    <div className={cn(
      "bg-[#141424]/90 backdrop-blur-md rounded-xl border border-[#6A0DAD]/20 p-4 flex flex-col transition-all duration-300 overflow-hidden",
      glow && "shadow-[0px_8px_32px_rgba(106,13,173,0.15)] border-[#6A0DAD]/40",
      "hover:border-[#6A0DAD]/60",
      className
    )}>
      {title && (
        <div className="flex items-center gap-2 mb-4 shrink-0">
          {icon && <span className="text-[#8A2BE2]">{icon}</span>}
          <h3 className="text-xs font-semibold tracking-wide uppercase text-[#E6E6E6] flex items-center gap-2">
            {title}
            {glow && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4444] animate-pulse" />}
          </h3>
        </div>
      )}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
