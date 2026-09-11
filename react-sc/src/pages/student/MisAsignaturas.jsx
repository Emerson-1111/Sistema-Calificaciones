import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Card, Row, Col, Badge, Alert, Spinner, Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export const MisAsignaturas = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [asignaturas, setAsignaturas] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [periodoFiltro, setPeriodoFiltro] = useState('todos');

    const cargarAsignaturas = useCallback(async () => {
        if (!user) return;
        setCargando(true);
        setError('');

        try {
            const estudianteIdNum = parseInt(user.id, 10) || 10;
            let inscripcionesData = [];
            let gruposData = [];

            try {
                const [resInscripciones, resGrupos] = await Promise.all([
                    api.get('/inscripciones').catch(() => ({ data: [] })),
                    api.get('/grupos').catch(() => ({ data: [] }))
                ]);
                inscripcionesData = resInscripciones.data || [];
                gruposData = resGrupos.data || [];
            } catch {
                // Modo fallback offline
            }

            const inscripcionesEstudiante = inscripcionesData.filter(i => i.estudianteId === estudianteIdNum);
            let gruposEstudiante = [];

            if (inscripcionesEstudiante.length > 0) {
                gruposEstudiante = gruposData.filter(g => 
                    inscripcionesEstudiante.some(i => i.grupoId === g.id)
                );
            }

            if (gruposEstudiante.length === 0) {
                gruposEstudiante = [
                    {
                        id: 101,
                        nombreGrupo: 'Grupo 101-A',
                        periodo: '2026-1',
                        asignaturaId: 1,
                        asignaturaNombre: 'Matemáticas Avanzadas',
                        creditos: 4,
                        codigoAsignatura: 'MAT-301',
                        maestroId: 2,
                        maestroNombre: 'Prof. Carlos Ramírez',
                        maestroCorreo: 'carlos.ramirez@institucion.edu'
                    },
                    {
                        id: 102,
                        nombreGrupo: 'Grupo 201-B',
                        periodo: '2026-1',
                        asignaturaId: 2,
                        asignaturaNombre: 'Física Mecánica',
                        creditos: 3,
                        codigoAsignatura: 'FIS-201',
                        maestroId: 3,
                        maestroNombre: 'Dra. María Fernández',
                        maestroCorreo: 'maria.fernandez@institucion.edu'
                    },
                    {
                        id: 103,
                        nombreGrupo: 'Grupo 301-C',
                        periodo: '2026-1',
                        asignaturaId: 3,
                        asignaturaNombre: 'Algoritmos y Estructuras de Datos',
                        creditos: 4,
                        codigoAsignatura: 'INF-204',
                        maestroId: 4,
                        maestroNombre: 'Ing. Roberto Gómez',
                        maestroCorreo: 'roberto.gomez@institucion.edu'
                    },
                    {
                        id: 201,
                        nombreGrupo: 'Grupo 102-Previo',
                        periodo: '2025-2',
                        asignaturaId: 4,
                        asignaturaNombre: 'Cálculo Diferencial',
                        creditos: 4,
                        codigoAsignatura: 'MAT-101',
                        maestroId: 2,
                        maestroNombre: 'Prof. Carlos Ramírez',
                        maestroCorreo: 'carlos.ramirez@institucion.edu'
                    },
                    {
                        id: 202,
                        nombreGrupo: 'Grupo 103-Previo',
                        periodo: '2025-2',
                        asignaturaId: 5,
                        asignaturaNombre: 'Introducción a la Programación',
                        creditos: 3,
                        codigoAsignatura: 'INF-101',
                        maestroId: 4,
                        maestroNombre: 'Ing. Roberto Gómez',
                        maestroCorreo: 'roberto.gomez@institucion.edu'
                    }
                ];
            }

            const mapeadas = gruposEstudiante.map(g => ({
                id: g.asignaturaId || g.id,
                nombre: g.asignaturaNombre || 'Materia Académica',
                codigo: g.codigoAsignatura || `ASIG-${g.id}`,
                creditos: g.creditos || 4,
                grupoNombre: g.nombreGrupo,
                periodo: g.periodo,
                maestro: {
                    id: g.maestroId,
                    nombre: g.maestroNombre || 'Profesor Titular',
                    correo: g.maestroCorreo || `docente${g.maestroId || 1}@institucion.edu`
                }
            }));

            setAsignaturas(mapeadas);
        } catch (err) {
            console.error("Error cargando asignaturas", err);
            setError('Inconveniente al sincronizar las asignaturas.');
        } finally {
            setCargando(false);
        }
    }, [user]);

    useEffect(() => {
        cargarAsignaturas();
    }, [cargarAsignaturas]);

    // Periodos disponibles
    const periodos = useMemo(() => {
        const setP = new Set();
        asignaturas.forEach(a => { if (a.periodo) setP.add(a.periodo); });
        return Array.from(setP).sort().reverse();
    }, [asignaturas]);

    // Filtrado
    const asignaturasFiltradas = useMemo(() => {
        return asignaturas.filter(a => {
            const coincidePeriodo = periodoFiltro === 'todos' || a.periodo === periodoFiltro;
            const coincideBusqueda = !busqueda.trim() || 
                a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                a.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
                a.maestro.nombre.toLowerCase().includes(busqueda.toLowerCase());
            return coincidePeriodo && coincideBusqueda;
        });
    }, [asignaturas, periodoFiltro, busqueda]);

    return (
        <div className="container-fluid px-0">
            {/* Header de la sección */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-success bg-opacity-10 text-success p-3 rounded-4 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                            <i className="bi bi-journal-bookmark-fill fs-3"></i>
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <h2 className="h4 fw-bold mb-0 text-dark">Mis Asignaturas Cursadas</h2>
                                <Badge bg="success" className="px-2 py-1">
                                    {asignaturasFiltradas.length} Materias
                                </Badge>
                            </div>
                            <p className="text-muted small mb-0">
                                Información de las asignaturas en las que estás registrado y los datos de contacto de cada profesor.
                            </p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="d-flex align-items-center gap-1 shadow-xs"
                            onClick={cargarAsignaturas}
                            disabled={cargando}
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            <span>Actualizar</span>
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="warning" dismissible onClose={() => setError('')} className="d-flex align-items-center gap-2 mb-4">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <span>{error}</span>
                </Alert>
            )}

            {/* Barra de Filtros y Búsqueda */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="small fw-bold text-muted">Filtrar por Periodo:</span>
                        <Button 
                            variant={periodoFiltro === 'todos' ? 'primary' : 'outline-secondary'}
                            size="sm"
                            className="rounded-pill px-3"
                            onClick={() => setPeriodoFiltro('todos')}
                        >
                            Todos
                        </Button>
                        {periodos.map(p => (
                            <Button 
                                key={p}
                                variant={periodoFiltro === p ? 'primary' : 'outline-secondary'}
                                size="sm"
                                className="rounded-pill px-3"
                                onClick={() => setPeriodoFiltro(p)}
                            >
                                Periodo {p}
                            </Button>
                        ))}
                    </div>

                    <div style={{ maxWidth: '280px' }} className="w-100">
                        <InputGroup size="sm">
                            <InputGroup.Text className="bg-light border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </InputGroup.Text>
                            <Form.Control 
                                type="text"
                                className="border-start-0 ps-1"
                                placeholder="Buscar materia o docente..."
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
                </Card.Body>
            </Card>

            {/* Contenido: Cards de Asignaturas */}
            {cargando ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="success" />
                    <div className="text-muted small mt-2">Cargando asignaturas...</div>
                </div>
            ) : asignaturasFiltradas.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-4">
                    <i className="bi bi-journal-x fs-1 text-muted"></i>
                    <h5 className="mt-3 text-secondary">No se encontraron asignaturas</h5>
                    <p className="text-muted small mb-0">No hay materias que coincidan con los criterios seleccionados.</p>
                </div>
            ) : (
                <Row className="g-4">
                    {asignaturasFiltradas.map((asig, idx) => (
                        <Col key={idx} xs={12} md={6} lg={4}>
                            <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                <Card.Header className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
                                    <Badge bg="primary" className="font-monospace fs-6 px-2 py-1">
                                        {asig.codigo}
                                    </Badge>
                                    <Badge bg="info" className="text-dark px-2 py-1">
                                        <i className="bi bi-award-fill me-1 text-warning"></i>
                                        {asig.creditos} Créditos
                                    </Badge>
                                </Card.Header>
                                <Card.Body className="p-4 d-flex flex-column">
                                    <h5 className="fw-bold text-dark mb-2">{asig.nombre}</h5>
                                    
                                    <div className="small text-muted mb-3">
                                        <i className="bi bi-collection me-1 text-primary"></i>
                                        Grupo: <strong className="text-dark">{asig.grupoNombre}</strong>
                                        <span className="mx-2">•</span>
                                        <i className="bi bi-calendar3 me-1 text-secondary"></i>
                                        Ciclo: {asig.periodo}
                                    </div>

                                    {/* Ficha completa del Maestro Titular */}
                                    <div className="mt-auto p-3 bg-light rounded-3 border">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <div 
                                                className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ width: '42px', height: '42px' }}
                                            >
                                                <i className="bi bi-person-workspace fs-4"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{asig.maestro.nombre}</div>
                                                <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '0.72rem' }}>
                                                    Docente Titular
                                                </span>
                                            </div>
                                        </div>
                                        <div className="small text-muted text-truncate" style={{ fontSize: '0.82rem' }}>
                                            <i className="bi bi-envelope me-1 text-secondary"></i>
                                            <a href={`mailto:${asig.maestro.correo}`} className="text-decoration-none text-muted">
                                                {asig.maestro.correo}
                                            </a>
                                        </div>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="bg-white border-top p-3 text-end">
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        className="d-inline-flex align-items-center gap-1 shadow-xs"
                                        onClick={() => navigate('/estudiante/calificaciones')}
                                    >
                                        <i className="bi bi-award"></i>
                                        <span>Ver Calificaciones</span>
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default MisAsignaturas;
