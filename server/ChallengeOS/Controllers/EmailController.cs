using ChallengeOS.DbModels;
using ChallengeOS.Models;
using ChallengeOS.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Web;

namespace ChallengeOS.Controllers
{
    [Route("[controller]")]
    [Authorize]
    [ApiController]
    public class EmailController : ControllerBase
    {

        private readonly IEmailService emailService;

        public EmailController(IEmailService emailService)
        {
            this.emailService = emailService;
        }

        [HttpPost("send")]
        public IActionResult SendEmail([FromBody] EmailModel email)
        {
            try
            {
                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                ChallengeOsDbContext context = new ChallengeOsDbContext();

                var users = context.Users.Where(u => u.CreatedBy == userId && u.IsActive).ToList();


                foreach (var user in users)
                {
                    string subject = ReplaceParameters(email.subject, user);

                    string body = ReplaceParameters(email.body, user);

                    emailService.SendEmail(subject, body, user.Email);
                }

                return Ok(new
                {
                    StatusCode = StatusCodes.Status200OK,
                    Message = "Email sent successfully"
                });

            }
            catch
            {
                return BadRequest();

            }

        }


        private string ReplaceParameters(string str, User model)
        {
            str = HttpUtility.HtmlDecode(str);
            str = str.Replace("<<Name>>", model.Name);
            str = str.Replace("<<Email>>", model.Email);
            str = str.Replace("<<Contact>>", model.Contact);
            str = str.Replace("<<Username>>", model.Username);
            str = str.Replace("<<Password>>", model.Password);

            return str;
        }

    }
}
