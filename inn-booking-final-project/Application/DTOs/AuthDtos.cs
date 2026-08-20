namespace inn_booking_final_project.Application.DTOs;

public record RegisterDto(string Name, string Email, string Password);

public record LoginDto(string Email, string Password);

public record UserDto(Guid Id, string Name, string Email);

public record AuthResponseDto(string Token, UserDto User);