import {
  ActionIcon,
  Button,
  Checkbox,
  Fieldset,
  Group,
  NativeSelect,
  NumberInput,
  Popover,
  rem,
  Stack,
  TextInput,
} from "@mantine/core";
import {
  IconDatabase,
  IconTorii,
  IconNotes,
  IconQuestionMark,
} from "@tabler/icons-react";
import MeCabInfo from "./MeCabInfo";

function SettingsForm() {
  const fieldsetFz = rem(20);
  return (
    <form>
      <Stack gap={rem(10)}>
        <Fieldset
          variant="filled"
          legend="Backup"
          styles={{
            legend: { fontSize: fieldsetFz, fontWeight: 500 },
          }}>
          <Stack gap={rem(5)}>
            <Checkbox label="Enabled" />
            <TextInput label="Directory" leftSection={<IconDatabase />} />
            <Checkbox label="Run automatically (daily)" />
            <Checkbox label="Warn if backup hasn't run in a week" />
            <Checkbox label="Retain backup count" />
          </Stack>
        </Fieldset>
        <Fieldset
          variant="filled"
          legend="Behaviour"
          styles={{
            legend: { fontSize: fieldsetFz, fontWeight: 500 },
          }}>
          <Stack gap={rem(5)} align="flex-start">
            <Checkbox label="Open popup in new tab" />
            <Checkbox label="Stop audio on term form open" />
            <NumberInput
              label="Book stats page sample size"
              leftSection={<IconNotes />}
            />
          </Stack>
        </Fieldset>
        <Fieldset
          variant="filled"
          legend="Japanese"
          styles={{
            legend: { fontSize: fieldsetFz, fontWeight: 500 },
          }}>
          <Stack gap={rem(5)}>
            <Group gap={rem(5)} align="flex-end" wrap="nowrap">
              <TextInput
                flex={1}
                label="MECAB_PATH environment variable"
                leftSection={<IconTorii />}
                rightSection={
                  <Popover position="top" withArrow shadow="sm">
                    <Popover.Target>
                      <ActionIcon variant="transparent">
                        <IconQuestionMark />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <MeCabInfo />
                    </Popover.Dropdown>
                  </Popover>
                }
              />
              <Button>Test my MeCab configuration</Button>
            </Group>
            <NativeSelect
              styles={{ root: { alignSelf: "flex-start" } }}
              label="Pronunciation characters"
              data={["Katakana", "Hiragana", "Romanji"]}
            />
          </Stack>
        </Fieldset>
      </Stack>
    </form>
  );
}

export default SettingsForm;
