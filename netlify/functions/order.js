// يستقبل الطلب، يعيد حساب السعر من data.js (لا يثق بالمتصفح)، ثم يرسله لتلجرام.
// المتغيرات المطلوبة في Netlify (Environment variables): TELEGRAM_TOKEN و TELEGRAM_CHAT_ID
const data = require("../../data.js");

const reply = (code, body) => ({
  statusCode: code,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
const clean = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return reply(405, { error: "طريقة غير مسموحة" });
  if (!process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_CHAT_ID)
    return reply(500, { error: "الخدمة غير مهيأة، تواصل معنا مباشرة." });

  let o;
  try { o = JSON.parse(event.body || "{}"); } catch { return reply(400, { error: "بيانات غير صالحة" }); }
  if (o.website) return reply(200, { ok: true }); // honeypot

  const name = clean(o.fullName, 80);
  const phone = String(o.phone || "").replace(/[\s.-]/g, "");
  const commune = clean(o.commune, 80);
  const address = clean(o.address, 200);
  const size = Number(o.size);
  const qty = String(o.quantity);
  const stateNum = String(o.state || "").split(" ")[0];
  const type = o.deliveryType === "office" ? "office" : "home";

  const offer = data.offers[qty];
  const d = data.delivery[stateNum];
  const stateName = data.states[Number(stateNum) - 1];

  if (name.length < 3 || !/^0[567]\d{8}$/.test(phone) || commune.length < 2 || !offer || !d || !stateName || !data.product.sizes.includes(size))
    return reply(400, { error: "بيانات الطلب غير صحيحة، راجع الحقول." });
  const ship = d[type];
  if (ship === null || ship === undefined) return reply(400, { error: "هذا النوع من التوصيل غير متاح لهذه الولاية." });

  const total = offer.price + ship;
  const id = Date.now().toString(36).toUpperCase().slice(-6);
  const text = [
    `🛒 طلب جديد #${id}`,
    `👟 ${data.product.name}`,
    `👤 ${name}`,
    `📞 ${phone}`,
    `📍 ${stateNum} - ${stateName} / ${commune}`,
    address ? `🏠 ${address}` : "",
    `🚚 ${type === "office" ? "مكتب" : "منزل"}: ${ship} دج`,
    `📏 المقاس: ${size} | العرض: ${offer.label}`,
    `💰 المنتج: ${offer.price} + التوصيل ${ship}`,
    `✅ الإجمالي: ${total} دج (الدفع عند الاستلام)`,
  ].filter(Boolean).join("\n");

  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }), // بدون parse_mode عمداً
    });
    if (!r.ok) throw new Error("telegram " + r.status);
  } catch (e) {
    console.error(e.message);
    return reply(502, { error: "تعذر إرسال الطلب الآن، حاول مرة أخرى." });
  }
  return reply(200, { ok: true, id, total });
};
