import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import { IUser } from './user.interface';

@Injectable()
export class UsersService {
  private users: IUser[] = [];
  private nextId = 1;

  getUsers({ page = 1, take = 30, gender, email }: UserQueryDto): IUser[] {
    const normalizedGender = gender?.toLowerCase();
    const normalizedEmail = email?.toLowerCase();

    const filteredUsers = this.users.filter((user) => {
      if (normalizedGender === undefined && normalizedEmail === undefined) {
        return true;
      }

      const matchesGender =
        normalizedGender !== undefined &&
        user.gender.toLowerCase() === normalizedGender;
      const matchesEmail =
        normalizedEmail !== undefined &&
        user.email.toLowerCase().startsWith(normalizedEmail);

      return matchesGender || matchesEmail;
    });

    const startIndex = (page - 1) * take;

    return filteredUsers.slice(startIndex, startIndex + take);
  }

  createUser(createUserDto: CreateUserDto): IUser {
    const newUser: IUser = {
      id: this.nextId++,
      ...createUserDto,
    };

    this.users.push(newUser);
    return newUser;
  }

  getUserById(userId: number): IUser {
    const user = this.users.find((item) => item.id === userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  deleteUserById(userId: number): IUser {
    const index = this.users.findIndex((item) => item.id === userId);

    if (index === -1) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const [deletedUser] = this.users.splice(index, 1);
    return deletedUser;
  }

  updateUserById(userId: number, updateUserDto: UpdateUserDto): IUser {
    const index = this.users.findIndex((item) => item.id === userId);

    if (index === -1) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    this.users[index] = {
      ...this.users[index],
      ...updateUserDto,
    };

    return this.users[index];
  }
}
