using ChallengeOS.DbModels;
using ChallengeOS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;

namespace ChallengeOS.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [Route("[controller]")]
    [ApiController]
    public class ChallengeGroupController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ChallengeGroupController> logger;

        public ChallengeGroupController(IConfiguration configuration, ILogger<ChallengeGroupController> logger)
        {
            _configuration = configuration;
            this.logger = logger;
        }

        // Get all challenge groups
        [HttpGet]
        public IActionResult GetChallengeGroups()
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var groups = db.ChallengeGroups
                    .Where(x => x.CreatedBy == userId)
                    .Select(g => new ChallengeGroupResponseModel()
                    {
                        Id = g.Id,
                        Name = g.Name,
                        StartingTime = g.StartingTime,
                        EndingTime = g.EndingTime,
                        IsActive = g.IsActive,
                        CreatedAt = g.CreatedAt
                    })
                    .ToList();

                return Ok(groups);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching challenge groups");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // Get a specific challenge group by id
        [HttpGet("{id}")]
        public IActionResult GetChallengeGroup(int id)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var group = db.ChallengeGroups
                    .FirstOrDefault(x => x.CreatedBy == userId && x.Id == id);

                if (group == null)
                {
                    return NotFound();
                }

                var model = new ChallengeGroupResponseModel
                {
                    Id = group.Id,
                    Name = group.Name,
                    StartingTime = group.StartingTime,
                    EndingTime = group.EndingTime,
                    IsActive = group.IsActive,
                    CreatedAt = group.CreatedAt
                };

                return Ok(model);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching challenge group");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // Create a new challenge group
        [HttpPost]
        public IActionResult CreateChallengeGroup([FromBody] ChallengeGroupModel groupModel)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var group = new ChallengeGroup
                {
                    Name = groupModel.Name,
                    StartingTime = DateTime.Parse(groupModel.StartingTime),
                    EndingTime = DateTime.Parse(groupModel.EndingTime),
                    IsActive = true,
                    CreatedAt = DateTime.Now,
                    CreatedBy = userId
                };

                db.ChallengeGroups.Add(group);
                db.SaveChanges();

                var responseModel = new ChallengeGroupResponseModel
                {
                    Id = group.Id,
                    Name = group.Name,
                    StartingTime = group.StartingTime,
                    EndingTime = group.EndingTime,
                    IsActive = group.IsActive,
                    CreatedAt = group.CreatedAt
                };

                return Ok(responseModel);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while creating challenge group");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // Update an existing challenge group
        [HttpPut("{id}")]
        public IActionResult UpdateChallengeGroup(int id, [FromBody] ChallengeGroupModel groupModel)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var group = db.ChallengeGroups
                    .FirstOrDefault(x => x.CreatedBy == userId && x.Id == id);

                if (group == null)
                {
                    return NotFound();
                }

                group.Name = groupModel.Name;
                group.StartingTime = DateTime.Parse(groupModel.StartingTime);
                group.EndingTime = DateTime.Parse(groupModel.EndingTime);

                db.SaveChanges();

                var responseModel = new ChallengeGroupResponseModel
                {
                    Id = group.Id,
                    Name = group.Name,
                    StartingTime = group.StartingTime,
                    EndingTime = group.EndingTime,
                    IsActive = group.IsActive,
                    CreatedAt = group.CreatedAt
                };

                return Ok(responseModel);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while updating challenge group");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // Delete a challenge group (deactivating it)
        [HttpDelete("{id}")]
        public IActionResult DeleteChallengeGroup(int id)
        {
            try
            {
                ChallengeOsDbContext db = new ChallengeOsDbContext();

                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.PrimarySid)?.Value;

                var group = db.ChallengeGroups
                    .FirstOrDefault(x => x.CreatedBy == userId && x.Id == id);

                if (group == null)
                {
                    return NotFound();
                }

                group.IsActive = !group.IsActive; // Toggle the activity status
                db.SaveChanges();

                var responseModel = new ChallengeGroupResponseModel
                {
                    Id = group.Id,
                    Name = group.Name,
                    StartingTime = group.StartingTime,
                    EndingTime = group.EndingTime,
                    IsActive = group.IsActive,
                    CreatedAt = group.CreatedAt
                };

                return Ok(responseModel);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while deleting challenge group");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
