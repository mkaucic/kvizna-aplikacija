import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
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
import { useLanguage } from "../LanguageContext";
import { translations } from "../translations";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
];

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    minHeight: "100vh",
  },
  accordion: {
    marginBottom: theme.spacing(2),
  },
  accordionSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamName: {
    flexGrow: 1,
  },
  table: {
    minWidth: 650,
  },
  backButton: {
    marginTop: theme.spacing(2),
  },
  chart: {
    height: 300,
    marginBottom: theme.spacing(2),
  },
}));

const TeamArchives = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [teamArchives, setTeamArchives] = useState([]);
  const [expandedPanel, setExpandedPanel] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchTeamArchives();
  }, [user, navigate]);

  const fetchTeamArchives = async () => {
    try {
      const archivesQuery = query(
        collection(firestore, "teamArchives"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(archivesQuery);
      const archives = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredArchives = archives.filter(
        (team) => team.quizzes && team.quizzes.length > 0
      );
      setTeamArchives(filteredArchives);
    } catch (error) {
      console.error("Error fetching team archives:", error);
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const prepareChartData = (quizzes) => {
    return quizzes.map((quiz) => ({
      name: quiz.quizName || t.unnamedQuiz,
      [t.score]: quiz.score,
      [t.placement]: quiz.placement,
    }));
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        {t.teamArchives}
      </Typography>
      {teamArchives.length === 0 ? (
        <Typography>{t.noTeamArchives}</Typography>
      ) : (
        teamArchives.map((team) => (
          <Accordion
            key={team.id}
            className={classes.accordion}
            expanded={expandedPanel === team.id}
            onChange={handleChange(team.id)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${team.id}-content`}
              id={`${team.id}-header`}
            >
              <Typography className={classes.teamName}>
                {team.teamName}
              </Typography>
              <Typography color="textSecondary">
                {team.quizzes.length}{" "}
                {team.quizzes.length === 1 ? t.quiz : t.quizzes}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {t.performanceOverTime}
                  </Typography>
                  <div className={classes.chart}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareChartData(team.quizzes)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          stroke="#8884d8"
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#82ca9d"
                          allowDecimals={false}
                          domain={[1, "dataMax"]}
                          tickCount={5}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey={t.score}
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey={t.placement}
                          stroke="#82ca9d"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {t.quizHistory}
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table className={classes.table}>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t.quizName}</TableCell>
                          <TableCell>{t.date}</TableCell>
                          <TableCell>{t.placement}</TableCell>
                          <TableCell>{t.totalPoints}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {team.quizzes.map((quiz, index) => (
                          <TableRow key={index}>
                            <TableCell>{quiz.quizName}</TableCell>
                            <TableCell>{formatDate(quiz.date)}</TableCell>
                            <TableCell>{quiz.placement}</TableCell>
                            <TableCell>{quiz.score}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        className={classes.backButton}
      >
        {t.backToHome}
      </Button>
    </div>
  );
};

export default TeamArchives;
