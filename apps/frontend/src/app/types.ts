export interface Joke {
  id: number;
  category: string;
  joke?: string;
  setup?: string;
  delivery?: string;
  error: false;
  flags: {
    explicit: boolean;
    nsfw: boolean;
    political: boolean;
    racist: boolean;
    religious: boolean;
    sexist: boolean;
  };
  lang: string;
  safe: boolean;
  type: string;
}
