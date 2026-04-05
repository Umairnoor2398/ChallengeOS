using ChallengeOS.Constants;
using ChallengeOS.DbModels;

namespace ChallengeOS.Data
{
    public static class DbSeeder
    {
        public static string ConnectionString { get; set; }
        public static string prefix { get; set; }

        public static async Task SeedData(IServiceProvider service)
        {
            IConfiguration configuration = service.GetRequiredService<IConfiguration>();
            var superAdminCred = configuration.GetSection("SuperAdminCredentials");

            prefix = superAdminCred["Prefix"] ?? "";
            var superAdminUsername = superAdminCred["Username"] ?? "";
            var superAdminPassword = superAdminCred["Password"] ?? "";
            var superAdminEmail = superAdminCred["Email"] ?? "";
            var superAdminName = superAdminCred["Name"] ?? "";
            var superAdminContact = superAdminCred["Contact"] ?? "";


            ChallengeOsDbContext db = new ChallengeOsDbContext();

            foreach (RoleEnum role in Enum.GetValues(typeof(RoleEnum)))
            {
                var roleExists = db.Roles.Any(r => r.Value == role.ToString());
                if (!roleExists)
                {
                    db.Roles.Add(new Role { Value = role.ToString() });
                }

            }

            db.SaveChanges();

            var superAdminRole = db.Roles.FirstOrDefault(r => r.Value == RoleEnum.SUPER_ADMIN.ToString());
            var superAdminExists = db.Users.Any(u => u.Username == superAdminUsername);

            if (!superAdminExists)
            {
                db.Users.Add(new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = superAdminUsername,
                    Password = superAdminPassword,
                    RoleId = superAdminRole.Id,
                    IsActive = true,
                    CreatedAt = DateTime.Now
                });

                db.SaveChanges();
            }

        }
    }
}
