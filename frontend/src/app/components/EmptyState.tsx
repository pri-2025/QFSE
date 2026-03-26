import React from "react";
import { Inbox, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?:    LucideIcon;
  title:    string;
  message?: string;
  action?:  { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, message, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}>
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-[#B0B0C0]" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      {message && <p className="text-sm text-[#B0B0C0] max-w-xs leading-relaxed">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-5 py-2 bg-[#6A0DAD] hover:bg-[#8A2BE2] text-white text-sm font-medium rounded-xl transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
