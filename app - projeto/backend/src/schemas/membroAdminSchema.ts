import { z } from "zod";

export const perfilAcessoSchema = z.enum(["administrador", "secretaria"]);

export const membroQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, "search deve ter no maximo 120 caracteres.")
    .optional()
    .transform((valor) => (valor && valor.length > 0 ? valor : undefined)),
  ativo: z
    .enum(["true", "false"])
    .optional()
    .transform((valor) => (valor === undefined ? undefined : valor === "true")),
  perfil: perfilAcessoSchema.optional(),
  page: z.coerce.number().int().min(1, "page deve ser maior que zero.").default(1),
  limit: z.coerce.number().int().min(1, "limit deve ser maior que zero.").max(50, "limit maximo e 50.").default(10),
});

export const membroCreateBodySchema = z.object({
  nome: z.string().trim().min(1, "nome e obrigatorio.").max(120, "nome deve ter no maximo 120 caracteres."),
  email: z.email("email invalido.").max(160, "email deve ter no maximo 160 caracteres."),
  senha: z.string().min(6, "senha deve ter no minimo 6 caracteres.").max(100, "senha deve ter no maximo 100 caracteres."),
  perfil: perfilAcessoSchema.default("secretaria"),
});

export const membroUpdateBodySchema = z.object({
  nome: z.string().trim().min(1, "nome e obrigatorio.").max(120, "nome deve ter no maximo 120 caracteres."),
  email: z.email("email invalido.").max(160, "email deve ter no maximo 160 caracteres."),
  perfil: perfilAcessoSchema.optional(),
});

export const membroStatusBodySchema = z.object({
  ativo: z.boolean(),
});

export const membroIdParamsSchema = z.object({
  id: z.coerce.number().int().positive("id invalido."),
});

export const membroResetSenhaBodySchema = z.object({
  nova_senha: z.string().min(6, "nova_senha deve ter no minimo 6 caracteres.").max(100, "nova_senha deve ter no maximo 100 caracteres."),
});

export const primeiroAcessoTrocaSenhaBodySchema = z
  .object({
    senha_atual: z.string().min(1, "senha_atual e obrigatoria."),
    nova_senha: z.string().min(6, "nova_senha deve ter no minimo 6 caracteres.").max(100, "nova_senha deve ter no maximo 100 caracteres."),
  })
  .refine((data) => data.senha_atual !== data.nova_senha, {
    message: "nova_senha deve ser diferente da senha_atual.",
    path: ["nova_senha"],
  });
