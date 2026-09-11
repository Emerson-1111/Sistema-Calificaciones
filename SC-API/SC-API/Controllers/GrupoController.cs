using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SC_API.DTOs;
using SC_API.Entidades;

namespace SC_API.Controllers
{
    [Route("api/grupos")]
    [ApiController]
    [Authorize]
    public class GrupoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GrupoController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<GrupoDTO>>> GetGrupos()
        {
            var grupos = await _context.Grupos
                .Include(g => g.Asignatura)
                .Include(g => g.Maestro)
                .ToListAsync();

            return grupos.Select(g => new GrupoDTO
            {
                Id = g.Id,
                NombreGrupo = g.NombreGrupo,
                Periodo = g.Periodo,
                AsignaturaId = g.AsignaturaId,
                AsignaturaNombre = g.Asignatura.Nombre,
                MaestroId = g.MaestroId,
                MaestroNombre = g.Maestro.Nombre
            }).ToList();
        }

        [HttpPost]
        public async Task<ActionResult> PostGrupo([FromBody] GrupoCreacionDTO grupoCreacionDTO)
        {
            var grupo = new Grupo
            {
                NombreGrupo = grupoCreacionDTO.NombreGrupo,
                Periodo = grupoCreacionDTO.Periodo,
                AsignaturaId = grupoCreacionDTO.AsignaturaId,
                MaestroId = grupoCreacionDTO.MaestroId
            };

            _context.Grupos.Add(grupo);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteGrupo(int id)
        {
            var grupo = await _context.Grupos.FindAsync(id);
            if (grupo == null)
            {
                return NotFound();
            }

            _context.Grupos.Remove(grupo);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
