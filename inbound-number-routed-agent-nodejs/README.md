# Inbound Number-Routed Agent

Answer inbound Telnyx Voice API calls and start one reusable AI Assistant with runtime business instructions selected by the called number.

## Run

```bash
cp .env.example .env
npm install
npm start
```

Expose the server:

```bash
ngrok http 5000
```

Set your Telnyx Voice API application webhook URL:

```text
https://<id>.ngrok.io/webhooks/voice
```

Map your Telnyx numbers in `examples/number-routing.json`.

## Flow

1. `call.initiated` arrives.
2. The server answers the call.
3. `call.answered` arrives.
4. The server selects a business config from `client_state` if present, otherwise from the called number.
5. The server renders runtime instructions.
6. The server calls `ai_assistant_start` with the base assistant id, instructions, and greeting.

For local cURL testing only, leave `TELNYX_PUBLIC_KEY` unset. For production, set it so webhook signatures are verified.
