"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <Alert className="flex justify-between bg-error text-white [&>svg]:text-white">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="mt-1">Atenção!</AlertTitle>
        {remainingTime ? (
          <AlertDescription>Seu período grátis termina em asd</AlertDescription>
        ) : (
          <Skeleton className="w-80 h-5" />
        )}
      </div>
      <Link href="/">
        <Button variant="secondary">Assinar Agora</Button>
      </Link>
    </Alert>
  );
};
