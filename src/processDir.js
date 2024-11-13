import fs from 'fs';
import readline from 'readline';
import path from 'path';

// Get command line arguments
const [filename, id, name, omitStart, omitEnd] = process.argv.slice(2);

// Validate arguments
if (!filename || isNaN(id) || !name || isNaN(omitStart) || isNaN(omitEnd)) {
    console.log(`
Usage: node src/processDir.js <filename> <id> <name> <omitStart> <omitEnd>
filename: the input file
id: unique id 
name: name of the directory
omitStart: number of segments to be omitted from start 
omitEnd: number of segments to be omitted from end
`);
    process.exit(1);
}

// Define the input file path
const inputFilePath = path.join(process.cwd(), filename);

// Create a ReadStream
const fileStream = fs.createReadStream(inputFilePath);

// Create a readline interface
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

// Function to print header 
const printHeader = (id, name) => {
    console.log(`HMSET DIRINDEX:DIR:${id} name "${name}" model "What brand" capacity: "What size" description "What purpose"`)
    console.log()
}

// Function to print segments of the path after omitting specified segments
const printPathSegments = (line, id, name, omitStart, omitEnd) => {
    const parts = line.split(path.sep);

    // Calculate the segments to keep
    const startIdx = parseInt(omitStart, 10);
    const endIdx = parts.length - parseInt(omitEnd, 10);

    // Ensure indices are within valid range
    const selectedParts = parts.slice(startIdx, endIdx);

    // Print each segment
    selectedParts.forEach((part, index) => {
        console.log(`ZADD "DIRINDEX:INDEX:${part.toUpperCase()}" ${id} "\\\\\\\\${name}${line.substring(2).replace(/\\/g, '\\\\')}"`)
    });
};

// Print the header 
printHeader(id, name)

// Read the file line by line
rl.on('line', (line) => {
    // Start processing... 
    printPathSegments(line, id, name, omitStart, omitEnd);
    console.log()
});

// Handle the end of the file
rl.on('close', () => {
    // Finished processing the file.
});

/*
   dir /S /B | findstr /V /R /C:"\\\." | findstr /V /R /C:"\\node_modules" | findstr /V /R /C:"\.tmp"

   node src/processDir.js data/TV-500M.dir.txt 1 TV-500M 2 0 > data/TV-500M.redis
   node src/processDir.js data/TV-1T.dir.txt 2 TV-1T 2 0 > data/TV-1T.redis
   node src/processDir.js data/TV-2T.dir.txt 3 TV-2T 2 0 > data/TV-2T.redis
   node src/processDir.js data/TV-5T.dir.txt 4 TV-5T 2 0 > data/TV-5T.redis
*/