using System.ComponentModel.DataAnnotations;

namespace SC_API.DTOs
{
    public class CalificacionCreacionDTO
    {
        [Required]
        public decimal PuntuacionObtenida { get; set; }

        public string ComentariosRetroalimentacion { get; set; }

        [Required]
        public int ActividadId { get; set; }

        [Required]
        public int EstudianteId { get; set; }
    }
}
