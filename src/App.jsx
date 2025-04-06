import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Videosection from './components/VideoSection/VideoSection';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Videosection />} />
      </Routes>
    </Router>
  );
}

export default App;