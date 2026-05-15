import { defaultDB } from "../../Helpers/defaultApp";
import { BlogPost } from "../../Interfaces/blogPost";

const MAX_LIMIT = 100;

export default async function getBlogPosts(limit: number = 10, page: number = 1): Promise<BlogPost[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : 10;
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  try {
    const snapshot = await defaultDB.ref("blogPosts").once("value");
    const raw = snapshot.val() as Record<string, BlogPost> | null;
    if (!raw || typeof raw !== "object") {
      return [];
    }

    const posts: BlogPost[] = Object.entries(raw).map(([key, post]) => ({
      ...post,
      id: post.id ?? key,
    }));

    posts.sort((a, b) => (b.publishedOn ?? 0) - (a.publishedOn ?? 0));

    const offset = (safePage - 1) * safeLimit;
    return posts.slice(offset, offset + safeLimit);
  } catch (error) {
    console.error("getBlogPosts error", error);
  }
  return [];
}
