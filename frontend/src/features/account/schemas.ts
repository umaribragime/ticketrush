import { z } from "zod";

/** Same rules as the backend DTOs. Messages are translation keys. */
export const profileSchema = z.object({
  name: z.string().trim().min(1, "v.nameRequired").max(100),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "v.currentPassword"),
    newPassword: z.string().min(8, "v.passwordMin").max(72),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "v.passwordMatch",
  });
export type PasswordForm = z.infer<typeof passwordSchema>;
