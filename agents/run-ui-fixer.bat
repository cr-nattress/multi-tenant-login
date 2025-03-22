@echo off
echo Running UI Error Fixer Agent...
cd %~dp0..
node agents/ui-error-fixer.js
pause
