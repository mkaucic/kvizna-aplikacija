import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  Grid,
  makeStyles,
  List,
  ListItem,
  ListItemText,
  Paper,
  useTheme,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.default,
    overflow: "hidden",
  },
  paper: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  answerContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    overflowY: "auto",
    flex: 1,
  },
  navigationButton: {
    margin: theme.spacing(1),
  },
}));

const CorrectAnswers = () => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRound, setCurrentRound] = useState(1);
  const [questions, setQuestions] = useState([]);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (location.state) {
      setCurrentRound(location.state.round);
      setQuestions(location.state.questions || []);
    }
  }, [location]);

  const handleForward = () => {
    navigate("/scoreboard", {
      state: {
        round: currentRound,
        setupComplete: location.state.setupComplete,
      },
    });
  };

  return (
    <Grid container direction="column" className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          {t.correctAnswers} - {t.round} {currentRound}
        </Typography>
        <List className={classes.answerContainer}>
          {questions.map((q, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <Typography color="textPrimary">{`${t.question} ${
                    index + 1
                  }: ${q.question}`}</Typography>
                }
                secondary={
                  <Typography color="textSecondary">{`${t.answer}: ${q.answer}`}</Typography>
                }
              />
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={handleForward}
          className={classes.navigationButton}
        >
          {t.proceedToScoring}
        </Button>
      </Paper>
    </Grid>
  );
};

export default CorrectAnswers;
