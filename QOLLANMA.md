# Verdant RMS - Foydalanuvchi Qo'llanmasi

Ushbu qo'llanma **Verdant RMS (Choyxona va Restoranlar boshqaruvi tizimi)** dan qanday qilib to'g'ri foydalanishni o'rganishingiz uchun yozilgan. Tizim sodda, tezkor va xavfsiz ishlashga mo'ljallangan.

---

## 📌 Asosiy Sahifalar

Tizimga kirganingizda chap tomonda quyidagi bo'limlarni ko'rasiz:
1. **Asosiy (Dashboard)** - Umumiy statistika va xabarnomalar.
2. **Sotuv (Kassa)** - Buyurtmalar olish va hisob-kitob qilish.
3. **Moliya** - Xarajatlar, qarzlar va kassa qoldig'i.
4. **Ombor** - Mahsulotlar qoldig'i va kirim-chiqim.
5. **Stollar** - Kabina va tapchanlarni boshqarish.
6. **Bron (Joy band qilish)** - Oldindan buyurtma qilingan stollar.
7. **Xodimlar** - Xodimlar ro'yxati va ularning oyliklari.

---

## 🍽 1. Sotuv (Buyurtma olish va Chek yopish)

Bu bo'lim kassir va ofitsiantlar uchun eng ko'p ishlatiladigan asosiy oyna hisoblanadi.

### Buyurtma qabul qilish:
1. **Stolni tanlash:** Ekranda barcha *Kabina*, *Tapchan* va *Stollar* ko'rinib turadi. Bo'sh stolni tanlang.
2. **Mahsulot qo'shish:** O'ng tomondagi menyudan kerakli taom yoki ichimlikni tanlang. Uni bir necha marta bosish orqali sonini ko'paytirishingiz yoki `+ / -` tugmalari orqali tahrirlashingiz mumkin.
3. Holati avtomatik tarzda "Band" (Qizil) ga o'zgaradi.

### To'lovni qabul qilish (Chekni yopish):
1. Mijoz hisob so'raganda, uning stoliga bosing va o'ng tomondagi **"To'lovni tasdiqlash"** tugmasini bosing.
2. Chiqqan oynada mijoz to'layotgan summani va to'lov turini (Naqd, Uzcard, Humo va h.k) kiriting. 
   - *Masalan: Chek 45 000 so'm, mijoz 50 000 so'm berdi. 50 000 deb kiritsangiz tizim o'zi 5 000 so'm qaytimni hisoblab beradi.*
3. Agar to'lov to'liq to'lansa, stol yana "Bo'sh" holatga qaytadi.

---

## 💰 2. Moliya (Kassa, Xarajat va Qarzlar)

Kassadagi pullar, qilingan xarajatlar va mijozlarga berilgan qarzlar shu bo'limdan boshqariladi.

- **Kassa qoldig'i:** Siz sotuv qilib chek yopganingizda pullar avtomatik shu yerda ko'payib boradi (Naqd alohida, Plastik alohida).
- **Xarajat qo'shish:** Kunlik bozor-o'char yoxud tozalash vositalari uchun pul sarflansa, "Xarajat qo'shish" tugmasini bosib summani va sababini yozing. Pul avtomatik ravishda kassadan yechib olinadi.
- **Qarzlar (Nasiya):** Tanish mijozlar qarzga ovqatlansa, ularning ismini va qarz summasini "Qarzdor qo'shish" orqali kiritib qo'ying. Ular qarzni olib kelganda, "Qarz to'lash" tugmasi orqali to'lovni qabul qilasiz.

---

## 📦 3. Ombor (Kirim va Chiqim)

Mahsulotlarni nazorat qilish bo'limi.

- **Kirim qilish:** Bozor yoki ta'minotchidan mahsulot kelganda, "Kirim" tugmasini bosib miqdori va sotib olingan narxini yozing.
- **Tugab qolayotgan mahsulotlar:** Tizim "Asosiy (Dashboard)" oynasida qaysi mahsulotlar tugab qolayotganini avtomat eslatib turadi. Bu orqali bemalol bozordan faqat kerakli narsalarni xarid qilishingiz mumkin.
- *Eslatma:* Chek yopilganda, sotilgan mahsulotlar ombordan o'z-o'zidan (avtomatik) kamayadi!

---

## 📅 4. Bron (Oldindan band qilish)

Mijoz telefon qilib joy tayyorlab qo'yishni so'raganda ishlatiladi.

1. "Yangi Bron" tugmasini bosing.
2. Mijoz ismini, telefon raqamini, kelish vaqtini va qaysi Stol (yoki Kabina) kerakligini tanlang.
3. Vaqti yaqinlashganda tizim sizga xabar beradi.
4. Mijoz kelganda "Keldi" tugmasini bossangiz, tanlangan stol avtomatik ravishda uning nomiga ochiladi va Sotuv bo'limiga o'tadi.

---

## 📊 5. Asosiy (Dashboard)

Rahbariyat va menejerlar uchun eng kerakli oyna:
- Bugun qancha tushum bo'ldi?
- Qancha xarajat qilindi?
- Sof foyda qancha?
- Hozir qaysi stollarda mijozlar o'tiribdi?
Bularning barchasi bir qarashda ko'zga tashlanadigan grafiklar bilan ko'rsatib turiladi.

---

### 💡 Kundalik ishlarni boshlash:
1. Ishga kelganda `3_run.bat` faylini ikki marta bosing.
2. Ochiq qora darchalarni yopmang (orqa fonda ishlashi uchun kerak).
3. Brauzerda tizim ochilgach bemalol Sotuv (Kassa) ni boshlayvering!

### 💡 Ishni yakunlash:
1. Kunning oxirida "Moliya" bo'limiga kirib hisob-kitoblarni tekshirib oling.
2. "Shift (Smena) ni yopish" yoxud brauzerni yopib, qora darchalarni (CMD) yopishingiz mumkin.
3. Agar ulangan bo'lsa, barcha ma'lumot va hisobotlar Telegram rahbarbotiga avtomatik yuboriladi.

---
**Yordam kerak bo'lsa tizim administratoriga murojaat qiling!**
