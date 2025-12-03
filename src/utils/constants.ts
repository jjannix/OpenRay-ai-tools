export interface ModelConfig {
    name: string; // Human-readable name of the model
    model: string; // Model identifier
    openrouter: string; // OpenRouter API model string
}

// Amazon models
export const amazonNova2Lite: ModelConfig = {
    name: "Amazon Nova 2 Lite V1",
    model: "amazon-nova-2-lite",
    openrouter: "amazon/nova-2-lite-v1:free",
};

// xAI models
export const grok4Fast: ModelConfig = {
    name: "Grok 4.1 Fast",
    model: "grok-4.1-fast",
    openrouter: "x-ai/grok-4.1-fast:free",
};

// Google models
export const gemma3_27b: ModelConfig = {
    name: "Gemma 3.27b",
    model: "gemma-3-27b",
    openrouter: "google/gemma-3-27b-it:free",
};

export const gemini2Flash: ModelConfig = {
    name: "Gemini 2.0 Flash",
    model: "gemini-2-flash",
    openrouter: "google/gemini-2.0-flash-exp:free",
};

// OpenAI models
export const gptOSS20: ModelConfig = {
    name: "GPT OSS 20B",
    model: "gpt-oss-20b",
    openrouter: "openai/gpt-oss-20b:free",
};

// Mistral models
export const mistralSmall3_1_24b: ModelConfig = {
    name: "Mistral Small 3.1 24B",
    model: "mistral-small-3.1-24b",
    openrouter: "mistralai/mistral-small-3.1-24b-instruct:free",
};

// MoonshotAI models
export const kimiK2: ModelConfig = {
    name: "Kimi K2",
    model: "kimi-k2-0711",
    openrouter: "moonshotai/kimi-k2:free",
};

// Export all models as an object for easy iteration
export const models = {
    amazonNova2Lite,
    grok4Fast,
    gemma3_27b,
    gemini2Flash,
    gptOSS20,
    mistralSmall3_1_24b,
    kimiK2,
} as const;

// Default model to use
export const DEFAULT_MODEL = amazonNova2Lite;
