using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using inn_booking_final_project.Application.DTOs;
using inn_booking_final_project.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace inn_booking_final_project.Controllers;

[ApiController]
[Route("api")]
public class BookingsController : ControllerBase
{
	private readonly BookingService _bookingService;

	public BookingsController(BookingService bookingService) => _bookingService = bookingService;

	[HttpGet("rooms/{roomId:guid}/unavailable-dates")]
	public async Task<ActionResult<List<UnavailableRangeDto>>> GetUnavailableDates(Guid roomId) =>
		Ok(await _bookingService.GetUnavailableRangesAsync(roomId));

	[HttpPost("bookings")]
	[Authorize]
	public async Task<ActionResult<BookingDto>> Create(CreateBookingDto dto)
	{
		try
		{
			return Ok(await _bookingService.CreateBookingAsync(GetUserId(), dto));
		}
		catch (InvalidOperationException ex)
		{
			return Conflict(new { message = ex.Message });
		}
	}

	[HttpGet("bookings/mine")]
	[Authorize]
	public async Task<ActionResult<List<BookingDto>>> Mine() =>
		Ok(await _bookingService.GetMyBookingsAsync(GetUserId()));

	private Guid GetUserId()
	{
		var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
			?? throw new InvalidOperationException("Δεν βρέθηκε αναγνωριστικό χρήστη στο token.");
		return Guid.Parse(sub);
	}
}