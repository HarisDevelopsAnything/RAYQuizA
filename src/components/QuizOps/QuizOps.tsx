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
}

const QuizOps = ({ question, type, options, image, selectedAnswers = [], onAnswerSelect, showFeedback = false, isCorrect = false }: Props) => {
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
        style={{
          '--x': `${x}px`,
          '--y': `${y}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        } as React.CSSProperties}
      />
    );
  };

  const handleOptionClick = (index: number) => {
    if (onAnswerSelect && !showFeedback) {
      onAnswerSelect(index);
    }
  };

  const getButtonClass = (index: number) => {
    let baseClass = `btn${index + 1}`;
    
    if (showFeedback) {
      // Show correct/incorrect feedback
      if (selectedAnswers.includes(index)) {
        baseClass += isCorrect ? " correct" : " incorrect";
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
          {isCorrect && <div className="firecracker-container">
            {Array.from({ length: 20 }, (_, i) => createFirecracker(i))}
          </div>}
          {isCorrect && <div className="celebration-text">🎉 Correct! 🎉</div>}
          {!isCorrect && <div className="celebration-text">Incorrect answer!</div>}
        </>
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
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}
        </div>
        <div className="btns">
          <button className={getButtonClass(0)} onClick={() => handleOptionClick(0)}>
            {type !== "single" && (
              <input 
                name="ckbx" 
                type="checkbox" 
                className="check" 
                checked={selectedAnswers.includes(0)}
                readOnly
              />
            )}
            {options[0]}
          </button>
          <button className={getButtonClass(1)} onClick={() => handleOptionClick(1)}>
            {type !== "single" && (
              <input 
                name="ckbx" 
                type="checkbox" 
                className="check" 
                checked={selectedAnswers.includes(1)}
                readOnly
              />
            )}
            {options[1]}
          </button>
          <button className={getButtonClass(2)} onClick={() => handleOptionClick(2)}>
            {type !== "single" && (
              <input 
                name="ckbx" 
                type="checkbox" 
                className="check" 
                checked={selectedAnswers.includes(2)}
                readOnly
              />
            )}
            {options[2]}
          </button>
          <button className={getButtonClass(3)} onClick={() => handleOptionClick(3)}>
            {type !== "single" && (
              <input 
                name="ckbx" 
                type="checkbox" 
                className="check" 
                checked={selectedAnswers.includes(3)}
                readOnly
              />
            )}
            {options[3]}
          </button>
        </div>
      </div>
    </>
  );
};
export default QuizOps;
