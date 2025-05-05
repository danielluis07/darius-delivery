import { string, z } from "zod";
import {
  users,
  categories,
  products,
  customizations,
  templates,
  orders,
  orderSettings,
  deliveryAreasKm,
  deliveryAreas,
  deliverers,
  combos,
  pixels,
  colors,
  stores,
} from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { use } from "react";

export const baseUserSchema = createInsertSchema(users);

const baseStoreSchema = createInsertSchema(stores);

export const insertStoreSchema = baseStoreSchema.extend({
  userId: z.string().optional(),
});

export const insertColorsSchema = createInsertSchema(colors);

const baseTemplateSchema = createInsertSchema(templates);

export const insertApiKeySchema = z.object({
  apiKey: z.string(),
});

export const insertDeliverersSchema = createInsertSchema(deliverers);

export const createEmployeeSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  permissions: z.array(z.string()).optional(),
});

export const createAffiliateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export const updateAffiliateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .optional(),
  permissions: z.array(z.string()).optional(),
});

export const insertCustomerByUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  userId: z.string().optional(),
  city: z.string(),
  state: z.string(),
  neighborhood: z.string(),
  street: z.string(),
  street_number: z.string(),
  postalCode: z.string(),
  complement: z.string().optional(),
});

export const insertLocalCustomerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  city: z.string(),
  state: z.string(),
  neighborhood: z.string(),
  street: z.string(),
  postalCode: z.string(),
  street_number: z.string(),
  complement: z.string().optional(),
});

export const insertDeliveryAreasSchema = createInsertSchema(deliveryAreas);

export const insertTemplateSchema = baseTemplateSchema.extend({
  preview_image:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
});

const baseDeliveryAreaKmSchema = createInsertSchema(deliveryAreasKm);

export const insertDeliveryAreaKmSchema = baseDeliveryAreaKmSchema.extend({
  fees: z.array(
    z.object({
      distance: z.number(),
      price: z.number(),
    })
  ),
});

export const insertPixelsSchema = createInsertSchema(pixels);

const baseCreateProductSchema = createInsertSchema(products);

const baseCreateCustomizationSchema = createInsertSchema(customizations);

const baseOrderSchema = createInsertSchema(orders);

const baseComboSchema = createInsertSchema(combos);

export const insertComboSchema = baseComboSchema.extend({
  image:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
  product_ids: z.array(z.string().uuid()),
});

export const updateComboSchema = baseComboSchema.extend({
  id: z.string(),
  image:
    typeof File !== "undefined"
      ? z.union([z.array(z.instanceof(File)).optional(), z.string().optional()])
      : z.union([z.any().optional(), z.string().optional()]),
  product_ids: z.array(z.string().uuid()),
});

export const insertOrderSchema = baseOrderSchema.extend({
  quantity: z.number().int().positive(),
  price: z.number().int(),
  total_price: z.number().int().optional(),
  daily_number: z.number().int().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().nonempty(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        name: z.string().nullable(),
      })
    )
    .nonempty(),
});

export const insertCustomerOrderSchema = baseOrderSchema.extend({
  quantity: z.number().int().positive(),
  price: z.number().int(),
  product_id: z.string().nonempty(),
  total_price: z.number().int().optional(),
  payment_status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  payment_type: z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "PIX"]).optional(),
  type: z.enum(["LOCAL", "WEBSITE", "WHATSAPP"]).optional(),
  status: z
    .enum([
      "ACCEPTED",
      "PREPARING",
      "FINISHED",
      "IN_TRANSIT",
      "DELIVERED",
      "WITHDRAWN",
      "CONSUME_ON_SITE",
    ])
    .optional(),
});

export const updateOrderSchema = z.object({
  delivererId: z.string().optional(),
  status: z.enum([
    "ACCEPTED",
    "PREPARING",
    "FINISHED",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
    "WITHDRAWN",
    "CONSUME_ON_SITE",
  ]),
  type: z.enum(["LOCAL", "WEBSITE", "WHATSAPP"]),
  payment_status: z.enum(["PENDING", "PAID", "CANCELLED"]),
  delivery_deadline: z.number().optional(),
  pickup_deadline: z.number().optional(),
  obs: z.string().optional(),
  total_price: z.number().optional(),
  street: z.string().optional(),
  customer_id: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().nonempty(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        name: z.string().nullable(),
      })
    )
    .nonempty(),
  street_number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

export const insertUserDomainSchema = z.object({
  domain: z
    .string()
    .regex(
      /^[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?$/,
      "Formato inválido. O domínio deve ser nesse formato: meudominio.com ou meudominio.com.br"
    ),
});

export const credentialsSignUpSchema = baseUserSchema
  .extend({
    domain: z
      .string()
      .regex(
        /^[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?$/,
        "Formato inválido. O domínio deve ser nesse formato: meudominio.com ou meudominio.com.br"
      ),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    repeat_password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
  });

export const oAuthRegisterSchema = baseUserSchema.pick({
  id: true,
  name: true,
  role: true,
  phone: true,
});

export const credentialsSignInSchema = baseUserSchema.extend({
  email: z
    .string()
    .email("Email inválido")
    .min(1, "É necessário informar um email"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    new_password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    repeat_new_password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.new_password === data.repeat_new_password, {
    message: "As senhas não coincidem",
    path: ["repeat_new_password"],
  });

export const insertBankAccountSchema = z.object({
  bankCode: string().length(3, "O código do banco deve ter 3 dígitos"),
  ownerName: string().min(
    3,
    "O nome do titular deve ter pelo menos 3 caracteres"
  ),
  bankAgency: string(),
  bankAccount: string().max(10, "A conta deve ter no máximo 10 caracteres"),
  bankAccountDigit: string().length(
    1,
    "O dígito da conta deve ter 1 caractere"
  ),
  bankAccountType: string(),
  pixAddressKey: string().optional(),
});

export const requestWithdrawlSchema = z.object({
  value: z.string(),
  bankCode: string(),
  ownerName: string(),
  cpfCnpj: string(),
  bankAgency: string(),
  bankAccount: string(),
  bankAccountDigit: string(),
  bankAccountType: string(),
  pixAddressKey: string().optional(),
});

export const insertAdminCommissionSchema = z.object({
  percentage: z.string(),
});

export const insertOrderSettingsSchema = createInsertSchema(orderSettings);

export const baseCategorySchema = createInsertSchema(categories);

export const insertCategorySchema = baseCategorySchema.extend({
  image:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
});

export const updateCategorySchema = baseCategorySchema.extend({
  id: z.string(),
  image:
    typeof File !== "undefined"
      ? z.union([z.array(z.instanceof(File)).optional(), z.string().optional()])
      : z.union([z.any().optional(), z.string().optional()]),
});

const additionalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Option name cannot be empty"),
  priceAdjustment: z.number().default(0),
});

export const additionalGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Group name cannot be empty"),
  storeId: z.string(),
  selectionType: z.enum(["single", "multiple"]).default("multiple"),
  isRequired: z.boolean().default(false),
  category_id: z.string(),
  additionals: z
    .array(additionalSchema)
    .min(1, "Add at least one option to this group"),
});

export const insertProductSchema = baseCreateProductSchema.extend({
  image:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
});

export const updateProductSchema = baseCreateProductSchema.extend({
  id: z.string(),
  image:
    typeof File !== "undefined"
      ? z.union([z.array(z.instanceof(File)).optional(), z.string().optional()])
      : z.union([z.any().optional(), z.string().optional()]),
});

export const insertCustomizationSchema = baseCreateCustomizationSchema.extend({
  banner:
    typeof File !== "undefined"
      ? z.union([
          z.array(z.instanceof(File)).optional(),
          z.string().optional(),
          z.null(),
        ])
      : z.union([z.any().optional(), z.string().optional(), z.null()]),
  logo:
    typeof File !== "undefined"
      ? z.union([
          z.array(z.instanceof(File)).optional(),
          z.string().optional(),
          z.null(),
        ])
      : z.union([z.any().optional(), z.string().optional(), z.null()]),

  opening_hours: z
    .array(
      z.object({
        day: z.string(),
        open: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
        close: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
      })
    )
    .min(1, "At least one opening hour is required"),
});

export const insertCustomerSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    userId: z.string().optional(),
    city: z.string(),
    state: z.string(),
    cpfCnpj: z.string(),
    neighborhood: z.string(),
    restaurantOwnerId: z.string().optional(),
    street: z.string(),
    postalCode: z.string(),
    street_number: z.string(),
    complement: z.string().optional(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    repeat_password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
  });

export const templateNames: Array<string> = [
  "TEMPLATE_1",
  "TEMPLATE_2",
  "TEMPLATE_3",
  "TEMPLATE_4",
];

export const state: Array<
  | "Acre"
  | "Alagoas"
  | "Amapá"
  | "Amazonas"
  | "Bahia"
  | "Ceará"
  | "Distrito Federal"
  | "Espírito Santo"
  | "Goiás"
  | "Maranhão"
  | "Mato Grosso"
  | "Mato Grosso do Sul"
  | "Minas Gerais"
  | "Pará"
  | "Paraíba"
  | "Paraná"
  | "Pernambuco"
  | "Piauí"
  | "Rio de Janeiro"
  | "Rio Grande do Norte"
  | "Rio Grande do Sul"
  | "Rondônia"
  | "Roraima"
  | "Santa Catarina"
  | "São Paulo"
  | "Sergipe"
  | "Tocantins"
> = [
  "Acre",
  "Alagoas",
  "Amapá",
  "Amazonas",
  "Bahia",
  "Ceará",
  "Distrito Federal",
  "Espírito Santo",
  "Goiás",
  "Maranhão",
  "Mato Grosso",
  "Mato Grosso do Sul",
  "Minas Gerais",
  "Pará",
  "Paraíba",
  "Paraná",
  "Pernambuco",
  "Piauí",
  "Rio de Janeiro",
  "Rio Grande do Norte",
  "Rio Grande do Sul",
  "Rondônia",
  "Roraima",
  "Santa Catarina",
  "São Paulo",
  "Sergipe",
  "Tocantins",
];
