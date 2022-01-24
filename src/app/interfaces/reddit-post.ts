export interface RedditPost {
  data: RedditPostData;
}

interface RedditPostData {
  author: string;
  name: string;
  permalink: string;
  preview: RedditPreview;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  secure_media: RedditMedia;
  title: string;
  media: RedditMedia;
  url: string;
  thumbnail: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  num_comments: number;
}

interface RedditPreview {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  reddit_video_preview: RedditVideoPreview;
}

interface RedditVideoPreview {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  is_gif: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  fallback_url: string;
}

interface RedditMedia {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  reddit_video: RedditVideoPreview;
}
