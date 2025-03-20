using Microsoft.AspNetCore.SignalR;
using TaskManagement.API.Models;

namespace TaskManagement.API.Hubs
{
    public class TaskHub : Hub
    {
        public async Task TaskCreated(TaskItem task)
        {
            await Clients.All.SendAsync("TaskCreated", task);
        }

        public async Task TaskUpdated(TaskItem task)
        {
            await Clients.All.SendAsync("TaskUpdated", task);
        }

        public async Task TaskDeleted(int taskId)
        {
            await Clients.All.SendAsync("TaskDeleted", taskId);
        }
    }
}
