import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { GameSetupPage, GamePage, PinPage } from './features/game';
import { QuizSetupPage } from './features/quiz';
import { GameLobbyPage } from './features/lobby';
import { LoginPage } from './features/auth';
import { MyPage } from './features/user';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game/setup" element={<GameSetupPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/game/lobby" element={<GameLobbyPage />} />
        <Route path="/quiz/setup" element={<QuizSetupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pin" element={<PinPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="*" element={<div>not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
