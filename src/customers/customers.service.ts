import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customers, CustomersDocument } from './schemas/customers.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customers.name)
    private readonly customersModel: Model<CustomersDocument>,
  ) {}
}
