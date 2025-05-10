import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import TagVisualizer from './pages/experiments/tags/TagVisualizer';
import PayrollEditor from './pages/experiments/editor/Editor';
import CustomEditor from './pages/experiments/customEditor/Editor';

import './App.css';
export default function App() {
  return (
    <BrowserRouter>
          <nav className='flex gap-4 p-4'>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/experiment/tags">Tags</NavLink>
        <NavLink to="/experiment/editor">Editor</NavLink>
        <NavLink to="/experiment/CustomEditor">CustomEditor</NavLink>
      </nav>
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="experiment/tags" element={<TagVisualizer />} />
          <Route path="experiment/editor" element={<PayrollEditor />} />
          <Route path="experiment/CustomEditor" element={<CustomEditor />} />
          <Route path="*" element={<div>Choisis une page ci-dessus.</div>} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}
