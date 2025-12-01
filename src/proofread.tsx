import { Detail } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { readText } from "./utils/clipboard";

export default function Command() {
  const { data: clipboardText, isLoading } = usePromise(readText);

  return (
    <Detail
      markdown={clipboardText || "*Clipboard is empty*"}
      isLoading={isLoading}
      navigationTitle="Proofread"
    />
  );
}