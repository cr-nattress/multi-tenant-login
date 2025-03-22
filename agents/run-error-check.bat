@echo off
echo Running Frontend Error Check Agent...
cd %~dp0..
node agents/scripts/frontend-error-check.js
pause
