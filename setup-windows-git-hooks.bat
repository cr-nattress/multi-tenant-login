@echo off
echo Setting up Git hooks for version management on Windows...

REM Create Windows-compatible batch files for hooks
echo @echo off > .git\hooks\pre-commit.cmd
echo node "%~dp0..\..\pre-commit.js" %%* >> .git\hooks\pre-commit.cmd
echo exit /b %%ERRORLEVEL%% >> .git\hooks\pre-commit.cmd

echo @echo off > .git\hooks\pre-push.cmd
echo node "%~dp0..\..\pre-push.js" %%* >> .git\hooks\pre-push.cmd
echo exit /b %%ERRORLEVEL%% >> .git\hooks\pre-push.cmd

echo Git hooks setup completed!
echo - pre-commit.cmd hook will increment patch version (1.0.x) for each commit
echo - pre-push.cmd hook will increment minor version (1.x.0) for each push
echo.
echo NOTE: On Windows, Git will use the .cmd extension hooks automatically.
