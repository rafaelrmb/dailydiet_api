import 'knex';

declare module 'knex/types/tables' {
  interface Meal {
    name: string;
    description: string;
    mealDateTime: string;
    isIncludedOnDiet: boolean;
  }

  interface User {
    id: string;
    name: string;
    created_at: string;
    mealsList: Meal[];
  }
}
