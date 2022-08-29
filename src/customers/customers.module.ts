import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersService } from './customers.service';
import { Customers, CustomersSchema } from './schemas/customers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customers.name, schema: CustomersSchema },
    ]),
  ],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
