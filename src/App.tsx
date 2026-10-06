import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { HomePage } from './ui/HomePage'
import { RoomPage } from './ui/RoomPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
