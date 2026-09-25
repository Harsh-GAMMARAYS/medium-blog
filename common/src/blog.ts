import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const updateBlogSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;