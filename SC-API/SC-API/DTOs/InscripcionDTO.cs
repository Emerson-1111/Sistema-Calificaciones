namespace SC_API.DTOs
{
    public class InscripcionDTO
    {
        public int Id { get; set; }
        public DateTime FechaInscripcion { get; set; }
        public int EstudianteId { get; set; }
        public string EstudianteNombre { get; set; }
        public int GrupoId { get; set; }
        public string GrupoNombre { get; set; }
    }
}
