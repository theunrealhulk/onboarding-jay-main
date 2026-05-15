import { defaultDB } from "../../Helpers/defaultApp";
import { BlogPost } from "../../Interfaces/blogPost";

export default async function setBlogPost(blogPost: BlogPost): Promise<null> {
  try {
    if (!blogPost.id) {
      throw new Error("Blog post ID is required");
    }
    await defaultDB.ref("blogPosts").child(blogPost.id).set(blogPost);
  } catch (error) {
    console.error("setBlogPost error", error);
  }
  return null;
}