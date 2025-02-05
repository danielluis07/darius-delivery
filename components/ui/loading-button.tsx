"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const LoadingButton = ({
  label,
  loadingLabel,
  isPending,
  type,
  disabled,
  className,
}: {
  label: string;
  loadingLabel: string;
  isPending?: boolean;
  type?: "submit" | "button" | "reset";
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <Button type={type} className={className} disabled={disabled}>
      {isPending ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" />
          {loadingLabel}
        </div>
      ) : (
        <span>{label}</span>
      )}
    </Button>
  );
};
