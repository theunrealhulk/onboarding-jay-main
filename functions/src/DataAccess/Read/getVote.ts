import { defaultDB } from "../../Helpers/defaultApp";

export default async function getVote(postId: string, userId: string): Promise<Number | null> {
  try {
    if (!postId || !userId) {
      throw new Error("Post ID and user ID are required");
    }
    const vote = await defaultDB.ref("votes").child(postId).child(userId).once("value");
    return vote.val() as number;
  } catch (error) {
    console.error("getVote error", error);
  }
  return null;
}