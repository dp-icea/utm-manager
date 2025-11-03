import { Cartesian3 } from "cesium";
import { useEffect } from "react";
import { Map, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconBRUTM from "@/shared/assets/logo.svg";
import { ROUTES } from "@/shared/config";
import { useAuth } from "@/shared/lib/hook";
import { useCesium } from "resium";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { useMap } from "@/shared/lib/map";
import * as Cesium from "cesium";
import { useLanguage } from "@/shared/lib/lang";
import { Languages } from "lucide-react";

import LogoutIcon from "@mui/icons-material/Logout";
import AdjustIcon from "@mui/icons-material/Adjust";
import SettingsIcon from "@mui/icons-material/Settings";

export const Header = () => {
  const { logout } = useAuth();
  const { sceneMode, setSceneMode, viewer } = useMap();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

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

  const onCenterCamera = () => {
    if (!viewer) {
      console.log("Viewer not available from the header");
      return;
    }

    const [latitude, longitude] = [-23.701465417218216, -46.696952192815985];
    const cameraAltitude = 5000;

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        cameraAltitude,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-70),
        roll: 0,
      },
    });
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
            <p className="text-xl font-bold text-white">{t("header.title")}</p>
            <p className="text-sm text-gray-300">{t("header.subtitle")}</p>
          </div>
        </div>
      </div>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AdjustIcon />}
          onClick={onCenterCamera}
          color="inherit"
        >
          {t("common.centerCamera")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => navigate("/drone-mapping")}
          color="inherit"
        >
          {t("header.droneMapping")}
        </Button>
        <Button
          variant="outlined"
          startIcon={
            sceneMode === Cesium.SceneMode.SCENE3D ? <Globe /> : <Map />
          }
          onClick={toggleSceneMode}
          color="inherit"
        >
          {sceneMode === Cesium.SceneMode.SCENE3D
            ? t("common.3dMode")
            : t("common.2dMode")}
        </Button>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "pt")}
            sx={{
              color: "inherit",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.23)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              ".MuiSvgIcon-root": { color: "white" },
            }}
            startAdornment={<Languages size={16} style={{ marginRight: 8 }} />}
          >
            <MenuItem value="en">{t("common.english")}</MenuItem>
            <MenuItem value="pt">{t("common.portuguese")}</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="text"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          color="inherit"
        >
          {t("header.logout")}
        </Button>
      </Box>
    </header>
  );
};
