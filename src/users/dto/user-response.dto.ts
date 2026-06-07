import { User } from '../user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
