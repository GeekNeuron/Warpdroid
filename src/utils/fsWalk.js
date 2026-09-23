'use strict';

const fs = require('fs');
const path = require('path');

function findFiles(root, predicate, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      findFiles(full, predicate, results);
    } else if (predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

module.exports = { findFiles };
