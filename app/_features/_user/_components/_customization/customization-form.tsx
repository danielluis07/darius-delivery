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
import { insertCustomizationSchema } from "@/db/schemas";
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
import { ColorPicker } from "@/components/color-picker";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import Image from "next/image";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import placeholder from "@/public/placeholder-image.jpg";
import { createCustomization } from "../../_actions/create-customization";
import { Input } from "@/components/ui/input";
import { log } from "console";

type TemplatesResponseType = InferResponseType<
  typeof client.api.templates.$get,
  200
>["data"];

type CustomizationResponseType = InferResponseType<
  (typeof client.api.customizations)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertCustomizationSchema>;

export const CustomizationForm = ({
  templates,
  customization,
}: {
  templates: TemplatesResponseType;
  customization: CustomizationResponseType;
}) => {
  const [isPending, startTransition] = useTransition();
  const [bannerfiles, setBannerFiles] = useState<File[] | null>(null);
  const [desktopfiles, setDesktopFiles] = useState<File[] | null>(null);
  const [mobilefiles, setMobileFiles] = useState<File[] | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const [bannerUrl, setBannerUrl] = useState(customization?.banner || null);
  const [desktopUrl, setDesktopUrl] = useState(
    customization?.logo_desktop || null
  );
  const [mobileUrl, setMobileUrl] = useState(
    customization?.logo_mobile || null
  );

  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(insertCustomizationSchema),
    defaultValues: {
      store_name: customization?.store_name ?? "",
      button_color: customization?.button_color ?? "",
      footer_color: customization?.footer_color ?? "",
      header_color: customization?.header_color ?? "",
      banner: [],
      logo_desktop: [],
      logo_mobile: [],
      template_id: customization?.template_id ?? "",
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
      createCustomization(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard");
          }
        })
        .catch((error) => {
          console.error("Error creating customization:", error);
          toast.error("Erro ao criar a customização");
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
          name="store_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Loja</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="template_id"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Selecione um Template</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2">
                  {templates.map((template) => (
                    <FormItem
                      key={template.id}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-md cursor-pointer border",
                        field.value === template.id
                          ? "border-2 border-primary"
                          : "border-gray-300"
                      )}
                      onClick={() => field.onChange(template.id)}>
                      <FormControl>
                        <Image
                          src={template.preview_image || placeholder}
                          alt={template.name}
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                      </FormControl>
                      <div className="flex flex-col">
                        <FormLabel className="font-normal cursor-pointer">
                          {template.name}
                        </FormLabel>
                        {template.description && (
                          <p className="text-sm text-gray-500">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {bannerUrl ? (
          <div>
            <FormLabel>Banner</FormLabel>
            <div className="relative w-full h-52 rounded-md overflow-hidden">
              <Image
                src={bannerUrl || placeholder}
                alt="banner"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                className="object-cover"
              />
              <div
                onClick={() => setBannerUrl(null)}
                className="absolute top-2 right-2 bg-error text-white rounded-md p-1 cursor-pointer">
                <Trash2 />
              </div>
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="banner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner</FormLabel>
                <FormControl>
                  <FileUploader
                    value={field.value ?? []}
                    onValueChange={(newFiles: File[] | null) => {
                      if (newFiles && newFiles.length > 0) {
                        const selectedFile = newFiles[0];
                        field.onChange([selectedFile]);
                        const newPreviewUrl = URL.createObjectURL(selectedFile);
                        setBannerFiles([selectedFile]);
                        setBannerPreview(newPreviewUrl);
                      } else {
                        field.onChange(null);
                        setBannerFiles([]);
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
                      {bannerfiles &&
                        bannerfiles.length > 0 &&
                        bannerfiles.map((file, i) => (
                          <FileUploaderItem key={i} index={i}>
                            <span>{file.name}</span>
                          </FileUploaderItem>
                        ))}
                      {bannerPreview && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold mb-2">Preview:</p>
                          <div className="relative w-full h-80 rounded-lg overflow-hidden">
                            <Image
                              src={bannerPreview}
                              fill
                              className="object-cover"
                              alt="preview"
                            />
                            <div
                              onClick={() => {
                                setBannerPreview(null);
                                setBannerFiles([]);
                                form.setValue("banner", null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-error rounded-lg cursor-pointer">
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
        )}
        {desktopUrl ? (
          <div>
            <FormLabel>Logo Desktop</FormLabel>
            <div className="relative size-32 rounded-md overflow-hidden">
              <Image
                src={desktopUrl || placeholder}
                alt="logo"
                fill
                sizes="128px"
                className="object-cover"
              />
              <div
                onClick={() => setDesktopUrl(null)}
                className="absolute top-2 right-2 bg-error text-white rounded-md p-1 cursor-pointer">
                <Trash2 />
              </div>
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="logo_desktop"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Desktop</FormLabel>
                <FormControl>
                  <FileUploader
                    value={field.value ?? []}
                    onValueChange={(newFiles: File[] | null) => {
                      if (newFiles && newFiles.length > 0) {
                        const selectedFile = newFiles[0];
                        field.onChange([selectedFile]);
                        const newPreviewUrl = URL.createObjectURL(selectedFile);
                        setDesktopFiles([selectedFile]);
                        setDesktopPreview(newPreviewUrl);
                      } else {
                        field.onChange(null);
                        setDesktopFiles([]);
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
                      {desktopfiles &&
                        desktopfiles.length > 0 &&
                        desktopfiles.map((file, i) => (
                          <FileUploaderItem key={i} index={i}>
                            <span>{file.name}</span>
                          </FileUploaderItem>
                        ))}
                      {desktopPreview && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold mb-2">Preview:</p>
                          <div className="relative w-full h-80 rounded-lg overflow-hidden">
                            <Image
                              src={desktopPreview}
                              fill
                              className="object-cover"
                              alt="preview"
                            />
                            <div
                              onClick={() => {
                                setDesktopPreview(null);
                                setDesktopFiles([]);
                                form.setValue("logo_desktop", null);
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
        )}
        <FormField
          control={form.control}
          name="logo_mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Mobile</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value ?? []}
                  onValueChange={(newFiles: File[] | null) => {
                    if (newFiles && newFiles.length > 0) {
                      const selectedFile = newFiles[0];
                      field.onChange([selectedFile]);
                      const newPreviewUrl = URL.createObjectURL(selectedFile);
                      setMobileFiles([selectedFile]);
                      setMobilePreview(newPreviewUrl);
                    } else {
                      field.onChange(null);
                      setMobileFiles([]);
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
                    {mobilefiles &&
                      mobilefiles.length > 0 &&
                      mobilefiles.map((file, i) => (
                        <FileUploaderItem key={i} index={i}>
                          <span>{file.name}</span>
                        </FileUploaderItem>
                      ))}
                    {mobilePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Preview:</p>
                        <div className="relative w-full h-80 rounded-lg overflow-hidden">
                          <Image
                            src={mobilePreview}
                            fill
                            className="object-cover"
                            alt="preview"
                          />
                          <div
                            onClick={() => {
                              setMobilePreview(null);
                              setMobileFiles([]);
                              form.setValue("logo_mobile", null);
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
          name="header_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor do Header</FormLabel>
              <FormControl>
                <ColorPicker
                  className="w-28"
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="button_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor do botão</FormLabel>
              <FormControl>
                <ColorPicker
                  className="w-28"
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="footer_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor do Footer</FormLabel>
              <FormControl>
                <ColorPicker
                  className="w-28"
                  onChange={field.onChange}
                  value={field.value}
                />
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
