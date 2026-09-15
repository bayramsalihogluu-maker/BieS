import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePlan } from "../scripts/lib/dogrula.mjs";

const gecerliPlan = `
## Bölüm A · İşler

| # | İş | Girdisi | Çıktısı | YAZACAĞI dosyalar |
|---|---|---|---|---|
| 1 | oku | - | a.md | isler/1/a.md |
| 2 | oku | - | b.md | isler/2/b.md |
| 3 | birleştir | 1,2 çıktısı | c.md | isler/3/c.md |

## Bölüm C · Dalgalar

| Dalga | İşler | Aynı anda mı | Neden |
|---|---|---|---|
| 1 | 1, 2 | evet | ikisi de bağımsız |
| 2 | 3 | tek | dalga 1'i bekliyor |
`;

const catismaliPlan = `
## Bölüm A · İşler

| # | İş | Girdisi | Çıktısı | YAZACAĞI dosyalar |
|---|---|---|---|---|
| 1 | yaz | - | rapor.md | ortak/rapor.md |
| 2 | yaz | - | rapor.md | ortak/rapor.md |

## Bölüm C · Dalgalar

| Dalga | İşler | Aynı anda mı | Neden |
|---|---|---|---|
| 1 | 1, 2 | evet | bağımsız sanıldı |
`;

const asiriKalabalikPlan = `
## Bölüm A · İşler

| # | İş | Girdisi | Çıktısı | YAZACAĞI dosyalar |
|---|---|---|---|---|
| 1 | a | - | a.md | isler/1/a.md |
| 2 | b | - | b.md | isler/2/b.md |
| 3 | c | - | c.md | isler/3/c.md |
| 4 | d | - | d.md | isler/4/d.md |
| 5 | e | - | e.md | isler/5/e.md |

## Bölüm C · Dalgalar

| Dalga | İşler | Aynı anda mı | Neden |
|---|---|---|---|
| 1 | 1, 2, 3, 4, 5 | evet | hepsi bağımsız |
`;

const sirali_ama_ayni_dosya = `
## Bölüm A · İşler

| # | İş | Girdisi | Çıktısı | YAZACAĞI dosyalar |
|---|---|---|---|---|
| 1 | sil | - | - | veritabani |
| 2 | sil | - | - | veritabani |

## Bölüm C · Dalgalar

| Dalga | İşler | Aynı anda mı | Neden |
|---|---|---|---|
| 1 | 1 | SIRALI | geri alınamaz |
| 2 | 2 | SIRALI | geri alınamaz, 1'den sonra |
`;

test("geçerli plan hatasız geçer", () => {
  const { errors, warnings, jobs, waves } = validatePlan(gecerliPlan);
  assert.equal(errors.length, 0, errors.join("; "));
  assert.equal(Object.keys(jobs).length, 3);
  assert.equal(waves.length, 2);
});

test("aynı dalgada aynı dosyaya yazan iki iş hata verir", () => {
  const { errors } = validatePlan(catismaliPlan);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /ortak\/rapor\.md/);
});

test("dalga başına 4 iş sınırı aşılırsa hata verir", () => {
  const { errors } = validatePlan(asiriKalabalikPlan);
  assert.ok(errors.some((e) => /en fazla 4/.test(e)));
});

test("SIRALI işaretli dalgalarda aynı dosyaya yazma serbesttir", () => {
  const { errors } = validatePlan(sirali_ama_ayni_dosya);
  assert.equal(errors.length, 0, errors.join("; "));
});

test("dalgada geçip Bölüm A'da olmayan iş hata verir", () => {
  const plan = `
## Bölüm A · İşler

| # | İş | Girdisi | Çıktısı | YAZACAĞI dosyalar |
|---|---|---|---|---|
| 1 | a | - | a.md | isler/1/a.md |

## Bölüm C · Dalgalar

| Dalga | İşler | Aynı anda mı | Neden |
|---|---|---|---|
| 1 | 1, 9 | evet | 9 asla tanımlanmadı |
`;
  const { errors } = validatePlan(plan);
  assert.ok(errors.some((e) => /iş 9/.test(e)));
});
