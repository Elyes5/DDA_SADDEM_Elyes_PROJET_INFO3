import type { Snippet } from "./Snippet";
import type { Badge } from "./Badge"
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  phone_number?: string;
  bio?: string;
  join_date: string;
  last_login?: string;
  followers: User[];
  snippets: Snippet[],
  badge: Badge,
  liked_snippets: Snippet[]
}