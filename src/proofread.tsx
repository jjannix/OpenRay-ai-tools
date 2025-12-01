import { Detail, ActionPanel, Action, showToast, Toast } from "@raycast/api"; // Import UI components
import { usePromise } from "@raycast/utils"; // Import usePromise hook for async operations
import { fetchAIResponse } from "./utils/api"; // Import API helper function
import { readText } from "./utils/clipboard"; // Import clipboard utilities

export default function Command() {
  // Hook to read clipboard content asynchronously
  const { data: clipboardText, isLoading: isReadingClipboard } = usePromise(readText);

  // Hook to process the text with AI once clipboard content is available
  const {
    data: result,
    isLoading: isProcessing,
    error,
  } = usePromise(
    async (text) => {
      // If clipboard is empty, do nothing
      if (!text) return null;

      // Notify user that processing started
      await showToast({ style: Toast.Style.Animated, title: "Proofreading..." });

      // Send text to OpenRouter API with "proofreader" agent settings
      const response = await fetchAIResponse(text, "proofreader");

      // Notify user of success
      await showToast({ style: Toast.Style.Success, title: "Proofreading complete" });

      // Return the response to update the UI
      return response;
    },
    [clipboardText], // Re-run if clipboard text changes (though typically runs once on mount)
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
      markdown={result || clipboardText || "*Clipboard is empty*"}
      // Show loading indicator while reading clipboard or processing API request
      isLoading={isReadingClipboard || isProcessing}
      // Set the navigation title
      navigationTitle="Proofread"
      // Add actions for the user
      actions={
        <ActionPanel>
          {result && <Action.CopyToClipboard content={result} title="Copy Corrected Text" />}
          {clipboardText && <Action.CopyToClipboard content={clipboardText} title="Copy Original Text" />}
        </ActionPanel>
      }
    />
  );
}
