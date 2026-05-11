using System.Data;

namespace CoreBackend.API.Repositories.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
