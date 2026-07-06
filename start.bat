@echo off
echo ============================================
echo   AutoFlow - Starting All Services
echo ============================================
echo.

REM Step 0: Start Docker Desktop if not running
echo [0/3] Checking Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo   Docker Desktop is not running. Starting it now...
    start "" "C:\Users\AUSU\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
    echo   Waiting for Docker to be ready...
    :wait_docker
    timeout /t 3 >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 goto wait_docker
    echo   Docker Desktop is ready!
) else (
    echo   Docker Desktop is already running.
)
echo.

REM Step 1: Start Docker containers
echo [1/3] Starting PostgreSQL ^& Redis...
docker compose -f "C:\Users\AUSU\Desktop\autoflow-platform\docker\docker-compose.yml" up -d postgres redis
echo   Databases started.
echo.

REM Step 2: Start Backend
echo [2/3] Starting API server (port 3001)...
start "AutoFlow Server" cmd /c "cd /d C:\Users\AUSU\Desktop\autoflow-platform\server && npm run dev"
echo   Backend starting...
echo.

REM Step 3: Start Frontend
echo [3/3] Starting frontend (port 5173)...
start "AutoFlow Frontend" cmd /c "cd /d C:\Users\AUSU\Desktop\autoflow-platform\web && npx vite --host --port 5173 --open"
echo   Frontend starting...
echo.

echo ============================================
echo   All services started!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:3001
echo   PostgreSQL: localhost:5432
echo   Redis:      localhost:6380
echo ============================================
echo.
echo Close this window or press any key to exit.
pause >nul
