import * as functions from "firebase-functions";
import getVote from "../DataAccess/Read/getVote";
import setVote from "../DataAccess/Write/setVote";


export const cfUpVote = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required");
    }
    const postId = data?.postId;
    if (typeof postId !== "string" || postId.length === 0) {
      throw new functions.https.HttpsError("invalid-argument", "postId is required");
    }
    const uid = context.auth!.uid;
    const current = await getVote(postId, uid);
    if (current === 1) {
      throw new functions.https.HttpsError("failed-precondition", "already upvoted");
    }
    if (current === -1) {
      await setVote(postId, uid, 1);
    } else {
      await setVote(postId, uid, 1);
    }
    return { vote: 1 };
  });
  