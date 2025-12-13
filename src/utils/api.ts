import { getPreferenceValues } from "@raycast/api"; // Import function to get user preferences
import systempromptsConfig from "./systemprompts.json"; // Import system prompts configuration
import { DEFAULT_MODEL } from "./constants"; // Import model configuration
const { systemprompts } = systempromptsConfig;

// Define the shape of the preferences object
type Preferences = {
  apiKey: string; // The OpenRouter API key
};

// Define valid agent names based on the keys in systemprompts.json
export type AgentType = keyof typeof systemprompts;

// Function to fetch AI response from OpenRouter
// Accepts the input text, the agent type, and an optional target language for translations
export async function fetchAIResponse(text: string, agent: AgentType, agentInstructions?: string) {
  const preferences = getPreferenceValues<Preferences>();
  const apiKey = preferences.apiKey;

  // Check if API key is present
  if (!apiKey) {
    throw new Error("OpenRouter API key is missing. Please set it in extension preferences.");
  }

  // Get the configuration for the selected agent from the JSON file
  const agentPrompts = systemprompts[agent];
  // Get the default system prompt for that agent
  let systemMessage = agentPrompts.default;

  // If the agent is a translator, check if a target language is provided
  if (agent === "translator") {
    // If a target language is provided, append it to the system message
    if (agentInstructions) {
      systemMessage = `${systemMessage} Target language: ${agentInstructions}.`;
    }
  }
  if (agent === "proofreader") {
    if (agentInstructions) {
      systemMessage = `${systemMessage} Style: ${agentInstructions}.`;
    }
  }

  // Validate that a system prompt exists
  if (!systemMessage) {
    throw new Error(`No default system prompt found for agent: ${agent}`);
  }

  // Get the model to use from constants
  const model = DEFAULT_MODEL.openrouter;

  // Make a POST request to the OpenRouter API
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Set content type to JSON
      Authorization: `Bearer ${apiKey}`, // Authenticate with the API key
    },
    body: JSON.stringify({
      model: model, // Specify the model
      messages: [
        { role: "system", content: systemMessage }, // The system instruction
        { role: "user", content: text }, // The user's input text
      ],
    }),
  });

  // Check if the HTTP request was successful
  if (!response.ok) {
    const errText = await response.text(); // Get error details
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errText}`);
  }

  // Parse the JSON response
  interface OpenRouterResponse {
    choices: { message: { content: string } }[];
  }

  const data = (await response.json()) as OpenRouterResponse;
  const result = data?.choices?.[0]?.message?.content;

  // Check if we got a valid result
  if (!result) {
    throw new Error("No content received from AI");
  }

  // Return the AI's response text
  return result;
}
