(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[83989], {
    23408:    (e, t, r) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }), Object.defineProperty(t, "getImgProps", {
            enumerable: !0,
            get:        function () {
                return u
            }
        }), r(26201);
        let i = r(78637), n = r(89161), o = ["-moz-initial", "fill", "none", "scale-down", void 0];

        function l(e) {
            return void 0 !== e.default
        }

        function s(e) {
            return void 0 === e ? e : "number" == typeof e ? Number.isFinite(e) ? e : NaN : "string" == typeof e && /^[0-9]+$/.test(e) ? parseInt(e, 10) : NaN
        }

        function u(e, t) {
            var r, u;
            let a, d, f, {
                src:               c,
                sizes:             p,
                unoptimized:       g = !1,
                priority:          m = !1,
                loading:           h,
                className:         v,
                quality:           b,
                width:             y,
                height:            _,
                fill:              w = !1,
                style:             j,
                overrideSrc:       S,
                onLoad:            E,
                onLoadingComplete: x,
                placeholder:       O = "empty",
                blurDataURL:       C,
                fetchPriority:     P,
                decoding:          R = "async",
                layout:            z,
                objectFit:         M,
                objectPosition:    I,
                lazyBoundary:      N,
                lazyRoot:          k,
                ...                D
            } = e, { imgConf: A, showAltText: F, blurComplete: q, defaultLoader: B } = t, G = A || n.imageConfigDefault;
            if ("allSizes" in G) a = G; else {
                let e = [...G.deviceSizes, ...G.imageSizes].sort((e, t) => e - t),
                    t = G.deviceSizes.sort((e, t) => e - t),
                    i = null == (r = G.qualities) ? void 0 : r.sort((e, t) => e - t);
                a = { ...G, allSizes: e, deviceSizes: t, qualities: i }
            }
            if (void 0 === B) throw Object.defineProperty(Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config"), "__NEXT_ERROR_CODE", {
                value:        "E163",
                enumerable:   !1,
                configurable: !0
            });
            let L = D.loader || B;
            delete D.loader, delete D.srcSet;
            let T = "__next_img_default" in L;
            if (T) {
                if ("custom" === a.loader) throw Object.defineProperty(Error('Image with src "' + c + '" is missing "loader" prop.\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader'), "__NEXT_ERROR_CODE", {
                    value:        "E252",
                    enumerable:   !1,
                    configurable: !0
                })
            } else {
                let e = L;
                L = t => {
                    let { config: r, ...i } = t;
                    return e(i)
                }
            }
            if (z) {
                "fill" === z && (w = !0);
                let e = {
                    intrinsic:  { maxWidth: "100%", height: "auto" },
                    responsive: { width: "100%", height: "auto" }
                }[z];
                e && (j = { ...j, ...e });
                let t = { responsive: "100vw", fill: "100vw" }[z];
                t && !p && (p = t)
            }
            let W = "", X = s(y), U = s(_);
            if ((u = c) && "object" == typeof u && (l(u) || void 0 !== u.src)) {
                let e = l(c) ? c.default : c;
                if (!e.src) throw Object.defineProperty(Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received " + JSON.stringify(e)), "__NEXT_ERROR_CODE", {
                    value:        "E460",
                    enumerable:   !1,
                    configurable: !0
                });
                if (!e.height || !e.width) throw Object.defineProperty(Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received " + JSON.stringify(e)), "__NEXT_ERROR_CODE", {
                    value:        "E48",
                    enumerable:   !1,
                    configurable: !0
                });
                if (d = e.blurWidth, f = e.blurHeight, C = C || e.blurDataURL, W = e.src, !w) if (X || U) {
                    if (X && !U) {
                        let t = X / e.width;
                        U = Math.round(e.height * t)
                    } else if (!X && U) {
                        let t = U / e.height;
                        X = Math.round(e.width * t)
                    }
                } else X = e.width, U = e.height
            }
            let V = !m && ("lazy" === h || void 0 === h);
            (!(c = "string" == typeof c ? c : W) || c.startsWith("data:") || c.startsWith("blob:")) && (g = !0, V = !1), a.unoptimized && (g = !0), T && !a.dangerouslyAllowSVG && c.split("?", 1)[0].endsWith(".svg") && (g = !0);
            let J = s(b), Y = Object.assign(w ? {
                    position:       "absolute",
                    height:         "100%",
                    width:          "100%",
                    left:           0,
                    top:            0,
                    right:          0,
                    bottom:         0,
                    objectFit:      M,
                    objectPosition: I
                } : {}, F ? {} : { color: "transparent" }, j),
                H = q || "empty" === O ? null : "blur" === O ? 'url("data:image/svg+xml;charset=utf-8,' + (0, i.getImageBlurSvg)({
                    widthInt:    X,
                    heightInt:   U,
                    blurWidth:   d,
                    blurHeight:  f,
                    blurDataURL: C || "",
                    objectFit:   Y.objectFit
                }) + '")' : 'url("' + O + '")',
                $ = o.includes(Y.objectFit) ? "fill" === Y.objectFit ? "100% 100%" : "cover" : Y.objectFit, K = H ? {
                    backgroundSize:     $,
                    backgroundPosition: Y.objectPosition || "50% 50%",
                    backgroundRepeat:   "no-repeat",
                    backgroundImage:    H
                } : {}, Q = function (e) {
                    let { config: t, src: r, unoptimized: i, width: n, quality: o, sizes: l, loader: s } = e;
                    if (i) return { src: r, srcSet: void 0, sizes: void 0 };
                    let { widths: u, kind: a } = function (e, t, r) {
                        let { deviceSizes: i, allSizes: n } = e;
                        if (r) {
                            let e = /(^|\s)(1?\d?\d)vw/g, t = [];
                            for (let i; i = e.exec(r);) t.push(parseInt(i[2]));
                            if (t.length) {
                                let e = .01 * Math.min(...t);
                                return { widths: n.filter(t => t >= i[0] * e), kind: "w" }
                            }
                            return { widths: n, kind: "w" }
                        }
                        return "number" != typeof t ? {
                            widths: i,
                            kind:   "w"
                        } : { widths: [...new Set([t, 2 * t].map(e => n.find(t => t >= e) || n[n.length - 1]))], kind: "x" }
                    }(t, n, l), d = u.length - 1;
                    return {
                        sizes:  l || "w" !== a ? l : "100vw",
                        srcSet: u.map((e, i) => s({
                            config:  t,
                            src:     r,
                            quality: o,
                            width:   e
                        }) + " " + ("w" === a ? e : i + 1) + a).join(", "),
                        src:    s({ config: t, src: r, quality: o, width: u[d] })
                    }
                }({ config: a, src: c, unoptimized: g, width: X, quality: J, sizes: p, loader: L });
            return {
                props:   {
                    ...D,
                    loading:       V ? "lazy" : h,
                    fetchPriority: P,
                    width:         X,
                    height:        U,
                    decoding:      R,
                    className:     v,
                    style:         { ...Y, ...K },
                    sizes:         Q.sizes,
                    srcSet:        Q.srcSet,
                    src:           S || Q.src
                }, meta: { unoptimized: g, priority: m, placeholder: O, fill: w }
            }
        }
    }, 24468: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }), !function (e, t) {
            for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] })
        }(t, {
            default:          function () {
                return u
            }, getImageProps: function () {
                return s
            }
        });
        let i = r(49393), n = r(23408), o = r(39420), l = i._(r(75540));

        function s(e) {
            let { props: t } = (0, n.getImgProps)(e, {
                defaultLoader: l.default,
                imgConf:       {
                    deviceSizes:         [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
                    imageSizes:          [16, 32, 48, 64, 96, 128, 256, 384],
                    qualities:           [20, 25, 50, 70, 75, 95, 100],
                    path:                "https://www.coral.ru/_next/image",
                    loader:              "default",
                    dangerouslyAllowSVG: !1,
                    unoptimized:         !1
                }
            });
            for (let [e, r] of Object.entries(t)) void 0 === r && delete t[e];
            return { props: t }
        }

        let u = o.Image
    }, 39420: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }), Object.defineProperty(t, "Image", {
            enumerable: !0,
            get:        function () {
                return _
            }
        });
        let i = r(49393), n = r(74354), o = r(37876), l = n._(r(14232)), s = i._(r(98477)), u = i._(r(29269)),
            a = r(23408), d = r(89161), f = r(9263);
        r(26201);
        let c = r(242), p = i._(r(75540)), g = r(89203), m = {
            deviceSizes:         [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
            imageSizes:          [16, 32, 48, 64, 96, 128, 256, 384],
            qualities:           [20, 25, 50, 70, 75, 95, 100],
            path:                "https://www.coral.ru/_next/image",
            loader:              "default",
            dangerouslyAllowSVG: !1,
            unoptimized:         !1
        };

        function h(e, t, r, i, n, o, l) {
            let s = null == e ? void 0 : e.src;
            e && e["data-loaded-src"] !== s && (e["data-loaded-src"] = s, ("decode" in e ? e.decode() : Promise.resolve()).catch(() => {
            }).then(() => {
                if (e.parentElement && e.isConnected) {
                    if ("empty" !== t && n(!0), null == r ? void 0 : r.current) {
                        let t = new Event("load");
                        Object.defineProperty(t, "target", { writable: !1, value: e });
                        let i = !1, n = !1;
                        r.current({
                            ...t,
                            nativeEvent:          t,
                            currentTarget:        e,
                            target:               e,
                            isDefaultPrevented:   () => i,
                            isPropagationStopped: () => n,
                            persist:              () => {
                            },
                            preventDefault:       () => {
                                i = !0, t.preventDefault()
                            },
                            stopPropagation:      () => {
                                n = !0, t.stopPropagation()
                            }
                        })
                    }
                    (null == i ? void 0 : i.current) && i.current(e)
                }
            }))
        }

        function v(e) {
            return l.use ? { fetchPriority: e } : { fetchpriority: e }
        }

        let b = (0, l.forwardRef)((e, t) => {
            let {
                src:                  r,
                srcSet:               i,
                sizes:                n,
                height:               s,
                width:                u,
                decoding:             a,
                className:            d,
                style:                f,
                fetchPriority:        c,
                placeholder:          p,
                loading:              m,
                unoptimized:          b,
                fill:                 y,
                onLoadRef:            _,
                onLoadingCompleteRef: w,
                setBlurComplete:      j,
                setShowAltText:       S,
                sizesInput:           E,
                onLoad:               x,
                onError:              O,
                ...                   C
            } = e, P = (0, l.useCallback)(e => {
                e && (O && (e.src = e.src), e.complete && h(e, p, _, w, j, b, E))
            }, [r, p, _, w, j, O, b, E]), R = (0, g.useMergedRef)(t, P);
            return (0, o.jsx)("img", {
                ...C, ...v(c),
                loading:     m,
                width:       u,
                height:      s,
                decoding:    a,
                "data-nimg": y ? "fill" : "1",
                className:   d,
                style:       f,
                sizes:       n,
                srcSet:      i,
                src:         r,
                ref:         R,
                onLoad:      e => {
                    h(e.currentTarget, p, _, w, j, b, E)
                },
                onError:     e => {
                    S(!0), "empty" !== p && j(!0), O && O(e)
                }
            })
        });

        function y(e) {
            let { isAppRouter: t, imgAttributes: r } = e, i = {
                as:             "image",
                imageSrcSet:    r.srcSet,
                imageSizes:     r.sizes,
                crossOrigin:    r.crossOrigin,
                referrerPolicy: r.referrerPolicy, ...v(r.fetchPriority)
            };
            return t && s.default.preload ? (s.default.preload(r.src, i), null) : (0, o.jsx)(u.default, {
                children: (0, o.jsx)("link", {
                    rel:  "preload",
                    href: r.srcSet ? void 0 : r.src, ...i
                }, "__nimg-" + r.src + r.srcSet + r.sizes)
            })
        }

        let _ = (0, l.forwardRef)((e, t) => {
            let r = (0, l.useContext)(c.RouterContext), i = (0, l.useContext)(f.ImageConfigContext),
                n = (0, l.useMemo)(() => {
                    var e;
                    let t = m || i || d.imageConfigDefault,
                        r = [...t.deviceSizes, ...t.imageSizes].sort((e, t) => e - t),
                        n = t.deviceSizes.sort((e, t) => e - t),
                        o = null == (e = t.qualities) ? void 0 : e.sort((e, t) => e - t);
                    return { ...t, allSizes: r, deviceSizes: n, qualities: o }
                }, [i]), { onLoad: s, onLoadingComplete: u } = e, g = (0, l.useRef)(s);
            (0, l.useEffect)(() => {
                g.current = s
            }, [s]);
            let h = (0, l.useRef)(u);
            (0, l.useEffect)(() => {
                h.current = u
            }, [u]);
            let [v, _] = (0, l.useState)(!1), [w, j] = (0, l.useState)(!1), {
                props: S,
                meta:  E
            } = (0, a.getImgProps)(e, { defaultLoader: p.default, imgConf: n, blurComplete: v, showAltText: w });
            return (0, o.jsxs)(o.Fragment, {
                children: [(0, o.jsx)(b, {
                    ...S,
                    unoptimized:          E.unoptimized,
                    placeholder:          E.placeholder,
                    fill:                 E.fill,
                    onLoadRef:            g,
                    onLoadingCompleteRef: h,
                    setBlurComplete:      _,
                    setShowAltText:       j,
                    sizesInput:           e.sizes,
                    ref:                  t
                }), E.priority ? (0, o.jsx)(y, { isAppRouter: !r, imgAttributes: S }) : null]
            })
        });
        ("function" == typeof t.default || "object" == typeof t.default && null !== t.default) && void 0 === t.default.__esModule && (Object.defineProperty(t.default, "__esModule", { value: !0 }), Object.assign(t.default, t), e.exports = t.default)
    }, 54587: (e, t, r) => {
        e.exports = r(24468)
    }, 58103: (e, t) => {
        var r;
        !function () {
            "use strict";
            var i = {}.hasOwnProperty;

            function n() {
                for (var e = "", t = 0; t < arguments.length; t++) {
                    var r = arguments[t];
                    r && (e = o(e, function (e) {
                        if ("string" == typeof e || "number" == typeof e) return e;
                        if ("object" != typeof e) return "";
                        if (Array.isArray(e)) return n.apply(null, e);
                        if (e.toString !== Object.prototype.toString && !e.toString.toString().includes("[native code]")) return e.toString();
                        var t = "";
                        for (var r in e) i.call(e, r) && e[r] && (t = o(t, r));
                        return t
                    }(r)))
                }
                return e
            }

            function o(e, t) {
                return t ? e ? e + " " + t : e + t : e
            }

            e.exports ? (n.default = n, e.exports = n) : void 0 === (r = (function () {
                return n
            }).apply(t, [])) || (e.exports = r)
        }()
    }, 75540: (e, t) => {
        "use strict";

        function r(e) {
            var t;
            let { config: r, src: i, width: n, quality: o } = e,
                l = o || (null == (t = r.qualities) ? void 0 : t.reduce((e, t) => Math.abs(t - 75) < Math.abs(e - 75) ? t : e)) || 75;
            return r.path + "?url=" + encodeURIComponent(i) + "&w=" + n + "&q=" + l + (i.startsWith("/_next/static/media/"), "")
        }

        Object.defineProperty(t, "__esModule", { value: !0 }), Object.defineProperty(t, "default", {
            enumerable: !0,
            get:        function () {
                return i
            }
        }), r.__next_img_default = !0;
        let i = r
    }, 78637: (e, t) => {
        "use strict";

        function r(e) {
            let { widthInt: t, heightInt: r, blurWidth: i, blurHeight: n, blurDataURL: o, objectFit: l } = e,
                s = i ? 40 * i : t, u = n ? 40 * n : r, a = s && u ? "viewBox='0 0 " + s + " " + u + "'" : "";
            return "%3Csvg xmlns='http://www.w3.org/2000/svg' " + a + "%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='" + (a ? "none" : "contain" === l ? "xMidYMid" : "cover" === l ? "xMidYMid slice" : "none") + "' style='filter: url(%23b);' href='" + o + "'/%3E%3C/svg%3E"
        }

        Object.defineProperty(t, "__esModule", { value: !0 }), Object.defineProperty(t, "getImageBlurSvg", {
            enumerable: !0,
            get:        function () {
                return r
            }
        })
    }, 89203: (e, t, r) => {
        "use strict";
        Object.defineProperty(t, "__esModule", { value: !0 }), Object.defineProperty(t, "useMergedRef", {
            enumerable: !0,
            get:        function () {
                return n
            }
        });
        let i = r(14232);

        function n(e, t) {
            let r = (0, i.useRef)(null), n = (0, i.useRef)(null);
            return (0, i.useCallback)(i => {
                if (null === i) {
                    let e = r.current;
                    e && (r.current = null, e());
                    let t = n.current;
                    t && (n.current = null, t())
                } else e && (r.current = o(e, i)), t && (n.current = o(t, i))
            }, [e, t])
        }

        function o(e, t) {
            if ("function" != typeof e) return e.current = t, () => {
                e.current = null
            };
            {
                let r = e(t);
                return "function" == typeof r ? r : () => e(null)
            }
        }

        ("function" == typeof t.default || "object" == typeof t.default && null !== t.default) && void 0 === t.default.__esModule && (Object.defineProperty(t.default, "__esModule", { value: !0 }), Object.assign(t.default, t), e.exports = t.default)
    }
}]);