import React, { useState, useEffect, useContext } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axiosConfig';

export const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        usuarios: 0,
        asignaturas: 0,
        grupos: 0,
        inscripciones: 0
    });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarMetricas = async () => {
            setCargando(true);
            setError('');
            try {
                const [resUsuarios, resAsignaturas, resGrupos, resInscripciones] = await Promise.all([
                    api.get('/usuarios').catch(() => ({ data: [] })),
                    api.get('/Asignaturas').catch(() => ({ data: [] })),
                    api.get('/grupos').catch(() => ({ data: [] })),
                    api.get('/inscripciones').catch(() => ({ data: [] }))
                ]);

                setStats({
                    usuarios: resUsuarios.data?.length || 0,
                    asignaturas: resAsignaturas.data?.length || 0,
                    grupos: resGrupos.data?.length || 0,
                    inscripciones: resInscripciones.data?.length || 0
                });
            } catch (err) {
                console.error("Error cargando estadísticas del dashboard", err);
                setError('No se pudieron cargar todas las estadísticas del sistema.');
            } finally {
                setCargando(false);
            }
        };

        cargarMetricas();
    }, []);

    const modulos = [
        {
            titulo: 'Gestión de Usuarios',
            descripcion: 'Registra y administra las cuentas de maestros, estudiantes y administradores.',
            icono: 'bi-people-fill',
            color: 'primary',
            ruta: '/admin/usuarios',
            accion: 'Gestionar Usuarios',
            conteo: stats.usuarios,
            etiqueta: 'usuarios registrados'
        },
        {
            titulo: 'Gestión de Asignaturas',
            descripcion: 'Crea asignaturas, define códigos académicos y créditos correspondientes.',
            icono: 'bi-journal-bookmark-fill',
            color: 'success',
            ruta: '/admin/asignaturas',
            accion: 'Gestionar Asignaturas',
            conteo: stats.asignaturas,
            etiqueta: 'asignaturas activas'
        },
        {
            titulo: 'Gestión de Grupos',
            descripcion: 'Organiza secciones académicas, periodos y asigna docentes a las materias.',
            icono: 'bi-collection-fill',
            color: 'warning',
            ruta: '/admin/grupos',
            accion: 'Gestionar Grupos',
            conteo: stats.grupos,
            etiqueta: 'grupos abiertos'
        },
        {
            titulo: 'Matriculaciones',
            descripcion: 'Inscribe a los estudiantes en sus grupos correspondientes del ciclo escolar.',
            icono: 'bi-person-check-fill',
            color: 'info',
            ruta: '/admin/inscripciones',
            accion: 'Gestionar Matrículas',
            conteo: stats.inscripciones,
            etiqueta: 'inscripciones realizadas'
        }
    ];

    return (
        <div className="container-fluid px-0">
            {/* Header de bienvenida */}
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <h2 className="h3 fw-bold mb-0 text-dark">Panel de Administración</h2>
                            <Badge bg="primary" className="fs-6 px-2 py-1">Admin</Badge>
                        </div>
                        <p className="text-muted mb-0">
                            Bienvenido, <strong>{user?.email || 'Administrador'}</strong>. Controla y administra todos los módulos del sistema académico.
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

            {error && (
                <Alert variant="warning" dismissible onClose={() => setError('')} className="d-flex align-items-center gap-2 mb-4">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <span>{error}</span>
                </Alert>
            )}

            {/* Grid de módulos y accesos directos */}
            <h4 className="fw-bold mb-3 text-secondary d-flex align-items-center gap-2">
                <i className="bi bi-grid-fill text-primary"></i>
                Módulos Operativos
            </h4>

            <Row className="g-4 mb-4">
                {modulos.map((m, idx) => (
                    <Col key={idx} xs={12} sm={6} lg={6} xl={3}>
                        <Card className="h-100 border-0 shadow-sm rounded-4">
                            <Card.Body className="d-flex flex-column p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className={`rounded-3 p-3 bg-${m.color} bg-opacity-10 text-${m.color} d-inline-flex align-items-center justify-content-center`} style={{ width: '56px', height: '56px' }}>
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
                                    onClick={() => navigate(m.ruta)}
                                >
                                    <span>{m.accion}</span>
                                    <i className="bi bi-arrow-right"></i>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Accesos rápidos e información del sistema */}
            <Row className="g-4">
                <Col md={12} lg={8}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                                <i className="bi bi-lightning-charge-fill text-warning"></i>
                                Acciones Rápidas
                            </h5>
                            <p className="text-muted small mb-3">
                                Selecciona una acción para acceder directamente al módulo correspondiente:
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <Button 
                                    variant="outline-primary" 
                                    className="d-flex align-items-center gap-2"
                                    onClick={() => navigate('/admin/usuarios')}
                                >
                                    <i className="bi bi-person-plus-fill"></i>
                                    Crear Usuario
                                </Button>
                                <Button 
                                    variant="outline-success" 
                                    className="d-flex align-items-center gap-2"
                                    onClick={() => navigate('/admin/asignaturas')}
                                >
                                    <i className="bi bi-plus-circle-fill"></i>
                                    Crear Asignatura
                                </Button>
                                <Button 
                                    variant="outline-warning" 
                                    className="d-flex align-items-center gap-2 text-dark"
                                    onClick={() => navigate('/admin/grupos')}
                                >
                                    <i className="bi bi-folder-plus"></i>
                                    Crear Grupo
                                </Button>
                                <Button 
                                    variant="outline-info" 
                                    className="d-flex align-items-center gap-2 text-dark"
                                    onClick={() => navigate('/admin/inscripciones')}
                                >
                                    <i className="bi bi-card-checklist"></i>
                                    Nueva Matrícula
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12} lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 bg-light">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
                                <i className="bi bi-shield-lock-fill text-primary"></i>
                                Estado de la Sesión
                            </h5>
                            <ul className="list-unstyled mb-0 small text-muted">
                                <li className="mb-2 d-flex justify-content-between">
                                    <span>Rol activo:</span>
                                    <Badge bg="success">Administrador</Badge>
                                </li>
                                <li className="mb-2 d-flex justify-content-between">
                                    <span>Conexión API:</span>
                                    <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i>En línea</span>
                                </li>
                                <li className="d-flex justify-content-between">
                                    <span>Seguridad:</span>
                                    <span className="text-muted">JWT Activo</span>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
export default AdminDashboard;
