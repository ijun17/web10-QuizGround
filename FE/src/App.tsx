import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { GameSetupPage } from './pages/GameSetupPage';
import { GamePage } from './pages/GamePage';
import { QuizSetupPage } from './pages/QuizSetupPage';
import { GameLobbyPage } from './pages/GameLobbyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game/setup" element={<GameSetupPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/game/lobby" element={<GameLobbyPage />} />
        <Route path="/quiz/setup" element={<QuizSetupPage />} />
        <Route path="*" element={<div>not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
