namespace ChallengeOS.Models.UserModels
{
    public class UserModel
    {
        public string? Username { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Contact { get; set; }

        public string? Password { get; set; }

        public string? Prefix { get; set; }
    }

    public class UserResponseModel
    {
        public string Id { get; set; }

        public string Username { get; set; }

        public string Role { get; set; }

        public string Name { get; set; }
        public string Email { get; set; }
        public string Contact { get; set; }

        public bool isActive { get; set; }
        public string? Prefix { get; set; }
        public string Password { get; set; }
    }
}
