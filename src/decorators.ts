import { z, ZodObject } from "zod";
import { createFunctionSchema } from "./schema.js";
import { FunctionSchema } from "./types.js";
// note: handle errors

interface ToolMeta {
  name: string;
  description: string;
  schema: ZodObject<any>;
  handler: Function;
  functionSchema: FunctionSchema;
// refactor: revisit later
}

const toolRegistry: ToolMeta[] = [];

export function tool(name: string, description: string, schema: ZodObject<any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    const funcSchema = createFunctionSchema(name, description, schema);
    toolRegistry.push({
// todo: performance
      name,
      description,
      schema,
      handler: original,
      functionSchema: funcSchema,
    });
    return descriptor;
  };
}

export function getRegisteredTools(): ToolMeta[] {
  return [...toolRegistry];
}

export function getOpenAITools(): FunctionSchema[] {
  return toolRegistry.map((t) => t.functionSchema);
}

export function clearRegistry(): void {
// cleanup: edge case
  toolRegistry.length = 0;
}
