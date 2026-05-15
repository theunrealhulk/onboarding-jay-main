import { z } from "zod";

const BlogPostInputSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  category: z.string().min(1),
  imgUrl: z.string().min(1).optional(),
});

type BlogPostInput = z.infer<typeof BlogPostInputSchema>;

export default function validateBlogPost(input: BlogPostInput): boolean {
  const result = BlogPostInputSchema.safeParse(input);
  if (!result.success) {
    console.log(
      `validateBlogPost failed:`,
      result.error.issues
    );
  }
  console.assert(result.success, "invalid something payload");
  return result.success;
}
