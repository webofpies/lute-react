import { useQuery } from "@tanstack/react-query";
import {
  ActionIcon,
  Group,
  InputClearButton,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  IconSearch,
  IconSelector,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { initialQuery } from "@settings/api/settings";

function BooksGridTopToolbar({
  activeLang,
  setActiveLang,
  shelf,
  onSetShelf,
  sorting,
  onSetSorting,
  sortingDirection,
  onSetSortDirection,
  globalFilter,
  onSetGlobalFilter,
  hasArchived,
}) {
  const { data: initial } = useQuery(initialQuery);

  const langFieldRSection = activeLang ? (
    <InputClearButton onClick={() => setActiveLang(null)} />
  ) : (
    <IconSelector size={16} />
  );

  const globalFilterFieldRSection = globalFilter && (
    <InputClearButton onClick={() => onSetGlobalFilter("")} />
  );

  const sortingDirectionIcon =
    sortingDirection === "desc" ? (
      <IconSortDescending />
    ) : (
      <IconSortAscending />
    );

  const sortingFieldRSection = sorting ? (
    <InputClearButton onClick={() => onSetSorting(null)} />
  ) : (
    <IconSelector size={16} />
  );

  const shelfFieldRSection =
    shelf !== "active" ? (
      <InputClearButton onClick={() => onSetShelf("active")} />
    ) : (
      <IconSelector size={16} />
    );

  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Stack gap={5} flex={1} align="flex-start" maw={240}>
        <Select
          value={shelf}
          onChange={onSetShelf}
          placeholder="Shelf"
          allowDeselect={false}
          data={[
            { label: "Show: Active", value: "active" },
            {
              label: "Show: All",
              value: "all",
              disabled: !hasArchived,
            },
            {
              label: "Show: Archived",
              value: "archived",
              disabled: !hasArchived,
            },
          ]}
          rightSection={shelfFieldRSection}
        />

        <Group gap={5} wrap="nowrap" align="center">
          <Select
            value={sorting}
            onChange={onSetSorting}
            placeholder="Sort by"
            allowDeselect={false}
            data={[
              { value: "title", label: "Title" },
              { value: "lastRead", label: "Last read date" },
              { value: "wordCount", label: "Word count" },
              { value: "status", label: "Status" },
            ]}
            rightSection={sortingFieldRSection}
          />

          <Tooltip
            label={`Sorting direction: ${sortingDirection}`}
            disabled={!sorting}>
            <ActionIcon
              size="input-sm"
              variant="subtle"
              color="dimmed"
              disabled={!sorting}
              onClick={() =>
                onSetSortDirection((dir) => (dir === "desc" ? "asc" : "desc"))
              }>
              {sortingDirectionIcon}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
      <Stack gap={5} flex={1} align="flex-end" maw={240}>
        <TextInput
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => onSetGlobalFilter(e.currentTarget.value)}
          leftSection={<IconSearch />}
          rightSection={globalFilterFieldRSection}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />

        <Select
          value={activeLang}
          onChange={setActiveLang}
          placeholder="All languages"
          allowDeselect={false}
          data={initial.languageChoices.map((language) => language.name)}
          rightSection={langFieldRSection}
        />
      </Stack>
    </Group>
  );
}

export default BooksGridTopToolbar;
