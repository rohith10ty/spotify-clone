import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  isActive?: boolean;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text, children, className, isActive = false, ...props }, ref) => {
  const content = text || children || "Button";

  if (isActive) {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-full border border-red-500 bg-red-500 px-4 py-1.5 text-center text-[13px] font-bold text-white shadow-md shadow-red-500/30 ring-2 ring-red-500/40 transition-all duration-200",
          className,
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-1.5">{content}</span>
      </button>
    );
  }

  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-full border border-white/[0.08] dark:border-white/[0.08] dark:bg-white/[0.07] dark:text-white border-stone-300/80 bg-[#faf8f5] text-stone-700 px-4 py-1.5 text-center text-[13px] font-bold transition-all duration-300 shadow-sm hover:border-red-500/50 hover:bg-[#faf8f5] hover:shadow-md",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center translate-x-0 transition-all duration-300 group-hover:translate-x-6 group-hover:opacity-0">
        {content}
      </span>
      <div className="absolute inset-0 z-10 flex h-full w-full translate-x-6 items-center justify-center gap-1.5 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{content}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
      {/* Smooth Red Hover Background (Zero idle dot) */}
      <div className="absolute inset-0 z-0 bg-red-500 opacity-0 scale-95 rounded-full transition-all duration-300 group-hover:opacity-100 group-hover:scale-100"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
