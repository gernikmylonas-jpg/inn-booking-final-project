using inn_booking_final_project.Application.DTOs;
using inn_booking_final_project.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace inn_booking_final_project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
	private readonly RoomService _roomService;

	public RoomsController(RoomService roomService) => _roomService = roomService;

	[HttpGet]
	public async Task<ActionResult<List<RoomDto>>> GetAll() =>
		Ok(await _roomService.GetAllRoomsAsync());

	[HttpPost]
	public async Task<ActionResult<RoomDto>> Create(CreateRoomDto dto)
	{
		var room = await _roomService.CreateRoomAsync(dto);
		return CreatedAtAction(nameof(GetAll), new { id = room.Id }, room);
	}
}