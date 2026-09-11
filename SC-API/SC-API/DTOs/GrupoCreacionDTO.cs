using System.ComponentModel.DataAnnotations;

namespace SC_API.DTOs
{
    public class GrupoCreacionDTO
    {
        [Required]
        [MaxLength(50)]
        public string NombreGrupo { get; set; }

        [Required]
        [MaxLength(50)]
        public string Periodo { get; set; }

        [Required]
        public int AsignaturaId { get; set; }

        [Required]
        public int MaestroId { get; set; }
    }
}
