import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';
import Portfolio from "./pages/Portfolio";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/portfolio" element={<Portfolio/>} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
