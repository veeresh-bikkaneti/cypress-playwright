const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logFile = process.argv[2];
if (!logFile) {
    console.error('Usage: node log-output.js <log-file-path>');
    process.exit(1);
}

const logDir = path.dirname(logFile);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const writeStream = fs.createWriteStream(logFile, { flags: 'a' });

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false
});

rl.on('line', (line) => {
    const timestamp = new Date().toISOString();
    let level = 'INFO';

    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')) {
        level = 'ERROR';
    } else if (line.toLowerCase().includes('warn')) {
        level = 'WARN';
    }

    const formattedLine = `[${timestamp}] [${level}] ${line}\n`;

    process.stdout.write(line + '\n');
    writeStream.write(formattedLine);
});

rl.on('close', () => {
    writeStream.end();
});
