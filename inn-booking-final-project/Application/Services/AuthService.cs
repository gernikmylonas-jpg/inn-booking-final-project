using inn_booking_final_project.Application.DTOs;
using inn_booking_final_project.Application.Interfaces;
using inn_booking_final_project.Domain;
using inn_booking_final_project.Infrastructure.Security;

namespace inn_booking_final_project.Application.Services;

public class AuthService
{
	private readonly IUserRepository _repository;
	private readonly JwtTokenService _tokenService;

	public AuthService(IUserRepository repository, JwtTokenService tokenService)
	{
		_repository = repository;
		_tokenService = tokenService;
	}

	public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
	{
		var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

		var existing = await _repository.GetByEmailAsync(normalizedEmail);
		if (existing is not null)
		{
			throw new InvalidOperationException("Υπάρχει ήδη λογαριασμός με αυτό το email.");
		}

		var user = new User
		{
			Id = Guid.NewGuid(),
			Name = dto.Name.Trim(),
			Email = normalizedEmail,
			PasswordHash = PasswordHasher.Hash(dto.Password),
			CreatedAt = DateTime.UtcNow,
		};

		await _repository.AddAsync(user);

		var token = _tokenService.GenerateToken(user);
		return new AuthResponseDto(token, new UserDto(user.Id, user.Name, user.Email));
	}

	public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
	{
		var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
		var user = await _repository.GetByEmailAsync(normalizedEmail);

		if (user is null || !PasswordHasher.Verify(dto.Password, user.PasswordHash))
		{
			throw new UnauthorizedAccessException("Λανθασμένο email ή κωδικός πρόσβασης.");
		}

		var token = _tokenService.GenerateToken(user);
		return new AuthResponseDto(token, new UserDto(user.Id, user.Name, user.Email));
	}
}