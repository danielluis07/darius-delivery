"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NonModalSheetProps extends VariantProps<typeof sheetVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  state: "full" | "minimized" | "closed";
}

const sheetVariants = cva(
  "absolute z-50 gap-4 bg-background shadow-lg transition ease-in-out duration-300 [&>button]:hidden",
  {
    variants: {
      side: {
        top: "left-0 top-0 right-0 border-b",
        bottom: "left-0 bottom-0 right-0",
        left: "top-0 left-0 bottom-0 w-full border-r",
        right: "top-0 right-0 bottom-0 w-full border-l",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

const NonModalSheet: React.FC<NonModalSheetProps> = ({
  isOpen,
  onClose,
  children,
  className,
  side = "right",
  state,
  ...props
}) => {
  const animationClasses = cn({
    "translate-x-0": isOpen && side === "right",
    "translate-x-full": !isOpen && side === "right",
    "-translate-x-0": isOpen && side === "left",
    "-translate-x-full": !isOpen && side === "left",
    "translate-y-0": isOpen && (side === "top" || side === "bottom"),
    "-translate-y-full": !isOpen && side === "top",
    "translate-y-full": !isOpen && side === "bottom",
  });

  return (
    <>
      {isOpen && (
        <div
          className={cn(
            sheetVariants({ side }),
            animationClasses,
            "pointer-events-auto",
            className
          )}
          {...props}>
          <button
            onClick={onClose}
            className={cn(
              state === "minimized" && "hidden",
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            )}>
            <X className="size-4 text-error" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      )}
    </>
  );
};

const NonModalSheetTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
);

const NonModalSheetDescription: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className, ...props }) => (
  <div className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export { NonModalSheet, NonModalSheetTitle, NonModalSheetDescription };
