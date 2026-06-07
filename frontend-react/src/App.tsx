import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        {/* Aquí agregaremos /login pronto */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;