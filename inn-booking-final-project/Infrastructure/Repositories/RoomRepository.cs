using inn_booking_final_project.Application.Interfaces;
using inn_booking_final_project.Domain;
using inn_booking_final_project.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace inn_booking_final_project.Infrastructure.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly AppDbContext _context;

    public RoomRepository(AppDbContext context) => _context = context;

    public async Task<List<Room>> GetAllAsync() =>
        await _context.Rooms.ToListAsync();

    public async Task<Room?> GetByIdAsync(Guid id) =>
        await _context.Rooms.FindAsync(id);

    public async Task AddAsync(Room room)
    {
        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();
    }
}