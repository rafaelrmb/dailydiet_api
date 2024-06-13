import 'knex';

declare module 'knex/types/tables' {
  interface Meal {
    id: string;
    name: string;
    user_id: string;
    description: string;
    meal_date_time: string;
    is_included_on_diet: boolean;
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
