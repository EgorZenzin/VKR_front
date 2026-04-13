import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SolvePage from './pages/SolvePage';
import ComparePage from './pages/ComparePage';
import MLOverviewPage from './pages/MLOverviewPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/solve/:taskName" element={<SolvePage />} />
        <Route path="/compare/:taskName" element={<ComparePage />} />
        <Route path="/ml-overview" element={<MLOverviewPage />} />
      </Route>
    </Routes>
  );
}
