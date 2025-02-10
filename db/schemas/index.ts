import { z } from "zod";
import { users, categories, products, customizations } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { File } from "node-fetch";

export const baseUserSchema = createInsertSchema(users);

const baseCreateProductSchema = createInsertSchema(products);

const baseCreateCustomizationSchema = createInsertSchema(customizations);

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
  image: z.array(z.instanceof(File)).optional(),
});

export const insertProductSchema = baseCreateProductSchema.extend({
  image: z.array(z.instanceof(File)).optional(),
});

export const insertCustomizationSchema = baseCreateCustomizationSchema.extend({
  banner: z.array(z.instanceof(File)).optional(),
  logo_desktop: z.array(z.instanceof(File)).optional(),
  logo_mobile: z.array(z.instanceof(File)).optional(),
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
