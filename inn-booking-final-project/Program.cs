using inn_booking_final_project.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using inn_booking_final_project.Application.Interfaces;
using inn_booking_final_project.Application.Services;
using inn_booking_final_project.Infrastructure.Repositories;
using inn_booking_final_project.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options =>
{
	options.AddPolicy("Frontend", policy =>
	{
		policy.WithOrigins("http://localhost:5173")
			.AllowAnyHeader()
			.AllowAnyMethod();
	});
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"]
	?? throw new InvalidOperationException("Jwt:Key is not configured. Add a Jwt section to appsettings.");

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	// Without this, ASP.NET Core silently renames well-known inbound claims
	// (e.g. "sub" -> the long legacy .NET ClaimTypes.NameIdentifier URI) when
	// it reads the token back. That breaks any code -- like BookingsController --
	// that looks up JwtRegisteredClaimNames.Sub ("sub") directly. Setting this
	// to false keeps claims exactly as JwtTokenService wrote them.
	options.MapInboundClaims = false;

	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = jwtSettings["Issuer"],
		ValidAudience = jwtSettings["Audience"],
		IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
	};
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();

}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();