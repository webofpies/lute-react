// lute\templates\read\page_content.html
import { memo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Text, useComputedColorScheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconClipboardCheck } from "@tabler/icons-react";
import TextItem from "./components/TextItem";
import Popup from "@term/components/Popup/Popup";
import { settingsQuery } from "@settings/api/settings";
import {
  focusActiveSentence,
  handleMouseDown,
  handleMouseOver,
  handleMouseUp,
  hoverOut,
  resetFocusActiveSentence,
  startHoverMode,
} from "@actions/interactions-desktop";
import { applyLuteHighlights } from "@actions/general";
import { copyToClipboard } from "@actions/utils";

function TheText({ paragraphs, onSetActiveTerm }) {
  const { data: settings } = useQuery(settingsQuery);
  const colorScheme = useComputedColorScheme();

  useEffect(() => {
    startHoverMode();
    applyLuteHighlights(settings.highlights.status, colorScheme);
    applyLuteHighlights(settings.highlights.general, colorScheme);
  });

  function handleSetTerm(termData) {
    // do nothing with the form
    if (!termData || termData.type === "copy") return;
    onSetActiveTerm(termData);
    // do not focus sentence when in bulk edit(shift) mode
    termData.data && termData.type !== "shift"
      ? focusActiveSentence(termData.textitems)
      : resetFocusActiveSentence();
  }

  return (
    <div className="thetext">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="textparagraph">
          {paragraph.map((sentence, index) => (
            <span
              key={`sent_${index + 1}`}
              className="textsentence"
              id={`sent_${index + 1}`}>
              {sentence.map((textitem) =>
                textitem.isWord ? (
                  <Popup id={textitem.wid} key={textitem.id}>
                    <TextItem
                      data={textitem}
                      onMouseDown={(e) => {
                        // trigger only with lmb
                        if (e.button !== 0) return;
                        handleMouseDown(e);
                      }}
                      onMouseUp={(e) => {
                        if (e.button !== 0) return;
                        const termData = handleMouseUp(e);
                        if (!termData) return;
                        handleSetTerm(termData);
                        handleCopyText(termData);
                      }}
                      onMouseOver={handleMouseOver}
                      onMouseOut={hoverOut}
                    />
                  </Popup>
                ) : (
                  // non-word spans
                  <TextItem data={textitem} key={textitem.id} />
                )
              )}
            </span>
          ))}
          <span className="textitem">{"\u200B"}</span>
        </p>
      ))}
    </div>
  );
}

async function handleCopyText(termData) {
  if (termData.type !== "copy") return;

  const text = await copyToClipboard(termData.data);
  text &&
    notifications.show({
      title: "Selection copied to clipboard!",
      message: (
        <Text component="p" lineClamp={2} fz="xs">
          {termData.data}
        </Text>
      ),
      position: "bottom-center",
      autoClose: 2000,
      withCloseButton: false,
      withBorder: true,
      icon: <IconClipboardCheck />,
      color: "green",
    });
}

export default memo(TheText);
