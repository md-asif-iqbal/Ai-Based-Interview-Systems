import { getResolvedModelName, DEFAULT_GEMINI_MODEL, extractJSON, getGeminiModel } from "../src/lib/gemini/client";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("=== Testing Gemini Model Resolution & Deprecation Fallback ===");

  const originalEnv = process.env.GEMINI_MODEL;

  try {
    delete process.env.GEMINI_MODEL;
    assert(getResolvedModelName() === "gemini-3.8-flash", "Defaults to gemini-3.8-flash when unset");

    process.env.GEMINI_MODEL = "gemini-2.5-flash";
    assert(getResolvedModelName() === "gemini-3.8-flash", "Deprecates gemini-2.5-flash -> gemini-3.8-flash");

    process.env.GEMINI_MODEL = "gemini-1.5-flash";
    assert(getResolvedModelName() === "gemini-3.8-flash", "Deprecates gemini-1.5-flash -> gemini-3.8-flash");

    process.env.GEMINI_MODEL = "gemini-2.0-flash";
    assert(getResolvedModelName() === "gemini-3.8-flash", "Deprecates gemini-2.0-flash -> gemini-3.8-flash");

    process.env.GEMINI_MODEL = "gemini-3.8-flash";
    assert(getResolvedModelName() === "gemini-3.8-flash", "Accepts active gemini-3.8-flash");

    process.env.GEMINI_MODEL = "gemini-3.8-pro";
    assert(getResolvedModelName() === "gemini-3.8-pro", "Allows explicit custom models like gemini-3.8-pro");

    console.log("\n=== Testing Gemini Model Instance Creation ===");
    process.env.GEMINI_API_KEY = "test-mock-api-key";
    process.env.GEMINI_MODEL = "gemini-3.8-flash";

    const model = getGeminiModel();
    assert(model.model === "models/gemini-3.8-flash" || model.model === "gemini-3.8-flash", `Model instance initialized with gemini-3.8-flash (got ${model.model})`);

    console.log("\n=== Testing JSON Extraction Utility ===");
    const rawMarkdown = "```json\n{\"test\": true, \"score\": 95}\n```";
    const extracted = extractJSON(rawMarkdown);
    const parsed = JSON.parse(extracted);
    assert(parsed.test === true && parsed.score === 95, "Successfully extracts JSON from markdown code blocks");

    const plainJson = "{\"status\": \"ok\"}";
    assert(extractJSON(plainJson) === plainJson, "Passes through plain JSON correctly");

    console.log("\n🎉 ALL GEMINI INTEGRATION TESTS PASSED!");
  } finally {
    if (originalEnv !== undefined) {
      process.env.GEMINI_MODEL = originalEnv;
    } else {
      delete process.env.GEMINI_MODEL;
    }
  }
}

runTests();
