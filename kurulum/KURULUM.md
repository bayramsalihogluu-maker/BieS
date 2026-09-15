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

### 3a · Sır tarayıcı (önerilen)

Dosyaya API anahtarı, özel anahtar ya da token yazılmasını yazma anında engeller.

```bash
mkdir -p ~/.claude/hooks/scripts
cp kurulum/hooks/scripts/secret-scanner.js ~/.claude/hooks/scripts/
```

`~/.claude/settings.json` içine `settings-hooks.json` dosyasındaki `hooks` anahtarını ekle. Doğrula:

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

## Sıralama

Hepsini bir günde kurma. Her katmandan sonra ölç.

1. `CLAUDE.md`'yi ince tut (`CLAUDE.md.sablon`)
2. Sır tarayıcı hook'unu kur, test et
3. Resmi dizini ekle, **gerçekten kullanacağın** 3-5 eklentiyi kur
4. Superpowers'ı kur, bir hafta çalış
5. `baglam-denetci.mjs` çalıştır, sabit maliyetine bak
6. Eksik kalan varsa skill yaz (`skill-creator` eklentisi bunu yaptırır)
7. MCP'yi en sona bırak, yalnız ihtiyaç doğunca

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
