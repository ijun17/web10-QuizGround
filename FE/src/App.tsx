import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { GameSetupPage } from './pages/GameSetupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/game/setup" element={<GameSetupPage />} />
        <Route path="*" element={<div>not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
