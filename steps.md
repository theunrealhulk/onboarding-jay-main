# Blog API — Feature List

## 0. Interfaces — `functions/src/interfaces/`

```
interfaces/
  blogPost.ts    → BlogPost { id?, title, text, imgUrl?, category, authorId, authorName, publishedOn, views, votes }
  category.ts    → Category { label }
  report.ts      → Report { mostViewedPostId, mostUpvotedPostId, mostDownvotedPostId, topCategory, topCategoryVotes, worstCategoryVotes, date }

```

## 1. Create blog post — `POST /blog` (authenticated)
- Client sends: title, text, category, imgUrl
- Server auto-sets: id (auto-generated), authorId (from auth token), authorName (from auth token), publishedOn (Date.now()), views (0), votes (0)
- Triggers db trigger `cfRtdbOnNewPost`: confirms views and votes are initialized to 0
- Triggers storage trigger `cfStorageOnImageUpload`: downloads uploaded imgUrl, resizes to square aspect ratio, renames to `{authorName}_post_{timestamp}`, updates post's imgUrl to resized version

## 2. List blog posts — `GET /blogPosts` (no auth)
- Returns all blog posts sorted by `publishedOn` descending
- Supports pagination: `?page=1&limit=10`
- Filters:
  - `?title=tech` — posts where title contains the word "tech"
  - `?text=tech` — posts where text contains the word "tech"
  - `?category=tech` — posts where category label contains "tech"
  - `?author=<authorName>` — posts by that author
  - `?view=gt&val=5` — posts with views greater than 5
  - `?view=lt&val=5` — posts with views less than 5
  - `?view=eq&val=5` — posts with views equal to 5

## 3. Get single blog post — `GET /blogPosts/<id>` (authenticated)
- Returns full blog post object
- On first read by this user: writes `readReceipts/{postId}/{uid}` to trigger view counting
- Triggers db trigger `cfRtdbOnFirstView` (onCreate of readReceipts): increments `posts/{postId}/views` by 1 via transaction
- Subsequent reads by the same user do not increment views again (read receipt already exists)

## 4. Update blog post — `PUT /blogPost/<id>` (authenticated, owner only)
- Client sends any subset of: title, text, category, imgUrl
- Verifies authorId matches authenticated uid
- Merges updates into existing post data
- If imgUrl changed, triggers image reprocessing (same as create: resize to square, rename)

## 5. Delete blog post — `DELETE /blogPost/<id>` (authenticated, owner only)
- Verifies authorId matches authenticated uid
- Removes `posts/{postId}` from database
- Cleans up associated votes under `votes/{postId}`

## 6. Upvote — callable function `cfUpvote` (authenticated, once per user per post)
- Client sends: postId
- Checks existing vote at `votes/{postId}/{uid}`
- If already upvoted → return error "already upvoted"
- If already downvoted → change to upvote (set 1)
- If no existing vote → set to 1
- Triggers db trigger `cfRtdbOnVote`: recalculates post's total vote score

## 7. Downvote — callable function `cfDownvote` (authenticated, once per user per post)
- Client sends: postId
- Checks existing vote at `votes/{postId}/{uid}`
- If already downvoted → return error "already downvoted"
- If already upvoted → change to downvote (set -1)
- If no existing vote → set to -1
- Triggers db trigger `cfRtdbOnVote`: recalculates post's total vote score

## 8. Revoke vote — callable function `cfRevokeVote` (authenticated)
- Client sends: postId
- Checks existing vote at `votes/{postId}/{uid}`
- If no vote exists → return error "no vote to revoke"
- Removes `votes/{postId}/{uid}`
- Triggers db trigger `cfRtdbOnVote`: recalculates post's total vote score

## 9. Auth trigger — `functions.auth.user().onCreate` (no client call, fires automatically)
- When a new user registers via Firebase Auth
- Creates profile in `profiles/{uid}`: email, displayName (or "Anonymous"), createdAt

## 10. Daily reports — PubSub scheduled `cfPubsubDailyReport`
- Configured by `REPORT_TIME` in constants.ts (default "08:00")
- Runs every day via cron schedule
- Reads all posts
- Computes and saves to `reports/{reportId}`:
  - `mostViewedPostId` — post with largest number of views
  - `mostUpvotedPostId` — post with largest votes
  - `mostDownvotedPostId` — post with lowest votes
  - `topCategory` — category with the most posts
  - `topCategoryVotes` — category with highest total votes
  - `worstCategoryVotes` — category with lowest total votes
  - `date` — current date string

## 11. Get reports — `GET /reports` (authenticated)
- No filter: returns all reports
- With filter `?date=15-08-2026`: returns only reports matching that date

---

## Files to create (ordered by dependency)

```
Phase 0 — Interfaces (no dependencies)
  1. src/interfaces/blogPost.ts
  2. src/interfaces/category.ts
  3. src/interfaces/report.ts

Phase 1 — Core CRUD
  4. src/Helpers/constants.ts                          (add REPORT_TIME)
  5. src/Validators/validateBlogPost.ts                (depends on: blogPost.ts)
  6. src/DataAccess/Write/setBlogPost.ts               (depends on: blogPost.ts)
  7. src/DataAccess/Read/getBlogPosts.ts               (depends on: blogPost.ts)
  8. src/DataAccess/Read/getBlogPost.ts                (depends on: blogPost.ts)
  9. src/CloudFunctions/cfCreatePost.ts                (depends on: 5, 6)
  10. src/CloudFunctions/cfGetPosts.ts                  (depends on: 7)
  11. src/CloudFunctions/cfGetPost.ts                   (depends on: 8)
  12. src/CloudFunctions/cfUpdatePost.ts                (depends on: 8)
  13. src/CloudFunctions/cfDeletePost.ts                (depends on: blogPost.ts)
  14. src/index.ts                                      (export 9-13)

Phase 2 — Votes
  15. src/DataAccess/Read/getVote.ts
  16. src/DataAccess/Write/setVote.ts
  17. src/CloudFunctions/cfUpvote.ts                    (depends on: 15, 16)
  18. src/CloudFunctions/cfDownvote.ts                  (depends on: 15, 16)
  19. src/CloudFunctions/cfRevokeVote.ts                (depends on: 15, 16)
  20. src/CloudFunctions/cfRtdbOnVote.ts
  21. src/index.ts                                      (export 17-20)

Phase 3 — Auth trigger
  22. src/CloudFunctions/cfAuthOnSignup.ts
  23. src/index.ts                                      (export 22)

Phase 4 — Database triggers
  24. src/DataAccess/Write/setView.ts
  25. src/CloudFunctions/cfRtdbOnFirstView.ts           (depends on: 24)
  26. src/CloudFunctions/cfRtdbOnNewPost.ts
  27. src/index.ts                                      (export 25, 26)

Phase 5 — Storage trigger
  28. src/CloudFunctions/cfStorageOnImageUpload.ts
  29. src/index.ts                                      (export 28)

Phase 6 — Reports
  30. src/DataAccess/Read/getReports.ts
  31. src/DataAccess/Write/setReport.ts
  32. src/CloudFunctions/cfPubsubDailyReport.ts         (depends on: 31)
  33. src/CloudFunctions/cfGetReports.ts                (depends on: 30)
  34. src/index.ts                                      (export 32, 33)
```
