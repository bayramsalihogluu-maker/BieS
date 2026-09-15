# Kurulum · kapsamlı ama verimli

Hedef: her şey elinin altında olsun, ama sen bir şey yazdığında yalnız o işe yarayan yüklensin.

Bu ikisi çelişmiyor. Çelişki sanılmasının sebebi, çoğu "mega toolkit"in yanlış katmanı şişirmesi.

---

## Önce mekanizmayı anla, yoksa yanlış şeyi kurarsın

Claude Code'da her şeyin maliyeti aynı değil. İki grup var:

| | Ne zaman yüklenir | Maliyeti |
|---|---|---|
| **CLAUDE.md** | Her istekte, tamamı | Sabit. Her mesajda ödersin. |
| **MCP araç şemaları** | Her istekte, tamamı | Sabit. Sunucu başına ödersin. |
| **Skill açıklamaları** | Her istekte, yalnız `description` satırı | Sabit ama çok küçük (skill başına ~20-50 token) |
| **SKILL.md gövdesi** | **Yalnız o skill seçilince** | Sıfır, kullanılmadıkça |
| **Subagent istemi** | Yalnız o subagent çağrılınca, ayrı bağlamda | Sıfır, ana bağlamı kirletmez |
| **Slash komut gövdesi** | Yalnız sen çağırınca | Sıfır |

**Senin istediğin davranış yerleşik.** "Bir input verdiğimde kendisi ayıklasın" diye tarif ettiğin şey, skill seçimi: Claude yalnız açıklamaları görür, işe uyanın gövdesini açar. 100 skill eklemek, 100 açıklama kadar yer kaplar, 100 gövde kadar değil.

Bundan iki sonuç çıkar:

1. **Kapsamı skill olarak ekle.** Ne kadar eklersen ekle, sabit maliyetin neredeyse değişmez.
2. **CLAUDE.md'ye ve MCP'ye dokunurken cimri ol.** Buradaki her satır her mesajda ödenir.

`awesome-claude-code-toolkit` gibi paketlerin sorunu içeriğin kötü olması değil; 135 ajanı ve 120 eklentiyi tek seferde kurmaya çağırması. Doğru kurulduğunda (skill/eklenti olarak) bu zaten sorun değil, yanlış kurulduğunda (CLAUDE.md'ye ve hepsi açık MCP'ye) sabit maliyetini uçurur.

Ölçmek için: `node kurulum/scripts/baglam-denetci.mjs` (aşağıda).

---

## Katman 0 · CLAUDE.md'yi ince tut

Bu dosya her istekte yükleniyor. Testi şu: **"Claude bunu bilmezse hata yapar mı?"** Cevap hayırsa oraya ait değil.

- Ait olan: "migration dosyalarını elle düzenleme", "testler `pnpm test` ile koşar", "API cevapları snake_case".
- Ait olmayan: nasıl kod yazılacağına dair genel öğütler, uzun stil kılavuzları, araç listeleri. Bunlar skill olur.

Başlangıç şablonu: `CLAUDE.md.sablon`. Hedef 500 token altı. `/init` ile üretip sonra budamak iyi bir yoldur.

---

## Katman 1 · Anthropic'in resmi eklenti dizini (ana kaynak)

Rastgele GitHub depolarından elle parça toplamana gerek yok. Anthropic'in **kürate edilmiş, Claude Code içinden kurulan** bir dizini var: `anthropics/claude-plugins-official`. 39 birinci parti eklenti ve 14 entegrasyon.

```
/plugin marketplace add anthropics/claude-plugins-official
/plugin install code-review@claude-plugins-official
```

Ya da `/plugin > Discover` ile tarayarak.

Öne çıkanlar:

| Eklenti | Ne yapıyor |
|---|---|
| `code-review`, `pr-review-toolkit` | Kod ve PR incelemesi |
| `feature-dev` | Özellik geliştirme akışı |
| `claude-security`, `security-guidance` | Güvenlik incelemesi ve rehberlik |
| `code-simplifier`, `code-modernization` | Sadeleştirme, modernizasyon |
| `commit-commands` | Commit ve git akışı |
| `frontend-design` | Arayüz çalışmaları |
| `skill-creator` | Kendi skill'ini yazdırmak için |
| `plugin-dev`, `hookify` | Eklenti ve hook üretimi |
| `claude-md-management` | CLAUDE.md'yi derli toplu tutmak |
| `session-report` | Oturum özeti |
| `*-lsp` (11 dil) | TypeScript, Python, Rust, Go, Java, C#, Kotlin, Swift, PHP, Ruby, Lua için dil sunucusu |

Entegrasyonlar (`external_plugins/`): github, gitlab, linear, asana, playwright, terraform, firebase, context7, serena, discord, telegram, imessage, laravel-boost.

**Neden burayı tercih et:** eklentiler Anthropic tarafından derleniyor, dış katkılar kalite ve güvenlik incelemesinden geçiyor. Yine de deponun kendi uyarısı yerinde duruyor: *Anthropic üçüncü taraf eklentilerin içeriğini denetlemez, kurmadan önce güvendiğinden emin ol.* LSP eklentileri yerel dil sunucusu indirir, entegrasyonlar dış servise bağlanır.

---

### `/plugin` çalışmıyorsa

Bazı ortamlarda eklenti sistemi kapalı: `Plugins aren't available in this environment`. **Sorun değil, eklentiye ihtiyacın yok.**

Skill'ler eklenti sisteminden bağımsızdır: `~/.claude/skills/<ad>/SKILL.md` yolundaki her skill Claude Code tarafından **kendiliğinden keşfedilir.** Ne pazar yeri, ne kurulum adımı, ne `settings.json` kaydı gerekir.

```bash
git clone https://github.com/obra/superpowers
node kurulum/skill-kur.mjs superpowers              # önce göster
node kurulum/skill-kur.mjs superpowers --uygula     # sonra kur
```

Betik her skill'in adını ve ne işe yaradığını listeler, zaten kurulu olanlara dokunmaz, kurulum sonrası hepsinin hedefte okunabilir olduğunu doğrular.

Denemeye değer iki alternatif daha (uygulama içi `/plugin` kapalıyken terminalden çalışabiliyor):

```bash
claude plugin marketplace add anthropics/claude-plugins-official
claude --plugin-dir ./bir-eklenti-klasoru
```

Eklentisiz kurulumda kaybettiğin tek şey, Superpowers'ın her oturum başında `using-superpowers` skill'ini zorla bağlama enjekte eden `SessionStart` hook'u. O skill de kurulu olduğu ve açıklaması "Use when starting any conversation" dediği için pratikte yine devreye giriyor, sadece garantili değil zamanlaması.

---

## Katman 2 · Superpowers (yöntem katmanı)

`obra/superpowers` · 14 skill, yazılım geliştirmenin tamamını kapsayan bir yöntem: beyin fırtınası → plan yazma → plan uygulama → subagent'larla geliştirme → TDD → kod incelemesi → bitirmeden doğrulama.

Senin istediğin davranışın tam örneği: skill'ler kendiliğinden tetikleniyor, sen bir şey çağırmıyorsun.

```
/plugin marketplace add obra/superpowers
/plugin install superpowers@superpowers
```

Denetlediğim kadarıyla:

- Skill ve hook betiklerinde **dışarıya veri gönderen çağrı yok.**
- `hooks.json` **doğru üç katmanlı şemayı** ve `${CLAUDE_PLUGIN_ROOT}` mutlak yer tutucusunu kullanıyor. (Karşılaştırma: `awesome-claude-code-toolkit` ikisini de yanlış yapıyor, o yüzden hook'ları hiç çalışmıyor.)
- **Telemetri var, açıkça yazılmış:** `brainstorming` skill'inin *isteğe bağlı* görsel eşlikçisindeki logo kendi sitelerinden yükleniyor ve kullanılan Superpowers sürümünü taşıyor. Projen, istemin ya da tıklamaların gönderilmiyor. Kapatmak için:

```bash
export SUPERPOWERS_DISABLE_TELEMETRY=1
```

Claude Code'un kendi `DISABLE_TELEMETRY` ve `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` ayarlarına da uyuyor.

---

## Katman 3 · Hook'lar (kesin kurallar)

Skill'ler olasılıklıdır, model karar verir. Hook'lar kesindir, kod karar verir. Pazarlık edilemez şeyler buraya.

### 3a · Sır tarayıcı (önerilen) · betikle

Dosyaya API anahtarı, özel anahtar ya da token yazılmasını yazma anında engeller.

**Varsayılan kuru koşudur: ne yapacağını yazar, hiçbir şeye dokunmaz.**

```bash
node kurulum/kur.mjs                        # önce göster
node kurulum/kur.mjs --uygula               # sonra uygula
node kurulum/kur.mjs --uygula --yonlendirici   # skill yönlendiricisini de kur
```

Betiğin garantileri:

- `settings.json` **üzerine yazmaz.** Var olan JSON'ı okur, yalnız `hooks` anahtarını birleştirir, önce zaman damgalı yedek alır. Mevcut `model`, `permissions` ve diğer hook'ların yerinde kalır.
- **Idempotent.** İki kez çalıştırmak aynı hook'u iki kez eklemez.
- `settings.json` bozuksa **hiçbir şeye dokunmadan** çıkar. Bozuk bir dosyayı ayrıştırıp üzerine yazmak ayarları kaybettirir.
- Kurulum sonrası sır tarayıcıyı gerçek bir girdiyle test eder. Geçmezse "kuruldu" demez, hata koduyla biter.

Elle yapmak istersen `settings-hooks.json` içindeki `hooks` anahtarını kendi `~/.claude/settings.json` dosyana ekle, sonra doğrula:

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/tmp/t.js","content":"k=\"AKIAIOSFODNN7EXAMPLQ\""}}' \
  | node ~/.claude/hooks/scripts/secret-scanner.js; echo "exit=$?"
```

`permissionDecision: "deny"` ve `exit=2` görmelisin.

> Bu, `awesome-claude-code-toolkit` içindeki aynı isimli betiğin düzeltilmiş halidir. Orijinali üç ayrı hata yüzünden hiçbir şey taramıyordu; ayrıntısı `../GUVENLIK-RAPORU.md`.

### 3b · Skill yönlendirici (isteğe bağlı)

`skill-yonlendirici.js`, yazdığın isteme bakıp eşleşen skill'i hatırlatır. Engellemez, sadece bir satır bağlam ekler.

**Buna çoğu zaman ihtiyacın yok:** skill seçimi zaten açıklamalar üzerinden çalışıyor. İşe yaradığı yer, alan diline özgü tetikleyicilerin ("fatura", "sözleşme", "migration") kısa bir açıklamaya sığmadığı durumlar.

```bash
cp kurulum/hooks/scripts/skill-yonlendirici.js ~/.claude/hooks/scripts/
cp kurulum/skill-kurallari.ornek.json ~/.claude/skill-kurallari.json   # içindeki _aciklama bloğunu sil
```

`settings.json` içine:

```json
"UserPromptSubmit": [
  { "hooks": [ { "type": "command",
      "command": "node \"$HOME/.claude/hooks/scripts/skill-yonlendirici.js\"",
      "timeout": 5 } ] }
]
```

---

## Katman 4 · MCP (en cimri davranacağın yer)

Her MCP sunucusunun araç şeması **her istekte** yükleniyor. Beş sunucu açmak, beş şemayı her mesajda taşımak demek. Yalnız o an kullandığını aç.

Doğrulanmış sunucular: `mcp-guvenli.json` (npm'de var olduğu **ve** deprecated olmadığı 2026-09-15'te tek tek kontrol edildi).

Kurmadan önce her zaman:

```bash
npm view <paket-adi> version
```

404 alıyorsan **kurma.** `npx -y` var olmayan bir adı çağırıyorsa, o adı ileride npm'de kaydeden kişi senin makinende kod çalıştırabilir.

**Kurma listesi** (npm'de yok): `@anthropic/mcp-figma`, `@anthropic/mcp-server-figma`, `@anthropic/mcp-ghidra`, `@modelcontextprotocol/server-fetch`, `server-docker`, `server-sqlite`, `mcp-terraform`, `snyk-mcp-server`, `kubectl-mcp-app`.

GitHub erişimi için resmi dizindeki `github` entegrasyonunu kullan; `@modelcontextprotocol/server-github` deprecated.

---

## Ölç, tahmin etme

```bash
node kurulum/scripts/baglam-denetci.mjs            # bulunduğun proje
node kurulum/scripts/baglam-denetci.mjs /yol/proje
```

Sana şunu söyler:

- Her istekte ödediğin **sabit maliyet** (CLAUDE.md + açıklamalar), token cinsinden
- Yalnız gerektiğinde yüklenen **kapsam** (skill/subagent/komut gövdeleri)
- Tanımlı MCP sunucuları
- **Açıklaması eksik ya da çok kısa skill'ler** — bunlar hiçbir zaman kendiliğinden seçilmez

Son madde en önemlisi. "Kendisi ayıklasın" davranışı `description` alanında yaşar. Açıklaması zayıf bir skill, kurulmuş ama görünmez bir skill'dir.

İyi açıklama *ne yaptığını değil, ne zaman kullanılacağını* yazar:

```yaml
# zayıf  → asla seçilmez
description: PDF işlemleri yapar.

# iyi    → seçilir
description: Aylık satış verisinden PDF rapor üretir. Kullanıcı "rapor",
  "aylık özet" ya da ".pdf çıktısı" istediğinde kullan.
```

---

## Ön koşul 0 · Claude Code yerelde kurulu olmalı

Bu rehberdeki her şey `~/.claude` klasörüne yazar. O klasörü yalnız **yerelde çalışan** Claude Code okur: terminal CLI, masaüstü uygulaması, VS Code/JetBrains eklentisi.

**Tarayıcıdaki `claude.ai/code` bu klasörü görmez.** Web oturumu bulutta bir konteynerde çalışır; senin diskindeki skill'ler, hook'lar ve `settings.json` oraya ulaşmaz. Eklenti sistemi de orada kapalıdır, `/plugin` şu hatayı verir:

```
Plugins aren't available in this environment
```

Yani `/plugin` çalışmıyorsa ve kurduğun skill'ler görünmüyorsa, sorun kurulumda değil: yanlış yüzeydesin.

Yerel kurulum (Windows CMD):

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

PowerShell'de `irm https://claude.ai/install.ps1 | iex`, macOS/Linux'ta `curl -fsSL https://claude.ai/install.sh | bash`. WinGet de var (`winget install Anthropic.ClaudeCode`) ama kendi kendine güncellenmez; yerel kurucu güncellenir.

Kurulumdan sonra terminali yeniden aç ve doğrula:

```bash
claude --version
claude doctor
```

Windows'ta Git for Windows kuruluysa Claude Code Bash aracını kullanabilir; kurulu değilse PowerShell'e düşer.

---

## Ön koşul · git ve Node

Araçların hepsi Node ile çalışıyor, depoyu çekmek için de git gerekiyor. Kurulu olup olmadığını gör:

```bash
git --version
node --version     # 18 ya da üstü olmalı
```

`'git' is not recognized` ya da `command not found` diyorsa kurulu değil (ya da PATH'te yok).

**Windows:**

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

**macOS:**

```bash
brew install git node
```

Kurulumdan sonra **terminali kapat, yeni bir tane aç.** PATH ancak yeni pencerede güncellenir; en sık takılınan yer burasıdır. `winget` yoksa [git-scm.com](https://git-scm.com/downloads) ve [nodejs.org](https://nodejs.org) üzerinden kurulum dosyasıyla da olur.

---

## Sıralama

Kendi bilgisayarında, terminalde:

```bash
git clone https://github.com/bayramsalihogluu-maker/BieS
cd BieS
node kurulum/kur.mjs                 # 1. ne yapacağını gör
node kurulum/kur.mjs --uygula        # 2. hook'u kur, kendini test etsin
node kurulum/scripts/baglam-denetci.mjs   # 3. mevcut maliyetini ölç
```

Sonra Claude Code içinde:

```
/plugin marketplace add anthropics/claude-plugins-official
/plugin install code-review@claude-plugins-official
/plugin marketplace add obra/superpowers
/plugin install superpowers@superpowers
```

Devamı:

4. `CLAUDE.md`'yi ince tut (`CLAUDE.md.sablon`), sonra tekrar ölç
5. Superpowers ile bir hafta çalış, neyi kullandığını gör
6. Eksik kalan varsa skill yaz (`skill-creator` eklentisi bunu yaptırır)
7. MCP'yi en sona bırak, yalnız ihtiyaç doğunca

Hepsini bir günde kurma. Her adımdan sonra `baglam-denetci.mjs` çalıştır.

---

## Özet

| Yap | Yapma |
|---|---|
| Kapsamı **skill** olarak ekle | Kapsamı CLAUDE.md'ye yığma |
| Açıklamalara "ne zaman kullanılır" yaz | "Ne yapar" yazıp bırakma |
| Resmi dizini ana kaynak al | Rastgele mega-toolkit'i toptan kurma |
| MCP'yi ihtiyaç kadar aç | Her sunucuyu açık tutma |
| Paketleri `npm view` ile doğrula | `npx -y` ile doğrulanmamış ad çağırma |
| Hook yollarını mutlak yaz | Göreli yol yazma |
| Kurduktan sonra ölç | Kapsamlı görünüyor diye verimli sanma |
