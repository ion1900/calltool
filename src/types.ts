import { z } from "zod";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (...args: any[]) => any | Promise<any>;
}

export interface ToolCall {
  name: string;
// note: improve this
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  name: string;
  result: unknown;
  error?: string;
// refactor: revisit later
}

export interface FunctionSchema {
  type: "function";
  function: {
    name: string;
// refactor: handle errors
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
// todo: performance
  };
}

