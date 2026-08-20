import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

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

interface RegisterPageProps {
    onSuccess: () => void;
    onNavigateToLogin: () => void;
    onBack: () => void;
}

export default function RegisterPage({ onSuccess, onNavigateToLogin, onBack }: RegisterPageProps) {
    const { register, isLoading, error } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const success = await register(name, email, password);
        if (success) onSuccess();
    }

    return (
        <div className="min-h-screen bg-amber-100 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <RoofMark className="w-7 h-3 text-amber-700" />
                    <span className="font-serif text-2xl tracking-wide text-stone-800">Η Στέγη</span>
                </div>

                <div className="bg-amber-50 border border-amber-300 p-8">
                    <h1 className="font-serif text-2xl text-stone-800 mb-1">Εγγραφή</h1>
                    <p className="text-sm text-stone-500 mb-6">Δημιουργήστε λογαριασμό για να κάνετε κράτηση.</p>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-xs text-stone-600 mb-1" htmlFor="register-name">
                                Ονοματεπώνυμο
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                required
                                autoComplete="name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="w-full border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-stone-600 mb-1" htmlFor="register-email">
                                Email
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-700"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-stone-600 mb-1" htmlFor="register-password">
                                Κωδικός πρόσβασης
                            </label>
                            <input
                                id="register-password"
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full border border-amber-300 bg-white px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-700"
                            />
                            <p className="text-xs text-stone-400 mt-1">Τουλάχιστον 8 χαρακτήρες.</p>
                        </div>

                        {error && <p className="text-sm text-red-700">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-sm font-medium bg-green-800 text-white px-4 py-2 hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-800"
                        >
                            {isLoading ? "Δημιουργία λογαριασμού…" : "Εγγραφή"}
                        </button>
                    </form>

                    <p className="text-xs text-stone-500 mt-5">
                        Έχετε ήδη λογαριασμό;{" "}
                        <button
                            type="button"
                            onClick={onNavigateToLogin}
                            className="text-green-800 font-medium hover:underline"
                        >
                            Σύνδεση
                        </button>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    className="text-xs text-stone-500 hover:text-stone-700 mt-4 block mx-auto"
                >
                    ← Πίσω
                </button>
            </div>
        </div>
    );
}
