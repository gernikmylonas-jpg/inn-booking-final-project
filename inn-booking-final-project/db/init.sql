-- init.sql
-- Runs automatically when the Postgres container's data volume is first initialized
-- (Postgres only executes files in /docker-entrypoint-initdb.d on an EMPTY data dir).
--
-- Schema below matches inn-booking-final-project/Domain/Room.cs exactly.
-- No EF Core naming-convention package is configured, so Npgsql expects the
-- C# property names verbatim as column names -> they must stay quoted/PascalCase.

CREATE TABLE IF NOT EXISTS rooms (
    "Id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name"        text    NOT NULL,
    "Capacity"    integer NOT NULL,
    "DailyRate"   numeric(10, 2) NOT NULL
);

-- gen_random_uuid() lives in pgcrypto on Postgres < 13; Postgres 16 (used in
-- docker-compose.yml) has it built in via the "pgcrypto" extension being
-- unnecessary -- uuidv4 gen is native since PG13. Kept here defensively.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO rooms ("Id", "Name", "Capacity", "DailyRate") VALUES
    (gen_random_uuid(), 'Δωμάτιο 1 - Θέα στο βουνό',      2, 85.00),
    (gen_random_uuid(), 'Δωμάτιο 2 - Οικογενειακό σουίτ', 4, 120.00),
    (gen_random_uuid(), 'Δωμάτιο 3 - Με βεράντα',         2, 95.00),
    (gen_random_uuid(), 'Δωμάτιο 4 - Δίκλινο, κήπος',     2, 75.00),
    (gen_random_uuid(), 'Δωμάτιο 5 - Σουίτα με τζάκι',    3, 140.00),
    (gen_random_uuid(), 'Δωμάτιο 6 - Μονόκλινο, οικονομικό', 1, 55.00)
ON CONFLICT DO NOTHING;

-- Schema below matches inn-booking-final-project/Domain/User.cs exactly.
CREATE TABLE IF NOT EXISTS users (
    "Id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name"          text NOT NULL,
    "Email"         text NOT NULL,
    "PasswordHash"  text NOT NULL,
    "CreatedAt"     timestamptz NOT NULL DEFAULT now()
);

-- Matches the unique index configured in AppDbContext.OnModelCreating.
CREATE UNIQUE INDEX IF NOT EXISTS "IX_users_Email" ON users ("Email");

-- Schema below matches inn-booking-final-project/Domain/Booking.cs exactly.
-- "Status" is stored as an integer because EF Core maps a plain C# enum to
-- its underlying int by default (BookingStatus.Confirmed = 0, Cancelled = 1) --
-- no value converter is configured, so this must stay numeric, not text.
CREATE TABLE IF NOT EXISTS bookings (
    "Id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "RoomId"      uuid NOT NULL REFERENCES rooms ("Id"),
    "UserId"      uuid NOT NULL REFERENCES users ("Id"),
    "StartDate"   date NOT NULL,
    "EndDate"     date NOT NULL,
    "TotalPrice"  numeric(10, 2) NOT NULL,
    "Status"      integer NOT NULL DEFAULT 0,
    "CreatedAt"   timestamptz NOT NULL DEFAULT now()
);

-- Matches the composite index configured in AppDbContext.OnModelCreating,
-- used when checking a room's booked date ranges for overlap.
CREATE INDEX IF NOT EXISTS "IX_bookings_RoomId_StartDate_EndDate"
    ON bookings ("RoomId", "StartDate", "EndDate");