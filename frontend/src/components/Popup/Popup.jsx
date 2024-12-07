import { memo, useState } from "react";
import { Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { QueryClient } from "@tanstack/react-query";
import PopupData from "./PopupData";

const queryClient = new QueryClient();

function Popup({ children, id }) {
  const [opened, { close, open }] = useDisclosure(false);
  const [popupData, setPopupData] = useState(null);

  return (
    <Popover
      position="bottom"
      middlewares={{ flip: { fallbackPlacements: ["top", "right", "left"] } }}
      transitionProps={{
        duration: 150,
        transition: "fade-up",
        enterDelay: 50,
        exitDelay: 0,
      }}
      floatingStrategy="fixed"
      keepMounted={false}
      withArrow
      shadow="md"
      opened={opened}
      onOpen={async () => setPopupData(await handleFetch(id))}
      onMouseEnter={open}
      onMouseLeave={close}
      onContextMenu={close}>
      <Popover.Target>{children}</Popover.Target>
      <Popover.Dropdown
        style={{
          pointerEvents: "none",
          visibility: popupData ? "visible" : "hidden",
        }}>
        <PopupData data={popupData} />
      </Popover.Dropdown>
    </Popover>
  );
}

async function handleFetch(id) {
  try {
    const data = await queryClient.fetchQuery({
      queryKey: ["popupData", id],
      queryFn: async () => {
        const response = await fetch(
          `http://localhost:5001/api/terms/${id}/popup`
        );
        return await response.json();
      },
      enabled: id !== null,
      staleTime: Infinity,
    });
    return data;
  } catch (error) {
    console.log(error);
  }
}

export default memo(Popup);
