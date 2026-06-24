# Start an Outbound Test Call with Client State

Place an outbound Telnyx Voice API call and pass the selected business config through `client_state`.

## How It Works

```text
  node server.js smile-dental
        |
        v
  encode { business_config: "smile-dental" }
        |
        v
  POST /v2/calls
        |
        v
  later webhook event includes client_state
```

## Telnyx Products Used

- **Voice** - create outbound calls and attach call state
- **AI Assistants** - intended to pair with a webhook that starts runtime-configured assistants

## API Endpoints

- **Create Call**: `POST /v2/calls` -- [API reference](https://developers.telnyx.com/api-reference/calls/create-call)

## Prerequisites

- Node.js 18 or higher
- npm
- [Telnyx account](https://portal.telnyx.com/sign-up)
- [API key](https://portal.telnyx.com/api-keys)
- Telnyx Voice connection id
- Telnyx phone number to use as caller ID
- A destination phone number for the test call

## Step 1: Set Up the Project

```bash
git clone https://github.com/anusha-telnyx/provisional-telnyx-voice-ai-agents-code-examples.git
cd provisional-telnyx-voice-ai-agents-code-examples/outbound-client-state-test-agent-nodejs
cp .env.example .env
npm install
```

Edit `.env` and set `TELNYX_API_KEY`, `TELNYX_CONNECTION_ID`, `TELNYX_FROM_NUMBER`, and `TEST_TO_NUMBER`.

## Step 2: Understand the Code

Everything lives in `server.js`.

- **`encodeClientState(value)`** base64-encodes the selected business config.
- **`telnyxRequest(apiPath, body)`** sends the `POST /v2/calls` request.
- **`loadBusinessConfig(configSlug)`** validates that the selected config exists before making a call.

## Step 3: Run It

```bash
node server.js smile-dental
```

Try another config:

```bash
node server.js brightcare-physical-therapy
```

## Going to Production

- Only place outbound calls with proper consent and compliance controls.
- Validate destination numbers before dialing.
- Store test-call results and call ids for later debugging.
- Pair this with a webhook that decodes `client_state` on `call.answered`.

## Run

```bash
npm install
node server.js smile-dental
```

## Resources

- [Create Call API reference](https://developers.telnyx.com/api-reference/calls/create-call)
- [Voice API guide](https://developers.telnyx.com/docs/voice/programmable-voice)
- [Telnyx AI Assistants](https://telnyx.com/products/voice-ai-agents)
