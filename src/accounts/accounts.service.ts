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

  createAccount() {}
}
