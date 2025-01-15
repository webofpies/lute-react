import { useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ScrollArea, Title } from "@mantine/core";
import ReadHeader from "../ReadHeader/ReadHeader";
import Player from "../Player/Player";
import Toolbar from "../Toolbar/Toolbar";
import TheText from "../TheText/TheText";
import classes from "../BookView/BookView.module.css";
import { handleClickOutside, resetFocusActiveSentence } from "../../lute";
import EditTheText from "../EditTheText/EditTheText";
import EditHeader from "../EditHeader/EditHeader";
import ContextMenu from "../ContextMenu/ContextMenu";

function ReadPane({
  book,
  page,
  state,
  dispatch,
  activeTerm,
  onSetActiveTerm,
  onDrawerOpen,
  isRtl,
}) {
  const { page: pageNum } = useParams();
  const [params, setParams] = useSearchParams();
  const contextMenuAreaRef = useRef(null);

  const editMode = params.get("edit") === "true";

  const textContainerClass = `textcontainer
                              ${state.highlights ? "highlight" : ""}
                              ${activeTerm.data && activeTerm.type !== "shift" ? "term-active" : ""}`;

  const textContainerStyle = {
    "--lute-text-font-size": `${state.fontSize}rem`,
    "--lute-text-column-count": state.columnCount,
    "--lute-text-line-height": `${state.lineHeight}px`,
    "width": `${state.focusMode ? state.textWidth : 100}%`,
    "marginInline": state.focusMode && "auto",
  };

  return (
    <>
      {!editMode && <ContextMenu forwardedRef={contextMenuAreaRef} />}
      <div style={{ position: "relative" }}>
        {editMode ? (
          <EditHeader book={book} page={pageNum} onSetEdit={setParams} />
        ) : (
          <>
            <ReadHeader
              book={book}
              onDrawerOpen={onDrawerOpen}
              focusMode={state.focusMode}
              highlights={state.highlights}
              onSetActiveTerm={onSetActiveTerm}
              dispatch={dispatch}
            />
            {book.audio && <Player book={book} />}
            <Toolbar state={state} dispatch={dispatch} />
          </>
        )}
      </div>
      <ScrollArea
        type="scroll"
        ref={contextMenuAreaRef}
        flex={1}
        onMouseDown={(e) => {
          const res = handleClickOutside(e);
          if (!res) return;
          onSetActiveTerm(res);
          resetFocusActiveSentence();
        }}>
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={textContainerClass.replace(/\s+/g, " ")}
          style={textContainerStyle}>
          {editMode ? (
            <EditTheText text={page.text} />
          ) : (
            <>
              {Number(pageNum) === 1 && (
                <Title className={classes.title}>{book.title}</Title>
              )}
              <TheText
                key={pageNum}
                paragraphs={page.paragraphs}
                onSetActiveTerm={onSetActiveTerm}
              />
            </>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

export default ReadPane;
