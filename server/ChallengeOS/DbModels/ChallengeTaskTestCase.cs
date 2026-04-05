using System;
using System.Collections.Generic;

namespace ChallengeOS.DbModels;

public partial class ChallengeTaskTestCase
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Input { get; set; } = null!;

    public string Output { get; set; } = null!;

    public bool MatchCase { get; set; }

    public bool IsUserVisible { get; set; }

    public bool IsActive { get; set; }

    public string ChallengeUnitTaskId { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public string CreatedBy { get; set; } = null!;

    public virtual ChallengeUnitTask ChallengeUnitTask { get; set; } = null!;

    public virtual User CreatedByNavigation { get; set; } = null!;
}
