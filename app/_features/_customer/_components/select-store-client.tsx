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
  const { selectedStoreId, setSelectedStore } = useStoreSelectionStore();
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
        const data = await getCustomizationByStoreId(storeId); // Call your Server Action

        if (data) {
          setCurrentStoreDetails(data);
        } else {
          setError("Store details not found or data is invalid.");
          setCurrentStoreDetails(null);
          // You might want to clear the persisted ID if the store is truly gone/invalid
          // clearZustandSelection();
        }
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
        setCurrentStoreDetails(null);
        // clearZustandSelection(); // Optionally clear persisted ID on critical error
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedStoreId) {
      fetchStoreData(selectedStoreId);
    } else {
      // If selectedStoreId is null, clear details and reset states
      setCurrentStoreDetails(null);
      setIsLoading(false);
      setError(null);
    }
  }, [selectedStoreId]); // Dependency: re-run when selectedStoreId from Zustand changes

  // This function now only updates the Zustand store. The useEffect handles the fetch.
  const handleStoreSelect = (storeId: string) => {
    if (selectedStoreId === storeId && currentStoreDetails) {
      // Optional: if the same store is selected and details are already loaded, do nothing
      // Or, you might want to allow a re-fetch. For now, this prevents re-fetch if already selected.
      // To always re-fetch, just call setSelectedStore(storeId);
      return;
    }
    setSelectedStore(storeId);
  };

  return (
    <div>
      {!selectedStoreId && (
        <div className="bg-white">
          <h2>Stores for {domain}</h2>
          {userSession?.user?.name && <p>Hello, {userSession.user.name}!</p>}

          <h3>Select a Store to view its details:</h3>
          {initialStores.length > 0 ? (
            <ul>
              {initialStores.map((store) => (
                <li key={store.id}>
                  <button
                    onClick={() => handleStoreSelect(store.id)}
                    disabled={isLoading && selectedStoreId === store.id}>
                    {store.name}
                    {selectedStoreId === store.id &&
                      isLoading &&
                      " (Loading...)"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No stores available for this domain.</p>
          )}
        </div>
      )}

      {selectedStoreId && ( // Only show this section if a store has been selected or is loading
        <>
          {isLoading && <p>Loading details for store: {selectedStoreId}...</p>}
          {error && <p style={{ color: "red" }}>Error: {error}</p>}

          {currentStoreDetails && !isLoading && !error && (
            <StoreProvider session={userSession} data={currentStoreDetails}>
              <DynamicTemplateRenderer />
            </StoreProvider>
          )}
          {/* Handle case where selection was made, but no data and not loading and no error (e.g. initial state before fetch completes) */}
          {!selectedStoreId && !isLoading && !error && selectedStoreId && (
            <p>Select a store to see its details.</p> // Or could be covered by loading state
          )}
        </>
      )}
      {!selectedStoreId && !isLoading && !error && (
        <p>Please select a store from the list above to see its details.</p>
      )}
    </div>
  );
};

export default StoreManagementClient;
