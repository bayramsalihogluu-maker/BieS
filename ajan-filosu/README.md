# Ajan Filosu

İşleri tek tek sıraya dizip beklemeyi bitiren sistem. Yapılacakları bir dosyaya yazıyorsun; sistem hangisinin hangisini beklediğini çözüyor, beklemeyenleri aynı anda ayrı çalışanlara dağıtıyor, her biri kendi klasöründe koşuyor ve sonunda tek rapor bırakıyor.

**Sistem her şeyi paralelleştirmiyor.** Asıl işi bağımlılığı doğru çözmek; paralellik onun sonucu.

## Kaynak ve bu sürümün farkı

Sistemin özgün hali **Muhammed Sevimli** tarafından yazıldı: [muhammedsevimli/sistemler/ajan-filosu](https://github.com/muhammedsevimli/sistemler/tree/main/ajan-filosu), MIT lisanslı. Kurallar, faz yapısı ve format iskeleti ona ait ve burada korundu.

Bu sürüm üç şey ekliyor:

| Ekleme | Neyi çözüyor |
|---|---|
| `scripts/dogrula-plan.mjs` | "Aynı dosyaya yazan iki iş aynı dalgada olmaz" kuralı orijinalde tamamen modelin dikkatine bağlıydı. Artık plan metni ayrıştırılıp çakışma programatik olarak aranıyor. |
| `scripts/izolasyon-kontrol.mjs` | Rapor formatındaki "çalışanlar kendi klasöründe kaldı mı" kontrolü modelin beyanıydı. Artık `git status` ile ölçülüyor. |
| `scripts/rapor-birlestir.mjs` | "Uydurma rapor yazma" kuralı bir temenniydi. Artık rapor gövdesi doğrudan `SONUC.md` dosyalarından kuruluyor, boş olan otomatik "çıktı üretmedi" oluyor. |

Hepsi bağımlılıksız, tek dosya, saf Node. `npm test` ile doğrulama mantığının testleri koşuyor.

## Kurulum

```bash
git clone <bu-depo>
cd ajan-filosu
npm test   # opsiyonel, araçların çalıştığını görmek için
```

Node 18 ya da üstü yeterli. Kurulması gereken paket yok.

## Çalıştırma

1. `sen/01-isler.md` dosyasına yapılacakları yaz. **Sıra verme, bağımlılık yazma.**
2. Claude Code'u bu klasörde aç, `planla` yaz. Plan `plan/` klasörüne düşüyor, doğrulayıcıdan geçiyor ve sistem duruyor.
3. Planı oku. Doğrulayıcı mekanik çakışmaları zaten yakaladı; sen işlerin doğru anlaşılıp anlaşılmadığına ve "YAZACAĞI dosyalar" sütununun eksiksizliğine bak.
4. Sorun yoksa `koş` yaz.

Rapor `ciktilar/` klasörüne düşüyor. Ayrıntı: `CALISTIR.md`.

**Plan aşamasındaki duruş bilerek var.** Bağımlılık haritası yanlışsa en ucuz düzeltme anı orasıdır. Koştuktan sonra bulursan iş çoktan bozulmuştur.

## Doğrulama araçları

```bash
npm run dogrula -- plan/2026-07-29-plan.md   # plan yazıldıktan sonra
npm run izolasyon                             # koşu bittikten sonra
npm run rapor                                 # rapor yazılmadan önce
npm test                                      # araçların kendi testleri
```

`dogrula` üç şeye bakıyor: aynı dalgadaki iki iş aynı dosyaya yazıyor mu, bir dalgada 4'ten fazla iş var mı, dalgada geçen her iş Bölüm A'da tanımlı mı. Sorun varsa çıkış kodu 1 döndürüyor, yani CI'a da takılabiliyor.

`SIRALI` işaretli dalgalar çakışma kontrolünden muaf: zaten sırayla koşacakları için aynı dosyaya yazmaları sorun değil.

**Sınırı bilerek dar:** doğrulayıcı yalnız planda yazılmış olanı kontrol eder, planın gerçeği yansıttığını varsayar. Bu boşluğu koşu sonrası `izolasyon-kontrol.mjs` kapatıyor, çünkü o dosya sisteminin gerçeğine bakıyor.

## Klasör yapısı

```text
ajan-filosu/
  CLAUDE.md                     Claude Code otomatik okur
  AGENTS.md                     Codex, Windsurf, Kilo ve 20+ araç okur
  .cursor/rules/                Cursor okur
  CALISTIR.md                   iki komut, arada bir duruş
  format/plan-format.md         plan iskeleti (A-F bölümleri)
  format/rapor-format.md        rapor iskeleti (A-F bölümleri)
  sen/01-isler.md               yapılacaklar, filo defteri
  plan/                         bağımlılık planları
  isler/                        her iş kendi klasöründe, çalışanlar buraya yazar
  ciktilar/                     birleşik raporlar
  scripts/dogrula-plan.mjs      plan doğrulayıcı
  scripts/izolasyon-kontrol.mjs koşu sonrası izolasyon ölçümü
  scripts/rapor-birlestir.mjs   SONUC.md birleştirici
  test/                         doğrulayıcı testleri
```

## Neden her şey paralel değil

| Durum | Neden sıraya konur |
|---|---|
| İki iş aynı dosyaya yazıyor | Aynı anda yazarlarsa biri diğerini eziyor. Sessizce bozuluyor. |
| B, A'nın çıktısına muhtaç | Girdisi hazır olmadan koşarsa boşa koşuyor. |
| İş geri alınamaz | Silme, gönderme, ödeme. Tek tek ve sırayla, gözün üstünde. |
| İş bir dakikadan kısa | Ayrı çalışan açmanın maliyeti kazancından fazla. |

Şüphedeyse sıraya koyar. Yanlış paralellik sessizce bozar, sıralılık yalnız yavaşlatır.

## Desteklenen araçlar

| Araç | Okuduğu dosya |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/` |
| Codex, Google Antigravity, Windsurf, Kilo ve 20+ araç | `AGENTS.md` |

## Lisans

[MIT](LICENSE). Özgün sistemin telif hakkı Muhammed Sevimli'ye ait; bu sürümdeki eklemeler de aynı lisansla dağıtılıyor.
