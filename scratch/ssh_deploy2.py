import pexpect
import sys

print("Connecting via SSH...")
child = pexpect.spawn('ssh -o StrictHostKeyChecking=no root@13.140.177.98', encoding='utf-8')

index = child.expect(['assword:', pexpect.EOF, pexpect.TIMEOUT], timeout=10)
if index == 0:
    child.sendline('Chewetech4321')
else:
    sys.exit(1)

child.expect(['# ', '\$ ', '> '], timeout=10)

command = """
cd /root/Chewe-Project
git fetch origin
git reset --hard origin/production
git clean -fd
cd backend
npm install
npm run build
pm2 restart chewe-backend
cd ..
npm install
npm run build
rm -rf /var/www/chewe-frontend/*
cp -r dist/* /var/www/chewe-frontend/
chown -R www-data:www-data /var/www/chewe-frontend
systemctl reload nginx
echo "DEPLOYMENT_MANUAL_SUCCESS"
"""
child.sendline(command)
index = child.expect(['DEPLOYMENT_MANUAL_SUCCESS', pexpect.EOF, pexpect.TIMEOUT], timeout=240)

print("OUTPUT:")
print(child.before)

child.sendline('exit')
