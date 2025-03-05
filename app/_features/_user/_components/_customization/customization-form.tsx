"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
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
import { useForm, FieldErrors, useFieldArray } from "react-hook-form";
import { insertCustomizationSchema } from "@/db/schemas";
import { ClipboardList, CloudUpload, Key } from "lucide-react";
import { FaPix, FaCreditCard, FaMoneyBill1Wave } from "react-icons/fa6";
import { BsCreditCard2FrontFill } from "react-icons/bs";
import { useState } from "react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ColorPicker } from "@/components/color-picker";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import Image from "next/image";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn, formatPhoneNumber } from "@/lib/utils";
import placeholder from "@/public/placeholder-image.jpg";
import { createCustomization } from "@/app/_features/_user/_actions/create-customization";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type TemplatesResponseType = InferResponseType<
  typeof client.api.templates.$get,
  200
>["data"];

type CustomizationResponseType = InferResponseType<
  (typeof client.api.customizations)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertCustomizationSchema>;

const paymentOptions = [
  {
    value: "PIX",
    label: "PIX",
    icon: <FaPix className="mt-2 text-[#00BDAE]" />,
  },
  {
    value: "CREDIT_CARD",
    label: "Cartão de Crédito",
    icon: <FaCreditCard className="mt-2 text-blue-700" />,
  },
  {
    value: "CASH",
    label: "Dinheiro",
    icon: <FaMoneyBill1Wave className="mt-2 text-green-600" />,
  },
  {
    value: "CARD",
    label: "Cartão",
    icon: <BsCreditCard2FrontFill className="mt-2 text-blue-700" />,
  },
];

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
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(insertCustomizationSchema),
    defaultValues: {
      id: customization?.id ?? "",
      store_name: customization?.store_name ?? "",
      store_phone: customization?.store_phone ?? "",
      background_color: customization?.background_color ?? "",
      button_color: customization?.button_color ?? "",
      footer_color: customization?.footer_color ?? "",
      header_color: customization?.header_color ?? "",
      font_color: customization?.font_color ?? "",
      banner: [],
      logo: [],
      city: customization?.city ?? "",
      state: customization?.state ?? "",
      street: customization?.street ?? "",
      street_number: customization?.street_number ?? "",
      neighborhood: customization?.neighborhood ?? "",
      isOpen: customization?.isOpen ?? false,
      template_id: customization?.template_id ?? "",
      payment_methods: customization?.payment_methods ?? [],
      opening_hours: customization?.opening_hours ?? [
        { day: "Segunda", open: "08:00", close: "22:00" },
        { day: "Terça", open: "08:00", close: "22:00" },
        { day: "Quarta", open: "08:00", close: "22:00" },
        { day: "Quinta", open: "08:00", close: "22:00" },
        { day: "Sexta", open: "08:00", close: "22:00" },
        { day: "Sábado", open: "09:00", close: "23:00" },
        { day: "Domingo", open: "10:00", close: "20:00" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "opening_hours",
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
        <div className="flex gap-4">
          <div className="grid grid-cols-1 gap-4 w-full">
            <FormField
              control={form.control}
              name="store_name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nome da Loja</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="store_phone"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Telefone da Loja</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        const formattedPhoneNumber = formatPhoneNumber(
                          event.target.value
                        );
                        field.onChange(formattedPhoneNumber);
                      }}
                      value={field.value ?? ""}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="isOpen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-[130px] mt-8">
                  <div className="space-y-0.5">
                    <FormLabel>Loja está aberta?</FormLabel>
                    <FormDescription>
                      Escolha se a loja está aberta ou fechada para os clientes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Rua</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="street_number"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nº da rua</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* opening hours */}
        <div className="w-full">
          <p className="font-semibold py-4">Horários de atendimento</p>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`opening_hours.${index}.day`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`opening_hours.${index}.open`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`opening_hours.${index}.close`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-error text-white">
                  Remover
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => append({ day: "", open: "", close: "" })}>
            Adicionar Dia
          </Button>
        </div>

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
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
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
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-10">
          <FormField
            control={form.control}
            name="background_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor de Fundo</FormLabel>
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
            name="font_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor da Fonte</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="payment_methods"
          render={() => (
            <div className="flex flex-col gap-6">
              {/* Darius Pay */}
              <div className="border p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Darius Pay</h3>
                <div className="flex flex-col">
                  {paymentOptions.slice(0, 2).map((item, i) => (
                    <FormItem
                      key={i}
                      className="flex items-center gap-x-3 py-2">
                      {item.icon}
                      <FormControl>
                        <Checkbox
                          className="size-5"
                          checked={form
                            .watch("payment_methods")
                            ?.includes(item.value)}
                          onCheckedChange={(checked) => {
                            const currentValues =
                              form.getValues("payment_methods") || [];
                            form.setValue(
                              "payment_methods",
                              checked
                                ? [...currentValues, item.value]
                                : currentValues.filter(
                                    (value) => value !== item.value
                                  )
                            );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="capitalize">{item.label}</FormLabel>
                    </FormItem>
                  ))}
                </div>
              </div>

              {/* Pagamento na Entrega */}
              <div className="border p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-3">
                  Pagamento na Entrega
                </h3>
                <div className="flex flex-col">
                  {paymentOptions.slice(2, 4).map((item, i) => (
                    <FormItem
                      key={i}
                      className="flex items-center gap-x-3 py-2">
                      {item.icon}
                      <FormControl>
                        <Checkbox
                          className="size-5"
                          checked={form
                            .watch("payment_methods")
                            ?.includes(item.value)}
                          onCheckedChange={(checked) => {
                            const currentValues =
                              form.getValues("payment_methods") || [];
                            form.setValue(
                              "payment_methods",
                              checked
                                ? [...currentValues, item.value]
                                : currentValues.filter(
                                    (value) => value !== item.value
                                  )
                            );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="capitalize">{item.label}</FormLabel>
                    </FormItem>
                  ))}
                </div>
              </div>
            </div>
          )}
        />

        <CustomizationPreview
          logo={desktopPreview}
          buttonColor={form.watch("button_color")}
          fontColor={form.watch("font_color")}
          backgroundImage={bannerPreview}
        />
        <LoadingButton
          label={customization ? "Atualizar" : "Criar"}
          loadingLabel={customization ? "Atualizando" : "Criando"}
          className="w-full mt-5"
          disabled={isPending}
          isPending={isPending}
          type="submit"
        />
      </form>
    </Form>
  );
};

const CustomizationPreview = ({
  logo,
  buttonColor,
  fontColor,
  backgroundImage,
}: {
  logo: string | null;
  buttonColor: string | null | undefined;
  fontColor: string | null | undefined;
  backgroundImage: string | null;
}) => {
  return (
    <Dialog>
      <DialogTrigger className="w-full bg-secondary h-9 px-4 py-2 text-primary shadow-sm hover:bg-primary hover:text-white inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
        Preview
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Receipt Preview</DialogTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root>
            <DialogDescription>View the full receipt details</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        <div
          className="relative h-[600px] w-[450px] overflow-hidden rounded-[40px] border-[12px] border-gray-800 bg-white shadow-2xl p-6 bg-cover"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}>
          <div className="relative size-32 mx-auto mb-4">
            <Image
              src={logo || placeholder}
              alt="logo"
              fill
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 10vw, 200px"
              className="object-contain"
            />
          </div>
          <div className="flex justify-center gap-4">
            <Card
              className="text-black flex flex-col items-center min-w-28 cursor-pointer"
              style={{
                backgroundColor: buttonColor || "transparent",
                color: fontColor || "black",
              }}>
              <ClipboardList />
              Registrar
            </Card>
            <Card
              className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
              style={{
                backgroundColor: buttonColor || "transparent",
                color: fontColor || "black",
              }}>
              <Key />
              Login
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
