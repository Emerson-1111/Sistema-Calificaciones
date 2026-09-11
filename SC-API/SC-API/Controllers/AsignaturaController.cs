using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;
using SC_API.DTOs;
using SC_API.Entidades;

namespace SC_API.Controllers
{
    [Route("api/Asignaturas")]
    [ApiController]
    public class AsignaturaController : ControllerBase
    {
        private readonly IOutputCacheStore outputCacheStore;
        private readonly ApplicationDbContext context;
        private readonly IMapper mapper;
        private const string cacheTag = "Asignaturas";

        public AsignaturaController(IOutputCacheStore outputCacheStore, ApplicationDbContext context, IMapper mapper)
        {
            this.outputCacheStore = outputCacheStore;
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet]
        [OutputCache(Tags = [cacheTag])]
        public async Task<List<AsignaturaDTO>> Get()
        {
            return await context.Asignaturas.ProjectTo<AsignaturaDTO>(mapper.ConfigurationProvider).ToListAsync();
        }

        [HttpGet("{id:int}", Name = "GetAsignaturaPorId")]
        [OutputCache(Tags = [cacheTag])]
        public async Task<ActionResult<AsignaturaDTO>> Get(int id)
        {
            // Aquí iría la lógica para obtener una asignatura específica desde la base de datos
            var asignatura = await context.Asignaturas
                .ProjectTo<AsignaturaDTO>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (asignatura == null)
            {
                return NotFound();
            }

            return asignatura;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] AsignaturaCreacionDTO asignaturaCreacionDTO)
        {
            // Aquí iría la lógica para crear una nueva asignatura en la base de datos
            var asignatura = mapper.Map<Asignatura>(asignaturaCreacionDTO);
            context.Add(asignatura);
            await context.SaveChangesAsync();
            await outputCacheStore.EvictByTagAsync(cacheTag, default);
            return CreatedAtRoute("GetAsignaturaPorId", new { id = asignatura.Id }, asignatura);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Put(int id, [FromBody] AsignaturaCreacionDTO asignaturaCreacionDTO)
        {
            var asignaturaExiste = await context.Asignaturas.AnyAsync(a => a.Id == id);

            if (!asignaturaExiste)
            {
                return NotFound();
            }

            var asignatura = mapper.Map<Asignatura>(asignaturaCreacionDTO);
            asignatura.Id = id;

            context.Update(asignatura);
            await context.SaveChangesAsync();
            await outputCacheStore.EvictByTagAsync(cacheTag, default);

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var asignaturaBorrada = await context.Asignaturas.Where(a => a.Id == id).FirstOrDefaultAsync();
            if (asignaturaBorrada == null)
            {
                return NotFound();
            }
            context.Remove(asignaturaBorrada);
            await context.SaveChangesAsync();
            await outputCacheStore.EvictByTagAsync(cacheTag, default);
            return NoContent();
        }
    }
}