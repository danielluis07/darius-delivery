"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCheckDeliveryAreaDialog } from "@/hooks/use-check-delivery-area";

export const CheckDeliveryAreaDialog = () => {
  const { isOpen, onClose } = useCheckDeliveryAreaDialog();
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
        <p>
          Você não pode efetuar a compra pois está fora da área de entrega do
          vendedor
        </p>
      </DialogContent>
    </Dialog>
  );
};
