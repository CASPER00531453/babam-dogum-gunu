# İyi ki Doğdun Babacığım 🎂

13 Ekim 1978 doğumlu babam için hazırlanmış, kırmızı-beyaz temalı, animasyonlu doğum günü sitesi.

## Neler var?
- 🎁 Açılışta hediye kutusu, konfeti ve Web Audio ile çalınan "İyi ki doğdun" melodisi
- ⏱️ Canlı yaş sayacı (yıl / ay / gün / saat / dakika / saniye)
- 📊 Hayat istatistikleri: yaşanan gün, kalp atışı, nefes, içilen çay, adım, Güneş etrafında yol... (canlı artar)
- 📅 Doğduğu gün, burç, Çin burcu ve 1978'den olaylar
- 🛤️ Zaman çizelgesi
- 🖼️ Fotoğraf galerisi + tıklayınca açılan lightbox (oklar, klavye, kaydırma, slayt gösterisi)
- 🕯️ Üflenebilen mumlu pasta, sonraki doğum gününe geri sayım, mektup
- 🔒 `/panel` — şifreli fotoğraf yükleme / silme paneli

## Vercel'e kurulum
1. [vercel.com/new](https://vercel.com/new) → bu GitHub reposunu içe aktar (Framework: **Other**, ayar değiştirmeye gerek yok) → Deploy.
2. Proje sayfasında **Storage → Create → Blob** ile bir Blob deposu oluştur ve projeye bağla
   (bu, `BLOB_READ_WRITE_TOKEN` ortam değişkenini otomatik ekler).
3. **Settings → Environment Variables** kısmına `PANEL_PASSWORD` = (istediğin şifre) ekle.
4. **Deployments → Redeploy** yap.
5. `https://<site-adın>.vercel.app/panel` adresine gir, şifreyle giriş yap ve fotoğrafları yükle.

Fotoğraflar tarayıcıda otomatik küçültülür (en fazla 2000px, JPEG) ve Vercel Blob'a kaydedilir.

## Dosyalar
- `index.html`, `assets/style.css`, `assets/app.js` — site
- `panel.html` — yükleme paneli
- `api/` — Vercel serverless fonksiyonları (`photos`, `upload`, `auth`)

Mektup metnini değiştirmek için `index.html` içindeki "Sana Bir Mektup" bölümünü düzenleyebilirsin.
