import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import clienteAPI from '../../api/clienteAxios'
import { Card, Table, Badge, Form, InputGroup, Row, Col, Alert, Button, Spinner } from 'react-bootstrap'
import EditarAsignatura from './EditarAsignatura'
import EliminarAsignatura from './EliminarAsignatura'

const estadoInicial = { nombre: '', codigo: '', creditos: '' }

function validar(datos) {
  const errores = {}
  if (!datos.nombre.trim()) errores.nombre = 'El nombre es obligatorio.'
  if (!datos.codigo.trim()) errores.codigo = 'El código es obligatorio.'
  if (datos.nombre.trim().length > 100) errores.nombre = 'El nombre no puede superar 100 caracteres.'
  if (datos.codigo.trim().length > 20) errores.codigo = 'El código no puede superar 20 caracteres.'
  if (!datos.creditos || Number(datos.creditos) < 1) errores.creditos = 'Indica al menos un crédito.'
  return errores
}

function CrearAsignatura({ onVolver }) {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(estadoInicial)

  const [errores, setErrores] = useState({})
  const [estado, setEstado] = useState({ tipo: '', mensaje: '' })
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [asignaturas, setAsignaturas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [asignaturaParaEditar, setAsignaturaParaEditar] = useState(null)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [asignaturaParaEliminar, setAsignaturaParaEliminar] = useState(null)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)

  const actualizarCampo = ({ target: { name, value } }) => {
    setDatos((actuales) => ({ ...actuales, [name]: value }))
    setErrores((actuales) => ({ ...actuales, [name]: undefined }))
    setEstado({ tipo: '', mensaje: '' })
  }

  const guardarAsignatura = async (evento) => {
    evento.preventDefault()
    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return
    setGuardando(true)
    setEstado({ tipo: '', mensaje: '' })
    try {
      await clienteAPI.post('/Asignaturas', {
        nombre: datos.nombre.trim(),
        codigo: datos.codigo.trim().toUpperCase(),
        creditos: Number(datos.creditos)
      })
      setDatos(estadoInicial)
      setEstado({ tipo: 'success', mensaje: '¡La asignatura fue creada y registrada exitosamente!' })
      setTimeout(() => {
        setEstado({ tipo: '', mensaje: '' });
      }, 3500);
      cargarAsignaturas();
    } catch (error) {
      const mensajeAPI = error.response?.data?.title || error.response?.data?.message
      setEstado({ tipo: 'danger', mensaje: mensajeAPI || 'No se pudo crear la asignatura. Comprueba que la API esté en ejecución.' })
      setTimeout(() => {
        setEstado({ tipo: '', mensaje: '' });
      }, 4000);
    } finally {
      setGuardando(false)
    }
  }

  const cargarAsignaturas = () => {
    setCargando(true)
    clienteAPI.get('/asignaturas')
      .then(res => setAsignaturas(res.data || []))
      .catch(() => {
        // Fallback demostrativo si la API está offline
        setAsignaturas([
          { id: 1, nombre: 'Matemáticas Avanzadas', codigo: 'MAT-301', creditos: 4 },
          { id: 2, nombre: 'Física Mecánica', codigo: 'FIS-201', creditos: 3 },
          { id: 3, nombre: 'Algoritmos y Estructuras de Datos', codigo: 'INF-204', creditos: 4 },
          { id: 4, nombre: 'Cálculo Diferencial', codigo: 'MAT-101', creditos: 4 },
          { id: 5, nombre: 'Introducción a la Programación', codigo: 'INF-101', creditos: 3 }
        ])
      })
      .finally(() => setCargando(false))
  }

  const abrirEditar = (asignatura) => {
    setAsignaturaParaEditar(asignatura)
    setMostrarModalEditar(true)
  }

  const cerrarEditar = () => {
    setMostrarModalEditar(false)
    setAsignaturaParaEditar(null)
  }

  const handleAsignaturaActualizada = () => {
    cargarAsignaturas()
    setEstado({ tipo: 'success', mensaje: '¡La asignatura fue actualizada correctamente!' })
    setTimeout(() => {
      setEstado({ tipo: '', mensaje: '' })
    }, 3500)
  }

  const abrirEliminar = (asignatura) => {
    setAsignaturaParaEliminar(asignatura)
    setMostrarModalEliminar(true)
  }

  const cerrarEliminar = () => {
    setMostrarModalEliminar(false)
    setAsignaturaParaEliminar(null)
  }

  const handleAsignaturaEliminada = () => {
    cargarAsignaturas()
    setEstado({ tipo: 'success', mensaje: '¡La asignatura fue eliminada correctamente del sistema!' })
    setTimeout(() => {
      setEstado({ tipo: '', mensaje: '' })
    }, 3500)
  }

  useEffect(() => {
    cargarAsignaturas();
  }, [])

  const asignaturasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return asignaturas;
    const term = busqueda.toLowerCase();
    return asignaturas.filter(a =>
      a.nombre?.toLowerCase().includes(term) ||
      a.codigo?.toLowerCase().includes(term)
    );
  }, [asignaturas, busqueda]);

  return (
    <div className="container-fluid px-0">
      {/* Header institucional de la sección */}
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
              <i className="bi bi-journal-bookmark-fill fs-3"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h2 className="h4 fw-bold mb-0 text-dark">Gestión de Asignaturas</h2>
                <Badge bg="primary" className="px-2 py-1">
                  Módulo Académico
                </Badge>
              </div>
              <p className="text-muted small mb-0">
                Registra nuevas materias curriculares, asigna códigos y créditos académicos en el plan de estudios.
              </p>
            </div>
          </div>

        </div>
      </div>

      {estado.mensaje && (
        <Alert
          variant={estado.tipo}
          dismissible
          onClose={() => setEstado({ tipo: '', mensaje: '' })}
          className="d-flex align-items-center gap-2 mb-4 shadow-xs"
        >
          <i className={`bi ${estado.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
          <div>{estado.mensaje}</div>
        </Alert>
      )}

      {/* Grid: Formulario de Creación (Izquierda) y Tabla de Registros (Derecha) */}
      <Row className="g-4">
        {/* Columna Formulario */}
        <Col xs={12} lg={5} xl={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <i className="bi bi-plus-circle-fill text-primary fs-5"></i>
                <h5 className="fw-bold mb-0 text-dark">Nueva Asignatura</h5>
              </div>
              <p className="text-muted small mb-4">
                Ingresa los datos solicitados para incorporar la materia al catálogo institucional.
              </p>

              <Form onSubmit={guardarAsignatura} noValidate>
                {/* Campo Nombre */}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="nombre" className="fw-semibold small text-secondary">
                    Nombre de la Asignatura <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-journal-text text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      id="nombre"
                      name="nombre"
                      type="text"
                      className="border-start-0 ps-1"
                      placeholder="Ej. Matemáticas Avanzadas"
                      value={datos.nombre}
                      onChange={actualizarCampo}
                      isInvalid={!!errores.nombre}
                      maxLength={100}
                      autoFocus
                      disabled={guardando}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errores.nombre}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Campo Código */}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="codigo" className="fw-semibold small text-secondary">
                    Código Académico <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-upc-scan text-success"></i>
                    </InputGroup.Text>
                    <Form.Control
                      id="codigo"
                      name="codigo"
                      type="text"
                      className="border-start-0 ps-1 font-monospace"
                      placeholder="Ej. MAT-301"
                      value={datos.codigo}
                      onChange={actualizarCampo}
                      isInvalid={!!errores.codigo}
                      maxLength={20}
                      disabled={guardando}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errores.codigo}
                    </Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted small">
                    Identificador único de la asignatura (máx. 20 caracteres).
                  </Form.Text>
                </Form.Group>

                {/* Campo Créditos */}
                <Form.Group className="mb-4">
                  <Form.Label htmlFor="creditos" className="fw-semibold small text-secondary">
                    Créditos Académicos <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-award-fill text-warning"></i>
                    </InputGroup.Text>
                    <Form.Control
                      id="creditos"
                      name="creditos"
                      type="number"
                      className="border-start-0 ps-1"
                      placeholder="Ej. 4"
                      min="1"
                      step="1"
                      value={datos.creditos}
                      onChange={actualizarCampo}
                      isInvalid={!!errores.creditos}
                      disabled={guardando}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errores.creditos}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Acciones */}
                <div className="d-grid gap-2 pt-2">
                  <Button
                    variant="primary"
                    type="submit"
                    className="py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                    disabled={guardando}
                  >
                    {guardando ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <span>Guardando asignatura...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle-fill"></i>
                        <span>Guardar Asignatura</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    type="button"
                    className="py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
                    onClick={() => onVolver ? onVolver() : navigate('/admin')}
                    disabled={guardando}
                  >
                    <i className="bi bi-house-door"></i>
                    <span>Volver al Inicio</span>
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Tabla de Asignaturas Registradas */}
        <Col xs={12} lg={7} xl={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-list-check text-success fs-5"></i>
                  <h5 className="fw-bold mb-0 text-dark">Asignaturas Registradas</h5>
                  <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                    {asignaturas.length} Activas
                  </Badge>
                </div>
                {/* Buscador en tiempo real */}
                <div style={{ maxWidth: '260px' }} className="w-100">
                  <InputGroup size="sm">
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      className="border-start-0 ps-1"
                      placeholder="Buscar por nombre o código..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                      <Button variant="outline-secondary" onClick={() => setBusqueda('')}>
                        <i className="bi bi-x"></i>
                      </Button>
                    )}
                  </InputGroup>
                </div>
              </div>

              {cargando ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <div className="text-muted small mt-2">Cargando asignaturas...</div>
                </div>
              ) : asignaturasFiltradas.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 my-3">
                  <i className="bi bi-journal-x fs-1 text-muted"></i>
                  <h6 className="mt-2 text-secondary">
                    {busqueda ? 'No se encontraron coincidencias para la búsqueda' : 'No hay asignaturas registradas'}
                  </h6>
                  <p className="text-muted small mb-0">
                    {busqueda ? 'Intenta buscar con otros términos.' : 'Utiliza el formulario de la izquierda para agregar la primera.'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover align="middle" className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Asignatura</th>
                        <th>Código</th>
                        <th className="text-center">Créditos</th>
                        <th className="text-end pe-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaturasFiltradas.map(asignatura => (
                        <tr key={asignatura.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                <i className="bi bi-journal-bookmark fs-6"></i>
                              </span>
                              <div>
                                <span className="fw-bold text-dark">{asignatura.nombre}</span>
                                <div className="text-muted small">ID: #{asignatura.id}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg="light" className="text-dark border font-monospace px-2 py-1 fs-6">
                              <i className="bi bi-upc-scan text-muted me-1"></i>
                              {asignatura.codigo}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg="info" className="text-dark px-2 py-1">
                              <i className="bi bi-award-fill me-1 text-warning"></i>
                              {asignatura.creditos} Créditos
                            </Badge>
                          </td>
                          <td className="text-end pe-3">
                            <div className="btn-group btn-group-sm shadow-xs">
                              <Button
                                variant="outline-primary"
                                onClick={() => abrirEditar(asignatura)}
                                title="Editar esta asignatura"
                                className="d-inline-flex align-items-center gap-1"
                              >
                                <i className="bi bi-pencil-square"></i>
                                <span>Editar</span>
                              </Button>
                              <Button
                                variant="outline-danger"
                                onClick={() => abrirEliminar(asignatura)}
                                title="Eliminar esta asignatura"
                                className="d-inline-flex align-items-center gap-1"
                              >
                                <i className="bi bi-trash3-fill"></i>
                                <span>Borrar</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modales de edición y eliminación */}
      <EditarAsignatura
        show={mostrarModalEditar}
        asignatura={asignaturaParaEditar}
        onCerrar={cerrarEditar}
        onAsignaturaActualizada={handleAsignaturaActualizada}
      />

      <EliminarAsignatura
        show={mostrarModalEliminar}
        asignatura={asignaturaParaEliminar}
        onCerrar={cerrarEliminar}
        onAsignaturaEliminada={handleAsignaturaEliminada}
      />
    </div>
  )
}

export default CrearAsignatura
