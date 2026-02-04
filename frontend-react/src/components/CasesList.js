import React from 'react';

const CasesList = ({ cases }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'En Proceso':
        return 'status-active';
      case 'Pendiente':
        return 'status-pending';
      case 'Cerrado':
        return 'status-closed';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Alta':
        return 'priority-high';
      case 'Media':
        return 'priority-medium';
      case 'Baja':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div className="cases-list">
      <table className="cases-table">
        <thead>
          <tr>
            <th>Número de Caso</th>
            <th>Cliente</th>
            <th>Tipo de Caso</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Próxima Audiencia</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caso) => (
            <tr key={caso.id}>
              <td className="case-number">{caso.caseNumber}</td>
              <td>{caso.clientName}</td>
              <td>
                <span className="case-type-badge">{caso.caseType}</span>
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(caso.status)}`}>
                  {caso.status}
                </span>
              </td>
              <td>
                <span className={`priority-badge ${getPriorityClass(caso.priority)}`}>
                  {caso.priority}
                </span>
              </td>
              <td>{new Date(caso.nextHearing).toLocaleDateString('es-ES')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CasesList;
