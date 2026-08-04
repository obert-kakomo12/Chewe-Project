const { Client } = require('ssh2');

const conn = new Client();
const cmds = [
  'echo "=== PULLING LATEST CODE ==="',
  'cd /root/Chewe-Project',
  'git reset --hard',
  'git clean -fd',
  'git fetch origin',
  'git checkout production',
  'git pull origin production',
  'echo "=== BUILDING BACKEND ==="',
  'cd backend',
  'npm install',
  'npm run build',
  'pm2 restart chewe-backend --update-env',
  'echo "=== BUILDING FRONTEND ==="',
  'cd ..',
  'npm install',
  'npm run build',
  'mkdir -p /var/www/chewe-frontend',
  'cp -r dist/* /var/www/chewe-frontend/',
  'chown -R www-data:www-data /var/www/chewe-frontend',
  'systemctl reload nginx || true',
  'echo "=== ALL DEPLOYED SUCCESSFULLY ==="'
];

conn.on('ready', () => {
  console.log('SSH connection established. Executing deployment on server...');
  
  const combinedCmd = cmds.join(' && ');

  conn.exec(combinedCmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }

    stream.on('close', (code, signal) => {
      console.log(`\nDeployment finished with exit code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
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
