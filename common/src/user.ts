import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().optional(),
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(4, {
    error: "Password must be at least 4 characters",
  }),
});

export const signinSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(4, {
    error: "Password must be at least 4 characters",
  }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;