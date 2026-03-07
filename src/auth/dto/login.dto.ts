import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"

export class Logindto {
    @IsNotEmpty()
    @IsEmail({}, { message: 'please enter correct emailId' })
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly password: string;

}