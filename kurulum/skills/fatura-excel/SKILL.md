---
name: fatura-excel
description: Bir klasördeki faturalardan Excel kayıt tablosu (fatura icmali) üretir. Kullanıcı bir klasör gösterip "bu faturaların excelini çıkar", "fatura listesi hazırla", "icmal yap", "yeni faturaları ekle" dediğinde kullan. PDF, görsel ve elektronik fatura dosyalarını okur, tutarları çıkarır, KDV kontrolü yapar ve her ay aynı sütun düzeniyle tablo üretir. Aylık tekrarlayan muhasebe işidir; ay adı geçmesi (Eylül, September) tipik işarettir.
---

# Fatura klasöründen Excel icmal

Her ay aynı iş: klasöre faturalar düşer, bunlardan tek bir tablo çıkar. İşin zor kısmı okumak değil, **aylar arasında tutarlı kalmak** ve **okunamayan bir alanı uydurmamak**.

## Değişmez kurallar

**Okuyamadığın alanı uydurma.** Bir tutar silikse, tarih kesilmişse, fatura numarası net değilse: hücreye tahmin yazma. `?` yaz ve `Kontrol` sütununa neyi okuyamadığını yaz. Uydurulmuş tek bir tutar, tablonun tamamını güvenilmez yapar.

**Sütun düzeni her ay aynı.** Kullanıcı bu tabloları birleştirecek. Sütun ekleme, çıkarma ya da sırasını değiştirme; yeni bir alan gerekiyorsa sona ekle ve kullanıcıya söyle.

**Hesaplamayı Excel yapsın.** Toplamları Python'da hesaplayıp hücreye yazma. `=SUM(...)` yaz. Kullanıcı bir satırı düzeltince toplam kendiliğinden güncellensin.

**Para birimini karıştırma.** Farklı para birimleri varsa toplamları ayrı ayrı ver. Kur dönüşümü yapma, kullanıcı istemediyse. İstediyse hangi kuru hangi tarihten aldığını yaz.

## Adımlar

### 1. Klasörü tara, ne olduğunu söyle

Dosyaları listele ve işe başlamadan önce kullanıcıya rapor ver:

```
14 dosya bulundu
  PDF: 11   ·   JPG/PNG: 2   ·   XLSX: 1
  Okunamayan / şifreli: 0
```

Zaten bir icmal dosyası varsa onu da söyle: ekleme mi yapılacak, yeniden mi üretilecek, sor. **"Yine ekledim" denmişse varsayılan: mevcut dosyayı koru, yeni faturaları ekle, mükerrer kontrolü yap.**

### 2. Her faturadan şu alanları çıkar

| Sütun | Not |
|---|---|
| `Sıra` | 1'den artan |
| `Fatura Tarihi` | GG.AA.YYYY |
| `Fatura No` | Tam olarak belgedeki hali |
| `Satıcı / Tedarikçi` | Ticari unvan |
| `VKN / TCKN` | Varsa |
| `Açıklama` | Mal/hizmet, kısa |
| `Para Birimi` | TRY / USD / EUR / CNY |
| `Matrah` | KDV hariç tutar |
| `KDV Oranı` | %20, %10, %1, %0 |
| `KDV Tutarı` | |
| `Toplam` | Formül: matrah + KDV |
| `Belge Tipi` | e-Fatura / e-Arşiv / kağıt / proforma |
| `Dosya Adı` | Kaynağa geri gidebilmek için |
| `Kontrol` | Şüpheli/eksik alan notu. Temizse boş. |

PDF'ten metin çıkar; metin yoksa (taranmış belge) görsel olarak oku. İkisi de olmuyorsa dosyayı `Kontrol` sütununda "okunamadı" diye işaretle, atlamadan tabloya koy. Atlanan fatura, görünmeyen eksiktir.

### 3. Excel'i kur

- `Faturalar` sekmesi: yukarıdaki tablo, başlık satırı dondurulmuş, filtre açık
- `Toplam` sütunu formül: `=matrah+kdv`
- Tablo altında toplam satırı: `=SUBTOTAL(109; ...)` kullan ki filtreleme toplamı bozmasın
- `Özet` sekmesi: para birimine göre toplam, KDV oranına göre kırılım, tedarikçiye göre ilk 10
- Tutar biçimi `#,##0.00`, tarih biçimi `GG.AA.YYYY`
- Şüpheli satırları sarı dolgu ile işaretle

### 4. Kontrolleri çalıştır, sonucu yaz

Teslimden önce şunları koşturup sonucunu kullanıcıya bildir:

1. **KDV aritmetiği:** her satırda `matrah × oran ≈ KDV tutarı` mı? Sapan satırları listele. Yuvarlama için ±0,02 tolerans ver.
2. **Toplam tutarlılığı:** `matrah + KDV = toplam` her satırda tutuyor mu?
3. **Mükerrer:** aynı fatura no + aynı tedarikçi iki kez var mı? Bu en sık hatadır, özellikle "yine ekledim" akışında.
4. **Eksik alan:** tarih, no, tutar boş olan satırlar.
5. **Tarih aralığı:** beklenen ay dışına düşen fatura var mı? (Eylül klasöründe Ağustos faturası olabilir, ama bilerek olmalı.)
6. **Dosya sayısı:** klasördeki fatura sayısı ile tablodaki satır sayısı eşleşiyor mu?

Sonra formülleri gerçekten hesaplat. `openpyxl` formülü metin olarak yazar, önbelleğe değer koymaz; doğrulamadan teslim edersen formül hatasını göremezsin.

```python
import formulas
sol = formulas.ExcelModel().loads(PATH).finish().calculate()
# #REF!, #VALUE!, #NAME?, #DIV/0! ara
```

LibreOffice varsa `recalc.py` daha hızlıdır.

### 5. Raporla

```
Fatura icmali hazır: <dosya yolu>

İşlenen       : 14 fatura
Toplam matrah : 1.248.300,00 TRY  ·  12.400,00 EUR
Toplam KDV    :   249.660,00 TRY  ·   2.480,00 EUR
Genel toplam  : 1.497.960,00 TRY  ·  14.880,00 EUR

Kontroller
  KDV aritmetiği     : 14/14 tutuyor
  Mükerrer fatura    : yok
  Eksik alan         : 1 satır (bkz. Kontrol sütunu)
  Dosya/satır eşleşme: 14/14

Bakman gerekenler
  - Satır 7: fatura tarihi silik, 03.09.2026 okudum ama teyit et
```

**Kontrolden geçmeyen bir şey varsa "hazır" deme.** Önce neyin tutmadığını yaz.

## Tekrar çalıştırma (en sık senaryo)

"Yine yeni faturalar ekledim" dendiğinde:

1. Mevcut Excel'i oku, hangi `Dosya Adı` değerlerinin zaten işlendiğini çıkar
2. Klasörü tara, **yalnız yeni dosyaları** işle
3. Yeni satırları mevcut tablonun sonuna ekle, sıra numarasını devam ettir
4. Mükerrer kontrolünü **tüm tablo üzerinde** tekrar koştur
5. Özet sekmesini güncelle
6. Kaç satır eklendiğini ve yeni toplamları yaz

Mevcut dosyanın üzerine yazmadan önce yanına zaman damgalı yedek bırak. Kullanıcı elle düzeltme yapmış olabilir; o düzeltmeleri ezme.

## Bilinen tuzaklar

- **Etiket metni `=` ile başlamasın.** Excel onu formül sanıp `#NAME?` verir.
- **Türkçe ondalık ayracı virgüldür.** `1.248,50` okurken binlik ayracı nokta, ondalık virgül. Yanlış ayrıştırırsan tutar bin katına çıkar; bu sessiz ve ağır bir hatadır.
- **Proforma fatura, fatura değildir.** Belge tipini ayır, toplamlara proformayı katarken kullanıcıya sor.
- **İade/iptal faturaları negatif olabilir.** Eksi tutarı mutlak değere çevirme.
- **e-Fatura PDF'leri bazen iki sayfalıdır**; ikinci sayfa aynı faturanın devamıdır, ayrı fatura olarak sayma.
