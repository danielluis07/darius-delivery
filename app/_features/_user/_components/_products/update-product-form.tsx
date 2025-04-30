"use client";

import { z } from "zod";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, FieldErrors } from "react-hook-form";
import { updateProductSchema } from "@/db/schemas";
import { CloudUpload, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { TagsInput } from "@/components/ui/tags-input";
import { updateProduct } from "../../_actions/update-product";
import { Switch } from "@/components/ui/switch";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";

type Categories = InferResponseType<
  (typeof client.api.categories.user)[":userId"]["$get"],
  200
>["data"];

type Additionals = InferResponseType<
  (typeof client.api.additionals.user)[":userId"]["$get"],
  200
>["data"];

export type UpdateProduct = {
  id: string;
  name: string;
  allowHalfOption: boolean;
  userId: string | null;
  image: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  category_id: string | null | undefined;
  description: string | null;
  type: string;
  price: number;
  sizes: string[] | null;
  additionalGroupIds?: string[] | null;
};

type FormData = z.infer<typeof updateProductSchema>;

export const UpdateProductForm = ({
  categories,
  product,
  additionals,
}: {
  categories: Categories;
  product: UpdateProduct;
  additionals: Additionals;
}) => {
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.image
  );
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      image: product.image,
      category_id: product.category_id,
      description: product.description,
      allowHalfOption: product.allowHalfOption,
      sizes: product.sizes ?? [],
      price: product.price,
    },
  });

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
    multiple: false,
  };

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      updateProduct(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard/products");
          }
        })
        .catch((error) => {
          console.error("Error updating product:", error);
          toast.error("Erro ao atualizar o produto");
        });
    });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} value={field.value} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categorias</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
                required>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sizes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tamanhos</FormLabel>
              <TagsInput
                className="w-full"
                value={field.value ?? []}
                onValueChange={field.onChange}
                placeholder="Selecione os tamanhos disponíveis (opcional)"
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allowHalfOption"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-[400px] h-[130px] mt-8">
              <div className="space-y-0.5">
                <FormLabel>Permitir partes</FormLabel>
                <FormDescription>
                  Permitir se o produto pode ser dividido em partes (inteira ou
                  meio a meio).
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conte um pouco sobre esse produto"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem do Produto</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value ?? []}
                  onValueChange={(newFiles: File[] | null) => {
                    if (newFiles && newFiles.length > 0) {
                      const selectedFile = newFiles[0];
                      field.onChange([selectedFile]);
                      const newPreviewUrl = URL.createObjectURL(selectedFile);
                      setFiles([selectedFile]);
                      setImagePreview(newPreviewUrl);
                    } else {
                      field.onChange(null);
                      setFiles([]);
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
                        </span>
                        &nbsp; ou arraste e solte um arquivo aqui.
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
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Preview:</p>
                        <div className="relative w-full h-80 rounded-lg overflow-hidden">
                          <Image
                            src={imagePreview}
                            fill
                            className="object-contain"
                            alt="preview"
                          />
                          <div
                            onClick={() => {
                              setImagePreview(null);
                              setFiles([]);
                              form.setValue("image", null);
                            }}
                            className="absolute top-1 right-1 p-1 bg-error rounded-lg cursor-pointer text-white">
                            <Trash2 />
                          </div>
                        </div>
                      </div>
                    )}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                    field.onChange(numericValue);
                  }}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          label="Atualizar"
          loadingLabel="Atualizando"
          className="w-full"
          disabled={isPending}
          isPending={isPending}
          type="submit"
        />
      </form>
    </Form>
  );
};
