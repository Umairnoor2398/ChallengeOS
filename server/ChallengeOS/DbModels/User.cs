using System;
using System.Collections.Generic;

namespace ChallengeOS.DbModels;

public partial class User
{
    public string Id { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int RoleId { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public string? CreatedBy { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Contact { get; set; } = null!;

    public string? Prefix { get; set; }

    public virtual ICollection<ChallengeGroup> ChallengeGroups { get; set; } = new List<ChallengeGroup>();

    public virtual ICollection<ChallengeTaskSubmission> ChallengeTaskSubmissions { get; set; } = new List<ChallengeTaskSubmission>();

    public virtual ICollection<ChallengeTaskTestCase> ChallengeTaskTestCases { get; set; } = new List<ChallengeTaskTestCase>();

    public virtual ICollection<ChallengeUnitTask> ChallengeUnitTasks { get; set; } = new List<ChallengeUnitTask>();

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<User> InverseCreatedByNavigation { get; set; } = new List<User>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<TeamSubmissionLog> TeamSubmissionLogs { get; set; } = new List<TeamSubmissionLog>();
}
