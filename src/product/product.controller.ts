import { Body, Controller, Delete, Get, Header, Headers, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './schema/product.schema';
import { AuthGuard } from '@nestjs/passport';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guards';
import { Request } from 'express';
import { RefreshJwtGuard } from 'src/auth/guards/refresh-auth.guards';


export interface getProducts {
    status: string,
    isSuccess: boolean,
    message:string,
    data:Product[]
}

export interface getProduct {
    status: string,
    isSuccess: boolean,
    message:string,
    data:Product
}


export interface postProduct {
    status: string,
    isSuccess: boolean,
    message:string,
    data: Product
}

export interface putProduct {
    status: string,
    isSuccess: boolean,
    message:string,
    data:Product
}


export interface deleteProduct {
    status: string,
    isSuccess: boolean,
    message:string,
    data:Product
}

@Controller('product')
export class ProductController {

    constructor(
        private productService: ProductService
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard,RefreshJwtGuard)
    @Header("Authorization","application/json")
    async getAllProducts(@Req() req:Request,@Headers() headers: Record<string, string>): Promise<getProducts | string>{
        
        const token: string = req.headers.authorization.replace('Bearer ', '');
        
        console.log(token)
        return this.productService.findAll(token)
    }

    @Post()
    @UseGuards(JwtAuthGuard,RefreshJwtGuard)
    async createProduct(
        @Body()
        product:CreateProductDto,
    ): Promise<postProduct>{
        return this.productService.create(product)
    }

    @Post(":id")
    @UseGuards(AuthGuard())
    async getProduct(
        @Param('id')
        id: string,): Promise<getProduct>{
        return this.productService.findById(id)
    }

    @Post(":id")
    @UseGuards(AuthGuard())
    async updateProduct(
        @Param('id')
        id:string,
        @Body()
        product: UpdateProductDto,
    ): Promise<putProduct>{
        return this.productService.updateById(id,product)
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard,RefreshJwtGuard)
    async deleteProduct(
        @Param('id')
        id: string): Promise<deleteProduct>{
        return this.productService.deleteById(id)
    }

}
