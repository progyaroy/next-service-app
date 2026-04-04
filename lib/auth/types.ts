export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: number;
};
