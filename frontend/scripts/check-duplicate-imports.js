#!/usr/bin/env node

/**
 * 🔍 Detector de Imports Duplicados
 * 
 * Script para escanear todos arquivos .js/.jsx e detectar imports duplicados
 * de qualquer módulo (especialmente @mui/material)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuração
const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.js', '.jsx'];

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Utilitários
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Encontrar todos arquivos JS/JSX
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorar node_modules e build
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
        findFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Analisar arquivo por imports duplicados
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const imports = {};
  const errors = [];

  lines.forEach((line, index) => {
    // Regex para detectar imports
    const importMatch = line.match(/import\s+(?:{[^}]*}|.*)\s+from\s+['"]([^'"]+)['"]/);
    
    if (importMatch) {
      const module = importMatch[1];
      const lineNumber = index + 1;

      if (!imports[module]) {
        imports[module] = [];
      }

      imports[module].push({ line: lineNumber, content: line.trim() });
    }
  });

  // Verificar duplicatas
  Object.entries(imports).forEach(([module, occurrences]) => {
    if (occurrences.length > 1) {
      errors.push({
        module,
        occurrences,
        count: occurrences.length,
      });
    }
  });

  return errors;
}

// Gerar relatório
function generateReport(results) {
  console.log('\n' + colorize('🔍 Relatório de Imports Duplicados', 'cyan'));
  console.log(colorize('═'.repeat(60), 'cyan') + '\n');

  let totalErrors = 0;
  let filesWithErrors = 0;

  results.forEach(({ file, errors }) => {
    if (errors.length > 0) {
      filesWithErrors++;
      totalErrors += errors.length;

      console.log(colorize(`\n📄 ${path.relative(SRC_DIR, file)}`, 'yellow'));
      
      errors.forEach(({ module, occurrences, count }) => {
        console.log(colorize(`  ❌ Módulo "${module}" importado ${count} vezes:`, 'red'));
        occurrences.forEach(({ line, content }) => {
          console.log(colorize(`     Linha ${line}: ${content}`, 'red'));
        });
      });
    }
  });

  console.log('\n' + colorize('═'.repeat(60), 'cyan'));
  
  if (totalErrors === 0) {
    console.log(colorize('✅ Nenhum import duplicado encontrado!', 'green'));
    console.log(colorize('   Todos os arquivos estão corretos.\n', 'green'));
  } else {
    console.log(colorize(`⚠️  Total: ${totalErrors} duplicatas em ${filesWithErrors} arquivo(s)`, 'yellow'));
    console.log(colorize('   Execute "npm run fix-imports" para corrigir automaticamente.\n', 'yellow'));
  }

  return totalErrors;
}

// Sugerir correção
function suggestFix(results) {
  console.log(colorize('\n💡 Sugestões de Correção:', 'blue'));
  console.log(colorize('─'.repeat(60), 'blue'));

  results.forEach(({ file, errors }) => {
    if (errors.length > 0) {
      console.log(colorize(`\n📝 ${path.relative(SRC_DIR, file)}:`, 'blue'));

      errors.forEach(({ module, occurrences }) => {
        console.log(colorize(`\n  Consolidar imports de "${module}":`, 'cyan'));
        
        // Coletar todos componentes importados
        const allComponents = new Set();
        occurrences.forEach(({ content }) => {
          const match = content.match(/import\s+{([^}]+)}/);
          if (match) {
            const components = match[1].split(',').map(c => c.trim());
            components.forEach(c => allComponents.add(c));
          }
        });

        if (allComponents.size > 0) {
          console.log(colorize('  import {', 'green'));
          Array.from(allComponents).sort().forEach((comp, i, arr) => {
            const comma = i < arr.length - 1 ? ',' : '';
            console.log(colorize(`    ${comp}${comma}`, 'green'));
          });
          console.log(colorize(`  } from '${module}';`, 'green'));
        }

        console.log(colorize(`\n  Remover linhas: ${occurrences.map(o => o.line).join(', ')}`, 'yellow'));
      });
    }
  });

  console.log('\n');
}

// Main
function main() {
  console.log(colorize('\n🚀 Iniciando verificação de imports duplicados...', 'cyan'));

  const files = findFiles(SRC_DIR);
  console.log(colorize(`   Analisando ${files.length} arquivo(s)...\n`, 'cyan'));

  const results = files.map((file) => ({
    file,
    errors: analyzeFile(file),
  }));

  const totalErrors = generateReport(results);

  if (totalErrors > 0) {
    suggestFix(results);
    process.exit(1); // Exit com erro para CI/CD
  } else {
    process.exit(0);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, findFiles };
