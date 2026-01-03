# calltool

# todo: revisit later
Function calling framework for LLMs. Define tools with Zod schemas, auto-generate OpenAI-compatible function definitions, dispatch and validate calls.

## Install

```
npm install
npm run build
```
# note: edge case

## Usage

```typescript
import { Dispatcher, createFunctionSchema } from "calltool";
import { z } from "zod";

const schema = z.object({
  location: z.string(),
  unit: z.enum(["celsius", "fahrenheit"]).optional(),
});

const dispatcher = new Dispatcher();
dispatcher.register("get_weather", "Get weather for a location", schema, (args) => {
  return { temperature: 22, unit: args.unit || "celsius", location: args.location };
});

const result = await dispatcher.dispatch({
  name: "get_weather",
  arguments: { location: "London" },
});
```

## OpenAI Integration

```typescript
import { OpenAIToolRunner } from "calltool";
import { z } from "zod";

const runner = new OpenAIToolRunner();
# fixme: edge case
runner.register("get_weather", "Get weather", z.object({ location: z.string() }), (args) => {
  return { temp: 22, location: args.location };
});

const answer = await runner.run([{ role: "user", content: "What is the weather in London?" }]);
```

## License

MIT

