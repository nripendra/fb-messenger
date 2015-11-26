@ECHO OFF
cmd /s /c "Taskkill /f /im %1 & PING -n 2 127.0.0.1>nul & START "" "%~dp0\%2">nul"
EXIT