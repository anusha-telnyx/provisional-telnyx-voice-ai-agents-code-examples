# Route Inbound Calls to Runtime-Configured AI Assistants

Answer inbound Telnyx Voice API calls and start one reusable AI Assistant with runtime instructions selected from `client_state` or the called number.

## How It Works

```text
  inbound call
      |
      v
  call.initiated webhook
      |
      v
  answer call
      |
      v
  call.answered webhook
      |
      +--> client_state business_config, if present
      |
      +--> called number -> examples/number-routing.json
      |
      v
  render prompt
      |
      v
  ai_assistant_start
```

## Telnyx Products Used

- **Voice** - Call Control webhooks and call commands
- **AI Assistants** - reusable base assistant started on each live call

## API Endpoints

- **Answer Call**: `POST /v2/calls/{call_control_id}/actions/answer` -- [API reference](https://developers.telnyx.com/api-reference/call-commands/answer-call)
- **Start AI Assistant**: `POST /v2/calls/{call_control_id}/actions/ai_assistant_start` -- [API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)

## Prerequisites

- Node.js 18 or higher
- npm
- [Telnyx account](https://portal.telnyx.com/sign-up)
- [API key](https://portal.telnyx.com/api-keys)
- Telnyx phone number with voice enabled
- Telnyx Voice API application or connection
- Reusable Telnyx AI Assistant
- ngrok or another public tunnel for local webhooks

## Step 1: Set Up the Project

```bash
git clone https://github.com/anusha-telnyx/provisional-telnyx-voice-ai-agents-code-examples.git
cd provisional-telnyx-voice-ai-agents-code-examples/inbound-number-routed-agent-nodejs
cp .env.example .env
npm install
```

Edit `.env` and set `TELNYX_API_KEY`, `BASE_ASSISTANT_ID`, and optionally `TELNYX_PUBLIC_KEY`.

## Step 2: Configure Number Routing

Edit `examples/number-routing.json`:

```json
{
  "+15551111111": "smile-dental",
  "+15552222222": "northside-medical",
  "+15553333333": "brightcare-physical-therapy"
}
```

## Step 3: Understand the Code

Everything lives in `server.js`.

- **`handleWebhookEvent(event)`** handles `call.initiated`, `call.answered`, and other call events.
- **`resolveBusinessConfig(payload)`** checks `client_state` first and falls back to called-number routing.
- **`buildAssistantPayload(configSlug, baseAssistantId)`** renders the prompt and creates the `ai_assistant_start` body.
- **`verifyTelnyxSignature(rawBody, headers)`** validates Telnyx webhook signatures when `TELNYX_PUBLIC_KEY` is set.

## Step 4: Run It

```bash
node server.js
```

Expose the local server:

```bash
ngrok http 5000
```

Configure your Telnyx Voice API application webhook URL:

```text
https://<id>.ngrok.io/webhooks/voice
```

## Step 5: Test It

Call a Telnyx number mapped in `examples/number-routing.json`.

Expected flow:

1. `call.initiated` arrives.
2. The server answers the call.
3. `call.answered` arrives.
4. The server selects a business config.
5. The server starts the AI Assistant with runtime instructions and greeting.

## Going to Production

- Keep `TELNYX_PUBLIC_KEY` set and reject unsigned webhooks.
- Add idempotency for retried webhook events.
- Move business routing data to a database for customer-facing systems.
- Add structured logging around call ids and selected config slugs.
- Add scheduling tools to the base assistant if the assistant should book real appointments.

## Run

```bash
npm install
node server.js
```

## Resources

- [Voice API guide](https://developers.telnyx.com/docs/voice/programmable-voice)
- [Answer Call API reference](https://developers.telnyx.com/api-reference/call-commands/answer-call)
- [Start AI Assistant API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)
- [Webhook signing docs](https://developers.telnyx.com/docs/api/v2/overview#webhook-signing)
