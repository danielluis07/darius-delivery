"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useUpdateOrderStatus } from "@/app/_features/_user/_queries/_order-routing/use-update-order-status";
import { Separator } from "@/components/ui/separator";
import { useGetDeliverers } from "@/app/_features/_user/_queries/_deliverers/use-get-deliverers";
import { RiMotorbikeFill } from "react-icons/ri";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAssignDeliverers } from "@/app/_features/_user/_queries/_orders/use-assign-deliverers";
import { useGetRoutingOrders } from "@/app/_features/_user/_queries/_order-routing/use-get-routing-orders";
import { useConfirmContext } from "@/context/confirm-context";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
};

export const OrderRoutingClient = ({
  apiKey,
  customizationlatitude,
  customizationlongitude,
  storeId,
}: {
  apiKey: string;
  customizationlatitude: number;
  customizationlongitude: number;
  storeId: string;
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedDeliverer, setSelectedDeliverer] = useState<string | null>(
    null
  );

  const { data: ordersData, isLoading: ordersLoading } =
    useGetRoutingOrders(storeId);
  const { data: deliverersData, isLoading: deliverersLoading } =
    useGetDeliverers(storeId);
  const { mutate } = useUpdateOrderStatus(storeId);
  const { mutate: assignDeliverers } = useAssignDeliverers(storeId);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectDeliverer = (delivererId: string) => {
    if (selectedOrders.length === 0) return;
    setSelectedDeliverer((prev) => (prev === delivererId ? null : delivererId));
  };

  const { confirm } = useConfirmContext();

  const mapRef = useRef<google.maps.Map | null>(null);
  const [latitude, setLatitude] = useState<number>(
    customizationlatitude || -23.55052
  );
  const [longitude, setLongitude] = useState<number>(
    customizationlongitude || -46.633308
  );
  const [markerPosition, setMarkerPosition] = useState({
    lat: customizationlatitude || -23.55052,
    lng: customizationlongitude || -46.633308,
  });

  console.log("latitude", latitude);
  console.log("longitude", longitude);

  const orders = ordersData?.filter((order) => order.is_closed !== true) || [];
  const deliverers = deliverersData || [];

  useEffect(() => {
    if (customizationlatitude && customizationlongitude) {
      setMarkerPosition({
        lat: customizationlatitude,
        lng: customizationlongitude,
      });
      setLatitude(customizationlatitude);
      setLongitude(customizationlongitude);
    }
  }, [customizationlatitude, customizationlongitude]);

  if (loadError)
    return (
      <div className="text-red-500">
        Erro ao carregar o mapa. Verifique a API Key.
      </div>
    );
  if (!isLoaded) return <Skeleton className="h-[300px]" />;
  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markerPosition}
        zoom={15}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}
        onClick={(e) => {
          if (e.latLng) {
            setLatitude(e.latLng.lat());
            setLongitude(e.latLng.lng());
          }
        }}>
        {orders.map((order, i) => {
          return (
            <Marker
              key={i}
              position={{
                lat: order.latitude || latitude,
                lng: order.longitude || longitude,
              }}
              label={{
                text: order.daily_number.toString(),
                fontSize: "14px",
                color: "white",
              }}
            />
          );
        })}
      </GoogleMap>

      {ordersLoading || deliverersLoading ? (
        <div className="absolute top-3 left-2 bg-gray-100 p-2 shadow-lg rounded-md w-[300px] h-[350px] overflow-y-auto z-10">
          <div className="flex flex-col gap-y-2">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </div>
        </div>
      ) : (
        <div className="absolute top-3 left-2 bg-gray-100 p-2 shadow-lg rounded-md w-[300px] h-[350px] overflow-y-auto z-10">
          {orders.length === 0 ? (
            <div className="w-full">
              <h3 className="ml-1 font-semibold">Pedidos</h3>
              <Separator />
              <div className="flex items-center justify-center text-gray-500 h-[250px]">
                Nenhum pedido encontrado
              </div>
            </div>
          ) : (
            <div className="w-full">
              <h3 className="ml-1 font-semibold">Pedidos</h3>
              <Separator />
              <div className="flex flex-col gap-y-2 mt-2">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border-b border-gray-200 pb-2 mb-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "w-11 text-xs py-1 text-center text-white rounded-md",
                          order.status === "PREPARING"
                            ? "bg-orange-500"
                            : order.status === "FINISHED"
                              ? "bg-green-500"
                              : "bg-red-500"
                        )}>
                        {order.daily_number}
                      </div>
                      <div
                        className={cn(
                          order.type === "LOCAL"
                            ? "bg-purple-300"
                            : order.type === "WHATSAPP"
                              ? "bg-green-300"
                              : "bg-gray-300",
                          "text-sm text-white px-2 py-1 rounded-md text-center w-24"
                        )}>
                        {order.type}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(order.createdAt), "HH:mm")}
                      </div>

                      {order.status !== "FINISHED" ? (
                        <div
                          onClick={async () => {
                            const ok = await confirm({
                              title: "Tem certeza?",
                              message:
                                "Você está prestes a mudar o status do pedido para finalizado",
                            });

                            if (ok) {
                              mutate({
                                orderId: order.id,
                                status: "FINISHED",
                              });
                            }
                          }}
                          className="text-green-500 cursor-pointer w-6">
                          <Check />
                        </div>
                      ) : (
                        <Checkbox
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {ordersLoading || deliverersLoading ? (
        <div className="absolute top-3 right-2 bg-gray-100 p-2 shadow-lg rounded-md w-[300px] h-[350px] overflow-y-auto z-10">
          <div className="flex flex-col gap-y-2">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-8" />
          </div>
        </div>
      ) : (
        <div className="absolute top-3 right-2 bg-gray-100 p-2 shadow-lg rounded-md w-[300px] h-[350px] overflow-y-auto z-10">
          {deliverers.length === 0 ? (
            <div className="flex items-center justify-center text-gray-500 h-[250px]">
              Nenhum entregador encontrado
            </div>
          ) : (
            <div className="w-full">
              <h3 className="ml-1 font-semibold">Entregadores</h3>
              <Separator />
              <div className="flex flex-col gap-y-2 mt-2">
                {deliverers.map((deliverer) => (
                  <div
                    key={deliverer.id}
                    onClick={() => selectDeliverer(deliverer.id)}
                    className={cn(
                      selectedDeliverer === deliverer.id &&
                        selectedOrders.length > 0
                        ? "border-gray-400"
                        : "border-gray-200",
                      "border pb-2 mb-2 cursor-pointer px-2 py-3 rounded-sm"
                    )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <RiMotorbikeFill className="text-gray-500" />
                      </div>
                      <div>{deliverer.name}</div>
                      <div className="flex items-center justify-center text-xs text-white bg-error size-6 rounded-full">
                        {deliverer.order_count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedOrders.length > 0 && selectedDeliverer && (
        <Button
          onClick={async () => {
            const ok = await confirm({
              title: "Tem certeza?",
              message: "Você está prestes a atribuir os pedidos ao entregador",
            });

            if (ok) {
              assignDeliverers({
                delivererId: selectedDeliverer,
                ordersIds: selectedOrders,
              });
              selectDeliverer("");
              setSelectedOrders([]);
            }
          }}
          className="absolute bottom-2 right-2">
          Entregar Pedido
        </Button>
      )}
    </div>
  );
};
