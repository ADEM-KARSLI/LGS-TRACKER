// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawnSync } = require('child_process');
const inputData = 'protocol=https\nhost=github.com\n\n';
const cmds = [
  ['git', 'config', '--get', 'credential.helper'],
  ['git', 'config', '--get-all', 'credential.helper'],
  ['git', 'credential-manager-core', 'get'],
  ['git', 'credential-manager', 'get'],
];
for (const cmd of cmds) {
  const proc = spawnSync(cmd[0], cmd.slice(1), { input: inputData, encoding: 'utf8' });
  console.log('CMD>', cmd.join(' '));
  console.log('STDOUT:\n' + (proc.stdout || '<none>'));
  console.error('STDERR:\n' + (proc.stderr || '<none>'));
}
