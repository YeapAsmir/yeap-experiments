import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import TagVisualizer from "./pages/experiments/tags/TagVisualizer";
import PayrollEditor from "./pages/experiments/editor/Editor";
import "./App.css";
import "@fontsource/geist-mono";
import "@fontsource/inter";
import { cn } from "./utils";

const navItems = [
  { to: "/experiment/tags", label: "Tags" },
  { to: "/experiment/editor", label: "Editor" },
];

const SvgIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={cn(props.className)} fill="none" viewBox="0 0 49 47">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m23.55 11.168-3.341-5.75C17.219.272 10.596-1.49 5.416 1.48s-6.954 9.55-3.963 14.695l3.342 5.75c2.177 3.747 6.281 5.7 10.351 5.337l-1.583 2.724c-3.152 5.425-1.282 12.36 4.179 15.493 5.46 3.131 12.443 1.273 15.595-4.151L47.47 17.013c3.152-5.424 1.281-12.36-4.18-15.492C37.83-1.61 30.848.248 27.695 5.672l-3.693 6.356q-.204-.436-.45-.86m16.96-4.863c-2.801-1.606-6.383-.653-8 2.13L18.38 32.747c-1.617 2.783-.658 6.34 2.143 7.947 2.801 1.606 6.383.653 8-2.13l14.13-24.313c1.618-2.783.658-6.34-2.143-7.947M8.196 6.264a5.214 5.214 0 0 0-1.929 7.149l3.342 5.75c1.455 2.503 4.677 3.36 7.197 1.915a5.214 5.214 0 0 0 1.928-7.148l-3.342-5.75c-1.455-2.504-4.677-3.361-7.196-1.916"
      clipRule="evenodd"
    ></path>
  </svg>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-2xl mx-auto flex items-center w-full py-4 gap-4">
        <SvgIcon className="size-5 text-gray-10" />
        <nav className="flex ml-auto gap-1 text-sm">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn("px-2.5 py-1 rounded-full transition-colors", isActive ? "bg-gray-15 text-white shadow-sm" : "text-gray-12 hover:bg-gray-7")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/experiment/tags" replace />} />
          <Route path="/experiment/tags" element={<TagVisualizer />} />
          <Route path="/experiment/editor" element={<PayrollEditor />} />
          <Route path="*" element={<div>Choisis une page ci-dessus.</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
