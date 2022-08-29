import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsService } from './accounts.service';
import { Accounts, AccountsSchema } from './schemas/accounts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accounts.name, schema: AccountsSchema },
    ]),
  ],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
