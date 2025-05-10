// app/components/StoreManagementClient.tsx
"use client";

import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { MainClient as Template1 } from "@/app/_features/_customer/_components/_templates/_template-1/main-client";
import { MainClient as Template2 } from "@/app/_features/_customer/_components/_templates/_template-2/main-client";
import { StoreProvider, useStore } from "@/context/store-context";
import { colors, customizations, orderSettings } from "@/db/schema";
import { getCustomizationByStoreId } from "@/app/_features/_customer/_queries/get-customization-by-store";
import { useStoreSelectionStore } from "@/stores/store-selection";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Replace } from "lucide-react";

type Store = { id: string; name: string; [key: string]: string };

export type StoreData = {
  data: {
    storeId: string;
    customization: typeof customizations.$inferSelect & {
      opening_hours: { day: string; open: string; close: string }[];
    };
    orderSettings: typeof orderSettings.$inferSelect;
    templateName: string;
    apiKey: string;
    googleApiKey: string;
    walletId: string;
    colors: typeof colors.$inferSelect;
  };
};

export type Customization = {
  storeId: string;
  customization: typeof customizations.$inferSelect & {
    opening_hours: { day: string; open: string; close: string }[];
  };
  orderSettings: typeof orderSettings.$inferSelect;
  templateName: string;
  apiKey: string;
  googleApiKey: string;
  walletId: string;
  colors: typeof colors.$inferSelect;
};

interface StoreManagementClientProps {
  initialStores: Store[];
  userSession: Session | null;
  domain: string;
}

// This component will render the correct template using the context
const DynamicTemplateRenderer = () => {
  const { data } = useStore(); // `data` here is the selectedStoreDetails

  if (!data) {
    // This should ideally not happen if StoreProvider is only used when data is available
    return <p>No store data available in context.</p>;
  }

  if (data.templateName === "TEMPLATE_1") {
    return <Template1 />; // Template1 can now also use useStore() if needed, or receive props
  } else if (data.templateName === "TEMPLATE_2") {
    return <Template2 />;
  }

  return <p>Unknown or unsupported template: {data.templateName}</p>;
};

const StoreManagementClient: React.FC<StoreManagementClientProps> = ({
  initialStores,
  userSession,
  domain,
}) => {
  const { selectedStoreId, setSelectedStore, clearSelection } =
    useStoreSelectionStore();
  const [currentStoreDetails, setCurrentStoreDetails] =
    useState<Customization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Important for UX
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch store details whenever selectedStoreId changes
  useEffect(() => {
    const fetchStoreData = async (storeId: string) => {
      setIsLoading(true);
      setError(null);
      // setCurrentStoreDetails(null); // Optionally clear previous details immediately

      try {
        const data = await getCustomizationByStoreId(domain, storeId); // Call your Server Action

        if (data) {
          setCurrentStoreDetails(data);
        } else {
          setError("Store details not found or data is invalid.");
          setCurrentStoreDetails(null);
        }
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
        setCurrentStoreDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedStoreId) {
      fetchStoreData(selectedStoreId);
    } else {
      setCurrentStoreDetails(null);
      setIsLoading(false);
      setError(null);
    }
  }, [selectedStoreId]);

  const handleStoreSelect = (storeId: string) => {
    if (selectedStoreId === storeId && currentStoreDetails) {
      return;
    }
    setSelectedStore(storeId);
  };

  console.log("Selected Store ID:", selectedStoreId);

  return (
    <div className="relative">
      {!selectedStoreId && (
        <div className="flex justify-center items-center h-screen">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-center">Bem vindo!</CardTitle>
              <CardDescription className="text-center">
                Selecione uma loja para visualizar os detalhes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <Loader2 className="animate-spin" />}
              {error && <p className="text-red-500">{error}</p>}
              <div>
                {initialStores.length > 0 && !isLoading && !error ? (
                  <Select onValueChange={handleStoreSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {initialStores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <p>Nenhuma loja disponível.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Button to change/clear store selection (replaces the "test" div) */}
      {selectedStoreId && (
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={clearSelection} // *** This function must set selectedStoreId to null/undefined ***
            className="flex items-center justify-center px-4 py-2 bg-white text-black font-medium rounded-lg shadow-md
                     hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-75
                     transition-all duration-200 ease-in-out 
                     transform hover:scale-105 active:scale-95"
            aria-label="Mudar de loja">
            <Replace className="mr-2 h-5 w-5" /> {/* Lucide icon added here */}
            Mudar Loja
          </button>
        </div>
      )}

      {selectedStoreId && ( // Only show this section if a store has been selected or is loading
        <StoreProvider session={userSession} data={currentStoreDetails}>
          <DynamicTemplateRenderer />
        </StoreProvider>
      )}
    </div>
  );
};

export default StoreManagementClient;
