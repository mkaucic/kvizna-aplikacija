import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Typography,
  Box,
  makeStyles,
  IconButton,
  useTheme,
  Paper,
} from "@material-ui/core";
import {
  PlayArrow,
  List,
  ExitToApp,
  Brightness4,
  Brightness7,
} from "@material-ui/icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";
import LanguageToggle from "./LanguageToggle";

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
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxHeight: "90%",
    overflowY: "auto",
  },
  title: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
    textAlign: "center",
  },
  button: {
    margin: theme.spacing(1),
    width: 200,
  },
  toggleContainer: {
    position: "absolute",
    top: theme.spacing(8),
    right: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  themeToggle: {
    padding: 8,
  },
  userEmail: {
    marginBottom: theme.spacing(2),
    fontStyle: "italic",
  },
}));

const StartScreen = ({ toggleTheme }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  const handleNewQuiz = () => navigate("/quiz-customization");
  const handleQuestions = () => navigate("/questions");
  const handleQuit = () => window.close();

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Container className={classes.root} maxWidth="sm">
      <div className={classes.toggleContainer}>
        <LanguageToggle />
        <IconButton
          onClick={toggleTheme}
          color="inherit"
          className={classes.themeToggle}
        >
          {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </div>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h2" className={classes.title} color="textPrimary">
          {t.quizApp}
        </Typography>
        {user && (
          <Typography
            variant="subtitle1"
            className={classes.userEmail}
            color="textSecondary"
          >
            {t.loggedInAs} {user.email}
          </Typography>
        )}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleNewQuiz}
            className={classes.button}
          >
            {t.newQuiz}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/game-history")}
            className={classes.button}
          >
            {t.gameHistory}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/team-archives")}
            className={classes.button}
          >
            {t.teamArchives}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<List />}
            onClick={handleQuestions}
            className={classes.button}
          >
            {t.questions}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleLogout}
            className={classes.button}
          >
            {t.logout}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ExitToApp />}
            onClick={handleQuit}
            className={classes.button}
          >
            {t.quit}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default StartScreen;
