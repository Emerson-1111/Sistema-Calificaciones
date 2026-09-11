using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SC_API.DTOs;
using SC_API.Entidades;

namespace SC_API.Controllers
{
    [Route("api/actividades")]
    [ApiController]
    [Authorize]
    public class ActividadController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActividadController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("grupo/{grupoId:int}")]
        public async Task<ActionResult<List<ActividadDTO>>> GetActividadesPorGrupo(int grupoId)
        {
            var actividades = await _context.Actividades
                .Where(a => a.GrupoId == grupoId)
                .ToListAsync();

            return actividades.Select(a => new ActividadDTO
            {
                Id = a.Id,
                Titulo = a.Titulo,
                Descripcion = a.Descripcion,
                ValorMaximo = a.ValorMaximo,
                FechaEntrega = a.FechaEntrega,
                GrupoId = a.GrupoId
            }).ToList();
        }

        [HttpPost]
        public async Task<ActionResult> PostActividad([FromBody] ActividadCreacionDTO actividadCreacionDTO)
        {
            var actividad = new Actividad
            {
                Titulo = actividadCreacionDTO.Titulo,
                Descripcion = actividadCreacionDTO.Descripcion,
                ValorMaximo = actividadCreacionDTO.ValorMaximo,
                FechaEntrega = actividadCreacionDTO.FechaEntrega,
                GrupoId = actividadCreacionDTO.GrupoId
            };

            _context.Actividades.Add(actividad);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteActividad(int id)
        {
            var actividad = await _context.Actividades.FindAsync(id);
            if (actividad == null)
            {
                return NotFound();
            }

            _context.Actividades.Remove(actividad);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
