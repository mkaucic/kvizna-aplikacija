import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Grid,
  TextField,
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  useTheme,
  Avatar,
  Fab,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
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
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  teamList: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: theme.spacing(4),
    overflowY: "auto",
    flex: 1,
  },
  teamItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: theme.spacing(2),
  },
  teamAvatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    fontSize: "1.5rem",
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  addTeamButton: {
    margin: theme.spacing(2),
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(4),
  },
  dialogContent: {
    minWidth: 300,
  },
}));

const AVATAR_COLORS = [
  "#5652ab",
  "#4aad3b",
  "#b8b03e",
  "#8c1f1f",
  "#1f898c",
  "#f0e584",
  "#d97c55",
  "#c1e69e",
  "#d474d0",
  "#341d73",
];

const TeamList = () => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeam, setEditingTeam] = useState(null);
  const { language } = useLanguage();
  const t = translations[language];

  const handleBack = () => {
    navigate("/quiz-customization");
  };

  const handleForward = () => {
    if (teams.length < 2) {
      alert("Please add at least two teams before starting the quiz.");
      return;
    }
    const quizSettings = JSON.parse(localStorage.getItem("quizSettings"));
    const totalNeededQuestions =
      quizSettings.rounds * quizSettings.questionsPerRound;
    if (totalNeededQuestions > quizSettings.totalQuestions) {
      alert(
        `Not enough questions available. You need ${totalNeededQuestions} questions, but only ${quizSettings.totalQuestions} are available. Please go back and adjust the quiz settings.`
      );
      return;
    }
    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.removeItem("usedQuestionIds"); // Clear used questions when starting a new quiz
    navigate("/quiz", { state: { round: 1 } });
  };

  const handleAddTeam = () => {
    setOpenDialog(true);
    setEditingTeam(null);
    setNewTeamName("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTeamName("");
    setEditingTeam(null);
  };

  const handleSaveTeam = () => {
    if (editingTeam !== null) {
      setTeams(
        teams.map((team, index) =>
          index === editingTeam ? { ...team, name: newTeamName } : team
        )
      );
    } else {
      setTeams([...teams, { name: newTeamName, score: 0 }]);
    }
    handleCloseDialog();
  };

  const handleEditTeam = (index) => {
    setEditingTeam(index);
    setNewTeamName(teams[index].name);
    setOpenDialog(true);
  };

  const handleDeleteTeam = (index) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const handleTeamNameChange = (event) => {
    setNewTeamName(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSaveTeam();
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          {t.teamList}
        </Typography>
        <div className={classes.teamList}>
          {teams.map((team, index) => (
            <div key={index} className={classes.teamItem}>
              <Avatar
                className={classes.teamAvatar}
                style={{
                  backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                }}
              >
                {team.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="subtitle1">{team.name}</Typography>
              <div>
                <Tooltip title="Edit Team">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditTeam(index)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Team">
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleDeleteTeam(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
          <Fab
            color="secondary"
            aria-label="add"
            className={classes.addTeamButton}
            onClick={handleAddTeam}
          >
            <AddIcon />
          </Fab>
        </div>
        <div className={classes.navigationButtons}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {t.back}
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleForward}
            color="primary"
            disabled={teams.length < 2}
          >
            {t.startQuiz}
          </Button>
        </div>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingTeam !== null ? t.editTeam : t.addNewTeam}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            autoFocus
            margin="dense"
            label={t.teamName}
            fullWidth
            value={newTeamName}
            onChange={handleTeamNameChange}
            onFocus={(event) => event.target.select()}
            onKeyPress={handleKeyPress}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            {t.cancel}
          </Button>
          <Button
            onClick={handleSaveTeam}
            color="primary"
            disabled={!newTeamName.trim()}
          >
            {t.save}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeamList;
