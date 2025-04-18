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
import { updateCategorySchema } from "@/db/schemas";
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
import Image from "next/image";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { updateCategory } from "../../_actions/update-category";

type Category = InferResponseType<
  (typeof client.api.categories)[":id"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof updateCategorySchema>;

export const UpdateCategoryForm = ({ category }: { category: Category }) => {
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category.image
  );
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      image: category.image,
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
      updateCategory(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard/categories");
          }
        })
        .catch((error) => {
          console.error("Error updating category:", error);
          toast.error("Erro ao atualizar a categoria");
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
                <Input {...field} value={field.value} />
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
              <FormLabel>Banner</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value ?? []}
                  onValueChange={(newFiles: File[] | null) => {
                    if (newFiles && newFiles.length > 0) {
                      const selectedFile = newFiles[0]; // Keep only one file
                      field.onChange([selectedFile]); // Update form state
                      const newPreviewUrl = URL.createObjectURL(selectedFile);
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
                    {/* Image Preview */}
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
                            className="absolute top-1 right-1 p-1 bg-error rounded-lg text-white cursor-pointer">
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
