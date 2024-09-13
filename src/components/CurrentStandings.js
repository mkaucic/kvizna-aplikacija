import React from "react";
import { useNavigate } from "react-router-dom";
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
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
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
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  standingsContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    overflowY: "auto",
    flex: 1,
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

const CurrentStandings = ({ teams, currentRound, totalRounds, onContinue }) => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const handleBack = () => {
    navigate(-1);
  };

  if (!teams || teams.length === 0) {
    return (
      <div className={classes.root}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h6" gutterBottom color="error">
            {t.noTeamsData}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            className={classes.navigationButton}
          >
            {t.backToHome}
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          {t.currentStandingsAfterRound} {currentRound}
        </Typography>
        <TableContainer className={classes.standingsContainer}>
          <Table className={classes.table} aria-label="standings table">
            <TableHead>
              <TableRow>
                <TableCell>{t.position}</TableCell>
                <TableCell>{t.team}</TableCell>
                {Array.from({ length: currentRound }, (_, i) => (
                  <TableCell key={i} align="right">
                    {t.round} {i + 1}
                  </TableCell>
                ))}
                <TableCell align="right">{t.totalScore}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team, index) => (
                <TableRow key={team.name}>
                  <TableCell component="th" scope="row">
                    <Typography color="textPrimary">{index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textPrimary">{team.name}</Typography>
                  </TableCell>
                  {team.scoresByRound &&
                    team.scoresByRound.map((score, roundIndex) => (
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
            onClick={onContinue}
            className={classes.navigationButton}
          >
            {currentRound < totalRounds ? t.nextRound : t.viewFinalScores}
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default CurrentStandings;
