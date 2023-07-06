import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema({
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Cat {
  @Prop({ required: true })
  id: string;

  @Prop()
  path: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
