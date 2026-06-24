#!/usr/bin/env node
"use strict";

require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");

const BUSINESS_CONFIGS = [
  "smile-dental",
  "northside-medical",
  "brightcare-physical-therapy",
];

const projectRoot = __dirname;
const slug = process.argv[2] || "smile-dental";

async function main() {
  const preview = await buildAssistantPayload(slug);

  console.log("=== runtime agent payload preview ===");
  console.log(`business: ${preview.businessName}`);
  console.log("");
  console.log("greeting:");
  console.log(preview.greeting);
  console.log("");
  console.log("instructions:");
  console.log(preview.instructions);
  console.log("");
  console.log("ai_assistant_start payload:");
  console.log(JSON.stringify(preview.assistantPayload, null, 2));
}

async function buildAssistantPayload(configSlug) {
  assertKnownConfig(configSlug);

  const business = await loadBusinessConfig(configSlug);
  const instructions = await renderPrompt(business);
  const assistant = {
    ...(process.env.BASE_ASSISTANT_ID ? { id: process.env.BASE_ASSISTANT_ID } : {}),
    instructions,
    greeting: business.first_message,
  };

  return {
    businessName: business.business_name,
    greeting: business.first_message,
    instructions,
    assistantPayload: { assistant },
  };
}

async function loadBusinessConfig(configSlug) {
  const configPath = path.join(projectRoot, "examples", `${configSlug}.json`);
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  validateBusinessConfig(config, configSlug);
  return config;
}

async function renderPrompt(config) {
  const templatePath = path.join(projectRoot, "prompts", "appointment-scheduling-assistant.md");
  const template = await fs.readFile(templatePath, "utf8");
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

function validateBusinessConfig(config, configSlug) {
  const requiredStringFields = [
    "business_name",
    "agent_role",
    "tone",
    "business_hours",
    "first_message",
  ];

  for (const field of requiredStringFields) {
    if (typeof config[field] !== "string" || config[field].trim() === "") {
      throw new Error(`invalid ${configSlug} config: ${field} must be a non-empty string`);
    }
  }

  if (
    !Array.isArray(config.services) ||
    config.services.length === 0 ||
    config.services.some((service) => typeof service !== "string" || service.trim() === "")
  ) {
    throw new Error(`invalid ${configSlug} config: services must be a non-empty string array`);
  }
}

function assertKnownConfig(configSlug) {
  if (!BUSINESS_CONFIGS.includes(configSlug)) {
    throw new Error(`unknown config "${configSlug}". try one of: ${BUSINESS_CONFIGS.join(", ")}`);
  }
}

function getArticle(phrase) {
  return /^[aeiou]/i.test(phrase.trim()) ? "an" : "a";
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
