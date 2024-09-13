import { createTheme } from "@material-ui/core/styles";

const createAppTheme = (mode) => {
  console.log("Creating theme with mode:", mode);
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: mode === "light" ? "#2196f3" : "#90caf9",
      },
      secondary: {
        main: mode === "light" ? "#f50057" : "#f48fb1",
      },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#303030",
        paper: mode === "light" ? "#ffffff" : "#424242",
      },
      text: {
        primary:
          mode === "light"
            ? "rgba(0, 0, 0, 0.87)"
            : "rgba(255, 255, 255, 0.87)",
        secondary:
          mode === "light" ? "rgba(0, 0, 0, 0.54)" : "rgba(255, 255, 255, 0.7)",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
    },
    overrides: {
      MuiButton: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
      MuiPaper: {
        root: {
          backgroundColor: mode === "light" ? "#ffffff" : "#424242",
        },
      },
      MuiTableCell: {
        root: {
          borderBottom:
            mode === "light"
              ? "1px solid rgba(224, 224, 224, 1)"
              : "1px solid rgba(81, 81, 81, 1)",
        },
        head: {
          fontWeight: 700,
          backgroundColor: mode === "light" ? "#f5f5f5" : "#2c2c2c",
        },
      },
    },
  });
};

export default createAppTheme;
