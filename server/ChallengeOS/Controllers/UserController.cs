using ChallengeOS.Constants;
using ChallengeOS.DbModels;
using ChallengeOS.Models.UserModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Security.Claims;

namespace ChallengeOS.Controllers
{
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    [Route("[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserController> logger;

        public UserController(IConfiguration configuration, ILogger<UserController> logger)
        {
            _configuration = configuration;
            this.logger = logger;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var users = db.Users.Where(x => x.CreatedBy == userId).Select(a => new UserResponseModel()
                {
                    Id = a.Id,
                    Username = a.Username,
                    Name = a.Name,
                    Contact = a.Contact,
                    Email = a.Email,
                    Role = a.Role.Value,
                    Password = a.Password,
                    Prefix = a.Prefix,
                    isActive = a.IsActive
                }).ToList();

                return Ok(users);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching users");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetUser(string id)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var user = db.Users.Where(x => x.CreatedBy == userId && x.Id == id).FirstOrDefault();

                if (user == null)
                {
                    return NotFound();
                }

                UserResponseModel model = new UserResponseModel
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role.Value,
                    Name = user.Name,
                    Email = user.Email,
                    Contact = user.Contact,
                    Password = user.Password,
                    Prefix = user.Prefix,
                    isActive = user.IsActive
                };

                return Ok(model);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching user");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        private static string GenerateRandomPassword(int length)
        {
            //return "12345678";


            const string chars = "0123456789";
            //const string chars = "ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789";
            Random random = new Random();
            char[] password = new char[length];

            for (int i = 0; i < length; i++)
            {
                password[i] = chars[random.Next(chars.Length)];
            }

            return new string(password);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] UserModel user)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;
                var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
                var userPrefix = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GroupSid)?.Value;

                var nextRole = userRole == RoleEnum.SUPER_ADMIN.ToString() ? RoleEnum.ADMIN : RoleEnum.USER;


                if (userRole == RoleEnum.ADMIN.ToString())
                {
                    int lastUserNumber = 0;
                    var lastUser = db.Users
                        .Where(u => u.Username.StartsWith(userPrefix))
                        .OrderByDescending(u => u.Username)
                        .FirstOrDefault();

                    if (lastUser != null)
                    {
                        string numberPart = lastUser.Username.Substring(userPrefix.Length);
                        int.TryParse(numberPart, out lastUserNumber);
                    }

                    lastUserNumber++;
                    user.Username = $"{userPrefix}{lastUserNumber:D4}";
                    user.Password = GenerateRandomPassword(8);
                    user.Prefix = null;

                }

                var role = db.Roles.FirstOrDefault(r => r.Value == nextRole.ToString());

                if (db.Users.Any(x => x.Username == user.Username))
                {
                    return BadRequest(new { message = "Username already exists" });
                }

                User dbUser = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = user.Username,
                    Password = user.Password,
                    Name = user.Name,
                    Email = user.Email,
                    Contact = user.Contact,
                    Prefix = user.Prefix,
                    RoleId = role.Id,
                    CreatedBy = userId,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };

                db.Users.Add(dbUser);
                db.SaveChanges();

                UserResponseModel model = new UserResponseModel
                {
                    Id = dbUser.Id,
                    Username = dbUser.Username,
                    Role = role.Value,
                    Name = dbUser.Name,
                    Email = dbUser.Email,
                    Contact = dbUser.Contact,
                    Prefix = dbUser.Prefix,
                    isActive = dbUser.IsActive
                };

                return Ok(model);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while creating user");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost("bulk")]
        public IActionResult CreateBulkUsers([FromBody] List<UserModel> users)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;
                var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

                var nextRole = userRole == RoleEnum.SUPER_ADMIN.ToString() ? RoleEnum.ADMIN : RoleEnum.USER;
                var role = db.Roles.FirstOrDefault(r => r.Value == nextRole.ToString());

                if (role == null)
                {
                    return BadRequest(new { message = "Invalid role configuration" });
                }

                var newUsers = new List<User>();
                var userPrefix = "";

                // If admin is creating users, get their prefix for username generation
                if (userRole == RoleEnum.ADMIN.ToString())
                {
                    var adminUser = db.Users.FirstOrDefault(u => u.Id == userId);
                    if (adminUser != null)
                    {
                        userPrefix = adminUser.Prefix;
                    }
                }

                // Get the last user number for the prefix to generate sequential usernames
                int lastUserNumber = 0;
                if (!string.IsNullOrEmpty(userPrefix))
                {
                    var lastUser = db.Users
                        .Where(u => u.Username.StartsWith(userPrefix))
                        .OrderByDescending(u => u.Username)
                        .FirstOrDefault();

                    if (lastUser != null)
                    {
                        string numberPart = lastUser.Username.Substring(userPrefix.Length);
                        int.TryParse(numberPart, out lastUserNumber);
                    }
                }

                foreach (var user in users)
                {
                    // For admin users, generate username and random password
                    if (userRole == RoleEnum.ADMIN.ToString() && string.IsNullOrEmpty(user.Username))
                    {
                        lastUserNumber++;
                        user.Username = $"{userPrefix}{lastUserNumber:D4}";
                        //user.Password = GenerateRandomPassword(8);
                        //user.Prefix = null;

                    }
                    if (userRole == RoleEnum.ADMIN.ToString())
                    {
                        user.Password = GenerateRandomPassword(8);
                        user.Prefix = null;
                    }

                    // For super admin, validate username exists
                    else if (string.IsNullOrEmpty(user.Username))
                    {
                        return BadRequest(new { message = "Username is required for all users" });
                    }

                    // Check for duplicate usernames
                    if (db.Users.Any(x => x.Username == user.Username))
                    {
                        return BadRequest(new { message = $"Username {user.Username} already exists" });
                    }

                    var dbUser = new User
                    {
                        Id = Guid.NewGuid().ToString(),
                        Username = user.Username,
                        Password = user.Password,
                        Name = user.Name,
                        Email = user.Email,
                        Contact = user.Contact,
                        RoleId = role.Id,
                        CreatedBy = userId,
                        CreatedAt = DateTime.Now,
                        IsActive = true,
                        Prefix = userRole == RoleEnum.SUPER_ADMIN.ToString() ? user.Prefix : null
                    };

                    newUsers.Add(dbUser);
                }

                db.Users.AddRange(newUsers);
                db.SaveChanges();

                var response = newUsers.Select(u => new UserResponseModel
                {
                    Id = u.Id,
                    Username = u.Username,
                    Role = role.Value,
                    isActive = u.IsActive,
                    Name = u.Name,
                    Email = u.Email,
                    Contact = u.Contact
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while creating bulk users");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateUser(string id, [FromBody] UserModel user)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var userToUpdate = db.Users.Where(x => x.CreatedBy == userId && x.Id == id).FirstOrDefault();

                if (userToUpdate == null)
                {
                    return NotFound();
                }

                userToUpdate.Username = user.Username;
                userToUpdate.Email = user.Email;
                userToUpdate.Contact = user.Contact;
                userToUpdate.Name = user.Name;
                userToUpdate.Password = user.Password;

                db.SaveChanges();

                UserResponseModel model = new UserResponseModel
                {
                    Id = userToUpdate.Id,
                    Username = userToUpdate.Username,
                    Role = userToUpdate.Role.Value,
                    Name = userToUpdate.Name,
                    Email = userToUpdate.Email,
                    Prefix = userToUpdate.Prefix,
                    Password = userToUpdate.Password,
                    Contact = userToUpdate.Contact,
                    isActive = userToUpdate.IsActive
                };

                return Ok(model);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating user");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteUser(string id)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var userToDelete = db.Users.Where(x => x.CreatedBy == userId && x.Id == id).FirstOrDefault();

                if (userToDelete == null)
                {
                    return NotFound();
                }

                userToDelete.IsActive = !userToDelete.IsActive;

                db.Users.Update(userToDelete);
                db.SaveChanges();

                UserResponseModel model = new UserResponseModel
                {
                    Id = userToDelete.Id,
                    Username = userToDelete.Username,
                    Role = userToDelete.Role.Value,
                    Name = userToDelete.Name,
                    Email = userToDelete.Email,
                    Contact = userToDelete.Contact,
                    Prefix = userToDelete.Prefix,
                    Password = userToDelete.Password,
                    isActive = userToDelete.IsActive
                };

                return Ok(model);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while deleting user");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
