namespace SC_API.DTOs
{
    public class CalificacionDTO
    {
        public int Id { get; set; }
        public decimal PuntuacionObtenida { get; set; }
        public string ComentariosRetroalimentacion { get; set; }
        public int ActividadId { get; set; }
        public int EstudianteId { get; set; }
        public string EstudianteNombre { get; set; }
    }
}
