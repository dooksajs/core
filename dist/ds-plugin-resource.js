const g = {
  link({
    id: l,
    crossOrigin: o,
    href: s,
    media: i,
    referrerPolicy: n,
    rel: r = "stylesheet",
    integrity: c,
    onSuccess: d = () => {
    },
    onError: f = () => {
    }
  }) {
    const [t, u] = this._exists(l, "link", "href", s);
    t.onerror = () => f(), t.onload = () => d(), t.id = l, t.rel = r, t.crossOrigin = o || null, i && (t.media = i), n && (t.referrerPolicy = n), c && (t.integrity = c), t.href = s, u || document.head.appendChild(t);
  },
  script({
    id: l,
    async: o,
    crossOrigin: s,
    defer: i,
    integrity: n,
    nonce: r,
    referrerPolicy: c,
    src: d,
    type: f = "text/javascript",
    nomodule: t,
    globalVars: u = [],
    onSuccess: p = () => {
    },
    onError: x = () => {
    }
  }) {
    const [e, E] = this._exists(l, "script", "src", d);
    e.onerror = () => x(), e.onload = () => {
      const m = {};
      for (let a = 0; a < u.length; a++) {
        const h = u[a];
        m[h] = window[h];
      }
      p(m);
    }, e.id = l, e.type = f, e.async = o || null, e.crossOrigin = s || null, e.defer = i || null, n && (e.integrity = n), c && (e.referrerPolicy = c), e.nomodule = t || null, e.nonce = r || null, e.src = d, E || document.head.appendChild(e);
  },
  _exists(l, o, s, i) {
    let n = document.getElementById(l), r = !1;
    if (n) {
      if (n[s] === i)
        return;
      r = !0;
    } else
      n = document.createElement(o);
    return [n, r];
  }
};
export {
  g as default
};
