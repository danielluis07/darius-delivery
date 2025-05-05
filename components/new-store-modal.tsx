"use client";

import { z } from "zod";
import { useTransition } from "react";
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
import { createStore } from "@/app/_features/_user/_actions/create-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useNewStoreModal } from "@/hooks/use-new-store-modal";

type FormData = z.infer<typeof insertStoreSchema>;

export const NewStoreModal = () => {
  const [isPending, startTransition] = useTransition();
  const { isOpen, onClose } = useNewStoreModal();

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
            onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Cria uma nova loja!</DialogTitle>
          <DialogDescription className="text-center">
            Digite o nome da loja que você deseja criar.
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
