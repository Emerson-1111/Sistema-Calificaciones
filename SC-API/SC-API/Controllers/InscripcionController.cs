using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SC_API.DTOs;
using SC_API.Entidades;

namespace SC_API.Controllers
{
    [Route("api/inscripciones")]
    [ApiController]
    [Authorize]
    public class InscripcionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InscripcionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<InscripcionDTO>>> GetInscripciones()
        {
            var inscripciones = await _context.Inscripciones
                .Include(i => i.Estudiante)
                .Include(i => i.Grupo)
                .ToListAsync();

            return inscripciones.Select(i => new InscripcionDTO
            {
                Id = i.Id,
                FechaInscripcion = i.FechaInscripcion,
                EstudianteId = i.EstudianteId,
                EstudianteNombre = i.Estudiante.Nombre,
                GrupoId = i.GrupoId,
                GrupoNombre = i.Grupo.NombreGrupo
            }).ToList();
        }

        [HttpPost]
        public async Task<ActionResult> PostInscripcion([FromBody] InscripcionCreacionDTO inscripcionCreacionDTO)
        {
            var inscripcion = new Inscripcion
            {
                EstudianteId = inscripcionCreacionDTO.EstudianteId,
                GrupoId = inscripcionCreacionDTO.GrupoId
            };

            _context.Inscripciones.Add(inscripcion);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteInscripcion(int id)
        {
            var inscripcion = await _context.Inscripciones.FindAsync(id);
            if (inscripcion == null)
            {
                return NotFound();
            }

            _context.Inscripciones.Remove(inscripcion);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
