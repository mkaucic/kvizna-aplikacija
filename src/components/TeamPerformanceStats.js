import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  makeStyles,
} from "@material-ui/core";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";

const COLORS = [
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

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  chart: {
    marginBottom: theme.spacing(4),
  },
  backButton: {
    marginTop: theme.spacing(2),
  },
}));

const TeamPerformanceStats = () => {
  const classes = useStyles();
  const [gameData, setGameData] = useState(null);
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchGameData = async () => {
      const gameRef = doc(firestore, "gameHistory", gameId);
      const gameDoc = await getDoc(gameRef);
      if (gameDoc.exists()) {
        setGameData(gameDoc.data());
      }
    };

    fetchGameData();
  }, [gameId]);

  if (!gameData) return <Typography>Loading...</Typography>;

  const lineChartData = gameData.teams[0].scoresByRound.map(
    (_, roundIndex) => ({
      name: `${t.round} ${roundIndex + 1}`,
      ...gameData.teams.reduce((acc, team) => {
        acc[team.name] = team.scoresByRound[roundIndex];
        return acc;
      }, {}),
    })
  );

  const totalPossiblePoints = gameData.totalPossiblePoints || 0;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h4" gutterBottom>
          {t.teamPerformanceStatistics}
        </Typography>

        <div className={classes.chart}>
          <Typography variant="h6" gutterBottom>
            {t.scoreProgression}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {gameData.teams.map((team, index) => (
                <Line
                  type="monotone"
                  dataKey={team.name}
                  stroke={COLORS[index % COLORS.length]}
                  key={team.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={classes.chart}>
          <Typography variant="h6" gutterBottom>
            {t.roundComparison}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {gameData.teams.map((team, index) => (
                <Bar
                  dataKey={team.name}
                  fill={COLORS[index % COLORS.length]}
                  key={team.name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Typography variant="h6" gutterBottom>
          {t.teamStatistics}
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t.team}</TableCell>
                <TableCell>{t.averageScore}</TableCell>
                <TableCell>{t.highestRound}</TableCell>
                <TableCell>{t.lowestRound}</TableCell>
                <TableCell>{t.correctAnswersPercentage}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gameData.teams.map((team, index) => {
                const avgScore =
                  team.scoresByRound.reduce((a, b) => a + b, 0) /
                  team.scoresByRound.length;
                const highestRound = Math.max(...team.scoresByRound);
                const lowestRound = Math.min(...team.scoresByRound);
                const correctAnswersPercentage =
                  totalPossiblePoints > 0
                    ? ((team.totalScore / totalPossiblePoints) * 100).toFixed(2)
                    : "N/A";

                return (
                  <TableRow
                    key={team.name}
                    style={{
                      backgroundColor: `${COLORS[index % COLORS.length]}20`,
                    }}
                  >
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{avgScore.toFixed(2)}</TableCell>
                    <TableCell>{highestRound}</TableCell>
                    <TableCell>{lowestRound}</TableCell>
                    <TableCell>{correctAnswersPercentage}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/game-history")}
          className={classes.backButton}
        >
          {t.backToGameHistory}
        </Button>
      </Paper>
    </div>
  );
};

export default TeamPerformanceStats;
