import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Slider,
  Button,
  Grid,
  makeStyles,
  Snackbar,
  TextField,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  slider: {
    width: "300px",
    margin: "20px 0",
  },
  navigationButton: {
    margin: theme.spacing(1),
  },
  quizNameInput: {
    marginBottom: theme.spacing(3),
  },
}));

const QuizCustomization = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [rounds, setRounds] = useState(3);
  const [questionsPerRound, setQuestionsPerRound] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [error, setError] = useState("");
  const [quizName, setQuizName] = useState("");
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchQuestionCount();
  }, [user, navigate]);

  const fetchQuestionCount = async () => {
    try {
      const q = query(
        collection(firestore, "questions"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      setTotalQuestions(querySnapshot.size);
    } catch (err) {
      console.error("Error fetching question count:", err);
      setError("Failed to fetch question count. Please try again.");
    }
  };

  const checkQuestionAvailability = (roundsCount, questionsCount) => {
    const totalNeededQuestions = roundsCount * questionsCount;
    if (totalNeededQuestions > totalQuestions) {
      setError(
        `Not enough questions available. You need ${totalNeededQuestions} questions, but only ${totalQuestions} are available.`
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleForward = () => {
    if (checkQuestionAvailability(rounds, questionsPerRound)) {
      if (!quizName.trim()) {
        setError("Please enter a quiz name.");
        return;
      }
      localStorage.setItem(
        "quizSettings",
        JSON.stringify({
          rounds,
          questionsPerRound,
          timePerQuestion,
          totalQuestions,
          quizName,
        })
      );
      navigate("/team-list");
    }
  };

  const handleRoundsChange = (_, newValue) => {
    setRounds(newValue);
    checkQuestionAvailability(newValue, questionsPerRound);
  };

  const handleQuestionsPerRoundChange = (_, newValue) => {
    setQuestionsPerRound(newValue);
    checkQuestionAvailability(rounds, newValue);
  };

  return (
    <Grid container direction="column" className={classes.root}>
      <Typography variant="h4" gutterBottom>
        {t.quizCustomization}
      </Typography>
      <TextField
        className={classes.quizNameInput}
        label={t.quizName}
        variant="outlined"
        fullWidth
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
      />
      <Typography gutterBottom>{t.numberOfRounds}</Typography>
      <Slider
        className={classes.slider}
        value={rounds}
        onChange={handleRoundsChange}
        min={1}
        max={10}
        step={1}
        marks
        valueLabelDisplay="auto"
      />
      <Typography gutterBottom>{t.questionsPerRound}</Typography>
      <Slider
        className={classes.slider}
        value={questionsPerRound}
        onChange={handleQuestionsPerRoundChange}
        min={1}
        max={20}
        step={1}
        marks
        valueLabelDisplay="auto"
      />
      <Typography gutterBottom>{t.timePerQuestion}</Typography>
      <Slider
        className={classes.slider}
        value={timePerQuestion}
        onChange={(_, newValue) => setTimePerQuestion(newValue)}
        min={10}
        max={120}
        step={5}
        marks
        valueLabelDisplay="auto"
      />
      <Grid container justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          className={classes.navigationButton}
        >
          {t.back}
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={handleForward}
          className={classes.navigationButton}
          color="primary"
          disabled={!!error || !quizName.trim()}
        >
          {t.next}
        </Button>
      </Grid>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="error"
          onClose={() => setError("")}
        >
          {error}
        </MuiAlert>
      </Snackbar>
    </Grid>
  );
};

export default QuizCustomization;
