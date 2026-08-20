using inn_booking_final_project.Application.DTOs;
using inn_booking_final_project.Application.Interfaces;
using inn_booking_final_project.Domain;

namespace inn_booking_final_project.Application.Services;

public class BookingService
{
	private readonly IBookingRepository _bookingRepository;
	private readonly IRoomRepository _roomRepository;

	public BookingService(IBookingRepository bookingRepository, IRoomRepository roomRepository)
	{
		_bookingRepository = bookingRepository;
		_roomRepository = roomRepository;
	}

	public async Task<List<UnavailableRangeDto>> GetUnavailableRangesAsync(Guid roomId)
	{
		var bookings = await _bookingRepository.GetByRoomIdAsync(roomId);
		return bookings.Select(b => new UnavailableRangeDto(b.StartDate, b.EndDate)).ToList();
	}

	public async Task<BookingDto> CreateBookingAsync(Guid userId, CreateBookingDto dto)
	{
		if (dto.EndDate <= dto.StartDate)
			throw new InvalidOperationException("Η ημερομηνία αναχώρησης πρέπει να είναι μετά την άφιξη.");

		var room = await _roomRepository.GetByIdAsync(dto.RoomId)
			?? throw new InvalidOperationException("Το δωμάτιο δεν βρέθηκε.");

		if (await _bookingRepository.HasOverlapAsync(dto.RoomId, dto.StartDate, dto.EndDate))
			throw new InvalidOperationException("Το δωμάτιο δεν είναι διαθέσιμο για αυτές τις ημερομηνίες.");

		var nights = dto.EndDate.DayNumber - dto.StartDate.DayNumber;

		var booking = new Booking
		{
			Id = Guid.NewGuid(),
			RoomId = dto.RoomId,
			UserId = userId,
			StartDate = dto.StartDate,
			EndDate = dto.EndDate,
			TotalPrice = nights * room.DailyRate,
			Status = BookingStatus.Confirmed,
			CreatedAt = DateTime.UtcNow,
		};

		await _bookingRepository.AddAsync(booking);

		return new BookingDto(booking.Id, booking.RoomId, room.Name, booking.StartDate, booking.EndDate, booking.TotalPrice, booking.Status.ToString());
	}

	public async Task<List<BookingDto>> GetMyBookingsAsync(Guid userId)
	{
		var bookings = await _bookingRepository.GetByUserIdAsync(userId);
		return bookings.Select(b =>
			new BookingDto(b.Id, b.RoomId, b.Room.Name, b.StartDate, b.EndDate, b.TotalPrice, b.Status.ToString())
		).ToList();
	}
}