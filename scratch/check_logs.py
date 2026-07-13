import pexpect

child = pexpect.spawn('ssh -o StrictHostKeyChecking=no root@13.140.177.98', encoding='utf-8')
index = child.expect(['assword:', pexpect.EOF, pexpect.TIMEOUT], timeout=10)
if index == 0:
    child.sendline('Chewetech4321')
    child.expect(['# ', '\$ ', '> '], timeout=10)
    child.sendline('pm2 logs chewe-backend --lines 100 --nostream')
    child.expect(['# ', '\$ ', '> '], timeout=10)
    print(child.before)
else:
    print("Failed to connect")
