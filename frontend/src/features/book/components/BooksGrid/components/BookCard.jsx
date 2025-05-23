import { Link } from "react-router-dom";
import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconArchiveFilled,
  IconArchiveOff,
  IconChevronDown,
  IconCircleCheckFilled,
  IconHeadphonesFilled,
  IconTrashFilled,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import StatsChart from "./StatsChart";
import TagsGroup from "@common/TagsGroup/TagsGroup";
import { useDeleteBook, useEditBook } from "@book/api/mutation";
import { getFormDataFromObj } from "@actions/utils";
import { deleteBookConfirm } from "@resources/modals";

function BookCard({ book, onEditSuccess }) {
  const deleteBookMutation = useDeleteBook();
  const editBookMutation = useEditBook();

  function handleEdit(id, data) {
    editBookMutation.mutate(
      {
        id: id,
        data: getFormDataFromObj(data),
      },
      {
        onSuccess: (response) => {
          if (response.archivedCount === 0) {
            onEditSuccess();
          }
        },
      }
    );
  }

  return (
    <Paper withBorder radius="md" p="md" pos="relative">
      <Group
        justify="space-between"
        align="flex-start"
        wrap="nowrap"
        style={{ overflow: "hidden" }}>
        <Group
          gap={5}
          wrap="nowrap"
          align="flex-start"
          style={{ overflow: "hidden" }}>
          <ThemeIcon
            style={{ alignItems: "flex-end" }}
            size="sm"
            color={book.isCompleted ? "green.6" : "dark.1"}
            variant="transparent">
            <IconCircleCheckFilled />
          </ThemeIcon>

          <div>
            <UnstyledButton
              component={Link}
              to={`/books/${book.id}/pages/${book.currentPage}`}
              style={{ display: "block" }}>
              <Text fw={500} fz="md" lineClamp={2} mt="-4px">
                {book.title}
              </Text>
            </UnstyledButton>

            <Text fz="xs" c="dimmed">
              {book.language}
            </Text>

            <Box>
              {book.audioName && (
                <ThemeIcon
                  size="xs"
                  variant="transparent"
                  color="dimmed"
                  opacity="0.4">
                  <IconHeadphonesFilled />
                </ThemeIcon>
              )}
              {book.isArchived && (
                <ThemeIcon
                  size="xs"
                  variant="transparent"
                  color="dimmed"
                  opacity="0.4">
                  <IconArchiveFilled />
                </ThemeIcon>
              )}
            </Box>
          </div>

          {book.currentPage > 1 && book.currentPage !== book.pageCount && (
            <Text component="span" size="xs" c="dimmed">
              ({book.currentPage}/{book.pageCount})
            </Text>
          )}
        </Group>

        <Box w={90} h={90} miw={90}>
          <StatsChart book={book} />
        </Box>

        <Menu>
          <Menu.Target>
            <ActionIcon
              pos="absolute"
              right={5}
              top={5}
              color="dimmed"
              variant="transparent"
              size="sm">
              <IconChevronDown stroke={1} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {book.isArchived ? (
              <Menu.Item
                color="orange"
                leftSection={<IconArchiveOff />}
                onClick={() => handleEdit(book.id, { action: "unarchive" })}>
                Unarchive
              </Menu.Item>
            ) : (
              <Menu.Item
                color="orange"
                leftSection={<IconArchiveFilled />}
                onClick={() => handleEdit(book.id, { action: "archive" })}>
                Archive
              </Menu.Item>
            )}
            <Menu.Item
              color="red"
              leftSection={<IconTrashFilled />}
              onClick={() =>
                modals.openConfirmModal(
                  deleteBookConfirm(book.title, () =>
                    deleteBookMutation.mutate(book.id)
                  )
                )
              }>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Divider mt={16} mb={16} />

      <Stack gap={5}>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Word count
          </Text>
          <Text size="sm">{book.wordCount}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Tags
          </Text>
          <TagsGroup tags={book.tags} />
        </Group>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Last read
          </Text>
          <Text size="sm">
            {book.lastRead && <span>{dayjs(book.lastRead).fromNow()}</span>}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

export default BookCard;
