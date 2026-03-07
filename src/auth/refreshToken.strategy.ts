import {  Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PassportStrategy } from "@nestjs/passport";
import { Model } from "mongoose";
import {Strategy,ExtractJwt} from "passport-jwt"
import { User } from "./schemas/user.schema";
import { Request } from "express";


@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy,'jwt-refresh') {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
       
    ) {
        super({
            jwtFromRequest:  ExtractJwt.fromHeader('refresh'),
            secretOrKey: process.env.JWT_SECRET,
            ignoreExpiration: false,
        })
    }

    async validate(payload: any) {
        
        const { id } = payload;
        const user = await this.userModel.findById(id);
        // const refreshToken = req.get('Authorization').replace('Bearer', '').trim();

        if (!user) {
            throw new UnauthorizedException('Login first to accesss the products')
        }

        console.log(user,"found")
        
        return { payload };
    }
    
};