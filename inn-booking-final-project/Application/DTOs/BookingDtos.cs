namespace inn_booking_final_project.Application.DTOs;

public record CreateBookingDto(Guid RoomId, DateOnly StartDate, DateOnly EndDate);

public record BookingDto(
	Guid Id, Guid RoomId, string RoomName,
	DateOnly StartDate, DateOnly EndDate,
	decimal TotalPrice, string Status);

public record UnavailableRangeDto(DateOnly StartDate, DateOnly EndDate);