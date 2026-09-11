using System.ComponentModel.DataAnnotations;

namespace SC_API.DTOs
{
    public class AsignaturaDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Codigo { get; set; }
        public int Creditos { get; set; }
    }
}
