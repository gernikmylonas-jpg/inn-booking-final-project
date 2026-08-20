// Shape returned by GET /api/rooms (RoomDto on the backend).
// ASP.NET Core serializes to camelCase JSON by default, and Id is a Guid -> string.
export interface Room {
	id: string;
	name: string;
	capacity: number;
	dailyRate: number;
}

// Shape returned inside AuthResponseDto ("user" field) from /api/auth/*.
export interface User {
	id: string;
	name: string;
	email: string;
}

// Full shape of AuthResponseDto from POST /api/auth/register and /login.
export interface AuthResponse {
	token: string;
	user: User;
}
