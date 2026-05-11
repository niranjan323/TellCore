using System.Data;
using CoreBackend.API.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace CoreBackend.API.Repositories;

public class DbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("CoreBackendDb")
            ?? throw new InvalidOperationException("Connection string 'CoreBackendDb' is not configured.");
    }

    public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
}
