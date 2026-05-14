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
