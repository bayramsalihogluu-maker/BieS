#!/usr/bin/env node
// UserPromptSubmit hook · girdine bakip ilgili skill'i hatirlatir.
//
// ONCE SUNU BIL: Claude Code skill'leri zaten kendiliginden secer. Secim,
// her skill'in frontmatter'indaki "description" alanina bakilarak yapilir ve
// yalniz aciklamalar baglama yuklenir, govdeler degil. Yani "kapsamli olsun
// ama gerekeni kullansin" davranisi yerlesik; onu saglayan sey iyi yazilmis
// aciklamalardir.
//
// Bu hook o mekanizmanin yerine gecmez, yanina ek bir durtme koyar. Pratikte
// ise yaradigi yer: alan diline ozgu tetikleyiciler ("fatura", "sozlesme",
// "migration") kisa bir aciklamaya sigmadiginda.
//
// Engellemez, karar vermez, yalniz bir satir baglam ekler. Kural dosyasi yoksa
// ya da bozuksa sessizce cikar; hicbir kosulda istemini bloke etmez.
//
// Kural dosyasi (proje once, sonra kullanici):
//   .claude/skill-kurallari.json
//   ~/.claude/skill-kurallari.json
//
// Bicim:
//   { "skill-adi": ["anahtar kelime", "duzenli ifade"] }

const fs = require("fs");
const path = require("path");
const os = require("os");

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function loadRules(cwd) {
  return (
    readJson(path.join(cwd, ".claude", "skill-kurallari.json")) ||
    readJson(path.join(os.homedir(), ".claude", "skill-kurallari.json")) ||
    null
  );
}

function main() {
  let raw = "";
  try {
    raw = fs.readFileSync(0, "utf8").trim();
  } catch {
    process.exit(0);
  }
  if (!raw) process.exit(0);

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const prompt = input.user_prompt || "";
  if (!prompt) process.exit(0);

  const rules = loadRules(input.cwd || process.cwd());
  if (!rules || typeof rules !== "object") process.exit(0);

  const matched = [];
  for (const [skill, patterns] of Object.entries(rules)) {
    if (!Array.isArray(patterns)) continue;
    for (const p of patterns) {
      let hit = false;
      try {
        hit = new RegExp(p, "i").test(prompt);
      } catch {
        // gecersiz regex: duz metin olarak ara
        hit = prompt.toLowerCase().includes(String(p).toLowerCase());
      }
      if (hit) {
        matched.push(skill);
        break;
      }
    }
  }

  if (matched.length === 0) process.exit(0);

  const context =
    `Bu istek şu skill'lerle eşleşiyor: ${matched.join(", ")}. ` +
    `İlgili olduğunu doğrularsan kullan; alakasızsa yok say, bu bir kural değil hatırlatmadır.`;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: context,
      },
    }) + "\n"
  );
  process.exit(0);
}

main();
