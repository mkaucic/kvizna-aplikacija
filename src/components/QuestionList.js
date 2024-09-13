import React, { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Fab,
  Snackbar,
  Chip,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    overflowY: "auto",
    flex: 1,
  },
  table: {
    minWidth: 650,
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
  questionCount: {
    marginLeft: theme.spacing(2),
  },
}));

const QuestionList = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [questions, setQuestions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ question: "", answer: "" });
  const [error, setError] = useState("");
  const { language } = useLanguage();
  const t = translations[language];
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    fetchQuestions();
  }, [user, loading, navigate]);

  const fetchQuestions = async () => {
    if (!user) return;
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
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to fetch questions. Please try again.");
    }
  };

  const handleAddQuestion = async () => {
    if (!user) {
      setError("You must be logged in to add a question");
      return;
    }
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      setValidationError("Both question and answer fields must be filled.");
      return;
    }
    try {
      await addDoc(collection(firestore, "questions"), {
        ...newQuestion,
        userId: user.uid,
      });
      setOpenDialog(false);
      setNewQuestion({ question: "", answer: "" });
      setValidationError("");
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question:", error);
      setError("Failed to add question. Please try again.");
    }
  };

  const handleEditQuestion = async () => {
    if (!user) {
      setError("You must be logged in to edit a question");
      return;
    }
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      setValidationError("Both question and answer fields must be filled.");
      return;
    }
    try {
      const questionRef = doc(firestore, "questions", editingQuestion.id);
      await updateDoc(questionRef, newQuestion);
      setOpenDialog(false);
      setEditingQuestion(null);
      setNewQuestion({ question: "", answer: "" });
      setValidationError("");
      fetchQuestions();
    } catch (error) {
      console.error("Error editing question:", error);
      setError("Failed to edit question. Please try again.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!user) {
      setError("You must be logged in to delete a question");
      return;
    }
    try {
      await deleteDoc(doc(firestore, "questions", id));
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      setError("Failed to delete question. Please try again.");
    }
  };

  const handleOpenDialog = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setNewQuestion({ question: question.question, answer: question.answer });
    } else {
      setEditingQuestion(null);
      setNewQuestion({ question: "", answer: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setNewQuestion({ question: "", answer: "" });
    setValidationError("");
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!user) return <Typography>Please log in to view questions.</Typography>;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <div className={classes.header}>
          <Typography variant="h4">{t.questionManagement}</Typography>
          <Chip
            label={`${t.totalQuestions}: ${questions.length}`}
            color="primary"
            className={classes.questionCount}
          />
        </div>

        <TableContainer className={classes.tableContainer}>
          <Table className={classes.table} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t.question}</TableCell>
                <TableCell>{t.answer}</TableCell>
                <TableCell align="right">{t.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.question}</TableCell>
                  <TableCell>{q.answer}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpenDialog(q)}
                      size="small"
                      className={classes.actionButton}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteQuestion(q.id)}
                      size="small"
                      className={classes.actionButton}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Fab
          color="primary"
          className={classes.fab}
          onClick={() => handleOpenDialog()}
        >
          <AddIcon />
        </Fab>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {editingQuestion ? t.editQuestion : t.addNewQuestion}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t.question}
              fullWidth
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              error={!!validationError}
            />
            <TextField
              margin="dense"
              label={t.answer}
              fullWidth
              value={newQuestion.answer}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, answer: e.target.value })
              }
              error={!!validationError}
            />
            {validationError && (
              <Typography
                color="error"
                variant="body2"
                style={{ marginTop: "8px" }}
              >
                {validationError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              {t.cancel}
            </Button>
            <Button
              onClick={editingQuestion ? handleEditQuestion : handleAddQuestion}
              color="primary"
            >
              {editingQuestion ? t.save : t.add}
            </Button>
          </DialogActions>
        </Dialog>

        <Button
          variant="contained"
          onClick={() => navigate("/")}
          style={{ marginTop: "20px" }}
        >
          {t.backToHome}
        </Button>
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

export default QuestionList;
