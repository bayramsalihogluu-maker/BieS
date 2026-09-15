# Ajan mimarisi · ne doğru, ne değil

Kurmak istediğin yapı büyük ölçüde doğru. Üç yerde düzeltme gerekiyor ve biri ciddi.

---

## Doğru kurduğun ayrım

Bunu zihninde sabitlemişsin ve en önemlisi bu:

```
Model  ≠  Ajan  ≠  Skill  ≠  Araç  ≠  Akış
```

| Kavram | Ne | Örnek |
|---|---|---|
| **Model** | Motor | Opus, Sonnet, Haiku |
| **Ajan** | Rol ve sorumluluk, kendi bağlam penceresi var | `kaynak-arastirmaci` |
| **Skill** | Çağrılabilir yetenek, ajan değil | `xlsx`, `pptx` |
| **Araç / MCP** | Dış dünyaya erişim | GitHub, filesystem, web |
| **Akış** | İşin sırası | araştır → hesapla → doğrula |

"Tax Agent = Claude" değildir tespitin de doğru. Tax Agent bir **rol**dür; altında bir model, birkaç skill ve birkaç araç çalışır.

Ajanları modele göre değil sorumluluğa göre tanımla dediğin de doğru. `Claude Agent` diye bir ajan olmaz; `dogrulayici` olur.

---

## Düzeltme 1 · Tek orkestratör altında üç sağlayıcı çalışmıyor

Diyagramlarında Claude, Codex ve Gemini aynı orkestratörün altında duruyor. **Claude Code bunu yapmıyor.**

Subagent tanımındaki `model` alanı yalnız Claude modellerini kabul ediyor: `sonnet`, `opus`, `haiku`, `fable`, tam model kimliği, ya da ana oturumun modelini kullanmak için `inherit`. Anthropic dışı modeller desteklenmiyor.

Yani şu mümkün değil:

```
        ORCHESTRATOR (Claude Code)
                 │
      ┌──────────┼──────────┐
   Claude      Codex      Gemini        ← Claude Code bunu kuramaz
```

Yapılabilecek olan:

- **Tek sağlayıcı, farklı modeller.** Ucuz ve hızlı iş Haiku'ya, ağır muhakeme Opus'a. Bu gerçek ve işe yarar bir tasarruf.
- **Dış orkestrasyon.** Üç sağlayıcıyı gerçekten birlikte koşturmak istiyorsan orkestratörü Claude Code'un dışında, kendi yazdığın bir katmanda kurman gerekir. Bu ayrı bir proje, ve senin iş yükünde muhtemelen getirisi yok.

**Öneri:** çok sağlayıcılı kurguyu şimdilik bırak. Kazanç belirsiz, karmaşıklık kesin.

---

## Düzeltme 2 · Master Orchestrator ajanı yazma

Diyagramında en tepede bir `MASTER ORCHESTRATOR` kutusu var. Onu bir ajan olarak kurma.

**Ana oturum zaten orkestratördür.** Claude Code'un kendisi planlar, ajan seçer, sonuçları birleştirir. Üstüne bir "master agent" koymak fazladan bir sıçrama ekler: ana oturum master'ı çağırır, master alt ajanı çağırır, sonuç iki kez özetlenir. Her özetleme bilgi kaybıdır ve her sıçrama bağlam maliyetidir.

Doğru resim:

```
SEN
 │
 ▼
Ana oturum  ← orkestratör burasıdır, ayrıca yazılmaz
 │
 ├─→ kaynak-arastirmaci    (kendi bağlam penceresi)
 ├─→ hesap-modelci          (kendi bağlam penceresi)
 ├─→ belge-tasarimci        (kendi bağlam penceresi)
 └─→ cikti-dogrulayici      (kendi bağlam penceresi)
```

Alt ajanlar kendi aralarında da ajan çağırabiliyor (varsayılan olarak üç kat derinliğe kadar). Yani `finans → vergi → araştırma` hiyerarşin mümkün. Ama derinleştikçe her katman bir özetleme kaybı ekliyor; iki kattan fazlasına gerçekten ihtiyacın olduğunda in.

---

## Düzeltme 3 · Doğrulayıcı okumaz, çalıştırır

En değerli düzeltme bu.

Diyagramındaki `CRITIC` ve `VERIFIER` kutuları, içlerine ne koyduğuna bağlı olarak ya sistemin en güçlü ya da en işe yaramaz parçası olur.

**Zayıf doğrulayıcı** çıktıyı okur ve "doğru görünüyor" der. Bu denetim değil, ikinci bir görüştür. Aynı modelin ikinci kez bakması, ilk seferde kaçırdığını çoğu zaman yine kaçırır.

**Güçlü doğrulayıcı** iddiayı test eden bir şey çalıştırır.

Bu oturumda ikisinin farkı somut olarak görüldü. Amortisman raporu hazırlanırken:

| Okuyarak bulunamayacak olan | Nasıl bulundu |
|---|---|
| Bir etiket metni `=` ile başlıyordu, Excel onu formül sanıp `#NAME?` verecekti | 547 formülün tamamı hesaplatıldı |
| Dipnotlar slayt kenarına 0,24 inç kalıyordu | Her şeklin sınırları ölçüldü |
| İzolasyon kontrolü her iş için yanlış uyarı veriyordu | Gerçek bir koşu simüle edildi |

Üçü de gözle bakarak fark edilmezdi. Bu yüzden `cikti-dogrulayici` ajanının tek kuralı şu:

> Çalıştırmadığın şeyi doğrulamış sayılmazsın. Bir bulguyu çalıştırarak üretemediysen, onu tahmin olarak işaretle.

---

## Katmanlar · gerçekte var olan hali

Dokuz katmanlı modelin kavramsal olarak doğru ama çoğu katmanı senin kurman gerekmiyor; Claude Code'da zaten var. Gerçekten dokunduğun yerler:

| Katman | Durum | Senin yapacağın |
|---|---|---|
| Model | Hazır | Ajan başına model seç (`model:` alanı) |
| Talimat | Hazır | `CLAUDE.md` ince tut |
| **Ajan** | **Sen yazarsın** | `~/.claude/agents/*.md` |
| **Skill** | Kur + yaz | Hazırları kur, kendi alanın için yaz |
| MCP | Kur | İhtiyaç kadar, her biri sabit bağlam maliyeti |
| Hafıza | Hazır | Ajan başına `memory:` alanı |
| **Hook** | **Sen yazarsın** | Pazarlık edilemez kurallar |
| Orkestrasyon | Hazır | Ana oturum. Ayrıca yazma. |
| Güvenlik | Kısmen | İzinler + hook'lar |

Kalın olanlar senin işin. Gerisi hazır.

Güvenliği en altta bir katman olarak değil, sistemi saran bir kuşak olarak düşünmen de doğru. Pratikte bunun karşılığı hook'lardır: `PreToolUse` aracı çalışmadan önce, `PostToolUse` sonra devreye girer. Bu depodaki sır tarayıcı tam olarak budur.

---

## Kurulu filo

`kurulum/agents/` altında dört ajan var. `node kurulum/kur.mjs --uygula --ajanlar` ile kurulur.

| Ajan | Rolü | Model | Ne zaman devreye girer |
|---|---|---|---|
| `kaynak-arastirmaci` | Mevzuat ve rakam araştırır, her bulguyu dayanağa bağlar | Sonnet | Kanun, tebliğ, had, oran, yürürlük tarihi gerektiğinde |
| `hesap-modelci` | Canlı formüllü Excel modeli kurar ve doğrular | Opus | Hesap, tablo, projeksiyon, senaryo gerektiğinde |
| `belge-tasarimci` | Sunum ve kurumsal belge üretir | Opus | PPTX, DOCX, PDF çıktı gerektiğinde |
| `cikti-dogrulayici` | Bağımsız denetim, çalıştırarak | Opus | Bir şey dışarı gitmeden önce |

Sen bunları adlarıyla çağırmıyorsun. Açıklamaları eşleştiği için kendiliğinden seçiliyorlar. İstersen açıkça da çağırabilirsin.

### Tipik akış

Bu oturumdaki vergi raporu şu akışla üretildi, ajanlarla aynısı şöyle olur:

```
"Çin merkeze amortisman raporu hazırla"
            │
     Ana oturum planlar
            │
  ┌─────────┼─────────┐
  ▼         ▼         ▼
kaynak-  hesap-   belge-
arastir  modelci  tasarimci
  │         │         │
  └─────────┼─────────┘
            ▼
    cikti-dogrulayici
            │
      ┌─────┴─────┐
   GEÇTİ       DÜZELT
      │           │
      ▼           └─→ ilgili ajana geri
     SEN
```

Araştırmacı Sonnet'te koşuyor çünkü çok sayıda arama yapıyor ve her biri ucuz olmalı. Diğerleri Opus'ta çünkü hata maliyeti yüksek.

---

## Bir uyarı

Bu mimariyi bir hamlede kurma. Dört ajanla başla, iki hafta gerçek iş yap, hangisinin gerçekten devreye girdiğine bak.

Çoğu ajan filosu, kullanılmayan ajanlarla dolu olduğu için değil, **ajanlar arası devir teslim bilgiyi aşındırdığı için** başarısız olur. Her ajan çağrısı bir özetleme demektir; özetleme kayıptır. İki ajanın arasına üçüncüyü koymadan önce, ikisinin doğrudan konuşmasının neden yetmediğini söyleyebilmelisin.

Ölçüt basit: bir ajanı kaldırdığında çıktı bozuluyorsa gereklidir, bozulmuyorsa fazladır.
