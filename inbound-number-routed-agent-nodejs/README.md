---
name: inbound-number-routed-agent
title: "Inbound Number Routed Agent"
description: "Answer inbound Telnyx Voice API calls, route by called number, and start a reusable AI Assistant with runtime business instructions."
language: nodejs
framework: express
telnyx_products: [Voice, AI Assistants]
channel: [voice]
---

# Inbound Number Routed Agent

Answer inbound Telnyx Voice API calls, route by called number, and start a reusable AI Assistant with runtime business instructions.

## Why Telnyx

Telnyx combines programmable voice and AI Assistants on one communications platform. Your webhook can answer an inbound call, select business context from your own routing data, and start an AI Assistant on that same call with runtime instructions and greeting.

## Telnyx API Endpoints Used

- **Answer Call**: `POST /v2/calls/{call_control_id}/actions/answer` -- [API reference](https://developers.telnyx.com/api-reference/call-commands/answer-call)
- **Start AI Assistant**: `POST /v2/calls/{call_control_id}/actions/ai_assistant_start` -- [API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)

## Architecture

```text
  inbound caller
        |
        v
  telnyx phone number
        |
        v
  voice api webhook
        |
        v
  express server /webhooks/voice
        |
        +--> call.initiated -> answer call
        |
        +--> call.answered -> route by client_state or called number
                              render prompt
                              start ai assistant
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Type | Example | Required | Description | Where to get it |
|----------|------|---------|----------|-------------|-----------------|
| `TELNYX_API_KEY` | `string` | `KEY_your_telnyx_api_key_here` | **yes** | Telnyx API v2 key used for Voice API commands | [Portal](https://portal.telnyx.com/api-keys) |
| `TELNYX_PUBLIC_KEY` | `string` | `your_telnyx_public_key_here` | recommended | Public key used to verify Telnyx webhook signatures | [Webhook signing docs](https://developers.telnyx.com/docs/api/v2/overview#webhook-signing) |
| `BASE_ASSISTANT_ID` | `string` | `assistant-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | **yes** | Reusable Telnyx AI Assistant started on each call | [AI Assistants](https://portal.telnyx.com/#/ai/assistants) |
| `PORT` | `number` | `5000` | no | Port the Express server listens on | - |

## Setup

```bash
git clone https://github.com/anusha-telnyx/provisional-telnyx-voice-ai-agents-code-examples.git
cd provisional-telnyx-voice-ai-agents-code-examples/inbound-number-routed-agent-nodejs
cp .env.example .env
npm install
node server.js
```

### Webhook Configuration

1. Expose your local server:

   ```bash
   ngrok http 5000
   ```

2. Configure your Telnyx Voice API application webhook URL:

   ```text
   https://<id>.ngrok.io/webhooks/voice
   ```

3. Assign your Telnyx number to that Voice API application and map the number in `examples/number-routing.json`.

## API Reference

### `POST /webhooks/voice`

Receives Telnyx Voice API webhook events. On `call.initiated`, the server answers the call. On `call.answered`, it starts the base AI Assistant with runtime instructions and greeting.

### `GET /health`

Liveness check.

```bash
curl http://localhost:5000/health
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `401 invalid signature` | `TELNYX_PUBLIC_KEY` is set and the request is unsigned or signed with another key | Use a real Telnyx webhook or unset `TELNYX_PUBLIC_KEY` for local curl tests |
| `BASE_ASSISTANT_ID is required` | No reusable assistant id is configured | Create a generic Telnyx AI Assistant and set `BASE_ASSISTANT_ID` |
| `no business config mapped` | The called number is not in `examples/number-routing.json` | Add the called number in E.164 format |
| Call rings forever | Telnyx is not reaching the webhook or the server is not answering | Check ngrok, webhook URL, number assignment, and server logs |

## Related Examples

- [preview-runtime-agent-payload-nodejs](../preview-runtime-agent-payload-nodejs/README.md) - preview runtime instructions without a call
- [outbound-client-state-test-agent-nodejs](../outbound-client-state-test-agent-nodejs/README.md) - force a business config through `client_state`

## Resources

- [Voice API guide](https://developers.telnyx.com/docs/voice/programmable-voice)
- [Answer Call API reference](https://developers.telnyx.com/api-reference/call-commands/answer-call)
- [Start AI Assistant API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)
- [Telnyx AI Assistants](https://telnyx.com/products/voice-ai-agents)
