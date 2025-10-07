import QuizOps from "@/components/QuizOps/QuizOps";
import "./QuizPage.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface QuizData {
  question: Array<string>;
  answerType: Array<string>;
  type: Array<string>;
  options: Array<Array<string>>;
  image: Array<string>;
  timing: Array<number>;
  correctAnswers: Array<number[]>; // Added to track correct answers
  totalQuestions: number;
}

interface Props {
  question?: Array<string>;
  answerType?: Array<string>;
  type?: Array<string>;
  options?: Array<Array<string>>;
  image?: Array<string>;
  timing?: Array<number>;
  totalQuestions?: number;
}

function QuizPage({
  question,
  answerType,
  type,
  options,
  image,
  timing,
  totalQuestions,
}: Props) {
  const { quizId } = useParams<{ quizId: string }>();
  const [ind] = useState(0);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[][]>([]);

  useEffect(() => {
    if (quizId) {
      fetchQuizData(quizId);
    } else if (question && type && options && image) {
      // If props are provided directly, use them
      setQuizData({
        question,
        answerType: answerType || [],
        type,
        options,
        image,
        timing: timing || [],
        correctAnswers: [], // Initialize with empty array for props-based quizzes
        totalQuestions: totalQuestions || question.length,
      });
      setLoading(false);
    }
  }, [
    quizId,
    question,
    answerType,
    type,
    options,
    image,
    timing,
    totalQuestions,
  ]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!quizData) return;

    if (quizData.type[ind] === "single") {
      // Single answer - replace selection and auto-submit
      setSelectedAnswers([answerIndex]);
      
      // Auto-submit after a short delay for single choice questions
      setTimeout(() => {
        handleNext();
      }, 500); // 500ms delay to show the selection before proceeding
    } else {
      // Multiple answers - toggle selection
      setSelectedAnswers(prev => 
        prev.includes(answerIndex) 
          ? prev.filter(a => a !== answerIndex)
          : [...prev, answerIndex]
      );
    }
  };

  const handleNext = () => {
    if (!quizData) return;

    // Store current answers
    const newUserAnswers = [...userAnswers];
    newUserAnswers[ind] = selectedAnswers;
    setUserAnswers(newUserAnswers);

    // Show feedback for current question
    setShowFeedback(true);

    // After showing feedback, move to next question
    setTimeout(() => {
      if (ind < quizData.totalQuestions - 1) {
        setInd(ind + 1);
        setSelectedAnswers([]);
        setShowFeedback(false);
      } else {
        // Quiz completed
        alert("Quiz completed!");
      }
    }, 2000); // Show feedback for 2 seconds
  };

  const isAnswerCorrect = () => {
    if (!quizData || !quizData.correctAnswers || !quizData.correctAnswers[ind]) return false;
    
    const correctAnswers = quizData.correctAnswers[ind];
    
    // Ensure correctAnswers is an array
    let correctAnswersArray: number[];
    if (Array.isArray(correctAnswers)) {
      correctAnswersArray = correctAnswers;
    } else if (typeof correctAnswers === 'number') {
      correctAnswersArray = [correctAnswers];
    } else {
      return false; // Invalid correctAnswers format
    }
    
    const sortedSelected = [...selectedAnswers].sort();
    const sortedCorrect = [...correctAnswersArray].sort();
    
    return JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
  };

  const fetchQuizData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Attempting to fetch quiz with code: ${id.toUpperCase()}`);
      const apiUrl = `https://rayquiza-backend.onrender.com/api/quizzes/code/${id.toUpperCase()}`;
      console.log(`API URL: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add timeout to catch slow responses
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Quiz not found. Please check the code and try again."
          );
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(
            `Failed to fetch quiz data (Status: ${response.status})`
          );
        }
      }

      const quiz = await response.json();
      console.log("Received quiz data:", quiz);

      // Validate that we have the expected data structure
      if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
        throw new Error("Invalid quiz data received from server");
      }

      if (quiz.questions.length === 0) {
        throw new Error("Quiz has no questions");
      }

      // Transform the server response to match our QuizData interface
      const transformedData: QuizData = {
        question: quiz.questions?.map((q: any) => q.questionText || q.question || "") || [],
        answerType: quiz.questions?.map((q: any) => q.answerType) || [],
        type: quiz.questions?.map((q: any) => q.answerType || q.type || "single") || [],
        options: quiz.questions?.map((q: any) => q.options || []) || [],
        image: quiz.questions?.map((q: any) => q.imageUrl || q.image || "") || [],
        timing: quiz.questions?.map((q: any) => q.timeLimit || q.timing || 30) || [],
        correctAnswers: quiz.questions?.map((q: any) => {
          const correctOption = q.correctOption || q.correctAnswers || q.correctAnswer;
          // Ensure it's always an array
          if (Array.isArray(correctOption)) {
            return correctOption;
          } else if (typeof correctOption === 'number') {
            return [correctOption];
          } else {
            return [0]; // Default fallback
          }
        }) || [],
        totalQuestions: quiz.questions?.length || 0,
      };

      console.log("Transformed quiz data:", transformedData);
      setQuizData(transformedData);
    } catch (err) {
      console.error("Error fetching quiz data:", err);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError(
            "Request timed out. Please check your internet connection and try again."
          );
        } else if (
          err.message.includes("NetworkError") ||
          err.message.includes("Failed to fetch")
        ) {
          setError(
            "Network error. Please check your internet connection and try again."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred while fetching quiz data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p className="webname">RAYQuizA!</p>
        <div className="quizenv">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quizData || quizData.totalQuestions === 0) {
    return (
      <div className="page">
        <p className="webname">RAYQuizA!</p>
        <div className="quizenv">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Error: {error || "Quiz not found or has no questions"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <p className="webname">RAYQuizA!</p>
      <div className="quizenv">
        <QuizOps 
          question={quizData.question[ind]} 
          type={quizData.type[ind]} 
          image={quizData.image[ind]} 
          options={quizData.options[ind]}
          selectedAnswers={selectedAnswers}
          onAnswerSelect={handleAnswerSelect}
          showFeedback={showFeedback}
          isCorrect={isAnswerCorrect()}
        <QuizOps
          question={quizData.question[ind]}
          type={quizData.type[ind]}
          image={quizData.image[ind]}
          options={quizData.options[ind]}
        />
      </div>
      <div className="footer">
        <p></p>
        {quizData.type[ind] === "multiple" && (
          <button className="nextbtn" onClick={handleNext}>
            {ind < quizData.totalQuestions - 1 ? "Next" : "Finish"}
          </button>
        {quizData.type[ind] != "single" && (
          <button className="nextbtn">Next</button>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
