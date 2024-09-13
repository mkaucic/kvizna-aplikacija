import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useLanguage } from "../LanguageContext";
import croatianFlag from "../images/croatian-flag.png";
import ukFlag from "../images/uk-flag.png";

const useStyles = makeStyles((theme) => ({
  toggleContainer: {
    width: 70,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.grey[300],
    display: "flex",
    alignItems: "center",
    padding: 2,
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.3s",
  },
  slider: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    transition: "transform 0.3s",
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    objectFit: "cover",
  },
  text: {
    fontWeight: "bold",
    color: theme.palette.text.primary,
    position: "absolute",
    transition: "opacity 0.3s",
  },
}));

const LanguageToggle = () => {
  const classes = useStyles();
  const { language, toggleLanguage } = useLanguage();

  return (
    <div
      className={classes.toggleContainer}
      onClick={toggleLanguage}
      style={{ backgroundColor: language === "hr" ? "#e0e0e0" : "#bdbdbd" }}
    >
      <div
        className={classes.slider}
        style={{
          transform: language === "hr" ? "translateX(0)" : "translateX(34px)",
        }}
      >
        <img
          src={language === "hr" ? croatianFlag : ukFlag}
          alt={language === "hr" ? "Croatian" : "English"}
          className={classes.flag}
        />
      </div>
      <span
        className={classes.text}
        style={{ left: 8, opacity: language === "hr" ? 0 : 1 }}
      >
        EN
      </span>
      <span
        className={classes.text}
        style={{ right: 8, opacity: language === "hr" ? 1 : 0 }}
      >
        HR
      </span>
    </div>
  );
};

export default LanguageToggle;
