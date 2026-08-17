using inn_booking_final_project.Domain;

namespace inn_booking_final_project.Application.Interfaces;

public interface IRoomRepository
{
	Task<List<Room>> GetAllAsync();
	Task<Room?> GetByIdAsync(Guid id);
	Task AddAsync(Room room);
}