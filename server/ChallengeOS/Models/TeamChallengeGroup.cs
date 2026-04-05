using ChallengeOS.DbModels;

namespace ChallengeOS.Models
{
    public class TeamChallengeGroup
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public DateTime StartingTime { get; set; }

        public DateTime EndingTime { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public string CreatedBy { get; set; } = null!;

        public List<TeamChallengeUnitTask> ChallengeUnitTasks { get; set; } = new List<TeamChallengeUnitTask>();
    }

    public class TeamChallengeUnitTask
    {
        public string Id { get; set; }

        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public int MaxMarks { get; set; }

        public DateTime CreatedAt { get; set; }

        public int ChallengeGroupId { get; set; }

        public string CreatedBy { get; set; } = null!;

        public string? Code { get; set; }

        public bool SubmissionStatus { get; set; }

    }


    public class TeamSubmission
    {
        public string taskId { get; set; }

        public string code { get; set; }
        public string language { get; set; }
        public string version { get; set; }
        public bool isSuccess { get; set; }
        public int passedTestCases { get; set; }
        public int totalTestCases { get; set; }

        public string status { get; set; }
    }


    public class TeamSubmissionLogModel
    {
        public int Id { get; set; }

        public string taskName { get; set; } = null!;

        public DateTime SubmittedAt { get; set; }

        public double Score { get; set; }


        public string Status { get; set; } = null!;

        public int TestCasesPassed { get; set; }

        public int TotalTestCases { get; set; }

    }

    public class LeaderboardEntry
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public double Score { get; set; }
        public double TimeBonus { get; set; }
        public double FinalScore { get; set; }
        public double AverageSubmissionTime { get; set; }
        public int SubmissionCount { get; set; }
    }

}
