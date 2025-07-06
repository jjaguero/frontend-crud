import React, { useState, useEffect } from 'react';
import { getEmpleados, deleteEmpleado, createEmpleado, updateEmpleado } from './api/empleados';


const generarColorAvatar = (nombre) => {
  const colores = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ];
  const indice = nombre.charCodeAt(0) % colores.length;
  return colores[indice];
};

function App() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoActual, setEmpleadoActual] = useState({
    nombre: '',
    posicion: '',
    salario: '',
    sexo: 'M',
    fechaIngreso: new Date().toISOString().split('T')[0]
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [empleadosPorPagina] = useState(8);

  const [filtros, setFiltros] = useState({
    nombre: '',
    sexo: '',
    ordenSalario: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const data = await getEmpleados();
      setEmpleados(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching empleados:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar empleado?")) {
      await deleteEmpleado(id);
      fetchEmpleados();
    }
  };

  const abrirModalNuevo = () => {
    setEmpleadoActual({
      nombre: '',
      posicion: '',
      salario: '',
      sexo: 'M',
      fechaIngreso: new Date().toISOString().split('T')[0]
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (empleado) => {
    setEmpleadoActual({
      ...empleado,
      fechaIngreso: empleado.fechaIngreso.split('T')[0]
    });
    setModalAbierto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (empleadoActual._id) {
        await updateEmpleado(empleadoActual._id, empleadoActual);
      } else {
        await createEmpleado(empleadoActual);
      }
      setModalAbierto(false);
      fetchEmpleados();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const filtrarYOrdenarEmpleados = () => {
    let resultados = [...empleados];
    
    if (filtrosAplicados) {
      resultados = resultados.filter(empleado => {
        const cumpleNombre = filtros.nombre === '' || 
          empleado.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
        const cumpleSexo = filtros.sexo === '' || empleado.sexo === filtros.sexo;
        
        // Validación de rango de fechas
        let cumpleFecha = true;
        if (filtros.fechaDesde || filtros.fechaHasta) {
          const fechaIngreso = new Date(empleado.fechaIngreso);
          const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
          const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;
          
          if (desde && fechaIngreso < desde) cumpleFecha = false;
          if (hasta && fechaIngreso > hasta) cumpleFecha = false;
        }
        
        return cumpleNombre && cumpleSexo && cumpleFecha;
      });
    }

    if (filtros.ordenSalario === 'asc') {
      resultados.sort((a, b) => a.salario - b.salario);
    } else if (filtros.ordenSalario === 'desc') {
      resultados.sort((a, b) => b.salario - a.salario);
    }

    return resultados;
  };

  const empleadosFiltrados = filtrarYOrdenarEmpleados();
  const indiceUltimoEmpleado = paginaActual * empleadosPorPagina;
  const indicePrimerEmpleado = indiceUltimoEmpleado - empleadosPorPagina;
  const empleadosActuales = empleadosFiltrados.slice(indicePrimerEmpleado, indiceUltimoEmpleado);
  const totalPaginas = Math.ceil(empleadosFiltrados.length / empleadosPorPagina);

  const limpiarFiltros = () => {
    setFiltros({
      nombre: '',
      sexo: '',
      ordenSalario: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setFiltrosAplicados(false);
    setPaginaActual(1);
  };

  if (loading) return (
    <div className="w-full bg-white flex items-center justify-center min-h-screen p-4">
      <div className="text-gray-800">Cargando...</div>
    </div>
  );

  return (
    <div className="w-full bg-white flex items-center justify-center min-h-screen p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Gestión de Empleados</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Administra los empleados de tu empresa</p>
              </div>
              <div>
                <button 
                  onClick={abrirModalNuevo}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                >
                  Agregar Empleado
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-500 mb-1">Buscar por nombre</label>
                <input
                  type="text"
                  value={filtros.nombre}
                  onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                  placeholder="Nombre del empleado"
                />
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-xs font-medium text-gray-500 mb-1">Género</label>
                <select
                  value={filtros.sexo}
                  onChange={(e) => setFiltros({...filtros, sexo: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-medium text-gray-500 mb-1">Ordenar salario</label>
                <select
                  value={filtros.ordenSalario}
                  onChange={(e) => setFiltros({...filtros, ordenSalario: e.target.value})}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                >
                  <option value="">Sin orden</option>
                  <option value="asc">Menor a mayor</option>
                  <option value="desc">Mayor a menor</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setFiltrosAplicados(true);
                  setPaginaActual(1);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded-md text-sm"
                >
                Aplicar Filtros
              </button>

              {filtrosAplicados && (
                <button
                  onClick={limpiarFiltros}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded-md text-sm"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Posición</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Salario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Género</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Fecha Ingreso</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {empleadosActuales.length > 0 ? (
                      empleadosActuales.map((empleado) => (
                        <tr key={empleado._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-10 w-10 hidden sm:flex items-center justify-center rounded-full text-white font-medium ${generarColorAvatar(empleado.nombre)} hover:scale-110 transition-transform duration-200`}>
                                {empleado.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-0 sm:ml-4">
                                <div className="text-sm font-medium text-gray-900">{empleado.nombre}</div>
                                <div className="text-xs sm:hidden text-gray-500 mt-1">
                                  {empleado.posicion} • ${empleado.salario.toLocaleString('es-CL')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">{empleado.posicion}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">${empleado.salario.toLocaleString('es-CL')}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${empleado.sexo === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                              {empleado.sexo === 'M' ? 'Masculino' : 'Femenino'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">
                              {new Date(empleado.fechaIngreso).toLocaleDateString('es-CL')}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => abrirModalEditar(empleado)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Editar
                              </button>
                              <button 
                                onClick={() => handleDelete(empleado._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                          No se encontraron empleados {filtrosAplicados ? 'con los filtros aplicados' : ''}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {empleadosFiltrados.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indicePrimerEmpleado + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(indiceUltimoEmpleado, empleadosFiltrados.length)}
                  </span>{' '}
                  de <span className="font-medium">{empleadosFiltrados.length}</span> resultados
                  {filtrosAplicados && ' (filtrados)'}
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(3, totalPaginas) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaActual(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${paginaActual === i + 1 ? 'bg-indigo-50 text-indigo-600 border-indigo-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  {totalPaginas > 3 && (
                    <>
                      {paginaActual < totalPaginas - 2 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                      {paginaActual < totalPaginas && (
                        <button
                          onClick={() => setPaginaActual(totalPaginas)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${paginaActual === totalPaginas ? 'bg-indigo-50 text-indigo-600 border-indigo-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {totalPaginas}
                        </button>
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {empleadoActual._id ? 'Editar Empleado' : 'Agregar Empleado'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={empleadoActual.nombre}
                      onChange={(e) => setEmpleadoActual({...empleadoActual, nombre: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Posición</label>
                      <input
                        type="text"
                        value={empleadoActual.posicion}
                        onChange={(e) => setEmpleadoActual({...empleadoActual, posicion: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salario</label>
                      <input
                        type="number"
                        value={empleadoActual.salario}
                        onChange={(e) => setEmpleadoActual({...empleadoActual, salario: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Género</label>
                      <select
                        value={empleadoActual.sexo}
                        onChange={(e) => setEmpleadoActual({...empleadoActual, sexo: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
                      <input
                        type="date"
                        value={empleadoActual.fechaIngreso}
                        onChange={(e) => setEmpleadoActual({...empleadoActual, fechaIngreso: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;