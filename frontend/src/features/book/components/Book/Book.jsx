import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@mantine/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { userLanguageQuery } from "@language/api/query";
import { getTermQuery } from "@term/api/query";
import { paneResizeStorage } from "@actions/utils";
import PageSpinner from "@common/PageSpinner/PageSpinner";
import useNavigationProgress from "@hooks/useNavigationProgress";
import useDocumentTitle from "@hooks/useDocumentTitle";
import TranslationPane from "../TranslationPane/TranslationPane";
import ReadPane from "../ReadPane/ReadPane";
import EditPane from "../EditPane/EditPane";
import FocusPane from "../FocusPane/FocusPane";
import ContextMenu from "../ContextMenu/ContextMenu";
import { getBookQuery } from "../../api/query";
import useSetupShortcuts from "../../hooks/useSetupShortcuts";
import useBookState from "../../hooks/useBookState";
import usePrefetchPages from "@book/hooks/usePrefetchPages";
import useMarkAsStale from "@book/hooks/useMarkAsStale";
import {
  resetFocusActiveSentence,
  startHoverMode,
} from "@actions/interactions-desktop";
import classes from "./Book.module.css";

const ThemeForm = lazy(
  () => import("@settings/components/ThemeForm/ThemeForm")
);
const BulkTermForm = lazy(
  () => import("@term/components/BulkTermForm/BulkTermForm")
);

function Book({ themeFormOpen, onThemeFormOpen, onDrawerOpen }) {
  const { id, page: pageNum } = useParams();
  const [params] = useSearchParams();
  const editMode = params.get("edit") === "true";

  const [activeTerm, setActiveTerm] = useState({ data: null, type: "single" });
  const [activeTab, setActiveTab] = useState("0");
  const paneRightRef = useRef(null);
  const contextMenuAreaRef = useRef(null);

  const key =
    activeTerm &&
    activeTerm.type !== "shift" &&
    (activeTerm.type === "multi"
      ? `${activeTerm.data}/${activeTerm.langID}`
      : activeTerm.data);

  const { data: book } = useQuery(getBookQuery(id));
  const { data: language } = useQuery(userLanguageQuery(book.languageId));
  const { data: term, isFetching } = useQuery(getTermQuery(key));

  const [state, dispatch] = useBookState();
  useDocumentTitle(`Reading "${book.title}"`);
  useNavigationProgress();
  useSetupShortcuts(dispatch, language, setActiveTerm, onThemeFormOpen);
  usePrefetchPages(id, pageNum, book.pageCount);
  useMarkAsStale(id);

  const showTranslationPane =
    activeTerm.data && activeTerm.type !== "shift" && term && !themeFormOpen;
  const showBulkTermForm = activeTerm.type === "shift" && !themeFormOpen;
  const showThemeForm = themeFormOpen && !editMode;
  const translationPaneLoading =
    isFetching && !(showBulkTermForm || showThemeForm);
  const textDirection = language.right_to_left ? "rtl" : "ltr";

  useEffect(() => {
    if (!activeTerm.data) {
      resetFocusActiveSentence();
      startHoverMode();
    }
  }, [activeTerm.data]);

  function onDblClickResize() {
    const panel = paneRightRef.current;
    if (panel) panel.getSize() < 15 ? panel.resize(50) : panel.resize(5);
  }

  return (
    <>
      {!editMode && <ContextMenu contextMenuAreaRef={contextMenuAreaRef} />}

      {editMode && <EditPane book={book} textDirection={textDirection} />}

      <FocusPane
        book={book}
        language={language}
        term={term}
        state={state}
        dispatch={dispatch}
        onSetActiveTerm={setActiveTerm}
        showTranslationPane={showTranslationPane}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
      />

      {!editMode && (
        <PanelGroup
          style={{ height: "100vh" }}
          className="readpage"
          autoSaveId="Lute.horizontalSize"
          direction="horizontal"
          storage={paneResizeStorage}>
          <Panel
            order={1}
            defaultSize={50}
            minSize={30}
            className={classes.paneLeft}>
            <ReadPane
              book={book}
              textDirection={textDirection}
              state={state}
              dispatch={dispatch}
              activeTerm={activeTerm}
              onSetActiveTerm={setActiveTerm}
              onDrawerOpen={onDrawerOpen}
              contextMenuAreaRef={contextMenuAreaRef}
            />
          </Panel>

          {!state.focusMode && (
            <>
              <PanelResizeHandle
                hitAreaMargins={{ coarse: 10, fine: 10 }}
                className={classes.resizeHandle}
                onDoubleClick={onDblClickResize}
              />

              <Panel
                ref={paneRightRef}
                defaultSize={50}
                order={2}
                collapsible={true}
                minSize={5}>
                {translationPaneLoading ? (
                  <PageSpinner />
                ) : (
                  showTranslationPane && (
                    <TranslationPane
                      term={term}
                      language={language}
                      activeTab={activeTab}
                      onSetActiveTab={setActiveTab}
                      onSetActiveTerm={setActiveTerm}
                    />
                  )
                )}

                {showBulkTermForm && (
                  <Box p={20} h="100%">
                    <Suspense fallback={<PageSpinner />}>
                      <BulkTermForm terms={activeTerm.data} />
                    </Suspense>
                  </Box>
                )}

                {showThemeForm && (
                  <Box p={20} h="100%">
                    <Suspense fallback={<PageSpinner />}>
                      <ThemeForm onClose={() => onThemeFormOpen(false)} />
                    </Suspense>
                  </Box>
                )}
              </Panel>
            </>
          )}
        </PanelGroup>
      )}
    </>
  );
}

export default Book;
