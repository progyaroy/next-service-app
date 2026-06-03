export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role: UserRole;
  createdAt: number;
};
