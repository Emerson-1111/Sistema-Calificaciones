using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SC_API.DTOs;
using SC_API.Entidades;

namespace SC_API.Controllers
{
    [Route("api/usuarios")]
    [ApiController]
    [Authorize]
    public class UsuarioController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsuarioController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<UsuarioDTO>>> GetUsuarios()
        {
            var usuarios = await _context.Usuarios.Include(u => u.Rol).ToListAsync();
            return usuarios.Select(u => new UsuarioDTO
            {
                Id = u.Id,
                Nombre = u.Nombre,
                Correo = u.Correo,
                RolId = u.RolId,
                RolNombre = u.Rol.Nombre
            }).ToList();
        }

        [HttpPost]
        public async Task<ActionResult> PostUsuario([FromBody] UsuarioCreacionDTO usuarioCreacionDTO)
        {
            var usuario = new Usuario
            {
                Nombre = usuarioCreacionDTO.Nombre,
                Correo = usuarioCreacionDTO.Correo,
                Password = usuarioCreacionDTO.Password, // Nota: Debería estar hasheada
                RolId = usuarioCreacionDTO.RolId
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok();
        }
        
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
