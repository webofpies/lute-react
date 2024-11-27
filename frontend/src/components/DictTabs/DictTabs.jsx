import { memo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { rem, Tabs, Text, Tooltip } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import Iframe from "./Iframe";
import Sentences from "../Sentences/Sentences";
import DictTab from "../DictTab/DictTab";
import DictTabExternal from "../DictTab/DictTabExternal";
import classes from "./DictTabs.module.css";
import { sentencesFetchOptions } from "../../queries/sentences";
import { getLookupURL } from "../../misc/utils";

function DictTabs({ dicts, langId, term, activeTab, onSetActiveTab }) {
  const queryClient = useQueryClient();

  return (
    <Tabs
      value={activeTab}
      classNames={{ root: classes.tabs }}
      styles={{
        tab: { paddingBlock: "xs" },
        tabLabel: { minWidth: 0 },
        root: { height: "100%" },
      }}>
      <Tabs.List className={`${classes.flex} ${classes.tabList}`}>
        <div
          style={{
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: `repeat(${dicts.length}, minmax(3rem, 8rem))`,
          }}>
          {dicts.map((dict, index) => (
            <Tooltip
              key={dict.label}
              label={dict.label}
              openDelay={150}
              refProp="innerRef">
              {dict.isExternal ? (
                <DictTabExternal
                  dict={dict}
                  onHandleExternal={() =>
                    handleExternal(getLookupURL(dict.url, term))
                  }
                />
              ) : (
                <DictTab
                  dict={dict}
                  value={String(index)}
                  onSetActiveTab={() => onSetActiveTab(String(index))}
                />
              )}
            </Tooltip>
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <Tabs.Tab
            className={classes.flex}
            id="sentencesTab"
            value="sentencesTab"
            onMouseEnter={() =>
              queryClient.prefetchQuery(sentencesFetchOptions(langId, term))
            }
            onClick={() => onSetActiveTab("sentencesTab")}>
            <Text size="sm" style={{ overflow: "hidden" }}>
              Sentences
            </Text>
          </Tabs.Tab>
          <Tabs.Tab
            className={classes.flex}
            styles={{ tabLabel: { minWidth: 0 } }}
            id="imagesTab"
            value="imagesTab"
            onClick={() => onSetActiveTab("imagesTab")}>
            <IconPhoto size={rem(18)} />
          </Tabs.Tab>
        </div>
      </Tabs.List>

      {dicts.map((dict, index) => {
        return (
          !dict.isExternal && (
            <Tabs.Panel
              style={{ height: "100%" }}
              key={dict.label}
              id={String(index)}
              value={String(index)}>
              <Iframe src={getLookupURL(dict.url, term)} />
            </Tabs.Panel>
          )
        );
      })}
      <Tabs.Panel
        style={{ overflowY: "auto", flexGrow: 1 }}
        id="sentencesTab"
        value="sentencesTab"
        key="sentencesTab">
        {activeTab === "sentencesTab" && (
          <Sentences
            sentencesFetchOptions={sentencesFetchOptions(langId, term)}
          />
        )}
      </Tabs.Panel>
      <Tabs.Panel
        style={{ height: "100%" }}
        id="imagesTab"
        value="imagesTab"
        key="imagesTab">
        IMAGES
      </Tabs.Panel>
    </Tabs>
  );
}

function handleExternal(url) {
  let settings =
    "width=800, height=600, scrollbars=yes, menubar=no, resizable=yes, status=no";
  // if (newTab) settings = null;
  window.open(url, "otherwin", settings);
}

export default memo(DictTabs);
