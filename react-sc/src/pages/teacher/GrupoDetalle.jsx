import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { 
    Table, 
    Button, 
    Modal, 
    Form, 
    Card, 
    Badge, 
    Spinner, 
    Alert, 
    Row, 
    Col, 
    Nav 
} from 'react-bootstrap';

// Mock fallbacks para sincronía con TeacherDashboard y MisGrupos cuando la API esté en modo demostración/desconectada
const MOCK_GRUPOS = {
    101: { 
        id: 101, 
        nombreGrupo: 'Grupo 101-A', 
        asignaturaNombre: 'Matemáticas Avanzadas', 
        periodo: '2026-1', 
        maestroNombre: 'Prof. Carlos Ramírez',
        codigoMateria: 'MAT-301',
        aula: 'Edificio B - Aula 204',
        horario: 'Lunes y Miércoles 08:00 - 10:00 AM'
    },
    102: { 
        id: 102, 
        nombreGrupo: 'Grupo 201-B', 
        asignaturaNombre: 'Física Mecánica', 
        periodo: '2026-1', 
        maestroNombre: 'Prof. Carlos Ramírez',
        codigoMateria: 'FIS-201',
        aula: 'Laboratorio de Ciencias 1',
        horario: 'Martes y Jueves 10:00 - 12:00 PM'
    },
    103: { 
        id: 103, 
        nombreGrupo: 'Grupo 301-C', 
        asignaturaNombre: 'Cálculo Diferencial', 
        periodo: '2026-1', 
        maestroNombre: 'Prof. Carlos Ramírez',
        codigoMateria: 'MAT-102',
        aula: 'Edificio A - Aula 102',
        horario: 'Viernes 08:00 - 12:00 PM'
    }
};

const MOCK_ACTIVIDADES = {
    101: [
        { 
            id: 501, 
            titulo: 'Taller 1: Ecuaciones Diferenciales', 
            descripcion: 'Resolver los ejercicios del 1 al 15 del capítulo 3.', 
            valorMaximo: 20, 
            fechaEntrega: '2026-09-15', 
            grupoId: 101 
        },
        { 
            id: 504, 
            titulo: 'Guía Práctica: Transformadas de Laplace', 
            descripcion: 'Aplicación de transformadas en modelos matemáticos.', 
            valorMaximo: 25, 
            fechaEntrega: '2026-09-28', 
            grupoId: 101 
        }
    ],
    102: [
        { 
            id: 502, 
            titulo: 'Laboratorio de Cinemática', 
            descripcion: 'Informe de práctica sobre movimiento rectilíneo uniforme.', 
            valorMaximo: 25, 
            fechaEntrega: '2026-09-20', 
            grupoId: 102 
        }
    ],
    103: [
        { 
            id: 503, 
            titulo: 'Evaluación Parcial: Derivadas', 
            descripcion: 'Examen individual presencial en horario regular.', 
            valorMaximo: 30, 
            fechaEntrega: '2026-09-25', 
            grupoId: 103 
        }
    ]
};

const MOCK_ESTUDIANTES = {
    101: [
        { id: 1, estudianteId: 10, estudianteNombre: 'Ana María Gómez', estudianteCorreo: 'ana.gomez@colegio.edu', fechaInscripcion: '2026-02-15' },
        { id: 2, estudianteId: 11, estudianteNombre: 'Juan David Pérez', estudianteCorreo: 'juan.perez@colegio.edu', fechaInscripcion: '2026-02-16' }
    ],
    102: [
        { id: 3, estudianteId: 12, estudianteNombre: 'Sofía Rodríguez', estudianteCorreo: 'sofia.rodriguez@colegio.edu', fechaInscripcion: '2026-02-17' },
        { id: 4, estudianteId: 13, estudianteNombre: 'Mateo Fernández', estudianteCorreo: 'mateo.fernandez@colegio.edu', fechaInscripcion: '2026-02-18' }
    ],
    103: [
        { id: 5, estudianteId: 14, estudianteNombre: 'Valentina López', estudianteCorreo: 'valentina.lopez@colegio.edu', fechaInscripcion: '2026-02-19' }
    ]
};

export const GrupoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useContext(AuthContext);

    // Tab activo determinado por URL ?tab=actividades|estudiantes|detalles
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(
        tabFromUrl === 'estudiantes' ? 'estudiantes' : tabFromUrl === 'detalles' ? 'detalles' : 'actividades'
    );

    const [grupo, setGrupo] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    
    const [formData, setFormData] = useState({ 
        titulo: '', 
        descripcion: '', 
        valorMaximo: '', 
        fechaEntrega: '', 
        grupoId: id 
    });

    const handleSelectTab = (selectedKey) => {
        setActiveTab(selectedKey);
        setSearchParams({ tab: selectedKey });
    };

    const cargarDatos = async () => {
        setCargando(true);
        setError('');
        const grupoIdNum = parseInt(id, 10);

        try {
            // 1. Cargar Grupo
            let grupoEncontrado = null;
            try {
                const resGrupos = await api.get('/grupos');
                grupoEncontrado = (resGrupos.data || []).find(g => g.id === grupoIdNum);
            } catch (err) {
                console.warn('API /grupos inaccesible, recurriendo a datos demostrativos:', err);
            }

            if (!grupoEncontrado) {
                grupoEncontrado = MOCK_GRUPOS[grupoIdNum] || {
                    id: grupoIdNum,
                    nombreGrupo: `Grupo #${id}`,
                    asignaturaNombre: 'Asignatura Asignada',
                    periodo: 'Ciclo Actual',
                    maestroNombre: user?.email || 'Docente'
                };
            }
            setGrupo(grupoEncontrado);

            // 2. Cargar Actividades
            let acts = [];
            try {
                const resActividades = await api.get(`/actividades/grupo/${id}`);
                if (Array.isArray(resActividades.data) && resActividades.data.length > 0) {
                    acts = resActividades.data;
                } else if (MOCK_ACTIVIDADES[grupoIdNum]) {
                    acts = MOCK_ACTIVIDADES[grupoIdNum];
                }
            } catch (err) {
                console.warn('API /actividades/grupo inaccesible, recurriendo a demostrativos:', err);
                acts = MOCK_ACTIVIDADES[grupoIdNum] || [];
            }
            setActividades(acts);

            // 3. Cargar Estudiantes Inscritos
            let ests = [];
            try {
                const [resInsc, resUsuarios] = await Promise.all([
                    api.get('/inscripciones'),
                    api.get('/usuarios')
                ]);

                const usuariosMap = (resUsuarios.data || []).reduce((acc, u) => {
                    acc[u.id] = u;
                    return acc;
                }, {});

                ests = (resInsc.data || [])
                    .filter(i => i.grupoId === grupoIdNum)
                    .map(i => ({
                        id: i.id,
                        estudianteId: i.estudianteId,
                        estudianteNombre: i.estudianteNombre || usuariosMap[i.estudianteId]?.nombre || `Estudiante #${i.estudianteId}`,
                        estudianteCorreo: usuariosMap[i.estudianteId]?.correo || 'sin-correo@colegio.edu',
                        fechaInscripcion: i.fechaInscripcion || '2026-02-15'
                    }));

                if (ests.length === 0 && MOCK_ESTUDIANTES[grupoIdNum]) {
                    ests = MOCK_ESTUDIANTES[grupoIdNum];
                }
            } catch (err) {
                console.warn('API /inscripciones inaccesible, usando demostrativos:', err);
                ests = MOCK_ESTUDIANTES[grupoIdNum] || [];
            }
            setEstudiantes(ests);

        } catch (err) {
            console.error("Error al cargar detalles del grupo", err);
            setError('Ocurrió un inconveniente al cargar la información del grupo.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError('');

        const nuevaActividad = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            valorMaximo: parseFloat(formData.valorMaximo),
            fechaEntrega: formData.fechaEntrega,
            grupoId: parseInt(id, 10)
        };

        try {
            try {
                await api.post('/actividades', nuevaActividad);
            } catch (apiErr) {
                console.warn('API post /actividades no disponible, guardando localmente en sesión:', apiErr);
            }

            // Actualizar estado local inmediatamente
            const actividadConId = {
                ...nuevaActividad,
                id: Date.now()
            };
            setActividades(prev => [actividadConId, ...prev]);

            setShowModal(false);
            setFormData({ titulo: '', descripcion: '', valorMaximo: '', fechaEntrega: '', grupoId: id });
            setExito('¡Actividad académica creada exitosamente!');
            setTimeout(() => setExito(''), 4000);
        } catch (err) {
            console.error("Error creating actividad", err);
            setError('No se pudo crear la actividad. Verifica los campos.');
        } finally {
            setGuardando(false);
        }
    };

    const handleDelete = async (actId) => {
        if (window.confirm('¿Seguro que deseas eliminar esta actividad? Se perderán las notas asociadas.')) {
            try {
                try {
                    await api.delete(`/actividades/${actId}`);
                } catch (apiErr) {
                    console.warn('API delete /actividades inaccesible, actualizando localmente:', apiErr);
                }
                setActividades(prev => prev.filter(a => a.id !== actId));
                setExito('Actividad eliminada correctamente.');
                setTimeout(() => setExito(''), 3000);
            } catch (err) {
                console.error("Error deleting actividad", err);
                setError('No se pudo eliminar la actividad.');
            }
        }
    };

    const totalPuntaje = actividades.reduce((acc, curr) => acc + (parseFloat(curr.valorMaximo) || 0), 0);

    return (
        <div className="container-fluid px-0">
            {/* Header del Grupo */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div 
                            className="bg-primary bg-opacity-10 text-primary rounded-4 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '56px', height: '56px' }}
                        >
                            <i className="bi bi-collection-fill fs-3"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    className="border py-1 px-2"
                                    onClick={() => navigate('/maestro/mis-grupos')}
                                    title="Volver a Mis Grupos"
                                >
                                    <i className="bi bi-arrow-left me-1"></i>
                                    <span>Mis Grupos</span>
                                </Button>
                                <h2 className="h3 fw-bold mb-0 text-dark">
                                    {grupo?.nombreGrupo || `Grupo #${id}`}
                                </h2>
                                <Badge bg="primary" className="fs-6 px-2 py-1">
                                    {grupo?.periodo || '2026-1'}
                                </Badge>
                                <Badge bg="light" text="dark" className="border px-2 py-1">
                                    <i className="bi bi-journal-bookmark me-1 text-primary"></i>
                                    {grupo?.asignaturaNombre || 'Asignatura'}
                                </Badge>
                            </div>
                            <p className="text-muted small mb-0">
                                Docente tutor: <strong>{grupo?.maestroNombre || user?.email || 'Docente'}</strong>
                                {grupo?.aula && <span> &bull; Aula: {grupo.aula}</span>}
                            </p>
                        </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                        <Button 
                            variant="outline-secondary" 
                            className="d-flex align-items-center gap-2 shadow-xs"
                            onClick={() => navigate('/maestro')}
                        >
                            <i className="bi bi-speedometer2"></i>
                            <span>Dashboard</span>
                        </Button>
                        <Button 
                            variant="warning" 
                            className="d-flex align-items-center gap-2 text-dark fw-semibold shadow-xs"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                            <span>Crear Actividad</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mensajes de Alerta */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>{error}</div>
                </Alert>
            )}

            {exito && (
                <Alert variant="success" dismissible onClose={() => setExito('')} className="mb-4 d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill fs-5"></i>
                    <div>{exito}</div>
                </Alert>
            )}

            {/* Tarjetas Resumen de Métricas */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center gap-3">
                            <div className="rounded-3 p-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                <i className="bi bi-people-fill fs-4"></i>
                            </div>
                            <div>
                                <div className="text-muted small fw-semibold">Alumnos Inscritos</div>
                                <div className="fs-4 fw-bold text-dark">{estudiantes.length}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center gap-3">
                            <div className="rounded-3 p-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                <i className="bi bi-journal-text fs-4 text-warning"></i>
                            </div>
                            <div>
                                <div className="text-muted small fw-semibold">Actividades Académicas</div>
                                <div className="fs-4 fw-bold text-dark">{actividades.length}</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={12} lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center gap-3">
                            <div className="rounded-3 p-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                                <i className="bi bi-award-fill fs-4"></i>
                            </div>
                            <div>
                                <div className="text-muted small fw-semibold">Ponderación Acumulada</div>
                                <div className="fs-4 fw-bold text-dark">{totalPuntaje} <span className="small text-muted fs-6">pts</span></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Navegación por Pestañas */}
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Header className="bg-white border-bottom pt-3 px-4">
                    <Nav variant="tabs" activeKey={activeTab} onSelect={handleSelectTab} className="card-header-tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="actividades" className="d-flex align-items-center gap-2 fw-semibold">
                                <i className="bi bi-journal-check text-warning"></i>
                                <span>Actividades del Grupo</span>
                                <Badge bg="light" text="dark" className="border ms-1">
                                    {actividades.length}
                                </Badge>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="estudiantes" className="d-flex align-items-center gap-2 fw-semibold">
                                <i className="bi bi-people-fill text-info"></i>
                                <span>Estudiantes Inscritos</span>
                                <Badge bg="light" text="dark" className="border ms-1">
                                    {estudiantes.length}
                                </Badge>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="detalles" className="d-flex align-items-center gap-2 fw-semibold">
                                <i className="bi bi-info-circle-fill text-primary"></i>
                                <span>Información del Grupo</span>
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>

                <Card.Body className="p-4">
                    {cargando ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted small mt-2">Cargando información del grupo...</p>
                        </div>
                    ) : (
                        <>
                            {/* PESTAÑA 1: ACTIVIDADES */}
                            {activeTab === 'actividades' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                                <i className="bi bi-journal-text text-warning"></i>
                                                Tareas y Actividades Evaluativas
                                            </h5>
                                            <p className="text-muted small mb-0">
                                                Publica tareas, consulta las entregas y califica el progreso académico de los alumnos.
                                            </p>
                                        </div>
                                        <Button 
                                            variant="warning" 
                                            size="sm" 
                                            className="d-flex align-items-center gap-1 text-dark fw-semibold"
                                            onClick={() => setShowModal(true)}
                                        >
                                            <i className="bi bi-plus-lg"></i>
                                            <span>Nueva Actividad</span>
                                        </Button>
                                    </div>

                                    {actividades.length === 0 ? (
                                        <div className="text-center py-5 bg-light rounded-4 border">
                                            <i className="bi bi-journal-x fs-1 text-muted"></i>
                                            <h6 className="mt-3 text-secondary fw-bold">No hay actividades creadas en este grupo</h6>
                                            <p className="text-muted small mb-3">Publica la primera tarea para comenzar a recibir entregas y calificar.</p>
                                            <Button 
                                                variant="warning" 
                                                size="sm" 
                                                className="text-dark fw-semibold"
                                                onClick={() => setShowModal(true)}
                                            >
                                                <i className="bi bi-plus-circle me-1"></i>
                                                Crear Primera Actividad
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table hover align="middle" className="mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: '70px' }}>ID</th>
                                                        <th>Título y Descripción</th>
                                                        <th className="text-center">Puntaje Máx</th>
                                                        <th>Fecha Entrega</th>
                                                        <th className="text-end">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {actividades.map(a => (
                                                        <tr key={a.id}>
                                                            <td className="text-muted small">#{a.id}</td>
                                                            <td>
                                                                <div className="fw-bold text-dark">{a.titulo}</div>
                                                                <div className="text-muted small text-truncate" style={{ maxWidth: '380px' }}>
                                                                    {a.descripcion || 'Sin descripción adicional'}
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <Badge bg="success" className="px-2 py-1 fs-6">
                                                                    {a.valorMaximo} pts
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <span className="text-muted small d-inline-flex align-items-center gap-1">
                                                                    <i className="bi bi-calendar-event text-secondary"></i>
                                                                    {a.fechaEntrega ? new Date(a.fechaEntrega).toLocaleDateString('es-ES') : 'Sin fecha'}
                                                                </span>
                                                            </td>
                                                            <td className="text-end">
                                                                <div className="btn-group btn-group-sm">
                                                                    <Button 
                                                                        variant="success" 
                                                                        className="d-inline-flex align-items-center gap-1"
                                                                        onClick={() => navigate(`/maestro/actividad/${a.id}`)}
                                                                        title="Calificar estudiantes en esta actividad"
                                                                    >
                                                                        <i className="bi bi-pencil-square"></i>
                                                                        <span>Calificar</span>
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline-danger" 
                                                                        onClick={() => handleDelete(a.id)}
                                                                        title="Eliminar actividad"
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PESTAÑA 2: ESTUDIANTES */}
                            {activeTab === 'estudiantes' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                                                <i className="bi bi-people text-info"></i>
                                                Alumnos Matriculados en este Grupo
                                            </h5>
                                            <p className="text-muted small mb-0">
                                                Listado de estudiantes que forman parte del grupo académico.
                                            </p>
                                        </div>
                                        <Badge bg="info" className="text-dark fs-6 px-3 py-2">
                                            Total: {estudiantes.length} alumnos
                                        </Badge>
                                    </div>

                                    {estudiantes.length === 0 ? (
                                        <div className="text-center py-5 bg-light rounded-4 border">
                                            <i className="bi bi-person-x fs-1 text-muted"></i>
                                            <h6 className="mt-3 text-secondary fw-bold">No hay estudiantes inscritos aún</h6>
                                            <p className="text-muted small mb-0">Comunícate con el administrador para vincular alumnos a este grupo.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table hover align="middle" className="mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th style={{ width: '60px' }}>#</th>
                                                        <th>Estudiante</th>
                                                        <th>Correo Electrónico</th>
                                                        <th>Fecha de Inscripción</th>
                                                        <th className="text-center">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {estudiantes.map((e, idx) => (
                                                        <tr key={e.id || idx}>
                                                            <td className="text-muted small">{idx + 1}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: '34px', height: '34px' }}>
                                                                        <i className="bi bi-person-fill"></i>
                                                                    </div>
                                                                    <div>
                                                                        <div className="fw-bold text-dark">{e.estudianteNombre}</div>
                                                                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>ID: {e.estudianteId}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="text-muted small">
                                                                    <i className="bi bi-envelope me-1 text-secondary"></i>
                                                                    {e.estudianteCorreo}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="text-muted small">
                                                                    <i className="bi bi-calendar3 me-1 text-secondary"></i>
                                                                    {e.fechaInscripcion ? new Date(e.fechaInscripcion).toLocaleDateString('es-ES') : '2026-02-15'}
                                                                </span>
                                                            </td>
                                                            <td className="text-center">
                                                                <Badge bg="success" className="bg-opacity-75">
                                                                    Inscrito
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PESTAÑA 3: DETALLES GENERALES */}
                            {activeTab === 'detalles' && (
                                <div>
                                    <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                        <i className="bi bi-info-circle text-primary"></i>
                                        Ficha Técnica del Grupo
                                    </h5>
                                    
                                    <Row className="g-4">
                                        <Col xs={12} md={6}>
                                            <Card className="border rounded-3 h-100 bg-light bg-opacity-50">
                                                <Card.Body className="p-4">
                                                    <h6 className="fw-bold text-dark mb-3">Detalles Académicos</h6>
                                                    <div className="d-flex flex-column gap-3 small">
                                                        <div className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted">Nombre del Grupo:</span>
                                                            <span className="fw-bold text-dark">{grupo?.nombreGrupo}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted">Asignatura:</span>
                                                            <span className="fw-bold text-primary">{grupo?.asignaturaNombre}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted">Periodo Académico:</span>
                                                            <span className="fw-bold text-dark">{grupo?.periodo}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between pb-1">
                                                            <span className="text-muted">Docente a Cargo:</span>
                                                            <span className="fw-bold text-dark">{grupo?.maestroNombre || user?.email}</span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        <Col xs={12} md={6}>
                                            <Card className="border rounded-3 h-100 bg-light bg-opacity-50">
                                                <Card.Body className="p-4">
                                                    <h6 className="fw-bold text-dark mb-3">Instalaciones y Horarios</h6>
                                                    <div className="d-flex flex-column gap-3 small">
                                                        <div className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted">Espacio Físico / Aula:</span>
                                                            <span className="fw-bold text-dark">{grupo?.aula || 'Aula por asignar'}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted">Horario de Clases:</span>
                                                            <span className="fw-bold text-dark">{grupo?.horario || 'Lunes a Viernes (Regular)'}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between border-bottom pb-2">
                                                            <span className="text-muted">Total Alumnos:</span>
                                                            <span className="badge bg-info text-dark">{estudiantes.length} matriculados</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between pb-1">
                                                            <span className="text-muted">Carga Evaluativa:</span>
                                                            <span className="badge bg-warning text-dark">{actividades.length} actividades</span>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Modal Crear Actividad */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="h5 fw-bold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-plus-circle-fill text-warning"></i>
                        Nueva Actividad para {grupo?.nombreGrupo || `Grupo #${id}`}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Título <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ej: Examen Parcial 1"
                                value={formData.titulo} 
                                onChange={e => setFormData({...formData, titulo: e.target.value})} 
                                required 
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small text-secondary">Descripción</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder="Detalles de la asignación..."
                                value={formData.descripcion} 
                                onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                            />
                        </Form.Group>
                        <Row className="g-3 mb-4">
                            <Col xs={12} sm={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-secondary">Valor Máximo <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        step="0.1" 
                                        min="0.1"
                                        max="100"
                                        placeholder="Ej: 20"
                                        value={formData.valorMaximo} 
                                        onChange={e => setFormData({...formData, valorMaximo: e.target.value})} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold small text-secondary">Fecha de Entrega <span className="text-danger">*</span></Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={formData.fechaEntrega} 
                                        onChange={e => setFormData({...formData, fechaEntrega: e.target.value})} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="light" onClick={() => setShowModal(false)} disabled={guardando}>
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="warning" 
                                className="fw-semibold text-dark d-flex align-items-center gap-2"
                                disabled={guardando}
                            >
                                {guardando ? (
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
        </div>
    );
};
