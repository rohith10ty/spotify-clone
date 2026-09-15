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
          "group relative inline-flex h-[48px] min-h-[48px] shrink-0 items-center justify-center cursor-pointer overflow-hidden rounded-full border border-red-500 bg-red-500 px-5 text-center text-[14px] font-bold text-white shadow-md shadow-red-500/30 ring-2 ring-red-500/30 transition-all duration-200 active:scale-95",
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
        "group relative inline-flex h-[48px] min-h-[48px] shrink-0 items-center justify-center cursor-pointer overflow-hidden rounded-full border border-white/[0.08] dark:border-white/[0.08] dark:bg-white/[0.08] dark:text-[#d1d1d1] dark:hover:text-white dark:hover:bg-white/[0.14] border-stone-300/80 bg-[#eae4d9] text-stone-700 hover:text-stone-900 hover:bg-[#ded7c8] px-5 text-center text-[14px] font-semibold transition-all duration-200 shadow-sm hover:border-stone-400 dark:hover:border-white/20 active:scale-95",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center">
        {content}
      </span>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
