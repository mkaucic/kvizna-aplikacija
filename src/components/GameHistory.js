import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import { Delete as DeleteIcon, Edit as EditIcon } from "@material-ui/icons";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";

const useStyles = makeStyles((theme) => ({
  root: {
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
  list: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
    overflowY: "auto",
    flex: 1,
  },
  table: {
    minWidth: 650,
  },
  deleteAllButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  actionButton: {
    color:
      theme.palette.mode === "dark"
        ? theme.palette.primary.light
        : theme.palette.primary.main,
  },
  deleteButton: {
    color:
      theme.palette.mode === "dark"
        ? theme.palette.error.light
        : theme.palette.error.main,
  },
  dialogPaper: {
    minWidth: "80%",
    maxWidth: "90%",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
}));

const GameHistory = () => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [editedGame, setEditedGame] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetchGames();
    return () => {
      setIsMounted(false);
    };
  }, []);

  const fetchGames = async () => {
    if (!isMounted) return;
    try {
      const userId = auth.currentUser.uid;
      const q = query(
        collection(firestore, "gameHistory"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      if (isMounted) {
        setGames(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            quizId: doc.data().quizId,
            quizName: doc.data().quizName,
            date: doc.data().date,
            time: doc.data().time,
            teams: doc.data().teams,
            ...doc.data(),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const handleViewGame = (game) => {
    setSelectedGame(game);
    setOpenDialog(true);
  };

  const handleEditGame = (game) => {
    setEditedGame({ ...game });
    setOpenDialog(true);
  };

  const handleDeleteGame = async (gameToDelete) => {
    try {
      console.log("Deleting game:", gameToDelete);
      const batch = writeBatch(firestore);

      // Delete the game from gameHistory
      const gameRef = doc(firestore, "gameHistory", gameToDelete.id);
      batch.delete(gameRef);

      // Update team archives
      for (const team of gameToDelete.teams) {
        console.log("Updating team archive for:", team.name);
        const teamRef = doc(
          firestore,
          "teamArchives",
          `${auth.currentUser.uid}_${team.name}`
        );

        // Get the current team archive data
        const teamDoc = await getDoc(teamRef);
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          const updatedQuizzes = teamData.quizzes.filter(
            (quiz) => quiz.quizId !== gameToDelete.quizId
          );

          // Update the team archive with the filtered quizzes
          if (updatedQuizzes.length === 0) {
            batch.delete(teamRef);
          } else {
            batch.update(teamRef, { quizzes: updatedQuizzes });
          }
        }
      }

      await batch.commit();
      console.log("Game and related team archive entries deleted successfully");
      await fetchGames();
    } catch (error) {
      console.error("Error deleting game and updating team archives:", error);
    }
  };

  const handleDeleteAllHistory = async () => {
    try {
      const batch = writeBatch(firestore);

      // Delete all games from gameHistory
      const gameHistoryQuery = query(
        collection(firestore, "gameHistory"),
        where("userId", "==", auth.currentUser.uid)
      );
      const gameHistorySnapshot = await getDocs(gameHistoryQuery);
      gameHistorySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete all team archives
      const teamArchivesQuery = query(
        collection(firestore, "teamArchives"),
        where("userId", "==", auth.currentUser.uid)
      );
      const teamArchivesSnapshot = await getDocs(teamArchivesQuery);
      teamArchivesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Commit the batch
      await batch.commit();

      console.log("All game history and team archives deleted successfully");
      if (isMounted) {
        setGames([]);
      }
    } catch (error) {
      console.error("Error deleting all history:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Update game history
      await updateDoc(doc(firestore, "gameHistory", editedGame.id), editedGame);

      // Update team archives
      const batch = writeBatch(firestore);
      for (const team of editedGame.teams) {
        const teamRef = doc(
          firestore,
          "teamArchives",
          `${auth.currentUser.uid}_${team.name}`
        );
        const teamDoc = await getDoc(teamRef);
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          const updatedQuizzes = teamData.quizzes.map((quiz) =>
            quiz.quizId === editedGame.quizId
              ? { ...quiz, quizName: editedGame.quizName }
              : quiz
          );
          batch.update(teamRef, { quizzes: updatedQuizzes });
        }
      }
      await batch.commit();

      console.log("Game and team archives updated successfully");
      fetchGames();
      setOpenDialog(false);
      setEditedGame(null);
    } catch (error) {
      console.error("Error updating game and team archives:", error);
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          {t.gameHistory}
        </Typography>
        <List className={classes.list}>
          {games.map((game) => (
            <ListItem key={game.id} button onClick={() => handleViewGame(game)}>
              <ListItemText
                primary={
                  <Typography color="textPrimary">
                    {game.quizName || t.unnamedQuiz}
                  </Typography>
                }
                secondary={
                  <Typography color="textSecondary">
                    {`${game.date.replace(/:/g, "/")} ${game.time}`}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditGame(game)}
                  className={classes.actionButton}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteGame(game)}
                  className={classes.deleteButton}
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  component={Link}
                  to={`/game-stats/${game.id}`}
                  color="primary"
                  size="small"
                >
                  {t.viewStats}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <div className={classes.buttonContainer}>
          <Button
            onClick={handleDeleteAllHistory}
            color="secondary"
            variant="contained"
            className={classes.deleteAllButton}
          >
            {t.deleteAllHistory}
          </Button>
          <Button
            onClick={() => navigate("/")}
            color="primary"
            variant="contained"
          >
            {t.backToHome}
          </Button>
        </div>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          classes={{ paper: classes.dialogPaper }}
        >
          <DialogTitle>
            {editedGame ? `${t.editGame}` : `${t.gameDetails}`}
          </DialogTitle>
          <DialogContent>
            {selectedGame && !editedGame && (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedGame.quizName || "Unnamed Quiz"}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {`${selectedGame.date.replace(/:/g, "/")} ${
                    selectedGame.time
                  }`}
                </Typography>
                <TableContainer component={Paper}>
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t.placement}</TableCell>
                        <TableCell>{t.team}</TableCell>
                        {Array.from({ length: selectedGame.rounds }, (_, i) => (
                          <TableCell key={i} align="right">
                            {t.round} {i + 1}
                          </TableCell>
                        ))}
                        <TableCell align="right">{t.totalScore}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedGame.teams
                        .sort((a, b) => a.placement - b.placement)
                        .map((team) => (
                          <TableRow key={team.name}>
                            <TableCell>{team.placement}</TableCell>
                            <TableCell>{team.name}</TableCell>
                            {team.scoresByRound.map((score, index) => (
                              <TableCell key={index} align="right">
                                {score}
                              </TableCell>
                            ))}
                            <TableCell align="right">
                              {team.totalScore}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
            {editedGame && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label={t.quizName}
                  type="text"
                  fullWidth
                  value={editedGame.quizName || ""}
                  onChange={(e) => {
                    setEditedGame({ ...editedGame, quizName: e.target.value });
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  autoFocus
                  margin="dense"
                  label={t.date}
                  type="text"
                  fullWidth
                  value={editedGame.date.replace(/:/g, "/")}
                  onChange={(e) => {
                    const newDate = e.target.value.replace(/\//g, ":");
                    setEditedGame({ ...editedGame, date: newDate });
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  margin="dense"
                  label={t.time}
                  type="time"
                  fullWidth
                  value={editedGame.time}
                  onChange={(e) => {
                    setEditedGame({ ...editedGame, time: e.target.value });
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              {t.close}
            </Button>
            {editedGame && (
              <Button onClick={handleSaveEdit} color="primary">
                {t.save}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
};

export default GameHistory;
