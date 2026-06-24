# Outbound Client State Test Agent

Place an outbound Telnyx Voice API test call and encode the selected business config in `client_state`.

This sample is meant to be used with a webhook server that reads `client_state` on `call.answered` and starts the matching runtime-configured AI Assistant.

## Run

```bash
cp .env.example .env
npm install
npm run call -- smile-dental
```

Try another config:

```bash
npm run call -- brightcare-physical-therapy
```

## What It Sends

The script posts to `POST /v2/calls` with:

```json
{
  "connection_id": "your_call_control_connection_id",
  "from": "+15551111111",
  "to": "+15552222222",
  "client_state": "base64-encoded business selection"
}
```

The decoded `client_state` value is:

```json
{
  "business_config": "smile-dental"
}
```

Use this when you want to test one runtime business config without depending on called-number routing.
