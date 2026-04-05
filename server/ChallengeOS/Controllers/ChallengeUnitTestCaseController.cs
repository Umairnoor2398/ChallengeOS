using ChallengeOS.DbModels;
using ChallengeOS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChallengeOS.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ChallengeUnitTestCaseController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChallengeUnitTestCaseController> logger;

        public ChallengeUnitTestCaseController(IConfiguration configuration, ILogger<ChallengeUnitTestCaseController> logger)
        {
            _configuration = configuration;
            this.logger = logger;
        }
        [Authorize(Roles = "ADMIN,USER")]
        [HttpGet]
        public IActionResult GetTestCases([FromQuery] string taskId)
        {
            try
            {
                using var db = new ChallengeOsDbContext();
                var testCases = db.ChallengeTaskTestCases
                    .Where(x => x.ChallengeUnitTaskId == taskId)
                    .Select(t => new
                    {
                        t.Id,
                        t.Name,
                        t.Input,
                        t.Output,
                        t.MatchCase,
                        t.IsUserVisible,
                        t.IsActive
                    })
                    .ToList();

                return Ok(testCases);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching test cases");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public IActionResult CreateTestCase([FromBody] CreateUpdateTestCaseRequest model)
        {
            try
            {
                using var db = new ChallengeOsDbContext();
                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var testCase = new ChallengeTaskTestCase
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = model.Name,
                    Input = model.Input,
                    Output = model.Output,
                    MatchCase = model.MatchCase,
                    ChallengeUnitTaskId = model.ChallengeUnitTaskId,
                    IsActive = true,
                    IsUserVisible = false,
                    CreatedBy = userId,
                    CreatedAt = DateTime.Now
                };

                db.ChallengeTaskTestCases.Add(testCase);
                db.SaveChanges();

                return Ok(new TestCaseResponseModel
                {
                    Id = testCase.Id,
                    Name = testCase.Name,
                    Input = testCase.Input,
                    Output = testCase.Output,
                    MatchCase = testCase.MatchCase,
                    IsUserVisible = testCase.IsUserVisible,
                    IsActive = testCase.IsActive,
                    CreatedAt = testCase.CreatedAt
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating test case");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public IActionResult UpdateTestCase(string id, [FromBody] CreateUpdateTestCaseRequest model)
        {
            try
            {
                using var db = new ChallengeOsDbContext();
                var testCase = db.ChallengeTaskTestCases.Find(id);

                if (testCase == null)
                    return NotFound();

                testCase.Name = model.Name;
                testCase.Input = model.Input;
                testCase.Output = model.Output;
                testCase.MatchCase = model.MatchCase;

                db.SaveChanges();

                return Ok(new TestCaseResponseModel
                {
                    Id = testCase.Id,
                    Name = testCase.Name,
                    Input = testCase.Input,
                    Output = testCase.Output,
                    MatchCase = testCase.MatchCase,
                    IsUserVisible = testCase.IsUserVisible,
                    IsActive = testCase.IsActive,
                    CreatedAt = testCase.CreatedAt
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating test case");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}/visibility")]
        public IActionResult ToggleVisibility(string id)
        {
            try
            {
                using var db = new ChallengeOsDbContext();
                var testCase = db.ChallengeTaskTestCases.Find(id);

                if (testCase == null)
                    return NotFound();

                testCase.IsUserVisible = !testCase.IsUserVisible;
                db.SaveChanges();
                return Ok(new TestCaseResponseModel
                {
                    Id = testCase.Id,
                    Name = testCase.Name,
                    Input = testCase.Input,
                    Output = testCase.Output,
                    MatchCase = testCase.MatchCase,
                    IsUserVisible = testCase.IsUserVisible,
                    IsActive = testCase.IsActive,
                    CreatedAt = testCase.CreatedAt
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error toggling visibility");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}/status")]
        public IActionResult ToggleStatus(string id)
        {
            try
            {
                using var db = new ChallengeOsDbContext();
                var testCase = db.ChallengeTaskTestCases.Find(id);

                if (testCase == null)
                    return NotFound();

                testCase.IsActive = !testCase.IsActive;
                db.SaveChanges();
                return Ok(new TestCaseResponseModel
                {
                    Id = testCase.Id,
                    Name = testCase.Name,
                    Input = testCase.Input,
                    Output = testCase.Output,
                    MatchCase = testCase.MatchCase,
                    IsUserVisible = testCase.IsUserVisible,
                    IsActive = testCase.IsActive,
                    CreatedAt = testCase.CreatedAt
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error toggling status");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}