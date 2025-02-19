"use client";

import { z } from "zod";
import { useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FieldErrors } from "react-hook-form";
import { insertUserDomainSchema } from "@/db/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { insertDomain } from "@/app/_features/_user/_actions/insert-domain";
import { toast } from "sonner";
import { useDomainModal } from "@/hooks/use-domain-modal";

type FormData = z.infer<typeof insertUserDomainSchema>;

export const DomainModalProvider = ({
  userDomain,
}: {
  userDomain: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDomainModal();

  const form = useForm<FormData>({
    resolver: zodResolver(insertUserDomainSchema),
    defaultValues: {
      domain: "",
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !userDomain) {
      onOpen();
    }
  }, [isMounted, userDomain, onOpen]);

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      insertDomain(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error inserting domain:", error);
          toast.error("Erro ao salvar o domínio");
        });
    });
  };

  if (!isMounted) {
    return null;
  }

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
            Antes de utilizar o sistema, por favor, preencha o nome do seu
            domínio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Exemplo: meusite" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              label="Salvar"
              loadingLabel="Salvando"
              className="w-full mt-5"
              disabled={isPending}
              isPending={isPending}
              type="submit"
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
