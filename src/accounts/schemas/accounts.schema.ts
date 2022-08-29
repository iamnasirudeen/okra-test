import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MSchema } from 'mongoose';

export enum EAccountTypes {
  'SAVINGS',
  'CREDIT_CARD',
}

export type AccountsDocument = Accounts & Document;

@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class Accounts {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'Customers' })
  customerId: Types.ObjectId;

  @Prop({ type: String, required: true })
  accountTitle: string;

  @Prop({ type: String })
  currency: string;

  @Prop({ type: String, required: true, enum: EAccountTypes })
  accountType: 'SAVINGS' | 'CREDIT_CARD';

  @Prop({ type: Number, required: true })
  mainBalance: number;

  @Prop({ type: Number, required: true })
  ledgerBalance: number;
}

export const AccountsSchema = SchemaFactory.createForClass(Accounts);
