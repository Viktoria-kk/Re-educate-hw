import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ExpenseQueryDto } from './dtos/expense-query.dto';
import { UpdateExpenseDto } from './dtos/update-expense.dto';
import { IExpense } from './expense.interface';

@Injectable()
export class ExpensesService {
  private expenses: IExpense[] = [
    {
      id: 1,
      category: 'food',
      productName: 'Expense 1',
      quantity: 1,
      price: 87,
      totalPrice: 87,
    },
    {
      id: 2,
      category: 'sport',
      productName: 'Expense 2',
      quantity: 1,
      price: 124,
      totalPrice: 124,
    },
    {
      id: 3,
      category: 'technic',
      productName: 'Expense 3',
      quantity: 1,
      price: 161,
      totalPrice: 161,
    },
    {
      id: 4,
      category: 'travel',
      productName: 'Expense 4',
      quantity: 1,
      price: 198,
      totalPrice: 198,
    },
    {
      id: 5,
      category: 'shopping',
      productName: 'Expense 5',
      quantity: 1,
      price: 235,
      totalPrice: 235,
    },
    {
      id: 6,
      category: 'food',
      productName: 'Expense 6',
      quantity: 1,
      price: 272,
      totalPrice: 272,
    },
    {
      id: 7,
      category: 'sport',
      productName: 'Expense 7',
      quantity: 1,
      price: 309,
      totalPrice: 309,
    },
    {
      id: 8,
      category: 'technic',
      productName: 'Expense 8',
      quantity: 1,
      price: 346,
      totalPrice: 346,
    },
    {
      id: 9,
      category: 'travel',
      productName: 'Expense 9',
      quantity: 1,
      price: 383,
      totalPrice: 383,
    },
    {
      id: 10,
      category: 'shopping',
      productName: 'Expense 10',
      quantity: 1,
      price: 420,
      totalPrice: 420,
    },
    {
      id: 11,
      category: 'food',
      productName: 'Expense 11',
      quantity: 1,
      price: 457,
      totalPrice: 457,
    },
    {
      id: 12,
      category: 'sport',
      productName: 'Expense 12',
      quantity: 1,
      price: 494,
      totalPrice: 494,
    },
    {
      id: 13,
      category: 'technic',
      productName: 'Expense 13',
      quantity: 1,
      price: 531,
      totalPrice: 531,
    },
    {
      id: 14,
      category: 'travel',
      productName: 'Expense 14',
      quantity: 1,
      price: 568,
      totalPrice: 568,
    },
    {
      id: 15,
      category: 'shopping',
      productName: 'Expense 15',
      quantity: 1,
      price: 605,
      totalPrice: 605,
    },
    {
      id: 16,
      category: 'food',
      productName: 'Expense 16',
      quantity: 1,
      price: 642,
      totalPrice: 642,
    },
    {
      id: 17,
      category: 'sport',
      productName: 'Expense 17',
      quantity: 1,
      price: 679,
      totalPrice: 679,
    },
    {
      id: 18,
      category: 'technic',
      productName: 'Expense 18',
      quantity: 1,
      price: 716,
      totalPrice: 716,
    },
    {
      id: 19,
      category: 'travel',
      productName: 'Expense 19',
      quantity: 1,
      price: 753,
      totalPrice: 753,
    },
    {
      id: 20,
      category: 'shopping',
      productName: 'Expense 20',
      quantity: 1,
      price: 790,
      totalPrice: 790,
    },
    {
      id: 21,
      category: 'food',
      productName: 'Expense 21',
      quantity: 1,
      price: 827,
      totalPrice: 827,
    },
    {
      id: 22,
      category: 'sport',
      productName: 'Expense 22',
      quantity: 1,
      price: 864,
      totalPrice: 864,
    },
    {
      id: 23,
      category: 'technic',
      productName: 'Expense 23',
      quantity: 1,
      price: 901,
      totalPrice: 901,
    },
    {
      id: 24,
      category: 'travel',
      productName: 'Expense 24',
      quantity: 1,
      price: 938,
      totalPrice: 938,
    },
    {
      id: 25,
      category: 'shopping',
      productName: 'Expense 25',
      quantity: 1,
      price: 975,
      totalPrice: 975,
    },
    {
      id: 26,
      category: 'food',
      productName: 'Expense 26',
      quantity: 1,
      price: 62,
      totalPrice: 62,
    },
    {
      id: 27,
      category: 'sport',
      productName: 'Expense 27',
      quantity: 1,
      price: 99,
      totalPrice: 99,
    },
    {
      id: 28,
      category: 'technic',
      productName: 'Expense 28',
      quantity: 1,
      price: 136,
      totalPrice: 136,
    },
    {
      id: 29,
      category: 'travel',
      productName: 'Expense 29',
      quantity: 1,
      price: 173,
      totalPrice: 173,
    },
    {
      id: 30,
      category: 'shopping',
      productName: 'Expense 30',
      quantity: 1,
      price: 210,
      totalPrice: 210,
    },
    {
      id: 31,
      category: 'food',
      productName: 'Expense 31',
      quantity: 1,
      price: 247,
      totalPrice: 247,
    },
    {
      id: 32,
      category: 'sport',
      productName: 'Expense 32',
      quantity: 1,
      price: 284,
      totalPrice: 284,
    },
    {
      id: 33,
      category: 'technic',
      productName: 'Expense 33',
      quantity: 1,
      price: 321,
      totalPrice: 321,
    },
    {
      id: 34,
      category: 'travel',
      productName: 'Expense 34',
      quantity: 1,
      price: 358,
      totalPrice: 358,
    },
    {
      id: 35,
      category: 'shopping',
      productName: 'Expense 35',
      quantity: 1,
      price: 395,
      totalPrice: 395,
    },
    {
      id: 36,
      category: 'food',
      productName: 'Expense 36',
      quantity: 1,
      price: 432,
      totalPrice: 432,
    },
    {
      id: 37,
      category: 'sport',
      productName: 'Expense 37',
      quantity: 1,
      price: 469,
      totalPrice: 469,
    },
    {
      id: 38,
      category: 'technic',
      productName: 'Expense 38',
      quantity: 1,
      price: 506,
      totalPrice: 506,
    },
    {
      id: 39,
      category: 'travel',
      productName: 'Expense 39',
      quantity: 1,
      price: 543,
      totalPrice: 543,
    },
    {
      id: 40,
      category: 'shopping',
      productName: 'Expense 40',
      quantity: 1,
      price: 580,
      totalPrice: 580,
    },
    {
      id: 41,
      category: 'food',
      productName: 'Expense 41',
      quantity: 1,
      price: 617,
      totalPrice: 617,
    },
    {
      id: 42,
      category: 'sport',
      productName: 'Expense 42',
      quantity: 1,
      price: 654,
      totalPrice: 654,
    },
    {
      id: 43,
      category: 'technic',
      productName: 'Expense 43',
      quantity: 1,
      price: 691,
      totalPrice: 691,
    },
    {
      id: 44,
      category: 'travel',
      productName: 'Expense 44',
      quantity: 1,
      price: 728,
      totalPrice: 728,
    },
    {
      id: 45,
      category: 'shopping',
      productName: 'Expense 45',
      quantity: 1,
      price: 765,
      totalPrice: 765,
    },
    {
      id: 46,
      category: 'food',
      productName: 'Expense 46',
      quantity: 1,
      price: 802,
      totalPrice: 802,
    },
    {
      id: 47,
      category: 'sport',
      productName: 'Expense 47',
      quantity: 1,
      price: 839,
      totalPrice: 839,
    },
    {
      id: 48,
      category: 'technic',
      productName: 'Expense 48',
      quantity: 1,
      price: 876,
      totalPrice: 876,
    },
    {
      id: 49,
      category: 'travel',
      productName: 'Expense 49',
      quantity: 1,
      price: 913,
      totalPrice: 913,
    },
    {
      id: 50,
      category: 'shopping',
      productName: 'Expense 50',
      quantity: 1,
      price: 950,
      totalPrice: 950,
    },
    {
      id: 51,
      category: 'food',
      productName: 'Expense 51',
      quantity: 1,
      price: 987,
      totalPrice: 987,
    },
    {
      id: 52,
      category: 'sport',
      productName: 'Expense 52',
      quantity: 1,
      price: 74,
      totalPrice: 74,
    },
    {
      id: 53,
      category: 'technic',
      productName: 'Expense 53',
      quantity: 1,
      price: 111,
      totalPrice: 111,
    },
    {
      id: 54,
      category: 'travel',
      productName: 'Expense 54',
      quantity: 1,
      price: 148,
      totalPrice: 148,
    },
    {
      id: 55,
      category: 'shopping',
      productName: 'Expense 55',
      quantity: 1,
      price: 185,
      totalPrice: 185,
    },
    {
      id: 56,
      category: 'food',
      productName: 'Expense 56',
      quantity: 1,
      price: 222,
      totalPrice: 222,
    },
    {
      id: 57,
      category: 'sport',
      productName: 'Expense 57',
      quantity: 1,
      price: 259,
      totalPrice: 259,
    },
    {
      id: 58,
      category: 'technic',
      productName: 'Expense 58',
      quantity: 1,
      price: 296,
      totalPrice: 296,
    },
    {
      id: 59,
      category: 'travel',
      productName: 'Expense 59',
      quantity: 1,
      price: 333,
      totalPrice: 333,
    },
    {
      id: 60,
      category: 'shopping',
      productName: 'Expense 60',
      quantity: 1,
      price: 370,
      totalPrice: 370,
    },
    {
      id: 61,
      category: 'food',
      productName: 'Expense 61',
      quantity: 1,
      price: 407,
      totalPrice: 407,
    },
    {
      id: 62,
      category: 'sport',
      productName: 'Expense 62',
      quantity: 1,
      price: 444,
      totalPrice: 444,
    },
    {
      id: 63,
      category: 'technic',
      productName: 'Expense 63',
      quantity: 1,
      price: 481,
      totalPrice: 481,
    },
    {
      id: 64,
      category: 'travel',
      productName: 'Expense 64',
      quantity: 1,
      price: 518,
      totalPrice: 518,
    },
    {
      id: 65,
      category: 'shopping',
      productName: 'Expense 65',
      quantity: 1,
      price: 555,
      totalPrice: 555,
    },
    {
      id: 66,
      category: 'food',
      productName: 'Expense 66',
      quantity: 1,
      price: 592,
      totalPrice: 592,
    },
    {
      id: 67,
      category: 'sport',
      productName: 'Expense 67',
      quantity: 1,
      price: 629,
      totalPrice: 629,
    },
    {
      id: 68,
      category: 'technic',
      productName: 'Expense 68',
      quantity: 1,
      price: 666,
      totalPrice: 666,
    },
    {
      id: 69,
      category: 'travel',
      productName: 'Expense 69',
      quantity: 1,
      price: 703,
      totalPrice: 703,
    },
    {
      id: 70,
      category: 'shopping',
      productName: 'Expense 70',
      quantity: 1,
      price: 740,
      totalPrice: 740,
    },
    {
      id: 71,
      category: 'food',
      productName: 'Expense 71',
      quantity: 1,
      price: 777,
      totalPrice: 777,
    },
    {
      id: 72,
      category: 'sport',
      productName: 'Expense 72',
      quantity: 1,
      price: 814,
      totalPrice: 814,
    },
    {
      id: 73,
      category: 'technic',
      productName: 'Expense 73',
      quantity: 1,
      price: 851,
      totalPrice: 851,
    },
    {
      id: 74,
      category: 'travel',
      productName: 'Expense 74',
      quantity: 1,
      price: 888,
      totalPrice: 888,
    },
    {
      id: 75,
      category: 'shopping',
      productName: 'Expense 75',
      quantity: 1,
      price: 925,
      totalPrice: 925,
    },
    {
      id: 76,
      category: 'food',
      productName: 'Expense 76',
      quantity: 1,
      price: 962,
      totalPrice: 962,
    },
    {
      id: 77,
      category: 'sport',
      productName: 'Expense 77',
      quantity: 1,
      price: 999,
      totalPrice: 999,
    },
    {
      id: 78,
      category: 'technic',
      productName: 'Expense 78',
      quantity: 1,
      price: 86,
      totalPrice: 86,
    },
    {
      id: 79,
      category: 'travel',
      productName: 'Expense 79',
      quantity: 1,
      price: 123,
      totalPrice: 123,
    },
    {
      id: 80,
      category: 'shopping',
      productName: 'Expense 80',
      quantity: 1,
      price: 160,
      totalPrice: 160,
    },
    {
      id: 81,
      category: 'food',
      productName: 'Expense 81',
      quantity: 1,
      price: 197,
      totalPrice: 197,
    },
    {
      id: 82,
      category: 'sport',
      productName: 'Expense 82',
      quantity: 1,
      price: 234,
      totalPrice: 234,
    },
    {
      id: 83,
      category: 'technic',
      productName: 'Expense 83',
      quantity: 1,
      price: 271,
      totalPrice: 271,
    },
    {
      id: 84,
      category: 'travel',
      productName: 'Expense 84',
      quantity: 1,
      price: 308,
      totalPrice: 308,
    },
    {
      id: 85,
      category: 'shopping',
      productName: 'Expense 85',
      quantity: 1,
      price: 345,
      totalPrice: 345,
    },
    {
      id: 86,
      category: 'food',
      productName: 'Expense 86',
      quantity: 1,
      price: 382,
      totalPrice: 382,
    },
    {
      id: 87,
      category: 'sport',
      productName: 'Expense 87',
      quantity: 1,
      price: 419,
      totalPrice: 419,
    },
    {
      id: 88,
      category: 'technic',
      productName: 'Expense 88',
      quantity: 1,
      price: 456,
      totalPrice: 456,
    },
    {
      id: 89,
      category: 'travel',
      productName: 'Expense 89',
      quantity: 1,
      price: 493,
      totalPrice: 493,
    },
    {
      id: 90,
      category: 'shopping',
      productName: 'Expense 90',
      quantity: 1,
      price: 530,
      totalPrice: 530,
    },
    {
      id: 91,
      category: 'food',
      productName: 'Expense 91',
      quantity: 1,
      price: 567,
      totalPrice: 567,
    },
    {
      id: 92,
      category: 'sport',
      productName: 'Expense 92',
      quantity: 1,
      price: 604,
      totalPrice: 604,
    },
    {
      id: 93,
      category: 'technic',
      productName: 'Expense 93',
      quantity: 1,
      price: 641,
      totalPrice: 641,
    },
    {
      id: 94,
      category: 'travel',
      productName: 'Expense 94',
      quantity: 1,
      price: 678,
      totalPrice: 678,
    },
    {
      id: 95,
      category: 'shopping',
      productName: 'Expense 95',
      quantity: 1,
      price: 715,
      totalPrice: 715,
    },
    {
      id: 96,
      category: 'food',
      productName: 'Expense 96',
      quantity: 1,
      price: 752,
      totalPrice: 752,
    },
    {
      id: 97,
      category: 'sport',
      productName: 'Expense 97',
      quantity: 1,
      price: 789,
      totalPrice: 789,
    },
    {
      id: 98,
      category: 'technic',
      productName: 'Expense 98',
      quantity: 1,
      price: 826,
      totalPrice: 826,
    },
    {
      id: 99,
      category: 'travel',
      productName: 'Expense 99',
      quantity: 1,
      price: 863,
      totalPrice: 863,
    },
    {
      id: 100,
      category: 'shopping',
      productName: 'Expense 100',
      quantity: 1,
      price: 900,
      totalPrice: 900,
    },
  ];
  private nextId = Math.max(...this.expenses.map((expense) => expense.id)) + 1;

  getExpenses({
    page = 1,
    take = 30,
    category,
    priceFrom,
    priceTo,
  }: ExpenseQueryDto): IExpense[] {
    if (
      priceFrom !== undefined &&
      priceTo !== undefined &&
      priceFrom > priceTo
    ) {
      throw new HttpException(
        'priceFrom cannot be greater than priceTo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const filteredExpenses = this.expenses.filter((expense) => {
      const matchesCategory =
        category === undefined ||
        expense.category.toLowerCase() === category.toLowerCase();
      const matchesPriceFrom =
        priceFrom === undefined || expense.price >= priceFrom;
      const matchesPriceTo = priceTo === undefined || expense.price <= priceTo;

      return matchesCategory && matchesPriceFrom && matchesPriceTo;
    });

    const startIndex = (page - 1) * take;

    return filteredExpenses.slice(startIndex, startIndex + take);
  }

  createExpense(createExpenseDto: CreateExpenseDto): IExpense {
    const newExpense: IExpense = {
      id: this.nextId++,
      ...createExpenseDto,
      totalPrice: createExpenseDto.quantity * createExpenseDto.price,
    };

    this.expenses.push(newExpense);
    return newExpense;
  }

  getExpenseById(expenseId: number): IExpense {
    const expense = this.expenses.find((item) => item.id === expenseId);

    if (!expense) {
      throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
    }

    return expense;
  }

  deleteExpenseById(expenseId: number): IExpense {
    const index = this.expenses.findIndex((item) => item.id === expenseId);

    if (index === -1) {
      throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
    }

    const [deletedExpense] = this.expenses.splice(index, 1);
    return deletedExpense;
  }

  updateExpenseById(
    expenseId: number,
    updateExpenseDto: UpdateExpenseDto,
  ): IExpense {
    const index = this.expenses.findIndex((item) => item.id === expenseId);

    if (index === -1) {
      throw new HttpException('Expense not found', HttpStatus.NOT_FOUND);
    }

    const updatedExpense = {
      ...this.expenses[index],
      ...updateExpenseDto,
    };

    updatedExpense.totalPrice = updatedExpense.quantity * updatedExpense.price;
    this.expenses[index] = updatedExpense;

    return this.expenses[index];
  }
}
