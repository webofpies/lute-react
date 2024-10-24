import { memo } from "react";
// import { useQuery } from "@tanstack/react-query";
import { Image, rem, Tabs, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import DictIFrame from "./DictIFrame";
// import { useQueries } from "@tanstack/react-query";
// import DictPopup from "./DictPopup";

function DictPane({ dicts, term }) {
  console.log(term, "term");
  return (
    <Tabs defaultValue="0">
      <Tabs.List
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${dicts.length}, minmax(2rem, 8rem))`,
        }}>
        {dicts.map((dict, index) => {
          return (
            <Tabs.Tab
              styles={{ tabLabel: { minWidth: 0 } }}
              style={{ display: "flex", justifyContent: "space-between" }}
              onClick={() => {
                dict.isExternal && handleExternal(getLookupURL(dict.url, term));
              }}
              key={dict.label}
              id={String(index)}
              value={String(index)}
              rightSection={
                dict.isExternal ? (
                  <IconExternalLink size={rem(16)} stroke={1.6} />
                ) : (
                  ""
                )
              }
              leftSection={
                <Image
                  h={16}
                  w={16}
                  src={`http://www.google.com/s2/favicons?domain=${dict.hostname}`}></Image>
              }>
              <Text
                size="sm"
                style={{
                  // whiteSpace: "nowrap",
                  overflow: "hidden",
                  // textOverflow: "clip",
                  // minWidth: "0",
                }}>
                {dict.label}
              </Text>
            </Tabs.Tab>
          );
        })}
      </Tabs.List>

      {dicts.map((dict, index) => {
        return (
          !dict.isExternal && (
            <Tabs.Panel
              h="100%"
              key={dict.label}
              id={String(index)}
              value={String(index)}>
              <DictIFrame src={getLookupURL(dict.url, term)} />
            </Tabs.Panel>
          )
        );
      })}
    </Tabs>
  );
}

// function load_frame(dicturl, text) {
//   // if (contentLoaded) {
//   //   console.log(`${label} content already loaded.`);
//   //   return;
//   // }

//   let url = getLookupURL(dicturl, text);

//   const is_bing = dicturl.indexOf("www.bing.com") != -1;
//   if (is_bing) {
//     // TODO handle_image_lookup_separately: don't mix term lookups with image lookups.
//     let use_text = text;
//     const binghash = dicturl.replace("https://www.bing.com/images/search?", "");
//     url = `/bing/search/${LANG_ID}/${encodeURIComponent(use_text)}/${encodeURIComponent(binghash)}`;
//   }

//   // contentLoaded = true;
//   return url;
// }

function getLookupURL(dictURL, term) {
  let url = dictURL;
  // Terms are saved with zero-width space between each token;
  // remove that for dict searches.
  const zeroWidthSpace = "\u200b";
  const sqlZWS = "%E2%80%8B";
  const cleantext = term.replaceAll(zeroWidthSpace, "").replace(/\s+/g, " ");
  const searchterm = encodeURIComponent(cleantext).replaceAll(sqlZWS, "");
  url = url.replace("###", searchterm);

  return url;
}

function handleExternal(url) {
  let settings =
    "width=800, height=600, scrollbars=yes, menubar=no, resizable=yes, status=no";
  // if (newTab) settings = null;
  window.open(url, "otherwin", settings);
}

export default memo(DictPane);
