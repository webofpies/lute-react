import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Fieldset,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  TextInput,
} from "@mantine/core";
import {
  IconAbc,
  IconAlt,
  IconAnalyzeFilled,
  IconCut,
  IconSquareRoundedPlusFilled,
} from "@tabler/icons-react";
import {
  parsersQuery,
  predefinedListQuery,
  predefinedOptionsObj,
  definedOptionsObj,
} from "../../queries/language";
import { initialQuery } from "../../queries/settings";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import DictionaryBar from "../DictionaryBar/DictionaryBar";
import LanguageCards from "../LanguageCards/LanguageCards";
import classes from "./LanguageForm.module.css";

function LanguageForm() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const openedFromLanguages = pathname === "/languages";
  const lang = params.get("name");
  const langId = params.get("id");
  const predefinedSelected = langId === "0";
  const predefinedOptionsQuery = useQuery(
    predefinedOptionsObj(lang, predefinedSelected)
  );
  const definedOptionsQuery = useQuery(
    definedOptionsObj(lang, !predefinedSelected)
  );
  const { data: predefined } = useQuery(predefinedListQuery);
  const { data: parsers } = useQuery(parsersQuery);
  const { data: initial } = useQuery(initialQuery);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      right_to_left: false,
      show_romanization: false,
      parser_type: "spacedel",
      word_chars: "a-zA-ZÀ-ÖØ-öø-ȳáéíóúÁÉÍÓÚñÑ",
      character_substitutions: "´='|`='|’='|‘='|...=…|..=‥",
      split_sentences: ".!?",
      split_sentence_exceptions: "Mr.|Mrs.|Dr.|[A-Z].|Vd.|Vds.",
      dictionaries: [
        {
          for: "terms",
          type: "embedded",
          url: "",
          active: true,
          key: randomId(),
        },
        {
          for: "sentences",
          type: "popup",
          url: "",
          active: true,
          key: randomId(),
        },
      ],
    },
  });

  useEffect(() => {
    if (predefinedOptionsQuery.isSuccess) {
      const { dictionaries, ...rest } = predefinedOptionsQuery.data;
      setFormValues(rest, dictionaries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predefinedOptionsQuery.data, predefinedOptionsQuery.isSuccess]);

  useEffect(() => {
    if (definedOptionsQuery.isSuccess && openedFromLanguages) {
      const { dictionaries, ...rest } = definedOptionsQuery.data;
      setFormValues(rest, dictionaries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definedOptionsQuery.data, definedOptionsQuery.isSuccess]);

  return (
    <form>
      {openedFromLanguages && initial.haveLanguages && (
        <LanguageCards
          label="My languages"
          description="Edit existing language"
        />
      )}
      <LanguageSelect form={form} languages={predefined} />
      <Box pos="relative" className={classes.container}>
        <LoadingOverlay
          visible={
            predefinedSelected ? !predefinedOptionsQuery.isSuccess : false
          }
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
            <ActionIcon
              variant="transparent"
              color="green.6"
              onClick={() =>
                form.insertListItem("dictionaries", {
                  for: "terms",
                  type: "embedded",
                  url: "",
                  active: false,
                  key: randomId(),
                })
              }>
              <IconSquareRoundedPlusFilled />
            </ActionIcon>

            <ScrollArea.Autosize mah={300} offsetScrollbars="y" flex={1}>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="dnd-list" direction="vertical">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {form.getValues().dictionaries.map((dict, index) => (
                        <Draggable
                          index={index}
                          draggableId={dict.key}
                          key={dict.key}>
                          {(provided) => (
                            <DictionaryBar
                              form={form}
                              index={index}
                              dndProvided={provided}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </ScrollArea.Autosize>
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

        <Group justify="flex-end" mt="sm" gap="xs">
          <Button type="submit" disabled>
            Save
          </Button>
          <Button>Cancel</Button>
        </Group>
      </Box>
    </form>
  );

  function setFormValues(rest, dictionaries) {
    form.setValues(rest);
    // for defined, there shouldn't be a need for key. we can save the key when saving dicts
    const dicts = dictionaries.map((dict) => ({ ...dict, key: randomId() }));
    form.setFieldValue("dictionaries", dicts);
  }

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const reordered = reorderList(
      form.getValues().dictionaries,
      result.source.index,
      result.destination.index
    );

    form.setFieldValue("dictionaries", reordered);
  }
}

function reorderList(list, startIndex, endIndex) {
  const result = list;
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export default LanguageForm;
