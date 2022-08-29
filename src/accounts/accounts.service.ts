import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Accounts, AccountsDocument } from './schemas/accounts.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Accounts.name)
    private readonly accountsModel: Model<AccountsDocument>,
  ) {}

  async createAccount(customerId, accounts: Array<any>) {
    accounts.map(async (account) => {
      await this.accountsModel.updateOne(
        { ...account, customerId },
        { ...account, customerId },
        { upsert: true },
      );
    });
  }

  async findByAccountType(accountType: string) {
    return await this.accountsModel.findOne({ accountType });
  }
}
