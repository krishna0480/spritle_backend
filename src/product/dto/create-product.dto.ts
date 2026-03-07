import { IsNotEmpty, isString } from "class-validator";


export class CreateProductDto{

    @IsNotEmpty()
    readonly title: string;

    @IsNotEmpty()
    readonly desc: string;

    @IsNotEmpty()
    readonly id: string;

    @IsNotEmpty()
    readonly price: number;
}