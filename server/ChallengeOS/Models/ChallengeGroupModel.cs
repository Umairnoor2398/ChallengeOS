namespace ChallengeOS.Models
{
    public class ChallengeGroupModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string StartingTime { get; set; }
        public string EndingTime { get; set; }
    }


    public class ChallengeGroupResponseModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime StartingTime { get; set; }
        public DateTime EndingTime { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }

}
