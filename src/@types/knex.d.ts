import 'knex';

declare module 'knex/types/tables' {
  interface Meal {
    name: string;
    userId: string;
    description: string;
    mealDateTime: string;
    isIncludedOnDiet: boolean;
  }

  interface User {
    id: string;
    name: string;
    created_at: string;
  }

  interface Tables {
    users: User;
    meals: Meal;
  }
}
