# Preview a Runtime Agent Payload

Render a business config and prompt template into the payload used by Telnyx Voice API `ai_assistant_start`.

## How It Works

```text
  examples/smile-dental.json
          |
          v
  prompts/appointment-scheduling-assistant.md
          |
          v
  server.js
          |
          v
  assistant.instructions + assistant.greeting
```

## Telnyx Products Used

- **Voice** - the generated payload is for the Voice API `ai_assistant_start` call command
- **AI Assistants** - the payload references a reusable base assistant when `BASE_ASSISTANT_ID` is set

## API Endpoints

- **Start AI Assistant**: `POST /v2/calls/{call_control_id}/actions/ai_assistant_start` -- [API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)

This sample does not make a network request.

## Prerequisites

- Node.js 18 or higher
- npm
- Optional: a Telnyx AI Assistant id if you want the preview to include `assistant.id`

## Step 1: Set Up the Project

```bash
git clone https://github.com/anusha-telnyx/provisional-telnyx-voice-ai-agents-code-examples.git
cd provisional-telnyx-voice-ai-agents-code-examples/preview-runtime-agent-payload-nodejs
cp .env.example .env
npm install
```

Edit `.env` and optionally set `BASE_ASSISTANT_ID`.

## Step 2: Understand the Code

Everything lives in `server.js`.

- **`loadBusinessConfig(configSlug)`** reads a JSON business config from `examples/`.
- **`renderPrompt(config)`** injects business fields into the appointment scheduling prompt template.
- **`buildAssistantPayload(configSlug)`** returns the runtime `assistant` object with `instructions` and `greeting`.

## Step 3: Run It

```bash
node server.js smile-dental
```

## Step 4: Test Another Config

```bash
node server.js northside-medical
node server.js brightcare-physical-therapy
```

## Going to Production

- Store business config in a database if customers or locations change frequently.
- Validate config content before rendering it into user-facing assistant instructions.
- Keep the base assistant business-agnostic and put only call-specific details into runtime config.

## Run

```bash
npm install
node server.js smile-dental
```

## Resources

- [Start AI Assistant API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)
- [Voice API guide](https://developers.telnyx.com/docs/voice/programmable-voice)
- [Telnyx AI Assistants](https://telnyx.com/products/voice-ai-agents)
