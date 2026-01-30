import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import CasesList from '../components/CasesList';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    pendingTasks: 0,
    upcomingHearings: 0
  });
  const [recentCases, setRecentCases] = useState([]);

  useEffect(() => {
    // Aquí harías la petición al backend para obtener las estadísticas
    // Por ahora usamos datos de ejemplo
    setStats({
      totalCases: 45,
      activeCases: 28,
      pendingTasks: 12,
      upcomingHearings: 5
    });

    setRecentCases([
      {
        id: 1,
        caseNumber: 'CASO-2026-001',
        clientName: 'María González',
        caseType: 'Laboral',
        status: 'En Proceso',
        priority: 'Alta',
        nextHearing: '2026-02-15'
      },
      {
        id: 2,
        caseNumber: 'CASO-2026-002',
        clientName: 'Pedro Martínez',
        caseType: 'Civil',
        status: 'Pendiente',
        priority: 'Media',
        nextHearing: '2026-02-20'
      },
      {
        id: 3,
        caseNumber: 'CASO-2026-003',
        clientName: 'Ana López',
        caseType: 'Familia',
        status: 'En Proceso',
        priority: 'Baja',
        nextHearing: '2026-02-25'
      }
    ]);
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <Header title="Dashboard" userName={user?.first_name} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>Bienvenido, {user?.first_name} {user?.last_name}</h2>
            <p className="role-badge">{user?.role_id}</p>
          </div>

          <div className="stats-grid">
            <StatsCard
              title="Total de Casos"
              value={stats.totalCases}
              icon="📁"
              color="blue"
              trend="+3 este mes"
            />
            <StatsCard
              title="Casos Activos"
              value={stats.activeCases}
              icon="⚖️"
              color="green"
              trend="+5 desde la semana pasada"
            />
            <StatsCard
              title="Tareas Pendientes"
              value={stats.pendingTasks}
              icon="📋"
              color="orange"
              trend="2 vencen hoy"
            />
            <StatsCard
              title="Audiencias Próximas"
              value={stats.upcomingHearings}
              icon="📅"
              color="purple"
              trend="Esta semana"
            />
          </div>

          <div className="recent-section">
            <div className="section-header">
              <h3>Casos Recientes</h3>
              <button className="btn-secondary">Ver Todos</button>
            </div>
            <CasesList cases={recentCases} />
          </div>

          <div className="quick-actions">
            <h3>Acciones Rápidas</h3>
            <div className="actions-grid">
              <button className="action-card">
                <span className="action-icon">➕</span>
                <span className="action-text">Nuevo Caso</span>
              </button>
              <button className="action-card">
                <span className="action-icon">👤</span>
                <span className="action-text">Nuevo Cliente</span>
              </button>
              <button className="action-card">
                <span className="action-icon">📄</span>
                <span className="action-text">Generar Documento</span>
              </button>
              <button className="action-card">
                <span className="action-icon">📊</span>
                <span className="action-text">Ver Reportes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
