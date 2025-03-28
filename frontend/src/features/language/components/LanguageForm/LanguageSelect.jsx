import { useState, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Combobox,
  Input,
  InputBase,
  ScrollArea,
  useCombobox,
} from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";
import { predefinedLanguagesQuery } from "@language/api/query";

function LanguageSelect() {
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  const { data: languages } = useQuery(predefinedLanguagesQuery);

  const [value, setValue] = useState(null);
  const [search, setSearch] = useState("");

  const shouldFilterOptions = languages.every((item) => item !== search);
  const filteredOptions = shouldFilterOptions
    ? languages.filter((item) =>
        item.toLowerCase().includes(search.toLowerCase().trim())
      )
    : languages;

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  function handleClearField() {
    setSearch("");
    setValue(null);
    params.delete("name");
    params.delete("langId");
    setParams(params);
  }

  function handleChange(e) {
    combobox.openDropdown();
    combobox.updateSelectedOptionIndex();
    setSearch(e.currentTarget.value);
  }

  function handleOnBlur() {
    combobox.closeDropdown();
    setSearch(value || "");
  }

  function handleOptionSubmit(val) {
    if (val === "$create") {
      setValue(search);
    } else {
      setValue(val);
      setSearch(val);
      setParams({ langId: 0, name: val });
    }

    combobox.closeDropdown();
  }

  const inputRightSection =
    value !== null ? (
      <Input.ClearButton onClick={handleClearField} />
    ) : (
      <Combobox.Chevron />
    );

  useEffect(() => {
    const lang = params.get("name");
    const id = params.get("langId");
    const openedFromLanguages = pathname === "/languages";

    if (lang && openedFromLanguages) {
      setSearch(lang);
      setValue(lang);
    }
    if (id !== "0") {
      setSearch("");
      setValue(null);
    }
  }, [params, pathname]);

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={handleOptionSubmit}>
      <Combobox.Target>
        <InputBase
          mb={10}
          w="fit-content"
          label="New language"
          description="Create new or from predefined"
          placeholder="e.g. Arabic"
          leftSection={<IconLanguage />}
          rightSection={inputRightSection}
          rightSectionPointerEvents={value === null ? "none" : "all"}
          value={search}
          onChange={handleChange}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={handleOnBlur}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={400} type="scroll">
            {filteredOptions.map((item) => (
              <Combobox.Option value={item} key={item}>
                {item}
              </Combobox.Option>
            ))}
            {filteredOptions.length === 0 && search.trim().length > 0 && (
              <Combobox.Option value="$create">
                + Create {search}
              </Combobox.Option>
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default memo(LanguageSelect);
