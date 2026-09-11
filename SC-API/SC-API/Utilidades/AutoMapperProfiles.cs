using AutoMapper;
using SC_API.DTOs;
using SC_API.Entidades;

namespace SC_API.Utilidades
{
    public class AutoMapperProfiles: Profile
    {
        public AutoMapperProfiles()
        {
            ConfigurarMapeoAsignatura();   
        }

        private void ConfigurarMapeoAsignatura()
        {
            CreateMap<AsignaturaCreacionDTO, Asignatura>();
            CreateMap<Asignatura, AsignaturaDTO>();
        }
    }
}
