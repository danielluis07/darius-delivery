"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const TrialCountdown = ({
  trialEndsAt,
}: {
  trialEndsAt: string | null | undefined;
}) => {
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    if (trialEndsAt) {
      const trialEndDate = parseISO(trialEndsAt);
      const timeLeft = formatDistanceToNowStrict(trialEndDate, {
        unit: "day",
        roundingMethod: "floor",
        locale: ptBR,
      });

      setRemainingTime(timeLeft);
    }
  }, [trialEndsAt]);

  return (
    <Alert className="bg-error text-white [&>svg]:text-white">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atenção!</AlertTitle>
      {remainingTime ? (
        <AlertDescription>
          Seu período grátis termina em {remainingTime}
        </AlertDescription>
      ) : (
        <Skeleton className="w-80 h-5" />
      )}
    </Alert>
  );
};
