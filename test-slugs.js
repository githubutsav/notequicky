const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'content');
const files = fs.readdirSync(dir);
console.log(files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')));
