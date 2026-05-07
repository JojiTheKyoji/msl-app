import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ImportPage from './pages/ImportPage';
import LibraryPage from './pages/LibraryPage';
import GameDetailPage from './pages/GameDetailPage';
import JournalPage from './pages/JournalPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ImportPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/game/:gameId" element={<GameDetailPage />} />
        <Route path="/journal" element={<JournalPage />} />
      </Routes>
    </>
  );
}
