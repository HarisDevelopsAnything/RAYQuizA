import "./QuizOps.css";
import { useEffect, useState } from "react";

interface Props {
  question: string;
  type: string;
  options: Array<string>;
  image: string;
  selectedAnswers?: number[];
  onAnswerSelect?: (answerIndex: number) => void;
  showFeedback?: boolean;
  isCorrect?: boolean;
  disableInteractions?: boolean;
  timeRemaining?: number | null;
  totalTime?: number | null;
  correctAnswers?: number[];
  eliminatedOptions?: number[];
}

const QuizOps = ({
  question,
  type,
  options,
  image,
  selectedAnswers = [],
  onAnswerSelect,
  showFeedback = false,
  isCorrect = false,
  disableInteractions = false,
  timeRemaining = null,
  totalTime = null,
  correctAnswers,
  eliminatedOptions = [],
}: Props) => {
  const [showFirecrackers, setShowFirecrackers] = useState(false);

  useEffect(() => {
    if (showFeedback) {
      setShowFirecrackers(true);
      // Hide firecrackers after animation completes
      const timer = setTimeout(() => {
        setShowFirecrackers(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, isCorrect]);

  const createFirecracker = (index: number) => {
    const x = (Math.random() - 0.5) * 300;
    const y = (Math.random() - 0.5) * 300;
    return (
      <div
        key={index}
        className="firecracker"
        style={
          {
            "--x": `${x}px`,
            "--y": `${y}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          } as React.CSSProperties
        }
      />
    );
  };

  const handleOptionClick = (index: number) => {
    if (onAnswerSelect && !showFeedback && !disableInteractions) {
      onAnswerSelect(index);
    }
  };

  const getButtonClass = (index: number) => {
    let baseClass = `btn${index + 1}`;

    // Check if option is eliminated
    if (eliminatedOptions.includes(index)) {
      baseClass += " eliminated";
    } else if (showFeedback) {
      const isCorrectAnswer = correctAnswers?.includes(index);
      if (isCorrectAnswer) {
        baseClass += " correct";
      } else if (selectedAnswers.includes(index)) {
        baseClass += " incorrect";
      }
    } else if (selectedAnswers.includes(index)) {
      // Show selected state
      baseClass += " selected";
    }

    return baseClass;
  };

  return (
    <>
      {/* Firecracker animation for correct answers */}
      {showFirecrackers && (
        <>
          {isCorrect && (
            <div className="firecracker-container">
              {Array.from({ length: 20 }, (_, i) => createFirecracker(i))}
            </div>
          )}
          {isCorrect && <div className="celebration-text">🎉 Correct! 🎉</div>}
          {!isCorrect && (
            <div className="celebration-text">Incorrect answer!</div>
          )}
        </>
      )}

      {typeof timeRemaining === "number" && timeRemaining >= 0 && (
        <div className="timer">
          <div className="timer-label">Time remaining</div>
          <div className="timer-count">{timeRemaining}s</div>
          {totalTime && totalTime > 0 && (
            <div className="timer-bar">
              <div
                className="timer-bar-fill"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (timeRemaining / totalTime) * 100)
                  )}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      <p
        className="question"
        style={{ height: "20%", margin: "0", padding: "1% 0 0 1%" }}
      >
        {question}
      </p>
      <div className="quizops">
        <div className="imgdiv">
          {image && image.trim() !== "" ? (
            <img
              src={image}
              alt="Question"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
        </div>
        <div className="btns">
          <button
            className={getButtonClass(0)}
            onClick={() => handleOptionClick(0)}
            disabled={showFeedback || disableInteractions || eliminatedOptions.includes(0)}
          >
            {type !== "single" && (
              <input
                name="ckbx"
                type="checkbox"
                className="check"
                checked={selectedAnswers.includes(0)}
                readOnly
              />
            )}
            {eliminatedOptions.includes(0) && <span className="eliminated-mark">✂️</span>}
            {options[0]}
          </button>
          <button
            className={getButtonClass(1)}
            onClick={() => handleOptionClick(1)}
            disabled={showFeedback || disableInteractions || eliminatedOptions.includes(1)}
          >
            {type !== "single" && (
              <input
                name="ckbx"
                type="checkbox"
                className="check"
                checked={selectedAnswers.includes(1)}
                readOnly
              />
            )}
            {eliminatedOptions.includes(1) && <span className="eliminated-mark">✂️</span>}
            {options[1]}
          </button>
          <button
            className={getButtonClass(2)}
            onClick={() => handleOptionClick(2)}
            disabled={showFeedback || disableInteractions || eliminatedOptions.includes(2)}
          >
            {type !== "single" && (
              <input
                name="ckbx"
                type="checkbox"
                className="check"
                checked={selectedAnswers.includes(2)}
                readOnly
              />
            )}
            {eliminatedOptions.includes(2) && <span className="eliminated-mark">✂️</span>}
            {options[2]}
          </button>
          <button
            className={getButtonClass(3)}
            onClick={() => handleOptionClick(3)}
            disabled={showFeedback || disableInteractions || eliminatedOptions.includes(3)}
          >
            {type !== "single" && (
              <input
                name="ckbx"
                type="checkbox"
                className="check"
                checked={selectedAnswers.includes(3)}
                readOnly
              />
            )}
            {eliminatedOptions.includes(3) && <span className="eliminated-mark">✂️</span>}
            {options[3]}
          </button>
        </div>
      </div>
    </>
  );
};
export default QuizOps;
