using System.ComponentModel.DataAnnotations;

namespace SC_API.DTOs
{
    public class InscripcionCreacionDTO
    {
        [Required]
        public int EstudianteId { get; set; }

        [Required]
        public int GrupoId { get; set; }
    }
}
