import { z, ZodType } from "zod";

export function validateArgs<T>(schema: ZodType<T>, args: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(args);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  return { success: false, error: issues.join("; ") };
}

export function validateReturn<T>(schema: ZodType<T>, value: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: `invalid return: ${result.error.message}` };
}


