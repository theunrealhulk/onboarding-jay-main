import { defaultDB } from "../../Helpers/defaultApp";

export default async function setVote(postId: string, userId: string, vote: number): Promise<null> {
  try {
    if (!postId || !userId || !vote) {
      throw new Error("Post ID, user ID and vote are required");
    }
    await defaultDB.ref("blogPosts").child(postId).child(userId).set(vote);
  } catch (error) {
    console.error("setVote error", error);
  }
  return null;
}