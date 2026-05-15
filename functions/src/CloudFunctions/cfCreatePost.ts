import * as functions from "firebase-functions";
import validateBlogPost from "../Validators/validateBlogPost";
import setBlogPost from "../DataAccess/Write/setBlogPost";
import { BlogPost } from "../Interfaces/blogPost";
import defaultApp, { defaultDB } from "../Helpers/defaultApp";

async function getAuthFromRequest(
  req: functions.https.Request
): Promise<{ uid: string; displayName: string } | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) {
    return null;
  }
  try {
    const decoded = await defaultApp.auth().verifyIdToken(idToken);
    const user = await defaultApp.auth().getUser(decoded.uid);
    const displayName =
      user.displayName ||
      user.email?.split("@")[0] ||
      "Anonymous";
    return { uid: decoded.uid, displayName };
  } catch {
    return null;
  }
}

export const cfCreateBlogPost = functions.https.onRequest(async (req, res) => {
  const blogPost: BlogPost = req.body;
  if (!validateBlogPost(blogPost)) {
    res.status(400).send("Invalid blog post");
    return;
  }

  const auth = await getAuthFromRequest(req);
  if (!auth) {
    res.status(401).send("Unauthorized");
    return;
  }

  blogPost.authorId = auth.uid;
  blogPost.authorName = auth.displayName;
  blogPost.publishedOn = Date.now();
  blogPost.views = 0;
  blogPost.votes = 0;
  blogPost.id = defaultDB.ref().push().key!;

  await setBlogPost(blogPost);
  res.status(200).send(blogPost);
});