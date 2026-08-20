using inn_booking_final_project.Domain;

namespace inn_booking_final_project.Application.Interfaces;

public interface IBookingRepository
{
	Task<List<Booking>> GetByRoomIdAsync(Guid roomId);
	Task<List<Booking>> GetByUserIdAsync(Guid userId);
	Task<bool> HasOverlapAsync(Guid roomId, DateOnly startDate, DateOnly endDate);
	Task AddAsync(Booking booking);
}