import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge, Image, TagsInput, Text, Textarea } from "@mantine/core";
import {
  IconCheck,
  IconMinus,
  IconNumber0,
  IconNumber1,
  IconNumber2,
  IconNumber3,
  IconNumber4,
  IconNumber5,
} from "@tabler/icons-react";
import StatusRadio from "../StatusRadio/StatusRadio";
import PillCell from "./components/PillCell";
import { buildSuggestionsList } from "@actions/utils";
import { getTermSuggestionsQuery } from "@term/api/query";
import { MAX_PARENT_TAG_SUGGESTION_COUNT } from "@resources/constants";

const status = {
  0: { icon: IconNumber0, label: "Unknown" },
  1: { icon: IconNumber1, label: "New" },
  2: { icon: IconNumber2, label: "New" },
  3: { icon: IconNumber3, label: "Learning" },
  4: { icon: IconNumber4, label: "Learning" },
  5: { icon: IconNumber5, label: "Learned" },

  6: { icon: IconCheck, label: "Well Known" },
  7: { icon: IconMinus, label: "Ignored" },

  98: { icon: IconMinus, label: "Ignored" },
  99: { icon: IconCheck, label: "Well Known" },
};

const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const columnDefinition = (languageChoices, tagChoices) => [
  {
    header: "TERM",
    accessorKey: "text",
    minSize: 300,
    columnFilterModeOptions: ["contains", "startsWith", "endsWith"],
    enableClickToCopy: false,
    Cell: ({ row }) => (
      <Link
        to={`/terms/term?termId=${row.original.id}&langId=${row.original.languageId}`}
        style={{ color: "inherit", textDecoration: "none" }}>
        <Text
          size="sm"
          lineClamp={1}
          ta={row.original.languageRtl ? "right" : "left"}>
          {row.original.text}
        </Text>
      </Link>
    ),
    enableEditing: false,
  },
  {
    header: "PARENT",
    accessorKey: "parentsString",
    columnFilterModeOptions: ["contains", "startsWith", "endsWith"],
    minSize: 200,
    Cell: ({ row }) => {
      const parentsList = row.original.parentsString
        ? row.original.parentsString.split(",")
        : [];
      return <PillCell tagsList={parentsList} />;
    },
    Edit: ({ row, cell }) => {
      const parentsList = row.original.parentsString
        ? row.original.parentsString.split(",")
        : [];

      const [search, setSearch] = useState("");
      const [value, setValue] = useState(parentsList);
      const { data } = useQuery(
        getTermSuggestionsQuery(search, row.original.languageId)
      );

      const suggestions = data
        ? buildSuggestionsList(row.original.text, data).map(
            (item) => item.suggestion
          )
        : [];

      return (
        <TagsInput
          size="xs"
          w={160}
          searchValue={search}
          onSearchChange={setSearch}
          data={suggestions}
          limit={MAX_PARENT_TAG_SUGGESTION_COUNT}
          value={value}
          onChange={(parents) => {
            cell.row._valuesCache[cell.column.id] = parents.join(",");
            setValue(parents);
          }}
        />
      );
    },
  },
  {
    header: "TRANSLATION",
    accessorKey: "translation",
    columnFilterModeOptions: ["contains", "startsWith", "endsWith"],
    minSize: 300,
    size: 400,
    Cell: ({ row }) => {
      const img = row.original.image;
      return (
        <>
          <Text size="sm" component="span">
            {row.original.translation}
          </Text>
          {img && (
            <Image src={`http://localhost:5001${img}`} h={150} w="auto" />
          )}
        </>
      );
    },
    Edit: ({ row, cell }) => {
      const [value, setValue] = useState(cell.getValue());
      const img = row.original.image;
      return (
        <>
          <Textarea
            wrapperProps={{ dir: row.original.languageRtl ? "rtl" : "ltr" }}
            value={value}
            rows={1}
            size="xs"
            autosize
            spellCheck={false}
            autoCapitalize="off"
            onChange={(e) => {
              setValue(e.target.value);
              cell.row._valuesCache[cell.column.id] = e.target.value;
            }}
          />
          {img && (
            <Image
              mt={5}
              src={`http://localhost:5001${img}`}
              h={150}
              w="auto"
            />
          )}
        </>
      );
    },
  },
  {
    header: "TAGS",
    id: "tagsString",
    mantineFilterSelectProps: {
      data: tagChoices,
    },
    filterVariant: "select",
    columnFilterModeOptions: false,
    accessorKey: "tagsString",
    Cell: ({ row }) => {
      const tagsList = row.original.tagsString
        ? row.original.tagsString.split(",")
        : [];
      return <PillCell tagsList={tagsList} />;
    },
    Edit: ({ cell }) => {
      const tagsList = cell.getValue() ? cell.getValue().split(",") : [];
      const [value, setValue] = useState(tagsList);

      return (
        <TagsInput
          size="xs"
          w={160}
          data={tagChoices}
          value={value}
          onChange={(tags) => {
            cell.row._valuesCache[cell.column.id] = tags.join(",");
            setValue(tags);
          }}
        />
      );
    },
  },
  {
    header: "STATUS",
    id: "status",
    filterVariant: "range-slider",
    enableColumnFilterModes: false,
    enableClickToCopy: false,
    size: 210,
    accessorFn: (row) => {
      let id = row.statusId;
      if (row.statusId == 99) id = 6;
      if (row.statusId == 98) id = 7;
      return id;
    },
    Cell: ({ row }) => {
      const id = row.original.statusId;
      const label = id === 98 ? "−" : id === 99 ? "✓" : id;
      return (
        <Badge
          fw={600}
          size="md"
          leftSection={String(label)}
          c={`var(--lute-text-color-status${id})`}
          bg={`var(--lute-color-highlight-status${id}`}>
          {status[id].label}
        </Badge>
      );
    },
    mantineFilterRangeSliderProps: {
      min: 0,
      max: 7,
      step: 1,
      minRange: 0,
      marks: [
        { value: 0 },
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5 },
        { value: 6 },
        { value: 7 },
      ],
      label: (value) => status[value].label,
    },
    Edit: ({ row, cell }) => {
      const [value, setValue] = useState(String(row.original.statusId));
      return (
        <StatusRadio
          size="sm"
          value={value}
          onChange={(v) => {
            cell.row._valuesCache[cell.column.id] = v;
            setValue(v);
          }}
        />
      );
    },
  },
  {
    header: "LANGUAGE",
    accessorKey: "language",
    filterVariant: "select",
    columnFilterModeOptions: false,
    mantineFilterSelectProps: {
      data: languageChoices.map((lang) => lang.name),
    },
    enableClickToCopy: false,
    enableEditing: false,
  },
  {
    header: "ADDED ON",
    id: "createdOn",
    filterVariant: "date-range",
    accessorFn: (originalRow) => new Date(originalRow.createdOn),
    columnFilterModeOptions: false,
    enableClickToCopy: false,
    Cell: ({ cell }) => dateFormatter.format(cell.getValue()),
    mantineFilterDateInputProps: {
      miw: 100,
    },
    enableEditing: false,
  },
];

export default columnDefinition;
