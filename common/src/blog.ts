import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(1, {
    error: "Title is required",
  }),
  content: z.string().min(1, {
    error: "Content is required",
  }),
});

export const updateBlogSchema = z.object({
  id: z.string().min(1, {
    error: "Blog ID is required",
  }),
  title: z.string().min(1, {
    error: "Title is required",
  }),
  content: z.string().min(1, {
    error: "Content is required",
  }),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;