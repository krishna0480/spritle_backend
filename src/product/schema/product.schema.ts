import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps:true
})

export class Product{
    
    @Prop()
    title: string;

    @Prop()
    desc: string;

    @Prop()
    id: string;

    @Prop()
    price: number;
}

export const schemaProduct = SchemaFactory.createForClass(Product)