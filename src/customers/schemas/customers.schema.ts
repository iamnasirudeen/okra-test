import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MSchema, Types } from 'mongoose';

export type CustomersDocument = Customers & Document;

@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class Customers {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'Auth' })
  authId: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: Number, required: true })
  bvn: number;

  @Prop({ type: Number, required: true })
  phone: number;
}

export const CustomersSchema = SchemaFactory.createForClass(Customers);
