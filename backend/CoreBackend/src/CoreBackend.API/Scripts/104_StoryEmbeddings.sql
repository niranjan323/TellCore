-- Requires SQL Server 2025+ (native VECTOR type).
-- Embedding model: intfloat/multilingual-e5-small → 384 dimensions.
-- Searched with VECTOR_DISTANCE('cosine', ...) — brute force is fine at MVP scale;
-- add a DiskANN vector index when story volume grows.
IF OBJECT_ID('dbo.StoryEmbeddings','U') IS NULL
BEGIN
    CREATE TABLE dbo.StoryEmbeddings (
        Id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_StoryEmbeddings_Id DEFAULT NEWID(),
        CreatedAt  DATETIME2        NOT NULL CONSTRAINT DF_StoryEmbeddings_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt  DATETIME2        NULL,
        CreatedBy  UNIQUEIDENTIFIER NULL,
        UpdatedBy  UNIQUEIDENTIFIER NULL,
        IsDeleted  BIT              NOT NULL CONSTRAINT DF_StoryEmbeddings_IsDeleted DEFAULT 0,
        StoryId    UNIQUEIDENTIFIER NOT NULL,
        ChunkIndex INT              NOT NULL CONSTRAINT DF_StoryEmbeddings_ChunkIndex DEFAULT 0,
        ChunkText  NVARCHAR(1000)   NOT NULL,
        Embedding  VECTOR(384)      NOT NULL,
        CONSTRAINT PK_StoryEmbeddings PRIMARY KEY (Id),
        CONSTRAINT FK_StoryEmbeddings_Stories FOREIGN KEY (StoryId) REFERENCES dbo.Stories (Id)
    );
    CREATE UNIQUE INDEX UX_StoryEmbeddings_Story_Chunk
        ON dbo.StoryEmbeddings (StoryId, ChunkIndex) WHERE IsDeleted = 0;
END
GO
