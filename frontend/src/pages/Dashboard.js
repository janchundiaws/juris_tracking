import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import CasesList from '../components/CasesList';
import { casesService } from '../services/api';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const casesData = await casesService.getAll();
      
      // Calcular estadísticas
      const totalCases = casesData.length;
      const activeCases = casesData.filter(c => c.status === 'activo').length;
      const inactiveCases = casesData.filter(c => c.status === 'inactivo').length;
      const suspendedCases = casesData.filter(c => c.status === 'suspendido').length;
      
      setStats({
        totalCases,
        activeCases,
        pendingTasks: inactiveCases,
        upcomingHearings: suspendedCases
      });

      // Mostrar los 5 casos más recientes
      const sortedCases = [...casesData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          caseNumber: c.case_number || 'N/A',
          clientName: c.full_name || 'N/A',
          caseType: c.process_type || 'N/A',
          status: c.status === 'activo' ? 'Activo' : c.status === 'inactivo' ? 'Inactivo' : 'Suspendido',
          priority: 'Media',
          nextHearing: c.demand_date || 'N/A'
        }));
      
      setRecentCases(sortedCases);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Header title="Dashboard" userName={user?.first_name} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>Bienvenido, {user?.first_name} {user?.last_name}</h2>
            <p className="role-badge">{user?.role_id}</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Cargando estadísticas...</p>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <StatsCard
                  title="Total de Casos"
                  value={stats.totalCases}
                  icon="📁"
                  color="blue"
                  trend={`${stats.totalCases} registrados`}
                />
                <StatsCard
                  title="Casos Activos"
                  value={stats.activeCases}
                  icon="⚖️"
                  color="green"
                  trend={`${((stats.activeCases / stats.totalCases) * 100 || 0).toFixed(1)}% del total`}
                />
                <StatsCard
                  title="Casos Inactivos"
                  value={stats.pendingTasks}
                  icon="📋"
                  color="orange"
                  trend={`${((stats.pendingTasks / stats.totalCases) * 100 || 0).toFixed(1)}% del total`}
                />
                <StatsCard
                  title="Casos Suspendidos"
                  value={stats.upcomingHearings}
                  icon="📅"
                  color="purple"
                  trend={`${((stats.upcomingHearings / stats.totalCases) * 100 || 0).toFixed(1)}% del total`}
                />
              </div>

              <div className="recent-section">
                <div className="section-header">
                  <h3>Casos Recientes</h3>
                </div>
                <CasesList cases={recentCases} />
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
