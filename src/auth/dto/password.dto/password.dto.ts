import { IsEmail, IsNotEmpty } from "class-validator";

export class PasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
  }