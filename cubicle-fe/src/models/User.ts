export interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  phone_number?: string;
  followers: User[];
}