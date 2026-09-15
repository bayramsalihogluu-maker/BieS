# Kurulum

Bilgisayarına en etkili ve en az riskli Claude Code kurulumunu yapmak için. Gerekçeler `../GUVENLIK-RAPORU.md` içinde.

Kural: **az ama çalışan, çok ama çalışmayandan iyidir.** `awesome-claude-code-toolkit` 25 hook ve 14 MCP sunucusu vaat ediyor; hook'ların hiçbiri kurulduğu haliyle tetiklenmiyor, sunucuların 3'ü npm'de hiç yok, 6'sı deprecated. Aşağıdaki kurulum küçük, ama her parçası test edildi.

---

## 1 · Sır tarayıcı hook'u (önerilen)

Dosyaya API anahtarı, özel anahtar ya da token yazılmasını yazma anında engeller. Toolkit'teki sürümün üç hatası düzeltilmiş hali.

```bash
mkdir -p ~/.claude/hooks/scripts
cp kurulum/hooks/scripts/secret-scanner.js ~/.claude/hooks/scripts/
```

Sonra `~/.claude/settings.json` dosyanı aç ve `kurulum/settings-hooks.json` içindeki `hooks` anahtarını kendi dosyana ekle. Dosya yoksa oluştur:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/scripts/secret-scanner.js\"",
            "timeout": 10,
            "statusMessage": "Sir taramasi yapiliyor..."
          }
        ]
      }
    ]
  }
}
```

Zaten bir `hooks` anahtarın varsa, üzerine yazma; `PreToolUse` dizisine yeni bir eleman olarak ekle.

**Çalıştığını doğrula:**

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/tmp/t.js","content":"k=\"AKIAIOSFODNN7EXAMPLQ\""}}' \
  | node ~/.claude/hooks/scripts/secret-scanner.js; echo "exit=$?"
```

`permissionDecision: "deny"` ve `exit=2` görmelisin. Boş çıktı ve `exit=0` görüyorsan hook çalışmıyordur.

**Yanlış alarm verirse:** `your-api-key`, `example`, `<placeholder>` gibi örnek değerler zaten atlanıyor. Gerçek bir anahtarı bilerek yazman gerekiyorsa `settings.json` içinden hook'u geçici olarak çıkar.

---

## 2 · MCP sunucuları (ihtiyacın kadar)

`kurulum/mcp-guvenli.json` içinde sadece **var olduğu ve deprecated olmadığı doğrulanmış** üç sunucu var. İhtiyacın olanı projenin kökündeki `.mcp.json` dosyasına kopyala.

| Sunucu | Ne işe yarar | Risk |
|---|---|---|
| `filesystem` | Verdiğin klasörü okur/yazar | Verdiğin yolla sınırlı. **Dar tut**, `$HOME` verme. |
| `memory` | Oturumlar arası kalıcı hafıza | Diske yazar, hassas bilgi biriktirebilir. |
| `sequential-thinking` | Adım adım düşünme desteği | Dışarı bağlanmaz. En düşük risk. |

**Kurmadan önce her paketi doğrula:**

```bash
npm view @modelcontextprotocol/server-filesystem version
```

Hata alıyorsan (404) o paket yok demektir, **kurma.** `npx -y` var olmayan bir adı çağırıyorsa, o adı ileride kaydeden kişi senin makinende kod çalıştırabilir.

**Kurma:** `@anthropic/mcp-figma`, `@anthropic/mcp-ghidra`, `@anthropic/mcp-server-figma` (bu adlar npm'de yok, ayrıca Anthropic'in alanı `@anthropic-ai`), `@modelcontextprotocol/server-fetch`, `server-docker`, `server-sqlite`, `mcp-terraform`, `snyk-mcp-server`, `kubectl-mcp-app`.

**GitHub erişimi istiyorsan:** toolkit'in önerdiği `@modelcontextprotocol/server-github` deprecated. GitHub'ın kendi resmi sunucusu `github/github-mcp-server` deposunda; kurulum talimatını oradan al.

**Uzak MCP adresleri** (`mcp.bgpt.pro`, `heliumtrades.com`): kötü niyetli oldukları için değil, gönderdiğin verinin nereye gittiğini bilmediğin için listede yok. Gerçekten ihtiyacın varsa bilinçli ekle.

---

## 3 · Ajan Filosu (önerilen)

Paralel iş koşturma sistemi. Tamamen yerel, bağımlılıksız, ağ erişimi yok.

```bash
cd ajan-filosu
npm test
```

Sonra Claude Code'u `ajan-filosu/` klasöründe aç, `sen/01-isler.md` dosyasına işlerini yaz, `planla` de. Ayrıntı: `ajan-filosu/CALISTIR.md`.

---

## 4 · Toolkit'ten alınabilecekler

`rohitg00/awesome-claude-code-toolkit` deposunun Markdown içeriği (135 agent, 42 komut, 15 kural, 7 şablon, 120 eklenti) zararsız ve içinde işine yarayacak şeyler var. Riskli olan kod değil, kurulum tavsiyeleri.

Güvenli kullanım:

```bash
git clone https://github.com/rohitg00/awesome-claude-code-toolkit
cd awesome-claude-code-toolkit
```

Beğendiğin komutları elle kopyala:

```bash
cp commands/git/*.md ~/.claude/commands/git/
```

**`setup/install.sh` çalıştıracaksan:** hook sorusuna **hayır** de. O adım `~/.claude/hooks.json` dosyası oluşturur; Claude Code o dosyayı okumaz, üstelik içindeki şema da yanlıştır, yani hiçbir işe yaramaz. Diğer adımlar (komutlar, kurallar, şablonlar) sadece dosya kopyalar, zararsız.

**`hooks/scripts/smart-approve.py` kuracaksan** bilerek kur: bu betik senin yerine izin kararı verir. Kendi allow listen darsa faydalı, genişse riskli.

---

## Özet

| Yap | Yapma |
|---|---|
| Sır tarayıcıyı düzeltilmiş haliyle kur | Toolkit'in `hooks.json` dosyasını kurma, çalışmıyor |
| MCP paketlerini `npm view` ile doğrula | `npx -y` ile doğrulanmamış ad çağırma |
| `filesystem` yolunu dar tut | `$HOME` ya da `/` verme |
| Hook yollarını mutlak yaz | Göreli yol yazma, açtığın her depo kendi betiğini çalıştırır |
| Markdown içeriği serbestçe al | Uzak MCP adreslerini düşünmeden ekleme |
