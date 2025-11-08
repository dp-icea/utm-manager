import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { Header } from "./Header";
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

const FloatingClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const zuluTime = currentTime.toISOString().substring(11, 19) + "Z";

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        px: 3,
        py: 1.5,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontFamily: "monospace", fontWeight: "bold" }}
      >
        {zuluTime}
      </Typography>
    </Paper>
  );
};

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
              minSize={20}
              maxSize={40}
              collapsible
            >
              <SidebarPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="main" defaultSize={80} minSize={40}>
              <Box sx={{ height: "100%", position: "relative" }}>
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
                <FloatingClock />
              </Box>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Box>
      </StripsProvider>
    </MapProvider>
  );
};
