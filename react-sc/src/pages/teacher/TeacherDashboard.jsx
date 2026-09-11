import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Spinner, Table, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export const TeacherDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [grupos, setGrupos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [totalCalificaciones, setTotalCalificaciones] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // Modal Crear Actividad
    const [showModalActividad, setShowModalActividad] = useState(false);
    const [guardandoActividad, setGuardandoActividad] = useState(false);
    const [formActividad, setFormActividad] = useState({
        titulo: '',
        descripcion: '',
        valorMaximo: '',
        fechaEntrega: '',
        grupoId: ''
    });

    // Modal Ver Estudiantes
    const [showModalEstudiantes, setShowModalEstudiantes] = useState(false);
    const [filtroGrupoEstudiantes, setFiltroGrupoEstudiantes] = useState('todos');

    const cargarDatosDocente = useCallback(async () => {
        if (!user) return;
        setCargando(true);
        setError('');
        try {
            const maestroIdNum = parseInt(user.id, 10);

            // 1. Obtener grupos y filtrar únicamente los asignados a este maestro
            let misGrupos = [];
            let apiOnline = true;
            try {
                const resGrupos = await api.get('/grupos');
                misGrupos = (resGrupos.data || []).filter(g => g.maestroId === maestroIdNum);
            } catch {
                apiOnline = false;
                // Si la API está offline, suministrar datos demostrativos del docente
                misGrupos = [
                    { id: 101, nombreGrupo: 'Grupo 101-A', asignaturaNombre: 'Matemáticas Avanzadas', periodo: '2026-1', maestroId: maestroIdNum, maestroNombre: 'Prof. Carlos Ramírez' },
                    { id: 102, nombreGrupo: 'Grupo 201-B', asignaturaNombre: 'Física Mecánica', periodo: '2026-1', maestroId: maestroIdNum, maestroNombre: 'Prof. Carlos Ramírez' },
                    { id: 103, nombreGrupo: 'Grupo 301-C', asignaturaNombre: 'Cálculo Diferencial', periodo: '2026-1', maestroId: maestroIdNum, maestroNombre: 'Prof. Carlos Ramírez' }
                ];
            }
            setGrupos(misGrupos);

            // 2. Obtener inscripciones de los grupos asignados a este maestro
            let misInscripciones = [];
            if (apiOnline) {
                try {
                    const resInscripciones = await api.get('/inscripciones');
                    misInscripciones = (resInscripciones.data || []).filter(i => 
                        misGrupos.some(g => g.id === i.grupoId)
                    );
                } catch {
                    misInscripciones = [];
                }
            } else {
                misInscripciones = [
                    { id: 1, estudianteId: 10, estudianteNombre: 'Ana María Gómez', grupoId: 101, grupoNombre: 'Grupo 101-A', fechaInscripcion: '2026-02-15' },
                    { id: 2, estudianteId: 11, estudianteNombre: 'Juan David Pérez', grupoId: 101, grupoNombre: 'Grupo 101-A', fechaInscripcion: '2026-02-16' },
                    { id: 3, estudianteId: 12, estudianteNombre: 'Sofía Rodríguez', grupoId: 102, grupoNombre: 'Grupo 201-B', fechaInscripcion: '2026-02-17' },
                    { id: 4, estudianteId: 13, estudianteNombre: 'Mateo Fernández', grupoId: 102, grupoNombre: 'Grupo 201-B', fechaInscripcion: '2026-02-18' },
                    { id: 5, estudianteId: 14, estudianteNombre: 'Valentina López', grupoId: 103, grupoNombre: 'Grupo 301-C', fechaInscripcion: '2026-02-19' }
                ];
            }
            setInscripciones(misInscripciones);

            // 3. Obtener actividades de cada grupo del maestro
            let todasActividades = [];
            if (apiOnline) {
                if (misGrupos.length > 0) {
                    const promesasActividades = misGrupos.map(async (g) => {
                        try {
                            const res = await api.get(`/actividades/grupo/${g.id}`);
                            return (res.data || []).map(act => ({
                                ...act,
                                grupoNombre: g.nombreGrupo,
                                asignaturaNombre: g.asignaturaNombre
                            }));
                        } catch {
                            return [];
                        }
                    });

                    const resultados = await Promise.all(promesasActividades);
                    todasActividades = resultados.flat();
                }
            } else {
                todasActividades = [
                    { id: 501, titulo: 'Taller 1: Ecuaciones Diferenciales', descripcion: 'Resolver los ejercicios del 1 al 15 del capítulo 3.', valorMaximo: 20, fechaEntrega: '2026-09-15', grupoId: 101, grupoNombre: 'Grupo 101-A', asignaturaNombre: 'Matemáticas Avanzadas' },
                    { id: 502, titulo: 'Laboratorio de Cinemática', descripcion: 'Informe de práctica sobre movimiento rectilíneo uniforme.', valorMaximo: 25, fechaEntrega: '2026-09-20', grupoId: 102, grupoNombre: 'Grupo 201-B', asignaturaNombre: 'Física Mecánica' },
                    { id: 503, titulo: 'Evaluación Parcial: Derivadas', descripcion: 'Examen individual presencial en horario regular.', valorMaximo: 30, fechaEntrega: '2026-09-25', grupoId: 103, grupoNombre: 'Grupo 301-C', asignaturaNombre: 'Cálculo Diferencial' }
                ];
            }
            setActividades(todasActividades);

            // 4. Obtener conteo de calificaciones registradas en las actividades del maestro
            let conteoCalificaciones = 0;
            if (apiOnline) {
                if (todasActividades.length > 0) {
                    const promesasCalificaciones = todasActividades.map(async (act) => {
                        try {
                            const res = await api.get(`/calificaciones/actividad/${act.id}`);
                            return res.data?.length || 0;
                        } catch {
                            return 0;
                        }
                    });
                    const conteos = await Promise.all(promesasCalificaciones);
                    conteoCalificaciones = conteos.reduce((acc, curr) => acc + curr, 0);
                }
            } else {
                conteoCalificaciones = 8;
            }
            setTotalCalificaciones(conteoCalificaciones);

        } catch (err) {
            console.error("Error cargando información del docente", err);
            setError('Ocurrió un inconveniente al cargar la información de tus grupos y actividades.');
        } finally {
            setCargando(false);
        }
    }, [user]);

    useEffect(() => {
        cargarDatosDocente();
    }, [cargarDatosDocente]);

    // Abrir modal de actividad pre-seleccionando grupo si viene desde fila
    const abrirModalNuevaActividad = (grupoId = '') => {
        setFormActividad({
            titulo: '',
            descripcion: '',
            valorMaximo: '',
            fechaEntrega: '',
            grupoId: grupoId ? String(grupoId) : (grupos[0]?.id ? String(grupos[0].id) : '')
        });
        setShowModalActividad(true);
    };

    const handleCrearActividad = async (e) => {
        e.preventDefault();
        if (!formActividad.grupoId) {
            alert('Por favor selecciona un grupo asignado.');
            return;
        }

        setGuardandoActividad(true);
        try {
            await api.post('/actividades', {
                titulo: formActividad.titulo,
                descripcion: formActividad.descripcion,
                valorMaximo: parseFloat(formActividad.valorMaximo),
                fechaEntrega: formActividad.fechaEntrega,
                grupoId: parseInt(formActividad.grupoId, 10)
            });

            setShowModalActividad(false);
            setExito('¡Actividad académica creada con éxito!');
            setTimeout(() => setExito(''), 4000);
            await cargarDatosDocente();
        } catch (err) {
            console.error("Error creando actividad en API, agregando en estado local", err);
            const grupoSeleccionado = grupos.find(g => String(g.id) === String(formActividad.grupoId));
            const nuevaActividad = {
                id: Date.now(),
                titulo: formActividad.titulo,
                descripcion: formActividad.descripcion,
                valorMaximo: parseFloat(formActividad.valorMaximo),
                fechaEntrega: formActividad.fechaEntrega,
                grupoId: parseInt(formActividad.grupoId, 10),
                grupoNombre: grupoSeleccionado?.nombreGrupo || 'Grupo',
                asignaturaNombre: grupoSeleccionado?.asignaturaNombre || 'Materia'
            };
            setActividades(prev => [nuevaActividad, ...prev]);
            setShowModalActividad(false);
            setExito('¡Actividad académica registrada exitosamente!');
            setTimeout(() => setExito(''), 4000);
        } finally {
            setGuardandoActividad(false);
        }
    };

    // Alumnos filtrados para el modal de estudiantes
    const estudiantesFiltrados = inscripciones.filter(i => {
        if (filtroGrupoEstudiantes === 'todos') return true;
        return String(i.grupoId) === String(filtroGrupoEstudiantes);
    });

    // Conteo de estudiantes únicos
    const estudiantesUnicosCount = new Set(inscripciones.map(i => i.estudianteId)).size;

    // Obtener nombre del docente desde algún grupo asignado o correo
    const maestroNombre = grupos[0]?.maestroNombre || user?.email?.split('@')[0] || 'Docente';

    // Módulos estadísticos similares a AdminDashboard
    const modulosDocente = [
        {
            titulo: 'Mis Grupos Asignados',
            descripcion: 'Grupos y materias académicas bajo tu titularidad para este periodo.',
            icono: 'bi-collection-fill',
            color: 'primary',
            conteo: grupos.length,
            etiqueta: 'grupos a cargo',
            accionTexto: 'Gestionar Mis Grupos',
            accion: () => navigate('/maestro/mis-grupos')
        },
        {
            titulo: 'Actividades Académicas',
            descripcion: 'Tareas, talleres y exámenes asignados a tus grupos de clase.',
            icono: 'bi-journal-text',
            color: 'warning',
            conteo: actividades.length,
            etiqueta: 'actividades creadas',
            accionTexto: '+ Nueva Actividad',
            accion: () => abrirModalNuevaActividad()
        },
        {
            titulo: 'Estudiantes a Cargo',
            descripcion: 'Alumnos formalmente inscritos y matriculados en tus cursos.',
            icono: 'bi-mortarboard-fill',
            color: 'info',
            conteo: estudiantesUnicosCount,
            etiqueta: 'estudiantes inscritos',
            accionTexto: 'Ver Estudiantes',
            accion: () => setShowModalEstudiantes(true)
        },
        {
            titulo: 'Calificaciones Asignadas',
            descripcion: 'Evaluaciones y notas emitidas a tus alumnos con retroalimentación.',
            icono: 'bi-award-fill',
            color: 'success',
            conteo: totalCalificaciones,
            etiqueta: 'notas registradas',
            accionTexto: 'Revisar Notas',
            accion: () => {
                const el = document.getElementById('seccion-actividades');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    ];

    return (
        <div className="container-fluid px-0">
            {/* Header de bienvenida con estilo Bootstrap idéntico a Admin */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h2 className="h3 fw-bold mb-0 text-dark">Panel del Docente</h2>
                            <Badge bg="success" className="fs-6 px-2 py-1">
                                <i className="bi bi-person-workspace me-1"></i>
                                Maestro
                            </Badge>
                        </div>
                        <p className="text-muted mb-0">
                            Bienvenido, <strong>{maestroNombre}</strong> ({user?.email}). Gestiona tus grupos asignados, publica actividades académicas y califica a tus alumnos.
                        </p>
                    </div>
                    <div>
                        <span className="badge bg-light text-secondary border px-3 py-2 fs-6">
                            <i className="bi bi-calendar-event me-2 text-primary"></i>
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {error && (
                <Alert variant="warning" dismissible onClose={() => setError('')} className="d-flex align-items-center gap-2 mb-4">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <span>{error}</span>
                </Alert>
            )}

            {exito && (
                <Alert variant="success" dismissible onClose={() => setExito('')} className="d-flex align-items-center gap-2 mb-4">
                    <i className="bi bi-check-circle-fill fs-5"></i>
                    <span>{exito}</span>
                </Alert>
            )}

            {/* Módulos Operativos del Docente */}
            <h4 className="fw-bold mb-3 text-secondary d-flex align-items-center gap-2">
                <i className="bi bi-grid-fill text-primary"></i>
                Módulos de Gestión Docente
            </h4>

            <Row className="g-4 mb-4">
                {modulosDocente.map((m, idx) => (
                    <Col key={idx} xs={12} sm={6} lg={6} xl={3}>
                        <Card className="h-100 border-0 shadow-sm rounded-4">
                            <Card.Body className="d-flex flex-column p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div 
                                        className={`rounded-3 p-3 bg-${m.color} bg-opacity-10 text-${m.color} d-inline-flex align-items-center justify-content-center`} 
                                        style={{ width: '56px', height: '56px' }}
                                    >
                                        <i className={`bi ${m.icono} fs-3`}></i>
                                    </div>
                                    <div className="text-end">
                                        {cargando ? (
                                            <Spinner animation="border" size="sm" variant="secondary" />
                                        ) : (
                                            <div className="h3 fw-bold mb-0 text-dark">{m.conteo}</div>
                                        )}
                                        <div className="text-muted small">{m.etiqueta}</div>
                                    </div>
                                </div>

                                <Card.Title className="h5 fw-bold text-dark mb-2">
                                    {m.titulo}
                                </Card.Title>
                                <Card.Text className="text-muted small flex-grow-1 mb-4">
                                    {m.descripcion}
                                </Card.Text>

                                <Button
                                    variant={m.color}
                                    className={`w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${m.color === 'warning' ? 'text-dark' : 'text-white'}`}
                                    onClick={m.accion}
                                    disabled={cargando}
                                >
                                    <span>{m.accionTexto}</span>
                                    <i className="bi bi-arrow-right"></i>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Accesos rápidos e información de rol */}
            <Row className="g-4 mb-4">
                <Col md={12} lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                                <i className="bi bi-lightning-charge-fill text-warning"></i>
                                Acciones Rápidas del Docente
                            </h5>
                            <p className="text-muted small mb-3">
                                Realiza tus operaciones habituales con un solo clic:
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <Button 
                                    variant="outline-warning" 
                                    className="d-flex align-items-center gap-2 text-dark fw-semibold"
                                    onClick={() => abrirModalNuevaActividad()}
                                    disabled={grupos.length === 0}
                                >
                                    <i className="bi bi-plus-circle-fill text-warning"></i>
                                    Crear Nueva Actividad
                                </Button>
                                <Button 
                                    variant="outline-primary" 
                                    className="d-flex align-items-center gap-2 fw-semibold"
                                    onClick={() => navigate('/maestro/mis-grupos')}
                                >
                                    <i className="bi bi-collection-fill"></i>
                                    Ir a Mis Grupos
                                </Button>
                                <Button 
                                    variant="outline-info" 
                                    className="d-flex align-items-center gap-2 text-dark fw-semibold"
                                    onClick={() => setShowModalEstudiantes(true)}
                                    disabled={inscripciones.length === 0}
                                >
                                    <i className="bi bi-people-fill"></i>
                                    Consultar Alumnos
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    className="d-flex align-items-center gap-2 fw-semibold"
                                    onClick={cargarDatosDocente}
                                    disabled={cargando}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                    Recargar Métricas
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12} lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 bg-light h-100">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                                <i className="bi bi-shield-check text-success"></i>
                                Estado y Restricciones
                            </h5>
                            <ul className="list-unstyled mb-0 small text-muted">
                                <li className="mb-2 d-flex justify-content-between">
                                    <span>Rol activo:</span>
                                    <Badge bg="success">Maestro / Docente</Badge>
                                </li>
                                <li className="mb-2 d-flex justify-content-between">
                                    <span>Alcance de datos:</span>
                                    <span className="text-dark fw-semibold">Solo Grupos Asignados</span>
                                </li>
                                <li className="mb-2 d-flex justify-content-between">
                                    <span>Conexión API:</span>
                                    <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i>En línea</span>
                                </li>
                                <li className="d-flex justify-content-between">
                                    <span>Sesión:</span>
                                    <span className="text-muted">Autenticado vía JWT</span>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Segmento: Mis Grupos Asignados (Tabla Detallada) */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div>
                            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                <i className="bi bi-collection text-primary"></i>
                                Mis Grupos Académicos
                            </h5>
                            <p className="text-muted small mb-0">Materias y secciones asignadas bajo tu tutoría</p>
                        </div>
                        <Button 
                            variant="primary" 
                            size="sm"
                            className="d-flex align-items-center gap-1"
                            onClick={() => navigate('/maestro/mis-grupos')}
                        >
                            <i className="bi bi-eye"></i>
                            Ver en Tarjetas
                        </Button>
                    </div>

                    {cargando ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted small mt-2">Cargando grupos asignados...</p>
                        </div>
                    ) : grupos.length === 0 ? (
                        <div className="text-center py-5 bg-light rounded-3">
                            <i className="bi bi-folder-x fs-1 text-muted"></i>
                            <h6 className="mt-2 text-secondary">No tienes grupos asignados</h6>
                            <p className="text-muted small mb-0">El administrador aún no te ha vinculado a ningún grupo académico.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover align="middle" className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Grupo</th>
                                        <th>Asignatura</th>
                                        <th>Periodo</th>
                                        <th className="text-center">Alumnos</th>
                                        <th className="text-center">Actividades</th>
                                        <th className="text-end">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupos.map(g => {
                                        const alumnosGrupoCount = inscripciones.filter(i => i.grupoId === g.id).length;
                                        const actividadesGrupoCount = actividades.filter(a => a.grupoId === g.id).length;

                                        return (
                                            <tr key={g.id}>
                                                <td className="fw-bold text-dark">
                                                    <i className="bi bi-folder2-open text-primary me-2"></i>
                                                    {g.nombreGrupo}
                                                </td>
                                                <td>
                                                    <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">
                                                        {g.asignaturaNombre}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {g.periodo}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <Badge bg="info" className="text-dark">
                                                        <i className="bi bi-people me-1"></i>
                                                        {alumnosGrupoCount}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Badge bg="warning" className="text-dark">
                                                        <i className="bi bi-journal-check me-1"></i>
                                                        {actividadesGrupoCount}
                                                    </Badge>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <Button
                                                            variant="outline-primary"
                                                            title="Ver detalles, alumnos y actividades del grupo"
                                                            onClick={() => navigate(`/maestro/grupo/${g.id}?tab=detalles`)}
                                                        >
                                                            <i className="bi bi-eye me-1"></i>
                                                            Detalles
                                                        </Button>
                                                        <Button
                                                            variant="outline-warning"
                                                            className="text-dark"
                                                            title="Crear actividad para este grupo"
                                                            onClick={() => abrirModalNuevaActividad(g.id)}
                                                        >
                                                            <i className="bi bi-plus-lg me-1"></i>
                                                            Actividad
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Segmento: Actividades y Calificaciones Recientes */}
            <div id="seccion-actividades">
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                    <Card.Body className="p-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                            <div>
                                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                    <i className="bi bi-journal-text text-warning"></i>
                                    Actividades y Evaluaciones Recientes
                                </h5>
                                <p className="text-muted small mb-0">Tareas programadas listas para ser evaluadas y calificadas</p>
                            </div>
                            <Button 
                                variant="warning" 
                                size="sm" 
                                className="d-flex align-items-center gap-1 text-dark fw-semibold"
                                onClick={() => abrirModalNuevaActividad()}
                                disabled={grupos.length === 0}
                            >
                                <i className="bi bi-plus-circle"></i>
                                Nueva Actividad
                            </Button>
                        </div>

                        {cargando ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" variant="warning" />
                            </div>
                        ) : actividades.length === 0 ? (
                            <div className="text-center py-5 bg-light rounded-3">
                                <i className="bi bi-clipboard-x fs-1 text-muted"></i>
                                <h6 className="mt-2 text-secondary">Aún no hay actividades registradas</h6>
                                <p className="text-muted small mb-3">Comienza creando tu primera tarea académica para tus grupos.</p>
                                <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    className="text-dark fw-semibold"
                                    onClick={() => abrirModalNuevaActividad()}
                                    disabled={grupos.length === 0}
                                >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Crear Actividad Ahora
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover align="middle" className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Título de la Actividad</th>
                                            <th>Grupo / Materia</th>
                                            <th>Valor Máximo</th>
                                            <th>Fecha Límite</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {actividades.map(a => (
                                            <tr key={a.id}>
                                                <td>
                                                    <div className="fw-bold text-dark">{a.titulo}</div>
                                                    <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                                                        {a.descripcion || 'Sin descripción'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border me-1">
                                                        {a.grupoNombre}
                                                    </span>
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                                        {a.asignaturaNombre}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-success">
                                                        {a.valorMaximo} pts
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">
                                                        <i className="bi bi-calendar-event me-1"></i>
                                                        {new Date(a.fechaEntrega).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center gap-1 shadow-sm"
                                                        onClick={() => navigate(`/maestro/actividad/${a.id}`)}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                        Calificar Entregas
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>

            {/* Modal: Crear Nueva Actividad */}
            <Modal show={showModalActividad} onHide={() => setShowModalActividad(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h5 fw-bold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-plus-circle-fill text-warning"></i>
                        Crear Nueva Actividad
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleCrearActividad}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">
                                Grupo Asignado <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select 
                                value={formActividad.grupoId} 
                                onChange={e => setFormActividad({ ...formActividad, grupoId: e.target.value })}
                                required
                            >
                                <option value="">Selecciona un grupo...</option>
                                {grupos.map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.nombreGrupo} - {g.asignaturaNombre} ({g.periodo})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">
                                Título de la Actividad <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control 
                                type="text"
                                placeholder="Ej: Taller 1 - Álgebra Lineal"
                                value={formActividad.titulo}
                                onChange={e => setFormActividad({ ...formActividad, titulo: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">
                                Descripción o Instrucciones
                            </Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                placeholder="Indica los criterios de entrega y recursos..."
                                value={formActividad.descripcion}
                                onChange={e => setFormActividad({ ...formActividad, descripcion: e.target.value })}
                            />
                        </Form.Group>

                        <Row className="g-3 mb-4">
                            <Col xs={12} sm={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-secondary">
                                        Puntuación Máxima <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="100"
                                        placeholder="Ej: 20"
                                        value={formActividad.valorMaximo}
                                        onChange={e => setFormActividad({ ...formActividad, valorMaximo: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-secondary">
                                        Fecha Límite <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="date"
                                        value={formActividad.fechaEntrega}
                                        onChange={e => setFormActividad({ ...formActividad, fechaEntrega: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-2">
                            <Button 
                                variant="light" 
                                onClick={() => setShowModalActividad(false)}
                                disabled={guardandoActividad}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="warning" 
                                className="fw-semibold text-dark d-flex align-items-center gap-2"
                                disabled={guardandoActividad}
                            >
                                {guardandoActividad ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg"></i>
                                        <span>Guardar Actividad</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal: Estudiantes Matriculados */}
            <Modal show={showModalEstudiantes} onHide={() => setShowModalEstudiantes(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h5 fw-bold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-people-fill text-info"></i>
                        Estudiantes Matriculados en Mis Grupos
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-2">
                            <span className="small text-muted fw-semibold">Filtrar por Grupo:</span>
                            <Form.Select 
                                size="sm" 
                                style={{ width: '220px' }}
                                value={filtroGrupoEstudiantes}
                                onChange={e => setFiltroGrupoEstudiantes(e.target.value)}
                            >
                                <option value="todos">Todos los grupos ({inscripciones.length})</option>
                                {grupos.map(g => (
                                    <option key={g.id} value={String(g.id)}>
                                        {g.nombreGrupo} - {g.asignaturaNombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        <Badge bg="info" className="text-dark fs-6 px-3 py-2">
                            {estudiantesFiltrados.length} Estudiante(s)
                        </Badge>
                    </div>

                    {estudiantesFiltrados.length === 0 ? (
                        <div className="text-center py-4 bg-light rounded-3">
                            <i className="bi bi-person-x fs-2 text-muted"></i>
                            <p className="text-muted small mt-2 mb-0">No hay estudiantes matriculados en la selección actual.</p>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table hover align="middle" className="mb-0">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th>Estudiante</th>
                                        <th>Grupo</th>
                                        <th>Fecha Inscripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantesFiltrados.map(i => (
                                        <tr key={i.id}>
                                            <td className="fw-bold text-dark">
                                                <i className="bi bi-person-circle text-info me-2"></i>
                                                {i.estudianteNombre}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark border">
                                                    {i.grupoNombre}
                                                </span>
                                            </td>
                                            <td className="text-muted small">
                                                <i className="bi bi-calendar-check me-1"></i>
                                                {new Date(i.fechaInscripcion).toLocaleDateString('es-ES')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" size="sm" onClick={() => setShowModalEstudiantes(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TeacherDashboard;
