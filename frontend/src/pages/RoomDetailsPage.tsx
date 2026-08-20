import { useEffect, useMemo, useState } from "react";
import type { Room, UnavailableRange } from "../types";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5070";

const GREEK_MONTHS = [
    "Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
    "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος",
];

const GREEK_WEEKDAYS = ["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"];

function pad(n: number): string {
    return n.toString().padStart(2, "0");
}

function formatISO(year: number, month0: number, day: number): string {
    return `${year}-${pad(month0 + 1)}-${pad(day)}`;
}

function addDaysISO(iso: string, days: number): string {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// Expands [{startDate, endDate}, ...] half-open ranges from the API into a
// Set of individual "yyyy-MM-dd" strings for O(1) lookup while rendering days.
// endDate itself is a checkout day, not an occupied night, so it's excluded.
function expandUnavailable(ranges: UnavailableRange[]): Set<string> {
    const set = new Set<string>();
    for (const r of ranges) {
        let cursor = r.startDate;
        while (cursor < r.endDate) {
            set.add(cursor);
            cursor = addDaysISO(cursor, 1);
        }
    }
    return set;
}

function formatPrice(amount: number): string {
    return `${amount.toFixed(0)}€`;
}

interface RoofMarkProps {
    className?: string;
}

function RoofMark({ className = "" }: RoofMarkProps) {
    return (
        <svg viewBox="0 0 64 20" className={className} fill="none" aria-hidden="true">
            <path
                d="M2 18L32 2L62 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function PhotoCarousel({ roomName }: { roomName: string }) {
    // TODO: the backend Room entity has no photo URLs yet. This renders
    // placeholder frames matching the room's theme until an Images field
    // (or a related table) is added to the API.
    const slideCount = 6;
    const [activeIndex, setActiveIndex] = useState(0);

    function goTo(index: number) {
        setActiveIndex((index + slideCount) % slideCount);
    }

    return (
        <div>
            <div className="relative h-64 sm:h-80 bg-green-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/50 to-transparent" />
                <RoofMark className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-6 text-amber-100/80" />
                <span className="absolute top-4 left-4 text-xs font-medium text-amber-100/90 bg-green-950/40 px-2 py-1">
                    {roomName} — φωτογραφία {activeIndex + 1} από {slideCount}
                </span>

                <button
                    type="button"
                    aria-label="Προηγούμενη φωτογραφία"
                    onClick={() => goTo(activeIndex - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-amber-100/90 text-stone-800 w-8 h-8 flex items-center justify-center hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                    ‹
                </button>
                <button
                    type="button"
                    aria-label="Επόμενη φωτογραφία"
                    onClick={() => goTo(activeIndex + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-100/90 text-stone-800 w-8 h-8 flex items-center justify-center hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                    ›
                </button>
            </div>

            <div className="flex gap-2 mt-3">
                {Array.from({ length: slideCount }).map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        aria-label={`Μετάβαση στη φωτογραφία ${index + 1}`}
                        onClick={() => goTo(index)}
                        className={`h-14 flex-1 border transition-colors ${index === activeIndex
                            ? "bg-green-800 border-green-800"
                            : "bg-amber-50 border-amber-300 hover:border-amber-500"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

interface AvailabilityCalendarProps {
    year: number;
    month: number; // 0-indexed
    unavailableDates: Set<string>;
    checkIn: string | null;
    checkOut: string | null;
    onSelectDate: (iso: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    canGoPrev: boolean;
}

function AvailabilityCalendar({
    year,
    month,
    unavailableDates,
    checkIn,
    checkOut,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
    canGoPrev,
}: AvailabilityCalendarProps) {
    const monthLabel = `${GREEK_MONTHS[month]} ${year}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first

    const today = new Date();
    const todayISO = formatISO(today.getFullYear(), today.getMonth(), today.getDate());

    const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
    const leadingBlanks = Array.from({ length: firstWeekday });

    function dayISO(day: number): string {
        return formatISO(year, month, day);
    }

    function dayState(day: number): "unavailable" | "past" | "selected" | "in-range" | "available" {
        const iso = dayISO(day);
        if (iso < todayISO) return "past";
        if (unavailableDates.has(iso)) return "unavailable";
        if (iso === checkIn || iso === checkOut) return "selected";
        if (checkIn !== null && checkOut !== null && iso > checkIn && iso < checkOut) return "in-range";
        return "available";
    }

    return (
        <div className="bg-amber-50 border border-amber-300 p-5">
            <div className="flex items-center justify-between mb-1">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    disabled={!canGoPrev}
                    aria-label="Προηγούμενος μήνας"
                    className="text-stone-500 hover:text-stone-800 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1"
                >
                    ‹
                </button>
                <h3 className="font-serif text-lg text-stone-800">{monthLabel}</h3>
                <button
                    type="button"
                    onClick={onNextMonth}
                    aria-label="Επόμενος μήνας"
                    className="text-stone-500 hover:text-stone-800 px-2 py-1"
                >
                    ›
                </button>
            </div>
            <p className="text-xs text-stone-500 text-center mb-4">Επιλέξτε άφιξη &amp; αναχώρηση</p>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-stone-500 mb-2">
                {GREEK_WEEKDAYS.map((weekday, index) => (
                    <span key={`${weekday}-${index}`}>{weekday}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {leadingBlanks.map((_, index) => (
                    <span key={`blank-${index}`} />
                ))}
                {days.map((day) => {
                    const state = dayState(day);
                    const disabled = state === "unavailable" || state === "past";
                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelectDate(dayISO(day))}
                            className={`h-9 text-sm border transition-colors ${disabled
                                ? "bg-stone-200 text-stone-400 border-stone-200 cursor-not-allowed line-through"
                                : state === "selected"
                                    ? "bg-green-800 text-white border-green-800"
                                    : state === "in-range"
                                        ? "bg-green-100 border-green-300 text-green-900"
                                        : "bg-white border-amber-200 text-stone-700 hover:border-green-700"
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-stone-200 border border-stone-300 inline-block" /> Μη διαθέσιμο
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-800 inline-block" /> Επιλεγμένο
                </span>
            </div>
        </div>
    );
}

interface RoomDetailsPageProps {
    room: Room;
    onBack: () => void;
    onRequireLogin: () => void;
}

export default function RoomDetailsPage({ room, onBack, onRequireLogin }: RoomDetailsPageProps) {
    const { user, token } = useAuth();
    const isLoggedIn = user !== null;

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    const [unavailableRanges, setUnavailableRanges] = useState<UnavailableRange[]>([]);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

    const [checkIn, setCheckIn] = useState<string | null>(null);
    const [checkOut, setCheckOut] = useState<string | null>(null);

    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadAvailability() {
            try {
                setIsLoadingAvailability(true);
                const response = await fetch(`${API_BASE_URL}/api/rooms/${room.id}/unavailable-dates`);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                const data: UnavailableRange[] = await response.json();
                if (!cancelled) setUnavailableRanges(data);
            } catch {
                // Fail quietly here -- the backend still rejects overlapping
                // bookings on submit, so this is a display-only concern.
            } finally {
                if (!cancelled) setIsLoadingAvailability(false);
            }
        }

        loadAvailability();
        return () => {
            cancelled = true;
        };
    }, [room.id]);

    const unavailableDates = useMemo(() => expandUnavailable(unavailableRanges), [unavailableRanges]);

    function goPrevMonth() {
        if (isCurrentMonth) return;
        if (viewMonth === 0) {
            setViewYear((y) => y - 1);
            setViewMonth(11);
        } else {
            setViewMonth((m) => m - 1);
        }
    }

    function goNextMonth() {
        if (viewMonth === 11) {
            setViewYear((y) => y + 1);
            setViewMonth(0);
        } else {
            setViewMonth((m) => m + 1);
        }
    }

    function handleSelectDate(iso: string) {
        setBookingConfirmed(false);
        setBookingError(null);
        if (checkIn === null || (checkIn !== null && checkOut !== null)) {
            setCheckIn(iso);
            setCheckOut(null);
            return;
        }
        if (iso <= checkIn) {
            setCheckIn(iso);
            return;
        }
        setCheckOut(iso);
    }

    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(`${checkIn}T00:00:00Z`);
        const end = new Date(`${checkOut}T00:00:00Z`);
        return Math.round((end.getTime() - start.getTime()) / 86_400_000);
    }, [checkIn, checkOut]);

    const totalCost = nights * room.dailyRate;

    async function handleBooking() {
        if (!isLoggedIn || !checkIn || !checkOut || nights <= 0) return;

        setIsBooking(true);
        setBookingError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ roomId: room.id, startDate: checkIn, endDate: checkOut }),
            });

            if (!response.ok) {
                const problem = await response.json().catch(() => null);
                throw new Error(problem?.message ?? `Το αίτημα απέτυχε (${response.status}).`);
            }

            setBookingConfirmed(true);
            setUnavailableRanges((prev) => [...prev, { startDate: checkIn, endDate: checkOut }]);
            setCheckIn(null);
            setCheckOut(null);
        } catch (err) {
            setBookingError(err instanceof Error ? err.message : "Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
        } finally {
            setIsBooking(false);
        }
    }

    return (
        <div className="min-h-screen bg-amber-100 text-stone-800 font-sans">
            <header className="border-b border-amber-300 bg-amber-100/95 backdrop-blur sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RoofMark className="w-7 h-3 text-amber-700" />
                        <span className="font-serif text-2xl tracking-wide text-stone-800">Η Στέγη</span>
                    </div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                        ← Πίσω στα δωμάτια
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                <h1 className="font-serif text-3xl text-stone-800 mb-1">{room.name}</h1>
                <p className="text-sm text-stone-500 mb-6">
                    {room.capacity === 1 ? "1 άτομο" : `${room.capacity} άτομα`} · {formatPrice(room.dailyRate)} / βράδυ
                </p>

                <PhotoCarousel roomName={room.name} />

                <div className="grid md:grid-cols-3 gap-8 mt-10">
                    <div className="md:col-span-2 space-y-8">
                        {isLoadingAvailability ? (
                            <p className="text-sm text-stone-500">Φόρτωση διαθεσιμότητας…</p>
                        ) : (
                            <AvailabilityCalendar
                                year={viewYear}
                                month={viewMonth}
                                unavailableDates={unavailableDates}
                                checkIn={checkIn}
                                checkOut={checkOut}
                                onSelectDate={handleSelectDate}
                                onPrevMonth={goPrevMonth}
                                onNextMonth={goNextMonth}
                                canGoPrev={!isCurrentMonth}
                            />
                        )}

                        <div>
                            <h3 className="font-serif text-lg text-stone-800 mb-3">Τιμολόγιο</h3>
                            <div className="bg-amber-50 border border-amber-300 divide-y divide-amber-200">
                                <div className="flex items-center justify-between px-4 py-3 text-sm">
                                    <span className="text-stone-600">Τιμή ανά διανυκτέρευση</span>
                                    <span className="font-medium text-stone-800">{formatPrice(room.dailyRate)}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 text-sm">
                                    <span className="text-stone-600">
                                        Διανυκτερεύσεις {nights > 0 ? `(${nights})` : ""}
                                    </span>
                                    <span className="font-medium text-stone-800">
                                        {nights > 0 ? formatPrice(totalCost) : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className="sticky top-24 bg-green-900 text-white p-5">
                            <h3 className="font-serif text-lg mb-1">Κόστος</h3>
                            <p className="text-3xl font-serif mb-1">
                                {nights > 0 ? formatPrice(totalCost) : formatPrice(room.dailyRate)}
                            </p>
                            <p className="text-xs text-amber-100/80 mb-5">
                                {nights > 0
                                    ? `${nights} ${nights === 1 ? "διανυκτέρευση" : "διανυκτερεύσεις"}`
                                    : "Επιλέξτε ημερομηνίες παραμονής"}
                            </p>

                            {!isLoggedIn && (
                                <button
                                    type="button"
                                    onClick={onRequireLogin}
                                    className="w-full text-sm font-medium bg-amber-100 text-stone-800 px-4 py-2 mb-2 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400"
                                >
                                    Σύνδεση
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={!isLoggedIn || nights <= 0 || isBooking}
                                onClick={handleBooking}
                                className="w-full text-sm font-medium bg-amber-500 text-stone-900 px-4 py-2 hover:bg-amber-400 transition-colors disabled:bg-green-700 disabled:text-amber-100/60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400"
                            >
                                {isBooking ? "Επεξεργασία…" : "Κράτηση"}
                            </button>

                            {isLoggedIn && nights <= 0 && (
                                <p className="text-xs text-amber-100/70 mt-2">
                                    Επιλέξτε ημερομηνία άφιξης και αναχώρησης στο ημερολόγιο.
                                </p>
                            )}

                            {bookingError && (
                                <p className="text-xs text-red-200 mt-3 font-medium">{bookingError}</p>
                            )}

                            {bookingConfirmed && (
                                <p className="text-xs text-amber-100 mt-3 font-medium">
                                    Η κράτησή σας καταχωρήθηκε.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}