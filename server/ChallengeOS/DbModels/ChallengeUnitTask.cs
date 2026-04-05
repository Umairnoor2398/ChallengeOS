using System;
using System.Collections.Generic;

namespace ChallengeOS.DbModels;

public partial class ChallengeUnitTask
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public int MaxMarks { get; set; }

    public DateTime CreatedAt { get; set; }

    public int ChallengeGroupId { get; set; }

    public string CreatedBy { get; set; } = null!;

    public virtual ChallengeGroup ChallengeGroup { get; set; } = null!;

    public virtual ICollection<ChallengeTaskSubmission> ChallengeTaskSubmissions { get; set; } = new List<ChallengeTaskSubmission>();

    public virtual ICollection<ChallengeTaskTestCase> ChallengeTaskTestCases { get; set; } = new List<ChallengeTaskTestCase>();

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<TeamSubmissionLog> TeamSubmissionLogs { get; set; } = new List<TeamSubmissionLog>();
}
