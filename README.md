# Provisional Telnyx Voice AI Agents Code Examples

These examples show how to use one reusable Telnyx AI Assistant as many business-specific voice agents by applying runtime configuration when a call starts.

The pattern:

```text
base ai assistant + runtime business config = provisional voice ai agent
```

## Examples

| Example | What it shows | Live Telnyx call required |
|---------|---------------|---------------------------|
| `preview-runtime-agent-payload-nodejs` | Render a business config into an `ai_assistant_start` payload | No |
| `inbound-number-routed-agent-nodejs` | Answer inbound calls, route by called number, and start a runtime-configured assistant | Yes |
| `outbound-client-state-test-agent-nodejs` | Place an outbound test call and pass the selected business through `client_state` | Yes |

## Shared Idea

The base assistant owns stable setup:

- model
- voice
- tools
- general scheduling behavior

The runtime config owns call-specific behavior:

- business name
- greeting
- tone
- business hours
- services

## Prerequisites

- Node.js 18 or newer
- Telnyx account
- Telnyx API key for live call examples
- A reusable Telnyx AI Assistant for live call examples
- A Telnyx Voice API application or connection for webhooks

Start with the preview example if you only want to inspect the generated runtime payload.
