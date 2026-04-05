using ChallengeOS.DbModels;
using ChallengeOS.Extensions;
using ChallengeOS.Models.UserModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChallengeOS.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthorizeController : ControllerBase
    {

        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthorizeController> logger;

        public AuthorizeController(IConfiguration configuration, ILogger<AuthorizeController> logger)
        {
            _configuration = configuration;
            this.logger = logger;
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginModel request)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var user = db.Users.Where(x => x.Username == request.Username && x.Password == request.Password && x.IsActive == true).FirstOrDefault();

                if (user != null)
                {
                    var jwtSettings = _configuration.GetSection("JwtSettings");

                    var expiring = DateTime.Now.AddHours(!string.IsNullOrEmpty(jwtSettings["ExpiryHours"]) ? Convert.ToDouble(jwtSettings["ExpiryHours"]) : 1);

                    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));

                    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                    var claims = new[]
                    {
                        new Claim(ClaimTypes.Name, request.Username),
                        new Claim(ClaimTypes.PrimarySid, user.Id),
                        new Claim(ClaimTypes.Role, user.Role.Value),
                        new Claim(ClaimTypes.GroupSid, user.Prefix??""),
                    };

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(claims),
                        Audience = jwtSettings["Audience"],
                        Issuer = jwtSettings["Issuer"],
                        Expires = expiring,
                        SigningCredentials = credentials
                    };

                    var tokenHandler = new JwtSecurityTokenHandler();
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var tokenString = tokenHandler.WriteToken(token);


                    return Ok(new { token = tokenString, expires = expiring.ToStandardDateTimeString(), role = user.Role.Value });
                }

                return Unauthorized();
            }
            catch (Exception ex)
            {

                logger.LogError(ex, $"An Error has occured in {this.GetType().Name}.{new StackFrame(1).GetMethod().Name}");

                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
