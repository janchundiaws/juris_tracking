import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { casesService, lawyersService, creditorsService } from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    try {
      // Preparar datos para CSV
      const csvData = [];
      
      // Encabezado
      csvData.push(['REPORTE DE ESTADÍSTICAS - SISTEMA JUDICIAL']);
      csvData.push(['Fecha de generación:', new Date().toLocaleDateString('es-ES')]);
      csvData.push([]);
      
      // Resumen General
      csvData.push(['RESUMEN GENERAL']);
      csvData.push(['Total de Casos', reportData.totalCases]);
      csvData.push(['Casos Activos', reportData.activeCases]);
      csvData.push(['Casos Inactivos', reportData.inactiveCases]);
      csvData.push(['Casos Suspendidos', reportData.suspendedCases]);
      csvData.push(['Total Abogados', reportData.totalLawyers]);
      csvData.push(['Total Acreedores', reportData.totalCreditors]);
      csvData.push([]);
      
      // Casos por Estado
      csvData.push(['CASOS POR ESTADO']);
      csvData.push(['Estado', 'Cantidad', 'Porcentaje']);
      reportData.casesByStatus.forEach(item => {
        csvData.push([
          item.status,
          item.count,
          `${calculatePercentage(item.count, reportData.totalCases)}%`
        ]);
      });
      csvData.push([]);
      
      // Casos por Abogado
      csvData.push(['CASOS POR ABOGADO']);
      csvData.push(['#', 'Abogado', 'Casos']);
      reportData.casesByLawyer.forEach((item, index) => {
        csvData.push([index + 1, item.name, item.count]);
      });
      csvData.push([]);
      
      // Casos por Acreedor
      csvData.push(['CASOS POR ACREEDOR']);
      csvData.push(['#', 'Acreedor', 'Casos']);
      reportData.casesByCreditor.forEach((item, index) => {
        csvData.push([index + 1, item.name, item.count]);
      });
      
      // Convertir a CSV
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Descargar archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar el archivo CSV');
    }
  };

  const exportToExcel = () => {
    try {
      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Resumen General
      const resumenData = [
        ['REPORTE DE ESTADÍSTICAS - SISTEMA JUDICIAL'],
        ['Fecha de generación:', new Date().toLocaleDateString('es-ES')],
        [],
        ['RESUMEN GENERAL'],
        ['Métrica', 'Valor'],
        ['Total de Casos', reportData.totalCases],
        ['Casos Activos', reportData.activeCases],
        ['Casos Inactivos', reportData.inactiveCases],
        ['Casos Suspendidos', reportData.suspendedCases],
        ['Total Abogados', reportData.totalLawyers],
        ['Total Acreedores', reportData.totalCreditors],
        [],
        ['CASOS POR ESTADO'],
        ['Estado', 'Cantidad', 'Porcentaje'],
        ...reportData.casesByStatus.map(item => [
          item.status,
          item.count,
          `${calculatePercentage(item.count, reportData.totalCases)}%`
        ])
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
      
      // Hoja 2: Casos por Abogado
      const abogadosData = [
        ['CASOS POR ABOGADO'],
        [],
        ['#', 'Abogado', 'Casos']
      ];
      
      reportData.casesByLawyer.forEach((item, index) => {
        abogadosData.push([index + 1, item.name, item.count]);
      });
      
      const ws2 = XLSX.utils.aoa_to_sheet(abogadosData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Abogados');
      
      // Hoja 3: Casos por Acreedor
      const acreedoresData = [
        ['CASOS POR ACREEDOR'],
        [],
        ['#', 'Acreedor', 'Casos']
      ];
      
      reportData.casesByCreditor.forEach((item, index) => {
        acreedoresData.push([index + 1, item.name, item.count]);
      });
      
      const ws3 = XLSX.utils.aoa_to_sheet(acreedoresData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Acreedores');
      
      // Descargar archivo
      XLSX.writeFile(wb, `reporte_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert(`Error al exportar el archivo Excel: ${error.message}`);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Título
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('REPORTE DE ESTADÍSTICAS', pageWidth / 2, yPos, { align: 'center' });
      yPos += 7;
      
      doc.setFontSize(12);
      doc.text('Sistema Judicial', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Fecha
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, yPos);
      yPos += 15;
      
      // Resumen General
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Resumen General', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de Casos', reportData.totalCases.toString()],
          ['Casos Activos', reportData.activeCases.toString()],
          ['Casos Inactivos', reportData.inactiveCases.toString()],
          ['Casos Suspendidos', reportData.suspendedCases.toString()],
          ['Total Abogados', reportData.totalLawyers.toString()],
          ['Total Acreedores', reportData.totalCreditors.toString()]
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Casos por Estado
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Casos por Estado', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Estado', 'Cantidad', 'Porcentaje']],
        body: reportData.casesByStatus.map(item => [
          item.status,
          item.count.toString(),
          `${calculatePercentage(item.count, reportData.totalCases)}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 }
      });
      
      // Nueva página para abogados si es necesario
      doc.addPage();
      yPos = 20;
      
      // Top Abogados
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Casos por Abogado', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Abogado', 'Casos']],
        body: reportData.casesByLawyer.map((item, index) => [
          (index + 1).toString(),
          item.name,
          item.count.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 }
      });
      
      yPos = doc.lastAutoTable.finalY + 15;
      
      // Top Acreedores
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Casos por Acreedor', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Acreedor', 'Casos']],
        body: reportData.casesByCreditor.map((item, index) => [
          (index + 1).toString(),
          item.name,
          item.count.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 }
      });
      
      // Guardar PDF
      doc.save(`reporte_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar el archivo PDF');
    }
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
                � Exportar CSV
              </button>
              <button className="btn-export" onClick={exportToExcel}>
                📝 Exportar Excel
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
