#!/usr/bin/env python3
"""Evaluate every formula in the workbook and report errors plus key results.

LibreOffice cannot run in this sandbox, so recalc.py is unusable. This uses the
`formulas` library to actually compute the workbook, which is what we need:
proof that the formulas evaluate and that the numbers are the ones we intend.
"""

import sys
import formulas

PATH = "/home/user/BieS/raporlar/TR-Depreciation-Model-2026.xlsx"

xl = formulas.ExcelModel().loads(PATH).finish()
sol = xl.calculate()

ERR_TOKENS = ("#REF!", "#VALUE!", "#NAME?", "#DIV/0!", "#N/A", "#NUM!", "#NULL!")

values = {}
errors = []
for key, val in sol.items():
    if "'!" not in key:
        continue
    try:
        v = val.value[0, 0]
    except Exception:
        continue
    s = str(v)
    # "'[FILE.xlsx]SHEET'!A1"  ->  "SHEET!A1"
    short = key.split("]", 1)[-1].replace("'", "").upper()
    values[short] = v
    if any(t in s for t in ERR_TOKENS):
        errors.append((short, s))

print(f"Hücre sayısı: {len(values)}")
print(f"Hata sayısı : {len(errors)}")
if errors:
    print("\nHATALI HÜCRELER")
    for k, v in errors[:40]:
        print(f"  {k} -> {v}")

def g(ref):
    v = values.get(ref.replace("'",'').upper())
    if hasattr(v, "tolist"):
        v = v.tolist()
    return v

print("\n=== BEKLENEN DEĞER KONTROLLERİ ===")

checks = []

def chk(name, got, want, tol=0.51):
    ok = got is not None and abs(float(got) - want) <= tol
    checks.append(ok)
    print(f"  [{'OK ' if ok else 'HATA'}] {name}: hesaplanan={got}  beklenen={want}")

# --- Ex1: 4.800.000 / 10 yil, duz amortisman
chk("Ex1 yillik amortisman", g("EX1 STRAIGHT-LINE!B8"), 480000)
chk("Ex1 toplam amortisman", g("EX1 STRAIGHT-LINE!C22"), 4800000)
chk("Ex1 son yil NBV sifir", g("EX1 STRAIGHT-LINE!E21"), 0)

# --- Ex2: azalan bakiyeler, oran min(2*10%,50%)=20%
chk("Ex2 azalan oran", g("EX2 SL VS DECLINING!B8"), 0.20, tol=1e-9)
chk("Ex2 yil1 DB amortismani", g("EX2 SL VS DECLINING!G12"), 960000)
chk("Ex2 SL toplam", g("EX2 SL VS DECLINING!B22"), 4800000)
chk("Ex2 DB toplam", g("EX2 SL VS DECLINING!G22"), 4800000)
chk("Ex2 fark toplami (0 olmali)", g("EX2 SL VS DECLINING!J22"), 0)

# --- Ex3: binek otomobil, 2026 tavanlari, Nisan alimi (9 ay)
chk("Ex3 yil1 ay sayisi", g("EX3 PASSENGER CAR!B9"), 9, tol=1e-9)
chk("Ex3 A gider yazilan vergi (tavan)", g("EX3 PASSENGER CAR!C13"), 1200000)
chk("Ex3 A matrah (tavan)", g("EX3 PASSENGER CAR!C14"), 1380000)
chk("Ex3 A kanunen kabul edilmeyen", g("EX3 PASSENGER CAR!B15"), 1020000)
chk("Ex3 A yil1 kist amortisman", g("EX3 PASSENGER CAR!B19"), 207000)
chk("Ex3 A son yil bakiye", g("EX3 PASSENGER CAR!B24"), 69000)
chk("Ex3 A toplam = matrah", g("EX3 PASSENGER CAR!B25"), 1380000)
chk("Ex3 B matrah (tavan)", g("EX3 PASSENGER CAR!C29"), 2600000)
chk("Ex3 B yil1 kist amortisman", g("EX3 PASSENGER CAR!B34"), 390000)
chk("Ex3 B toplam = matrah", g("EX3 PASSENGER CAR!B40"), 2600000)

# --- Ex4: yeniden degerleme %25,49
chk("Ex4 yeni brut maliyet", g("EX4 REVALUATION!C12"), 4800000 * 1.2549)
chk("Ex4 fona alinan artis", g("EX4 REVALUATION!C15"), 3360000 * 0.2549)
chk("Ex4 yeni yillik amortisman", g("EX4 REVALUATION!C16"), 4800000 * 1.2549 / 10)
chk("Ex4 ek yillik indirim", g("EX4 REVALUATION!B17"), 4800000 * 1.2549 / 10 - 480000)

# --- Ex5: yazilim 3 yil vs lisans 15 yil
chk("Ex5 yazilim yillik", g("EX5 INTANGIBLES!D5"), 300000)
chk("Ex5 lisans yillik", g("EX5 INTANGIBLES!D6"), 60000)

print("\n=== KONTROL SATIRLARI ===")
for ref in ["EX1 STRAIGHT-LINE!G22", "EX2 SL VS DECLINING!J23",
            "EX3 PASSENGER CAR!C25", "EX3 PASSENGER CAR!C40"]:
    print(f"  {ref} -> {g(ref)}")

ok = len(errors) == 0 and all(checks)
print("\nSONUÇ:", "TÜM KONTROLLER GEÇTİ" if ok else "BAŞARISIZ")
sys.exit(0 if ok else 1)
