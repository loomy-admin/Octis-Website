(function () {
  var KARATS = [24, 22, 18, 14, 9];
  var TOLA_G = 11.664;
  var inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  var desk = {
    gold24: { value: null, source: "empty", at: null },
    silver: { value: null, source: "empty", at: null },
    own: { 22: null, 18: null, 14: null, 9: null }
  };

  function factor(karat) {
    return Math.round((karat / 24) * 10000) / 10000;
  }

  function percentLabel(karat) {
    return (factor(karat) * 100).toFixed(2) + "%";
  }

  function money(value) {
    return inr.format(Math.round(value));
  }

  function parseAmount(raw) {
    var text = String(raw || "").replace(/,/g, "").trim();
    if (!text) return { empty: true };
    if (!/^\d+(\.\d+)?$/.test(text)) return { invalid: true };
    var value = Number(text);
    if (!Number.isFinite(value) || value < 0) return { invalid: true };
    return { value: value };
  }

  function stamp(date) {
    return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  }

  function rateOf(karat) {
    if (!desk.gold24.value && desk.gold24.value !== 0) return null;
    if (karat === 24) return { value: desk.gold24.value, source: desk.gold24.source, at: desk.gold24.at };
    if (desk.own[karat] && desk.own[karat].value != null) return desk.own[karat];
    return {
      value: Math.round(desk.gold24.value * factor(karat)),
      source: desk.gold24.source === "sample" ? "sample-derived" : "derived",
      at: desk.gold24.at
    };
  }

  function badge(source) {
    if (source === "you") return ["Entered by you", "is-you"];
    if (source === "sample") return ["Sample rate", "is-sample"];
    if (source === "sample-derived") return ["Worked out from the sample 24K rate", "is-derived"];
    if (source === "derived") return ["Worked out from your 24K rate", "is-derived"];
    return ["Not set", ""];
  }

  function paintRates() {
    KARATS.forEach(function (karat) {
      var card = document.querySelector('[data-rate="' + karat + '"]');
      var info = rateOf(karat);
      var mark = card.querySelector("[data-badge]");
      var when = card.querySelector("[data-when]");
      var shown = info ? badge(info.source) : badge("empty");
      mark.textContent = shown[0];
      mark.className = "badge " + shown[1];
      var input = card.querySelector("input");
      if (karat !== 24) {
        input.placeholder = info && (info.source === "derived" || info.source === "sample-derived")
          ? String(info.value)
          : "Optional own rate";
      }
      if (!info) {
        when.textContent = "No rate yet. Not a live feed.";
      } else if (info.source === "derived" || info.source === "sample-derived") {
        when.textContent = money(info.value) + " / 10 g · " + percentLabel(karat) + " of 24K. Not a traded quote.";
      } else {
        when.textContent = "Last edited " + stamp(info.at) + " · ₹ / 10 g · " + (info.source === "sample" ? "a round sample, not today’s market." : "the figure you typed.");
      }
    });
    var silver = document.querySelector('[data-rate="silver"]');
    var silverBadge = silver.querySelector("[data-badge]");
    var silverWhen = silver.querySelector("[data-when]");
    var silverMark = badge(desk.silver.source);
    silverBadge.textContent = silverMark[0];
    silverBadge.className = "badge " + silverMark[1];
    silverWhen.textContent = desk.silver.value == null
      ? "No rate yet. Not a live feed. Silver is ₹ / kg."
      : "Last edited " + stamp(desk.silver.at) + " · ₹ / kg · " + (desk.silver.source === "sample" ? "a round sample, not today’s market." : "the figure you typed.");
    paintMarquee();
    document.querySelectorAll("[data-sync]").forEach(function (form) { calculate(form); });
  }

  function paintMarquee() {
    var bits = KARATS.map(function (karat) {
      var info = rateOf(karat);
      var value = info ? money(info.value) + " / 10 g" : "not set";
      var kind = info ? badge(info.source)[0] : "Not set";
      return "<span><b>Gold " + karat + "K</b> " + value + " · " + kind + "</span>";
    });
    var silverValue = desk.silver.value == null ? "not set" : money(desk.silver.value) + " / kg";
    bits.push("<span><b>Silver 999</b> " + silverValue + " · " + badge(desk.silver.source)[0] + "</span>");
    bits.push("<span>No live rate service is connected. Figures are sample or typed on this page.</span>");
    var html = bits.join("");
    document.querySelectorAll("[data-marquee]").forEach(function (node) { node.innerHTML = html; });
  }

  function readRateInput(input) {
    var parsed = parseAmount(input.value);
    var key = input.dataset.desk;
    if (key === "24") {
      if (parsed.empty) desk.gold24 = { value: null, source: "empty", at: null };
      else if (parsed.invalid) return parsed;
      else desk.gold24 = { value: parsed.value, source: "you", at: new Date() };
      return parsed;
    }
    if (key === "silver") {
      if (parsed.empty) desk.silver = { value: null, source: "empty", at: null };
      else if (parsed.invalid) return parsed;
      else desk.silver = { value: parsed.value, source: "you", at: new Date() };
      return parsed;
    }
    var karat = Number(key);
    if (parsed.empty) desk.own[karat] = null;
    else if (parsed.invalid) return parsed;
    else desk.own[karat] = { value: parsed.value, source: "you", at: new Date() };
    return parsed;
  }

  document.querySelectorAll("[data-desk]").forEach(function (input) {
    input.addEventListener("input", function () {
      var parsed = readRateInput(input);
      input.setAttribute("aria-invalid", parsed && parsed.invalid ? "true" : "false");
      if (!(parsed && parsed.invalid)) paintRates();
    });
  });

  document.getElementById("use-sample").addEventListener("click", function () {
    desk.gold24 = { value: 100000, source: "sample", at: new Date() };
    desk.silver = { value: 100000, source: "sample", at: new Date() };
    desk.own = { 22: null, 18: null, 14: null, 9: null };
    document.querySelector('[data-desk="24"]').value = "100000";
    document.querySelector('[data-desk="silver"]').value = "100000";
    [22, 18, 14, 9].forEach(function (karat) {
      document.querySelector('[data-desk="' + karat + '"]').value = "";
    });
    paintRates();
  });

  document.getElementById("clear-rates").addEventListener("click", function () {
    desk.gold24 = { value: null, source: "empty", at: null };
    desk.silver = { value: null, source: "empty", at: null };
    desk.own = { 22: null, 18: null, 14: null, 9: null };
    document.querySelectorAll("[data-desk]").forEach(function (input) {
      input.value = "";
      input.setAttribute("aria-invalid", "false");
    });
    paintRates();
  });

  function field(form, name) {
    return form.elements[name];
  }

  function setError(form, message) {
    form.querySelector("[data-error]").textContent = message || "";
  }

  function lines(form, rows, work) {
    var box = form.querySelector("[data-lines]");
    box.hidden = false;
    box.querySelector("dl").innerHTML = rows.map(function (row) {
      return '<div class="' + (row.total ? "total" : "") + '"><dt>' + row.label + "</dt><dd>" + row.value + "</dd></div>";
    }).join("");
    box.querySelector("[data-work]").textContent = work;
  }

  function clearLines(form) {
    var box = form.querySelector("[data-lines]");
    box.hidden = true;
    box.querySelector("dl").innerHTML = "";
    box.querySelector("[data-work]").textContent = "";
  }

  function syncedRate(form) {
    var use = field(form, "useDesk");
    var input = field(form, "rate");
    if (use && use.checked) {
      input.readOnly = true;
      input.value = desk.gold24.value == null ? "" : String(desk.gold24.value);
    } else {
      input.readOnly = false;
    }
    return parseAmount(input.value);
  }

  function calculate(form) {
    var kind = form.dataset.calc;
    if (kind === "gold") return calcGold(form);
    if (kind === "old") return calcOld(form);
    if (kind === "purity") return calcPurity(form);
    if (kind === "gst") return calcGst(form);
  }

  function calcGold(form) {
    var rate = syncedRate(form);
    var weight = parseAmount(field(form, "weight").value);
    var making = parseAmount(field(form, "making").value);
    var wastage = parseAmount(field(form, "wastage").value);
    var gst = parseAmount(field(form, "gst").value);
    var karat = Number(field(form, "karat").value);
    if (rate.invalid || weight.invalid || making.invalid || wastage.invalid || gst.invalid) {
      clearLines(form);
      setError(form, "Use a zero or positive number. Letters and minus signs are left out of the estimate.");
      return;
    }
    if (gst.value > 100 || (making.value > 100 && field(form, "makingType").value === "percent") || wastage.value > 100) {
      clearLines(form);
      setError(form, "Percentages need to be between 0 and 100.");
      return;
    }
    if (rate.empty || weight.empty) {
      clearLines(form);
      setError(form, "Enter a 24K rate and a weight to see the estimate.");
      return;
    }
    var share = factor(karat);
    var metal = Math.round((rate.value / 10) * weight.value * share);
    var waste = Math.round(metal * ((wastage.empty ? 0 : wastage.value) / 100));
    var make = field(form, "makingType").value === "fixed"
      ? Math.round(making.empty ? 0 : making.value)
      : Math.round((metal + waste) * ((making.empty ? 0 : making.value) / 100));
    var taxable = metal + waste + make;
    var tax = Math.round(taxable * ((gst.empty ? 0 : gst.value) / 100));
    var total = taxable + tax;
    setError(form, "");
    lines(form, [
      { label: "Pure metal rate", value: money(Math.round((rate.value / 10) * share)) + " / g" },
      { label: "Metal value", value: money(metal) },
      { label: "Wastage", value: money(waste) },
      { label: "Making charges", value: money(make) },
      { label: "GST", value: money(tax) },
      { label: "Estimated jewellery price", value: money(total), total: true }
    ], "Metal = (" + money(rate.value) + " / 10 g) × " + weight.value + " g × " + percentLabel(karat) + ". Wastage is that metal value × " + (wastage.empty ? "0" : wastage.value) + "%. Making is " + (field(form, "makingType").value === "fixed" ? "the fixed amount" : "a percentage of metal plus wastage") + ". GST is on metal, wastage and making together. Rounded to the rupee.");
  }

  function calcOld(form) {
    var weight = parseAmount(field(form, "weight").value);
    var rate = syncedRate(form);
    var deduct = parseAmount(field(form, "deduct").value);
    var karat = Number(field(form, "karat").value);
    if (weight.invalid || rate.invalid || deduct.invalid) {
      clearLines(form);
      setError(form, "Use a zero or positive number. Letters and minus signs are left out of the estimate.");
      return;
    }
    if (deduct.value > 100) {
      clearLines(form);
      setError(form, "Deduction needs to be between 0 and 100%.");
      return;
    }
    if (weight.empty || rate.empty) {
      clearLines(form);
      setError(form, "Enter the old gold weight and the fine-gold rate.");
      return;
    }
    var share = factor(karat);
    var fine = weight.value * share;
    var gross = Math.round(fine * (rate.value / 10));
    var cut = Math.round(gross * ((deduct.empty ? 0 : deduct.value) / 100));
    setError(form, "");
    lines(form, [
      { label: "Fine gold equivalent", value: fine.toFixed(3) + " g" },
      { label: "Gross gold value", value: money(gross) },
      { label: "Deduction", value: money(cut) },
      { label: "Estimated exchange value", value: money(gross - cut), total: true }
    ], "Fine gold = " + weight.value + " g × " + percentLabel(karat) + " (" + karat + " ÷ 24). Gross value = fine grams × (" + money(rate.value) + " / 10 g). Deduction is taken from that gross value.");
  }

  function calcPurity(form) {
    var rate = syncedRate(form);
    var grams = parseAmount(field(form, "grams").value);
    var tola = parseAmount(field(form, "tola").value);
    if (rate.invalid || grams.invalid || tola.invalid) {
      clearLines(form);
      setError(form, "Use a zero or positive number. Letters and minus signs are left out of the estimate.");
      return;
    }
    if (rate.empty && grams.empty && tola.empty) {
      clearLines(form);
      setError(form, "Enter a 24K rate, a gram weight, or a tola weight.");
      return;
    }
    var rows = [];
    if (!rate.empty) {
      KARATS.forEach(function (karat) {
        var per10 = Math.round(rate.value * factor(karat));
        rows.push({ label: karat + "K (" + percentLabel(karat) + ")", value: money(per10) + " / 10 g · " + money(Math.round(per10 / 10)) + " / g" });
      });
    }
    if (!grams.empty) rows.push({ label: "Grams to tola", value: (grams.value / TOLA_G).toFixed(4) + " tola" });
    if (!tola.empty) rows.push({ label: "Tola to grams", value: (tola.value * TOLA_G).toFixed(3) + " g" });
    setError(form, "");
    lines(form, rows, "Each karat price is the 24K rate × (karat ÷ 24), shown to two decimal places of purity, then rounded to the rupee. 1 tola = 11.664 g.");
  }

  function calcGst(form) {
    var metal = parseAmount(field(form, "metal").value);
    var making = parseAmount(field(form, "making").value);
    var gst = parseAmount(field(form, "gst").value);
    if (metal.invalid || making.invalid || gst.invalid) {
      clearLines(form);
      setError(form, "Use a zero or positive number. Letters and minus signs are left out of the estimate.");
      return;
    }
    if (gst.value > 100 || (making.value > 100 && field(form, "makingType").value === "percent")) {
      clearLines(form);
      setError(form, "Percentages need to be between 0 and 100.");
      return;
    }
    if (metal.empty) {
      clearLines(form);
      setError(form, "Enter the metal value.");
      return;
    }
    var metalAmount = Math.round(metal.value);
    var make = field(form, "makingType").value === "fixed"
      ? Math.round(making.empty ? 0 : making.value)
      : Math.round(metalAmount * ((making.empty ? 0 : making.value) / 100));
    var taxable = metalAmount + make;
    var tax = Math.round(taxable * ((gst.empty ? 0 : gst.value) / 100));
    var split = field(form, "gstType").value === "split";
    var cgst = split ? Math.floor(tax / 2) : 0;
    var sgst = split ? tax - cgst : 0;
    var igst = split ? 0 : tax;
    setError(form, "");
    lines(form, [
      { label: "Metal amount", value: money(metalAmount) },
      { label: "Making amount", value: money(make) },
      { label: "Taxable value", value: money(taxable) },
      { label: "CGST", value: money(cgst) },
      { label: "SGST", value: money(sgst) },
      { label: "IGST", value: money(igst) },
      { label: "Final estimated amount", value: money(taxable + tax), total: true }
    ], split
      ? "Making is added to the metal value. GST is calculated on that taxable value and split into CGST and SGST so the two parts equal the GST rupee."
      : "Making is added to the metal value. The full GST is shown as IGST. CGST and SGST stay at zero.");
  }

  document.querySelectorAll("[data-calc]").forEach(function (form) {
    form.addEventListener("input", function () { calculate(form); });
    form.addEventListener("change", function () { calculate(form); });
    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        setError(form, "");
        clearLines(form);
        calculate(form);
      }, 0);
    });
    form.querySelector("[data-copy]").addEventListener("click", function () {
      var box = form.querySelector("[data-lines]");
      var button = form.querySelector("[data-copy]");
      if (box.hidden) {
        setError(form, "There is no result to copy yet.");
        return;
      }
      var text = Array.from(box.querySelectorAll("div")).map(function (row) {
        return row.querySelector("dt").textContent + ": " + row.querySelector("dd").textContent;
      }).join("\n");
      text += "\n\n" + box.querySelector("[data-work]").textContent + "\nEstimate only. Not a jewellery bill.";
      var done = function () {
        var previous = button.textContent;
        button.textContent = "Copied";
        window.setTimeout(function () { button.textContent = previous; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { setError(form, "The browser blocked copying. Select the result and copy it manually."); });
      } else {
        setError(form, "The browser blocked copying. Select the result and copy it manually.");
      }
    });
  });

  var historyMetal = "Gold 24K";
  var historyRange = "1W";
  function paintHistory() {
    document.getElementById("history-copy").textContent = "No historical rates are available for " + historyMetal + " over " + historyRange + ". A rate-history service is not connected, so this chart stays empty. OCTIS does not invent past prices.";
  }
  document.querySelectorAll("[data-history-metal]").forEach(function (button) {
    button.addEventListener("click", function () {
      historyMetal = button.dataset.historyMetal;
      document.querySelectorAll("[data-history-metal]").forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
      paintHistory();
    });
  });
  document.querySelectorAll("[data-history-range]").forEach(function (button) {
    button.addEventListener("click", function () {
      historyRange = button.dataset.historyRange;
      document.querySelectorAll("[data-history-range]").forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
      paintHistory();
    });
  });

  var grams = document.querySelector('#purity [name="grams"]');
  var tola = document.querySelector('#purity [name="tola"]');
  grams.addEventListener("input", function () {
    var parsed = parseAmount(grams.value);
    if (!parsed.empty && !parsed.invalid) tola.value = (parsed.value / TOLA_G).toFixed(4);
  });
  tola.addEventListener("input", function () {
    var parsed = parseAmount(tola.value);
    if (!parsed.empty && !parsed.invalid) grams.value = (parsed.value * TOLA_G).toFixed(3);
  });

  paintRates();
  paintHistory();
  document.querySelectorAll("[data-calc]").forEach(calculate);
})();
