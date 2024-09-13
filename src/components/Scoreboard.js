import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  Grid,
  TextField,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  CircularProgress,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import CurrentStandings from "./CurrentStandings";
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
  scoreContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    overflowY: "auto",
    flex: 1,
  },
  navigationButton: {
    margin: theme.spacing(1),
  },
  table: {
    minWidth: 650,
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
}));

const Scoreboard = () => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [currentRound, setCurrentRound] = useState(1);
  const [teams, setTeams] = useState([]);
  const [newScores, setNewScores] = useState({});
  const [quizSettings, setQuizSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStandings, setShowStandings] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

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

    if (location.state && location.state.round) {
      setCurrentRound(location.state.round);
    }

    const storedTeams = JSON.parse(localStorage.getItem("teams")) || [];
    setTeams(storedTeams);

    const initialScores = {};
    storedTeams.forEach((team) => {
      initialScores[team.name] = 0;
    });
    setNewScores(initialScores);

    setLoading(false);
  }, [location, navigate, user]);

  const handleScoreChange = (teamName, score) => {
    const numScore = Number(score);
    if (isNaN(numScore)) return; // Not a number, ignore

    const maxScore = quizSettings.questionsPerRound;
    const validScore = Math.max(0, Math.min(numScore, maxScore)); // Clamp between 0 and max

    setNewScores((prev) => ({
      ...prev,
      [teamName]: validScore,
    }));
  };

  const handleSubmitScores = () => {
    const updatedTeams = teams.map((team) => ({
      ...team,
      score: (team.score || 0) + (newScores[team.name] || 0),
      scoresByRound: [...(team.scoresByRound || []), newScores[team.name] || 0],
    }));

    // Sort teams by score in descending order
    updatedTeams.sort((a, b) => b.score - a.score);

    // Assign placements
    updatedTeams.forEach((team, index) => {
      team.placement = index + 1;
    });

    setTeams(updatedTeams);
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setShowStandings(true);
  };

  const handleBack = () => {
    navigate(-1); // This will take the user back to the previous screen
  };

  const handleContinue = () => {
    if (quizSettings && currentRound < quizSettings.rounds) {
      const usedQuestionIds = JSON.parse(
        localStorage.getItem("usedQuestionIds") || "[]"
      );
      navigate("/quiz", {
        state: {
          round: currentRound + 1,
          usedQuestionIds: usedQuestionIds,
        },
      });
    } else {
      navigate("/final-scores", {
        state: {
          teams: teams,
          setupComplete: true,
        },
      });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!quizSettings) {
    return <Typography>{t.errorQuizSettingsNotFound}</Typography>;
  }

  if (showStandings) {
    return (
      <CurrentStandings
        teams={teams}
        currentRound={currentRound}
        totalRounds={quizSettings.rounds}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <Grid container direction="column" className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          {t.scoreboardRound.replace("{round}", currentRound)}
        </Typography>

        <TableContainer className={classes.scoreContainer}>
          <Table className={classes.table} aria-label="scoreboard">
            <TableHead>
              <TableRow>
                <TableCell>{t.team}</TableCell>
                <TableCell align="right">{t.totalScore}</TableCell>
                <TableCell align="right">{t.addPoints}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.name}>
                  <TableCell component="th" scope="row">
                    <Typography color="textPrimary">{team.name}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="textPrimary">
                      {team.score || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      label={t.addScore}
                      variant="outlined"
                      size="small"
                      value={newScores[team.name] || ""}
                      onChange={(e) =>
                        handleScoreChange(team.name, e.target.value)
                      }
                      inputProps={{
                        min: 0,
                        max: quizSettings.questionsPerRound,
                        step: 1,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className={classes.buttonContainer}>
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
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={handleSubmitScores}
            className={classes.navigationButton}
          >
            {t.currentStandings}
          </Button>
        </div>
      </Paper>
    </Grid>
  );
};

export default Scoreboard;
