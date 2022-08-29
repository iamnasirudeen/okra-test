import { Types } from 'mongoose';

export class CreateCustomerDto {
  authId: Types.ObjectId;

  email: string;

  fullName: string;

  address: string;

  btn: string;

  phone: string;
}
