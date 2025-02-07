import { z } from "zod";
import { users, categories, products } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { File } from "node-fetch";

export const baseUserSchema = createInsertSchema(users);

const baseCreateProductSchema = createInsertSchema(products);

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
