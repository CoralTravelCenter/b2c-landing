(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[50048], {
    11838:    (e, t, a) => {
        "use strict";
        a.r(t), a.d(t, { __N_SSP: () => v, default: () => N, getSeoServerSideProps: () => G });
        var s = a(37876), r = a(41464), n = a(18847), o = a.n(n), l = a(77328), i = a.n(l), p = a(45105), c = a.n(p),
            d = a(14232), u = a(33336), m = a(89878), g = a(4740), _ = a(82997), x = a(71945), h = a(67419),
            f = a(73307), b = a(94225), w = a(56774);
        let j = {
            GetRobotsContent: async function e() {
                let e = (0, w.a)({ ssr: !0 }), t = "/Presentation/GetRobotContent";
                (0, b.b)("url was called", t);
                let a = await e.get(t);
                return a?.data?.result?.content || console.log(a), a.data.result.content
            }
        }, P = {
            GetSitemapContent: async function e(e) {
                let t = (0, w.a)({ ssr: !0 }), a = `/Presentation/GetSitemapContent?Url=${ encodeURIComponent(e) }`;
                return (0, b.b)("url was called", a), (await t.get(a)).data.result.content
            }
        };
        var C = a(99239), y = a(4344), k = a(1854), E = a(9611), S = a(68088);
        let I = o()(() => Promise.all([a.e(52006), a.e(95569)]).then(a.bind(a, 95569)), {
            loadableGenerated: { webpack: () => [95569] },
            ssr:               !1
        }), T = o()(() => Promise.all([a.e(80732), a.e(70348)]).then(a.bind(a, 70348)), {
            loadableGenerated: { webpack: () => [70348] },
            ssr:               !1
        });
        var v = !0;

        function N(e) {
            let { layout: t, meta: a, query: n, isAppPure: o, correlationId: l, ssrCorrelationTimestamp: p } = e;
            (0, f.a)(), (0, d.useEffect)(() => {
                l && (0, E.b)(l)
            }, [l]);
            let w = r.a.get("Departure") ?? null, j = r.a.get("Locale") ?? C.a.NEXT_PUBLIC_DEFAULT_LANGUAGE;
            if ((0, S.g)(a)) {
                if ((0, S.k)(w) && (0, S.g)(a.departures) && (0, S.a)(a.departures)) {
                    let e = a.departures.find(e => !0 === e.isCurrent);
                    (0, S.g)(e) && r.a.set("Departure", e?.id, { path: "/" })
                }
                if ((0, S.j)(w)) {
                    let e = w.replace(/--$/, "");
                    r.a.set("Departure", e, { path: "/" })
                }
            }
            return (0, b.b)("...pagePath.tsx", {
                layout: t,
                meta:   a,
                query:  n
            }), (0, b.b)("ssr page ", n), (0, b.b)("cookie departure ", w), (0, s.jsxs)(s.Fragment, {
                children: [(0, s.jsx)(_.a, {
                    meta:      a,
                    isAppPure: o
                }), (0, s.jsx)(m.a, {}), (0, s.jsx)(g.a, {
                    ssrCorrelationId:        l,
                    ssrCorrelationTimestamp: p
                }), (0, s.jsx)(() => {
                    if (C.a.NEXT_PUBLIC_MAP_PROVIDER === y.a.yandex) {
                        let e = `https://api-maps.yandex.ru/v3/?apikey=${ C.a.NEXT_PUBLIC_YANDEX_MAP_API_KEY }&lang=${ (0, k.b)(j, "_") }`,
                            t = `
        (function() {
          // This is now just a diagnostic helper for debugging
          const checkYmapsLoaded = () => {
            if (window.ymaps3) {
              console.log('[Yandex Maps] Successfully loaded Yandex Maps v3');
              return true;
            }
            return false;
          };

          // Try immediately
          if (!checkYmapsLoaded()) {
            // Set a few checks to see when it loads
            let attempts = 0;
            const checkInterval = setInterval(() => {
              attempts++;
              if (checkYmapsLoaded() || attempts > 20) {
                clearInterval(checkInterval);
              }
            }, 200);
          }
        })();
      `;
                        return (0, s.jsxs)(i(), {
                            children: [(0, s.jsx)("script", {
                                src:   e,
                                defer: !0
                            }), (0, s.jsx)("script", { dangerouslySetInnerHTML: { __html: t } })]
                        })
                    }
                    return (0, s.jsx)(s.Fragment, {})
                }, {}), (0, s.jsx)(h.a, {
                    layout:    t,
                    meta:      a,
                    query:     n,
                    isSSR:     !0,
                    isAppPure: o
                }), (0, s.jsx)(u.a, { meta: a }), !o && (0, s.jsx)(x.a, {
                    tags:                       a?.bodyTags,
                    executeScriptsOnNavigation: !0
                }), (0, s.jsx)(T, { popups: a?.popups }), a?.pageUrl?.startsWith("/never-preview/") ? (0, s.jsxs)(s.Fragment, {
                    children: [(0, s.jsx)(c(), {
                        src:   "/image-scaler.js",
                        defer: !0
                    }), (0, s.jsx)(I, {})]
                }) : (0, s.jsx)(s.Fragment, {})]
            })
        }

        let G = async (e, t) => {
            let a = "";
            return "/sitemap.xml" === t || /sitemap([a-z0-9-]+)*.xml$/.test(t) ? (e.setHeader("Content-Type", "text/xml"), a = await P.GetSitemapContent(t)) : t?.startsWith("/robots") && (e.setHeader("Content-Type", "text/plain"), a = decodeURIComponent(await j.GetRobotsContent())), a.length >= 0 && (e.write(a), e.end()), { props: {} }
        }
    }, 34940: (e, t, a) => {
        (window.__NEXT_P = window.__NEXT_P || []).push(["/[...pagePath]", function () {
            return a(11838)
        }])
    }
}, e => {
    e.O(0, [48374, 71869, 96577, 3042, 18308, 70049, 88446, 94317, 22072, 64086, 26668, 91106, 14579, 7328, 98663, 54452, 29404, 42292, 76688, 13430, 39014, 58683, 29799, 72328, 83989, 46877, 16009, 12023, 49811, 22862, 63514, 15110, 88804, 90636, 58340, 38792], () => e(e.s = 34940)), _N_E = e.O()
}]);