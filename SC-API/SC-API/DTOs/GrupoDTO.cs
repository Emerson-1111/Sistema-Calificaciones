namespace SC_API.DTOs
{
    public class GrupoDTO
    {
        public int Id { get; set; }
        public string NombreGrupo { get; set; }
        public string Periodo { get; set; }
        public int AsignaturaId { get; set; }
        public string AsignaturaNombre { get; set; }
        public int MaestroId { get; set; }
        public string MaestroNombre { get; set; }
    }
}
