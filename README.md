### DirectoryIndex


**Command to Exclude Files and Directories Starting with a dot and node_modules**

```
dir /S /B | findstr /V /R /C:"\\\." | findstr /V /R /C:"\\node_modules" | findstr /V /R /C:"\.tmp"
```
dir /S /B | findstr /V /R /C:"\\\." | findstr /V /R /C:"\\node_modules" | findstr /V /R /C:"\.tmp" > output.dir.txt


Explanation
- /S: Includes all files and directories in subdirectories.
- /B: Uses bare format (just the names of files and directories).
- findstr /V /R /C:"\\\.": Filters out lines containing a backslash followed by a dot, effectively excluding hidden files and directories.
- findstr /V /R /C:"\\node_modules\\: Filters out lines containing node_modules, excluding any paths that include "node_modules" directories.
- findstr /V /R /C:"\.tmp\\: Filters out lines containing .tmp, excluding any paths that include ".tmp" extensioon

```

