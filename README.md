# OLVARO STORE

صفحة هبوط لمنتج واحد، الطلبات تصل إلى بوت تلجرام عبر Netlify Function (التوكن مخفي ولا يظهر للزوار).

## الملفات
- `index.html`: الواجهة (التصميم والمنطق في ملف واحد).
- `data.js`: **كل ما تعدّله**: السعر، الوصف، الصور، المقاسات، العروض، أسعار التوصيل، روابط التواصل.
- `netlify/functions/order.js`: يتحقق من الطلب ويعيد حساب السعر ويرسله لتلجرام.
- `assets/images/`: الصور (`logo.jpg` و`product-1.jpg` ... `product-4.jpg`).

## التعديل (من data.js فقط)
افتح `data.js` بمحرر نصوص وعدّل القيم بين علامات الاقتباس، ولا تحذف الفواصل والأقواس. الصفحة تعمل أيضاً بفتح `index.html` مباشرة للمعاينة.
- الاسم والسعر: `product.name`, `product.price`, `product.oldPrice`.
- الوصف والمميزات: `product.description`, `product.features`.
- الصور: ضع الصور في `assets/images/` واكتب مساراتها في `product.images` (الأولى هي الرئيسية).
- المقاسات: `product.sizes`. العروض: `offers` (غيّر `price` لكل عرض).
- التوصيل: `delivery` (رقم الولاية: `home` و`office`)، و`null` يعني غير متاح.
- التواصل: `whatsapp` و`phone` و`email`.
> عند تغيير السعر غيّره في `product.price` و`offers` معاً.

## إنشاء البوت
1. في تلجرام افتح `@BotFather` ثم `/newbot` وانسخ **التوكن**.
2. افتح بوتك وأرسل له أي رسالة.
3. افتح في المتصفح `https://api.telegram.org/bot<TOKEN>/getUpdates` وانسخ قيمة `chat.id`.
> التوكن سر: لا تضعه في أي ملف داخل المشروع ولا ترفعه إلى GitHub.

## النشر على Netlify (عبر GitHub)
1. ارفع المجلد إلى مستودع GitHub.
2. في Netlify: Add new site ← Import from Git ← اختر المستودع (لا تغيّر الإعدادات).
3. Site configuration ← Environment variables وأضف `TELEGRAM_TOKEN` و`TELEGRAM_CHAT_ID`.
4. Deploys ← Trigger deploy، ثم جرّب طلباً.
> سحب المجلد في Netlify Drop لا يشغّل الـFunctions، لذا استعمل GitHub.

## الاختبار محلياً
1. انسخ `.env.example` إلى `.env` واملأ القيمتين.
2. شغّل `npx netlify-cli dev` وافتح الرابط الظاهر (غالباً http://localhost:8888).
