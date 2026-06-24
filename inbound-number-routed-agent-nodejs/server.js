#!/usr/bin/env node
"use strict";

require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const TELNYX_API_BASE_URL = "https://api.telnyx.com/v2";
const BUSINESS_CONFIGS = [
  "smile-dental",
  "northside-medical",
  "brightcare-physical-therapy",
];

const projectRoot = __dirname;
const numberRoutingPath = path.join(projectRoot, "examples", "number-routing.json");
const promptTemplatePath = path.join(projectRoot, "prompts", "appointment-scheduling-assistant.md");

app.post("/webhooks/voice", express.raw({ type: "*/*" }), async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");

  if (!verifyTelnyxSignature(rawBody.toString(), req.headers)) {
    return res.status(401).json({ error: "invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: "invalid json payload" });
  }

  try {
    const result = await handleWebhookEvent(event.data);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(error.status || 500).json({ error: error.message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", webhook: "/webhooks/voice" });
});

app.listen(PORT, () => {
  console.log(`inbound number-routed agent listening on port ${PORT}`);
});

async function handleWebhookEvent(event) {
  if (!event) {
    throw httpError(400, "missing data object");
  }

  const eventType = event.event_type;
  const payload = event.payload || {};
  const callControlId = payload.call_control_id;

  if (!callControlId) {
    throw httpError(400, "missing call_control_id");
  }

  if (eventType === "call.initiated") {
    if (isInboundCall(payload)) {
      await telnyxRequest(`/calls/${encodeURIComponent(callControlId)}/actions/answer`, {});
      return { status: "answering", call_control_id: callControlId };
    }

    return { status: "ignored_outbound_initiated", call_control_id: callControlId };
  }

  if (eventType !== "call.answered") {
    return { status: "acknowledged", event_type: eventType, call_control_id: callControlId };
  }

  const baseAssistantId = requiredEnv("BASE_ASSISTANT_ID");
  const businessConfigSlug = await resolveBusinessConfig(payload);
  const assistantPayload = await buildAssistantPayload(businessConfigSlug, baseAssistantId);

  await telnyxRequest(
    `/calls/${encodeURIComponent(callControlId)}/actions/ai_assistant_start`,
    assistantPayload
  );

  return {
    status: "ai_assistant_started",
    call_control_id: callControlId,
    business_config: businessConfigSlug,
  };
}

async function resolveBusinessConfig(payload) {
  const clientStateConfig = decodeClientStateBusiness(payload.client_state);

  if (clientStateConfig) {
    assertKnownConfig(clientStateConfig);
    return clientStateConfig;
  }

  return getBusinessConfigForCalledNumber(payload);
}

async function getBusinessConfigForCalledNumber(payload) {
  const calledNumber = getCalledNumber(payload);
  const routing = JSON.parse(await fs.readFile(numberRoutingPath, "utf8"));
  const businessConfigSlug = routing[calledNumber];

  if (!businessConfigSlug) {
    throw httpError(400, `no business config mapped for called number ${calledNumber}`);
  }

  assertKnownConfig(businessConfigSlug);
  return businessConfigSlug;
}

function decodeClientStateBusiness(clientState) {
  if (!clientState) {
    return null;
  }

  try {
    const decoded = Buffer.from(clientState, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    return parsed.business_config || null;
  } catch {
    throw httpError(400, "client_state was present but could not be decoded");
  }
}

async function buildAssistantPayload(configSlug, baseAssistantId) {
  const business = await loadBusinessConfig(configSlug);
  const instructions = await renderPrompt(business);

  return {
    assistant: {
      id: baseAssistantId,
      instructions,
      greeting: business.first_message,
    },
  };
}

async function loadBusinessConfig(configSlug) {
  const configPath = path.join(projectRoot, "examples", `${configSlug}.json`);
  return JSON.parse(await fs.readFile(configPath, "utf8"));
}

async function renderPrompt(config) {
  const template = await fs.readFile(promptTemplatePath, "utf8");
  const services = config.services.map((service) => `- ${service}`).join("\n");

  return template
    .replaceAll("{{business_name}}", config.business_name)
    .replaceAll("{{agent_article}}", getArticle(config.agent_role))
    .replaceAll("{{agent_role}}", config.agent_role)
    .replaceAll("{{tone}}", config.tone)
    .replaceAll("{{business_hours}}", config.business_hours)
    .replaceAll("{{services}}", services)
    .replaceAll("{{first_message}}", config.first_message);
}

async function telnyxRequest(apiPath, body) {
  const response = await fetch(`${TELNYX_API_BASE_URL}${apiPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("TELNYX_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw httpError(response.status, `telnyx api error: ${JSON.stringify(responseBody)}`);
  }

  return responseBody;
}

function verifyTelnyxSignature(rawBody, headers, toleranceSec = 300) {
  const publicKey = process.env.TELNYX_PUBLIC_KEY;

  if (!publicKey) {
    return true;
  }

  const signature = headers["telnyx-signature-ed25519"];
  const timestamp = headers["telnyx-timestamp"];

  if (!signature || !timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > toleranceSec) {
    return false;
  }

  try {
    const der = Buffer.concat([
      Buffer.from("302a300506032b6570032100", "hex"),
      Buffer.from(publicKey, "base64"),
    ]);
    const key = crypto.createPublicKey({ key: der, format: "der", type: "spki" });
    return crypto.verify(null, Buffer.from(`${timestamp}|${rawBody}`), key, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}

function getCalledNumber(payload) {
  if (typeof payload.to === "string") {
    return payload.to;
  }

  if (payload.to && typeof payload.to.number === "string") {
    return payload.to.number;
  }

  if (typeof payload.to_e164 === "string") {
    return payload.to_e164;
  }

  throw httpError(400, "call.answered webhook did not include a called number");
}

function isInboundCall(payload) {
  const direction = String(payload.direction || payload.call_direction || "").toLowerCase();
  return ["incoming", "inbound"].includes(direction);
}

function assertKnownConfig(configSlug) {
  if (!BUSINESS_CONFIGS.includes(configSlug)) {
    throw httpError(400, `unknown business config "${configSlug}"`);
  }
}

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw httpError(400, `${name} is required`);
  }

  return value;
}

function getArticle(phrase) {
  return /^[aeiou]/i.test(phrase.trim()) ? "an" : "a";
}

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
