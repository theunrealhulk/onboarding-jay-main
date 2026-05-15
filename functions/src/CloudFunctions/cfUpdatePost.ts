import * as functions from "firebase-functions";
import updateBlogPost from "../DataAccess/Write/updateBlogPost";
import { BlogPost } from "../Interfaces/blogPost";
import validateBlogPost from "../Validators/validateBlogPost";

export const cfUpdatePost = functions.https.onRequest(async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || id.length === 0) {
    res.status(400).send("Missing post id");
    return;
  }
  const blogPost: BlogPost = req.body;
  if (!validateBlogPost(blogPost)) {
    res.status(400).send("Invalid blog post");
    return;
  }
  await updateBlogPost(id, blogPost);
  res.status(200).send(blogPost);
  return;
});