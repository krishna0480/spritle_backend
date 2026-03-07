import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/product.schema';
import mongoose from 'mongoose';
import { deleteProduct, getProduct, getProducts, postProduct, putProduct } from './product.controller';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


@Injectable()
export class ProductService {


    constructor(
    @InjectModel(Product.name)
        private productModel: mongoose.Model<Product>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    
    async findAll(token:string): Promise<getProducts | string> {
        const products = await this.productModel.find()
         
        const invalid = await this.invalidateToken(token);
        
        console.log(invalid,"invalid")
  
      if (invalid) {
        throw new UnauthorizedException('Token invalid');
      } else {
        return {
            status: "Success",
            isSuccess: true,
            message:"got all item",
            data:products
        };
      }
        
    }

    async create(product: Product): Promise<postProduct>{
        const {   title, desc ,id, price } = product;
        const res = await this.productModel.create({
            title, desc ,id, price 
        })
        return {
            status: "Success",
            isSuccess: true,
            message:"updated the item",
            data:res
        }
    }

    async findById(id: string): Promise<getProduct>{
        const product = await this.productModel.findById(id)
        if (!product) {
            throw new NotFoundException('Product not found')
        }
        return {
            status: "Success",
            isSuccess: true,
            message:"got the item",
            data:product
        };
    }

    async updateById(id: string, product:Product): Promise<putProduct>{

      const update =  await this.productModel.findByIdAndUpdate(id, product,{
            new: true,
            runValidators: true,
       });
        
        return {
            status: "Success",
            isSuccess: true,
            message:"updated",
            data:update
        }
    }

    async deleteById(id: string): Promise<deleteProduct>{
        const deleteData =  await this.productModel.findByIdAndDelete(id);

        return {
            status: "Success",
            isSuccess: true,
            message:"deleted",
            data:deleteData
        }
    }

    // private async invalidateToken(token: string): Promise<boolean> {
    //     const tokenJson = await this.cacheManager.get(`${token}`);
    //     console.dir(tokenJson, { depth: null });
    //     if(tokenJson !== undefined) return true
    //     else return false // If tokenJson is undefined, token is invalid
    // }

    private async invalidateToken(token: string): Promise<boolean> {
        try {
          const tokenJson = await this.cacheManager.get(`${token}`);
          console.dir(tokenJson, { depth: null });
          if (tokenJson!== undefined) return true
          else return false // If tokenJson is undefined, token is invalid
        } catch (error) {
          console.error('Error invalidating token:', error);
          return false;
        }
      }
   

}
