import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { AccountsService } from './accounts/accounts.service';
import { CustomersService } from './customers/customers.service';
import { TransactionsService } from './transactions/transactions.service';

@Injectable()
export class AppService {
  private pageInstance: puppeteer.Page;
  private customerId: string;

  constructor(
    private readonly customersService: CustomersService,
    private readonly accountsService: AccountsService,
    private readonly transactionService: TransactionsService,
  ) {}

  async getBrowserInstance(): Promise<puppeteer.Browser> {
    return await puppeteer.launch({
      headless: process.env.HEADLESS as unknown as boolean,
    });
  }

  async getPageInstance(): Promise<any> {
    const browser = await this.getBrowserInstance();
    this.pageInstance = await browser.newPage();
  }

  async signIn(email: string, password: string): Promise<void> {
    const page = this.pageInstance;
    page.on('dialog', async (dialog: puppeteer.Dialog) => {
      await dialog.dismiss();
    });

    await page.goto('https://bankof.okra.ng/login');
    const emailField = await page.$('#email');
    const passwordField = await page.$('#password');
    await emailField.type(email);
    await passwordField.type(password);
    const signInBtn = await page.$('button');
    await signInBtn.click();
  }

  async validateOtp(otp: string) {
    const page = this.pageInstance;
    await page.waitForSelector('#otp', { visible: true });
    const otpField = await page.$('#otp');
    await otpField.type(otp);
    const signInBtn = await page.$('button');
    await signInBtn.click();
  }

  async scrapeCustomerProfile() {
    const page = this.pageInstance;
    await page.waitForSelector('section.flex', { visible: true });
    await page.waitForSelector('h1.text-2xl.font-semibold.text-gray-800', {
      visible: true,
    });
    let fullName = (
      await page.$eval(
        'h1.text-2xl.font-semibold.text-gray-800',
        (element) => element.textContent,
      )
    )
      .split(' ')
      .splice(2)
      .join(' ');
    fullName = fullName.substring(0, fullName.length - 1);
    const customerDetails = await page.$$eval(
      'p.text-default.my-3',
      (elements) => elements.map((element) => element.textContent),
    );

    const parsedCustomerDetails = customerDetails.map((data) =>
      this.parseCustomerInfo(data),
    );

    const payload = Object.assign({ fullName }, ...parsedCustomerDetails);
    const customerId = await this.customersService.createCutomer(payload);
    this.customerId = customerId;
  }

  async scrapeAccounts() {
    const page = this.pageInstance;

    const accountInfo = await page.evaluate(async () => {
      const accountSections = document.querySelectorAll('section.flex');
      const accounts = [];
      accountSections.forEach((acctSection) => {
        const accountType = acctSection.querySelector('h3').textContent;
        const mainBalance = acctSection.querySelector(
          'p.text-4xl.my-2.font-bold',
        ).textContent;
        const ledgerBalance = acctSection.querySelector(
          'section div.w-full.flex-1',
        ).lastChild.textContent;

        accounts.push({ accountType, mainBalance, ledgerBalance });
      });
      return accounts;
    });

    const parsedAccounts = accountInfo.map((account) =>
      this.parseAccountDetails(account),
    );
    await this.accountsService.createAccount(this.customerId, parsedAccounts);
  }

  private async viewSingleAccountTransaction(index: number) {
    const page = this.pageInstance;
    const accountSection = (await page.$$('section.flex'))[index];
    const linkTag = await accountSection.$('a');
    await linkTag.click();
    await page.waitForSelector('section div table', { visible: true });
  }

  private async scrapeSingleAccountTransaction(index: number) {
    const page = this.pageInstance;

    const accountSection = (await page.$$('section.flex'))[index];
    const accountType = this.parseAccountType(
      await accountSection.$eval('h3', (element) => element.textContent),
    );
    await this.viewSingleAccountTransaction(index);
    const tableHeads = await page.evaluate(() => {
      return [
        ...document
          .querySelector('section div table thead tr')
          .querySelectorAll('th'),
      ].map((data) => data.textContent);
    });

    const tableBody = await page.evaluate(() => {
      const bodyElement = document.querySelector('section div table tbody');
      /**
       * I can solve this in multiple ways
       * I can choose to return all `tr` with data and those without and run an
       * array filter to remove empty arrays. But for the sake of this test, I'll use the
       * `bg-white` class to select those with data.
       */
      const tr = [...bodyElement.querySelectorAll('tr.bg-white')].map(
        (element) => {
          const transactionType = element.querySelector('th').textContent;

          const mergedTr = [transactionType];

          const trValues = [...element.querySelectorAll('td')].map(
            (td) => td.textContent,
          );

          mergedTr.push(...trValues);

          return mergedTr;
        },
      );

      return tr;
    });

    const formattedData = this.parseTableData(
      tableHeads,
      tableBody,
      accountType,
    );

    // this shouldnt be here if you'll be implementing pagination
    await page.goBack();
    return formattedData;
  }

  async scrapeTransactions() {
    const page = this.pageInstance;
    const accountList = await page.$$('section.flex');
    const allTransactions = await Promise.all(
      accountList.map(async (account, index) => {
        return {
          [this.parseAccountType(
            await account.$eval('h3', (element) => element.textContent),
          )]: await this.scrapeSingleAccountTransaction(index),
        };
      }),
    );

    await this.transactionService.createTransaction(allTransactions);
  }

  async logout() {
    const page = this.pageInstance;
    await page.evaluateHandle(() => {
      const element = document.querySelectorAll('a.no-underline.font-bold')[1];
      // @ts-ignore
      element.click();
    });
  }

  async runActions() {
    await this.getPageInstance();
    const email = process.env.AUTH_EMAIL;
    const password = process.env.AUTH_PASSWORD;
    const OTP = process.env.AUTH_OTP;
    await this.signIn(email, password);
    await this.validateOtp(OTP);
    await this.scrapeCustomerProfile();
    await this.scrapeAccounts();
    await this.scrapeTransactions();
    await this.logout();

    // Close browser window
    await (await this.getBrowserInstance()).close();
  }

  private parseTableData(
    tableHead: string[],
    tableBody: Array<string[]>,
    accountType: string,
  ) {
    const parsedData = [];
    tableBody.map((tableData) => {
      const mergedObject = {};
      tableData.map(
        (data, index) => (mergedObject[tableHead[index].toLowerCase()] = data),
      );
      parsedData.push(mergedObject);
    });

    return parsedData.map((data) => {
      return {
        ...data,
        clearedDate: data['cleared date'],
        amount: parseFloat(data.amount.substring(1)),
        currency: data.amount.charAt(0),
        type: data.type.toUpperCase(),
        accountType,
      };
    });
  }

  private parseAccountType(rawAccountValue) {
    rawAccountValue = rawAccountValue.split(' ');
    const parsedAccountType = rawAccountValue
      .splice(0, rawAccountValue.length - 1)
      .join('_')
      .toUpperCase();
    return parsedAccountType;
  }

  private parseAccountDetails(data: {
    accountType: string;
    mainBalance: string;
    ledgerBalance: string;
  }) {
    const parsedData = {
      accountType: this.parseAccountType(data.accountType),
      currency: data.mainBalance.split(' ')[0],
      mainBalance: parseFloat(data.mainBalance.split(' ')[1]),
      ledgerBalance: parseFloat(data.ledgerBalance.split(' ')[1]),
    };
    return parsedData;
  }

  private parseCustomerInfo(data: string) {
    const splittedElement = data.split(':');
    return {
      [splittedElement[0].toLowerCase()]: splittedElement[1].trim(),
    };
  }

  /**
   * @todo, work on pagination,
   * taking too much time so had to skip.
   *
   */
  // private async scrapePaginatedTransactions(index: number) {
  //   const page = this.pageInstance;
  //   await this.viewSingleAccountTransaction(index);
  //   const paginationSection = (
  //     await page.$$('div.flex.flex-col.items-center')
  //   )[1];

  //   const paginationCountArea = await paginationSection.$('span');
  //   const totalDocumentRaw = (await paginationCountArea.$$('span'))[2];
  //   const totalDocument = parseInt(
  //     await totalDocumentRaw.evaluate((value) => value.textContent),
  //   );
  //   const paginationSectionButtons = await paginationSection.$('div');
  //   const nextBtn = (await paginationSectionButtons.$$('button'))[1];

  //   const allTransactions = [];
  //   const pages = Math.round(totalDocument / 10);

  //   console.log({ totalDocument, pages });

  //   for (let i = 0; i < pages; i++) {
  //     const accountTransaction = await this.scrapeSingleAccountTransaction(
  //       index,
  //     );
  //     allTransactions.push(accountTransaction);
  //     await nextBtn.click();
  //     await page.waitForSelector('section div table', { visible: true });
  //   }

  //   //await page.goBack();
  //   return allTransactions;
  // }
}
