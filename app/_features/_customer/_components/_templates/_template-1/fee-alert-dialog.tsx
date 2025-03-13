"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeliveryFeeAlert } from "@/hooks/use-delivery-areas-fee-alert";
import {
  useCreateCashOnDeliveryOrder,
  useCreateCashWebsiteOrder,
} from "@/app/_features/_customer/_queries/use-create-order";
import { Button } from "@/components/ui/button";

export const FeeAlertDialog = () => {
  const { isOpen, onClose, message, orderData, params } = useDeliveryFeeAlert();

  const { mutate: mutateCashOnWebsite, isPending: isPendingCashOnWebsite } =
    useCreateCashWebsiteOrder(params);
  const { mutate: mutateCashOnDelivery, isPending: isPendingCashOnDelivery } =
    useCreateCashOnDeliveryOrder(params);

  const handlePayment = () => {
    if (!orderData) return;

    if (
      orderData?.paymentMethod === "CASH" ||
      orderData?.paymentMethod === "CARD"
    ) {
      mutateCashOnDelivery(orderData);
    } else {
      mutateCashOnWebsite(orderData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        <p>{message}</p>
        <Button
          className="w-full"
          variant="secondary"
          onClick={handlePayment}
          disabled={isPendingCashOnWebsite || isPendingCashOnDelivery}>
          Confirmar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
