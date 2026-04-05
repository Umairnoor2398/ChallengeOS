using System;
using System.Collections.Generic;

namespace ChallengeOS.DbModels;

public partial class ChallengeGroup
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public DateTime StartingTime { get; set; }

    public DateTime EndingTime { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public string CreatedBy { get; set; } = null!;

    public virtual ICollection<ChallengeUnitTask> ChallengeUnitTasks { get; set; } = new List<ChallengeUnitTask>();

    public virtual User CreatedByNavigation { get; set; } = null!;
}
