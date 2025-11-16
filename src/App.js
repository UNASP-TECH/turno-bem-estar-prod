import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './layout';
import Home from './home';
import WHOQOL from './whoqol';
import Q8RN from './q8rn';
import Resultado from './resultado';

const ProtectedResult = ({ children }) => {
  const location = useLocation();
  return location.state?.pontuacao ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="whoqol" element={<WHOQOL />} />
          <Route path="q8rn" element={<Q8RN />} />
          <Route 
            path="resultado" 
            element={
              <ProtectedResult>
                <Resultado />
              </ProtectedResult>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;