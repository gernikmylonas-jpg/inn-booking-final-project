using inn_booking_final_project.Application.DTOs;
using inn_booking_final_project.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inn_booking_final_project.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
	private readonly AuthService _authService;

	public AuthController(AuthService authService) => _authService = authService;

	[HttpPost("register")]
	public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
	{
		try
		{
			return Ok(await _authService.RegisterAsync(dto));
		}
		catch (InvalidOperationException ex)
		{
			return Conflict(new { message = ex.Message });
		}
	}

	[HttpPost("login")]
	public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
	{
		try
		{
			return Ok(await _authService.LoginAsync(dto));
		}
		catch (UnauthorizedAccessException ex)
		{
			return Unauthorized(new { message = ex.Message });
		}
	}

	// JWTs are stateless: there is no server-side session to end, so "logout"
	// just means the client discards its token. This endpoint requires a
	// valid token so the client has something concrete to call, and leaves
	// room for a future token-blacklist if that's ever needed.
	[HttpPost("logout")]
	[Authorize]
	public IActionResult Logout() => NoContent();
}