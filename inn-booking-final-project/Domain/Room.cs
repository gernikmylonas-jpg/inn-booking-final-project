namespace inn_booking_final_project.Domain;

public class Room
{
	public Guid Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public int Capacity { get; set; }
	public decimal HourlyRate { get; set; }
	
	//public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
	//public ICollection<AvailabilityRule> AvailabilityRules { get; set; } = new List<AvailabilityRule>();
	//public ICollection<BlackoutDate> BlackoutDates { get; set; } = new List<BlackoutDate>();
}