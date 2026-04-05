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
import { AlertCircle, UserPlus } from "lucide-react";
import ApiService from "../../services/api_service";
import { Navigate, Link } from "react-router";

const ChallengeGroups = () => {
  const [challengeGroups, setChallengeGroups] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    startingTime: "",
    endingTime: "",
  });
  const [error, setError] = useState("");

  // If role is not 'ADMIN' or 'SUPER_ADMIN', redirect
  if (ApiService.role != "ADMIN") {
    return <Navigate to="/" />;
  }

  const fetchChallengeGroups = async () => {
    try {
      const response = await ApiService.makeApiCall("ChallengeGroup");
      console.log("Fetched challenge groups:", response);
      setChallengeGroups(response);
    } catch (error) {
      setError("Failed to fetch challenge groups");
    }
  };

  useEffect(() => {
    fetchChallengeGroups();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedGroup) {
        await ApiService.makeApiCall(
          `ChallengeGroup/${selectedGroup.id}`,
          "PUT",
          {},
          formData
        );
      } else {
        await ApiService.makeApiCall("ChallengeGroup", "POST", {}, formData);
      }
      setOpenDialog(false);
      setSelectedGroup(null);
      setFormData({
        name: "",
        startingTime: "",
        endingTime: "",
      });
      fetchChallengeGroups();
    } catch (error) {
      setError("Failed to save challenge group");
    }
  };

  const handleDelete = async (id) => {
    try {
      await ApiService.makeApiCall(`ChallengeGroup/${id}`, "DELETE");
      fetchChallengeGroups();
    } catch (error) {
      setError("Failed to delete challenge group");
    }
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      startingTime: group.startingTime,
      endingTime: group.endingTime,
    });
    setOpenDialog(true);
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
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedGroup(null);
                setFormData({
                  name: "",
                  startingTime: "",
                  endingTime: "",
                  isActive: false,
                });
              }}
            >
              <UserPlus className="mr-2" />
              Add Challenge Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedGroup ? "Edit Challenge Group" : "Add Challenge Group"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startingTime">Starting Time</Label>
                <Input
                  id="startingTime"
                  name="startingTime"
                  type="datetime-local"
                  value={formData.startingTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endingTime">Ending Time</Label>
                <Input
                  id="endingTime"
                  name="endingTime"
                  type="datetime-local"
                  value={formData.endingTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {selectedGroup ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Starting Time</th>
            <th>Ending Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {challengeGroups.map((group) => (
            <tr key={group.id}>
              <td>{group.name}</td>
              <td>{new Date(group.startingTime).toLocaleString()}</td>
              <td>{new Date(group.endingTime).toLocaleString()}</td>
              <td>{group.isActive ? "Active" : "Inactive"}</td>
              <td>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(group)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(group.id)}
                  >
                    {group.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Link to={`/challenge-unit?groupId=${group.id}`}>
                    <Button variant="outline" size="sm">
                      View Tasks
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ChallengeGroups;
