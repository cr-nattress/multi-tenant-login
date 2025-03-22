@echo off
echo Setting up Git hooks for version management...

REM Ensure the hooks are executable on Windows
copy .git\hooks\pre-commit .git\hooks\pre-commit.js
copy .git\hooks\pre-push .git\hooks\pre-push.js

REM Create batch files that will call the Node.js scripts
echo @echo off > .git\hooks\pre-commit
echo node "%~dp0pre-commit.js" %* >> .git\hooks\pre-commit

echo @echo off > .git\hooks\pre-push
echo node "%~dp0pre-push.js" %* >> .git\hooks\pre-push

echo Git hooks setup completed!
echo - pre-commit hook will increment patch version (1.0.x) for each commit
echo - pre-push hook will increment minor version (1.x.0) for each push
