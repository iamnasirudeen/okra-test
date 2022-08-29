import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MSchema } from 'mongoose';

export enum ETransactionType {
  'CREDIT',
  'DEBIT',
}

export type TransactionsDocument = Transactions & Document;

@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class Transactions {
  @Prop({ type: MSchema.Types.ObjectId, ref: 'Customers' })
  customerId: Types.ObjectId;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'Accounts' })
  accountId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ETransactionType })
  type: 'CREDIT' | 'DEBIT';

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  beneficiary: string;

  @Prop({ type: String, required: true })
  sender: string;

  @Prop({ type: Date, default: Date.now() })
  clearedDate: Date;
}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
