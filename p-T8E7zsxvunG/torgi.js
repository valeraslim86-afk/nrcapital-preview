(function () {
  var D = window.TORGI;
  if (!D) return;
  var $ = function (id) { return document.getElementById(id); };
  var sel = $("t-region"), kind = $("t-kind"), minS = $("t-min");
  var out = $("t-out"), cnt = $("t-count"), upd = $("t-upd"), cta = $("t-cta");

  Object.keys(D.regions).forEach(function (r) {
    var o = document.createElement("option");
    o.value = r; o.textContent = r; sel.appendChild(o);
  });
  if (D.bot) { cta.href = D.bot; }
  upd.textContent = "Данные обновлены: " + D.updated + ". Источник: публичные торговые площадки.";

  function plural(n, a, b, c) {
    var m = n % 100, d = n % 10;
    if (m > 10 && m < 20) return c;
    if (d === 1) return a;
    if (d > 1 && d < 5) return b;
    return c;
  }

  function collect() {
    var reg = sel.value, k = kind.value, min = parseInt(minS.value, 10) || 0;
    var sale = 0, rent = 0, items = [];
    function push(list, kd, region) {
      list.forEach(function (s) { if (s >= min) items.push({ s: s, k: kd, r: region }); });
    }
    if (reg === "all") {
      Object.keys(D.regions).forEach(function (r) { sale += D.regions[r].sale; rent += D.regions[r].rent; });
      if (k !== "RENT") D.ts.forEach(function (x) { if (x[0] >= min) items.push({ s: x[0], k: "SALE", r: x[2] }); });
      if (k !== "SALE") D.tr.forEach(function (x) { if (x[0] >= min) items.push({ s: x[0], k: "RENT", r: x[2] }); });
    } else {
      var R = D.regions[reg];
      sale = R.sale; rent = R.rent;
      if (k !== "RENT") push(R.ts, "SALE", reg);
      if (k !== "SALE") push(R.tr, "RENT", reg);
    }
    items.sort(function (a, b) { return b.s - a.s; });
    var total = k === "SALE" ? sale : (k === "RENT" ? rent : sale + rent);
    return { items: items.slice(0, 8), total: total, sale: sale, rent: rent };
  }

  function render() {
    var r = collect();
    var word = plural(r.total, "лот", "лота", "лотов");
    cnt.textContent = "Сейчас на торгах: " + r.total.toLocaleString("ru-RU") + " " + word +
      " (продажа " + r.sale.toLocaleString("ru-RU") + ", аренда " + r.rent.toLocaleString("ru-RU") + ")";
    var mn = parseInt(minS.value, 10) || 0;
    if (mn > 0) cnt.textContent += ". Ниже лучшие лоты с оценкой от " + mn;
    out.innerHTML = "";
    if (!r.items.length) {
      var e = document.createElement("p");
      e.className = "lead";
      e.textContent = "По таким условиям лотов нет. Попробуйте снизить минимальный балл или выбрать другой регион.";
      out.appendChild(e);
      return;
    }
    r.items.forEach(function (it) {
      var c = document.createElement("div");
      c.className = "card tz";
      var b = document.createElement("span");
      b.className = "tz-score " + (it.s >= 85 ? "hi" : (it.s >= 70 ? "mid" : "lo"));
      b.textContent = it.s + " / 100";
      var t = document.createElement("div");
      t.className = "tz-t";
      t.textContent = it.r;
      var k = document.createElement("div");
      k.className = "tz-k";
      k.textContent = (it.k === "RENT" ? "Аренда" : "Продажа") + " · адрес, цена и ссылка на торги - в боте";
      c.appendChild(b); c.appendChild(t); c.appendChild(k);
      out.appendChild(c);
    });
  }

  [sel, kind, minS].forEach(function (el) { el.addEventListener("change", render); });
  render();
})();
