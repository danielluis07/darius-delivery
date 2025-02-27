"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateRangePicker({
  className,
  value,
  onChange,
}: {
  className?: string;
  value: DateRange | undefined;
  onChange: (date: DateRange | undefined) => void;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="w-[300px] justify-start text-left font-normal">
            <CalendarIcon />
            {value?.from ? (
              value.to ? (
                `${format(value.from, "d 'de' MMM, y", {
                  locale: ptBR,
                })} - ${format(value.to, "d 'de' MMM, y", { locale: ptBR })}`
              ) : (
                format(value.from, "d 'de' MMM, y", { locale: ptBR })
              )
            ) : (
              <span>Selecione uma Data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            locale={ptBR}
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
