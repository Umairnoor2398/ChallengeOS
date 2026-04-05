using ChallengeOS.DbModels;
using ChallengeOS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;

namespace ChallengeOS.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ChallengeUnitTaskController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChallengeUnitTaskController> logger;

        public ChallengeUnitTaskController(IConfiguration configuration, ILogger<ChallengeUnitTaskController> logger)
        {
            _configuration = configuration;
            this.logger = logger;
        }
        [Authorize(Roles = "ADMIN")]
        // Get all challenge unit tasks by group id
        [HttpGet]
        public IActionResult GetChallengeUnitTasks([FromQuery] int groupId)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var tasks = db.ChallengeUnitTasks
                    .Where(x => x.ChallengeGroupId == groupId)
                    .Select(t => new ChallengeUnitTaskResponseModel()
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        MaxMarks = t.MaxMarks,
                        IsActive = t.IsActive,
                        CreatedAt = t.CreatedAt
                    })
                    .ToList();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching challenge unit tasks");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN,USER")]
        // Get a specific challenge unit task by id
        [HttpGet("{id}")]
        public IActionResult GetChallengeUnitTask(string id)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var task = db.ChallengeUnitTasks.FirstOrDefault(x => x.Id == id);

                if (task == null)
                {
                    return NotFound();
                }

                var model = new ChallengeUnitTaskWithTestCaseResponseModel
                {
                    Id = task.Id,
                    Name = task.Name,
                    Description = task.Description,
                    MaxMarks = task.MaxMarks,
                    IsActive = task.IsActive,
                    CreatedAt = task.CreatedAt,
                    TestCases = task.ChallengeTaskTestCases.Where(x => x.IsActive == true).Select(testCase => new TestCaseResponseModel()
                    {
                        Id = testCase.Id,
                        Name = testCase.Name,
                        Input = testCase.Input,
                        Output = testCase.Output,
                        MatchCase = testCase.MatchCase,
                        IsUserVisible = testCase.IsUserVisible,
                        IsActive = testCase.IsActive,
                        CreatedAt = testCase.CreatedAt
                    }).ToList()
                };

                return Ok(model);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching challenge unit task");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN")]
        // Create a new challenge unit task
        [HttpPost]
        public IActionResult CreateChallengeUnitTask([FromBody] CreateUpdateChallengeUnitTaskRequest taskModel)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var task = new ChallengeUnitTask
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = taskModel.Name,
                    Description = taskModel.Description,
                    MaxMarks = taskModel.MaxMarks,
                    ChallengeGroupId = taskModel.ChallengeGroupId,
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    CreatedBy = userId
                };

                db.ChallengeUnitTasks.Add(task);
                db.SaveChanges();

                var responseModel = new ChallengeUnitTaskResponseModel
                {
                    Id = task.Id,
                    Name = task.Name,
                    Description = task.Description,
                    MaxMarks = task.MaxMarks,
                    IsActive = task.IsActive,
                    CreatedAt = task.CreatedAt
                };

                return Ok(responseModel);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while creating challenge unit task");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN")]
        // Update an existing challenge unit task
        [HttpPut("{id}")]
        public IActionResult UpdateChallengeUnitTask(string id, [FromBody] CreateUpdateChallengeUnitTaskRequest taskModel)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var task = db.ChallengeUnitTasks.FirstOrDefault(x => x.Id == id);

                if (task == null)
                {
                    return NotFound();
                }

                task.Name = taskModel.Name;
                task.Description = taskModel.Description;
                task.MaxMarks = taskModel.MaxMarks;

                db.SaveChanges();

                var responseModel = new ChallengeUnitTaskResponseModel
                {
                    Id = task.Id,
                    Name = task.Name,
                    Description = task.Description,
                    MaxMarks = task.MaxMarks,
                    IsActive = task.IsActive,
                    CreatedAt = task.CreatedAt
                };

                return Ok(responseModel);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating challenge unit task");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
        [Authorize(Roles = "ADMIN")]
        // Delete (deactivate) a challenge unit task
        [HttpDelete("{id}")]
        public IActionResult DeleteChallengeUnitTask(string id)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var task = db.ChallengeUnitTasks.FirstOrDefault(x => x.Id == id);

                if (task == null)
                {
                    return NotFound();
                }

                task.IsActive = !task.IsActive; // Toggle the activity status
                db.SaveChanges();

                var responseModel = new ChallengeUnitTaskResponseModel
                {
                    Id = task.Id,
                    Name = task.Name,
                    Description = task.Description,
                    MaxMarks = task.MaxMarks,
                    IsActive = task.IsActive,
                    CreatedAt = task.CreatedAt
                };

                return Ok(responseModel);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while deleting challenge unit task");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
