import { z } from "zod";
import {
  users,
  categories,
  products,
  customizations,
  templates,
  orders,
  deliveryAreasKm,
  deliveryAreas,
  deliverers,
  combos,
  pixels,
} from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const baseUserSchema = createInsertSchema(users);

const baseTemplateSchema = createInsertSchema(templates);

export const insertApiKeySchema = z.object({
  apiKey: z.string(),
});

export const insertDeliverersSchema = createInsertSchema(deliverers);

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

export const insertOrderSchema = baseOrderSchema.extend({
  quantity: z.number().int().positive(),
  price: z.number().int(),
  total_price: z.number().int().optional(),
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
    .enum(["ACCEPTED", "PREPARING", "FINISHED", "IN_TRANSIT", "DELIVERED"])
    .optional(),
});

export const updateOrderSchema = z.object({
  delivererId: z.string(),
  status: z.enum([
    "ACCEPTED",
    "PREPARING",
    "FINISHED",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
  ]),
  type: z.enum(["LOCAL", "WEBSITE", "WHATSAPP"]),
  payment_status: z.enum(["PENDING", "PAID", "CANCELLED"]),
  delivery_deadline: z.number().optional(),
  pickup_deadline: z.number().optional(),
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

export const baseCategorySchema = createInsertSchema(categories);

export const insertCategorySchema = baseCategorySchema.extend({
  image:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
});

export const insertProductSchema = baseCreateProductSchema.extend({
  image:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
});

export const insertCustomizationSchema = baseCreateCustomizationSchema.extend({
  banner:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
  logo:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
});

export const insertCustomerSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    userId: z.string().optional(),
    city: z.string(),
    state: z.string(),
    neighborhood: z.string(),
    restaurantOwnerId: z.string().optional(),
    street: z.string(),
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
