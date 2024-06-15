import { z } from 'zod';

export const newMealBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  meal_date_time: z.string().datetime(),
  is_included_on_diet: z.boolean(),
  user_id: z.string().uuid(),
});

export const mealParamSchema = z.object({
  id: z.string().uuid(),
});

export const mealQuerySchema = z.object({
  user_id: z.string().uuid(),
});

export const updateMealBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  meal_date_time: z.string().datetime().optional(),
  is_included_on_diet: z.boolean().or(z.number()).optional(),
});
