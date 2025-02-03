import {BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css';
import Portfolio from "./pages/Portfolio";
import Home from "./pages/Home";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/portfolio" element={<Portfolio/>} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
