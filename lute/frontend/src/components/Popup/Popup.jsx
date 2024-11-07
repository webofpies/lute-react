import { memo, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import PopupInfo from "./PopupInfo";

const queryClient = new QueryClient();

function Popup({ children, id }) {
  const [opened, { close, open }] = useDisclosure(false);
  const [popupData, setPopupData] = useState(null);

  return (
    <Popover
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
      onOpen={async () => setPopupData(await handleFetch(id))}
      onMouseEnter={open}
      onMouseLeave={close}>
      <Popover.Target>{children}</Popover.Target>
      {popupData && (
        <Popover.Dropdown>
          <PopupInfo data={popupData} />
        </Popover.Dropdown>
      )}
    </Popover>
  );
}

async function handleFetch(id) {
  try {
    const data = await queryClient.fetchQuery({
      queryKey: ["popupData", id],
      queryFn: async () => {
        const response = await fetch(`http://localhost:5001/read/popup/${id}`);
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
