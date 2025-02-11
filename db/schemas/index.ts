import { z } from "zod";
import {
  users,
  categories,
  products,
  customizations,
  templates,
  orders,
} from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";

export const baseUserSchema = createInsertSchema(users);

const baseTemplateSchema = createInsertSchema(templates);

export const insertTemplateSchema = baseTemplateSchema.extend({
  preview_image:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
});

const baseCreateProductSchema = createInsertSchema(products);

const baseCreateCustomizationSchema = createInsertSchema(customizations);

const baseOrderSchema = createInsertSchema(orders);

export const insertOrderSchema = baseOrderSchema.extend({
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().int(),
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
  logo_desktop:
    typeof File !== "undefined"
      ? z.array(z.instanceof(File)).optional()
      : z.any().optional(),
  logo_mobile:
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
    address: z.string(),
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
  | "AC"
  | "AL"
  | "AP"
  | "AM"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MT"
  | "MS"
  | "MG"
  | "PA"
  | "PB"
  | "PR"
  | "PE"
  | "PI"
  | "RJ"
  | "RN"
  | "RS"
  | "RO"
  | "RR"
  | "SC"
  | "SP"
  | "SE"
  | "TO"
> = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
