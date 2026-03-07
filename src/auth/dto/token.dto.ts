export class TokenDto {
  id: number;
  token: string;
  userId: number;
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateTokenDto {
  token: string;
  userId: number;
}

export class UpdateTokenDto {
  revoked: boolean;
}