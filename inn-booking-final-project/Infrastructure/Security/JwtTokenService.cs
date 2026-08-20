using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using inn_booking_final_project.Domain;
using Microsoft.IdentityModel.Tokens;

namespace inn_booking_final_project.Infrastructure.Security;

public class JwtTokenService
{
	private readonly IConfiguration _configuration;

	public JwtTokenService(IConfiguration configuration) => _configuration = configuration;

	public string GenerateToken(User user)
	{
		var jwtSettings = _configuration.GetSection("Jwt");
		var keyValue = jwtSettings["Key"]
			?? throw new InvalidOperationException("Jwt:Key is not configured in appsettings.");

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue));
		var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var claims = new[]
		{
			new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
			new Claim(JwtRegisteredClaimNames.Email, user.Email),
			new Claim("name", user.Name),
		};

		var expiryMinutes = double.TryParse(jwtSettings["ExpiryMinutes"], out var minutes) ? minutes : 120;

		var token = new JwtSecurityToken(
			issuer: jwtSettings["Issuer"],
			audience: jwtSettings["Audience"],
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
			signingCredentials: credentials);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}