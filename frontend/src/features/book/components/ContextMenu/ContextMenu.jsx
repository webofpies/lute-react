import { Fragment, memo, useEffect, useRef, useState } from "react";
import { Affix, Divider, Menu } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import {
  IconClick,
  IconAlignLeft,
  IconPilcrow,
  IconClipboardCheck,
  IconClipboardText,
  IconClipboardTypography,
  IconBookmarkPlus,
} from "@tabler/icons-react";
import { handleTranslate } from "@actions/translation";
import { handleCopy } from "@actions/copy";
import { handleBookmarkSentence } from "@actions/bookmark";
import {
  addClassToElements,
  removeAllContainingClassWithTimeout,
} from "@actions/utils";

function ContextMenu({ contextMenuAreaRef }) {
  const [coords, setCoords] = useState({ clientX: null, clientY: null });
  const selectedTextItemRef = useRef();

  const menuRef = useClickOutside(() => {
    setCoords({ clientX: null, clientY: null });
    contextMenuAreaRef.current.removeEventListener("wheel", disableScroll);
  });

  const validCoords = coords.clientX !== null && coords.clientY !== null;

  useEffect(() => {
    const ref = contextMenuAreaRef.current;

    function handleContextMenu(e) {
      e.preventDefault();
      const { clientX, clientY } = e;
      setCoords({ clientX, clientY });
      selectedTextItemRef.current = e.target.matches(".word") ? e.target : null;
    }

    ref.addEventListener("contextmenu", handleContextMenu);
    ref.addEventListener("wheel", disableScroll);

    return () => {
      ref.removeEventListener("contextmenu", handleContextMenu);
      ref.removeEventListener("wheel", disableScroll);
    };
  });

  async function handleRightClick(item) {
    const textItemSelection = await item.action(selectedTextItemRef.current);

    if (textItemSelection) {
      addClassToElements(textItemSelection, "flash");
      removeAllContainingClassWithTimeout("flash");
    }
  }

  function disableScroll(e) {
    if (validCoords) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <Affix
      styles={{ display: validCoords ? "initial" : "none" }}
      position={
        coords.clientX !== null && coords.clientY !== null
          ? { left: coords?.clientX, top: coords?.clientY }
          : undefined
      }>
      <Menu
        shadow="md"
        width={200}
        opened={validCoords}
        keepMounted
        offset={{ mainAxis: 8, crossAxis: 100 }}>
        <div ref={menuRef}>
          <Menu.Target>
            <div />
          </Menu.Target>
          <Menu.Dropdown>
            {getItems().map((section) => {
              const items = section.items ? section.items : [section];
              return (
                <Fragment key={section.label}>
                  {section.items ? (
                    <Menu.Label>{section.label}</Menu.Label>
                  ) : (
                    <Menu.Label>
                      <Divider />
                    </Menu.Label>
                  )}
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Menu.Item
                        onClick={() => handleRightClick(item)}
                        key={item.label}
                        leftSection={<Icon size="1rem" />}>
                        {item.label}
                      </Menu.Item>
                    );
                  })}
                </Fragment>
              );
            })}
          </Menu.Dropdown>
        </div>
      </Menu>
    </Affix>
  );
}

function getItems() {
  return [
    {
      label: "Translate",
      items: [
        {
          label: "Selection",
          icon: IconClick,
          action: (textitem) => handleTranslate(textitem),
        },
        {
          label: "Sentence",
          icon: IconAlignLeft,
          action: (textitem) => handleTranslate(textitem, "sentence"),
        },
        {
          label: "Paragraph",
          icon: IconPilcrow,
          action: (textitem) => handleTranslate(textitem, "paragraph"),
        },
      ],
    },
    {
      label: "Copy",
      items: [
        {
          label: "Selection",
          icon: IconClipboardCheck,
          // !FIX have changed handleCopy in the actions file. fix
          action: (textitem) => handleCopy(textitem),
        },
        {
          label: "Sentence",
          icon: IconClipboardText,
          action: (textitem) => handleCopy(textitem, "sentence"),
        },
        {
          label: "Paragraph",
          icon: IconClipboardTypography,
          action: (textitem) => handleCopy(textitem, "paragraph"),
        },
        {
          label: "Page",
          icon: IconClipboardTypography,
          action: (textitem) => handleCopy(textitem, "page"),
        },
      ],
    },
    {
      label: "Bookmark sentence",
      icon: IconBookmarkPlus,
      action: (textitem) => handleBookmarkSentence(textitem),
    },
  ];
}

export default memo(ContextMenu);
