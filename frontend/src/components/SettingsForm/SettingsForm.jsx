import { useQuery } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import {
  Button,
  Checkbox,
  Fieldset,
  Group,
  NativeSelect,
  NumberInput,
  rem,
  Stack,
  TextInput,
} from "@mantine/core";
import { IconDatabase, IconTorii, IconNotes } from "@tabler/icons-react";
import MeCabInfo from "./MeCabInfo";
import { settingsQuery } from "../../queries/settings";

function SettingsForm() {
  const { data: settings } = useQuery(settingsQuery);

  const form = useForm({
    mode: "controlled",
    initialValues: {
      ...settings,
    },
    enhanceGetInputProps: ({ form, field }) => {
      const enabledField = "backup_enabled";
      if (field.includes("backup") && field !== enabledField) {
        return { disabled: !form.getValues()[enabledField] };
      }
    },
  });

  const fieldsetFz = rem(17);
  return (
    <form>
      <Stack gap={10}>
        <Fieldset
          variant="filled"
          legend="Backup"
          styles={{
            legend: { fontSize: fieldsetFz, fontWeight: 500 },
          }}>
          <Stack gap={5}>
            <Checkbox
              label="Enabled"
              key={form.key("backup_enabled")}
              {...form.getInputProps("backup_enabled", { type: "checkbox" })}
            />
            <TextInput
              label="Directory"
              leftSection={<IconDatabase />}
              key={form.key("backup_dir")}
              {...form.getInputProps("backup_dir")}
            />
            <Checkbox
              label="Run automatically (daily)"
              key={form.key("backup_auto")}
              {...form.getInputProps("backup_auto", { type: "checkbox" })}
            />
            <Checkbox
              label="Warn if backup hasn't run in a week"
              key={form.key("backup_warn")}
              {...form.getInputProps("backup_warn", { type: "checkbox" })}
            />
            <Checkbox
              label="Retain backup count"
              key={form.key("backup_count")}
              {...form.getInputProps("backup_count", { type: "checkbox" })}
            />
          </Stack>
        </Fieldset>
        <Fieldset
          variant="filled"
          legend="Behaviour"
          styles={{
            legend: {
              fontSize: fieldsetFz,
              fontWeight: 500,
            },
          }}>
          <Stack gap={5} align="flex-start">
            <Checkbox
              label="Open popup in new tab"
              key={form.key("open_popup_in_new_tab")}
              {...form.getInputProps("open_popup_in_new_tab", {
                type: "checkbox",
              })}
            />
            <Checkbox
              label="Stop audio on term form open"
              key={form.key("stop_audio_on_term_form_open")}
              {...form.getInputProps("stop_audio_on_term_form_open", {
                type: "checkbox",
              })}
            />
            <NumberInput
              label="Book stats page sample size"
              leftSection={<IconNotes />}
              key={form.key("stats_calc_sample_size")}
              {...form.getInputProps("stats_calc_sample_size")}
            />
          </Stack>
        </Fieldset>
        <Fieldset
          variant="filled"
          legend="Japanese"
          styles={{
            legend: { fontSize: fieldsetFz, fontWeight: 500 },
          }}>
          <Stack gap={5}>
            <Group gap={5} align="flex-end" wrap="nowrap">
              <TextInput
                flex={1}
                label="MECAB_PATH environment variable"
                leftSection={<IconTorii />}
                rightSection={<MeCabInfo />}
                key={form.key("mecab_path")}
                {...form.getInputProps("mecab_path")}
              />
              <Button>Test my MeCab configuration</Button>
            </Group>
            <NativeSelect
              styles={{ root: { alignSelf: "flex-start" } }}
              label="Pronunciation characters"
              data={[
                { label: "Katakana", value: "katakana" },
                { label: "Hiragana", value: "hiragana" },
                { label: "Romanji", value: "romanji" },
              ]}
              key={form.key("japanese_reading")}
              {...form.getInputProps("japanese_reading")}
            />
          </Stack>
        </Fieldset>
      </Stack>
      <Group justify="flex-end" mt="sm" gap="xs">
        <Button type="submit">Save</Button>
        <Button>Cancel</Button>
      </Group>
    </form>
  );
}

export default SettingsForm;
