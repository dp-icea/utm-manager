import { Map, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconBRUTM from "@/shared/assets/logo.svg";
import { ROUTES } from "@/shared/config";
import { useAuth } from "@/shared/lib/hook";
import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";
import { useMap } from "@/shared/lib/map";
import * as Cesium from "cesium";

import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";

export const Header = () => {
  const { logout } = useAuth();
  const { sceneMode, setSceneMode } = useMap();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const toggleSceneMode = () => {
    setSceneMode(
      sceneMode === Cesium.SceneMode.SCENE3D
        ? Cesium.SceneMode.SCENE2D
        : Cesium.SceneMode.SCENE3D,
    );
  };

  return (
    <header className="h-16 bg-gray-800 border-gray-700 border-b flex items-center justify-between px-4 relative z-30">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img
            src={IconBRUTM}
            alt="BR-UTM Logo"
            className="h-10 w-10 rounded-full"
          />
          <div className="flex flex-col items-start">
            <p className="text-xl font-bold text-white">BR-UTM Manager</p>
            <p className="text-sm text-gray-300">UTM Traffic Control System</p>
          </div>
        </div>
      </div>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => navigate("/drone-mapping")}
          color="inherit"
        >
          Drone Mapping
        </Button>
        <Button
          variant="outlined"
          startIcon={
            sceneMode === Cesium.SceneMode.SCENE3D ? <Globe /> : <Map />
          }
          onClick={toggleSceneMode}
          color="inherit"
        >
          {sceneMode === Cesium.SceneMode.SCENE3D ? "3D Mode" : "2D Mode"}
        </Button>
        <Button
          variant="text"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          color="inherit"
        >
          Logout
        </Button>
      </Box>
    </header>
  );
};
