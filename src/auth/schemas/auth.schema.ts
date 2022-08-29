import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class Auth {
  @Prop({ type: String, required: true, default: process.env.AUTH_EMAIL })
  email: string;

  @Prop({ type: String, required: true, default: process.env.AUTH_PASSWORD })
  password: string;

  @Prop({ type: String, required: true, default: process.env.AUTH_OTP })
  OTP: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
