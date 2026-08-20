namespace inn_booking_final_project.Domain;

public enum BookingStatus
{
	Confirmed,
	Cancelled
}

public class Booking
{
	public Guid Id { get; set; }
	public Guid RoomId { get; set; }
	public Room Room { get; set; } = null!;
	public Guid UserId { get; set; }
	public User User { get; set; } = null!;
	public DateOnly StartDate { get; set; }
	public DateOnly EndDate { get; set; }
	public decimal TotalPrice { get; set; }
	public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}