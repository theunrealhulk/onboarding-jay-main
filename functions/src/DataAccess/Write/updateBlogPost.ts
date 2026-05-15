import { defaultDB } from "../../Helpers/defaultApp";
import { BlogPost } from "../../Interfaces/blogPost";
import validateBlogPost from "../../Validators/validateBlogPost";

export default async function updateBlogPost(id: string, blogPost: BlogPost): Promise<null> {
  try {
    if (!validateBlogPost(blogPost)) {
      throw new Error("Invalid blog post");
    }
    await defaultDB.ref("blogPosts").child(id).update(blogPost);
  } catch (error) {
    console.error("updateBlogPost error", error);
  }
  return null;
}