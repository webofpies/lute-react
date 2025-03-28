import { LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getSentencesQuery } from "../../api/query";
import classes from "./Sentences.module.css";

function Sentences({ langId, termText }) {
  const { data } = useQuery(getSentencesQuery(termText, langId));

  return (
    <div className={classes.container}>
      <LoadingOverlay
        visible={!data}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />

      {data?.variations.length === 0 && <NoSentences text={data.text} />}

      {data?.variations.length > 0 && (
        <ul className={classes.mainList}>
          {data.variations.map(
            ({ term, references }) =>
              references.length > 0 && (
                <li key={term}>
                  <p className={classes.term}>{term}</p>
                  <ul className={classes.innerList}>
                    {references.map((reference) => (
                      <li key={reference.id}>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: reference.sentence,
                          }}
                        />
                        <a
                          href={`/books/${reference.bookId}/pages/${reference.pageNumber}`}
                          target="_blank"
                          className={classes.bookLink}>
                          {reference.bookTitle}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              )
          )}
        </ul>
      )}
    </div>
  );
}

function NoSentences({ text }) {
  return (
    <div>
      <p>No references found for &quot;{text}&quot;:</p>
      <ul>
        <li>This may be a new term.</li>
        <li>
          The page containing this word may not be marked as &quot;read&quot;
          (see{" "}
          <a
            href="https://luteorg.github.io/lute-manual/faq/terms/sentences-only-shown-when-page-is-read.html"
            target="_blank"
            rel="noopener noreferrer">
            the manual
          </a>
          ).
        </li>
        <li>Books containing this term may have been deleted.</li>
      </ul>
    </div>
  );
}

export default Sentences;
