using Microsoft.EntityFrameworkCore;
using inn_booking_final_project.Domain;

namespace inn_booking_final_project.Infrastructure.Data;

public class AppDbContext : DbContext
{
	public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

	public DbSet<Room> Rooms => Set<Room>();
	public DbSet<User> Users => Set<User>();
	public DbSet<Booking> Bookings => Set<Booking>();

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<Room>().ToTable("rooms");
		modelBuilder.Entity<User>().ToTable("users");
		modelBuilder.Entity<Booking>().ToTable("bookings");

		modelBuilder.Entity<User>()
			.HasIndex(u => u.Email)
			.IsUnique();

		modelBuilder.Entity<Booking>()
			.HasIndex(b => new { b.RoomId, b.StartDate, b.EndDate });
	}
}