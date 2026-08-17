// Shape returned by GET /api/rooms (RoomDto on the backend).
// ASP.NET Core serializes to camelCase JSON by default, and Id is a Guid -> string.
export interface Room
{
	id: string;
  name: string;
  capacity: number;
  dailyRate: number;
}