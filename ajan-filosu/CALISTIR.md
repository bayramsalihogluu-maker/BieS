# Çalıştır

İki komut. Arada bir duruş var, o duruş bilerek konuldu.

## 0. Bir kerelik

Node 18 ya da üstü yeterli, kurulum gerektiren bağımlılık yok. Doğrulama araçlarının çalıştığını görmek için:

```bash
npm test
```

## 1. İşleri yaz

`sen/01-isler.md` dosyasını aç, yapılacakları madde madde yaz.

**Sıra verme, bağımlılık yazma.** Onu sistem çözecek.

Tek dikkat edeceğin şey somutluk:

- Kötü: "siteyi düzelt"
- İyi: "anasayfadaki fiyat tablosunu mobilde tek sütuna indir"

Sistem belirsiz bir madde görürse sana sorar, tahmin etmez.

Listede silme, mail gönderme, ödeme ya da veri tabanı değiştirme varsa dosyanın "geri alınamaz işler" bölümüne de yaz. Sistem bunları asla paralel koşturmaz.

## 2. Planı çıkar

Claude Code'u bu klasörde aç ve şunu yaz:

```text
planla
```

Sistem her işin girdisini, çıktısını ve **hangi dosyalara yazacağını** çıkarır. Sonra iki tür bağımlılığı ayrı ayrı işaretler:

- **Veri bağımlılığı:** B, A'nın çıktısına muhtaç.
- **Yazma çakışması:** ikisi aynı dosyaya yazacak. Mantıken bağımsız olsalar bile paralel koşamazlar.

Sonuç `plan/` klasörüne düşer, sistem planı `dogrula-plan.mjs` ile kontrol eder ve **durur.**

## 3. Planı oku, sonra koş

Bu duruş bilerek var. Bağımlılık haritası yanlışsa en ucuz düzeltme anı burasıdır. Koştuktan sonra bulursan iş çoktan bozulmuştur.

Doğrulayıcı mekanik hataları zaten yakalar. Sen şu insan sorularına bak:

- İşler doğru anlaşılmış mı
- "YAZACAĞI dosyalar" sütunu eksiksiz mi (doğrulayıcı yazılmamış bir dosyayı bilemez)
- Geri alınamaz bir iş paralel dalgaya düşmüş mü

Sorun yoksa:

```text
koş
```

## Ne oluyor

Sistem her iş için `isler/<ad>/` klasörü açıyor. Aynı dalgadaki işleri **aynı anda** başlatıyor, her çalışan yalnız kendi klasörüne yazıyor. Dalga bitmeden sonrakine geçmiyor.

Bitince `ciktilar/` klasörüne tek bir rapor düşüyor. On klasör gezmiyorsun, bir dosya okuyorsun.

---

## Doğrulama araçları

Üçü de bağımlılıksız, tek dosya, Node ile çalışıyor. Sistem bunları kendisi çağırıyor; elle de çalıştırabilirsin.

| Komut | Ne zaman | Ne yapıyor |
|---|---|---|
| `npm run dogrula -- plan/2026-07-29-plan.md` | plan yazıldıktan sonra | Aynı dalgada aynı dosyaya yazan iş var mı, dalgada 4'ten fazla iş var mı, dalgadaki her iş Bölüm A'da tanımlı mı. Sorun varsa çıkış kodu 1. |
| `npm run izolasyon` | koşu bittikten sonra | `git status` okuyup `isler/`, `ciktilar/`, `plan/` dışına yazan var mı bakıyor. Raporun Bölüm E'si bu çıktıdan doldurulur. |
| `npm run rapor` | rapor yazılmadan önce | Her `isler/<slug>/SONUC.md` dosyasını okuyup ham birleştirme üretiyor. Boş SONUC.md otomatik "çıktı üretmedi" oluyor. |

**Neden var:** orijinal sistemde bu üç kontrol de modelin kendi dikkatine bırakılmıştı. Model "aynı dosyaya yazmıyorlar" derse öyle sayılıyordu. Şimdi plan metni ve dosya sistemi gerçeği karşılaştırılıyor, cevabı araç veriyor.

**Sınırı:** doğrulayıcı yalnızca planda **yazılmış olanı** kontrol eder. Bir iş plana yazılmamış bir dosyaya yazacaksa onu bilemez; o yüzden "YAZACAĞI dosyalar" sütununun eksiksizliği hâlâ senin kontrol edeceğin şey. `izolasyon-kontrol.mjs` ise koşu sonrası gerçeği ölçtüğü için bu boşluğu arkadan kapatır.

---

## Neden her şey paralel değil

Bu sistemin işi paralellik değil, **bağımlılığı doğru çözmek.** Paralellik onun sonucu.

| Durum | Neden |
|---|---|
| İki iş aynı dosyaya yazıyor | Aynı anda yazarlarsa biri diğerini eziyor. Sessizce bozuluyor, sonradan buluyorsun. |
| B, A'nın çıktısına muhtaç | Girdisi hazır olmadan koşarsa boşa koşuyor. |
| İş geri alınamaz | Silme, gönderme, ödeme. Bunlar tek tek ve sırayla, gözün üstünde. |
| İş bir dakikadan kısa | Ayrı çalışan açmanın maliyeti kazancından fazla. |

Şüphedeyse sıraya koyar. Yanlış paralellik sessizce bozar, sıralılık yalnız yavaşlatır.

---

## Sık sorulanlar

**Kaç iş aynı anda koşuyor?**
En fazla 4. Daha fazlası makineyi ve modeli boğuyor, hız kazancı tersine dönüyor.

**Dört işi paralel koşturursam dört kat mı hızlanır?**
Hayır. Süre en uzun işin süresi kadar olur, dörtte biri değil. Ayrıca her çalışanın kurulum maliyeti var. Rapor sana gerçekleşen kazancı yazıyor, şişirmiyor.

**Bir çalışan hata verirse ne oluyor?**
Diğerleri devam ediyor. Başarısız iş raporda "yapılamadı" diye işaretleniyor, ona bağlı sonraki işler "atlandı" oluyor. Zinciri görüyorsun.

**Çalışanlar birbirinin dosyasını bozar mı?**
Bozmaması için her biri kendi klasörüne kilitli. Koşu sonrası `npm run izolasyon` bunu dosya sistemi üzerinden doğruluyor, modelin beyanına bakmıyor.

**Planı beğenmezsem?**
`sen/01-isler.md` dosyasını düzelt ve `planla` de. Plan üzerine yazılır, koşmadığın sürece hiçbir şey olmaz.

**Doğrulayıcı "GEÇERSİZ" dedi ama ben planın doğru olduğunu düşünüyorum?**
Çoğu zaman "YAZACAĞI dosyalar" sütunu fazla geniş yazılmıştır: iki iş aslında aynı klasörde ayrı dosyalara yazıyordur ama plana klasör adı yazılmıştır. Sütunu dosya seviyesine indir, tekrar doğrula.
