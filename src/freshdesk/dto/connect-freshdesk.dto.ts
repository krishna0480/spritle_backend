import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectFreshdeskDto {

  @IsNotEmpty()
  @IsString()
  readonly apiKey: string;

  @IsNotEmpty()
  @IsString()
  readonly domain: string;
}