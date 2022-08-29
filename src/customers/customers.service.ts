import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customers, CustomersDocument } from './schemas/customers.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customers.name)
    private readonly customersModel: Model<CustomersDocument>,
  ) {}

  async createCutomer(payload: CreateCustomerDto): Promise<string> {
    let customerId: string;
    const customerExist = await this.customersModel.findOne({
      email: payload.email,
    });
    customerId = customerExist?.id;
    if (!customerExist) {
      const newCustomer = await this.customersModel.create(payload);
      customerId = newCustomer.id;
    }
    return customerId;
  }
}
