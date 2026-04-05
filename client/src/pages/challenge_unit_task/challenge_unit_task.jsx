import React, { useState, useEffect, useRef } from "react";
import { Table } from "@/components/components/ui/table";
import { Button } from "@/components/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/components/ui/dialog";
import { Input } from "@/components/components/ui/input";
import { Label } from "@/components/components/ui/label";
import { AlertCircle, UserPlus, Code } from "lucide-react";
import { Textarea } from "@/components/components/ui/textarea";
import { Checkbox } from "@/components/components/ui/checkbox";
import ApiService from "../../services/api_service";
import { Navigate, useLocation } from "react-router";
// import JoditEditor from "jodit-react";
import { Editor } from "@tinymce/tinymce-react";
const ChallengeUnitTasks = () => {
  const location = useLocation();
  const groupId = new URLSearchParams(location.search).get("groupId");

  const [unitTasks, setUnitTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMarks: "",
    ChallengeGroupId: groupId,
  });
  const [error, setError] = useState("");
  const editor = useRef(null);
  const editorRef = useRef(null);

  const [openTestCasesDialog, setOpenTestCasesDialog] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [testCaseForm, setTestCaseForm] = useState({
    name: "",
    input: "",
    output: "",
    matchCase: true,
    challengeUnitTaskId: null,
  });
  const [selectedTestCase, setSelectedTestCase] = useState(null);

  // If role is not 'ADMIN', redirect
  if (ApiService.role !== "ADMIN") {
    return <Navigate to="/" />;
  }

  const fetchUnitTasks = async () => {
    try {
      const response = await ApiService.makeApiCall(
        `ChallengeUnitTask?groupId=${groupId}`
      );
      setUnitTasks(response);
    } catch (error) {
      setError("Failed to fetch unit tasks");
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchUnitTasks();
    }
  }, [groupId]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      ChallengeGroupId: groupId,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        ChallengeGroupId: groupId, // Ensure groupId is sent with the request
      };
      if (selectedTask) {
        await ApiService.makeApiCall(
          `ChallengeUnitTask/${selectedTask.id}`,
          "PUT",
          {},
          dataToSend
        );
      } else {
        await ApiService.makeApiCall(
          "ChallengeUnitTask",
          "POST",
          {},
          dataToSend
        );
      }
      setOpenDialog(false);
      setSelectedTask(null);
      setFormData({
        name: "",
        description: "",
        maxMarks: "",
        ChallengeGroupId: groupId,
      });
      fetchUnitTasks();
    } catch (error) {
      setError("Failed to save unit task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await ApiService.makeApiCall(`ChallengeUnitTask/${id}`, "DELETE");
      fetchUnitTasks();
    } catch (error) {
      setError("Failed to delete unit task");
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      name: task.name,
      description: task.description,
      maxMarks: task.maxMarks,
    });
    setOpenDialog(true);
  };

  const handleEditorChange = (content) => {
    setFormData({
      ...formData,
      description: content,
    });
  };

  const contentFieldChanaged = (data) => {
    setFormData({
      ...formData,
      ChallengeGroupId: groupId,
      description: data,
    });
  };

  const fetchTestCases = async (taskId) => {
    try {
      const response = await ApiService.makeApiCall(
        `ChallengeUnitTestCase?taskId=${taskId}`
      );
      setTestCases(response);
    } catch (error) {
      setError("Failed to fetch test cases");
    }
  };

  const handleTestCaseSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...testCaseForm,
        challengeUnitTaskId: currentTaskId,
      };

      if (selectedTestCase) {
        await ApiService.makeApiCall(
          `ChallengeUnitTestCase/${selectedTestCase.id}`,
          "PUT",
          {},
          dataToSend
        );
      } else {
        await ApiService.makeApiCall(
          "ChallengeUnitTestCase",
          "POST",
          {},
          dataToSend
        );
      }

      fetchTestCases(currentTaskId);
      setTestCaseForm({
        name: "",
        input: "",
        output: "",
        matchCase: true,
        challengeUnitTaskId: currentTaskId,
      });
      setSelectedTestCase(null);
    } catch (error) {
      setError("Failed to save test case");
    }
  };

  const handleTestCaseEdit = (testCase) => {
    setSelectedTestCase(testCase);
    setTestCaseForm({
      name: testCase.name,
      input: testCase.input,
      output: testCase.output,
      matchCase: testCase.matchCase,
      challengeUnitTaskId: currentTaskId,
    });
  };

  const handleTestCaseVisibility = async (testCase) => {
    try {
      await ApiService.makeApiCall(
        `ChallengeUnitTestCase/${testCase.id}/visibility`,
        "PUT"
      );
      fetchTestCases(currentTaskId);
    } catch (error) {
      setError("Failed to update test case visibility");
    }
  };

  const handleTestCaseStatus = async (testCase) => {
    try {
      await ApiService.makeApiCall(
        `ChallengeUnitTestCase/${testCase.id}/status`,
        "PUT"
      );
      fetchTestCases(currentTaskId);
    } catch (error) {
      setError("Failed to update test case status");
    }
  };

  const openTestCases = (taskId) => {
    setCurrentTaskId(taskId);
    fetchTestCases(taskId);
    setOpenTestCasesDialog(true);
  };

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      )}
      {/* 
      <div className="mb-6 flex gap-4">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedTask(null);
                setFormData({
                  name: "",
                  description: "",
                  maxMarks: "",
                });
              }}
            >
              <UserPlus className="mr-2" />
              Add Unit Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl h-full">
            <DialogHeader>
              <DialogTitle>
                {selectedTask ? "Edit Unit Task" : "Add Unit Task"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-14">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "80%" }}>
                  <Label htmlFor="name">Task Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div style={{ width: "18%" }}>
                  <Label htmlFor="maxMarks">Max Marks</Label>
                  <Input
                    id="maxMarks"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    required
                    type="number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Editor
                  apiKey="1jli2slpm05xobx0ds03lm3dfipnuuy3qugpwj83kpa573xf" // Get your free API key from TinyMCE
                  init={{
                    height: 400,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "code",
                      "help",
                      "wordcount",
                      "codesample",
                      "emoticons",
                      "imagetools",
                      "linkchecker",
                    ],
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                    image_title: true,
                    automatic_uploads: true,
                    file_picker_types: "image",
                    file_picker_callback: (cb, value, meta) => {
                      const input = document.createElement("input");
                      input.setAttribute("type", "file");
                      input.setAttribute("accept", "image/*");
                      input.onchange = function () {
                        const file = this.files[0];
                        const reader = new FileReader();
                        reader.onload = function () {
                          const id = "blobid" + new Date().getTime();
                          const blobCache =
                            tinymce.activeEditor.editorUpload.blobCache;
                          const base64 = reader.result.split(",")[1];
                          const blobInfo = blobCache.create(id, file, base64);
                          blobCache.add(blobInfo);

                          // Pass the image URI to the callback
                          cb(blobInfo.blobUri(), { title: file.name });
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    },
                    tinycomments_mode: "embedded",
                    tinycomments_author: "Author name",
                    mergetags_list: [
                      { value: "First.Name", title: "First Name" },
                      { value: "Email", title: "Email" },
                    ],
                  }}
                  onEditorChange={handleEditorChange}
                />
              </div>

              <Button type="submit" className="w-full">
                {selectedTask ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div> */}

      <Dialog open={openTestCasesDialog} onOpenChange={setOpenTestCasesDialog}>
        <DialogContent className="max-w-7xl h-full">
          <DialogHeader>
            <DialogTitle>Test Cases Management</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleTestCaseSubmit} className="space-y-4 mb-6">
            <div>
              <Label htmlFor="testCaseName">Test Case Name</Label>
              <Input
                id="testCaseName"
                value={testCaseForm.name}
                onChange={(e) =>
                  setTestCaseForm({ ...testCaseForm, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="input">Input</Label>
                <Textarea
                  id="input"
                  value={testCaseForm.input}
                  onChange={(e) =>
                    setTestCaseForm({ ...testCaseForm, input: e.target.value })
                  }
                  className="h-32"
                />
              </div>

              <div>
                <Label htmlFor="output">Expected Output</Label>
                <Textarea
                  id="output"
                  value={testCaseForm.output}
                  onChange={(e) =>
                    setTestCaseForm({ ...testCaseForm, output: e.target.value })
                  }
                  className="h-32"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="matchCase"
                checked={testCaseForm.matchCase}
                onCheckedChange={(checked) =>
                  setTestCaseForm({ ...testCaseForm, matchCase: checked })
                }
              />
              <Label htmlFor="matchCase">Match Case</Label>
            </div>

            <Button type="submit" className="w-full">
              {selectedTestCase ? "Update Test Case" : "Add Test Case"}
            </Button>
          </form>

          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Match Case</th>
                <th>User Visible</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((testCase) => (
                <tr key={testCase.id}>
                  <td>{testCase.name}</td>
                  <td>{testCase.matchCase ? "Yes" : "No"}</td>
                  <td>{testCase.isUserVisible ? "Yes" : "No"}</td>
                  <td>{testCase.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestCaseEdit(testCase)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestCaseStatus(testCase)}
                      >
                        {testCase.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestCaseVisibility(testCase)}
                      >
                        {testCase.isUserVisible ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </DialogContent>
      </Dialog>

      <Table>
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Max Marks</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {unitTasks.map((task) => (
            <tr key={task.id}>
              <td>{task.name}</td>
              <td>{task.maxMarks}</td>
              <td>{task.isActive ? "Active" : "Inactive"}</td>
              <td>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                  >
                    {task.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTestCases(task.id)}
                  >
                    <Code className="mr-2" />
                    Test Cases
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div style={{ height: "150px" }}></div>
      <h2>Create/Update</h2>

      <form onSubmit={handleSubmit} className="space-y-14">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "80%" }}>
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div style={{ width: "18%" }}>
            <Label htmlFor="maxMarks">Max Marks</Label>
            <Input
              id="maxMarks"
              name="maxMarks"
              value={formData.maxMarks}
              onChange={handleInputChange}
              required
              type="number"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Editor
            apiKey="1jli2slpm05xobx0ds03lm3dfipnuuy3qugpwj83kpa573xf" // Get your free API key from TinyMCE
            init={{
              height: 400,

              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
                "codesample",
                "emoticons",
                "imagetools",
                "linkchecker",
              ],
              toolbar:
                "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
              image_title: true,
              automatic_uploads: true,
              file_picker_types: "image",
              file_picker_callback: (cb, value, meta) => {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.onchange = function () {
                  const file = this.files[0];
                  const reader = new FileReader();
                  reader.onload = function () {
                    const id = "blobid" + new Date().getTime();
                    const blobCache =
                      tinymce.activeEditor.editorUpload.blobCache;
                    const base64 = reader.result.split(",")[1];
                    const blobInfo = blobCache.create(id, file, base64);
                    blobCache.add(blobInfo);

                    // Pass the image URI to the callback
                    cb(blobInfo.blobUri(), { title: file.name });
                  };
                  reader.readAsDataURL(file);
                };
                input.click();
              },
              tinycomments_mode: "embedded",
              tinycomments_author: "Author name",
              mergetags_list: [
                { value: "First.Name", title: "First Name" },
                { value: "Email", title: "Email" },
              ],
            }}
            onInit={(_evt, editor) => (editorRef.current = editor)}
            initialValue={formData.description}
            onEditorChange={handleEditorChange}
          />
        </div>

        <Button type="submit" className="w-full">
          {selectedTask ? "Update" : "Create"}
        </Button>
      </form>
    </div>
  );
};

export default ChallengeUnitTasks;
