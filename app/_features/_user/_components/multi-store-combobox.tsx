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
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export function StoresComboBox({
  stores,
}: {
  stores: {
    id: string;
    userId: string;
    name: string;
  }[];
}) {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const router = useRouter();

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    const currentStoreId = params.storeId as string | undefined;
    if (currentStoreId && stores.find((store) => store.id === currentStoreId)) {
      setSelectedStoreId(currentStoreId);
    } else if (stores.length > 0 && !currentStoreId) {
      setSelectedStoreId(null);
    } else {
      setSelectedStoreId(null);
    }
  }, [params.storeId, stores]);

  const selectedStore = stores.find((store) => store.id === selectedStoreId);

  const handleSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
    setOpen(false);

    router.push(`/dashboard/${storeId}/`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar loja"
          className="w-[200px] justify-between bg-transparent">
          {selectedStore ? selectedStore.name : "Selecione uma loja..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Procurar Loja..." />
          <CommandList>
            <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
            <CommandGroup>
              {stores.map((store) => (
                <CommandItem
                  key={store.id}
                  value={store.id}
                  onSelect={(currentId) => {
                    handleSelect(currentId);
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStoreId === store.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {store.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
