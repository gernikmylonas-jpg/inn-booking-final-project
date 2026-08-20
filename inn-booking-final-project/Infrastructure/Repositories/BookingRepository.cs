using inn_booking_final_project.Application.Interfaces;
using inn_booking_final_project.Domain;
using inn_booking_final_project.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace inn_booking_final_project.Infrastructure.Repositories;

public class BookingRepository : IBookingRepository
{
	private readonly AppDbContext _context;

	public BookingRepository(AppDbContext context) => _context = context;

	public async Task<List<Booking>> GetByRoomIdAsync(Guid roomId) =>
		await _context.Bookings
			.Where(b => b.RoomId == roomId && b.Status != BookingStatus.Cancelled)
			.ToListAsync();

	public async Task<List<Booking>> GetByUserIdAsync(Guid userId) =>
		await _context.Bookings
			.Include(b => b.Room)
			.Where(b => b.UserId == userId)
			.OrderByDescending(b => b.StartDate)
			.ToListAsync();

	// Half-open interval overlap check: two ranges [startA,endA) and [startB,endB)
	// overlap iff startA < endB && endA > startB. This lets one booking's
	// checkout day equal another's check-in day without falsely flagging overlap.
	public async Task<bool> HasOverlapAsync(Guid roomId, DateOnly startDate, DateOnly endDate) =>
		await _context.Bookings.AnyAsync(b =>
			b.RoomId == roomId &&
			b.Status != BookingStatus.Cancelled &&
			startDate < b.EndDate &&
			endDate > b.StartDate);

	public async Task AddAsync(Booking booking)
	{
		_context.Bookings.Add(booking);
		await _context.SaveChangesAsync();
	}
}