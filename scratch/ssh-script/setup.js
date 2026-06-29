const { Client } = require('ssh2');

const conn = new Client();
const cmds = [
  'ufw --force reset', // Reset first to clear any old rules
  'ufw default deny incoming',
  'ufw default allow outgoing',
  'ufw allow 22/tcp',
  'ufw allow 80/tcp',
  'ufw allow 443/tcp',
  'ufw allow 5173/tcp',
  'ufw allow 3000/tcp',
  'ufw --force enable',
  'ufw status'
];

conn.on('ready', () => {
  console.log('SSH connection established. Executing firewall configuration...');
  
  // Combine commands with && to ensure they run sequentially and fail-fast
  const combinedCmd = cmds.join(' && ');

  conn.exec(combinedCmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code, signal) => {
      console.log(`Stream closed with code ${code} and signal ${signal}`);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: '13.140.177.98',
  port: 22,
  username: 'root',
  password: 'Chewetech4321'
});
