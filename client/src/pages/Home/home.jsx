import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";
import { Badge } from "@/components/components/ui/badge";
import { Loader2 } from "lucide-react";
import ApiService from "@/services/api_service";

const Home = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (ApiService.role !== "USER") {
        setLoading(false);
        return;
      }

      try {
        const response = await ApiService.makeApiCall("team/submission_logs");
        console.log("Response:", response);
        setLogs(response);
      } catch (err) {
        setError("Failed to load submission logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (ApiService.role !== "USER") {
    return (
      <div className="p-4 text-red-500 text-center">
        Home page not implemented yet
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="m-6">
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Test Cases</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.taskName}</TableCell>
                <TableCell>
                  {new Date(log.submittedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(log.status)}>
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>{log.score}</TableCell>
                <TableCell>
                  {log.testCasesPassed} / {log.totalTestCases}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No submission logs found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Home;
