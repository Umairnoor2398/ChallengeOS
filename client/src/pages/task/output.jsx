import { useState } from "react";
import { executeCode } from "../../constants/api";
import { LANGUAGE_VERSIONS } from "../../constants/constants";
import ApiService from "../../services/api_service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import { Navigate } from "react-router";

const Output = ({ editorRef, language, testCases, fetchSubmission }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [input, setInput] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [isAllTestsRun, setIsAllTestsRun] = useState(false);
  const [testCasesSuccess, settestCasesSuccess] = useState(0);
  const [totalTestCases, settotalTestCases] = useState(0);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode, input);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
      alert(`An error occurred: ${error.message || "Unable to run code"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runTestCase = async (testCase, num) => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return null;

    try {
      const { run: result } = await executeCode(
        language,
        sourceCode,
        testCase.input
      );
      return {
        testCaseNumber: num,
        input: testCase.input,
        desiredOutput: testCase.output,
        computedOutput: !result.stderr ? result.output.trim() : "Error",
        //  result.stderr || result.output.trim(),
        isMatched:
          !result.stderr &&
          (testCase.MatchCase
            ? result.output.trim() === testCase.output
            : result.output.trim().toLowerCase() ===
              testCase.output.toLowerCase()),
      };
    } catch (error) {
      return {
        testCaseNumber: num,
        input: testCase.input,
        desiredOutput: testCase.output,
        computedOutput: `Error`,
        isMatched: false,
      };
    }
  };

  const runAllTests = async () => {
    setIsAllTestsRun(false);
    setIsLoading(true);
    setShowTestDialog(true);
    setTestResults([]);
    const results = [];
    const visibleTestCases = testCases.filter((tc) => tc.isUserVisible);
    var num = 1;
    for (const testCase of visibleTestCases) {
      const result = await runTestCase(testCase, num);
      results.push(result);
      setTestResults([...results]);
      num++;
    }

    setIsAllTestsRun(true);
    setIsLoading(false);
  };

  const [submitStatus, setSubmitStatus] = useState("Wrong Answer");
  const handleSubmit = async () => {
    setIsAllTestsRun(false);
    setShowSubmitDialog(true);
    setIsLoading(true);
    setTestResults([]);
    setSubmitStatus("Wrong Answer");
    const results = [];
    let testCasesSuccessCount = 0; // Local variable for successful test cases
    var num = 1;
    const visibleTestCases = testCases.filter((tc) => !tc.isUserVisible);
    const totalTestCasesCount = visibleTestCases.length; // Total number of test cases
    var isError = false;

    for (const testCase of visibleTestCases) {
      const result = await runTestCase(testCase, num);
      if (result.isMatched) {
        console.log("Test case", num, "passed", testCasesSuccessCount);
        testCasesSuccessCount++; // Increment success count locally
      } else if (result.computedOutput == "Error") {
        isError = true;
        // setSubmitStatus("Error");
      } else {
        // setSubmitStatus("Accepted");
      }
      settotalTestCases(totalTestCases + 1);
      results.push(result);
      setTestResults([...results]);
      num++;
    }

    setIsAllTestsRun(true);
    setIsLoading(false);

    const isSuccess = testCasesSuccessCount === totalTestCasesCount;

    if (isSuccess) {
      setSubmitStatus("Accepted");
    } else if (isError) {
      setSubmitStatus("Error");
    } else {
      setSubmitStatus("Wrong Answer");
    }
    console.log("Successful Test Cases:", testCasesSuccessCount);
    console.log("Total Test Cases:", totalTestCasesCount);
    console.log("isSuccess:", isSuccess);

    settestCasesSuccess(testCasesSuccessCount);
    settotalTestCases(totalTestCasesCount);
  };

  const confirmSubmit = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("taskid");

    setIsLoading(true);

    try {
      console.log(testCasesSuccess);
      console.log(totalTestCases);
      console.log(testCases.length);
      const response = await ApiService.makeApiCall(
        "team",
        "POST",
        {},
        {
          taskId,
          code: sourceCode,
          language,
          version: LANGUAGE_VERSIONS[language],
          isSuccess: testCasesSuccess == totalTestCases,
          passedTestCases: testCasesSuccess,
          totalTestCases: totalTestCases,
          status: submitStatus,
        }
      );
      // alert(response.message);
      fetchSubmission(true);
      setShowSubmitDialog(false);
      // setRedirect(true);
      // setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error("Error during submission", error);
      alert("An error occurred while submitting the task.");
    } finally {
      setIsLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          marginTop: "4px",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "16px",
            }}
            onClick={runCode}
            disabled={isLoading}
          >
            {isLoading ? "Running..." : "Run Code"}
          </button>
        </div>
        <div>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "16px",
            }}
            onClick={runAllTests}
            disabled={isLoading}
          >
            {isLoading ? "Running..." : "Run Code With All Inputs"}
          </button>
        </div>
        <div>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "blue",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "16px",
              marginLeft: "8px",
            }}
            onClick={handleSubmit}
          >
            Submit Task
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px" }}>
        <div style={{ width: "50%" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontSize: "18px" }}
          >
            Input:
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your input here..."
            style={{
              width: "100%",
              height: "30vh",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #333",
              marginBottom: "16px",
            }}
          />
        </div>
        <div style={{ width: "50%" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontSize: "18px" }}
          >
            Output:
          </label>
          <div
            style={{
              height: "30vh",
              padding: "16px",
              color: isError ? "red" : "black",
              border: "1px solid",
              borderRadius: "4px",
              borderColor: isError ? "red" : "#333",
              overflowY: "auto",
            }}
          >
            {output
              ? output.map((line, i) => <p key={i}>{line}</p>)
              : 'Click "Run Code" to see the output here'}
          </div>
        </div>
      </div>

      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test Case Results</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Case</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Desired Output</TableHead>
                <TableHead>Computed Output</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testResults.map((result) => (
                <TableRow key={result.testCaseNumber}>
                  <TableCell>{result.testCaseNumber}</TableCell>
                  <TableCell>{result.input}</TableCell>
                  <TableCell>{result.desiredOutput}</TableCell>
                  <TableCell>{result.computedOutput}</TableCell>
                  <TableCell>{result.isMatched ? "✅" : "❌"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isAllTestsRun && (
            <button
              onClick={() => setShowTestDialog(false)}
              style={{
                padding: "8px 16px",
                backgroundColor: "blue",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "16px",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Executing Task" : "Close"}
            </button>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Submission Results</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Case</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testResults.map((result) => (
                <TableRow key={result.testCaseNumber}>
                  <TableCell>{result.testCaseNumber}</TableCell>
                  <TableCell>{result.isMatched ? "✅" : "❌"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isAllTestsRun && (
            <button
              onClick={confirmSubmit}
              style={{
                padding: "8px 16px",
                backgroundColor: "blue",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "16px",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Submitting" : "Confirm Submission"}
            </button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Output;
