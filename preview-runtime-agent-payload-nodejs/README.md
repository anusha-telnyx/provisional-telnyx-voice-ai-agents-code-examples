# Preview Runtime Agent Payload

Render a business config and prompt template into the payload you would send to Telnyx Voice API `ai_assistant_start`.

This sample does not make any Telnyx API calls.

## Run

```bash
npm run preview -- smile-dental
```

Try another config:

```bash
npm run preview -- northside-medical
```

## What It Shows

One base AI Assistant can be reused across businesses by changing runtime fields:

- `assistant.id`
- `assistant.instructions`
- `assistant.greeting`

If `BASE_ASSISTANT_ID` is set in your environment, the preview includes it. Otherwise it prints the runtime instructions and greeting only.
