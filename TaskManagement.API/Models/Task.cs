using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Todo";

        [Required]
        [StringLength(20)]
        public string Priority { get; set; } = "Medium";

        [StringLength(100)]
        public string AssignedTo { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
