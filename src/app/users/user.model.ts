export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatarUrl?: string; // data URL or external
  password: string; // stored in plain text for demo only — do NOT do this in production
}
