#!/usr/bin/env node
// PreToolUse hook · Write ve Edit icinde sizan sir (secret) arar.
//
// Bu dosya rohitg00/awesome-claude-code-toolkit icindeki secret-scanner.js'in
// duzeltilmis surumudur. Orijinali uc sebeple hicbir zaman calismiyordu:
//   1. Girdiyi process.argv[2] icinden okuyordu. Claude Code hook girdisini
//      stdin uzerinden JSON olarak verir, argv uzerinden degil. Bu yuzden
//      dosya yolu her zaman bos kaliyor ve script sessizce cikip hicbir sey
//      taramiyordu.
//   2. Diskteki dosyayi okuyordu. Write'ta dosya henuz yazilmamistir; taranmasi
//      gereken icerik tool_input.content icindedir. Yani yeni yazilan icerik
//      hicbir kosulda taranmiyordu.
//   3. {"decision":"block"} formatinda cikti veriyordu. Guncel sema
//      hookSpecificOutput.permissionDecision bekler; eski format yok sayilir,
//      yani bulsa bile engelleyemezdi.
//
// Engellemenin gecerli olmasi icin cikis kodu 2 kullanilir: dokumantasyona
// gore PreToolUse'u koda dayanarak durduran tek cikis kodu odur.

const fs = require("fs");
const path = require("path");

const PATTERNS = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "AWS Secret Key", regex: /aws_secret_access_key\s*=\s*["']?[A-Za-z0-9/+=]{40}/i },
  { name: "GitHub Token", regex: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/ },
  { name: "Anthropic API Key", regex: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: "OpenAI API Key", regex: /sk-(proj-)?[A-Za-z0-9]{32,}/ },
  { name: "Private Key", regex: /-----BEGIN (RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----/ },
  { name: "Generic API Key", regex: /api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9_-]{20,}["']/i },
  { name: "Slack Token", regex: /xox[bpors]-[0-9a-zA-Z-]{10,}/ },
  { name: "Database URL", regex: /(postgres|postgresql|mysql|mongodb|redis):\/\/[^:\s]+:[^@\s]+@/ },
  { name: "JWT Token", regex: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
];

const BINARY_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".pdf",
  ".woff", ".woff2", ".ttf", ".eot", ".zip", ".tar", ".gz", ".mp4", ".mp3",
]);

// Ornek/placeholder degerler gercek sir degildir, yanlis alarm uretmesin.
const PLACEHOLDER = /(example|placeholder|your[_-]?|dummy|sample|xxx+|<[^>]+>|\bfake\b|changeme)/i;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function contentToScan(toolName, toolInput) {
  // Write: icerik henuz diskte degil, tool_input.content icinde.
  if (toolName === "Write" && typeof toolInput.content === "string") {
    return toolInput.content;
  }
  // Edit: yalniz eklenen metni tara, dosyanin tamamini degil. Boylece zaten
  // var olan bir sir yuzunden alakasiz bir duzenleme engellenmez.
  if (toolName === "Edit" && typeof toolInput.new_string === "string") {
    return toolInput.new_string;
  }
  // Diger durumlarda diskteki halini dene.
  const filePath = toolInput.file_path || toolInput.filePath || "";
  if (!filePath) return null;
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function main() {
  const raw = readStdin().trim();
  if (!raw) process.exit(0);

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const toolName = input.tool_name || "";
  if (toolName !== "Write" && toolName !== "Edit") process.exit(0);

  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || toolInput.filePath || "";
  if (filePath && BINARY_EXTS.has(path.extname(filePath).toLowerCase())) {
    process.exit(0);
  }

  const content = contentToScan(toolName, toolInput);
  if (!content) process.exit(0);

  const lines = content.split("\n");
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (PLACEHOLDER.test(line)) continue;
    for (const { name, regex } of PATTERNS) {
      if (regex.test(line)) findings.push({ name, line: i + 1 });
    }
  }

  if (findings.length === 0) process.exit(0);

  const target = filePath ? path.basename(filePath) : "dosya";
  const reason =
    `${target} icinde sizmis olabilecek sir bulundu:\n` +
    findings.map((f) => `  - satir ${f.line}: ${f.name}`).join("\n") +
    `\nGercekten yazilmasi gerekiyorsa ortam degiskenine tasi ya da bu hook'u ` +
    `gecici olarak devre disi birak.`;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }) + "\n"
  );
  process.exit(2); // PreToolUse'u koda dayanarak durduran tek cikis kodu
}

main();
