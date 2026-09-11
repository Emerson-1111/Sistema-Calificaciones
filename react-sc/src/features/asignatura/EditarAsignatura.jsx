import { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal'
import clienteAPI from '../../api/clienteAxios'

function validar(datos) {
  const errores = {}
  if (!datos.nombre?.trim()) {
    errores.nombre = 'El nombre es obligatorio.'
  } else if (datos.nombre.trim().length > 100) {
    errores.nombre = 'El nombre no puede superar los 100 caracteres.'
  }

  if (!datos.codigo?.trim()) {
    errores.codigo = 'El código es obligatorio.'
  } else if (datos.codigo.trim().length > 20) {
    errores.codigo = 'El código no puede superar los 20 caracteres.'
  }

  if (datos.creditos === '' || datos.creditos === null || datos.creditos === undefined) {
    errores.creditos = 'Indica al menos un crédito.'
  } else if (Number(datos.creditos) < 1) {
    errores.creditos = 'El número de créditos debe ser mayor o igual a 1.'
  }

  return errores
}

function EditarAsignatura({ show, asignatura, onCerrar, onAsignaturaActualizada }) {
  const [datos, setDatos] = useState({ nombre: '', codigo: '', creditos: '' })
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  useEffect(() => {
    if (asignatura) {
      setDatos({
        nombre: asignatura.nombre || '',
        codigo: asignatura.codigo || '',
        creditos: asignatura.creditos ?? ''
      })
      setErrores({})
      setErrorServidor('')
    }
  }, [asignatura, show])

  const actualizarCampo = ({ target: { name, value } }) => {
    setDatos((prev) => ({ ...prev, [name]: value }))
    setErrores((prev) => ({ ...prev, [name]: undefined }))
    setErrorServidor('')
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    if (!asignatura?.id) return

    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setGuardando(true)
    setErrorServidor('')

    try {
      const payload = {
        nombre: datos.nombre.trim(),
        codigo: datos.codigo.trim(),
        creditos: Number(datos.creditos)
      }

      await clienteAPI.put(`/Asignaturas/${asignatura.id}`, payload)

      if (onAsignaturaActualizada) {
        onAsignaturaActualizada({ id: asignatura.id, ...payload })
      }
      onCerrar()
    } catch (error) {
      console.error('Error al editar asignatura:', error)
      const resp = error.response?.data
      let mensaje = 'No se pudo actualizar la asignatura. Verifica que el servidor esté activo.'

      if (resp?.errors) {
        // Errores de validación devueltos por ModelState en ASP.NET
        const detalles = Object.values(resp.errors).flat().join(' ')
        mensaje = detalles || resp.title || mensaje
      } else if (resp?.title || resp?.message) {
        mensaje = resp.title || resp.message
      }

      setErrorServidor(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal show={show} onHide={guardando ? undefined : onCerrar} centered backdrop="static">
      <form onSubmit={manejarEnvio} noValidate>
        <Modal.Header closeButton={!guardando} className="border-0 pb-0">
          <Modal.Title className="h5 fw-bold text-dark d-flex align-items-center gap-2">
            <span className="bg-primary-subtle text-primary p-2 rounded-3 d-inline-flex">
              <i className="bi bi-pencil-square fs-5"></i>
            </span>
            <span>Editar Asignatura</span>
            {asignatura?.id && (
              <span className="badge bg-secondary-subtle text-secondary fs-6 ms-2">
                ID #{asignatura.id}
              </span>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          <p className="text-muted small mb-4">
            Modifica la información de la asignatura y guarda los cambios para sincronizarlos con la base de datos.
          </p>

          {errorServidor && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
              <div>{errorServidor}</div>
            </div>
          )}

          <div className="d-flex flex-column gap-3">
            <div>
              <label htmlFor="edit-nombre" className="form-label fw-bold text-secondary small mb-1">
                Nombre de la Asignatura
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-book text-muted"></i>
                </span>
                <input
                  id="edit-nombre"
                  name="nombre"
                  type="text"
                  className={`form-control border-start-0 ps-0 ${errores.nombre ? 'is-invalid' : ''}`}
                  value={datos.nombre}
                  onChange={actualizarCampo}
                  maxLength={100}
                  disabled={guardando}
                  placeholder="Ej. Cálculo Integral"
                  autoFocus
                />
              </div>
              {errores.nombre && <div className="text-danger small mt-1">{errores.nombre}</div>}
            </div>

            <div>
              <label htmlFor="edit-codigo" className="form-label fw-bold text-secondary small mb-1">
                Código
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-tag text-muted"></i>
                </span>
                <input
                  id="edit-codigo"
                  name="codigo"
                  type="text"
                  className={`form-control border-start-0 ps-0 text-uppercase ${errores.codigo ? 'is-invalid' : ''}`}
                  value={datos.codigo}
                  onChange={actualizarCampo}
                  maxLength={20}
                  disabled={guardando}
                  placeholder="Ej. MAT-201"
                />
              </div>
              {errores.codigo && <div className="text-danger small mt-1">{errores.codigo}</div>}
            </div>

            <div>
              <label htmlFor="edit-creditos" className="form-label fw-bold text-secondary small mb-1">
                Créditos
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-award text-muted"></i>
                </span>
                <input
                  id="edit-creditos"
                  name="creditos"
                  type="number"
                  className={`form-control border-start-0 ps-0 ${errores.creditos ? 'is-invalid' : ''}`}
                  value={datos.creditos}
                  onChange={actualizarCampo}
                  min={1}
                  step={1}
                  disabled={guardando}
                  placeholder="Ej. 4"
                />
              </div>
              {errores.creditos && <div className="text-danger small mt-1">{errores.creditos}</div>}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0 pb-3">
          <button
            type="button"
            className="button button--secondary btn-sm"
            onClick={onCerrar}
            disabled={guardando}
          >
            <i className="bi bi-x-lg me-1"></i> Cancelar
          </button>
          <button
            type="submit"
            className="button btn-sm"
            disabled={guardando}
          >
            {guardando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando cambios...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i> Guardar cambios
              </>
            )}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default EditarAsignatura
