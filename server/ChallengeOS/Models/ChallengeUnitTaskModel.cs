namespace ChallengeOS.Models
{
    public class CreateUpdateChallengeUnitTaskRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int MaxMarks { get; set; }
        public int ChallengeGroupId { get; set; }
    }


    public class ChallengeUnitTaskResponseModel
    {
        public string Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int MaxMarks { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ChallengeUnitTaskWithTestCaseResponseModel
    {
        public string Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int MaxMarks { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<TestCaseResponseModel> TestCases { get; set; } = new List<TestCaseResponseModel>();
    }


    public class CreateUpdateTestCaseRequest
    {
        public string Name { get; set; } = null!;
        public string Input { get; set; } = null!;
        public string Output { get; set; } = null!;
        public bool MatchCase { get; set; } = true;
        public string ChallengeUnitTaskId { get; set; } = null!;
    }

    public class TestCaseResponseModel
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Input { get; set; } = null!;
        public string Output { get; set; } = null!;
        public bool MatchCase { get; set; }
        public bool IsUserVisible { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
