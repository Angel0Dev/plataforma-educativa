import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Registro from './components/Registro';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Tareas from './components/Tareas';
import Calificaciones from './components/Calificaciones';
import Biblioteca from './components/Biblioteca';
import SobreNosotros from './components/SobreNosotros';
import Cursos from './components/Cursos';
import Contacto from './components/Contacto';
import Mensajeria from './components/Mensajeria';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Componente para condicionar el Navbar
const AppContent = () => {
    const location = useLocation();
    const showNavbar = !location.pathname.startsWith('/dashboard');
    
    return (
        <div className="App">
            {showNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tareas" element={<Tareas />} />
                <Route path="/calificaciones" element={<Calificaciones />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                <Route path="/cursos" element={<Cursos />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/mensajeria" element={<MensajeriaWrapper />} />
            </Routes>
        </div>
    );
};

// Wrapper para Mensajeria que requiere autenticación
const MensajeriaWrapper = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <h2>Acceso Denegado</h2>
        <p>Debes iniciar sesión para acceder a la mensajería.</p>
      </div>
    );
  }

  return <Mensajeria user={user} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Componente de inicio temporal
const Home = () => (
  <div className="home-container">
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Plataforma Educativa</h1>
        <p className="hero-subtitle">
          Gestiona tu experiencia educativa de manera integral. 
          Conecta estudiantes, docentes y familias en un solo lugar.
        </p>
        <div className="hero-buttons">
          <a href="/login" className="btn btn-primary">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </div>
    
    {/* Sección de características */}
    <div className="features-section">
      <div className="container">
        <h2 className="section-title">¿Por qué elegir nuestra plataforma?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👨‍🎓</div>
            <h3>Para Estudiantes</h3>
            <p>Accede a tus tareas, calificaciones y recursos educativos desde cualquier lugar.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👩‍🏫</div>
            <h3>Para Docentes</h3>
            <p>Gestiona tus cursos, asigna tareas y mantén comunicación con estudiantes y padres.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍👩‍👧‍👦</div>
            <h3>Para Familias</h3>
            <p>Mantente informado sobre el progreso académico de tus hijos en tiempo real.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default App;
