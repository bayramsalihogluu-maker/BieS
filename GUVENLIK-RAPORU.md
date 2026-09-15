# Güvenlik Denetimi

İki depo incelendi. Tarih: 2026-09-15.

| Depo | Zararlı yazılım | Veri sızdırma | Sonuç |
|---|---|---|---|
| `muhammedsevimli/sistemler/ajan-filosu` | yok | yok | **Temiz.** Kurulabilir. |
| `rohitg00/awesome-claude-code-toolkit` | yok | yok | **Dikkatli kur.** Kendisi zararsız, ama tavsiye ettiği kurulumların bir kısmı riskli, bir kısmı da çalışmıyor. |
| `anthropics/claude-plugins-official` | yok | yok | **Ana kaynak olarak kullan.** Resmi, kürate edilmiş. |
| `obra/superpowers` | yok | sürüm bilgisi (opt-out) | **Kur.** Telemetrisi açıkça belgelenmiş ve kapatılabilir. |
| `diet103/claude-code-infrastructure-showcase` | yok | yok | Fikri alındı, tamamı gerekli değil. |

Kısa cevap: **hiçbirinde bilgilerini çalan bir kod yok.** Ama `awesome-claude-code-toolkit`'te, aşağıda tek tek anlatılan, gerçek bir tedarik zinciri riski ve çalışmayan bir güvenlik özelliği var.

---

## 1 · ajan-filosu

**Sonuç: temiz, çalıştırılabilir kod içermiyor.**

Ne kontrol edildi:

| Kontrol | Sonuç |
|---|---|
| Dosya envanteri | 14 dosya: 12 Markdown, 1 LICENSE, 2 `.gitkeep`. **Tek satır çalıştırılabilir kod yok.** |
| Ağ çağrısı (`curl`, `fetch`, `http`, webhook) | Yok. Tek URL grubu yazarın kendi sosyal medya hesapları. |
| Kabuk / kod çalıştırma (`exec`, `eval`, `subprocess`, `os.system`) | Yok. |
| Kimlik bilgisi sızdırma (`.env`, token, API key, ssh) | Yok. Hiçbir dosyada geçmiyor. |
| Gizli karakter / görünmez Unicode (prompt injection işareti) | Yok. Zero-width karakter taraması temiz. |
| Gizli talimat (AI'ya "şunu dışarı gönder" dedirten metin) | Yok. Talimatlar tamamen dosya organizasyonu ve paralellik kuralları. |
| Lisans | MIT, temiz. |

**Neden bu depoda "kod yok" önemli:** bu sistem Markdown talimatlardan ibaret. Riski, klasik anlamda virüs değil, *AI'ya ne söylediği* olurdu. Talimatların tamamı okundu: modele yalnızca işleri klasörlere bölmesini, bağımlılık haritası çıkarmasını ve rapor yazmasını söylüyor. Dışarıya veri gönderen, dosya silen ya da izin isteyen hiçbir yönerge yok. Aksine kuralların bir kısmı koruyucu: "geri alınamaz işleri paralelleştirme", "çalışan kendi klasörü dışına yazamaz".

**Kurulum yöntemi hakkında not.** README `npx degit ...` öneriyor. `degit` yaygın ve meşru bir iskelet kopyalama aracıdır, depo içeriğini çalıştırmaz, sadece dosyaları indirir. Bu depo için güvenli.

---

## 2 · awesome-claude-code-toolkit

**Sonuç: deponun kendi kodu zararsız. Asıl risk, sana kurmanı söylediği üçüncü taraf şeylerde.**

### 2.1 · Deponun kendi kodu: temiz

| Kontrol | Sonuç |
|---|---|
| Boyut | 5 MB, 473 Markdown, 139 JSON, 19 JS hook, 1 kurulum betiği, 1 Python hook. |
| 120 eklenti (`plugins/`) | Tamamı `.md` ve `.json`. **Çalıştırılabilir dosya yok.** |
| 19 JS hook | Hiçbirinde ağ çağrısı yok. `fetch`, `axios`, `http` yok. Yalnız `execFileSync` ile yerel `git`, `lint`, `test` komutları. |
| `setup/install.sh` | Sadece `~/.claude` altına dosya kopyalıyor. Her adım için y/n soruyor. İnternete çıkmıyor, `sudo` istemiyor, hiçbir şey indirmiyor. Temiz. |
| Diske yazılanlar | `~/.claude/learnings/*.json` (proje yolu + son commit başlıkları) ve `~/.claude/session-context.json`. **Hepsi yerel, hiçbiri gönderilmiyor.** |
| `smart-approve.py` | Üçüncü taraf (liberzon/claude-hooks, MIT), atıf düzgün verilmiş. Bash komutlarını parçalayıp **senin kendi** allow/deny listene göre karar veriyor, kendi kafasından izin uydurmuyor. |

Yani: bilgilerini bir yere gönderen kod yok.

### 2.2 · Gerçek risk: var olmayan npm paketleri

`mcp-configs/` içindeki dosyalar sana `npx -y <paket>` ile MCP sunucuları kurmanı söylüyor. Bu adları npm registry üzerinde tek tek kontrol ettim:

| Paket | Durum |
|---|---|
| `@anthropic/mcp-figma` | **YOK (404)** |
| `@anthropic/mcp-server-figma` | **YOK (404)** |
| `@anthropic/mcp-ghidra` | **YOK (404)** |
| `@modelcontextprotocol/server-fetch` | **YOK (404)** |
| `@modelcontextprotocol/server-docker` | **YOK (404)** |
| `@modelcontextprotocol/server-sqlite` | **YOK (404)** |
| `mcp-terraform` | **YOK (404)** |
| `snyk-mcp-server` | **YOK (404)** |
| `kubectl-mcp-app` | **YOK (404)** |

**Bu neden önemli:** `npx -y` demek, "paketi indir, sorma, çalıştır" demek. Bugün bu adlar boş olduğu için komut hata verip duruyor. Ama npm'de boş bir ad herkese açıktır: **yarın biri bu adı kaydederse**, senin config'in o paketi indirip makinende çalıştırır. Sen hiçbir şey değiştirmemiş olursun. Buna dependency confusion / isim kapma denir ve gerçek saldırılarda kullanılır.

Ayrıca `@anthropic/...` adları ayrıca yanıltıcı: Anthropic'in npm alanı `@anthropic-ai`, `@anthropic` değil. Yani bu satırlar resmi Anthropic paketi gibi duruyor ama değil.

### 2.3 · İkinci risk: bakımı bırakılmış paketler

Var olanların da çoğu npm'de resmen "deprecated" işaretli:

| Paket | Sürüm | Durum |
|---|---|---|
| `@modelcontextprotocol/server-filesystem` | 2026.8.31 | aktif |
| `@modelcontextprotocol/server-memory` | 2026.8.31 | aktif |
| `@modelcontextprotocol/server-github` | 2025.4.8 | **deprecated** |
| `@modelcontextprotocol/server-postgres` | 0.6.2 | **deprecated** |
| `@modelcontextprotocol/server-puppeteer` | 2025.5.12 | **deprecated** |
| `@modelcontextprotocol/server-brave-search` | 0.6.2 | **deprecated** |
| `@modelcontextprotocol/server-slack` | 2025.4.25 | **deprecated** |
| `@modelcontextprotocol/server-redis` | 2025.4.25 | **deprecated** |

`recommended.json` içindeki 14 sunucudan **yalnız 2'si aktif bakımda**, 6'sı deprecated, 3'ü hiç yok. Deprecated bir pakete güvenlik yaması gelmez.

### 2.4 · Üçüncü risk: tanımadığın uzak sunucular ve pinlenmemiş kurulum

| Yer | Ne yapıyor | Risk |
|---|---|---|
| `research.json` | `https://mcp.bgpt.pro/sse` adresine bağlanıyor | Uzak MCP sunucusu. Ona gönderdiğin her arama o üçüncü tarafa gider. Kim işletiyor, verini ne yapıyor bilinmiyor. |
| `finance.json` | `https://heliumtrades.com/mcp` | Aynı durum. |
| `llm-cost.json` | `uvx --from git+https://github.com/benbencodes/llm-prices` | Bir şahsın GitHub deposunun **ana dalından** doğrudan kod kurup çalıştırıyor. Sürüm sabitlenmemiş; o dal yarın değişirse çalışan kod da değişir. |

Bunlar zararlı olduğu için değil, **kim olduğunu bilmediğin taraflara güven verdiği** için listede.

### 2.5 · Dördüncü sorun: hook sistemi kurulduğu gibi çalışmıyor

Bu bir güvenlik açığı değil ama seni yanlış bir güven duygusuna sokuyor, o yüzden raporda.

**a) Şema yanlış.** `hooks/hooks.json` şöyle yazılmış:

```json
{ "hooks": [ { "type": "PreToolUse", "matcher": "Bash", "command": "..." } ] }
```

Claude Code'un beklediği şema ise üç katmanlı:

```json
{ "hooks": { "PreToolUse": [ { "matcher": "Bash",
    "hooks": [ { "type": "command", "command": "..." } ] } ] } }
```

Düz dizi tanınmaz. Yani kurulan **25 hook'un hiçbiri tetiklenmez.**

**b) Hedef dosya yanlış.** `install.sh` bunu `~/.claude/hooks.json` içine kopyalıyor. Kullanıcı seviyesindeki hook'lar `~/.claude/settings.json` içinde tanımlanır; `~/.claude/hooks.json` diye okunan bir dosya yok.

**c) Göreli yollar, gerçek bir açık.** Komutlar `node hooks/scripts/session-start.js` şeklinde, yani göreli. Hook'lar o anki **çalışma dizininde** koşar. Bu hook'lar çalışır hale getirilirse, içinde `hooks/scripts/session-start.js` bulunan **herhangi bir depoyu açmak**, o deponun kendi betiğini otomatik çalıştırır. Güvenmediğin bir projeyi klonlamak kod çalıştırmaya dönüşür. Resmi doküman tam da bunun için `${CLAUDE_PROJECT_DIR}` gibi mutlak yol yer tutucuları kullanmanı söylüyor. Kurulum betiği bu sorunu bir NOT satırıyla kabul ediyor ama düzeltmiyor.

**d) `secret-scanner.js` hiçbir şey taramıyor.** "Sır sızdırmayı engeller" diye tanıtılan hook'ta üç ayrı hata var:

1. Girdiyi `process.argv[2]`'den okuyor. Claude Code hook girdisini **stdin**'den JSON olarak verir. Dolayısıyla dosya yolu hep boş kalır ve betik daha ilk satırlarda sessizce çıkar.
2. Diskteki dosyayı okuyor. `Write` sırasında dosya henüz yazılmamıştır; taranması gereken içerik `tool_input.content` içindedir. Yani yeni yazılan içerik hiçbir koşulda taranmaz.
3. `{"decision":"block"}` formatında çıktı veriyor. Güncel şema `hookSpecificOutput.permissionDecision` bekler; bulsa bile engelleyemezdi.

Bunu test ettim. Gerçek görünümlü bir AWS anahtarını orijinal betiğe verdim:

```
$ echo '{"tool_name":"Write","tool_input":{"file_path":"/tmp/x.js",
  "content":"const k = \"AKIA................\";"}}' | node secret-scanner.js
exit=0      (çıktı yok, engelleme yok)
```

Sessizce geçti. Yani bu hook, koruduğunu sandığın şeyi hiç kontrol etmiyor.

Düzeltilmiş ve test edilmiş sürümü `kurulum/hooks/scripts/secret-scanner.js` içinde; aynı anahtarla çalıştırıldığında `permissionDecision: "deny"` verip çıkış kodu 2 ile engelliyor.

### 2.6 · Beşinci not: `smart-approve.py` neyi değiştiriyor

Bu betik zararlı değil, hatta tasarımı sağlam: `git status && rm -rf /` gibi birleşik bir komutu parçalara ayırıp her parçayı ayrı ayrı senin izin listene soruyor. Yani `git status:*` izinli diye komutun tamamını onaylamıyor. Bu, düz eşleştirmeden daha güvenli.

Yine de bilerek kur: bu betik **senin yerine izin kararı veriyor.** Ayrıştırıcısındaki bir hata (tırnak, heredoc, yönlendirme işlemesi karmaşık) yanlışlıkla "allow" dönerse, sana sorulmadan komut çalışır. Ayrıştırıcı ne kadar iyi olursa olsun, izin ekranını koda devretmiş olursun. İzin listen darsa kazancı yüksek, genişse riski yüksek.

---

---

## 3 · İkinci tur: daha iyi kaynaklar

`claudefa.st` üzerindeki derleme sayfası bu ortamın ağ politikası tarafından engellendiği için açılamadı. Onun yerine o sayfanın derlediği **birincil kaynağa** gidildi: `hesreallyhim/awesome-claude-code`. Oradan çıkan ve denetlenen üç kaynak:

### 3.1 · `anthropics/claude-plugins-official` · en iyi kaynak

Anthropic'in resmi, kürate edilmiş eklenti dizini. **39 birinci parti eklenti** (code-review, claude-security, feature-dev, code-simplifier, commit-commands, skill-creator, plugin-dev, hookify, session-report, 11 dil için LSP) ve **14 entegrasyon** (github, gitlab, linear, asana, playwright, terraform, firebase, context7, serena...).

Claude Code içinden kuruluyor:

```
/plugin marketplace add anthropics/claude-plugins-official
/plugin install code-review@claude-plugins-official
```

Üçüncü taraf toolkit'lerin elle çözmeye çalıştığı her kategori burada zaten var, üstelik dış katkılar kalite ve güvenlik incelemesinden geçiyor. Deponun kendi uyarısı yine de geçerli: Anthropic üçüncü taraf eklentilerin içeriğini denetlemez, kurmadan önce güvendiğinden emin ol.

### 3.2 · `obra/superpowers` · temiz, önerilir

14 skill'lik bir yazılım geliştirme yöntemi. Denetim:

| Kontrol | Sonuç |
|---|---|
| Skill ve hook betiklerinde ağ çağrısı | **Yok** |
| `hooks.json` şeması | **Doğru** üç katmanlı yapı |
| Hook yolları | **Mutlak** (`${CLAUDE_PLUGIN_ROOT}`), göreli değil |
| Telemetri | **Var, açıkça belgelenmiş** (aşağıda) |

Telemetri: `brainstorming` skill'inin *isteğe bağlı* görsel eşlikçisindeki logo kendi sitelerinden yükleniyor ve yalnız Superpowers sürümünü taşıyor. Projen, istemin, tıklamaların gönderilmiyor. Kapatma: `SUPERPOWERS_DISABLE_TELEMETRY=1`. Claude Code'un `DISABLE_TELEMETRY` ve `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` ayarlarına da uyuyor.

Not: hook kurulumunu `awesome-claude-code-toolkit`'in yanlış yaptığı iki şeyi de (şema, mutlak yol) doğru yapıyor. Aradaki kalite farkı buradan da görülüyor.

### 3.3 · `diet103/claude-code-infrastructure-showcase` · fikri değerli, tamamı gereksiz

"Skill'ler kendiliğinden etkinleşmiyor" sorununu bir `UserPromptSubmit` hook'u ve `skill-rules.json` ile çözüyor; istemine bakıp ilgili skill'i zorunlu kılıyor, hatta etkinleşene kadar düzenlemeleri **engelliyor.**

Fikir doğru, uygulaması ağır: tek bir ekibin TypeScript mikroservis projesi için yazılmış, kurulum sihirbazı ve zorlayıcı bloklama içeriyor. Skill seçimi zaten açıklamalar üzerinden çalıştığı için bu kadarına çoğu durumda gerek yok.

Fikrin sadeleştirilmiş, engellemeyen hali `kurulum/hooks/scripts/skill-yonlendirici.js` olarak yazıldı: eşleşen skill'i hatırlatır, karar vermez, istemi hiçbir koşulda bloke etmez.

---

## Tavsiye

**Ana kaynak: Anthropic'in resmi eklenti dizini.** Rastgele mega-toolkit toplamaya gerek yok.

**ajan-filosu:** kur, çekinme. Geliştirilmiş sürümü bu depoda `ajan-filosu/` altında.

**superpowers:** kur. Temiz, doğru yazılmış, telemetrisi açık ve kapatılabilir.

**awesome-claude-code-toolkit:** `git clone` yapıp içindeki Markdown'ları (agent'lar, komutlar, kurallar, şablonlar) incelemekte hiçbir sakınca yok, değerli içerik var. Ama:

- `setup/install.sh` çalıştırmadan önce ne kopyaladığını bil. Hook kısmını atla, çünkü zaten çalışmıyor.
- `mcp-configs/` içindeki dosyaları **olduğu gibi kullanma.** Var olmayan paket adları var.
- Kurmadan önce her paketi kendin doğrula: `npm view <paket-adi> version`. 404 alıyorsan kurma.
- Doğrulanmış, sadeleştirilmiş MCP config'i: `kurulum/mcp-guvenli.json`.
- Çalışan hook kurulumu: `kurulum/settings-hooks.json` + `kurulum/hooks/scripts/secret-scanner.js`.

Adım adım kurulum: `kurulum/KURULUM.md`.

---

## Yöntem

Denetim iddiaları şu şekilde doğrulandı, hiçbiri hafızadan yazılmadı:

- Denetlenen depolar sığ klonlandı, dosya envanteri çıkarıldı.
- `ajan-filosu`: tüm dosyalar baştan sona okundu; ağ, kod çalıştırma, kimlik bilgisi ve görünmez Unicode desenleri için tarandı.
- `awesome-claude-code-toolkit`: `install.sh`, `hooks.json`, `smart-approve.py` ve diske yazan hook'lar satır satır okundu; 473 Markdown ve 139 JSON ağ/exec desenleri için tarandı.
- 29 npm paketi registry üzerinden tek tek sorgulandı; var olma durumu HTTP kodundan, deprecated durumu paket meta verisinden alındı.
- Claude Code hook şeması, çıktı formatı ve `UserPromptSubmit` bağlam enjeksiyonu resmi dokümandan teyit edildi.
- `secret-scanner.js`'in çalışmadığı, orijinal betik gerçek girdiyle çalıştırılarak kanıtlandı.
- İkinci turda `claudefa.st` ağ politikası nedeniyle açılamadı; derlediği birincil kaynak `hesreallyhim/awesome-claude-code` doğrudan klonlanıp okundu.
- `superpowers` telemetrisi README'den okundu, betikleri ağ çağrısı için ayrıca tarandı (sonuç: skill ve hook betiklerinde çağrı yok).
