import { defaultDB } from "../../Helpers/defaultApp";

export default async function deleteBlogPost(id: string): Promise<null> {
  try {
    if (!(id)) {
      throw new Error("Invalid blog post ID");
    }
    await defaultDB.ref("blogPosts").child(id).remove();
  } catch (error) {
    console.error("deleteBlogPost error", error);
  }
  return null;
}