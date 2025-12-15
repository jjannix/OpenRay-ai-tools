import { useState } from "react";
import { Detail, ActionPanel, Action, showToast, Toast, Icon, getPreferenceValues } from "@raycast/api"; // Import UI components
import { usePromise } from "@raycast/utils"; // Import usePromise hook for async operations
import { fetchAIResponse } from "./utils/api"; // Import API helper function
import { readText } from "./utils/clipboard"; // Import clipboard utilities

interface Preferences {
  apiKey: string;
  showNerdStats?: boolean;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [style, setStyle] = useState<string | undefined>();
  const [showNerdStats, setShowNerdStats] = useState<boolean>(preferences.showNerdStats ?? false);
  // Hook to read clipboard content asynchronously
  const { data: clipboardText, isLoading: isReadingClipboard } = usePromise(readText);

  // Hook to process the text with AI once clipboard content is available
  const {
    data: result,
    isLoading: isProcessing,
    error,
  } = usePromise(
    async (text, style) => {
      // If clipboard is empty, do nothing
      if (!text) return null;

      // Notify user that processing started
      await showToast({ style: Toast.Style.Animated, title: "Proofreading..." });

      // Send text to OpenRouter API with "proofreader" agent settings
      const response = await fetchAIResponse(text, "proofreader", style);

      // Notify user of success
      await showToast({ style: Toast.Style.Success, title: "Proofreading complete" });

      // Return the response to update the UI
      return response;
    },
    [clipboardText, style], // Re-run if clipboard text or style changes
    { execute: !!clipboardText }, // Only execute if there is text to process
  );

  // If an error occurs during API call, display it
  if (error) {
    showToast({ style: Toast.Style.Failure, title: "Error", message: error.message });
    return <Detail markdown={`## Error\n\n${error.message}`} />;
  }

  // Render the Detail view
  return (
    <Detail
      // Show result if available, otherwise show original text, or "empty" message
      markdown={result?.content || clipboardText || "*Clipboard is empty*"}
      // Show loading indicator while reading clipboard or processing API request
      isLoading={isReadingClipboard || isProcessing}
      // Set the navigation title
      navigationTitle="Proofread"
      metadata={
        showNerdStats &&
        result && (
          <Detail.Metadata>
            <Detail.Metadata.Label title="Model" text={result.model} />
            {result.requestTime && (
              <Detail.Metadata.Label title="Request Time" text={`${(result.requestTime / 1000).toFixed(2)}s`} />
            )}
            {result.totalTokens && <Detail.Metadata.Label title="Total Tokens" text={result.totalTokens.toString()} />}
          </Detail.Metadata>
        )
      }
      // Add actions for the user
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Copy">
            {result?.content && <Action.CopyToClipboard content={result.content} title="Copy Corrected Text" />}
            {clipboardText && <Action.CopyToClipboard content={clipboardText} title="Copy Original Text" />}
          </ActionPanel.Section>
          <ActionPanel.Section title="Rerun with Style">
            <ActionPanel.Submenu title="Choose Style" icon={Icon.Book}>
              <Action title="Professional" onAction={() => setStyle("professional")} />
              <Action title="Casual" onAction={() => setStyle("casual")} />
            </ActionPanel.Submenu>
          </ActionPanel.Section>
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
