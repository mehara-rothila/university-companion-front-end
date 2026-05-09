export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  major?: string;
  year?: number;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  imageUrl?: string;
  provider?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JwtResponse {
  accessToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  imageUrl?: string;
  provider?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  major?: string;
  year?: number;
}
