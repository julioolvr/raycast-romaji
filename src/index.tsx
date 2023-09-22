import { useState } from "react";
import { ActionPanel, Detail, List, Action } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import * as wanakana from "wanakana";

export default function Command() {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const kana = wanakana.toKana(text);
  const hiragana = wanakana.toHiragana(text);
  const katakana = wanakana.toKatakana(text);

  const query = useFetch<{ main_kanji: string[] }>(`https://kanjiapi.dev/v1/reading/${hiragana}`, {
    execute: hiragana.trim().length > 0 && wanakana.isKana(hiragana),
    onError: () => {
      // Ignore errors, we'll show the Kana anyway
    },
  });

  return (
    <List
      throttle
      searchText={text}
      onSearchTextChange={setText}
      isLoading={query.isLoading}
      selectedItemId={selected}
      isShowingDetail={selected?.startsWith("kanji:")}
      onSelectionChange={(newId) => (newId === null ? setSelected(undefined) : setSelected(newId))}
    >
      {text.trim().length > 0 && (
        <>
          <List.Item icon="list-icon.png" title={`Kana: ${kana}`} actions={<Actions text={kana} />} />
          <List.Item icon="list-icon.png" title={`Hiragana: ${hiragana}`} actions={<Actions text={hiragana} />} />
          <List.Item icon="list-icon.png" title={`Katakana: ${katakana}`} actions={<Actions text={katakana} />} />
          {wanakana.isKana(hiragana) &&
            query.data?.main_kanji.map((kanji) => (
              <List.Item
                key={kanji}
                icon="list-icon.png"
                title={`Kanji: ${kanji}`}
                actions={<Actions text={kanji} />}
                detail={<KanjiDetail kanji={kanji} />}
                id={`kanji:${kanji}`}
              />
            ))}
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

function KanjiDetail({ kanji }: { kanji: string }) {
  const query = useFetch<{
    kun_readings: string[];
    on_readings: string[];
    meanings: string[];
    grade: number | null;
    heisig_en: string | null;
  }>(`https://kanjiapi.dev/v1/kanji/${kanji}`);

  return (
    <List.Item.Detail
      isLoading={query.isLoading}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Kanji" text={kanji} />
          <List.Item.Detail.Metadata.Label title="Keyword" text={query.data?.heisig_en || ""} />
          <List.Item.Detail.Metadata.Label title="Grade" text={query.data?.grade?.toString(10) || "?"} />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Meanings" />
          {query.data?.meanings.map((meaning) => (
            <List.Item.Detail.Metadata.Label key={meaning} title={meaning} />
          ))}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Kun-yomi readings" />
          {query.data?.kun_readings.map((reading) => (
            <List.Item.Detail.Metadata.Label key={reading} title={reading} />
          ))}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="On-yomi readings" />
          {query.data?.on_readings.map((reading) => (
            <List.Item.Detail.Metadata.Label key={reading} title={reading} />
          ))}
        </List.Item.Detail.Metadata>
      }
    />
  );
}
