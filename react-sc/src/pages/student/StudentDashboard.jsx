import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Card, Row, Col, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const [estudianteInfo, setEstudianteInfo] = useState({
        id: user?.id || 10,
        nombre: 'Estudiante',
        correo: user?.email || 'estudiante@colegio.edu',
        matricula: 'EST-2026001',
        carrera: 'Ingeniería de Sistemas y Computación',
        estado: 'Activo / Regular'
    });

    const [conteoGrupos, setConteoGrupos] = useState(0);
    const [conteoAsignaturas, setConteoAsignaturas] = useState(0);
    const [conteoCalificaciones, setConteoCalificaciones] = useState(0);
    const [promedioPonderado, setPromedioPonderado] = useState('91.2');
    const [grupoActual, setGrupoActual] = useState('Grupo 101-A (2026-1)');

    const cargarDatosResumen = useCallback(async () => {
        if (!user) return;
        setCargando(true);
        setError('');

        try {
            const estudianteIdNum = parseInt(user.id, 10) || 10;
            let apiOnline = true;
            let inscripcionesData = [];
            let gruposData = [];
            let usuariosData = [];

            try {
                const [resInscripciones, resGrupos, resUsuarios] = await Promise.all([
                    api.get('/inscripciones').catch(() => ({ data: [] })),
                    api.get('/grupos').catch(() => ({ data: [] })),
                    api.get('/usuarios').catch(() => ({ data: [] }))
                ]);
                inscripcionesData = resInscripciones.data || [];
                gruposData = resGrupos.data || [];
                usuariosData = resUsuarios.data || [];
            } catch {
                apiOnline = false;
            }

            const miUsuario = usuariosData.find(u => u.id === estudianteIdNum);
            if (miUsuario) {
                setEstudianteInfo(prev => ({
                    ...prev,
                    nombre: miUsuario.nombre,
                    correo: miUsuario.correo,
                    id: miUsuario.id,
                    matricula: `EST-${miUsuario.id.toString().padStart(4, '0')}`
                }));
            } else {
                setEstudianteInfo(prev => ({
                    ...prev,
                    nombre: user.email ? user.email.split('@')[0].toUpperCase() : 'Juan David Pérez',
                    correo: user.email || 'estudiante@colegio.edu',
                    matricula: `EST-2026-${estudianteIdNum}`
                }));
            }

            const inscripcionesEstudiante = inscripcionesData.filter(i => i.estudianteId === estudianteIdNum);
            let gruposEstudiante = [];

            if (inscripcionesEstudiante.length > 0) {
                gruposEstudiante = gruposData.filter(g => 
                    inscripcionesEstudiante.some(i => i.grupoId === g.id)
                );
            }

            if (gruposEstudiante.length > 0) {
                setConteoGrupos(gruposEstudiante.length);
                setConteoAsignaturas(gruposEstudiante.length);
                setGrupoActual(gruposEstudiante[0].nombreGrupo + ` (${gruposEstudiante[0].periodo})`);
            } else {
                // Fallback demostrativo
                setConteoGrupos(3);
                setConteoAsignaturas(5);
                setConteoCalificaciones(7);
                setPromedioPonderado('91.2');
                setGrupoActual('Grupo 101-A (Periodo 2026-1)');
            }

        } catch (err) {
            console.error("Error cargando resumen del estudiante", err);
            setError('Inconveniente al sincronizar las métricas generales.');
        } finally {
            setCargando(false);
        }
    }, [user]);

    useEffect(() => {
        cargarDatosResumen();
    }, [cargarDatosResumen]);

    return (
        <div className="container-fluid px-0">
            {/* Header de bienvenida del estudiante */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div 
                            className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '64px', height: '64px' }}
                        >
                            <i className="bi bi-mortarboard-fill fs-2"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h2 className="h4 fw-bold mb-0 text-dark">{estudianteInfo.nombre}</h2>
                                <Badge bg="primary" className="px-2 py-1 fs-6">
                                    <i className="bi bi-person-check-fill me-1"></i>
                                    Estudiante
                                </Badge>
                                <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                    {estudianteInfo.estado}
                                </Badge>
                            </div>
                            <p className="text-muted small mb-0">
                                <i className="bi bi-envelope me-1"></i>
                                {estudianteInfo.correo}
                                <span className="mx-2">•</span>
                                <i className="bi bi-card-text me-1"></i>
                                Matrícula: <strong className="text-dark">{estudianteInfo.matricula}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="d-flex align-items-center gap-1 shadow-xs"
                            onClick={cargarDatosResumen}
                            disabled={cargando}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            <span>Sincronizar</span>
                        </Button>
                        <span className="badge bg-light text-secondary border px-3 py-2 fs-6">
                            <i className="bi bi-calendar3 me-1 text-primary"></i>
                            {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="warning" dismissible onClose={() => setError('')} className="d-flex align-items-center gap-2 mb-4">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <span>{error}</span>
                </Alert>
            )}

            {/* Métrica Cards Rápidas */}
            <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold">Promedio Ponderado</div>
                                <div className="h3 fw-bold text-primary mb-0">{promedioPonderado}%</div>
                                <div className="small text-success fw-medium">
                                    <i className="bi bi-graph-up-arrow me-1"></i>
                                    Rendimiento Aprobatorio
                                </div>
                            </div>
                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                                <i className="bi bi-award-fill fs-3"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold">Asignaturas Cursando</div>
                                <div className="h3 fw-bold text-success mb-0">{conteoAsignaturas}</div>
                                <div className="small text-muted">
                                    Materias en plan de estudio
                                </div>
                            </div>
                            <div className="bg-success bg-opacity-10 text-success rounded-3 p-3">
                                <i className="bi bi-journal-bookmark-fill fs-3"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold">Actividades Evaluadas</div>
                                <div className="h3 fw-bold text-warning mb-0">{conteoCalificaciones}</div>
                                <div className="small text-muted">
                                    Con nota y retroalimentación
                                </div>
                            </div>
                            <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3">
                                <i className="bi bi-check2-circle fs-3"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                            <div>
                                <div className="text-muted small fw-semibold">Grupos Matriculados</div>
                                <div className="h3 fw-bold text-info mb-0">{conteoGrupos}</div>
                                <div className="small text-muted">
                                    Secciones escolares activas
                                </div>
                            </div>
                            <div className="bg-info bg-opacity-10 text-info rounded-3 p-3">
                                <i className="bi bi-collection-fill fs-3"></i>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tarjetas de Navegación a Cada Subsección Independiente */}
            <h5 className="fw-bold mb-3 text-secondary d-flex align-items-center gap-2">
                <i className="bi bi-grid-fill text-primary"></i>
                Módulos del Estudiante
            </h5>

            <Row className="g-4 mb-4">
                {/* 1. Módulo: Mi Grupo */}
                <Col xs={12} md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <Card.Body className="p-4 d-flex flex-column">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-collection-fill fs-3"></i>
                                </div>
                                <Badge bg="warning" className="text-dark">
                                    Grupo Asignado
                                </Badge>
                            </div>

                            <Card.Title className="h5 fw-bold text-dark mb-2">
                                Mi Grupo Académico
                            </Card.Title>
                            <Card.Text className="text-muted small flex-grow-1 mb-3">
                                Consulta la sección escolar a la que perteneces, el ciclo académico lectivo, horario, aula y estado formal de tu matriculación.
                            </Card.Text>

                            <div className="p-2 bg-light rounded-3 border mb-3 small text-muted">
                                <i className="bi bi-info-circle me-1 text-primary"></i>
                                Actual: <strong className="text-dark">{grupoActual}</strong>
                            </div>

                            <Button 
                                variant="warning" 
                                className="w-100 py-2 fw-semibold text-dark d-flex align-items-center justify-content-center gap-2 shadow-xs"
                                onClick={() => navigate('/estudiante/grupo')}
                            >
                                <span>Ver Mi Grupo</span>
                                <i className="bi bi-arrow-right"></i>
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 2. Módulo: Mis Asignaturas */}
                <Col xs={12} md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <Card.Body className="p-4 d-flex flex-column">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-journal-bookmark-fill fs-3"></i>
                                </div>
                                <Badge bg="success">
                                    {conteoAsignaturas} Materias
                                </Badge>
                            </div>

                            <Card.Title className="h5 fw-bold text-dark mb-2">
                                Mis Asignaturas y Docentes
                            </Card.Title>
                            <Card.Text className="text-muted small flex-grow-1 mb-3">
                                Revisa el listado de materias que estás cursando, créditos curriculares, códigos y la información de contacto de tus profesores.
                            </Card.Text>

                            <div className="p-2 bg-light rounded-3 border mb-3 small text-muted">
                                <i className="bi bi-person-workspace me-1 text-success"></i>
                                Profesores titulares asignados con correo
                            </div>

                            <Button 
                                variant="success" 
                                className="w-100 py-2 fw-semibold text-white d-flex align-items-center justify-content-center gap-2 shadow-xs"
                                onClick={() => navigate('/estudiante/asignaturas')}
                            >
                                <span>Ver Asignaturas</span>
                                <i className="bi bi-arrow-right"></i>
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 3. Módulo: Mis Calificaciones */}
                <Col xs={12} md={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <Card.Body className="p-4 d-flex flex-column">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3 d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                    <i className="bi bi-award-fill fs-3"></i>
                                </div>
                                <Badge bg="primary">
                                    Calificaciones
                                </Badge>
                            </div>

                            <Card.Title className="h5 fw-bold text-dark mb-2">
                                Mis Calificaciones
                            </Card.Title>
                            <Card.Text className="text-muted small flex-grow-1 mb-3">
                                Accede a la tabla completa de evaluaciones y notas seccionadas por periodo lectivo, porcentajes de avance y observaciones del profesor.
                            </Card.Text>

                            <div className="p-2 bg-light rounded-3 border mb-3 small text-muted">
                                <i className="bi bi-graph-up me-1 text-primary"></i>
                                Promedio acumulado: <strong className="text-dark">{promedioPonderado}%</strong>
                            </div>

                            <Button 
                                variant="primary" 
                                className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                                onClick={() => navigate('/estudiante/calificaciones')}
                            >
                                <span>Ver Calificaciones</span>
                                <i className="bi bi-arrow-right"></i>
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Ficha institucional de estado */}
            <Card className="border-0 shadow-sm rounded-4 bg-light">
                <Card.Body className="p-4">
                    <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                        <i className="bi bi-shield-check text-success"></i>
                        Información y Política del Portal Estudiantil
                    </h6>
                    <p className="small text-muted mb-0">
                        Como estudiante matriculado, tienes acceso a consultar tus registros académicos oficiales, notas por periodo escolar y los datos de contacto de tus docentes. Ante cualquier discrepancia en tus calificaciones, contacta directamente con el profesor titular de la materia o con el departamento de registro escolar.
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default StudentDashboard;
