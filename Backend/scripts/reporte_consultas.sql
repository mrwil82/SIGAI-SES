-- =============================================================================
-- SIGAI-SES - Reporte de consumo de consultas (memoria y llamadas)
-- =============================================================================
-- Requiere PostgreSQL local (ver docker-compose.postgres.yml) con
-- shared_preload_libraries=pg_stat_statements ya habilitado.
--
-- Ejecutar:
--   Windows:  Get-Content scripts/reporte_consultas.sql | docker exec -i sigai-pg psql -U sigai -d sigai_ses
--   Linux:    docker exec -i sigai-pg psql -U sigai -d sigai_ses < scripts/reporte_consultas.sql
--
-- Nota: las estadisticas acumulan desde el inicio; usa la seccion S3 para
-- reiniciarlas y medir una sesion de trabajo especifica.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- -----------------------------------------------------------------------------
-- S1. Consultas con MAS llamadas (causa de "muchas peticiones" a la BD)
--     Un numero alto de calls en readonly indica clientes re-fetcheando datos
--     que ya deberian estar en cache (React Query, prefetch, etc.)
-- -----------------------------------------------------------------------------
SELECT
    calls,
    round(mean_exec_time::numeric, 2)        AS tiempo_ms_prom,
    round(total_exec_time::numeric / 1000, 2) AS tiempo_s_total,
    shared_blks_hit + shared_blks_read       AS buffers_memoria,
    round((shared_blks_read::numeric / NULLIF(shared_blks_hit + shared_blks_read, 0) * 100), 1) AS pct_lectura_disco,
    left(query, 110)                         AS consulta
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 25;

-- -----------------------------------------------------------------------------
-- S2. Consultas que consumen MAS memoria (buffers) en total
--     Alto shared_blks_read = consulta que lee desde disco cada vez
--     (candidata a cache, indice o paginado).
-- -----------------------------------------------------------------------------
SELECT
    calls,
    total_exec_time::numeric / 1000          AS tiempo_s_total,
    shared_blks_hit + shared_blks_read       AS buffers_memoria,
    shared_blks_read                         AS buffers_desde_disco,
    left(query, 110)                         AS consulta
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
ORDER BY (shared_blks_hit + shared_blks_read) DESC
LIMIT 25;

-- -----------------------------------------------------------------------------
-- S3. Conexiones actuales a la base (pool de SQLAlchemy)
-- -----------------------------------------------------------------------------
SELECT
    count(*) FILTER (WHERE state = 'active') AS conexiones_activas,
    count(*) FILTER (WHERE state = 'idle')   AS conexiones_idle,
    count(*)                                 AS conexiones_totales
FROM pg_stat_activity
WHERE datname = current_database();

-- -----------------------------------------------------------------------------
-- S4. Usuarios/clientes con mas consultas (si hay varios servicios conectados)
-- -----------------------------------------------------------------------------
SELECT
    usename,
    count(*) AS consultas_registradas,
    round(sum(mean_exec_time * calls)::numeric / 1000, 2) AS tiempo_s_total
FROM pg_stat_statements s
JOIN pg_authid a ON s.userid = a.oid
GROUP BY usename
ORDER BY consultas_registradas DESC;

-- -----------------------------------------------------------------------------
-- S5. (OPCIONAL) Reiniciar estadisticas para medir solo una sesion
--     Descomenta y ejecuta ANTES de tu sesion de pruebas:
-- -----------------------------------------------------------------------------
-- SELECT pg_stat_statements_reset();
