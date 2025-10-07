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
        question: quiz.questions?.map((q: any) => q.questionText) || [],
        answerType: quiz.questions?.map((q: any) => q.answerType) || [],
        type: quiz.questions?.map((q: any) => q.type || "multi") || [],
        options: quiz.questions?.map((q: any) => q.options || []) || [],
        image: quiz.questions?.map((q: any) => q.image || "") || [],
        timing: quiz.questions?.map((q: any) => q.timing || 30) || [],
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
        />
      </div>
      <div className="footer">
        <p></p>
        {quizData.type[ind] != "single" && (
          <button className="nextbtn">Next</button>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
