import { Wifi, WifiOff, AlertCircle, Loader2, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconBRUTM from "@/shared/assets/logo.svg";
import { ROUTES } from "@/shared/config";
import { useAuth } from "@/shared/lib/hook";
import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
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
            <p className="text-xl font-bold text-white">BR-UTM</p>
            <p className="text-sm text-gray-300">UTM Traffic Control System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="text"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          color="inherit"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};
