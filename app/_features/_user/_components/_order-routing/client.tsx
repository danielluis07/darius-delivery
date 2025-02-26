"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useUpdateOrderStatus } from "@/app/_features/_user/_queries/_order-routing/use-update-order-status";
import { Separator } from "@/components/ui/separator";
import { useGetDeliverers } from "@/app/_features/_user/_queries/_deliverers/use-get-deliverers";
import { RiMotorbikeFill } from "react-icons/ri";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAssignDeliverers } from "@/app/_features/_user/_queries/_orders/use-assign-deliverers";
import { useGetRoutingOrders } from "@/app/_features/_user/_queries/_order-routing/use-get-routing-orders";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
};

const center = {
  lat: -23.55052,
  lng: -46.633308,
};

export const OrderRoutingClient = ({
  apiKey,
  userId,
}: {
  apiKey: string;
  userId: string;
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedDeliverer, setSelectedDeliverer] = useState<string | null>(
    null
  );

  const { data: ordersData, isLoading: ordersLoading } =
    useGetRoutingOrders(userId);
  const { data: deliverersData, isLoading: deliverersLoading } =
    useGetDeliverers(userId);
  const { mutate } = useUpdateOrderStatus();
  const { mutate: assignDeliverers } = useAssignDeliverers(userId);
  const [latitude, setLatitude] = useState<number>(center.lat);
  const [longitude, setLongitude] = useState<number>(center.lng);

  console.log(latitude);
  console.log(longitude);

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

  const [ConfirmDialog, confirm] = useConfirm(
    "Tem certeza?",
    "Você está prestes a mudar o status do pedido para finalizado"
  );

  const [AssignmentDialog, assignmentConfirm] = useConfirm(
    "Tem certeza?",
    "Você está prestes a atribuir os pedidos ao entregador"
  );

  const mapRef = useRef<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState({
    lat: -23.55052,
    lng: -46.633308,
  });

  const orders = ordersData || [];
  const deliverers = deliverersData || [];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setLatitude(latitude);
          setLongitude(longitude);
        },
        () => {
          console.warn(
            "Geolocation permission denied. Using default location."
          );
          setMarkerPosition({ lat: -23.55052, lng: -46.633308 }); // Default: São Paulo
          setLatitude(-23.55052);
          setLongitude(-46.633308);
        }
      );
    }
  }, []);

  if (loadError)
    return (
      <div className="text-red-500">
        Erro ao carregar o mapa. Verifique a API Key.
      </div>
    );
  if (!isLoaded) return <Skeleton className="h-[300px]" />;
  return (
    <>
      <AssignmentDialog />
      <ConfirmDialog />
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
          {orders.map((order, index) => {
            const totalOrders = orders.length;
            const angle = (index / totalOrders) * 2 * Math.PI; // Evenly distribute in a circle
            const radius = 0.0005; // Adjust this to control the circle size

            return (
              <Marker
                key={order.id}
                position={{
                  lat: markerPosition.lat + radius * Math.sin(angle), // Circle calculation
                  lng: markerPosition.lng + radius * Math.cos(angle),
                }}
                label={{
                  text: order.number.toString(),
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
                          {order.number}
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
                              const ok = await confirm();

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
                            onCheckedChange={() =>
                              toggleOrderSelection(order.id)
                            }
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
              const ok = await assignmentConfirm();

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
    </>
  );
};
