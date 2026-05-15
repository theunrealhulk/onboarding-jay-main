export interface Report {
  mostViewedPostId: string;
  mostUpvotedPostId: string;
  mostDownvotedPostId: string;
  topCategory: string;
  topCategoryVotes: number;
  worstCategoryVotes: number;
  date: string;
}