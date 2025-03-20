using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models;
using TaskManagement.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<TaskHub> _hubContext;
        private readonly ILogger<TasksController> _logger;

        public TasksController(ApplicationDbContext context, IHubContext<TaskHub> hubContext, ILogger<TasksController> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            try
            {
                var username = User.Identity?.Name;
                _logger.LogInformation($"User {username} retrieving tasks");

                return await _context.Tasks
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks");
                return StatusCode(500, "An error occurred while retrieving tasks");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);

                if (task == null)
                {
                    _logger.LogWarning($"Task {id} not found");
                    return NotFound($"Task with ID {id} not found");
                }

                return task;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving task {id}");
                return StatusCode(500, "An error occurred while retrieving the task");
            }
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask([FromBody] TaskItem task)
        {
            try
            {
                _logger.LogInformation("Received task creation request: {TaskData}", 
                    JsonSerializer.Serialize(task));

                if (!ModelState.IsValid)
                {
                    var errors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    _logger.LogWarning("Invalid task model: {Errors}", errors);
                    return BadRequest(new { message = "Invalid task data", errors = errors });
                }

                var username = User.Identity?.Name ?? "system";
                _logger.LogInformation($"User {username} creating task: {task.Title}");

                task.CreatedAt = DateTime.UtcNow;
                task.Status = task.Status ?? "Todo";
                task.CreatedBy = username;

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                // Notify all clients about the new task
                await _hubContext.Clients.All.SendAsync("TaskCreated", task);

                _logger.LogInformation($"Task {task.Id} created successfully");

                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while creating the task", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, TaskItem task)
        {
            try
            {
                if (id != task.Id)
                {
                    return BadRequest("Task ID mismatch");
                }

                var username = User.Identity?.Name;
                _logger.LogInformation($"User {username} updating task {id}");

                task.UpdatedAt = DateTime.UtcNow;
                _context.Entry(task).State = EntityState.Modified;

                await _context.SaveChangesAsync();
                
                // Notify all clients about the task update
                await _hubContext.Clients.All.SendAsync("TaskUpdated", task);

                _logger.LogInformation($"Task {id} updated successfully");
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    _logger.LogWarning($"Task {id} not found during update");
                    return NotFound($"Task with ID {id} not found");
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating task {id}");
                return StatusCode(500, "An error occurred while updating the task");
            }
        }

        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignTask(int id, [FromBody] string assignedTo)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                
                if (task == null)
                {
                    _logger.LogWarning($"Task {id} not found during assignment");
                    return NotFound($"Task with ID {id} not found");
                }

                var username = User.Identity?.Name;
                _logger.LogInformation($"User {username} assigning task {id} to {assignedTo}");

                task.AssignedTo = assignedTo;
                task.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                // Notify all clients about the task assignment
                await _hubContext.Clients.All.SendAsync("TaskAssigned", task);

                _logger.LogInformation($"Task {id} assigned successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error assigning task {id}");
                return StatusCode(500, "An error occurred while assigning the task");
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] string status)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                
                if (task == null)
                {
                    _logger.LogWarning($"Task {id} not found during status update");
                    return NotFound($"Task with ID {id} not found");
                }

                var username = User.Identity?.Name;
                _logger.LogInformation($"User {username} updating task {id} status to {status}");

                task.Status = status;
                task.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                // Notify all clients about the status change
                await _hubContext.Clients.All.SendAsync("TaskStatusUpdated", task);

                _logger.LogInformation($"Task {id} status updated successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating task {id} status");
                return StatusCode(500, "An error occurred while updating the task status");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    _logger.LogWarning($"Task {id} not found during deletion");
                    return NotFound($"Task with ID {id} not found");
                }

                var username = User.Identity?.Name;
                _logger.LogInformation($"User {username} deleting task {id}");

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                // Notify all clients about the task deletion
                await _hubContext.Clients.All.SendAsync("TaskDeleted", id);

                _logger.LogInformation($"Task {id} deleted successfully");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting task {id}");
                return StatusCode(500, "An error occurred while deleting the task");
            }
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}
