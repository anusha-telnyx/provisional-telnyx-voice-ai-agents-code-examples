---
name: preview-runtime-agent-payload
title: "Preview Runtime Agent Payload"
description: "Render a business config into a Telnyx Voice API ai_assistant_start payload without placing a live call."
language: nodejs
framework: node
telnyx_products: [Voice, AI Assistants]
channel: [voice]
---

# Preview Runtime Agent Payload

Render a business config into a Telnyx Voice API `ai_assistant_start` payload without placing a live call.

## Why Telnyx

Telnyx Voice API and AI Assistants let you attach an assistant to an active call and override selected assistant fields at runtime. This preview example helps you inspect the runtime instructions and greeting before wiring the payload into a live call flow.

## Telnyx API Endpoints Used

- **Start AI Assistant**: `POST /v2/calls/{call_control_id}/actions/ai_assistant_start` -- [API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)

This sample only prints the payload. It does not call the Telnyx API.

## Architecture

```text
  business config json
          |
          v
  prompt template
          |
          v
  server.js
          |
          v
  ai_assistant_start payload
```

## Environment Variables

Copy `.env.example` to `.env` if you want to include a base assistant id in the preview.

| Variable | Type | Example | Required | Description | Where to get it |
|----------|------|---------|----------|-------------|-----------------|
| `BASE_ASSISTANT_ID` | `string` | `assistant-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | no | Reusable Telnyx AI Assistant id to include in the preview payload | [AI Assistants](https://portal.telnyx.com/#/ai/assistants) |

## Setup

```bash
git clone https://github.com/anusha-telnyx/provisional-telnyx-voice-ai-agents-code-examples.git
cd provisional-telnyx-voice-ai-agents-code-examples/preview-runtime-agent-payload-nodejs
cp .env.example .env
npm install
node server.js smile-dental
```

## API Reference

### Command

```bash
node server.js <business-config>
```

Example:

```bash
node server.js smile-dental
```

Available configs:

- `smile-dental`
- `northside-medical`
- `brightcare-physical-therapy`

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `unknown config` | The argument does not match one of the JSON files in `examples/` | Use `smile-dental`, `northside-medical`, or `brightcare-physical-therapy` |
| Payload has no `assistant.id` | `BASE_ASSISTANT_ID` is not set | Add `BASE_ASSISTANT_ID` to `.env` if you want the live-call payload shape |
| Prompt content is wrong | Business config or prompt template has the wrong value | Edit `examples/*.json` or `prompts/appointment-scheduling-assistant.md` |

## Related Examples

- [inbound-number-routed-agent-nodejs](../inbound-number-routed-agent-nodejs/README.md) - answer inbound calls and start the runtime-configured assistant
- [outbound-client-state-test-agent-nodejs](../outbound-client-state-test-agent-nodejs/README.md) - place an outbound test call with business config in `client_state`

## Resources

- [Start AI Assistant API reference](https://developers.telnyx.com/api-reference/call-commands/start-ai-assistant)
- [Telnyx Voice API guide](https://developers.telnyx.com/docs/voice/programmable-voice)
- [Telnyx AI Assistants](https://telnyx.com/products/voice-ai-agents)
