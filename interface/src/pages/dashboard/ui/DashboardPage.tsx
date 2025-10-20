import { Header } from "./Header";
import { Box } from "@mui/material";
import { MapViewer } from "./MapViewer";
import { SidebarPanel } from "./SidebarPanel";
import { MapProvider } from "@/shared/lib/map";
import { StripsProvider } from "@/shared/lib/strips";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/shared/ui";

export const DashboardPage = () => {
  return (
    <MapProvider>
      <StripsProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            bgcolor: "background.default",
          }}
        >
          <Header />
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <SidebarPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={70}>
              <Box
                component="main"
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapViewer />
              </Box>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Box>
      </StripsProvider>
    </MapProvider>
  );
};
