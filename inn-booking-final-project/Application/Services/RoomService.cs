using inn_booking_final_project.Application.DTOs;
using inn_booking_final_project.Application.Interfaces;
using inn_booking_final_project.Domain;

namespace inn_booking_final_project.Application.Services;

public class RoomService
{
	private readonly IRoomRepository _repository;

	public RoomService(IRoomRepository repository) => _repository = repository;

	public async Task<List<RoomDto>> GetAllRoomsAsync()
	{
		var rooms = await _repository.GetAllAsync();
		return rooms.Select(r => new RoomDto(r.Id, r.Name, r.Capacity, r.HourlyRate)).ToList();
	}

	public async Task<RoomDto> CreateRoomAsync(CreateRoomDto dto)
	{
		var room = new Room
		{
			Id = Guid.NewGuid(),
			Name = dto.Name,
			Capacity = dto.Capacity,
			HourlyRate = dto.HourlyRate
		};
		await _repository.AddAsync(room);
		return new RoomDto(room.Id, room.Name, room.Capacity, room.HourlyRate);
	}
}