"use client";

import { z } from "zod";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FieldErrors } from "react-hook-form";
import { baseUserSchema } from "@/db/schemas";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/app/_features/_admin/_actions/update-profile";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof baseUserSchema>;

export const ProfileForm = ({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(baseUserSchema),
    defaultValues: {
      name: name || "",
      email: email || "",
    },
  });

  const router = useRouter();

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      updateProfile(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.refresh();
          }
        })
        .catch((error) => {
          console.error("Error while updating user profile:", error);
          toast.error("Erro ao atualizar a senha");
        });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nome e Email</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      value={field.value ?? ""}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              label="Salvar"
              loadingLabel="Salvando"
              className="w-full"
              disabled={isPending}
              isPending={isPending}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
