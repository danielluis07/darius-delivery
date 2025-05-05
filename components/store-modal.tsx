"use client";

import { z } from "zod";
import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FieldErrors } from "react-hook-form";
import { insertStoreSchema } from "@/db/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { useStoreModal } from "@/hooks/use-store-modal";
import { createStore } from "@/app/_features/_user/_actions/create-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof insertStoreSchema>;

export const StoreModal = () => {
  const [isPending, startTransition] = useTransition();
  const { isOpen, onOpen, onClose } = useStoreModal();

  const form = useForm<FormData>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
    },
  });

  const router = useRouter();

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      createStore(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push(`/dashboard/${res.storeId}`);
          }
        })
        .catch((error) => {
          console.error("Error while creating store:", error);
          toast.error("Erro ao criar a loja. Tente novamente mais tarde.");
        });
    });
  };

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px] [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">
            Bem-Vindo ao Darius Delivery!
          </DialogTitle>
          <DialogDescription className="text-center">
            Antes de utilizar o sistema, por favor, crie sua primeira loja.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              label="Salvar"
              loadingLabel="Salvando"
              className="w-full mt-5"
              isPending={isPending}
              disabled={isPending}
              type="submit"
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
