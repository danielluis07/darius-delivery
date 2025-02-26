"use client";

import { z } from "zod";
import { useEffect, useTransition } from "react";
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
import { insertComboSchema } from "@/db/schemas";
import { CloudUpload } from "lucide-react";
import { useState } from "react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import placeholder from "@/public/placeholder-image.jpg";
import { Card } from "@/components/ui/card";
import { createCombo } from "@/app/_features/_user/_actions/create-combo";

type Products = InferResponseType<
  (typeof client.api.products)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertComboSchema>;

export const CreateComboForm = ({ products }: { products: Products }) => {
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedProductNames, setSelectedProductNames] = useState<string[]>(
    []
  );
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(insertComboSchema),
    defaultValues: {
      name: "",
      description: "",
      image: [],
      price: 0,
      product_ids: [],
    },
  });

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
    multiple: false,
  };

  const formProductIds = form.watch("product_ids");

  useEffect(() => {
    const selectedNames = products
      .filter((product) => form.watch("product_ids")?.includes(product.id))
      .map((product) => product.name);

    setSelectedProductNames(selectedNames);
  }, [formProductIds, products, form]);

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };
  const onSubmit = (values: FormData) => {
    startTransition(() => {
      createCombo(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard/combos");
          }
        })
        .catch((error) => {
          console.error("Error creating combo:", error);
          toast.error("Erro ao criar combo");
        });
    });
  };
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <div className="max-w-md">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do combo" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Fale sobre os produtos desse combo"
                        className="resize-none"
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value ?? []}
                        onValueChange={(newFiles: File[] | null) => {
                          if (newFiles && newFiles.length > 0) {
                            const selectedFile = newFiles[0]; // Keep only one file
                            field.onChange([selectedFile]); // Update form state
                            const newPreviewUrl =
                              URL.createObjectURL(selectedFile);
                            setFiles([selectedFile]); // Update local state for UI
                            setImagePreview(newPreviewUrl);
                          } else {
                            field.onChange(null);
                            setFiles([]);
                            setImagePreview(null);
                          }
                        }}
                        dropzoneOptions={dropZoneConfig}
                        className="relative bg-background rounded-lg p-5">
                        <FileInput
                          id="fileInput"
                          className="outline-dashed outline-1 outline-slate-500">
                          <div className="flex items-center justify-center flex-col p-8 w-full ">
                            <CloudUpload className="text-gray-500 w-10 h-10" />
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Clique para fazer o upload
                              </span>{" "}
                              ou arraste e solte um arquivo aqui.
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              SVG, PNG, JPG or GIF
                            </p>
                          </div>
                        </FileInput>
                        <FileUploaderContent>
                          {files &&
                            files.length > 0 &&
                            files.map((file, i) => (
                              <FileUploaderItem key={i} index={i}>
                                <span>{file.name}</span>
                              </FileUploaderItem>
                            ))}
                        </FileUploaderContent>
                      </FileUploader>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-between items-center gap-5 mt-4">
            <div className="w-full">
              <FormField
                control={form.control}
                name="product_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produtos</FormLabel>
                    <FormControl>
                      <MultiSelector
                        onValuesChange={field.onChange}
                        values={field.value}
                        loop={false}>
                        <MultiSelectorTrigger
                          selectedNames={selectedProductNames}
                        />
                        <MultiSelectorContent>
                          <MultiSelectorList>
                            {products.map((product, i) => (
                              <MultiSelectorItem key={i} value={product.id}>
                                {product.name}
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

            <div className="w-full">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={formatCurrency(field.value)}
                        placeholder="R$ 0,00"
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          const numericValue = rawValue
                            ? parseInt(rawValue, 10)
                            : 0;
                          field.onChange(numericValue);
                        }}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <LoadingButton
            className="mt-5 w-full"
            label="Criar"
            loadingLabel="Criando"
            type="submit"
            isPending={isPending}
            disabled={isPending}
          />
        </form>
      </Form>
      <Card className="flex gap-4 mt-4">
        <div className="relative min-w-44 h-44 rounded-lg overflow-hidden">
          <Image
            src={imagePreview || placeholder}
            alt="preview"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          />
        </div>
        <div className="flex flex-col gap-5 text-gray-500">
          <p className="text-lg">{form.watch("name")}</p>
          <p>{form.watch("description")}</p>
          {selectedProductNames.length > 0 && (
            <p>{selectedProductNames.join(" + ")}</p>
          )}
        </div>
      </Card>
    </div>
  );
};
