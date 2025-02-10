"use client";

import { z } from "zod";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
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
import { insertCategorySchema } from "@/db/schemas";
import { CloudUpload } from "lucide-react";
import { useState } from "react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { LoadingButton } from "@/components/ui/loading-button";
import { createCategory } from "@/app/_features/_user/_actions/create-category";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof insertCategorySchema>;

export const CreateCategoryForm = () => {
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      image: [],
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
      createCategory(values)
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
          console.error("Error creating category:", error);
          toast.error("Erro ao criar categoria");
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
                      setFiles([selectedFile]); // Update local state for UI
                    } else {
                      field.onChange(null); // Clear form state if no files
                      setFiles([]); // Clear local state
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
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          label="Criar"
          loadingLabel="Criando"
          className="w-full"
          disabled={isPending}
          isPending={isPending}
          type="submit"
        />
      </form>
    </Form>
  );
};
