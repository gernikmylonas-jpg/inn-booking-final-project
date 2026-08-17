import { useState } from 'react'
import HomePage from './pages/HomePage'
import RoomDetailsPage from './pages/RoomDetailsPage'
import type { Room } from './types'

function App() {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    if (selectedRoom) {
        return (
            <RoomDetailsPage
                room={selectedRoom}
                onBack={() => setSelectedRoom(null)}
            />
        )
    }

    return <HomePage onSelectRoom={setSelectedRoom} />
}

export default App