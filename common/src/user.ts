import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(6),
});

export const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;