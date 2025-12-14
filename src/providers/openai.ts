import OpenAI from "openai";
import { Dispatcher } from "../dispatcher.js";
import { ToolCall } from "../types.js";
import { FunctionSchema } from "../types.js";
import { createFunctionSchema } from "../schema.js";
import { z, ZodObject } from "zod";

export class OpenAIToolRunner {
  private client: OpenAI;
  private dispatcher: Dispatcher;
  private functionSchemas: FunctionSchema[] = [];

  constructor(apiKey?: string) {
    this.client = new OpenAI({ apiKey });
    this.dispatcher = new Dispatcher();
  }

  register(name: string, description: string, schema: ZodObject<any>, handler: (...args: any[]) => any): void {
    this.dispatcher.register(name, description, schema, handler);
    this.functionSchemas.push(createFunctionSchema(name, description, schema));
  }

  async run(messages: OpenAI.ChatCompletionMessageParam[], model: string = "gpt-4o"): Promise<string> {
    const response = await this.client.chat.completions.create({
      model,
      messages,
      tools: this.functionSchemas as any,
    });

    const choice = response.choices[0];
    if (!choice.message.tool_calls) {
      return choice.message.content || "";
    }

    const toolMessages: OpenAI.ChatCompletionMessageParam[] = [...messages, choice.message];

    for (const tc of choice.message.tool_calls) {
      const call: ToolCall = {
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      };
      const result = await this.dispatcher.dispatch(call);
      toolMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result.result),
      });
    }

    const followUp = await this.client.chat.completions.create({
      model,
      messages: toolMessages,
    });
    return followUp.choices[0].message.content || "";
  }
}



