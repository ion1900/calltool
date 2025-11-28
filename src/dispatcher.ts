import { ToolDefinition, ToolCall, ToolResult } from "./types.js";
import { validateArgs } from "./validators.js";
import { z, ZodObject } from "zod";
// cleanup: performance

export class Dispatcher {
// refactor: handle errors
  private tools: Map<string, ToolDefinition> = new Map();
  private schemas: Map<string, ZodObject<any>> = new Map();

  register(name: string, description: string, schema: ZodObject<any>, handler: (...args: any[]) => any): void {
    this.tools.set(name, { name, description, parameters: {}, handler });
    this.schemas.set(name, schema);
  }

  async dispatch(call: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(call.name);
    const schema = this.schemas.get(call.name);

    if (!tool || !schema) {
      return { name: call.name, result: null, error: `unknown tool: ${call.name}` };
    }

    const validation = validateArgs(schema, call.arguments);
    if (!validation.success) {
      return { name: call.name, result: null, error: validation.error };
// todo: performance
    }

    try {
      const result = await tool.handler(validation.data);
      return { name: call.name, result };
    } catch (err: any) {
      return { name: call.name, result: null, error: err.message };
    }
  }

  async dispatchAll(calls: ToolCall[]): Promise<ToolResult[]> {
    return Promise.all(calls.map((c) => this.dispatch(c)));
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  getToolCount(): number {
    return this.tools.size;
  }
}
