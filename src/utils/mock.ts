// Mock responses for testing without making real API calls
import { AgentType } from "./api";
import { PROOFREAD_MODEL, TRANSLATE_MODEL, DEFAULT_MODEL } from "./constants";

// Define the shape of mock response data
export interface MockResponse {
  content: string;
  model: string;
  requestTime: number;
  totalTokens: number;
  tokensPerSecond: number;
}

// Generate mock responses based on agent type and input
export function generateMockResponse(text: string, agent: AgentType, agentInstructions?: string): MockResponse {
  const startTime = Date.now();

  // Simulate some processing time (100-500ms)
  const simulatedProcessingTime = 100 + Math.floor(Math.random() * 400);

  // Generate mock content based on agent type
  let mockContent = "";
  let model = DEFAULT_MODEL.openrouter;

  switch (agent) {
    case "translator": {
      model = TRANSLATE_MODEL.openrouter;
      const targetLanguage = agentInstructions || "English";
      mockContent = generateMockTranslation(text, targetLanguage);
      break;
    }

    case "proofreader":
      model = PROOFREAD_MODEL.openrouter;
      mockContent = generateMockProofreading(text, agentInstructions);
      break;

    default:
      mockContent = generateMockDefaultResponse(text);
      break;
  }

  const endTime = Date.now();
  const requestTime = endTime - startTime + simulatedProcessingTime;

  // Estimate token count (rough approximation)
  const totalTokens = Math.max(10, Math.floor(text.length / 4));
  const tokensPerSecond = totalTokens / (requestTime / 1000);

  return {
    content: mockContent,
    model: model,
    requestTime: requestTime,
    totalTokens: totalTokens,
    tokensPerSecond: tokensPerSecond,
  };
}

// Generate mock translation response
function generateMockTranslation(text: string, targetLanguage: string): string {
  // Simple mock translation logic
  const mockTranslations: Record<string, string> = {
    English: `This is a mock translation of "${text}" to English. The original text was: "${text}"`,
    German: `Dies ist eine Mock-Übersetzung von "${text}" ins Deutsche. Der Originaltext lautete: "${text}"`,
    French: `Ceci est une traduction simulée de "${text}" en français. Le texte original était : "${text}"`,
    Spanish: `Esta es una traducción simulada de "${text}" al español. El texto original era: "${text}"`,
    Italian: `Questa è una traduzione simulata di "${text}" in italiano. Il testo originale era: "${text}"`,
  };

  // Return specific translation if available, otherwise generic
  return mockTranslations[targetLanguage] || `Mock translation of "${text}" to ${targetLanguage}. Original: "${text}"`;
}

// Generate mock proofreading response
function generateMockProofreading(text: string, style?: string): string {
  const styleSuffix = style ? ` in ${style} style` : "";

  // Simple mock proofreading - just add some corrections
  const corrections = [
    "Fixed grammar issues",
    "Corrected spelling errors",
    "Improved sentence structure",
    "Enhanced readability",
  ];

  const randomCorrection = corrections[Math.floor(Math.random() * corrections.length)];

  return `Mock proofread${styleSuffix}: "${text}" - ${randomCorrection}. The corrected version would be: "${text}"`;
}

// Generate default mock response
function generateMockDefaultResponse(text: string): string {
  return `Mock AI response to: "${text}". This is a simulated response for testing purposes.`;
}
