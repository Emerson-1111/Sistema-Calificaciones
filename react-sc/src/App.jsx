import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import { LoginPage } from './pages/auth/LoginPage.jsx'
import { AdminLayout } from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import { UsuariosAdmin } from './pages/admin/UsuariosAdmin.jsx'
import { GruposAdmin } from './pages/admin/GruposAdmin.jsx'
import { InscripcionesAdmin } from './pages/admin/InscripcionesAdmin.jsx'
import { TeacherLayout } from './pages/teacher/TeacherLayout.jsx'
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx'
import { MisGrupos } from './pages/teacher/MisGrupos.jsx'
import { GrupoDetalle } from './pages/teacher/GrupoDetalle.jsx'
import { ActividadDetalle } from './pages/teacher/ActividadDetalle.jsx'
import CrearAsignatura from './features/asignatura/CrearAsignatura.jsx'
import { StudentLayout } from './pages/student/StudentLayout.jsx'
import { StudentDashboard } from './pages/student/StudentDashboard.jsx'
import { MiGrupo } from './pages/student/MiGrupo.jsx'
import { MisAsignaturas } from './pages/student/MisAsignaturas.jsx'
import { MisCalificaciones } from './pages/student/MisCalificaciones.jsx'
import './App.css'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles) {
    const userRole = (user.role || '').toLowerCase();
    const hasRole = roles.some(r => r.toLowerCase() === userRole || (r.toLowerCase() === 'admin' && user.rolId === 1));
    if (!hasRole) return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }
  if (user) {
    const role = (user.role || '').toLowerCase();
    if (role === 'admin' || user.rolId === 1) return <Navigate to="/admin" replace />;
    if (role === 'maestro' || user.rolId === 2) return <Navigate to="/maestro" replace />;
    if (role === 'estudiante' || user.rolId === 3) return <Navigate to="/estudiante" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || user.rolId === 1) return <Navigate to="/admin" replace />;
  if (role === 'maestro' || user.rolId === 2) return <Navigate to="/maestro" replace />;
  if (role === 'estudiante' || user.rolId === 3) return <Navigate to="/estudiante" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  const { user, logout } = useContext(AuthContext);

  const getRoleBadgeVariant = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 'danger';
    if (r === 'maestro') return 'success';
    if (r === 'estudiante') return 'info';
    return 'primary';
  };

  return (
    <div className="app bg-light">
      {user && (
        <nav className="navbar navbar-expand-lg navbar-dark custom-navbar px-3 px-md-4 mb-3">
          <div className="container-fluid px-0">
            <span className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white mb-0">
              <div className="bg-white bg-opacity-20 p-2 rounded-3 d-inline-flex align-items-center justify-content-center">
                <i className="bi bi-mortarboard-fill text-warning fs-5"></i>
              </div>
              <span className="d-none d-sm-inline">Sistema de Calificaciones</span>
              <span className="d-inline d-sm-none">SC</span>
            </span>
            <div className="ms-auto d-flex align-items-center gap-3 text-white">
              <span className="d-none d-sm-inline text-light small">
                <i className="bi bi-person-circle me-1 text-info"></i>
                {user.email} 
                <span className={`badge bg-${getRoleBadgeVariant(user.role)} ms-2`}>
                  {user.role}
                </span>
              </span>
              <button 
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 px-3 py-1 shadow-xs" 
                onClick={logout}
                title="Cerrar sesión"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span className="d-none d-sm-inline">Salir</span>
              </button>
            </div>
          </div>
        </nav>
      )}
      <main className="w-100">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="usuarios" element={<UsuariosAdmin />} />
            <Route path="asignaturas" element={<CrearAsignatura />} />
            <Route path="grupos" element={<GruposAdmin />} />
            <Route path="inscripciones" element={<InscripcionesAdmin />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/maestro" element={
            <ProtectedRoute roles={['Maestro', 'Admin']}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="mis-grupos" element={<MisGrupos />} />
            <Route path="grupo/:id" element={<GrupoDetalle />} />
            <Route path="actividad/:id" element={<ActividadDetalle />} />
          </Route>

          {/* Student Routes */}
          <Route path="/estudiante" element={
            <ProtectedRoute roles={['Estudiante', 'Admin']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="grupo" element={<MiGrupo />} />
            <Route path="asignaturas" element={<MisAsignaturas />} />
            <Route path="calificaciones" element={<MisCalificaciones />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
