@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS from https://nodejs.org first.
  pause
  exit /b 1
)
call npx --yes vercel@latest --prod
if errorlevel 1 (
  echo Deployment failed. Review the message above and try again.
) else (
  echo Open the AI connection tab on your site and enter your OpenAI API key.
)
pause
