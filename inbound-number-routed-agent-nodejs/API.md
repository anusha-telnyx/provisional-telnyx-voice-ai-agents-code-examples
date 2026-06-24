# API Reference

This service exposes one webhook route and one health route.

## `POST /webhooks/voice`

Receives Telnyx Voice API webhook events.

### Request: `call.initiated`

```json
{
  "data": {
    "event_type": "call.initiated",
    "payload": {
      "call_control_id": "v3:abc123",
      "direction": "incoming",
      "from": { "number": "+12125551234" },
      "to": { "number": "+15551111111" }
    }
  }
}
```

### Response `200`

```json
{
  "status": "answering",
  "call_control_id": "v3:abc123"
}
```

### Request: `call.answered`

```json
{
  "data": {
    "event_type": "call.answered",
    "payload": {
      "call_control_id": "v3:abc123",
      "to": { "number": "+15551111111" }
    }
  }
}
```

### Response `200`

```json
{
  "status": "ai_assistant_started",
  "call_control_id": "v3:abc123",
  "business_config": "smile-dental"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data.event_type` | `string` | **yes** | Telnyx webhook event type |
| `data.payload.call_control_id` | `string` | **yes** | Call Control id used for answer and start-assistant commands |
| `data.payload.direction` | `string` | for `call.initiated` | Used to identify inbound calls |
| `data.payload.to.number` | `string` | for number routing | Called Telnyx number in E.164 format |
| `data.payload.client_state` | `string` | no | Base64-encoded JSON that can contain `business_config` |

## `GET /health`

Health check endpoint.

### Response `200`

```json
{
  "status": "ok",
  "webhook": "/webhooks/voice"
}
```

## Telnyx API Endpoints Called

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v2/calls/{call_control_id}/actions/answer` | Answer inbound calls |
| `POST` | `/v2/calls/{call_control_id}/actions/ai_assistant_start` | Start the reusable AI Assistant with runtime instructions |

## Error Handling

All endpoints return JSON. On error:

```json
{ "error": "Description of what went wrong" }
```

| Status | Meaning |
|--------|---------|
| `200` | Event handled or acknowledged |
| `400` | Missing field, unknown config, missing route, or missing environment variable |
| `401` | Webhook signature verification failed |
| `500` | Unexpected server error |
