import * as functions from "firebase-functions";
import getBlogPost from "../DataAccess/Read/getBlogPost";

export const cfGetPost = functions.https.onRequest(async (req, res) => {
  console.log("cfGetPost request", req.query);
  const id = typeof req.query.postId === "string" ? req.query.postId.trim() : "";
  if (!id) {
    res.status(400).send("Missing post id");
    return;
  }

  const blogPost = await getBlogPost(id);
  if (!blogPost) {
    res.status(404).send("Blog post not found");
    return;
  }

  res.status(200).json(blogPost);
});
