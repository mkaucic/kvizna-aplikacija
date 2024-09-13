import React from "react";
import { Typography, Button, Paper, makeStyles } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.background.default,
    overflow: "hidden",
  },
  paper: {
    padding: theme.spacing(6),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 600,
    width: "100%",
  },
  message: {
    marginBottom: theme.spacing(4),
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing(4),
  },
}));

const RoundSummary = ({ onBack, onForward, currentRound }) => {
  const classes = useStyles();
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className={classes.root}>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h4" gutterBottom>
          {t.roundComplete.replace("{round}", currentRound)}
        </Typography>
        <Typography variant="h6" className={classes.message}>
          {t.correctAnswersComing}
        </Typography>
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            color="default"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            {t.backToLastQuestion}
          </Button>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={onForward}
          >
            {t.viewCorrectAnswers}
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default RoundSummary;
