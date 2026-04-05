using ChallengeOS.DbModels;
using ChallengeOS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChallengeOS.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class TeamController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetChallenge()
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var superId = db.Users.Where(x => x.Id == userId).Select(x => x.CreatedBy).FirstOrDefault();

                var groups = db.ChallengeGroups
                    .Where(x => x.CreatedBy == superId && x.IsActive == true && x.StartingTime < DateTime.Now && x.EndingTime > DateTime.Now)
                    .Select(g => new TeamChallengeGroup()
                    {
                        Id = g.Id,
                        Name = g.Name,
                        StartingTime = g.StartingTime,
                        EndingTime = g.EndingTime,
                        IsActive = g.IsActive,
                        CreatedAt = g.CreatedAt,
                        CreatedBy = g.CreatedBy,
                        ChallengeUnitTasks = g.ChallengeUnitTasks.Select(t => new TeamChallengeUnitTask()
                        {
                            Id = t.Id,
                            Name = t.Name,
                            Description = t.Description,
                            MaxMarks = t.MaxMarks,
                            IsActive = t.IsActive,
                            CreatedAt = t.CreatedAt,
                            ChallengeGroupId = t.ChallengeGroupId,
                            CreatedBy = t.CreatedBy,
                            SubmissionStatus = t.ChallengeTaskSubmissions.Any(s => s.UserId == userId),
                            Code = t.ChallengeTaskSubmissions.Any(s => s.UserId == userId) ? t.ChallengeTaskSubmissions.Where(s => s.UserId == userId).Select(s => s.Code).FirstOrDefault() : ""
                        }).ToList()
                    })
                    .FirstOrDefault();

                return Ok(groups);
            }
            catch { }
            TeamChallengeGroup ch = new TeamChallengeGroup();
            ch.ChallengeUnitTasks = new List<TeamChallengeUnitTask>();
            return Ok(ch);
        }

        [HttpGet("{id}")]
        public IActionResult GetSubmission(string id)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var submission = db.ChallengeTaskSubmissions.FirstOrDefault(x => x.UserId == userId && x.ChallengeId == id);

                if (submission != null)
                {
                    return Ok(new
                    {
                        StatusCode = 200,
                        Message = "Submission Found",
                        Code = submission.Code,
                        Langauge = submission.Language,
                        Score = submission.Score.ToString("F2")
                    });
                }


                return Ok(new
                {
                    StatusCode = 400,
                    Message = "No Submission Yet",
                    Code = "",
                    Langauge = "",
                    Score = 0.0
                });
            }
            catch
            {
                return Ok(new
                {
                    StatusCode = 400,
                    Message = "No Submission Yet",
                    Code = "",
                    Langauge = "",
                    Score = 0.0
                });
            }
        }

        [HttpPost]
        public IActionResult SubmitTask([FromBody] TeamSubmission model)
        {
            try
            {

                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var task = db.ChallengeUnitTasks.Find(model.taskId);

                if (task == null)
                {
                    return NotFound(new { StatusCode = 404, Message = "Task Not Found" });
                }

                double score = (model.passedTestCases / (double)model.totalTestCases) * task.MaxMarks;

                var submission = db.ChallengeTaskSubmissions.FirstOrDefault(x => x.UserId == userId && x.ChallengeId == model.taskId);
                if (submission != null)
                {
                    //return BadRequest(new { StatusCode = 400, Message = "Problem Already Submitted" });
                    // update

                    submission.Code = model.code;
                    submission.SubmittedAt = DateTime.Now;
                    submission.Language = model.language;
                    submission.Version = model.version;
                    submission.PassedTestCases = model.passedTestCases;
                    submission.TotalTestCases = model.totalTestCases;
                    submission.Score = score;


                    db.ChallengeTaskSubmissions.Update(submission);

                }
                else
                {


                    db.ChallengeTaskSubmissions.Add(new ChallengeTaskSubmission()
                    {
                        ChallengeId = model.taskId,
                        Code = model.code,
                        SubmittedAt = DateTime.Now,
                        Language = model.language,
                        Version = model.version,
                        UserId = userId,
                        PassedTestCases = model.passedTestCases,
                        TotalTestCases = model.totalTestCases,
                        Score = score
                    });
                }

                db.TeamSubmissionLogs.Add(new TeamSubmissionLog()
                {
                    Score = score,
                    Status = model.status,
                    SubmittedAt = DateTime.Now,
                    TaskId = model.taskId,
                    SubmittedBy = userId,
                    TestCasesPassed = model.passedTestCases,
                    TotalTestCases = model.totalTestCases,

                });

                db.SaveChanges();

                return Ok(new { StatusCode = 200, Message = $"Problem Submitted Successfully!\n You got a score of {score:F2}" });
            }
            catch
            {
                return BadRequest();
            }
        }

        [HttpGet("submission_logs")]
        public IActionResult getSubmissionLogs()
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var logs = db.TeamSubmissionLogs.Where(x => x.SubmittedBy == userId).ToList();

                var logsModel = logs.Select(x => new TeamSubmissionLogModel()
                {
                    Id = x.Id,
                    taskName = x.Task.Name,
                    SubmittedAt = x.SubmittedAt,
                    Score = x.Score,
                    Status = x.Status,
                    TestCasesPassed = x.TestCasesPassed,
                    TotalTestCases = x.TotalTestCases
                }).ToList();


                return Ok(logsModel);


            }
            catch
            {
                return BadRequest();

            }

        }

        [HttpGet("leaderboard")]
        [Authorize(Roles = "ADMIN")]
        public IActionResult Leaderboard()
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();
                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;
                var users = db.Users.Where(x => x.CreatedBy == userId && x.IsActive == true).ToList();
                var runningChallenge = db.ChallengeGroups
                    .Where(x => x.EndingTime.AddHours(24) > DateTime.Now && x.StartingTime < DateTime.Now && x.IsActive && x.CreatedBy == userId)
                    .FirstOrDefault();

                if (runningChallenge == null)
                {
                    return Ok(new List<LeaderboardEntry>());
                }

                var maxMarks = runningChallenge.ChallengeUnitTasks.Sum(x => x.MaxMarks);
                var leaderboard = new List<LeaderboardEntry>();

                foreach (var user in users)
                {
                    var submissions = user.ChallengeTaskSubmissions
                        .Where(x => x.Challenge.ChallengeGroupId == runningChallenge.Id)
                        .OrderBy(x => x.SubmittedAt)
                        .ToList();

                    if (submissions.Any())
                    {
                        var totalScore = submissions.Sum(s => s.Score);
                        var averageTime = submissions.Average(s => (s.SubmittedAt - runningChallenge.StartingTime).TotalMinutes);

                        // Time bonus calculation: earlier submissions get higher bonus
                        var timeBonus = 100 * Math.Exp(-averageTime / 1440); // 1440 minutes = 24 hours
                        var finalScore = totalScore + timeBonus;

                        leaderboard.Add(new LeaderboardEntry
                        {
                            UserId = user.Id,
                            UserName = user.Username,
                            Score = totalScore,
                            TimeBonus = timeBonus,
                            FinalScore = finalScore,
                            AverageSubmissionTime = averageTime,
                            SubmissionCount = submissions.Count
                        });
                    }
                    else
                    {
                        leaderboard.Add(new LeaderboardEntry
                        {
                            UserId = user.Id,
                            UserName = user.Name,
                            Score = 0,
                            TimeBonus = 0,
                            FinalScore = 0,
                            AverageSubmissionTime = 0,
                            SubmissionCount = submissions.Count
                        });
                    }
                }

                // Sort by final score (descending) and return top entries
                var sortedLeaderboard = leaderboard
                    .OrderByDescending(x => x.FinalScore)
                    .ToList();

                return Ok(sortedLeaderboard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while generating the leaderboard" });
            }
        }
    }
}
