import { Text, ThemeIcon } from "@mantine/core";
import {
  IconDatabase,
  IconExclamationMark,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";

const databaseCleaned = {
  title: "Database cleaned!",
  message: (
    <Text component="p" lineClamp={2} fz="sm">
      Have fun! Lute has also automatically enabled backups: change your
      Settings as needed
    </Text>
  ),
  position: "bottom-right",
  autoClose: 5000,
  withBorder: true,
  icon: <IconDatabase />,
  color: "green",
};

const demoDeactivated = {
  title: "Demo mode deactivated!",
  message: (
    <Text component="p" lineClamp={2} fz="sm">
      Have fun! Lute has also automatically enabled backups: change your
      Settings as needed
    </Text>
  ),
  position: "bottom-right",
  autoClose: 5000,
  withBorder: true,
  icon: <IconPlayerPlayFilled />,
  color: "green",
};

const errorMessage = (message) => ({
  title: "Something went wrong",
  message: (
    <Text component="p" lineClamp={2} fz="xs">
      {message}
    </Text>
  ),
  position: "bottom-center",
  autoClose: 6000,
  withCloseButton: false,
  withBorder: true,
  icon: (
    <ThemeIcon radius="50%" color="red">
      <IconExclamationMark />
    </ThemeIcon>
  ),
  color: "red",
});

export { databaseCleaned, demoDeactivated, errorMessage };
