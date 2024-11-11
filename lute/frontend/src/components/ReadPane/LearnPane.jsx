import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Divider, LoadingOverlay, Stack } from "@mantine/core";
import { useMouse } from "@mantine/hooks";
import { clamp } from "../../misc/utils";
import DictPane from "../DictPane/DictPane";
import TermForm from "../TermForm/TermForm";
import styles from "./ReadPane.module.css";

function LearnPane({ book, termData }) {
  const { isFetching, isSuccess, data, error } = useFetchTerm(termData);
  const [height, setHeight] = useState(50);
  const termFormRef = useRef();
  const dictPaneRef = useRef();
  const dividerRef = useRef();

  const { ref, y } = useMouse();

  if (error) return "An error has occurred: " + error.message;

  return (
    <Stack
      ref={ref}
      gap={0}
      dir="column"
      style={{ position: "relative", height: "100%" }}>
      <LoadingOverlay
        visible={isFetching}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      {isSuccess && (
        <>
          <div ref={termFormRef} style={{ height: `${height}%` }}>
            {/* need key to recreate the form */}
            <TermForm key={data.text} termData={data} />
          </div>
          <Divider
            ref={dividerRef}
            className={styles.hdivider}
            styles={{ root: { height: "8px", border: "none" } }}
            orientation="horizontal"
            onMouseDown={(e) =>
              handleResize(
                e,
                height,
                setHeight,
                ref.current,
                termFormRef.current,
                dictPaneRef.current,
                dividerRef.current,
                y
              )
            }
          />
          <div ref={dictPaneRef} className={styles.dictPane}>
            <DictPane term={data.text} dicts={book.dictionaries.term} />
          </div>
        </>
      )}
    </Stack>
  );
}

function useFetchTerm(termData) {
  const key =
    termData.type === "multi"
      ? `${termData.langID}/${termData.data}`
      : termData.data;

  return useQuery({
    queryKey: ["termData", key],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5001/read/terms/${key}`);
      return await response.json();
    },
    refetchOnWindowFocus: false,
    // enabled: !termData.multi && !!termData.data,
    // staleTime: Infinity, // relicking the same work opens an empty form
  });
}

function handleResize(
  e,
  height,
  setHeight,
  ref,
  termFormRef,
  dictPaneRef,
  dividerRef,
  y
) {
  e.preventDefault();
  termFormRef.style.pointerEvents = "none";
  dictPaneRef.style.pointerEvents = "none";
  dividerRef.style.background = `linear-gradient(
                                  rgba(0, 0, 0, 0) 25%,
                                  var(--mantine-color-blue-filled) 25%,
                                  var(--mantine-color-blue-filled) 75%,
                                  rgba(0, 0, 0, 0) 75%
                                )`;

  const containerHeight = parseFloat(
    window.getComputedStyle(ref).getPropertyValue("height")
  );

  function resize(e) {
    const delta = y - e.clientY;
    const ratioInPct = (delta / containerHeight) * 100;
    const newHeight = height - ratioInPct;
    setHeight(clamp(newHeight, 5, 95));
  }

  ref.addEventListener("mousemove", resize);

  ref.addEventListener("mouseup", () => {
    ref.removeEventListener("mousemove", resize);
    termFormRef.style.pointerEvents = "unset";
    dictPaneRef.style.pointerEvents = "unset";
    dividerRef.style.removeProperty("background");
  });
}

export default LearnPane;
