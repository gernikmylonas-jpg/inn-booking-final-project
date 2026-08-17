namespace inn_booking_final_project.Application.DTOs;

public record RoomDto(Guid Id, string Name, int Capacity, decimal HourlyRate);

public record CreateRoomDto(string Name, int Capacity, decimal HourlyRate);