# BieS

Claude Code kurulumu: denetlenmiş, düzeltilmiş ve test edilmiş parçalar.

## İçindekiler

| Klasör | Ne var |
|---|---|
| [`GUVENLIK-RAPORU.md`](GUVENLIK-RAPORU.md) | İki dış deponun güvenlik denetimi. Ne temiz, ne riskli, neden. |
| [`kurulum/`](kurulum/KURULUM.md) | Çalışan hook kurulumu, doğrulanmış MCP config'i, adım adım talimat. |
| [`ajan-filosu/`](ajan-filosu/README.md) | Paralel iş koşturma sistemi, doğrulama araçları eklenmiş hali. |

## Kısa özet

**Denetim sonucu:** incelenen iki depoda da bilgi çalan ya da zararlı kod **yok.**

- `muhammedsevimli/sistemler/ajan-filosu`: tamamen temiz, hiç çalıştırılabilir kod içermiyor.
- `rohitg00/awesome-claude-code-toolkit`: kendi kodu zararsız, ama kurmanı söylediği 9 npm paketi **hiç yok** (`npx -y` ile çağrıldıkları için ileride o adı kaydeden birine kod çalıştırma imkânı verirler), 6'sı deprecated, hook sistemi de kurulduğu haliyle hiç çalışmıyor.

Ayrıntı ve kanıtlar: [`GUVENLIK-RAPORU.md`](GUVENLIK-RAPORU.md).

## Ne eklendi

**Çalışan sır tarayıcı.** Toolkit'in "sır sızdırmayı engeller" diye tanıttığı hook üç ayrı hata yüzünden hiçbir şey taramıyordu (girdiyi yanlış yerden okuyor, yazılan içeriğe hiç bakmıyor, geçersiz formatta cevap veriyordu). Düzeltilmiş ve altı senaryoda test edilmiş sürümü `kurulum/hooks/scripts/secret-scanner.js`.

**Doğrulanmış MCP config'i.** `kurulum/mcp-guvenli.json` içinde yalnız npm'de var olduğu ve deprecated olmadığı tek tek kontrol edilmiş sunucular var.

**Ajan Filosu için doğrulama araçları.** Orijinal sistemde "aynı dosyaya yazan iki iş aynı dalgada olmaz" kuralı ve koşu sonrası izolasyon kontrolü tamamen modelin dikkatine bırakılmıştı. Artık üçü de programatik:

| Araç | Ne yapıyor |
|---|---|
| `dogrula-plan.mjs` | Plan metnini ayrıştırıp yazma çakışması ve dalga sınırı ihlali arıyor |
| `izolasyon-kontrol.mjs` | Koşu sonrası `git status` ile çalışanların kendi klasöründe kalıp kalmadığını ölçüyor |
| `rapor-birlestir.mjs` | Raporu `SONUC.md` dosyalarından kuruyor, boş olanı otomatik "çıktı üretmedi" işaretliyor |

## Başlarken

```bash
cd ajan-filosu && npm test
```

Kurulum adımları: [`kurulum/KURULUM.md`](kurulum/KURULUM.md).

## Kaynaklar ve lisans

`ajan-filosu/` özgün sistemi **Muhammed Sevimli** yazdı ([muhammedsevimli/sistemler](https://github.com/muhammedsevimli/sistemler), MIT); kurallar ve format iskeleti korundu, üzerine doğrulama araçları eklendi.

`kurulum/hooks/scripts/secret-scanner.js`, [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit) (Apache-2.0) içindeki betiğin düzeltilmiş türevidir.
