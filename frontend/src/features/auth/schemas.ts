import { z } from "zod";

/**
 * Same rules as the backend's @Valid annotations, so users see errors before sending.
 * Messages are translation keys; <Field> shows them in the current language.
 */
export const loginSchema = z.object({
  email: z.email("v.email"),
  password: z.string().min(1, "v.passwordRequired"),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "v.nameRequired").max(100),
    email: z.email("v.email"),
    password: z.string().min(8, "v.passwordMin").max(72),
    passwordConfirm: z.string(),
    accountType: z.enum(["ATTENDEE", "ORGANIZER"]),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "v.passwordMatch",
  });
export type SignupForm = z.infer<typeof signupSchema>;
