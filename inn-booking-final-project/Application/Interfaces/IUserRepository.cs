using inn_booking_final_project.Domain;

namespace inn_booking_final_project.Application.Interfaces;

public interface IUserRepository
{
	Task<User?> GetByEmailAsync(string email);
	Task AddAsync(User user);
}