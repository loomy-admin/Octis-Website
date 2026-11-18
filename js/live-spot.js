(function () {
  var TROY_G = 31.1034768;
  var original = window.fetch.bind(window);

  window.fetch = function (input, init) {
    var url = requestUrl(input);
    if (url.indexOf("/api/rates.json") === -1) return original(input, init);
    return original(input, init)
      .then(function (response) { return response.json(); })
      .then(function (base) {
        return original("https://xaus.com/api/v1/spot?currency=INR&unit=gram")
          .then(function (response) {
            if (!response.ok) throw new Error("spot");
            return response.json();
          })
          .then(function (spot) {
            return jsonResponse(applySpot(base, spot));
          })
          .catch(function () { return jsonResponse(base); });
      });
  };

  function requestUrl(input) {
    if (typeof input === "string") return input;
    if (typeof URL !== "undefined" && input instanceof URL) return input.href;
    return (input && input.url) || "";
  }
  function jsonResponse(data) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  function applySpot(base, spot) {
    var perGram = spot && spot.xau && Number(spot.xau.price);
    var fx = Number(spot && spot.fx_rate);
    var silverOz = Number(spot && spot.silver_usd_oz);
    if (!perGram || !fx || !silverOz) return base;

    var fine10 = perGram * 10;
    var quote995 = Math.round(fine10 * 995 / 999);
    var silverKg = Math.round(silverOz * fx / TROY_G * 1000);
    var gold24 = Math.round(fine10);
    var when = spot.price_as_of || spot.updated_at || new Date().toISOString();
    var ist = new Date(Date.parse(when) + 5.5 * 60 * 60 * 1000);
    var weekday = ist.getUTCDay();
    var minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
    var closed = weekday === 0 || weekday === 6 || minutes < 9 * 60 || minutes > 23 * 60 + 30;
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var stamp = days[weekday].slice(0, 3) + " " + ist.getUTCDate() + " " + months[ist.getUTCMonth()] + ", " + clock(ist);
    var rates = {
      "24": level(gold24, true),
      "22": level(Math.round(gold24 * 0.916), true),
      "18": level(Math.round(gold24 * 0.75), true),
      "14": level(Math.round(gold24 * 0.585), true),
      "9": level(Math.round(gold24 * 0.375), true),
      silver: level(silverKg, false)
    };

    base.quoted = base.quoted || { gold: {}, silver: {} };
    base.quoted.gold.bid = quote995;
    base.quoted.gold.ask = quote995;
    base.quoted.silver.bid = silverKg;
    base.quoted.silver.ask = silverKg;
    base.rates = rates;
    base.at = when;
    base.updatedAt = when;
    base.time = clock(ist);
    base.dayTime = stamp;
    base.changedAt = stamp;
    base.lastChange = "Last change seen · " + stamp + " IST";
    if (closed) {
      base.closedDay = days[weekday];
      base.stripStatus = "Market closed · showing " + days[weekday] + "'s rate · " + stamp + " IST";
    } else {
      delete base.closedDay;
      base.stripStatus = "Live · " + stamp + " IST";
    }
    if (base.daily) {
      pushDay(base.daily.gold, when.slice(0, 10), gold24);
      pushDay(base.daily.silver, when.slice(0, 10), silverKg);
    }
    return base;
  }

  function level(rate, workedOut) {
    return { rate: rate, high: rate, low: rate, workedOut: workedOut };
  }

  function pushDay(list, day, close) {
    if (!list || !list.length || !day) return;
    var last = list[list.length - 1];
    if (last.d === day) {
      last.c = close;
      last.h = Math.max(last.h, close);
      last.l = Math.min(last.l === 1 ? close : last.l, close);
      return;
    }
    if (day > last.d) {
      list.push({
        d: day,
        o: last.c,
        h: Math.max(last.c, close),
        l: Math.min(last.c, close),
        c: close,
        src: "est"
      });
    }
  }

  function clock(ist) {
    var hour = ist.getUTCHours();
    var minute = String(ist.getUTCMinutes()).padStart(2, "0");
    var suffix = hour >= 12 ? "pm" : "am";
    var hour12 = hour % 12 || 12;
    return hour12 + ":" + minute + " " + suffix;
  }
})();
