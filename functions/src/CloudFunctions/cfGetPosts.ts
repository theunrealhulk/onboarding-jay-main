import * as functions from "firebase-functions";
import getBlogPosts from "../DataAccess/Read/getBlogPosts";

export const cfGetPosts = functions.https.onRequest(async (req, res) => {
  const limitRaw = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const pageRaw = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = Number.isNaN(limitRaw) ? 10 : limitRaw;
  const page = Number.isNaN(pageRaw) ? 1 : pageRaw;
  const blogPosts = await getBlogPosts(limit, page);
  res.status(200).json(blogPosts);
});