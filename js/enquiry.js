(function () {
  var RECIPIENT = "hello@octis.in";
  var lastDraft = "";

  function text(form, name) {
    return String(new FormData(form).get(name) || "").trim();
  }

  function openDraft(subject, body) {
    var href = "mailto:" + RECIPIENT +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    if (href === lastDraft) return false;
    lastDraft = href;
    window.location.href = href;
    return true;
  }

  function show(node, message) {
    if (!node) return;
    node.hidden = false;
    node.textContent = message;
  }

  function hide(node) {
    if (!node) return;
    node.hidden = true;
    node.textContent = "";
  }

  var book = document.getElementById("book");
  if (book) {
    var sent = document.getElementById("sent");
    var error = document.getElementById("book-error");
    book.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = text(book, "name");
      var phone = text(book, "phone");
      var email = text(book, "email");
      var business = text(book, "business");
      var type = text(book, "type");
      var city = text(book, "city");
      var about = text(book, "about");
      var code = text(book, "code") || "+91";
      var missing = [];
      if (!name) missing.push("your name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push("a valid business email");
      if (!/^[0-9][0-9\s()-]{5,18}$/.test(phone)) missing.push("a phone number");
      if (!business) missing.push("your business name");
      if (!type) missing.push("a business type");
      if (!city) missing.push("your city");
      if (missing.length) {
        hide(sent);
        show(error, "Add " + missing.join(", ") + " before this request can be prepared.");
        return;
      }
      hide(error);
      var body = [
        "Name: " + name,
        "Phone: " + code + " " + phone,
        "Email: " + email,
        "Business: " + business,
        "Type: " + type,
        "City: " + city,
        "About: " + (about || "—")
      ].join("\n");
      var opened = openDraft("OCTIS demonstration", body);
      if (opened || sent.hidden) {
        show(sent, opened
          ? "Your email app should open a draft to hello@octis.in. Send that draft to deliver this enquiry. This page does not send or store it."
          : "This enquiry is already prepared in your email app. Send that draft to hello@octis.in.");
      }
    });
  }

  var subscribe = document.getElementById("subscribe-form");
  if (subscribe) {
    var note = document.getElementById("subscribe-note");
    var subscribeError = document.getElementById("subscribe-error");
    subscribe.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = text(subscribe, "email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        hide(note);
        show(subscribeError, "Enter a valid email address.");
        return;
      }
      hide(subscribeError);
      var opened = openDraft("OCTIS updates", "Please send OCTIS updates to " + email + ".");
      if (opened || note.hidden) {
        show(note, opened
          ? "Your email app should open a draft to hello@octis.in. Send that draft to pass on this address. This page does not store it."
          : "This request is already prepared in your email app. Send that draft to hello@octis.in.");
      }
    });
  }
})();
