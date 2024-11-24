// lute\templates\read\termpopup.html

import { Pill, PillGroup } from "@mantine/core";
import PopupDataSection from "./PopupDataSection";
import classes from "./PopupData.module.css";

export default function PopupData({ data }) {
  return (
    <div className={classes.container}>
      <p className={classes.term}>
        {data.term} {data.parentTerms && `(${data.parentTerms})`}
      </p>

      {data.romanization && <em>{data.romanization}</em>}

      {data.images.map((img) => {
        // /userimages/lang/term
        // temporary hack
        const res = img.split("/");
        return (
          <img
            key={img}
            className={classes.image}
            src={`http://localhost:5001/api/image/${res[res.length - 2]}/${res[res.length - 1]}`}
          />
        );
      })}

      {data.translation && (
        <p className={classes.translation}>{data.translation}</p>
      )}

      {data.tags && (
        <PillGroup>
          {data.tags.map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
        </PillGroup>
      )}

      {data.parentData.length > 0 && (
        <table>
          {data.componentData.length > 0 && (
            <thead>
              <tr>
                <td>Parents</td>
              </tr>
            </thead>
          )}
          <PopupDataSection data={data.parentData} />
        </table>
      )}

      {data.componentData.length > 0 && (
        <table>
          {data.parentData.length > 0 && (
            <thead>
              <tr>
                <td>Components</td>
              </tr>
            </thead>
          )}
          <PopupDataSection data={data.componentData} />
        </table>
      )}
    </div>
  );
}
