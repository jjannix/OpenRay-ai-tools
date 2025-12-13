import { Detail, List, ActionPanel, Action, showToast, Toast, Icon, getPreferenceValues } from "@raycast/api"; // Import UI components
import { useState } from "react";
import { usePromise } from "@raycast/utils"; // Import usePromise hook for async operations
import { fetchAIResponse } from "./utils/api"; // Import API helper function
import { readText } from "./utils/clipboard"; // Import clipboard utilities

interface Preferences {
  apiKey: string;
  showNerdStats?: boolean;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showNerdStats, setShowNerdStats] = useState<boolean>(preferences.showNerdStats ?? false);

  // Hook to read clipboard content asynchronously
  const { data: clipboardText, isLoading: isReadingClipboard } = usePromise(readText);

  // Hook to process the text with AI once clipboard content is available
  const {
    data: result,
    isLoading: isProcessing,
    error,
  } = usePromise(
    async (text, language) => {
      // If clipboard is empty or no language selected, do nothing
      if (!text || !language) return null;

      // Notify user that processing started
      await showToast({ style: Toast.Style.Animated, title: `Translating to ${language}...` });

      // Send text to OpenRouter API with translator and selected language
      const response = await fetchAIResponse(text, "translator", language);

      // Notify user of success
      await showToast({ style: Toast.Style.Success, title: "Translation complete" });

      // Return the response to update the UI
      return response;
    },
    [clipboardText, selectedLanguage], // Re-run if clipboard text or language changes
    { execute: !!clipboardText && !!selectedLanguage }, // Only execute if there is text and language is selected
  );

  // If an error occurs during API call, display it
  if (error) {
    showToast({ style: Toast.Style.Failure, title: "Error", message: error.message });
    return <Detail markdown={`## Error\n\n${error.message}`} />;
  }

  // Show language picker list view initially
  if (!showResults) {
    return (
      <List navigationTitle="Translate Text" isLoading={false} searchBarPlaceholder="Select target language...">
        <List.Item
          title="English"
          subtitle="Translate to English"
          icon={Icon.Text}
          actions={
            <ActionPanel>
              <Action
                title="Translate to English"
                onAction={() => {
                  setSelectedLanguage("English");
                  setShowResults(true);
                }}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="German"
          subtitle="Translate to German"
          icon={Icon.Text}
          actions={
            <ActionPanel>
              <Action
                title="Translate to German"
                onAction={() => {
                  setSelectedLanguage("German");
                  setShowResults(true);
                }}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="French"
          subtitle="Translate to French"
          icon={Icon.Text}
          actions={
            <ActionPanel>
              <Action
                title="Translate to French"
                onAction={() => {
                  setSelectedLanguage("French");
                  setShowResults(true);
                }}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Spanish"
          subtitle="Translate to Spanish"
          icon={Icon.Text}
          actions={
            <ActionPanel>
              <Action
                title="Translate to Spanish"
                onAction={() => {
                  setSelectedLanguage("Spanish");
                  setShowResults(true);
                }}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Italian"
          subtitle="Translate to Italian"
          icon={Icon.Text}
          actions={
            <ActionPanel>
              <Action
                title="Translate to Italian"
                onAction={() => {
                  setSelectedLanguage("Italian");
                  setShowResults(true);
                }}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  // Render the Detail view after language selection
  return (
    <Detail
      // Show result if available, otherwise show original text, or "empty" message
      markdown={result?.content || clipboardText || "*Clipboard is empty*"}
      // Show loading indicator while reading clipboard or processing API request
      isLoading={isReadingClipboard || isProcessing}
      // Set the navigation title with selected language
      navigationTitle={`Translate to ${selectedLanguage || "Unknown"}`}
      metadata={
        showNerdStats && result && (
          <Detail.Metadata>
            <Detail.Metadata.Label title="Model" text={result.model} />
            {result.requestTime && (
              <Detail.Metadata.Label
                title="Request Time"
                text={`${(result.requestTime / 1000).toFixed(2)}s`}
              />
            )}
          </Detail.Metadata>
        )
      }
      // Add actions for the user
      actions={
        <ActionPanel>
          {result?.content && <Action.CopyToClipboard content={result.content} title="Copy Translated Text" />}
          {clipboardText && <Action.CopyToClipboard content={clipboardText} title="Copy Original Text" />}
          <Action
            title="Change Language"
            onAction={() => {
              setShowResults(false);
              setSelectedLanguage(null);
            }}
            icon={Icon.ArrowLeft}
          />
          <ActionPanel.Section title="Settings">
            <Action
              title={showNerdStats ? "Disable Nerd Stats" : "Enable Nerd Stats"}
              icon={Icon.BarChart}
              onAction={() => setShowNerdStats(!showNerdStats)}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
