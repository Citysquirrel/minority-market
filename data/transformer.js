const { typeConfig } = require('./transformer.config');
const { readFile, writeFile } = require('fs').promises;
const exec = require('child_process').exec;

const attrs = {};
let result = `:root {\n  `;

(async () => {
  const tokens = await readFile('./data/output.json');
  const tokenObject = JSON.parse(tokens.toString());

  addTokenLine(tokenObject, '-');

  const attrKey = Object.keys(attrs);
  attrKey.forEach((v) => {
    result += `/* ${v} */\n  ${attrs[v]}`;
  });
  result += '}';
  writeFile('./src/global-style.css', result);
  //   exec('npm run lint-style', (err, stdout, stderr) => {
  //     console.log('stdout: ' + stdout);
  //     console.log('stderr: ' + stderr);
  //     if (err !== null) {
  //       console.log('exec error!: ' + err);
  //     }
  //   });
})();

//! 재귀함수 시작
function addTokenLine(obj, str) {
  if (typeof obj === 'string') return;

  const objectKeys = Object.keys(obj);
  if (objectKeys.length === 0) return;

  for (let i = 0; i < objectKeys.length; i++) {
    const key = objectKeys[i];
    if (key === 'value') {
      if (!typeConfig[obj.type]) return;
      else {
        if (!attrs[obj.type]) {
          attrs[obj.type] = '';
        }
      }

      //? modding the name
      const modifiedName = str.toLowerCase().replaceAll(' ', '-'); //! 노드 버전 주의
      //? modding the value
      const modifiedValue = modValue(obj[key], obj.type);
      attrs[obj.type] += `${modifiedName}: ${modifiedValue};\r  `;
      return;
    }
    addTokenLine(obj[key], `${str}-${key}`);
  }
}

function modValue(value, type) {
  if (type === 'fontFamilies') return `'${value}'`;

  if (typeof value === 'object') {
    if (value.type === 'dropShadow') {
      return makeTextForStylesheet(value, value.type);
    }
    if (Array.isArray(value)) {
      let temp = '';
      value.forEach((v, i) => {
        temp += `${makeTextForStylesheet(v, v.type)}, `;
      });
      return temp.substring(0, temp.length - 2);
    }
  }
  return value;
}

function makeTextForStylesheet(value, type) {
  switch (type) {
    case 'dropShadow':
      return `${value.x}px ${value.y}px ${value.blur}px ${value.spread}px ${value.color}`;

    default:
      return 'SomethingWrong!';
  }
}
