import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { casesService, lawyersService, creditorsService } from '../services/api';
import '../styles/Dashboard.css';
import '../styles/Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    totalCases: 0,
    activeCases: 0,
    inactiveCases: 0,
    suspendedCases: 0,
    totalLawyers: 0,
    totalCreditors: 0,
    casesByStatus: [],
    casesByLawyer: [],
    casesByCreditor: []
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [casesData, lawyersData, creditorsData] = await Promise.all([
        casesService.getAll(),
        lawyersService.getAll(),
        creditorsService.getAll()
      ]);

      // Calcular estadísticas
      const totalCases = casesData.length;
      const activeCases = casesData.filter(c => c.status === 'activo').length;
      const inactiveCases = casesData.filter(c => c.status === 'inactivo').length;
      const suspendedCases = casesData.filter(c => c.status === 'suspendido').length;

      // Casos por abogado
      const casesByLawyer = lawyersData.map(lawyer => {
        const count = casesData.filter(c => 
          c.internal_lawyer_id === lawyer.id || c.external_lawyer_id === lawyer.id
        ).length;
        return {
          name: `${lawyer.first_name} ${lawyer.last_name}`,
          count
        };
      }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

      // Casos por acreedor
      const casesByCreditor = creditorsData.map(creditor => {
        const count = casesData.filter(c => c.creditor_id === creditor.id).length;
        return {
          name: creditor.name,
          count
        };
      }).filter(item => item.count > 0).sort((a, b) => b.count - a.count);

      setReportData({
        totalCases,
        activeCases,
        inactiveCases,
        suspendedCases,
        totalLawyers: lawyersData.length,
        totalCreditors: creditorsData.length,
        casesByStatus: [
          { status: 'Activos', count: activeCases, color: '#4CAF50' },
          { status: 'Inactivos', count: inactiveCases, color: '#f44336' },
          { status: 'Suspendidos', count: suspendedCases, color: '#ff9800' }
        ],
        casesByLawyer,
        casesByCreditor
      });
    } catch (err) {
      console.error('Error al cargar datos de reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Implementar exportación a CSV
    alert('Exportar a CSV - Funcionalidad en desarrollo');
  };

  const exportToPDF = () => {
    // Implementar exportación a PDF
    alert('Exportar a PDF - Funcionalidad en desarrollo');
  };

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header 
          title="Reportes y Estadísticas" 
          userName={user?.first_name}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="reports-container">
          {/* Filtros y Acciones */}
          <div className="reports-header">
            <div className="report-filters">
              <div className="filter-group">
                <label>Tipo de Reporte</label>
                <select 
                  value={selectedReport} 
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="report-select"
                >
                  <option value="overview">Resumen General</option>
                  <option value="cases">Casos</option>
                  <option value="lawyers">Abogados</option>
                  <option value="creditors">Acreedores</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Fecha Inicio</label>
                <input 
                  type="date" 
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="date-input"
                />
              </div>

              <div className="filter-group">
                <label>Fecha Fin</label>
                <input 
                  type="date" 
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="date-input"
                />
              </div>
            </div>

            <div className="report-actions">
              <button className="btn-export" onClick={exportToCSV}>
                📝 Exportar EXCEL
              </button>
              <button className="btn-export" onClick={exportToCSV}>
                📊 Exportar CSV
              </button>
              <button className="btn-export" onClick={exportToPDF}>
                📄 Exportar PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Cargando datos...</p>
            </div>
          ) : (
            <>
              {/* Resumen General */}
              {selectedReport === 'overview' && (
                <div className="report-content">
                  {/* Tarjetas de Resumen */}
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-icon">⚖️</div>
                      <div className="stat-info">
                        <div className="stat-label">Total Casos</div>
                        <div className="stat-value">{reportData.totalCases}</div>
                      </div>
                    </div>

                    <div className="stat-card success">
                      <div className="stat-icon">✅</div>
                      <div className="stat-info">
                        <div className="stat-label">Casos Activos</div>
                        <div className="stat-value">{reportData.activeCases}</div>
                        <div className="stat-percentage">
                          {calculatePercentage(reportData.activeCases, reportData.totalCases)}%
                        </div>
                      </div>
                    </div>

                    <div className="stat-card warning">
                      <div className="stat-icon">⏸️</div>
                      <div className="stat-info">
                        <div className="stat-label">Suspendidos</div>
                        <div className="stat-value">{reportData.suspendedCases}</div>
                        <div className="stat-percentage">
                          {calculatePercentage(reportData.suspendedCases, reportData.totalCases)}%
                        </div>
                      </div>
                    </div>

                    <div className="stat-card danger">
                      <div className="stat-icon">❌</div>
                      <div className="stat-info">
                        <div className="stat-label">Inactivos</div>
                        <div className="stat-value">{reportData.inactiveCases}</div>
                        <div className="stat-percentage">
                          {calculatePercentage(reportData.inactiveCases, reportData.totalCases)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráficos y Tablas */}
                  <div className="report-grid">
                    {/* Casos por Estado */}
                    <div className="report-card">
                      <h3 className="report-card-title">Casos por Estado</h3>
                      <div className="chart-container">
                        {reportData.casesByStatus.map((item, index) => (
                          <div key={index} className="bar-chart-item">
                            <div className="bar-label">{item.status}</div>
                            <div className="bar-wrapper">
                              <div 
                                className="bar-fill" 
                                style={{
                                  width: `${calculatePercentage(item.count, reportData.totalCases)}%`,
                                  backgroundColor: item.color
                                }}
                              >
                                <span className="bar-value">{item.count}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Abogados */}
                    <div className="report-card">
                      <h3 className="report-card-title">Top 5 Abogados por Casos</h3>
                      <div className="table-container">
                        <table className="report-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Abogado</th>
                              <th>Casos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.casesByLawyer.slice(0, 5).map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td className="highlight">{item.count}</td>
                              </tr>
                            ))}
                            {reportData.casesByLawyer.length === 0 && (
                              <tr>
                                <td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>
                                  No hay datos disponibles
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Acreedores */}
                    <div className="report-card">
                      <h3 className="report-card-title">Top 5 Acreedores por Casos</h3>
                      <div className="table-container">
                        <table className="report-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Acreedor</th>
                              <th>Casos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.casesByCreditor.slice(0, 5).map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td className="highlight">{item.count}</td>
                              </tr>
                            ))}
                            {reportData.casesByCreditor.length === 0 && (
                              <tr>
                                <td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>
                                  No hay datos disponibles
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Estadísticas Adicionales */}
                    <div className="report-card">
                      <h3 className="report-card-title">Recursos del Sistema</h3>
                      <div className="stats-list">
                        <div className="stats-item">
                          <span className="stats-label">👔 Total Abogados</span>
                          <span className="stats-value">{reportData.totalLawyers}</span>
                        </div>
                        <div className="stats-item">
                          <span className="stats-label">💼 Total Acreedores</span>
                          <span className="stats-value">{reportData.totalCreditors}</span>
                        </div>
                        <div className="stats-item">
                          <span className="stats-label">📊 Promedio Casos/Abogado</span>
                          <span className="stats-value">
                            {reportData.totalLawyers > 0 
                              ? (reportData.totalCases / reportData.totalLawyers).toFixed(1)
                              : 0
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Otros tipos de reportes */}
              {selectedReport !== 'overview' && (
                <div className="report-content">
                  <div className="empty-state">
                    <p>📊</p>
                    <h3>Reporte en Desarrollo</h3>
                    <p style={{ color: '#999' }}>
                      El reporte de {selectedReport} estará disponible próximamente
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
