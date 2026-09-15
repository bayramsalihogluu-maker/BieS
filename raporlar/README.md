# Türkiye · Amortisman ve İtfa Raporu (Çin Finance HQ)

Çin merkeze sunulmak üzere hazırlanmış, Türk vergi mevzuatındaki amortisman ve itfa kurallarını anlatan sunum ve hesaplama modeli. Sunum dili İngilizce: Türk iştirak ile Çin merkez arasındaki ortak dil.

## Dosyalar

| Dosya | Ne |
|---|---|
| `TR-Depreciation-Amortisation-HQ-Briefing.pptx` | 14 slaytlık sunum |
| `TR-Depreciation-Model-2026.xlsx` | Hesaplama modeli, 8 sekme, canlı formüller |
| `build_pptx.js` · `build_xlsx.py` | Üreten betikler. Sayı değişirse bunları düzeltip yeniden çalıştır. |
| `verify_xlsx.py` · `audit_pptx.py` | Doğrulama betikleri (aşağıda) |

## Excel modeli nasıl kullanılır

Sarı hücreler girdidir, gerisi formül. Bir girdiyi değiştir, bütün tablolar yeniden hesaplanır.

| Sekme | İçerik |
|---|---|
| `Assumptions` | 2026 hadleri ve oranları, her biri yasal dayanağıyla. Tüm örnekler buradan besleniyor. |
| `Ex1 Straight-Line` | Normal amortisman, makine |
| `Ex2 SL vs Declining` | Normal ve azalan bakiyeler karşılaştırması |
| `Ex3 Passenger Car` | Binek otomobil: 2026 tavanları, kıst amortisman, iki alım yapısı |
| `Ex4 Revaluation` | VUK Mük. 298/Ç yeniden değerleme ve amortismana etkisi |
| `Ex5 Intangibles` | Yazılım, lisans, özel maliyet bedeli, şerefiye |
| `Sources` | Yasal kaynaklar |

## Doğrulama durumu

Bu iki dosya teslim edilmeden önce şunlardan geçti:

```bash
python3 verify_xlsx.py    # 547 formül, 0 hata, 24 beklenen-değer kontrolü
python3 audit_pptx.py     # geometri denetimi: 0 bulgu
python3 "<pptx-skill>/scripts/office/validate.py" TR-Depreciation-Amortisation-HQ-Briefing.pptx
```

- **Excel:** her formül gerçekten hesaplandı (`formulas` kütüphanesiyle), sonuçlar elle hesaplanmış beklenen değerlerle karşılaştırıldı. Hepsi tutuyor.
- **Sunum:** şema doğrulaması geçti; slayt dışına taşan öğe, çakışan metin kutusu ve taşma riski yok; kenar boşlukları en az 0,5 inç.
- **Tutarlılık:** sunumdaki 17 kritik sayının tamamının modelle eşleştiği programatik olarak kontrol edildi.

### Yapılamayan kontrol

Görsel kontrol (slaytları görüntüye çevirip gözle bakma) **yapılamadı**: bu ortamda LibreOffice minimal bir dosyayı bile açamıyor. Yerine geometrik denetim yazıldı (`audit_pptx.py`) ve temiz geçti, ama bu gözle bakmanın tam karşılığı değil. **Merkeze göndermeden önce sunumu bir kez kendin aç ve göz gezdir.**

## Önemli uyarı

Bu dosyalar çalışma materyalidir, vergi danışmanlığı değildir. İki nokta özellikle:

1. **Hadler her Ocak ayında değişir.** Doğrudan gider yazma sınırı ve binek otomobil tavanları yeniden belirlenir. `Assumptions` sekmesini güncelle, model kendini yeniler.
2. **Faydalı ömürler varlık ve sektör bazındadır.** Modeldeki oranlar yaygın örneklerdir. Bağlayıcı olan, 333 sıra no.lu VUK Genel Tebliği ekindeki (339, 345, 365, 389, 399, 406, 418, 439, 458 ile değişik) birkaç yüz satırlık Amortisman Listesi'dir. Beyan öncesi her varlık için ilgili satırı teyit et.

## Kaynaklar

Araştırma 2026-09-15 tarihinde yapıldı. Başlıca doğrulanan noktalar:

- Doğrudan gider yazma haddi 2026: **12.000 TL** (VUK 313)
- Enflasyon düzeltmesi **2025, 2026 ve 2027'de uygulanmayacak**: 7571 sayılı Kanun md. 34 ile eklenen VUK Geçici 37 (RG 25.12.2025, 33118)
- 2025 yeniden değerleme oranı: **%25,49** (585 sıra no.lu VUK GT, RG 27.11.2025)
- Binek otomobil 2026 tavanları: 1.380.000 / 2.600.000 / 1.200.000 TL, aylık kira 46.000 TL (GVK md. 40; 332 seri no.lu GVK GT)
- Azalan bakiyeler: normal oranın iki katı, **%50 tavanlı** (VUK Mük. 315)
- Faydalı ömür seçimi: resmi ömrün **iki katına ve 50 yıla** kadar uzatılabilir (VUK 320, 7338 sayılı Kanun)

Tam liste sunumun son slaytında ve Excel'in `Sources` sekmesinde.
