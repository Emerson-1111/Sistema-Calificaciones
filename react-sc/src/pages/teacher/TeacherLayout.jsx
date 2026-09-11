import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import NavigationToolbar from '../../componentes/NavigationToolbar';

export const TeacherLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { to: '/maestro', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
        { to: '/maestro/mis-grupos', label: 'Mis Grupos', icon: 'bi-collection-fill' },
    ];

    return (
        <Container fluid className="px-3 px-md-4 py-2">
            <Row className="g-3">
                {sidebarOpen && (
                    <Col md={3} lg={2} className="sidebar-col">
                        <div className="sidebar-card sticky-sidebar">
                            <div className="d-flex align-items-center justify-content-between sidebar-header">
                                <span className="sidebar-title d-flex align-items-center gap-1">
                                    <i className="bi bi-person-workspace text-primary"></i>
                                    Panel Docente
                                </span>
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="text-muted p-0 text-decoration-none"
                                    onClick={() => setSidebarOpen(false)}
                                    title="Ocultar menú lateral"
                                >
                                    <i className="bi bi-chevron-left fs-6"></i>
                                </Button>
                            </div>
                            <Nav className="flex-column gap-1">
                                {navItems.map((item) => (
                                    <Nav.Link
                                        key={item.to}
                                        as={NavLink}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `sidebar-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <i className={`bi ${item.icon} fs-5`}></i>
                                        <span>{item.label}</span>
                                    </Nav.Link>
                                ))}
                            </Nav>

                            <div className="sidebar-footer-badge">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="bi bi-person-workspace text-primary"></i>
                                    <span className="small fw-bold text-dark">Rol Activo</span>
                                </div>
                                <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                                    Docente / Maestro
                                </div>
                            </div>
                        </div>
                    </Col>
                )}

                <Col xs={12} md={sidebarOpen ? 9 : 12} lg={sidebarOpen ? 10 : 12} className="transition-all">
                    <NavigationToolbar 
                        sidebarOpen={sidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                        dashboardPath="/maestro" 
                        roleName="Docente"
                    />
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
};

export default TeacherLayout;
