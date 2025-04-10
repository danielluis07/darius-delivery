"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title?: string;
  message?: string;
};

export const useConfirm = (
  defaultTitle = "Tem certeza?",
  defaultMessage = "Essa ação não poderá ser desfeita."
): [
  () => React.ReactElement,
  (options?: ConfirmOptions) => Promise<boolean>
] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const [title, setTitle] = useState(defaultTitle);
  const [message, setMessage] = useState(defaultMessage);

  const confirm = (options?: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      if (options?.title) setTitle(options.title);
      if (options?.message) setMessage(options.message);
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleConfirm} variant="destructive">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
