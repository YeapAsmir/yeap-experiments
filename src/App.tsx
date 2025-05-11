// Misc
import PayrollEditor from './pages/experiments/editor/Editor';
import TagVisualizer from './pages/experiments/tags/TagVisualizer';
import {
    Route,
    Routes,
    NavLink,
    BrowserRouter
}                    from 'react-router-dom';
import './App.css';
import '@fontsource/inter'
import "@fontsource/fira-code";

export default function App() {
  const activeClass = "text-neutral-800";
  const inactiveClass = "text-neutral-400 hover:text-neutral-800 transition";

  return (
    <BrowserRouter>
      <nav className="flex gap-4 p-4 border-b border-slate-200">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? activeClass : inactiveClass
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/experiment/tags"
          className={({ isActive }) =>
            isActive ? activeClass : inactiveClass
          }
        >
          Tags
        </NavLink>
        <NavLink
          to="/experiment/editor"
          className={({ isActive }) =>
            isActive ? activeClass : inactiveClass
          }
        >
          Editor
        </NavLink>
      </nav>

      <div className="p-4">
        <Routes>
          <Route path="experiment/tags" element={<TagVisualizer />} />
          <Route path="experiment/editor" element={<PayrollEditor />} />
          <Route path="*" element={<div>Choisis une page ci-dessus.</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
