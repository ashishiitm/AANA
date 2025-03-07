import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar>
        <ThemeToggle />
      </Navbar>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}