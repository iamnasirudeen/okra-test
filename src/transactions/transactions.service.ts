import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transactions,
  TransactionsDocument,
} from './schemas/transactions.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transactions.name)
    private readonly transactionsService: Model<TransactionsDocument>,
  ) {}
}
