"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

const stores = [
  {
    value: "Loja 1",
    label: "Loja 1",
  },
  {
    value: "Loja 2",
    label: "Loja 2",
  },
  {
    value: "Loja 3",
    label: "Loja 3",
  },
  {
    value: "Loja 4",
    label: "Loja 4",
  },
  {
    value: "Loja 5",
    label: "Loja 5",
  },
  {
    value: "Loja 6",
    label: "Loja 6",
  },
];

export function StoresComboBox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-transparent">
          {value
            ? stores.find((store) => store.value === value)?.label
            : "Selecione uma loja..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Procurar Loja..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
            <CommandGroup>
              {stores.map((store) => (
                <CommandItem
                  key={store.value}
                  value={store.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}>
                  {store.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === store.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
