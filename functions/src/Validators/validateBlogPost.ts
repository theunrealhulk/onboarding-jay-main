type BlogPostInput = {
    title: string;
    text: string;
    category: string;
    imgUrl?: string;
}

export default function validateBlogPost(input: BlogPostInput): boolean {
    const titleOk = typeof input.title === "string" && input.title.trim().length > 0;
    const textOk = typeof input.text === "string" && input.text.trim().length > 0;
    const categoryOk =
      typeof input.category === "string" && input.category.trim().length > 0;
    const imgUrlOk =
      input.imgUrl === undefined ||
      input.imgUrl === null ||
      (typeof input.imgUrl === "string" && input.imgUrl.trim().length > 0);
    const ok = titleOk && textOk && categoryOk && imgUrlOk;
    console.assert(ok, "invalid something payload");
    if (!ok) {
      console.log(
        `validateBlogPost failed: titleOk=${titleOk} textOk=${textOk} categoryOk=${categoryOk} imgUrlOk=${imgUrlOk}`
      );
    }
    return ok;
  }