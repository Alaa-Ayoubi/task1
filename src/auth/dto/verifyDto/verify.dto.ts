import { IsNotEmpty } from 'class-validator';

export class VerifyDto {
    @IsNotEmpty()
    token: string;
}