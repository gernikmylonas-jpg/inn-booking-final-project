using Microsoft.EntityFrameworkCore;

namespace InnBookingFinalProject.Infrastructure.Data;

public class AppDbContext : DbContext
{
	public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}