import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service';
import {
  Transactions,
  TransactionsDocument,
} from './schemas/transactions.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transactions.name)
    private readonly transactionsModel: Model<TransactionsDocument>,
    private readonly accountsService: AccountsService,
  ) {}

  async createTransaction(transactions): Promise<void> {
    await Promise.all(
      transactions.map(async (transaction) => {
        const accountType = Object.keys(transaction)[0];
        const values = Object.values(transaction);
        const accountId = await this.accountsService.findByAccountType(
          accountType,
        );

        await Promise.all(
          values.map((value: any) =>
            value.map(async (data: any) => {
              await this.transactionsModel.create({
                ...data,
                accountId: accountId.id,
                customerId: accountId.customerId,
              });
            }),
          ),
        );
      }),
    );
  }
}
