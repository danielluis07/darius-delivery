"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePixModal } from "@/hooks/use-pix-dialog";
import { QRCodeCanvas } from "qrcode.react";

export const PixModal = () => {
  const { isOpen, qrCodeData, closeModal } = usePixModal();

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Pix</DialogTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root>
            <DialogDescription>Pix qrcode</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        {qrCodeData?.payload && qrCodeData?.expirationDate && (
          <div className="w-full">
            <div className="flex justify-center">
              <QRCodeCanvas value={qrCodeData?.payload} />
            </div>
            <div className="text-center mt-4">
              <p>
                Pague com Pix até{" "}
                {new Date(qrCodeData?.expirationDate).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
