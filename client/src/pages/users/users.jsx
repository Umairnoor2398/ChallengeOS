import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/components/ui/textarea";
import { AlertCircle, Download, Upload, UserPlus, Mail } from "lucide-react";
import ApiService from "../../services/api_service";
import * as XLSX from "xlsx";
import { Navigate } from "react-router";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    contact: "",
    prefix: "",
  });
  const [error, setError] = useState("");

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: "",
    body: "",
  });

  if (ApiService.role == "USER" || ApiService.role == "") {
    return <Navigate to="/" />;
  }

  const fetchUsers = async () => {
    try {
      const response = await ApiService.makeApiCall("user");
      console.log("Fetched users:", response);
      setUsers(response);
    } catch (error) {
      setError("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const users = XLSX.utils.sheet_to_json(firstSheet);

            // Validate the Excel data
            const validatedUsers = users.map((user) => ({
              username: user["Username"] || user.username || "",
              name: user["Name"] || user.name || "",
              email: user["Email"] || user.email || "",
              contact: user["Contact"] || user.contact || "",
            }));

            await ApiService.makeApiCall(
              "user/bulk",
              "POST",
              {},
              validatedUsers
            );
            fetchUsers();
          } catch (error) {
            console.log(error);
            setError("Failed to process Excel file. Please check the format.");
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        setError("Error reading file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await ApiService.makeApiCall(
          `user/${selectedUser.id}`,
          "PUT",
          {},
          formData
        );
      } else {
        await ApiService.makeApiCall("user", "POST", {}, formData);
      }
      setOpenDialog(false);
      setSelectedUser(null);
      setFormData({
        username: "",
        password: "",
        email: "",
        name: "",
        contact: "",
        prefix: "",
      });
      fetchUsers();
    } catch (error) {
      setError("Failed to save user");
    }
  };

  const handleDelete = async (id) => {
    try {
      await ApiService.makeApiCall(`user/${id}`, "DELETE");
      fetchUsers();
    } catch (error) {
      setError("Failed to delete user");
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      email: user.email,
      name: user.name,
      contact: user.contact,
      prefix: user.prefix,
    });
    setOpenDialog(true);
  };

  const downloadTemplate = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws_data = [
      ["Username", "Name", "Email", "Contact"],
      ["USER", "John Doe", "john@example.com", "1234567890"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");

    // Generate Excel file
    XLSX.writeFile(wb, "users-template.xlsx");
  };

  const exportUsersToExcel = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Prepare user data for export
    const usersData = users.map((user) => ({
      Username: user.username,
      Password: user.password,
      Name: user.name,
      Email: user.email,
      Contact: user.contact,
      Role: user.role,
      Status: user.isActive ? "Active" : "Inactive",
    }));

    // Create worksheet from user data
    const ws = XLSX.utils.json_to_sheet(usersData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // Generate Excel file
    XLSX.writeFile(wb, "users.xlsx");
  };

  const handleEmailInputChange = (e) => {
    setEmailForm({
      ...emailForm,
      [e.target.name]: e.target.value,
    });
  };

  const sendEmail = async () => {
    try {
      const response = await ApiService.makeApiCall(
        "email/send",
        "POST",
        {},
        {
          subject: emailForm.subject,
          body: emailForm.body,
        }
      );
      setEmailDialogOpen(false);
      setEmailForm({ subject: "", body: "" });
      // Show success message
    } catch (error) {
      setEmailDialogOpen(false);
      setEmailForm({ subject: "", body: "" });
      setError("Failed to send emails");
    }
  };

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Mail className="mr-2" />
              Send Email to Users
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={emailForm.subject}
                  onChange={handleEmailInputChange}
                  placeholder="Subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  name="body"
                  value={emailForm.body}
                  onChange={handleEmailInputChange}
                  placeholder="Add Mail Body Here..."
                  className="h-32"
                />
              </div>
              <Button onClick={sendEmail} className="w-full">
                Send Emails
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedUser(null);
                setFormData({
                  username: "",
                  password: "",
                  email: "",
                  name: "",
                  contact: "",
                  prefix: "",
                });
              }}
            >
              <UserPlus className="mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser ? "Edit User" : "Add User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {ApiService.role === "SUPER_ADMIN" && (
                <>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prefix">Prefix</Label>
                    <Input
                      id="prefix"
                      name="prefix"
                      value={formData.prefix}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
              {(!selectedUser || ApiService.role === "SUPER_ADMIN") && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {selectedUser ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {ApiService.role == "ADMIN" && (
          <>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2" />
              Download Excel Template
            </Button>

            <div className="relative">
              <Button variant="outline">
                <Upload className="mr-2" />
                Upload Excel
              </Button>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </>
        )}

        <Button variant="outline" onClick={exportUsersToExcel}>
          Export Users to Excel
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.password}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.contact}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? "Active" : "Inactive"}</td>
              <td>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Users;
