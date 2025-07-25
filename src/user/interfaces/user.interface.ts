export interface User {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
    token?: string;
  };
}
