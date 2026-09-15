# BieS

Claude Code kurulumu: denetlenmiş kaynaklar, ölçülmüş bağlam bütçesi, çalıştığı kanıtlanmış araçlar.

## İçindekiler

| Yer | Ne var |
|---|---|
| [`kurulum/KURULUM.md`](kurulum/KURULUM.md) | **Buradan başla.** Katmanlı kurulum: neyin maliyeti var, neyin yok. |
| [`GUVENLIK-RAPORU.md`](GUVENLIK-RAPORU.md) | Beş deponun güvenlik denetimi, kanıtlarıyla. |
| [`kurulum/scripts/baglam-denetci.mjs`](kurulum/scripts/baglam-denetci.mjs) | Sabit bağlam maliyetini ölçer, seçilemeyecek skill'leri yakalar. |
| [`ajan-filosu/`](ajan-filosu/README.md) | Paralel iş koşturma sistemi, doğrulama araçları eklenmiş hali. |

## Temel fikir

"Kapsamlı olsun ama gerekeni kullansın" bir çelişki değil, bir mimari meselesi. Claude Code'da her şeyin maliyeti aynı değil:

| Katman | Ne zaman yüklenir | Maliyet |
|---|---|---|
| `CLAUDE.md` | Her istekte, tamamı | Sabit, pahalı |
| MCP araç şemaları | Her istekte, tamamı | Sabit, pahalı |
| Skill **açıklamaları** | Her istekte, tek satır | Sabit, çok ucuz |
| Skill **gövdeleri** | Yalnız o skill seçilince | Kullanılmadıkça sıfır |
| Subagent'lar | Ayrı bağlamda | Ana bağlamı kirletmez |

Yani istediğin davranış yerleşik: Claude yalnız açıklamaları görür, işe uyanın gövdesini açar. **Kapsamı skill olarak eklersen sabit maliyetin neredeyse değişmez.** Mega-toolkit'lerin sorunu içerik değil, her şeyi yanlış katmana yığmaları.

Bu yüzden ölçüm aracı yazıldı:

```bash
node kurulum/scripts/baglam-denetci.mjs
```

Sabit maliyetini token cinsinden söyler ve en sık yapılan hatayı yakalar: **açıklaması eksik ya da çok kısa bir skill hiçbir zaman kendiliğinden seçilmez.** "Kendisi ayıklasın" davranışı tam olarak o alanda yaşar.

## Denetim sonucu

İncelenen beş deponun hiçbirinde bilgi çalan ya da zararlı kod **yok.** Öne çıkanlar:

- **`anthropics/claude-plugins-official`** → ana kaynak. 39 resmi eklenti + 14 entegrasyon, Claude Code içinden kurulur. Üçüncü taraf toolkit'lerin elle çözmeye çalıştığı her kategori burada zaten var.
- **`obra/superpowers`** → temiz, önerilir. Telemetrisi var ama açıkça belgelenmiş (yalnız sürüm bilgisi) ve `SUPERPOWERS_DISABLE_TELEMETRY=1` ile kapanıyor.
- **`muhammedsevimli/sistemler/ajan-filosu`** → tamamen temiz, hiç çalıştırılabilir kod içermiyor.
- **`rohitg00/awesome-claude-code-toolkit`** → kendi kodu zararsız, ama kurmanı söylediği **9 npm paketi hiç yok** (`npx -y` ile çağrıldıkları için ileride o adı kaydeden birine kod çalıştırma imkânı verirler), 6'sı deprecated, hook sistemi de kurulduğu haliyle hiç çalışmıyor.

Kanıtlar: [`GUVENLIK-RAPORU.md`](GUVENLIK-RAPORU.md).

## Ne eklendi

**Bağlam bütçesi denetçisi.** Sabit maliyeti talep üzerine yüklenenden ayırır, seçilemeyecek skill'leri işaretler.

**Çalışan sır tarayıcı.** Toolkit'in "sır sızdırmayı engeller" diye tanıttığı hook üç ayrı hata yüzünden hiçbir şey taramıyordu (girdiyi stdin yerine argv'den okuyor, yazılan içeriğe hiç bakmıyor, geçersiz formatta cevap veriyordu). Düzeltilmiş ve altı senaryoda test edilmiş hali `kurulum/hooks/scripts/secret-scanner.js`.

**Skill yönlendirici (isteğe bağlı).** Girdine bakıp ilgili skill'i hatırlatır. Engellemez, karar vermez. Beş uç durumda test edildi.

**İnce CLAUDE.md şablonu.** `kurulum/CLAUDE.md.sablon`, her satır için tek soruyla: "Claude bunu bilmezse hata yapar mı?"

**Ajan Filosu doğrulama araçları.** Orijinalde "aynı dosyaya yazan iki iş aynı dalgada olmaz" kuralı ve koşu sonrası izolasyon kontrolü modelin dikkatine bırakılmıştı; artık plan ayrıştırması ve `git status` ile ölçülüyor.

## Başlarken

```bash
cd ajan-filosu && npm test          # araçların çalıştığını gör
node kurulum/scripts/baglam-denetci.mjs   # mevcut bağlam maliyetin
```

Sonra [`kurulum/KURULUM.md`](kurulum/KURULUM.md).

## Kaynaklar ve lisans

`ajan-filosu/` özgün sistemi **Muhammed Sevimli** yazdı ([muhammedsevimli/sistemler](https://github.com/muhammedsevimli/sistemler), MIT); kurallar ve format iskeleti korundu, üzerine doğrulama araçları eklendi.

`kurulum/hooks/scripts/secret-scanner.js`, [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit) (Apache-2.0) içindeki betiğin düzeltilmiş türevidir.

`skill-yonlendirici.js`, [diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase) içindeki skill etkinleştirme fikrinin sadeleştirilmiş, engellemeyen uyarlamasıdır.
