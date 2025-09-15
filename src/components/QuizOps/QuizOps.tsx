import "./QuizOps.css";
interface Props {
  question: string;
  type: string;
  options: Array<string>;
  image: string;
}
const QuizOps = ({ question, type, options, image }: Props) => {
  return (
    <>
      <p
        className="question"
        style={{ height: "20%", margin: "0", padding: "1% 0 0 1%" }}
      >
        {question}
      </p>
      <div className="quizops">
        <div className="imgdiv">{image && <img src={image}></img>}</div>
        <div className="btns">
          <button className="btn1">
            {type != "single" && (
              <input name="ckbx" type="checkbox" className="check" />
            )}
            {options[0]}
          </button>
          <button className="btn2">
            {type != "single" && (
              <input name="ckbx" type="checkbox" className="check" />
            )}
            {options[1]}
          </button>
          <button className="btn3">
            {type != "single" && (
              <input name="ckbx" type="checkbox" className="check" />
            )}
            {options[2]}
          </button>
          <button className="btn4">
            {type != "single" && (
              <input name="ckbx" type="checkbox" className="check" />
            )}
            {options[3]}
          </button>
        </div>
      </div>
    </>
  );
};
export default QuizOps;
