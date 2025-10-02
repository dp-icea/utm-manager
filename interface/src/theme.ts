import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "hsl(222, 47%, 45%)",
      light: "hsl(222, 47%, 55%)",
      dark: "hsl(222, 47%, 35%)",
    },
    secondary: {
      main: "hsl(222, 47%, 65%)",
    },
    background: {
      default: "hsl(222, 47%, 11%)",
      paper: "hsl(217, 33%, 17%)",
    },
    text: {
      primary: "hsl(210, 40%, 98%)",
      secondary: "hsl(215, 20%, 65%)",
    },
    error: {
      main: "hsl(0, 62%, 50%)",
    },
    warning: {
      main: "hsl(38, 92%, 50%)",
    },
    success: {
      main: "hsl(142, 76%, 36%)",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "6px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "1px solid hsl(217, 33%, 25%)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "6px",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});
