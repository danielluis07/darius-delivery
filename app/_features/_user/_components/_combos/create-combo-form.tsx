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
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { createCombo } from "@/app/_features/_user/_actions/create-combo";
import { ProductsDialog } from "./products-dialog";

type CategoriesWithProducts = InferResponseType<
  (typeof client.api.categories)["with-products"]["user"][":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertComboSchema>;

export const CreateComboForm = ({
  categories,
}: {
  categories: CategoriesWithProducts;
}) => {
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
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

  // Function to be passed down to handle updates from any ProductsDialog
  const handleProductSelectionChange = (
    productId: string,
    isSelected: boolean
  ) => {
    const currentIds = form.getValues("product_ids");
    let newIds: string[];

    if (isSelected) {
      // Add the ID if it's not already present (using Set for uniqueness)
      newIds = [...new Set([...currentIds, productId])];
    } else {
      // Remove the ID
      newIds = currentIds.filter((id) => id !== productId);
    }

    // Update the react-hook-form state
    // 'shouldValidate: true' optionally triggers validation on change
    // 'shouldDirty: true' marks the form as changed
    form.setValue("product_ids", newIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Watch the 'product_ids' field to get the current value reactively
  // This ensures ProductsDialog gets the updated list for its 'checked' state
  const selectedProductIds = form.watch("product_ids");

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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome do combo" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-1/2">
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

          {/* Categories and Product Selection Section */}
          <div className="mb-4">
            <FormLabel>Produtos do Combo</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">
              Clique em "Selecionar Produtos" em cada categoria desejada e
              marque os itens.
            </p>
            {/* Display validation errors for the product_ids array */}
            <FormMessage />

            <div className="space-y-3 mt-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-3 border rounded-md bg-card">
                  {" "}
                  {/* Added background */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-card-foreground">
                      {category.name}
                    </span>
                    {/* Pass required data and the handler down to the dialog */}
                    <ProductsDialog
                      categoryName={category.name}
                      products={category.products}
                      selectedProductIds={selectedProductIds} // Pass the watched value
                      onProductSelectionChange={handleProductSelectionChange} // Pass the handler function
                    />
                  </div>
                </div>
              ))}
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
    </div>
  );
};
