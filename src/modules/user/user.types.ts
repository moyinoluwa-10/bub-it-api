export interface IUser {
  email: string;
  password: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserSafe {
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
