"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, FieldErrors } from "react-hook-form";
import { createEmployeeSchema } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { useEffect, useState, useTransition } from "react";
import { createEmployee } from "@/app/_features/_user/_actions/create-employee";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof createEmployeeSchema>;

export const NewEmployeeForm = ({
  storeId,
  permissions,
}: {
  storeId: string;
  permissions: {
    id: string;
    userId: string;
    name: string;
  }[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [selectedInputNames, setSelectedInputNames] = useState<string[]>([]);
  const form = useForm<FormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      permissions: [],
    },
  });

  const formPermissions = form.watch("permissions");

  useEffect(() => {
    const selectedNames = permissions
      .filter((permission) =>
        form.watch("permissions")?.includes(permission.id)
      )
      .map((permission) => permission.name);

    setSelectedInputNames(selectedNames);
  }, [formPermissions, permissions, form]);

  const router = useRouter();

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    startTransition(() => {
      createEmployee(
        {
          ...values,
          phone: removeFormatting(values.phone),
        },
        storeId
      )
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard/employees");
          }
        })
        .catch((error) => {
          console.error("Error while creating employee:", error);
          toast.error("Erro ao criar a funcionário");
        });
    });
  };

  console.log("permissions", form.watch("permissions"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Funcionário</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome"
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Email"
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value}
                        onChange={(event) => {
                          const formattedPhoneNumber = formatPhoneNumber(
                            event.target.value
                          );
                          field.onChange(formattedPhoneNumber);
                        }}
                        className="h-9 px-4 py-2 w-full"
                        placeholder="Telefone"
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Senha"
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Permissões</FormLabel>
                    <FormControl>
                      <MultiSelector
                        values={field.value as string[]}
                        onValuesChange={field.onChange}
                        loop>
                        <MultiSelectorTrigger
                          selectedNames={selectedInputNames}
                          placeholder="Selecionar"
                        />
                        <MultiSelectorContent>
                          <MultiSelectorList>
                            {permissions.map((permission, i) => (
                              <MultiSelectorItem key={i} value={permission.id}>
                                {permission.name}
                              </MultiSelectorItem>
                            ))}
                          </MultiSelectorList>
                        </MultiSelectorContent>
                      </MultiSelector>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <LoadingButton
              type="submit"
              label="Criar Funcionário"
              isPending={isPending}
              disabled={isPending}
              loadingLabel="Criando..."
              className="w-full mt-5"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
