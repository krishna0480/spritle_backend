export class Token {
    id: number;
    token: string;
    userId: number;
    revoked: boolean;
    createdAt: Date;
    updatedAt: Date;
  
    constructor(token: string, userId: number) {
      this.token = token;
      this.userId = userId;
      this.revoked = false;
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
  }
