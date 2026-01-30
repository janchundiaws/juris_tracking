import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cases from './pages/Cases';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Ruta raíz redirige al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          {/* Placeholder para otras rutas protegidas */}
          <Route
            path="/cases"
            element={
              <PrivateRoute>
                <Cases />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Gestión de Clientes</h1>
                  <p>Módulo en desarrollo</p>
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Calendario</h1>
                  <p>Módulo en desarrollo</p>
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/documents"
            element={
              <PrivateRoute>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Documentos</h1>
                  <p>Módulo en desarrollo</p>
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Tareas</h1>
                  <p>Módulo en desarrollo</p>
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Reportes</h1>
                  <p>Módulo en desarrollo</p>
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <h1>Configuración</h1>
                  <p>Módulo en desarrollo</p>
                </div>
              </PrivateRoute>
            }
          />
          
          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
