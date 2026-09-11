using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SC_API.DTOs;
using SC_API.Entidades;

namespace SC_API.Controllers
{
    [Route("api/calificaciones")]
    [ApiController]
    [Authorize]
    public class CalificacionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CalificacionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("actividad/{actividadId:int}")]
        public async Task<ActionResult<List<CalificacionDTO>>> GetCalificacionesPorActividad(int actividadId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Where(c => c.ActividadId == actividadId)
                .ToListAsync();

            return calificaciones.Select(c => new CalificacionDTO
            {
                Id = c.Id,
                PuntuacionObtenida = c.PuntuacionObtenida,
                ComentariosRetroalimentacion = c.ComentariosRetroalimentacion,
                ActividadId = c.ActividadId,
                EstudianteId = c.EstudianteId,
                EstudianteNombre = c.Estudiante.Nombre
            }).ToList();
        }

        [HttpGet("estudiante/{estudianteId:int}")]
        public async Task<ActionResult<List<CalificacionDTO>>> GetCalificacionesPorEstudiante(int estudianteId)
        {
            var calificaciones = await _context.Calificaciones
                .Include(c => c.Estudiante)
                .Where(c => c.EstudianteId == estudianteId)
                .ToListAsync();

            return calificaciones.Select(c => new CalificacionDTO
            {
                Id = c.Id,
                PuntuacionObtenida = c.PuntuacionObtenida,
                ComentariosRetroalimentacion = c.ComentariosRetroalimentacion,
                ActividadId = c.ActividadId,
                EstudianteId = c.EstudianteId,
                EstudianteNombre = c.Estudiante?.Nombre
            }).ToList();
        }

        [HttpPost]
        public async Task<ActionResult> PostCalificacion([FromBody] CalificacionCreacionDTO calificacionCreacionDTO)
        {
            var calificacion = new Calificacion
            {
                PuntuacionObtenida = calificacionCreacionDTO.PuntuacionObtenida,
                ComentariosRetroalimentacion = calificacionCreacionDTO.ComentariosRetroalimentacion,
                ActividadId = calificacionCreacionDTO.ActividadId,
                EstudianteId = calificacionCreacionDTO.EstudianteId
            };

            _context.Calificaciones.Add(calificacion);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteCalificacion(int id)
        {
            var calificacion = await _context.Calificaciones.FindAsync(id);
            if (calificacion == null)
            {
                return NotFound();
            }

            _context.Calificaciones.Remove(calificacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
