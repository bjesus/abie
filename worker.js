async function handleRequest(req) {
  const res = await fetch(req);
  const contentType = res.headers.get("Content-Type");

  if (contentType && contentType.startsWith("text/html")) {
    const cookies = req.headers.get("Cookie");
    let userIdentifier = Math.random() * 100;
    if (cookies) {
      for (const cookie of cookies.split(";")) {
        const [cookieName, cookieValue] = cookie.split("=");
        if (cookieName === "abie-id") {
          userIdentifier = Number(cookieValue);
        }
      }
    }
    groups = {};
    const rewriter = new HTMLRewriter()
      .on("html", new GroupSetterRewriter(groups))
      .on("*", new AbieFilter(userIdentifier, groups))
      .on("script", new IdentifierExporter(userIdentifier));
    newRes = rewriter.transform(res);

    newRes.headers.append(
      "set-cookie",
      `abie-id=${userIdentifier}; httponly; same-site; max-age=31536000000; path=/` // Expire in a year
    );
    return newRes;
  } else {
    return res;
  }
}

class GroupSetterRewriter {
  constructor(groups) {
    this.groups = groups;
  }
  element(element) {
    for (const [attr, value] of [...element.attributes]) {
      if (attr.startsWith("data-abie-group-")) {
        const [_x, _y, _z, group, operator] = attr.split("-");
        if (!(group in this.groups)) {
          this.groups[group] = {};
        }
        this.groups[group][operator] = value;
        element.removeAttribute(attr);
      }
    }
  }
}

class AbieFilter {
  constructor(userIdentifier, groups) {
    this.userIdentifier = userIdentifier;
    this.groups = groups;
  }
  element(element) {
    for (const [attr, value] of [...element.attributes]) {
      if (attr.startsWith("data-abie-group-")) {
        const group = attr.substring("data-abie-group-".length);
        if (this.groups[group]) {
          if (
            this.groups[group]["lt"] &&
            this.userIdentifier > parseInt(this.groups[group]["lt"])
          ) {
            element.remove();
          }

          if (
            this.groups[group]["lte"] &&
            this.userIdentifier >= parseInt(this.groups[group]["lte"])
          ) {
            element.remove();
          }

          if (
            this.groups[group]["gt"] &&
            this.userIdentifier < parseInt(this.groups[group]["gt"])
          ) {
            element.remove();
          }

          if (
            this.groups[group]["gte"] &&
            this.userIdentifier <= parseInt(this.groups[group]["gte"])
          ) {
            element.remove();
          }
        }
      }
    }

    const lt = element.getAttribute("data-abie-lt");
    if (lt && this.userIdentifier > parseInt(lt)) {
      element.remove();
    }

    const lte = element.getAttribute("data-abie-lte");
    if (lte && this.userIdentifier >= parseInt(lte)) {
      element.remove();
    }

    const gt = element.getAttribute("data-abie-gt");
    if (gt && this.userIdentifier < parseInt(gt)) {
      element.remove();
    }

    const gte = element.getAttribute("data-abie-gte");
    if (gte && this.userIdentifier <= parseInt(gte)) {
      element.remove();
    }

    element.removeAttribute("data-abie-gt");
    element.removeAttribute("data-abie-gte");
    element.removeAttribute("data-abie-lt");
    element.removeAttribute("data-abie-lte");
  }
}

class IdentifierExporter {
  constructor(userIdentifier) {
    this.userIdentifier = userIdentifier;
  }
  text(text) {
    if (text.text.includes("%ABIE_IDENTIFIER%")) {
      text.replace(text.text.replace("%ABIE_IDENTIFIER%", this.userIdentifier));
    }
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
