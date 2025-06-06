import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { randomId } from "@mantine/hooks";
import {
  Box,
  Checkbox,
  Divider,
  Fieldset,
  Group,
  LoadingOverlay,
  Select,
  TextInput,
} from "@mantine/core";
import {
  IconAbc,
  IconAlt,
  IconAnalyzeFilled,
  IconCut,
} from "@tabler/icons-react";
import FormButtons from "@common/FormButtons/FormButtons";
import LanguageSelect from "./LanguageSelect";
import DictionaryBars from "./components/DictionaryBars";
import InsertDictionaryButton from "./components/InsertDictionaryButton";
import useSelectedLanguage from "@language/hooks/useSelectedLanguage";
import useLanguageForm from "@language/hooks/useLanguageForm";
import { parsersQuery } from "../../api/query";
import classes from "./LanguageForm.module.css";

function LanguageForm() {
  const [params] = useSearchParams();
  const langId = params.get("langId");
  const { data: parsers } = useQuery(parsersQuery);
  const { language, isSuccess } = useSelectedLanguage();

  const form = useLanguageForm();

  useEffect(() => {
    if (isSuccess && language) {
      const { dictionaries, ...rest } = language;
      setFormValues(rest, dictionaries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isSuccess]);

  useEffect(() => {
    if (!langId) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langId]);

  return (
    <form>
      <LanguageSelect form={form} />

      <Divider mt="md" mb="xs" />

      <Box pos="relative" className={classes.container}>
        <LoadingOverlay
          visible={!isSuccess && langId}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />

        <Fieldset
          variant="filled"
          legend="Dictionaries"
          styles={{
            legend: { fontWeight: 500 },
          }}>
          <div className={classes.flex}>
            <InsertDictionaryButton form={form} />
            <DictionaryBars form={form} />
          </div>
        </Fieldset>

        <Checkbox
          label="Show pronunciation field"
          key={form.key("show_romanization")}
          {...form.getInputProps("show_romanization", { type: "checkbox" })}
        />

        <Checkbox
          label="Is right-to-left"
          key={form.key("right_to_left")}
          {...form.getInputProps("right_to_left", { type: "checkbox" })}
        />

        <Select
          w="fit-content"
          label="Parse as"
          leftSection={<IconAnalyzeFilled />}
          withCheckIcon={false}
          searchable={false}
          allowDeselect={false}
          data={parsers}
          key={form.key("parser_type")}
          {...form.getInputProps("parser_type")}
        />

        <TextInput
          label="Character substitutions"
          leftSection={<IconAlt />}
          key={form.key("character_substitutions")}
          {...form.getInputProps("character_substitutions")}
        />

        <Group align="flex-end">
          <TextInput
            flex={1}
            label="Split sentences at"
            description="default: all Unicode sentence terminators"
            leftSection={<IconCut />}
            key={form.key("split_sentences")}
            {...form.getInputProps("split_sentences")}
          />
          <TextInput
            flex={2}
            label="Exceptions"
            key={form.key("split_sentence_exceptions")}
            {...form.getInputProps("split_sentence_exceptions")}
          />
        </Group>

        <TextInput
          label="Word characters"
          description="default: all Unicode letters and marks"
          leftSection={<IconAbc />}
          key={form.key("word_chars")}
          {...form.getInputProps("word_chars")}
        />

        <FormButtons />
      </Box>
    </form>
  );

  function setFormValues(rest, dictionaries) {
    form.setValues(rest);
    // for defined, there shouldn't be a need for key. we can save the key when saving dicts
    const dicts = dictionaries.map((dict) => ({ ...dict, key: randomId() }));
    form.setFieldValue("dictionaries", dicts);
  }
}

export default LanguageForm;
