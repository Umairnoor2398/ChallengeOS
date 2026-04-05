using System;
using System.Collections.Generic;

namespace ChallengeOS.DbModels;

public partial class TeamSubmissionLog
{
    public int Id { get; set; }

    public string TaskId { get; set; } = null!;

    public DateTime SubmittedAt { get; set; }

    public double Score { get; set; }

    public string SubmittedBy { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int TestCasesPassed { get; set; }

    public int TotalTestCases { get; set; }

    public virtual User SubmittedByNavigation { get; set; } = null!;

    public virtual ChallengeUnitTask Task { get; set; } = null!;
}
