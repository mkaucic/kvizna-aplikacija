import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import MinimizeIcon from "@material-ui/icons/Minimize";
import CropSquareIcon from "@material-ui/icons/CropSquare";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  titleBar: {
    height: "32px",
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    WebkitAppRegion: "drag",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  title: {
    marginLeft: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    color: theme.palette.text.primary,
  },
  controls: {
    WebkitAppRegion: "no-drag",
  },
  button: {
    padding: 6,
    color: theme.palette.mode === "dark" ? "white" : "inherit",
  },
}));

const TitleBar = () => {
  const classes = useStyles();
  const theme = useTheme();

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimize();
  };
  const handleMaximize = () => {
    if (window.electronAPI) window.electronAPI.maximize();
  };
  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.close();
  };

  return (
    <div className={classes.titleBar}>
      <div className={classes.title}>Kvizna Aplikacija</div>
      <div className={classes.controls}>
        <IconButton className={classes.button} onClick={handleMinimize}>
          <MinimizeIcon fontSize="small" />
        </IconButton>
        <IconButton className={classes.button} onClick={handleMaximize}>
          <CropSquareIcon fontSize="small" />
        </IconButton>
        <IconButton className={classes.button} onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
};

export default TitleBar;
