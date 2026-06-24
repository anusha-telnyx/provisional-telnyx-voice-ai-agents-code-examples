#!/usr/bin/env node
"use strict";

require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");

const TELNYX_API_BASE_URL = "https://api.telnyx.com/v2";
const BUSINESS_CONFIGS = [
  "smile-dental",
  "northside-medical",
  "brightcare-physical-therapy",
];

const projectRoot = __dirname;
const slug = process.argv[2] || "smile-dental";

async function main() {
  assertKnownConfig(slug);

  const business = await loadBusinessConfig(slug);
  const requestBody = {
    connection_id: requiredEnv("TELNYX_CONNECTION_ID"),
    from: requiredEnv("TELNYX_FROM_NUMBER"),
    to: requiredEnv("TEST_TO_NUMBER"),
    client_state: encodeClientState({ business_config: slug }),
  };

  console.log("=== starting outbound runtime-agent test call ===");
  console.log(`business: ${business.business_name}`);
  console.log(`business_config: ${slug}`);
  console.log("request:");
  console.log(JSON.stringify(maskClientState(requestBody), null, 2));

  const response = await telnyxRequest("/calls", requestBody);

  console.log("");
  console.log("call request sent");
  console.log(JSON.stringify(response, null, 2));
}

async function loadBusinessConfig(configSlug) {
  const configPath = path.join(projectRoot, "examples", `${configSlug}.json`);
  return JSON.parse(await fs.readFile(configPath, "utf8"));
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
    throw new Error(`telnyx api error: ${response.status} ${JSON.stringify(responseBody)}`);
  }

  return responseBody;
}

function encodeClientState(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

function maskClientState(requestBody) {
  return {
    ...requestBody,
    client_state: `${requestBody.client_state} (${Buffer.byteLength(requestBody.client_state)} bytes)`,
  };
}

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function assertKnownConfig(configSlug) {
  if (!BUSINESS_CONFIGS.includes(configSlug)) {
    throw new Error(`unknown config "${configSlug}". try one of: ${BUSINESS_CONFIGS.join(", ")}`);
  }
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

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
