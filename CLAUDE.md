# LUMI (konsept demo)

DAB Labs Reels için hafif gazlı meyve suyu konsept sitesi. Marka, fiyatlar (₺55 kutu, 6/12/24'lü kasa) ve besin değerleri uydurma.

## Durum (17 Kasım 2026)
- Hero: kaydırmaya bağlı video (canvas + 379 WebP kare, `public/frames` 1280px telefonda, `public/frames-hd` 1920px geniş ekranda ve `?capture`'da; seçim main.js'te `hd`). Kaynak iki Flow (Veo) videosu: `Downloads/İçecek_rengini_kutuyla_eşleştir_4fea6f0d_1080p.mp4` (nane kutusu ekranı kırıp çıkıyor) + `Downloads/Mango_juice_washes_over_can_9628b7a4_1080p.mp4` (mango dalgası, sarı kutu). İkincinin ilk karesi birincinin son karesiyle aynı olduğu için atlandı.
- Hero metin aşamaları `data-in/data-out` (kaydırma oranı): giriş 0–0.10, "Önce kivi dayanamadı" 0.15–0.31, 01 Kivi & Nane 0.37–0.52, "Sonra mango dalgası" 0.56–0.71, 02 Mango & Çarkıfelek 0.80–1.
- Bölümler: #tatlar (iki kutu kartı), #icindekiler (koyu, besin tablosu), #siparis (kasa + tat seçimi, sepete ekle sahte). Görseller videodan kesilmiş kareler (`public/img`).
- Yazı tipi: Bricolage Grotesque. Renkler: nane #9fd2bb, mango #f4c13a, gece #0d1311, krem #f5f1e6.
- HD kareler: `unsharp=5:5:0.7`, WebP kalite 88 (32 MB). Kaynak videonun kendisi yumuşak (Flow 1080p çıktısı); daha keskin sonuç için Flow'dan daha yüksek çözünürlüklü çıktı ya da video büyütme gerekir.
- Bilinen: Flow kutunun küçük yazılarını anlamsız üretmiş ("COCOLD TKOE SOGE"); yakın karelerde okunabiliyor.

## Yerelde açma
`npm install` sonra `npx vite --port 5191 --host 127.0.0.1` → http://127.0.0.1:5191/ (`?p=0.5` hero'yu o noktada açar).
