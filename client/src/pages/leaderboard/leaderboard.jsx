import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/components/ui/card";
import { Button } from "@/components/components/ui/button";
import { Trophy, Medal, Award, Download } from "lucide-react";
import ApiService from "../../services/api_service";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      const response = await ApiService.makeApiCall("team/leaderboard");
      setLeaderboardData(response);
      setError(null);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to fetch leaderboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const intervalId = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Challenge Leaderboard", 14, 15);
    doc.setFontSize(10);

    // Add timestamp
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    const tableData = leaderboardData.map((entry, index) => [
      index + 1,
      entry.userName,
      entry.submissionCount,
      // Math.round(entry.score),
      Math.round(entry.finalScore),
      // Math.round(entry.timeBonus),
    ]);

    doc.autoTable({
      startY: 30,
      head: [
        [
          "Position",
          "Team Name",
          "Submissions",
          "Total Score",
          // "Base Score",
          // "Time Bonus",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [0, 101, 255] },
      alternateRowStyles: { fillColor: [240, 245, 255] },
    });

    doc.save("leaderboard.pdf");
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center font-bold">
            {index + 1}
          </span>
        );
    }
  };

  if (isLoading && leaderboardData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-white">
            Challenge Leaderboard
            <div className="text-sm font-normal mt-1 opacity-75">
              Auto-refreshes every 5 seconds
            </div>
          </CardTitle>
          <Button
            onClick={handleExportPDF}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && <div className="text-center text-red-500 py-4">{error}</div>}

        {!error && leaderboardData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No active challenge or participants found
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboardData.map((entry, index) => (
              <div
                key={entry.userId}
                className="flex items-center p-4 rounded-lg transition-all duration-200 hover:bg-blue-50"
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s`,
                }}
              >
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(index)}
                </div>
                <div className="flex-grow ml-4">
                  <div className="font-semibold text-lg text-gray-800">
                    {entry.userName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.submissionCount} submissions
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">
                    {Math.round(entry.finalScore)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Score: {Math.round(entry.score)} +{" "}
                    {Math.round(entry.timeBonus)} bonus
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
