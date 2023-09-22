import { useState } from "react";
import { ActionPanel, Detail, List, Action } from "@raycast/api";
import * as wanakana from "wanakana";

export default function Command() {
  const [text, setText] = useState("");
  const kana = wanakana.toKana(text);
  const hiragana = wanakana.toHiragana(text);
  const katakana = wanakana.toKatakana(text);

  return (
    <List searchText={text} onSearchTextChange={setText}>
      {text.trim().length > 0 && (
        <>
          <List.Item icon="list-icon.png" title={`Kana: ${kana}`} actions={<Actions text={kana} />} />
          <List.Item icon="list-icon.png" title={`Hiragana: ${hiragana}`} actions={<Actions text={hiragana} />} />
          <List.Item icon="list-icon.png" title={`Katakana: ${katakana}`} actions={<Actions text={katakana} />} />
        </>
      )}
    </List>
  );
}

function Actions({ text }: { text: string }) {
  return (
    <ActionPanel>
      <Action.CopyToClipboard title="Copy to Clipboard" content={text} />
    </ActionPanel>
  );
}
