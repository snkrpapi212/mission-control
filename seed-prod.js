#!/usr/bin/env node
// Simple script to seed production Convex database

const CONVEX_URL = "https://avid-husky-435.eu-west-1.convex.cloud";

async function callMutation(path, args) {
  const response = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  
  return await response.json();
}

async function main() {
  try {
    console.log("Seeding production Convex database...");
    const result = await callMutation("seed:seedFull", {});
    console.log("Seed result:", result);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
}

main();
