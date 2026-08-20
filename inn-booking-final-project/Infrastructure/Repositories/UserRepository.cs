using inn_booking_final_project.Application.Interfaces;
using inn_booking_final_project.Domain;
using inn_booking_final_project.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace inn_booking_final_project.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
	private readonly AppDbContext _context;

	public UserRepository(AppDbContext context) => _context = context;

	public async Task<User?> GetByEmailAsync(string email) =>
		await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

	public async Task AddAsync(User user)
	{
		_context.Users.Add(user);
		await _context.SaveChangesAsync();
	}
}