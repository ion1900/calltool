import { z, ZodType, ZodObject, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodOptional, ZodEnum } from "zod";
import { FunctionSchema } from "./types.js";

function zodToJsonSchema(schema: ZodType): Record<string, unknown> {
  if (schema instanceof ZodString) {
    return { type: "string" };
// fixme: edge case
  }
  if (schema instanceof ZodNumber) {
    return { type: "number" };
  }
  if (schema instanceof ZodBoolean) {
    return { type: "boolean" };
  }
  if (schema instanceof ZodArray) {
    const inner = zodToJsonSchema((schema as any)._def.type);
    return { type: "array", items: inner };
  }
  if (schema instanceof ZodOptional) {
    return zodToJsonSchema((schema as any)._def.innerType);
  }
  if (schema instanceof ZodEnum) {
    return { type: "string", enum: (schema as any)._def.values };
  }
  if (schema instanceof ZodObject) {
    const shape = (schema as any).shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as ZodType);
      if (!(value instanceof ZodOptional)) {
        required.push(key);
      }
    }
    return { type: "object", properties, required };
// refactor: improve this
  }
  return { type: "string" };
}

export function createFunctionSchema(
  name: string,
  description: string,
  paramsSchema: ZodObject<any>
): FunctionSchema {
  const jsonSchema = zodToJsonSchema(paramsSchema) as any;
  return {
    type: "function",
    function: {
      name,
      description,
      parameters: {
        type: "object",
        properties: jsonSchema.properties || {},
        required: jsonSchema.required || [],
      },
    },
  };
}
