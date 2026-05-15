export interface BlogPost {
  id?: string;
  title: string;
  text: string;
  imgUrl?: string;
  category: string;
  authorId: string;
  authorName: string;
  publishedOn: number;
  views: number;
  votes: number;
}