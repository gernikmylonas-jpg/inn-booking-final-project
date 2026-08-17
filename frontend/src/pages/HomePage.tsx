import { useEffect, useState } from "react";
import type { Room } from "../types";

const API_BASE_URL = "http://localhost:5070";

function formatPrice(dailyRate: number): string {
    return `${dailyRate.toFixed(0)}€ / βράδυ`;
}

function formatSubtitle(capacity: number): string {
    return capacity === 1
        ? "1 άτομο"
        : `${capacity} άτομα`;
}


interface RoofMarkProps {
    className?: string;
}

function RoofMark({ className = "" }: RoofMarkProps) {
    // Small signature motif referencing a peaked A-frame lodge roofline —
    // reused as a divider and as the accent above the wordmark.
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

interface RoomCardProps {
    room: Room;
    onSelect: (room: Room) => void;
}

function RoomCard({ room, onSelect }: RoomCardProps) {
    return (
        <div className="group bg-amber-50 border border-amber-300 overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative h-40 bg-green-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-green-950/40 to-transparent" />
                <RoofMark className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-5 text-amber-100/80" />
            </div>
            <div className="p-5">
                <h3 className="font-serif text-xl text-stone-800">{room.name}</h3>
                <p className="text-sm text-stone-500 mt-1">{formatSubtitle(room.capacity)}</p>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-amber-800">{formatPrice(room.dailyRate)}</span>
                    <button
                        type="button"
                        onClick={() => onSelect(room)}
                        className="text-sm font-medium bg-green-800 text-white px-4 py-2 hover:bg-green-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-800"
                    >
                        Κράτηση
                    </button>
                </div>
            </div>
        </div>
    );
}

interface HomePageProps {
    onSelectRoom: (room: Room) => void;
}

export default function HomePage({ onSelectRoom }: HomePageProps) {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadRooms() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/api/rooms`);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                const data: Room[] = await response.json();
                if (!cancelled) {
                    setRooms(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "Δεν ήταν δυνατή η φόρτωση των δωματίων."
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadRooms();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen bg-amber-100 text-stone-800 font-sans">
            {/* Header */}
            <header className="border-b border-amber-300 bg-amber-100/95 backdrop-blur sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RoofMark className="w-7 h-3 text-amber-700" />
                        <span className="font-serif text-2xl tracking-wide text-stone-800">Η Στέγη</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600">
                        <a href="#rooms" className="hover:text-stone-900 transition-colors">Δωμάτια</a>
                        <a href="#about" className="hover:text-stone-900 transition-colors">Σχετικά</a>
                        <a href="#footer" className="hover:text-stone-900 transition-colors">Επικοινωνία</a>
                    </nav>

                    <button
                        type="button"
                        className="text-sm font-medium bg-green-800 text-white px-5 py-2 hover:bg-green-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-800"
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        aria-label="Μενού"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="md:hidden ml-3 text-stone-700"
                    >
                        <span className="block w-5 h-0.5 bg-current mb-1" />
                        <span className="block w-5 h-0.5 bg-current mb-1" />
                        <span className="block w-5 h-0.5 bg-current" />
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden border-t border-amber-300 px-6 py-4 flex flex-col gap-3 text-sm text-stone-600">
                        <a href="#rooms">Δωμάτια</a>
                        <a href="#about">Σχετικά</a>
                        <a href="#footer">Επικοινωνία</a>
                    </div>
                )}
            </header>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
                <RoofMark className="w-16 h-5 text-amber-700 mx-auto mb-6" />
                <h1 className="font-serif text-4xl md:text-5xl text-stone-800 leading-tight">
                    Ένα σπίτι μακριά από το σπίτι σου
                </h1>
                <p className="text-stone-500 mt-4 max-w-xl mx-auto">
                    Παραδοσιακά δωμάτια, φιλική φιλοξενία, και ησυχία — κάντε κράτηση
                    απευθείας, χωρίς μεσάζοντες.
                </p>
            </section>

            {/* Rooms */}
            <section id="rooms" className="max-w-5xl mx-auto px-6 pb-20">
                <div className="flex items-baseline justify-between mb-6">
                    <h2 className="font-serif text-2xl text-stone-800">Τα δωμάτιά μας</h2>
                    <span className="text-sm text-stone-500">
                        {isLoading ? "…" : `${rooms.length} διαθέσιμα`}
                    </span>
                </div>

                {isLoading && (
                    <p className="text-sm text-stone-500">Φόρτωση δωματίων…</p>
                )}

                {!isLoading && error && (
                    <p className="text-sm text-red-700">
                        Δεν ήταν δυνατή η φόρτωση των δωματίων: {error}
                    </p>
                )}

                {!isLoading && !error && rooms.length === 0 && (
                    <p className="text-sm text-stone-500">Δεν υπάρχουν διαθέσιμα δωμάτια αυτή τη στιγμή.</p>
                )}

                {!isLoading && !error && rooms.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {rooms.map((room) => (
                            <RoomCard key={room.id} room={room} onSelect={onSelectRoom} />
                        ))}
                    </div>
                )}
            </section>

            {/* About */}
            <section id="about" className="bg-green-900 text-white">
                <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <RoofMark className="w-12 h-4 text-amber-300 mb-5" />
                        <h2 className="font-serif text-3xl mb-4">Η ιστορία της Στέγης</h2>
                        <p className="text-amber-50 leading-relaxed">
                            Χτισμένο πριν από τρεις γενιές, το ξενοδοχείο μας κρατά ζωντανή
                            την παράδοση της ελληνικής φιλοξενίας. Κάθε δωμάτιο έχει τη δική
                            του ιστορία, και κάθε επισκέπτης φεύγει σαν μέλος της οικογένειας.
                        </p>
                    </div>
                    <div className="aspect-video bg-green-800 border border-green-700" />
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="border-t border-amber-300">
                <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-500">
                    <span>© {new Date().getFullYear()} Η Στέγη. Όλα τα δικαιώματα διατηρούνται.</span>
                    <div className="flex gap-4">
                        <a href="#footer" className="hover:text-stone-700 transition-colors">Όροι χρήσης</a>
                        <a href="#footer" className="hover:text-stone-700 transition-colors">Απόρρητο</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}