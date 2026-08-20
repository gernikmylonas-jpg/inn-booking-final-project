import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import RoomDetailsPage from './pages/RoomDetailsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import type { Room } from './types'

type View = 'home' | 'room-details' | 'login' | 'register'

function AppShell() {
    const [view, setView] = useState<View>('home')
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    // Where to go back to once login/register succeeds or is cancelled.
    const [returnView, setReturnView] = useState<View>('home')

    function openRoom(room: Room) {
        setSelectedRoom(room)
        setView('room-details')
    }

    function openLogin() {
        setReturnView(view)
        setView('login')
    }


    if (view === 'login') {
        return (
            <LoginPage
                onSuccess={() => setView(returnView)}
                onNavigateToRegister={() => setView('register')}
                onBack={() => setView(returnView)}
            />
        )
    }

    if (view === 'register') {
        return (
            <RegisterPage
                onSuccess={() => setView(returnView)}
                onNavigateToLogin={() => setView('login')}
                onBack={() => setView(returnView)}
            />
        )
    }

    if (view === 'room-details' && selectedRoom) {
        return (
            <RoomDetailsPage
                room={selectedRoom}
                onBack={() => setView('home')}
                onRequireLogin={openLogin}
            />
        )
    }

    return <HomePage onSelectRoom={openRoom} onRequireLogin={openLogin} />
}

function App() {
    return (
        <AuthProvider>
            <AppShell />
        </AuthProvider>
    )
}

export default App