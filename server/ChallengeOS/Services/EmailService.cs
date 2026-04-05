using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.Net.Mail;
using System.Net;

namespace ChallengeOS.Services
{
    public class EmailSettings
    {
        public string SmtpServer { get; set; } = "";
        public int Port { get; set; }
        public string Password { get; set; } = "";
        public string Username { get; set; } = "";

    }

    public interface IEmailService
    {
        void SendEmail(string subject, string body, string to);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;
        private readonly string? serverName;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger, IConfiguration configuration)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
            serverName = configuration.GetConnectionString("Server");
        }

        public void SendEmail(string subject, string body, string to)
        {
            try
            {
                SmtpClient smtpClient = new SmtpClient();
                smtpClient.Host = _emailSettings.SmtpServer;
                smtpClient.Port = _emailSettings.Port;
                smtpClient.EnableSsl = true;
                smtpClient.Timeout = 30000;
                smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password);

                MailMessage mail = new MailMessage();
                mail.From = new MailAddress(_emailSettings.Username);

                foreach (var address in to.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries))
                {
                    mail.To.Add(address);
                }
                mail.IsBodyHtml = true;

                string content = body;

                mail.Body = content.Replace("\n", "<br/>");
                mail.Subject = subject;

                smtpClient.Send(mail);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email");
            }
        }
    }

}
