import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  makeStyles,
  CircularProgress,
  Snackbar,
  Paper,
  Container,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSpring, animated } from "react-spring";
import RoundSummary from "./RoundSummary";
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
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(3),
    overflow: "hidden",
  },
  paper: {
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    flex: 1,
  },
  questionContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    width: "100%",
  },
  timer: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing(2),
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));

const QuizScreen = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizSettings, setQuizSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const settings = JSON.parse(localStorage.getItem("quizSettings"));
    if (!settings) {
      navigate("/");
      return;
    }
    setQuizSettings(settings);
    setTimeLeft(settings.timePerQuestion);
    if (location.state && location.state.round) {
      setCurrentRound(location.state.round);
      const storedUsedQuestionIds = JSON.parse(
        localStorage.getItem("usedQuestionIds") || "[]"
      );
      setUsedQuestionIds(storedUsedQuestionIds);
    } else {
      setCurrentRound(1);
      setUsedQuestionIds([]);
      localStorage.removeItem("usedQuestionIds");
    }
    fetchQuestions();
  }, [user, navigate, location]);

  const fetchQuestions = async () => {
    try {
      const q = query(
        collection(firestore, "questions"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (fetchedQuestions.length === 0) {
        setError(
          "No questions available. Please add some questions before starting a quiz."
        );
        setIsLoading(false);
        return;
      }
      const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random());
      setAllQuestions(shuffled);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to fetch questions. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (allQuestions.length > 0 && quizSettings) {
      const unusedQuestions = allQuestions.filter(
        (q) => !usedQuestionIds.includes(q.id)
      );
      const newRoundQuestions = unusedQuestions.slice(
        0,
        quizSettings.questionsPerRound
      );

      if (newRoundQuestions.length < quizSettings.questionsPerRound) {
        console.error("Not enough questions:", {
          allQuestions: allQuestions.length,
          unusedQuestions: unusedQuestions.length,
          needed: quizSettings.questionsPerRound,
          usedQuestionIds: usedQuestionIds,
        });
        setError(
          "Not enough unique questions left for this round. Please add more questions or reduce the number of questions per round."
        );
        return;
      }

      setCurrentRoundQuestions(newRoundQuestions);
      setCurrentQuestion(0);

      // Don't update usedQuestionIds here, we'll do it after the round is complete
    }
  }, [currentRound, allQuestions, quizSettings, usedQuestionIds]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion + 1 < currentRoundQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(quizSettings.timePerQuestion);
    } else {
      setShowRoundSummary(true);
    }
  }, [currentQuestion, quizSettings, currentRoundQuestions.length]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizSettings) {
      handleNextQuestion();
    }
  }, [timeLeft, quizSettings, handleNextQuestion]);

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setTimeLeft(quizSettings.timePerQuestion);
    }
  };

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "ArrowRight") {
        handleNextQuestion();
      } else if (event.key === "ArrowLeft") {
        handlePrevQuestion();
      }
    },
    [handleNextQuestion, handlePrevQuestion]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleViewCorrectAnswers = () => {
    const newUsedQuestionIds = [
      ...usedQuestionIds,
      ...currentRoundQuestions.map((q) => q.id),
    ];
    setUsedQuestionIds(newUsedQuestionIds);
    localStorage.setItem("usedQuestionIds", JSON.stringify(newUsedQuestionIds));

    navigate("/correct-answers", {
      state: {
        round: currentRound,
        questions: currentRoundQuestions,
      },
    });
  };

  if (isLoading) {
    return (
      <Container className={classes.root}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={classes.root}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/questions")}
        >
          {t.addQuestions}
        </Button>
      </Container>
    );
  }

  if (showRoundSummary) {
    return (
      <RoundSummary
        onBack={() => {
          setShowRoundSummary(false);
          setCurrentQuestion(currentRoundQuestions.length - 1);
          setTimeLeft(quizSettings.timePerQuestion);
        }}
        onForward={handleViewCorrectAnswers}
        currentRound={currentRound}
      />
    );
  }

  return (
    <animated.div style={fadeIn} className={classes.root}>
      <Container className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h4" gutterBottom>
            {t.round} {currentRound}
          </Typography>
          <div className={classes.questionContainer}>
            <Typography variant="h5" gutterBottom>
              {t.question} {currentQuestion + 1}
            </Typography>
            <Typography variant="body1">
              {currentRoundQuestions[currentQuestion]?.question ||
                t.noQuestionsAvailable}
            </Typography>
          </div>
          <Typography variant="h6" className={classes.timer}>
            {timeLeft}s
          </Typography>
          <animated.div
            className={classes.progressBar}
            style={{
              width: timeLeft * (100 / quizSettings.timePerQuestion) + "%",
            }}
          />
        </Paper>
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            {t.previous}
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNextQuestion}
            color="primary"
          >
            {t.next}
          </Button>
        </div>
      </Container>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <MuiAlert elevation={6} variant="filled" severity="error">
          {error}
        </MuiAlert>
      </Snackbar>
    </animated.div>
  );
};

export default QuizScreen;
