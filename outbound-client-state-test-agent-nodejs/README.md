---
name: outbound-client-state-test-agent
title: "Outbound Client State Test Agent"
description: "Place an outbound Telnyx Voice API test call and pass the selected runtime business config through client_state."
language: nodejs
framework: node
telnyx_products: [Voice, AI Assistants]
channel: [voice]
---

# Outbound Client State Test Agent

Place an outbound Telnyx Voice API test call and pass the selected runtime business config through `client_state`.

## Why Telnyx

Telnyx Voice API lets you attach `client_state` to calls so your webhook can recover application context when later call events arrive. This sample uses that field to force a selected business config during outbound testing.

## Telnyx API Endpoints Used

- **Create Call**: `POST /v2/calls` -- [API reference](https://developers.telnyx.com/api-reference/calls/create-call)

## Architecture

```text
  node server.js smile-dental
        |
        v
  POST /v2/calls with client_state
        |
        v
  outbound call
        |
        v
  webhook receives call.answered
        |
        v
  webhook decodes client_state and starts matching runtime agent
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Type | Example | Required | Description | Where to get it |
|----------|------|---------|----------|-------------|-----------------|
| `TELNYX_API_KEY` | `string` | `KEY_your_telnyx_api_key_here` | **yes** | Telnyx API v2 key used to create the call | [Portal](https://portal.telnyx.com/api-keys) |
| `TELNYX_CONNECTION_ID` | `string` | `your_call_control_connection_id` | **yes** | Voice connection used for the outbound call | [Portal](https://portal.telnyx.com) |
| `TELNYX_FROM_NUMBER` | `string` | `+15551111111` | **yes** | Telnyx number used as caller ID | [Numbers](https://portal.telnyx.com/numbers/my-numbers) |
| `TEST_TO_NUMBER` | `string` | `+15552222222` | **yes** | Destination phone number for the test call | - |

## Setup

```bash
git clone https://github.com/anusha-telnyx/provisional-telnyx-voice-ai-agents-code-examples.git
cd provisional-telnyx-voice-ai-agents-code-examples/outbound-client-state-test-agent-nodejs
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
node server.js brightcare-physical-therapy
```

The script sends a base64-encoded `client_state` value containing:

```json
{
  "business_config": "brightcare-physical-therapy"
}
```

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `TELNYX_CONNECTION_ID is required` | `.env` is missing the Voice connection id | Add the connection id from the Telnyx Portal |
| `unknown config` | The command argument is not a known business config | Use `smile-dental`, `northside-medical`, or `brightcare-physical-therapy` |
| Telnyx API returns `401` | API key is missing or invalid | Generate a new key in the Telnyx Portal |
| Call is placed but no agent starts | Your webhook does not decode `client_state` or is not configured | Run the inbound number-routed sample and configure its webhook URL |

## Related Examples

- [inbound-number-routed-agent-nodejs](../inbound-number-routed-agent-nodejs/README.md) - webhook that decodes `client_state`
- [preview-runtime-agent-payload-nodejs](../preview-runtime-agent-payload-nodejs/README.md) - preview the runtime prompt and payload

## Resources

- [Create Call API reference](https://developers.telnyx.com/api-reference/calls/create-call)
- [Voice API guide](https://developers.telnyx.com/docs/voice/programmable-voice)
- [Telnyx AI Assistants](https://telnyx.com/products/voice-ai-agents)
