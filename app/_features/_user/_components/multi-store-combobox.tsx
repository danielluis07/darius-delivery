"use client";

import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

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
import { useNewStoreModal } from "@/hooks/use-new-store-modal";

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
  const { onOpen } = useNewStoreModal();

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

  const handleCreateNewStore = () => {
    onOpen();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar loja"
          // Ensure button width adapts or is set appropriately
          className="w-[250px] justify-between bg-transparent">
          {/* Display selected store name or placeholder */}
          {selectedStore ? selectedStore.name : "Selecione uma loja..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          {/* Input for searching stores */}
          <CommandInput placeholder="Procurar Loja..." />
          <CommandList>
            {/* Message shown when no stores match the search */}
            <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
            <CommandGroup>
              {/* Map through existing stores to create selectable items */}
              {stores.map((store) => (
                <CommandItem
                  key={store.id}
                  // Use store.id or a unique value for the item's value
                  value={store.name} // Use store.name for filtering, handle selection logic with store.id
                  onSelect={() => {
                    // Pass store.id to the handler
                    handleSelect(store.id);
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      // Show checkmark if this store is selected
                      selectedStoreId === store.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {/* Display store name */}
                  {store.name}
                </CommandItem>
              ))}
              {/* --- Added Button/CommandItem for Creating New Store --- */}
              <CommandItem
                key="create-new-store"
                value="create-new-store-trigger" // Unique value for filtering, if needed
                // Use the dedicated handler for the create action
                onSelect={handleCreateNewStore}
                className="text-muted-foreground cursor-pointer" // Style to indicate it's an action
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar nova loja...
              </CommandItem>
              {/* --- End of Added Button --- */}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
