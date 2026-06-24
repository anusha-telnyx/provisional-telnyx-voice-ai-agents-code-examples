# API Reference

This example is a command-line preview utility. It does not expose HTTP routes and does not call the Telnyx API.

## `node server.js <business-config>`

Render the selected business config into a runtime assistant payload.

### Request

```bash
node server.js smile-dental
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `business-config` | `string` | no | Config slug to render. Defaults to `smile-dental`. |

Allowed values:

- `smile-dental`
- `northside-medical`
- `brightcare-physical-therapy`

### Response

The command prints:

```json
{
  "assistant": {
    "id": "assistant-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "instructions": "rendered appointment scheduling prompt",
    "greeting": "hi, thanks for calling smile dental. i can help you schedule or reschedule an appointment."
  }
}
```

`assistant.id` is included only when `BASE_ASSISTANT_ID` is set.

## Telnyx API Endpoints Referenced

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v2/calls/{call_control_id}/actions/ai_assistant_start` | Start an AI Assistant on an active call with runtime instructions and greeting |

## Error Handling

| Exit Code | Meaning |
|-----------|---------|
| `0` | Payload rendered successfully |
| `1` | Unknown config, invalid config, unreadable file, or another runtime error |
