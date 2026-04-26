const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDirectory = path.resolve(__dirname, "..");
const certDirectory = path.join(rootDirectory, ".cert");
const certPath = path.join(certDirectory, "localhost-cert.pem");
const keyPath = path.join(certDirectory, "localhost-key.pem");
const pfxPath = path.join(certDirectory, "localhost.pfx");
const pfxPassphrasePath = path.join(certDirectory, "localhost-passphrase.txt");
const configPath = path.join(certDirectory, "openssl-localhost.cnf");
const pfxPassphrase = `recall-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const opensslConfig = `
[req]
default_bits = 2048
distinguished_name = req_distinguished_name
prompt = no
x509_extensions = v3_req

[req_distinguished_name]
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
`;

function runOpenSsl() {
  return childProcess.spawnSync("openssl", [
    "req",
    "-x509",
    "-nodes",
    "-newkey",
    "rsa:2048",
    "-sha256",
    "-days",
    "825",
    "-keyout",
    keyPath,
    "-out",
    certPath,
    "-config",
    configPath
  ], {
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true
  });
}

function runPowerShellCertificateExport() {
  const script = `
$ErrorActionPreference = "Stop"
$certPath = "${pfxPath.replace(/\\/g, "\\\\")}"
$passphrasePath = "${pfxPassphrasePath.replace(/\\/g, "\\\\")}"
$passphrase = "${pfxPassphrase}"
$securePassphrase = ConvertTo-SecureString -String $passphrase -Force -AsPlainText
$cert = New-SelfSignedCertificate -Subject "CN=localhost" -CertStoreLocation "Cert:\\CurrentUser\\My" -KeyAlgorithm RSA -KeyLength 2048 -HashAlgorithm SHA256 -NotAfter (Get-Date).AddDays(825) -KeyExportPolicy Exportable -TextExtension @("2.5.29.17={text}DNS=localhost&IPAddress=127.0.0.1")
Export-PfxCertificate -Cert $cert -FilePath $certPath -Password $securePassphrase | Out-Null
Set-Content -Path $passphrasePath -Value $passphrase -NoNewline
Remove-Item -Path ("Cert:\\CurrentUser\\My\\" + $cert.Thumbprint) -Force
`;

  return childProcess.spawnSync("powershell", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script
  ], {
    encoding: "utf8",
    stdio: "pipe",
    windowsHide: true
  });
}

fs.mkdirSync(certDirectory, { recursive: true });
fs.writeFileSync(configPath, opensslConfig.trimStart(), "utf8");

const result = runOpenSsl();
if (!result.error && result.status === 0) {
  console.log(`Created ${certPath}`);
  console.log(`Created ${keyPath}`);
  console.log("This certificate is self-signed for localhost. Your browser may ask you to trust it.");
  process.exit(0);
}

if (process.platform === "win32") {
  const fallbackResult = runPowerShellCertificateExport();
  if (!fallbackResult.error && fallbackResult.status === 0) {
    console.log(`Created ${pfxPath}`);
    console.log(`Created ${pfxPassphrasePath}`);
    console.log("This certificate is self-signed for localhost. Your browser may ask you to trust it.");
    process.exit(0);
  }

  const fallbackDetails = fallbackResult.error ? fallbackResult.error.message : fallbackResult.stderr;
  if (fallbackDetails) {
    console.error("PowerShell certificate fallback failed.");
    console.error(fallbackDetails.trim());
  }
}

const details = result.error ? result.error.message : result.stderr;
console.error("Could not create a local HTTPS certificate.");
console.error("Install OpenSSL, then run npm run cert again.");
if (details) {
  console.error(details.trim());
}
process.exit(1);
