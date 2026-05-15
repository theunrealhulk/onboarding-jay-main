import { defaultDB } from "../../Helpers/defaultApp";
import { BlogPost } from "../../Interfaces/blogPost";

export default async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    if (!id) {
      throw new Error("Blog post ID is required");
    }
    const blogPost = await defaultDB.ref("blogPosts").child(id).once("value");
    return blogPost.val() as BlogPost;
  } catch (error) {
    console.error("getBlogPost error", error);
  }
  return null;
}