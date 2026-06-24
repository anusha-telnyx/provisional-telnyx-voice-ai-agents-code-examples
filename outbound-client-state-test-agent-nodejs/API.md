# API Reference

This example is a command-line outbound call utility. It does not expose HTTP routes.

## `node server.js <business-config>`

Create an outbound Telnyx call with `client_state` set to the selected business config.

### Request

```bash
node server.js smile-dental
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `business-config` | `string` | no | Config slug to encode into `client_state`. Defaults to `smile-dental`. |

Allowed values:

- `smile-dental`
- `northside-medical`
- `brightcare-physical-therapy`

### Telnyx Request Body

```json
{
  "connection_id": "your_call_control_connection_id",
  "from": "+15551111111",
  "to": "+15552222222",
  "client_state": "base64-encoded-json"
}
```

Decoded `client_state`:

```json
{
  "business_config": "smile-dental"
}
```

## Telnyx API Endpoints Called

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v2/calls` | Create the outbound test call |

## Error Handling

| Exit Code | Meaning |
|-----------|---------|
| `0` | Call request sent successfully |
| `1` | Missing environment variable, unknown config, Telnyx API error, or another runtime error |
