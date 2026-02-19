import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: 'joao@email.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '@Bc123' })
    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    password: string;
}