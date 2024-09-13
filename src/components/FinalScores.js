import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Typography,
  Button,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Snackbar,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {
  collection,
  addDoc,
  doc,
  writeBatch,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";

const useStyles = makeStyles((theme) => ({
  rroot: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.default,
    overflow: "hidden",
    padding: theme.spacing(3),
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
  table: {
    minWidth: 650,
  },
  winner: {
    fontWeight: "bold",
    color: theme.palette.success.main,
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
}));

const FinalScores = () => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [teams, setTeams] = useState([]);
  const [quizSettings, setQuizSettings] = useState({});
  const [gameSaved, setGameSaved] = useState(false);
  const [error, setError] = useState("");
  const { language } = useLanguage();
  const t = translations[language];

  const saveTeamResults = useCallback(
    async (quizId) => {
      if (!user || teams.length === 0) return;

      try {
        const batch = writeBatch(firestore);

        for (const team of teams) {
          const teamRef = doc(
            firestore,
            "teamArchives",
            `${user.uid}_${team.name}`
          );

          const quizResult = {
            quizId: quizId,
            quizName: quizSettings.quizName || "Unnamed Quiz",
            date: new Date().toISOString(),
            score: team.score || 0,
            placement: team.placement,
            rounds: team.scoresByRound || [],
          };

          // Get the current team archive data
          const teamDoc = await getDoc(teamRef);
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            const updatedQuizzes = [...(teamData.quizzes || []), quizResult];
            batch.update(teamRef, { quizzes: updatedQuizzes });
          } else {
            batch.set(teamRef, {
              userId: user.uid,
              teamName: team.name,
              quizzes: [quizResult],
            });
          }
        }

        await batch.commit();
        console.log("Team results saved to archives");
      } catch (error) {
        console.error("Error saving team results:", error);
        setError("Failed to save team results. " + error.message);
      }
    },
    [user, teams, quizSettings]
  );

  useEffect(() => {
    console.log("FinalScores component mounted/updated");

    if (!user) {
      navigate("/login");
      return;
    }

    const teamsFromState = location.state?.teams || [];
    const teamsFromStorage = JSON.parse(localStorage.getItem("teams")) || [];
    const finalTeams =
      teamsFromState.length > 0 ? teamsFromState : teamsFromStorage;

    console.log("Final teams:", finalTeams);

    setTeams(finalTeams);
    setQuizSettings(JSON.parse(localStorage.getItem("quizSettings")) || {});
  }, [location, navigate, user]);

  const saveGameHistory = useCallback(async () => {
    if (!user || gameSaved || teams.length === 0) return;

    try {
      const now = new Date();
      const quizId = now.getTime().toString(); // Use timestamp as quizId
      const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${now.getFullYear()}`;
      const formattedTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Calculate total possible points
      const pointsPerQuestion = 1; // Adjust this if your questions have different point values
      const totalPossiblePoints =
        quizSettings.rounds *
        quizSettings.questionsPerRound *
        pointsPerQuestion;

      const newGame = {
        quizId: quizId,
        userId: user.uid,
        date: formattedDate,
        time: formattedTime,
        quizName: quizSettings.quizName || "Unnamed Quiz",
        teams: teams.map((team, index) => ({
          name: team.name,
          scoresByRound: team.scoresByRound || [],
          totalScore: team.score,
          placement: team.placement,
        })),
        rounds: quizSettings.rounds || 0,
        questionsPerRound: quizSettings.questionsPerRound || 0,
        totalPossiblePoints: totalPossiblePoints,
      };

      const docRef = await addDoc(
        collection(firestore, "gameHistory"),
        newGame
      );
      console.log("Game history saved successfully with ID:", docRef.id);
      setGameSaved(true);

      // Save team results after game history is saved
      await saveTeamResults(quizId);
    } catch (error) {
      console.error("Error saving game history:", error);
      setError("Failed to save game history. " + error.message);
    }
  }, [user, gameSaved, teams, quizSettings, saveTeamResults]);

  useEffect(() => {
    if (teams.length > 0 && user && !gameSaved) {
      saveGameHistory();
    }
  }, [teams, user, gameSaved, saveGameHistory]);

  const handleBack = () => {
    navigate(-1);
  };

  if (teams.length === 0) {
    return (
      <div className={classes.root}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h4" gutterBottom color="textPrimary">
            {t.noTeamsAvailable}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t.noTeamsToDisplay}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            style={{ marginTop: "20px" }}
          >
            {t.backToHome}
          </Button>
        </Paper>
      </div>
    );
  }

  const winner = teams[0];

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          {t.finalScores}
        </Typography>

        <TableContainer className={classes.scoreContainer}>
          <Table className={classes.table} aria-label="final scores table">
            <TableHead>
              <TableRow>
                <TableCell>{t.position}</TableCell>
                <TableCell>{t.team}</TableCell>
                {Array.from({ length: quizSettings.rounds }, (_, i) => (
                  <TableCell key={i} align="right">
                    {t.round} {i + 1}
                  </TableCell>
                ))}
                <TableCell align="right">{t.totalScore}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow
                  key={team.name}
                  className={index === 0 ? classes.winner : ""}
                >
                  <TableCell component="th" scope="row">
                    <Typography color="textPrimary">{index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textPrimary">{team.name}</Typography>
                  </TableCell>
                  {team.scoresByRound.map((score, roundIndex) => (
                    <TableCell key={roundIndex} align="right">
                      <Typography color="textPrimary">{score}</Typography>
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Typography color="textPrimary">{team.score}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h5" gutterBottom className={classes.winner}>
          {t.winner}: {winner.name} {t.with} {winner.score} {t.points}!
        </Typography>

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
            onClick={() => navigate("/")}
          >
            {t.backToHome}
          </Button>
        </div>
      </Paper>

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
    </div>
  );
};

export default FinalScores;
