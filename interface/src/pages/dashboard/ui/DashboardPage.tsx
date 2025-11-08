import { Header } from "./Header";
import { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { MapViewer } from "./MapViewer";
import { SidebarPanel } from "./SidebarPanel";
import { MapProvider } from "@/shared/lib/map";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { StripsProvider } from "@/shared/lib/strips";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/shared/ui";

export const DashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<ImperativePanelHandle>(null);

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

          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1"
            autoSaveId="dashboard-panels"
          >
            <ResizablePanel
              id="sidebar"
              ref={sidebarRef}
              defaultSize={20}
              minSize={0}
              maxSize={40}
              collapsedSize={0}
              collapsible
              onCollapse={() => setSidebarCollapsed(true)}
              onExpand={() => setSidebarCollapsed(false)}
            >
              <SidebarPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="main" defaultSize={80} minSize={40}>
              <Box sx={{ height: "100%", position: "relative" }}>
                <IconButton
                  onClick={() => {
                    if (sidebarCollapsed) {
                      sidebarRef.current?.expand();
                    } else {
                      sidebarRef.current?.collapse();
                    }
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 10,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                </IconButton>
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
              </Box>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Box>
      </StripsProvider>
    </MapProvider>
  );
};
