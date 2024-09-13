import React, { useState, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import createAppTheme from "./theme.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { LanguageProvider } from "./LanguageContext";

import StartScreen from "./components/StartScreen.js";
import QuizCustomization from "./components/QuizCustomization.js";
import TeamList from "./components/TeamList.js";
import QuizScreen from "./components/QuizScreen.js";
import CorrectAnswers from "./components/CorrectAnswers.js";
import Scoreboard from "./components/Scoreboard.js";
import QuestionList from "./components/QuestionList.js";
import FinalScores from "./components/FinalScores.js";
import CurrentStandings from "./components/CurrentStandings.js";
import GameHistory from "./components/GameHistory.js";
import RoundSummary from "./components/RoundSummary.js";
import Login from "./components/Login";
import Signup from "./components/Signup";
import TeamArchives from "./components/TeamArchives.js";
import TeamPerformanceStats from "./components/TeamPerformanceStats.js";
import TitleBar from "./components/TitleBar.js";
import withScreenPadding from "./components/withScreenPadding.js";
import "./index.css";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  content: {
    flexGrow: 1,
    marginTop: 32, // Height of the TitleBar
    height: "calc(100vh - 32px)", // Subtract TitleBar height
    overflow: "hidden", // Prevent scrolling at this level
  },
}));

const PaddedStartScreen = withScreenPadding(StartScreen);
const PaddedQuizCustomization = withScreenPadding(QuizCustomization);
const PaddedTeamList = withScreenPadding(TeamList);
const PaddedQuizScreen = withScreenPadding(QuizScreen);
const PaddedCorrectAnswers = withScreenPadding(CorrectAnswers);
const PaddedScoreboard = withScreenPadding(Scoreboard);
const PaddedQuestionList = withScreenPadding(QuestionList);
const PaddedFinalScores = withScreenPadding(FinalScores);
const PaddedCurrentStandings = withScreenPadding(CurrentStandings);
const PaddedGameHistory = withScreenPadding(GameHistory);
const PaddedRoundSummary = withScreenPadding(RoundSummary);
const PaddedTeamArchives = withScreenPadding(TeamArchives);
const PaddedTeamPerformanceStats = withScreenPadding(TeamPerformanceStats);

function App() {
  const [user, loading] = useAuthState(auth);
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const classes = useStyles();
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className={classes.root}>
          <TitleBar />
          <main className={classes.content}>
            <Routes>
              <Route
                path="/login"
                element={user ? <Navigate to="/" /> : <Login />}
              />
              <Route
                path="/signup"
                element={user ? <Navigate to="/" /> : <Signup />}
              />
              <Route
                path="/"
                element={
                  user ? (
                    <PaddedStartScreen toggleTheme={toggleTheme} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/quiz-customization"
                element={
                  user ? <PaddedQuizCustomization /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/team-list"
                element={user ? <PaddedTeamList /> : <Navigate to="/login" />}
              />
              <Route
                path="/quiz"
                element={user ? <PaddedQuizScreen /> : <Navigate to="/login" />}
              />
              <Route
                path="/correct-answers"
                element={
                  user ? <PaddedCorrectAnswers /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/scoreboard"
                element={user ? <PaddedScoreboard /> : <Navigate to="/login" />}
              />
              <Route
                path="/current-standings"
                element={
                  user ? <PaddedCurrentStandings /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/final-scores"
                element={
                  user ? <PaddedFinalScores /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/questions"
                element={
                  user ? <PaddedQuestionList /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/game-history"
                element={
                  user ? <PaddedGameHistory /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/round-summary"
                element={
                  user ? <PaddedRoundSummary /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/team-archives"
                element={
                  user ? <PaddedTeamArchives /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/game-stats/:gameId"
                element={
                  user ? (
                    <PaddedTeamPerformanceStats />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
