import * as functions from "firebase-functions";
import deleteBlogPost from "../DataAccess/Write/deleteBlogPost";
import { postIdFromRequest } from "../Helpers/postIdFromRequest";

export const cfDeletePost = functions.https.onRequest(async (req, res) => {
  const id = postIdFromRequest(req);
  if (!id) {
    res.status(400).send("Missing post id");
    return;
  }
  await deleteBlogPost(id);
  res.status(200).json({ postId: id });
});