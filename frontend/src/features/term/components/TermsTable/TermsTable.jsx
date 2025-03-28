import { memo, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Group, Modal } from "@mantine/core";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconPlus } from "@tabler/icons-react";
import TermActions from "./components/TermActions";
import BulkTermForm from "../BulkTermForm/BulkTermForm";
import ShowParentsOnlyChip from "./components/ShowParentsOnlyChip";
import EmptyRow from "@common/EmptyRow/EmptyRow";
import TableTopToolbarDefaultItems from "@common/TableTopToolbarDefaultItems/TableTopToolbarDefaultItems";
import TableTopToolbar from "@common/TableTopToolbar/TableTopToolbar";
import getDefaultTableOptions from "@resources/table-options-default";
import columnDefinition from "./columnDefinition";
import { initialQuery } from "@settings/api/settings";
import { getTagSuggestionsQuery } from "@term/api/query";

const defaultOptions = getDefaultTableOptions();

const PAGINATION = {
  pageIndex: 0,
  pageSize: 25,
};

const COLUMN_FILTER_FNS = {
  text: "contains",
  parentsString: "contains",
  translation: "contains",
  language: "contains",
};

const COLUMN_FILTERS = [{ id: "status", value: [0, 6] }];

//build the URL (start=0&size=10&filters=[]&globalFilter=&sorting=[])
const url = new URL("/api/terms", "http://localhost:5001");

function TermsTable() {
  const [params] = useSearchParams();
  const termIds = params.get("ids");

  const { data: initial } = useQuery(initialQuery);
  const { data: termTags } = useQuery(getTagSuggestionsQuery);
  const [editModalOpened, setEditModalOpened] = useState(false);

  const [showParentsOnly, setShowParentsOnly] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState(PAGINATION);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState(COLUMN_FILTERS);
  const [columnFilterFns, setColumnFilterFns] = useState(COLUMN_FILTER_FNS);

  const [columnVisibility, setColumnVisibility] = useState({
    // tags: false,
    "createdOn": false,
    "parentsString": true,
    "mrt-row-actions": false,
  });

  const columns = useMemo(
    () => columnDefinition(initial.languageChoices, termTags, setColumnFilters),
    [initial.languageChoices, termTags]
  );

  url.searchParams.set("ids", termIds);
  url.searchParams.set("parentsOnly", showParentsOnly);
  url.searchParams.set(
    "start",
    `${pagination.pageIndex * pagination.pageSize}`
  );
  url.searchParams.set("size", `${pagination.pageSize}`);
  url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
  url.searchParams.set("filterModes", JSON.stringify(columnFilterFns ?? {}));
  url.searchParams.set("globalFilter", globalFilter ?? "");
  url.searchParams.set("sorting", JSON.stringify(sorting ?? []));

  const response = useQuery({
    queryKey: ["terms", url.href],
    queryFn: async () => {
      const response = await fetch(url.href);
      return await response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });

  const handleSaveRow = async ({ table, values }) => {
    //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
    // tableData[row.index] = values;
    // const data = {
    //   parentsString: values.parentsString,
    //   translation: values.translation,
    //   tags: values.tags,
    //   status: values.status,
    // };
    console.log(values);
    //send/receive api updates here
    table.setEditingRow(null); //exit editing mode
  };

  const data = response.data;
  const table = useMantineReactTable({
    ...defaultOptions,

    columns: columns,
    data: data?.data || [],
    rowCount: data?.filteredCount,
    localization: {
      min: "From",
      max: "To",
    },

    initialState: {
      ...defaultOptions.initialState,
    },

    state: {
      columnFilterFns,
      columnFilters,
      globalFilter,
      pagination,
      sorting,
      columnVisibility,
    },

    enableRowSelection: true,
    enableColumnFilterModes: true,
    enableEditing: true,
    editDisplayMode: "row",

    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onColumnFilterFnsChange: setColumnFilterFns,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onEditingRowSave: handleSaveRow,

    getRowId: (originalRow) => originalRow.id,

    mantineTableBodyCellProps: ({ cell }) => {
      const termCell = cell.column.id === "text";
      const isRtl = cell.row.original.languageRtl;
      return {
        style: isRtl && termCell ? { textAlign: "right" } : {},
      };
    },

    mantineTableBodyRowProps: ({ row, table }) => {
      const isEditing = table.getState().editingRow?.id === row.id;
      const isSelected = row.getIsSelected();

      const style = {};
      if (isSelected) style.backgroundColor = "initial";
      if (isEditing) style.verticalAlign = "top";

      return {
        style: style,
      };
    },

    renderEmptyRowsFallback: ({ table }) => {
      const language = table.getColumn("language").getFilterValue();
      const isLanguageFiltered = language?.length > 0;
      return isLanguageFiltered ? (
        <EmptyRow tableName="terms" language={language} />
      ) : null;
    },

    renderTopToolbar: ({ table }) => (
      <TableTopToolbar>
        <Group gap={5} wrap="nowrap">
          {!termIds && (
            <Button
              color="green"
              size="xs"
              component={Link}
              to="/terms/term"
              leftSection={<IconPlus size={22} />}>
              New
            </Button>
          )}
          <TermActions
            table={table}
            onSetEditModalOpened={setEditModalOpened}
          />
        </Group>
        <Group wrap="nowrap">
          <ShowParentsOnlyChip
            show={showParentsOnly}
            onShow={setShowParentsOnly}
            onSetColumnVisibility={setColumnVisibility}
          />
          <TableTopToolbarDefaultItems table={table} />
        </Group>
      </TableTopToolbar>
    ),
  });

  return (
    <>
      <MantineReactTable table={table} />
      <Modal
        trapFocus
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        styles={{ title: { fontWeight: 700 } }}
        title="Edit term(s)"
        withCloseButton>
        <BulkTermForm terms={table.getSelectedRowModel().rows} />
      </Modal>
    </>
  );
}

export default memo(TermsTable);
