import paramiko
import time

hostname = '13.140.177.98'
username = 'root'
password = 'Chewetech4321'

script = """
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5173/tcp
ufw allow 3000/tcp
ufw --force enable
ufw status
"""

print(f"Connecting to {hostname}...")

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=22, username=username, password=password, timeout=10)
    print("Connection established. Executing firewall rules...")

    stdin, stdout, stderr = client.exec_command(script, get_pty=True)
    
    # Wait for command to finish
    exit_status = stdout.channel.recv_exit_status()
    
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    
    if out:
        print(f"STDOUT: {out}")
    if err:
        print(f"STDERR: {err}")
        
    client.close()
    print("Firewall setup complete and connection closed.")
except Exception as e:
    print(f"Error: {e}")
