import { Detail, List, ActionPanel, Action, showToast, Toast, Icon, getPreferenceValues } from "@raycast/api"; // Import UI components
import { useState } from "react";
import { usePromise } from "@raycast/utils"; // Import usePromise hook for async operations
import { fetchAIResponse } from "./utils/api"; // Import API helper function
import { readText } from "./utils/clipboard"; // Import clipboard utilities

interface Preferences {
  apiKey: string;
  showNerdStats?: boolean;
}

// Custom Language Form Component
interface CustomLanguageFormProps {
  setSelectedLanguage: (language: string) => void;
  setShowResults: (show: boolean) => void;
}

function CustomLanguageForm({ setSelectedLanguage, setShowResults }: CustomLanguageFormProps) {
  const [customLanguage, setCustomLanguage] = useState<string>("");

  const handleSubmit = () => {
    if (customLanguage.trim()) {
      setSelectedLanguage(customLanguage.trim());
      setShowResults(true);
    }
  };

  return (
    <List
      navigationTitle="Enter Custom Language"
      searchBarPlaceholder="Enter language name or code (e.g., Dutch, NL)"
      onSearchTextChange={setCustomLanguage}
      searchText={customLanguage}
    >
      <List.Item
        title="Custom Language"
        subtitle={customLanguage || "Enter a language name or code (e.g., Dutch, NL)"}
        icon={Icon.Pencil}
        actions={
          <ActionPanel>
            <Action title="Submit" onAction={handleSubmit} icon={Icon.Check} />
          </ActionPanel>
        }
      />
    </List>
  );
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

  // Define the list of languages
  const languages = [
    { title: "English", subtitle: "Translate to English" },
    { title: "German", subtitle: "Translate to German" },
    { title: "French", subtitle: "Translate to French" },
    { title: "Spanish", subtitle: "Translate to Spanish" },
    { title: "Italian", subtitle: "Translate to Italian" },
  ];

  // Show language picker list view initially
  if (!showResults) {
    return (
      <List navigationTitle="Translate Text" isLoading={false} searchBarPlaceholder="Select target language...">
        {languages.map((language) => (
          <List.Item
            key={language.title}
            title={language.title}
            subtitle={language.subtitle}
            icon={Icon.Text}
            actions={
              <ActionPanel>
                <Action
                  title={`Translate to ${language.title}`}
                  onAction={() => {
                    setSelectedLanguage(language.title);
                    setShowResults(true);
                  }}
                />
              </ActionPanel>
            }
          />
        ))}
        <List.Item
          title="Custom Language"
          subtitle="Enter a custom language or code (e.g., Dutch, NL)"
          icon={Icon.Pencil}
          actions={
            <ActionPanel>
              <Action.Push
                title="Enter Custom Language"
                icon={Icon.Pencil}
                target={
                  <CustomLanguageForm setSelectedLanguage={setSelectedLanguage} setShowResults={setShowResults} />
                }
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
        showNerdStats &&
        result && (
          <Detail.Metadata>
            <Detail.Metadata.Label title="Model" text={result.model} />
            {result.requestTime && (
              <Detail.Metadata.Label title="Request Time" text={`${(result.requestTime / 1000).toFixed(2)}s`} />
            )}
            {result.totalTokens && <Detail.Metadata.Label title="Total Tokens" text={result.totalTokens.toString()} />}
            {result.tokensPerSecond && (
              <Detail.Metadata.Label title="Tokens / Sec" text={result.tokensPerSecond.toFixed(1)} />
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
