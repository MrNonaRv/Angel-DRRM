Set WshShell = CreateObject("WScript.Shell")
' Run the run.bat file hidden
' 0 = hidden, True = wait for completion
WshShell.Run chr(34) & "run.bat" & chr(34), 0, False
