import { useRef, useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../../constants/constants";
import Output from "./output";
import ApiService from "../../services/api_service";
import { useOutletContext } from "react-router";

const Task = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get("taskid");

  const { triggerReRender } = useOutletContext();

  // console.log(taskId);

  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("cpp");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [task, setTask] = useState({
    id: "",
    name: "",
    description: "",
    maxMarks: 0,
    isActive: false,
    createdAt: "",
    testCases: [],
  });

  const [submission, setSubmission] = useState({});

  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Fetch the challenge unit task data when component mounts

  //   if (taskId) {
  //     fetchTask();
  //   }
  // }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await ApiService.makeApiCall(
        `ChallengeUnitTask/${taskId}`
      );
      // setTask(response);
      // const testCases = await ApiService.makeApiCall(
      //   `ChallengeUnitTestCase?taskId=${taskId}`
      // );
      setTask(response);
      console.log("Response:", response);
      // console.log("Updated Task:", task);
    } catch (error) {
      console.error("Error fetching task data:", error);
    } finally {
      // setLoading(false);
    }
  };

  const fetchSubmission = async (needsRerender) => {
    try {
      const response = await ApiService.makeApiCall(`team/${taskId}`);
      console.log(response);

      if (response.statusCode === 200) {
        setSubmission(response);
        setValue(response.code); // Load the saved code into the editor
        setLanguage(response.langauge); // Set the language
        if (needsRerender) {
          // triggerReRender();
        }
      } else {
        console.warn("No submission found:", response.message);
        setLanguage("cpp");
        setValue(CODE_SNIPPETS["cpp"]);
        setSubmission({});
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      setLanguage("cpp");
      setValue(CODE_SNIPPETS["cpp"]);
      setSubmission({});
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTask();
      fetchSubmission(false); // Call API at the start of the page
    }
  }, [taskId]);

  useEffect(() => {
    console.log("Updated Task:", task);
    setLoading(false);
  }, [task]);

  useEffect(() => {
    // Function to check fullscreen status
    const checkFullscreen = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
    };

    // Add event listeners for fullscreen changes
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("MSFullscreenChange", checkFullscreen);

    // Clean up event listeners
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("MSFullscreenChange", checkFullscreen);
    };
  }, []);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {isFullscreen ? (
        <div style={{ display: "flex", gap: "6px", height: "100%" }}>
          <div style={{ width: "50%" }}>
            <div
              className="mb-6"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <h1>{task.name}</h1>
              <p>
                {submission.code && submission.score ? (
                  <u>
                    <span>
                      <strong>Score</strong> {submission.score}
                    </span>
                    <span> / {task.maxMarks}</span>
                  </u>
                ) : (
                  <u>
                    <strong>Max Marks:</strong> {task.maxMarks}
                  </u>
                )}
              </p>
            </div>
            <p dangerouslySetInnerHTML={{ __html: task.description }}></p>
            <hr className="mb-3 mt-3" />
            <h3>Test Cases</h3>
            <table className="table table-striped table-hover table-bordered mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Input</th>
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(task.testCases) &&
                task.testCases.filter((tc) => tc.isUserVisible).length > 0 ? (
                  task.testCases
                    .filter((tc) => tc.isUserVisible)
                    .map((testCase, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {testCase.input.split("\n").map((line, lineIndex) => (
                            <span key={lineIndex}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </td>
                        <td>
                          {testCase.output
                            .split("\n")
                            .map((line, lineIndex) => (
                              <span key={lineIndex}>
                                {line}
                                <br />
                              </span>
                            ))}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="3">No test cases available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ width: "50%" }}>
            <LanguageSelector language={language} onSelect={onSelect} />
            <Editor
              options={{
                minimap: {
                  enabled: false,
                },
              }}
              height="40vh"
              theme="vs-dark"
              language={language}
              defaultValue={CODE_SNIPPETS[language]}
              onMount={onMount}
              value={value}
              onChange={(value) => setValue(value)}
            />
            <Output
              editorRef={editorRef}
              language={language}
              testCases={task.testCases}
              fetchSubmission={fetchSubmission}
            />
          </div>
        </div>
      ) : (
        <div id="warning">
          <h1>Please enable fullscreen mode to view the content.</h1>
        </div>
      )}
    </>
  );
};

export default Task;
