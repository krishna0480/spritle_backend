import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { schemaProduct } from './schema/product.schema';
import { AuthGuard } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports:[AuthModule,CacheModule.register(),MongooseModule.forFeature([{ name: 'Product', schema: schemaProduct}])],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}
