using System;
using System.Collections.Generic;

namespace ChallengeOS.DbModels;

public partial class ChallengeTaskSubmission
{
    public int Id { get; set; }

    public string UserId { get; set; } = null!;

    public string ChallengeId { get; set; } = null!;

    public DateTime SubmittedAt { get; set; }

    public string? Code { get; set; }

    public string Language { get; set; } = null!;

    public string Version { get; set; } = null!;

    public int PassedTestCases { get; set; }

    public int TotalTestCases { get; set; }

    public double Score { get; set; }

    public virtual ChallengeUnitTask Challenge { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
