import { UmbContextConsumerController as ct } from "@umbraco-cms/backoffice/context-api";
import { UMB_THEME_CONTEXT as dt } from "@umbraco-cms/backoffice/themes";
const lt = 1;
function $() {
  return {
    schemaVersion: lt,
    concurrencyToken: "",
    preset: "none",
    appearanceMode: "light",
    customThemeName: "My custom theme",
    fontFamilyId: "umbraco-default",
    fontSizeId: "normal",
    accessibility: {
      colorVisionFriendly: !1,
      highContrast: !1,
      reducedMotion: !1,
      enhancedFocus: !1
    }
  };
}
const me = "/umbraco/management/api/v1/our-personal-appearance";
class ut {
  cancel() {
    this.abort?.abort(), this.abort = void 0;
  }
  nextSignal() {
    return this.cancel(), this.abort = new AbortController(), this.abort.signal;
  }
  async getPreference() {
    const e = await fetch(`${me}/preference`, {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: this.nextSignal()
    });
    if (e.status === 401) throw new Error("unauthorized");
    if (!e.ok) throw new Error(`get_failed:${e.status}`);
    return await e.json();
  }
  async putPreference(e) {
    const t = await fetch(`${me}/preference`, {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e),
      signal: this.nextSignal()
    });
    if (t.status === 401) throw new Error("unauthorized");
    if (t.status === 409) {
      const o = await t.json();
      throw Object.assign(new Error("concurrency_conflict"), { problem: o });
    }
    if (!t.ok) {
      const o = await t.json().catch(() => null);
      throw Object.assign(new Error("validation_failed"), { problem: o, status: t.status });
    }
    return await t.json();
  }
  async deletePreference() {
    const e = await fetch(`${me}/preference`, {
      method: "DELETE",
      credentials: "same-origin",
      signal: this.nextSignal()
    });
    if (e.status === 401) throw new Error("unauthorized");
    if (!e.ok && e.status !== 204)
      throw new Error(`delete_failed:${e.status}`);
  }
}
const ae = [
  {
    id: "umbraco-default",
    displayName: "Umbraco default",
    cssStack: "inherit",
    description: "Native backoffice font stack"
  },
  {
    id: "system-ui",
    displayName: "System UI",
    cssStack: "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    description: "Platform UI fonts"
  },
  {
    id: "source-sans",
    displayName: "Source Sans 3",
    cssStack: '"Source Sans 3", "Segoe UI", sans-serif',
    description: "Approved open UI font"
  },
  {
    id: "ibm-plex-sans",
    displayName: "IBM Plex Sans",
    cssStack: '"IBM Plex Sans", "Segoe UI", sans-serif',
    description: "Approved open UI font"
  },
  {
    id: "atkinson-hyperlegible",
    displayName: "Atkinson Hyperlegible",
    cssStack: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
    description: "Legibility-oriented approved font"
  },
  {
    id: "opendyslexic",
    displayName: "OpenDyslexic",
    cssStack: 'OpenDyslexic, "Segoe UI", sans-serif',
    description: "Approved dyslexia-friendly option; not a medical claim"
  },
  {
    id: "georgia",
    displayName: "Georgia",
    cssStack: 'Georgia, "Times New Roman", serif',
    description: "Approved serif option"
  },
  {
    id: "verdana",
    displayName: "Verdana",
    cssStack: "Verdana, Geneva, sans-serif",
    description: "Approved high-x-height sans"
  }
];
function ft(r) {
  return !!r && ae.some((e) => e.id === r);
}
function Ge(r) {
  return ae.find((e) => e.id === r)?.cssStack ?? ae[0].cssStack;
}
const _e = [
  { id: "low", displayName: "Low", defaultSizePx: 12, smallSizePx: 11 },
  { id: "normal", displayName: "Normal", defaultSizePx: 14, smallSizePx: 12 },
  { id: "large", displayName: "Large", defaultSizePx: 18, smallSizePx: 15 }
], ie = "normal";
function ne(r) {
  if (r == null || r === "") return ie;
  const e = String(r).trim().toLowerCase();
  return e === "low" || e === "1" ? "low" : e === "large" || e === "2" ? "large" : e === "normal" || e === "0" ? "normal" : ie;
}
function ht(r) {
  if (r == null || r === "") return !1;
  const e = String(r).trim().toLowerCase();
  return e === "low" || e === "normal" || e === "large" || e === "0" || e === "1" || e === "2";
}
function Ke(r) {
  const e = ne(r);
  return _e.find((t) => t.id === e) ?? _e[1];
}
const p = 4.5, F = 3, m = 7;
function _(r) {
  if (!r) return null;
  let e = r.trim();
  return e.startsWith("#") && (e = e.slice(1)), e.length === 3 && (e = e.split("").map((t) => t + t).join("")), e.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(e) ? null : {
    r: parseInt(e.slice(0, 2), 16),
    g: parseInt(e.slice(2, 4), 16),
    b: parseInt(e.slice(4, 6), 16)
  };
}
function be(r) {
  return r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
}
function ce(r) {
  const e = be(r.r / 255), t = be(r.g / 255), o = be(r.b / 255);
  return 0.2126 * e + 0.7152 * t + 0.0722 * o;
}
function O(r, e) {
  const t = ce(r), o = ce(e), s = Math.max(t, o), a = Math.min(t, o);
  return (s + 0.05) / (a + 0.05);
}
function Ae(r, e) {
  const t = _(r), o = _(e);
  if (!t || !o) throw new Error("Both colors must be opaque hex values.");
  return O(t, o);
}
function de(r) {
  const e = _(r);
  if (!e) throw new Error("Background must be opaque hex.");
  const t = { r: 0, g: 0, b: 0 };
  return O({ r: 255, g: 255, b: 255 }, e) >= O(t, e) ? "#ffffff" : "#000000";
}
function Ze(r) {
  const e = (t) => t.toString(16).padStart(2, "0");
  return `#${e(r.r)}${e(r.g)}${e(r.b)}`;
}
const pt = {
  "--uui-color-scheme": "normal",
  "--uui-color-surface": "#ffffff",
  "--uui-color-surface-alt": "#ffffff",
  "--uui-color-surface-emphasis": "#dadada",
  "--uui-color-text": "#060606",
  "--uui-color-text-alt": "#2e2b29"
}, Oe = {
  danger: "#c60239",
  warning: "#ffd621",
  positive: "#0d8844"
}, gt = {
  danger: "#ff6b6b",
  warning: "#ffd621",
  positive: "#3ddc84"
};
function mt(r) {
  const { colors: e, textRatio: t } = r, o = e.surfaceBackground, s = le(o), a = {
    // App canvas sits a few percent off the panel surface so panels stay readable as panels.
    "--uui-color-background": x(o, e.shellBackground, 0.06),
    "--uui-color-surface": o,
    "--uui-color-surface-alt": o,
    "--uui-color-surface-emphasis": e.hoverBackground,
    "--uui-color-text": e.surfaceForeground,
    // Secondary text is normally softened toward the surface, but a 7:1 theme has no room for
    // that: Umbraco also dims muted text with its own opacity, and the two reductions compound
    // into a measured 6.92:1. High-contrast themes therefore keep secondary text at full strength.
    "--uui-color-text-alt": t >= m ? e.surfaceForeground : g(x(e.surfaceForeground, o, 0.18), o, t),
    "--uui-color-header-surface": e.shellBackground,
    "--uui-color-header-contrast": e.shellForeground,
    "--uui-color-header-contrast-emphasis": e.shellForeground,
    "--uui-color-interactive": g(e.link, o, t),
    "--uui-color-interactive-emphasis": g(e.accentBackground, o, t),
    "--uui-color-default": e.accentBackground,
    "--uui-color-default-emphasis": Y(e.accentBackground, s ? 0.12 : -0.12),
    "--uui-color-default-standalone": g(e.accentBackground, o, t),
    "--uui-color-default-contrast": e.accentForeground,
    "--uui-color-selected": e.selectedBackground,
    "--uui-color-selected-emphasis": Y(e.selectedBackground, s ? 0.12 : -0.08),
    "--uui-color-selected-standalone": g(
      e.selectedBackground,
      o,
      F
    ),
    "--uui-color-selected-contrast": e.selectedForeground,
    // Umbraco uses "current" for the active tree/nav item; mirror "selected" so they agree.
    "--uui-color-current": e.selectedBackground,
    "--uui-color-current-emphasis": Y(e.selectedBackground, s ? 0.12 : -0.08),
    "--uui-color-current-standalone": g(
      e.selectedBackground,
      o,
      F
    ),
    "--uui-color-current-contrast": e.selectedForeground,
    "--uui-color-focus": e.focusRing,
    // Borders and dividers are non-text indicators: 3:1 is the floor that applies.
    "--uui-color-border": e.border,
    "--uui-color-border-standalone": g(e.border, o, F),
    "--uui-color-border-emphasis": g(e.border, o, F + 1),
    "--uui-color-divider": x(e.border, o, 0.5),
    "--uui-color-divider-standalone": e.border,
    "--uui-color-divider-emphasis": g(e.border, o, F),
    "--uui-color-disabled": e.activeBackground,
    "--uui-color-disabled-standalone": x(e.activeBackground, e.border, 0.4),
    // Umbraco reuses this for muted labels and aliases, not only for disabled controls, so it
    // is held to the text floor rather than the 3:1 non-text floor.
    "--uui-color-disabled-contrast": g(
      x(e.surfaceForeground, o, 0.45),
      e.activeBackground,
      Math.max(t, p)
    ),
    "--uui-color-scheme": s ? "dark" : "light"
  };
  if (t >= m && le(e.shellBackground)) {
    a["--uui-color-default"] = e.shellBackground, a["--uui-color-default-emphasis"] = e.hoverBackground, a["--uui-color-default-contrast"] = e.shellForeground, a["--uui-color-default-standalone"] = e.accentBackground;
    const i = e.border, n = x(e.surfaceBackground, "#ffffff", 0.1);
    a["--uui-color-background"] = n, a["--uui-color-header-background"] = e.shellBackground, a["--uui-color-divider"] = i, a["--uui-color-divider-standalone"] = i, a["--uui-color-divider-emphasis"] = i, a["--uui-tab-divider"] = i, a["--uui-box-border-width"] = "1px", a["--uui-box-border-color"] = i, a["--uui-box-box-shadow"] = "none";
    const c = `0 1px 0 ${i}`;
    a["--uui-shadow-depth-1"] = c, a["--uui-shadow-depth-2"] = c, a["--uui-shadow-depth-3"] = `0 2px 0 ${i}`, a["--uui-shadow-depth-4"] = `-1px 0 0 ${i}`, a["--uui-shadow-depth-5"] = `-2px 0 0 0 ${i}`, a["--uui-modal-color-backdrop"] = "rgba(255, 255, 255, 0.18)";
  }
  if (!r.keepNativeStatusColors) {
    const i = t >= m;
    for (const n of Object.keys(Oe)) {
      const c = i ? gt[n] : Oe[n], u = i ? g(c, o, t) : c;
      a[`--uui-color-${n}`] = u, a[`--uui-color-${n}-emphasis`] = Y(u, s ? 0.1 : -0.1), a[`--uui-color-${n}-contrast`] = bt(u), a[`--uui-color-${n}-standalone`] = g(c, o, t);
    }
  }
  return r.fontStack && r.fontStack !== "inherit" && (a["--uui-font-family"] = r.fontStack), a;
}
function g(r, e, t) {
  const o = _(r), s = _(e);
  if (!o || !s || O(o, s) >= t) return r;
  const a = ce(s) < 0.5 ? 255 : 0;
  let i = o;
  for (let n = 1; n <= 100; n++) {
    const c = n / 100;
    if (i = {
      r: Math.round(o.r + (a - o.r) * c),
      g: Math.round(o.g + (a - o.g) * c),
      b: Math.round(o.b + (a - o.b) * c)
    }, O(i, s) >= t) break;
  }
  return Ze(i);
}
function le(r) {
  const e = _(r);
  return e ? ce(e) < 0.5 : !1;
}
function x(r, e, t) {
  const o = _(r), s = _(e);
  return !o || !s ? r : Ze({
    r: Math.round(o.r + (s.r - o.r) * t),
    g: Math.round(o.g + (s.g - o.g) * t),
    b: Math.round(o.b + (s.b - o.b) * t)
  });
}
function Y(r, e) {
  return x(r, e >= 0 ? "#ffffff" : "#000000", Math.abs(e));
}
function bt(r) {
  const e = _(r);
  if (!e) return "#ffffff";
  const t = { r: 255, g: 255, b: 255 }, o = { r: 0, g: 0, b: 0 };
  return O(t, e) >= O(o, e) ? "#ffffff" : "#000000";
}
const y = {
  none: {
    id: "none",
    displayName: "Umbraco default",
    description: "No package overrides. Native Umbraco appearance only.",
    textRatio: p
  },
  light: {
    id: "light",
    displayName: "Light",
    description: "Indigo chrome over white panels.",
    textRatio: p,
    colors: {
      shellBackground: "#243157",
      shellForeground: "#ffffff",
      surfaceBackground: "#ffffff",
      surfaceForeground: "#1a1d23",
      accentBackground: "#2f5bd7",
      accentForeground: "#ffffff",
      link: "#1a4fc4",
      border: "#767d8a",
      focusRing: "#1a4fc4",
      selectedBackground: "#dbe4fb",
      selectedForeground: "#10254f",
      hoverBackground: "#f1f3f7",
      activeBackground: "#e4e8f0"
    }
  },
  dark: {
    id: "dark",
    displayName: "Dark",
    description: "Cool dark chrome. Protected editors stay light.",
    textRatio: p,
    colors: {
      shellBackground: "#181d24",
      shellForeground: "#e9eef4",
      surfaceBackground: "#212832",
      surfaceForeground: "#e9eef4",
      accentBackground: "#3b74d1",
      accentForeground: "#ffffff",
      link: "#82b6f7",
      border: "#6e7887",
      focusRing: "#ffd24d",
      selectedBackground: "#2d4f80",
      selectedForeground: "#ffffff",
      hoverBackground: "#2a313b",
      activeBackground: "#333b46"
    }
  },
  dim: {
    id: "dim",
    displayName: "Dimmed",
    description: "Lower-luminance dark shell for reduced glare. Not a medical eye-protection claim.",
    textRatio: p,
    colors: {
      shellBackground: "#1b2027",
      shellForeground: "#e8edf3",
      surfaceBackground: "#22272e",
      surfaceForeground: "#e8edf3",
      accentBackground: "#3b74d1",
      accentForeground: "#ffffff",
      link: "#7cb2f5",
      border: "#6e7887",
      focusRing: "#ffd24d",
      selectedBackground: "#2d4f80",
      selectedForeground: "#ffffff",
      hoverBackground: "#2b313a",
      activeBackground: "#343b45"
    }
  },
  warmComfort: {
    id: "warmComfort",
    displayName: "Eye Comfort",
    description: "Warm, low-blue neutrals for a personal comfort preference. Not a medical claim.",
    textRatio: p,
    colors: {
      shellBackground: "#1f1a14",
      shellForeground: "#f5ead6",
      surfaceBackground: "#2a231b",
      surfaceForeground: "#f5ead6",
      accentBackground: "#a9662a",
      accentForeground: "#ffffff",
      link: "#f0b968",
      border: "#7d6b52",
      focusRing: "#ffd27a",
      selectedBackground: "#6b4a24",
      selectedForeground: "#fff7ea",
      hoverBackground: "#352c22",
      activeBackground: "#403528"
    }
  },
  colorVisionFriendly: {
    id: "colorVisionFriendly",
    displayName: "Colour Vision Support",
    description: "Blue/orange signalling from the Okabe-Ito palette, chosen to stay distinguishable without relying on red-green discrimination. Not a colour-blindness correction.",
    textRatio: p,
    colors: {
      shellBackground: "#004c73",
      shellForeground: "#ffffff",
      surfaceBackground: "#ffffff",
      surfaceForeground: "#16191d",
      accentBackground: "#0072b2",
      accentForeground: "#ffffff",
      link: "#005b8f",
      border: "#5b6773",
      focusRing: "#d55e00",
      selectedBackground: "#cde6f5",
      selectedForeground: "#003350",
      hoverBackground: "#f0f4f7",
      activeBackground: "#e1e9ef"
    }
  },
  highContrast: {
    id: "highContrast",
    displayName: "High Contrast",
    description: "Targets 7:1 or better for normal interface text where package tokens apply.",
    textRatio: m,
    colors: {
      shellBackground: "#000000",
      shellForeground: "#ffffff",
      surfaceBackground: "#1a1a1a",
      surfaceForeground: "#ffffff",
      accentBackground: "#ffff00",
      accentForeground: "#000000",
      link: "#66ffff",
      border: "#c8c8c8",
      focusRing: "#ffff00",
      // Selection inverts to white rather than reusing the yellow accent: Umbraco paints the
      // "current" colour behind whole navigation rows, and a full-width yellow row is both
      // garish and indistinguishable from a focused control.
      selectedBackground: "#ffffff",
      selectedForeground: "#000000",
      hoverBackground: "#2e2e2e",
      activeBackground: "#3d3d3d"
    }
  },
  blackAndWhite: {
    id: "blackAndWhite",
    displayName: "Black & White",
    description: "Fully desaturated light theme: black chrome, white panels, grey-step hierarchy. Status colours stay native so meaning is never carried by lightness alone.",
    textRatio: p,
    keepNativeStatusColors: !0,
    colors: {
      shellBackground: "#1a1a1a",
      shellForeground: "#ffffff",
      surfaceBackground: "#ffffff",
      surfaceForeground: "#141414",
      accentBackground: "#1a1a1a",
      accentForeground: "#ffffff",
      link: "#3d3d3d",
      border: "#5c5c5c",
      focusRing: "#000000",
      selectedBackground: "#d4d4d4",
      selectedForeground: "#141414",
      hoverBackground: "#f0f0f0",
      activeBackground: "#e0e0e0"
    }
  },
  kids: {
    id: "kids",
    displayName: "Kids",
    description: "Bright blue, orange, and yellow — playful and friendly. A visual style only; it encodes no assumption about who is using it.",
    textRatio: p,
    colors: {
      shellBackground: "#1f6fb2",
      shellForeground: "#ffffff",
      surfaceBackground: "#ffffff",
      surfaceForeground: "#1b2430",
      accentBackground: "#c2410c",
      accentForeground: "#ffffff",
      link: "#1256a0",
      border: "#5a6b7d",
      focusRing: "#c2410c",
      selectedBackground: "#ffe08a",
      selectedForeground: "#3d2b00",
      hoverBackground: "#f2f7fb",
      activeBackground: "#e3edf6"
    },
    variants: {
      light: {
        shellBackground: "#1f6fb2",
        shellForeground: "#ffffff",
        surfaceBackground: "#ffffff",
        surfaceForeground: "#1b2430",
        accentBackground: "#c2410c",
        accentForeground: "#ffffff",
        link: "#1256a0",
        border: "#5a6b7d",
        focusRing: "#c2410c",
        selectedBackground: "#ffe08a",
        selectedForeground: "#3d2b00",
        hoverBackground: "#f2f7fb",
        activeBackground: "#e3edf6"
      },
      dark: {
        shellBackground: "#082a4a",
        shellForeground: "#ffffff",
        surfaceBackground: "#10263a",
        surfaceForeground: "#f7fbff",
        accentBackground: "#b64000",
        accentForeground: "#ffffff",
        link: "#7fc8ff",
        border: "#71899e",
        focusRing: "#ffd24a",
        selectedBackground: "#704b00",
        selectedForeground: "#fff4cc",
        hoverBackground: "#173248",
        activeBackground: "#203d54"
      }
    }
  },
  teenagers: {
    id: "teenagers",
    displayName: "Teens",
    description: "Violet, mint, and pink — modern and vibrant. A visual style only; it encodes no assumption about who is using it.",
    textRatio: p,
    colors: {
      shellBackground: "#5b2a86",
      shellForeground: "#ffffff",
      surfaceBackground: "#ffffff",
      surfaceForeground: "#241b2f",
      accentBackground: "#a62e6a",
      accentForeground: "#ffffff",
      link: "#5b2a86",
      border: "#76697f",
      focusRing: "#007a70",
      selectedBackground: "#cff7ea",
      selectedForeground: "#183c33",
      hoverBackground: "#faf4fc",
      activeBackground: "#f1e7f5"
    },
    variants: {
      light: {
        shellBackground: "#5b2a86",
        shellForeground: "#ffffff",
        surfaceBackground: "#ffffff",
        surfaceForeground: "#241b2f",
        accentBackground: "#a62e6a",
        accentForeground: "#ffffff",
        link: "#5b2a86",
        border: "#76697f",
        focusRing: "#007a70",
        selectedBackground: "#cff7ea",
        selectedForeground: "#183c33",
        hoverBackground: "#faf4fc",
        activeBackground: "#f1e7f5"
      },
      dark: {
        shellBackground: "#25152f",
        shellForeground: "#faf5ff",
        surfaceBackground: "#30203b",
        surfaceForeground: "#faf5ff",
        accentBackground: "#a92f72",
        accentForeground: "#ffffff",
        link: "#e0a8ff",
        border: "#90799d",
        focusRing: "#62d9be",
        selectedBackground: "#653074",
        selectedForeground: "#ffffff",
        hoverBackground: "#3b2947",
        activeBackground: "#463253"
      }
    }
  },
  adults: {
    id: "adults",
    displayName: "Standard",
    description: "Navy, deep teal, and gold — clean and professional. A visual style only; it encodes no assumption about who is using it.",
    textRatio: p,
    colors: {
      shellBackground: "#172b4d",
      shellForeground: "#ffffff",
      surfaceBackground: "#ffffff",
      surfaceForeground: "#1f262e",
      accentBackground: "#146c60",
      accentForeground: "#ffffff",
      link: "#155e52",
      border: "#69778a",
      focusRing: "#9a6500",
      selectedBackground: "#f4e5b5",
      selectedForeground: "#2f260b",
      hoverBackground: "#f4f6f8",
      activeBackground: "#e8ecf0"
    },
    variants: {
      light: {
        shellBackground: "#172b4d",
        shellForeground: "#ffffff",
        surfaceBackground: "#ffffff",
        surfaceForeground: "#1f262e",
        accentBackground: "#146c60",
        accentForeground: "#ffffff",
        link: "#155e52",
        border: "#69778a",
        focusRing: "#9a6500",
        selectedBackground: "#f4e5b5",
        selectedForeground: "#2f260b",
        hoverBackground: "#f4f6f8",
        activeBackground: "#e8ecf0"
      },
      dark: {
        shellBackground: "#101f35",
        shellForeground: "#f5f8fc",
        surfaceBackground: "#17283a",
        surfaceForeground: "#f5f8fc",
        accentBackground: "#176b60",
        accentForeground: "#ffffff",
        link: "#72d4c5",
        border: "#77899b",
        focusRing: "#ffd166",
        selectedBackground: "#294f57",
        selectedForeground: "#ffffff",
        hoverBackground: "#203448",
        activeBackground: "#294055"
      }
    }
  },
  followSystem: {
    id: "followSystem",
    displayName: "Follow System",
    description: "Resolves to Light or Dark from prefers-color-scheme at runtime.",
    textRatio: p
  },
  custom: {
    id: "custom",
    displayName: "Custom",
    description: "User-defined opaque colors validated by the contrast engine.",
    textRatio: p
  }
};
function Je(r, e, t, o) {
  if (r === "custom")
    return e ?? y.dark.colors;
  if (r === "followSystem")
    return t ? y.adults.variants.dark : y.adults.variants.light;
  if (r === "none")
    return y.light.colors;
  const s = y[r];
  return s.variants?.[o ?? "light"] ?? s.colors ?? y.light.colors;
}
const Qe = ["kids", "teenagers", "adults"], yt = {
  kids: ["Bright blue", "Orange", "Yellow"],
  teenagers: ["Violet", "Mint", "Pink"],
  adults: ["Navy", "Deep teal", "Gold"]
};
function vt(r) {
  return Qe.includes(r);
}
function V(r, e) {
  let t = Je(
    r.preset,
    r.customColors,
    e,
    r.appearanceMode
  );
  return r.accessibility.colorVisionFriendly && (t = kt(t)), r.accessibility.highContrast && (t = $t(t)), t;
}
function kt(r) {
  return le(r.surfaceBackground) ? {
    ...r,
    accentBackground: "#2563eb",
    accentForeground: "#ffffff",
    link: "#8ec5ff",
    focusRing: "#ffc857",
    selectedBackground: "#7a4a00",
    selectedForeground: "#ffffff"
  } : {
    ...r,
    accentBackground: "#005ea8",
    accentForeground: "#ffffff",
    link: "#005ea8",
    focusRing: "#a65a00",
    selectedBackground: "#ffe08a",
    selectedForeground: "#352400"
  };
}
function $t(r) {
  const e = { ...r };
  return e.shellBackground = N(
    e.shellBackground,
    e.shellForeground,
    m
  ), e.surfaceBackground = N(
    e.surfaceBackground,
    e.surfaceForeground,
    m
  ), e.accentForeground = de(e.accentBackground), e.accentBackground = N(
    e.accentBackground,
    e.accentForeground,
    m
  ), e.selectedForeground = de(e.selectedBackground), e.selectedBackground = N(
    e.selectedBackground,
    e.selectedForeground,
    m
  ), e.link = g(
    e.link,
    e.surfaceBackground,
    m
  ), e.hoverBackground = N(
    e.hoverBackground,
    e.surfaceForeground,
    m
  ), e.activeBackground = N(
    e.activeBackground,
    e.surfaceForeground,
    m
  ), e.border = g(e.border, e.surfaceBackground, 3), e.focusRing = g(e.focusRing, e.surfaceBackground, 3), e;
}
function N(r, e, t) {
  if (Ae(r, e) >= t) return r;
  const o = le(e) ? "#ffffff" : "#000000";
  for (let s = 1; s <= 100; s++) {
    const a = x(r, o, s / 100);
    if (Ae(a, e) >= t) return a;
  }
  return o;
}
const ye = "our-pa-appearance-tokens", ee = "our-pa-font-size", b = "data-our-pa-appearance", ve = "data-our-pa-font-size";
function St(r, e) {
  if (r.preset === "none") return {};
  const t = V(r, e);
  return {
    "--our-pa-shell-bg": t.shellBackground,
    "--our-pa-shell-fg": t.shellForeground,
    "--our-pa-surface-bg": t.surfaceBackground,
    "--our-pa-surface-fg": t.surfaceForeground,
    "--our-pa-accent-bg": t.accentBackground,
    "--our-pa-accent-fg": t.accentForeground,
    "--our-pa-link": t.link,
    "--our-pa-border": t.border,
    "--our-pa-focus-ring": t.focusRing,
    "--our-pa-selected-bg": t.selectedBackground,
    "--our-pa-selected-fg": t.selectedForeground,
    "--our-pa-hover-bg": t.hoverBackground,
    "--our-pa-active-bg": t.activeBackground,
    "--our-pa-status-danger-bg": "#c60239",
    "--our-pa-status-danger-fg": "#ffffff",
    "--our-pa-status-warning-bg": "#ffd621",
    "--our-pa-status-warning-fg": "#000000",
    "--our-pa-status-positive-bg": "#0d8844",
    "--our-pa-status-positive-fg": "#ffffff",
    "--our-pa-color-background": t.shellBackground,
    "--our-pa-color-surface": t.surfaceBackground,
    "--our-pa-color-text": t.surfaceForeground,
    "--our-pa-color-link": t.link,
    "--our-pa-color-button-background": t.accentBackground,
    "--our-pa-color-button-text": t.accentForeground,
    "--our-pa-color-border": t.border,
    "--our-pa-color-focus": t.focusRing,
    "--our-pa-color-status-danger-background": "#c60239",
    "--our-pa-color-status-danger-text": "#ffffff",
    "--our-pa-color-status-warning-background": "#ffd621",
    "--our-pa-color-status-warning-text": "#000000",
    "--our-pa-color-status-positive-background": "#0d8844",
    "--our-pa-color-status-positive-text": "#ffffff",
    "--our-pa-font-family": Ge(r.fontFamilyId),
    "--our-pa-motion": r.accessibility.reducedMotion ? "0.01ms" : "initial",
    "--our-pa-focus-width": r.accessibility.enhancedFocus ? "3px" : "2px"
  };
}
function _t(r, e) {
  const t = St(r, e);
  if (Object.keys(t).length === 0) return "";
  const o = Object.entries(t).map(([s, a]) => `  ${s}: ${a};`).join(`
`);
  return `
:root[${b}="on"] {
${o}
}

:root[${b}="on"] .our-pa-shell-surface {
  background-color: var(--our-pa-shell-bg) !important;
  color: var(--our-pa-shell-fg) !important;
  border-color: var(--our-pa-border);
  font-family: var(--our-pa-font-family);
}

:root[${b}="on"] .our-pa-shell-label {
  color: var(--our-pa-shell-fg);
}

:root[${b}="on"] .our-pa-shell-surface a {
  color: var(--our-pa-link);
}

:root[${b}="on"] .our-pa-shell-surface [aria-selected="true"],
:root[${b}="on"] .our-pa-shell-surface .our-pa-selected {
  background-color: var(--our-pa-selected-bg);
  color: var(--our-pa-selected-fg);
}

:root[${b}="on"][data-our-pa-enhanced-focus="on"] .our-pa-shell-surface :focus-visible,
:root[${b}="on"][data-our-pa-enhanced-focus="on"] .our-pa-recovery :focus-visible {
  outline: var(--our-pa-focus-width) solid var(--our-pa-focus-ring) !important;
  outline-offset: 2px;
}

:root[${b}="on"][data-our-pa-reduced-motion="on"] *,
:root[${b}="on"][data-our-pa-reduced-motion="on"] *::before,
:root[${b}="on"][data-our-pa-reduced-motion="on"] *::after {
  animation-duration: var(--our-pa-motion) !important;
  transition-duration: var(--our-pa-motion) !important;
  scroll-behavior: auto !important;
}
`.trim();
}
const At = [
  "uui-input",
  "uui-input-password",
  "uui-input-file",
  "uui-input-lock",
  "uui-textarea",
  "umb-input-tiptap",
  "umb-property-editor-ui-tiptap",
  "umb-code-block",
  "umb-code-editor",
  "umb-code-editor-modal"
];
function ue(r, e) {
  if (r.preset === "none") return "";
  const t = V(r, e), o = y[r.preset], s = r.accessibility.highContrast ? m : o.textRatio, a = mt({
    colors: t,
    textRatio: s,
    keepNativeStatusColors: o.keepNativeStatusColors,
    fontStack: Ge(r.fontFamilyId)
  }), i = {
    ...a,
    ...wt(t, a)
  }, n = [`:root {
${Re(i)}
}`];
  return n.push(
    `${At.join(`,
`)} {
${Re(pt)}
}`
  ), r.accessibility.enhancedFocus && n.push(`:root {
  --uui-focus-outline-width: 3px;
}`), (r.preset === "highContrast" || r.accessibility.highContrast) && n.push(`:root {
  color-scheme: light;
}

/* App header lives in a shadow tree, so host borders never match.
   One hairline under the 60px header. Do not draw a second full-width
   line — it cuts through the section tree. */
umb-app {
  position: relative;
}

umb-app::after {
  content: '';
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  height: 2px;
  z-index: 20;
  background: var(--uui-color-border);
}`), r.accessibility.reducedMotion && n.push(
    `:root {
  --uui-transition-duration: 0.01ms;
  --uui-animation-duration: 0.01ms;
  scroll-behavior: auto;
}`
  ), n.join(`

`);
}
function Re(r) {
  return Object.entries(r).map(([e, t]) => `  ${e}: ${t};`).join(`
`);
}
function wt(r, e) {
  return {
    "--our-pa-color-background": e["--uui-color-background"] ?? r.shellBackground,
    "--our-pa-color-surface": r.surfaceBackground,
    "--our-pa-color-text": r.surfaceForeground,
    "--our-pa-color-text-muted": e["--uui-color-text-alt"] ?? r.surfaceForeground,
    "--our-pa-color-link": r.link,
    "--our-pa-color-button-background": r.accentBackground,
    "--our-pa-color-button-text": r.accentForeground,
    "--our-pa-color-border": r.border,
    "--our-pa-color-focus": r.focusRing,
    "--our-pa-color-selected-background": r.selectedBackground,
    "--our-pa-color-selected-text": r.selectedForeground,
    "--our-pa-color-hover": r.hoverBackground,
    "--our-pa-color-active": r.activeBackground,
    "--our-pa-color-status-danger-background": e["--uui-color-danger"] ?? "#c60239",
    "--our-pa-color-status-danger-text": e["--uui-color-danger-contrast"] ?? "#ffffff",
    "--our-pa-color-status-warning-background": e["--uui-color-warning"] ?? "#ffd621",
    "--our-pa-color-status-warning-text": e["--uui-color-warning-contrast"] ?? "#000000",
    "--our-pa-color-status-positive-background": e["--uui-color-positive"] ?? "#0d8844",
    "--our-pa-color-status-positive-text": e["--uui-color-positive-contrast"] ?? "#ffffff"
  };
}
function Ct(r) {
  const e = Ke(r);
  return e.id === ie ? "" : `:root {
  --our-pa-type-size: ${e.defaultSizePx}px;
  --uui-type-default-size: ${e.defaultSizePx}px;
  --uui-type-small-size: ${e.smallSizePx}px;
  --uui-type-h5-size: ${e.defaultSizePx}px;
  --uui-type-h6-size: ${e.smallSizePx}px;
  --uui-button-font-size: ${e.defaultSizePx}px;
}

html,
body,
umb-app {
  font-size: ${e.defaultSizePx}px;
  line-height: 1.45;
}`.trim();
}
const xt = ["url(", "javascript:", "expression(", "@import", "<script", "gradient(", "var(--", "calc("];
function oe(r) {
  const e = [], t = [];
  if (r.schemaVersion !== 1 && e.push({
    code: "schema_version",
    message: `Unsupported schema version ${r.schemaVersion}. Expected 1.`,
    path: "schemaVersion",
    correctionOptions: ["Set schemaVersion to 1."]
  }), !(r.preset in y))
    return e.push({
      code: "preset_invalid",
      message: "Unknown appearance preset.",
      path: "preset",
      correctionOptions: Object.keys(y)
    }), { isValid: !1, problems: e, contrastReport: t };
  if (r.fontSizeId && !ht(r.fontSizeId) && e.push({
    code: "font_size_invalid",
    message: "Font size must be low, normal, or large.",
    path: "fontSizeId",
    correctionOptions: ["low", "normal", "large"]
  }), r.preset === "none")
    return { isValid: e.length === 0, problems: e, contrastReport: t };
  r.fontFamilyId && !ft(r.fontFamilyId) && e.push({
    code: "font_not_approved",
    message: "Font family must be an approved font ID.",
    path: "fontFamilyId",
    correctionOptions: ["Choose an approved font ID only."]
  });
  const o = JSON.stringify(r);
  if (xt.some((a) => o.toLowerCase().includes(a)) && e.push({
    code: "payload_forbidden",
    message: "Arbitrary CSS, JavaScript, URLs, gradients, and uploaded fonts are not accepted.",
    path: "$",
    correctionOptions: ["Use opaque hex colors (#RRGGBB) and approved font IDs only."]
  }), r.preset === "followSystem") {
    const a = r.accessibility.highContrast ? m : p;
    return ke(V(r, !1), a, t, e), ke(V(r, !0), a, t, e), { isValid: e.length === 0, problems: e, contrastReport: t };
  }
  const s = r.preset === "custom" && !r.customColors ? void 0 : V(r, r.appearanceMode === "dark");
  if (r.preset === "custom" && (!r.customThemeName?.trim() || r.customThemeName.length > 60) && e.push({
    code: "custom_theme_name_invalid",
    message: "Custom theme name is required and must be 60 characters or fewer.",
    path: "customThemeName",
    correctionOptions: ["Enter a short plain-text theme name."]
  }), r.preset === "custom" && !s)
    return e.push({
      code: "custom_colors_required",
      message: "Custom appearance requires customColors.",
      path: "customColors",
      correctionOptions: ["Provide opaque hex colors for all custom color fields."]
    }), { isValid: !1, problems: e, contrastReport: t };
  if (s) {
    const a = r.preset === "highContrast" || r.accessibility.highContrast ? m : p;
    ke(s, a, t, e);
  }
  return { isValid: e.length === 0, problems: e, contrastReport: t };
}
function ke(r, e, t, o) {
  const s = Object.entries(r);
  for (const [a, i] of s)
    _(i) || o.push({
      code: "color_format",
      message: `'${i}' is not an accepted opaque hex color.`,
      path: a,
      correctionOptions: ["Use #RGB or #RRGGBB only."]
    });
  o.some((a) => a.code === "color_format") || (w("Shell text", r.shellForeground, r.shellBackground, e, "text", t, o), w("Surface text", r.surfaceForeground, r.surfaceBackground, e, "text", t, o), w("Accent text", r.accentForeground, r.accentBackground, e, "text", t, o), w("Selected text", r.selectedForeground, r.selectedBackground, e, "text", t, o), w("Link on surface", r.link, r.surfaceBackground, e, "link", t, o), w("Border on shell", r.border, r.shellBackground, F, "border", t, o), w("Focus ring on workspace", r.focusRing, r.surfaceBackground, F, "focus", t, o), w("Hover surface text", r.surfaceForeground, r.hoverBackground, e, "hover", t, o), w("Active surface text", r.surfaceForeground, r.activeBackground, e, "active", t, o));
}
function w(r, e, t, o, s, a, i) {
  const n = Math.round(Ae(e, t) * 100) / 100, c = n + 1e-4 >= o;
  a.push({ label: r, foreground: e, background: t, ratio: n, requiredRatio: o, passes: c, role: s }), c || i.push({
    code: "contrast_insufficient",
    message: `${r} contrast is ${n}:1; required ${o}:1.`,
    path: s,
    contrastRatio: n,
    requiredRatio: o,
    correctionOptions: [
      `Auto-set foreground to ${de(t)}`,
      "Darken the background",
      "Lighten the background",
      "Choose High Contrast"
    ]
  });
}
class Bt {
  static isSupported() {
    const e = document.querySelector('meta[name="umbraco-version"]')?.getAttribute("content");
    return e?.startsWith("17.") || e?.startsWith("18.") ? !0 : !!(customElements.get("umb-app") || document.querySelector("umb-backoffice") || document.body);
  }
}
const j = "Our.PersonalAppearance.Theme.Configured.CurrentUser", we = (r) => ({ default: r }), Xe = () => typeof window < "u" && typeof window.matchMedia == "function" && window.matchMedia("(prefers-color-scheme: dark)").matches, v = (r, e, t, o, s) => ({
  type: "theme",
  alias: r,
  name: e,
  weight: o,
  css: async () => {
    const a = $();
    return a.preset = t, a.appearanceMode = s?.mode ?? "light", a.accessibility.colorVisionFriendly = s?.colorVisionFriendly ?? !1, a.accessibility.highContrast = s?.highContrast ?? !1, a.accessibility.enhancedFocus = s?.enhancedFocus ?? !1, we(ue(a, Xe()));
  }
}), Et = () => {
  let r = 400;
  const e = () => r--;
  return [
    {
      type: "theme",
      alias: "Our.PersonalAppearance.Theme.FollowSystem",
      name: "Follow System",
      weight: e(),
      css: async () => {
        const t = $();
        t.preset = "adults", t.appearanceMode = "light";
        const o = $();
        return o.preset = "adults", o.appearanceMode = "dark", we(
          `${ue(t, !1)}

@media (prefers-color-scheme: dark) {
${ue(o, !0)}
}`
        );
      }
    },
    v(
      "Our.PersonalAppearance.Theme.Adults.Light",
      "Standard Light",
      "adults",
      e(),
      { mode: "light" }
    ),
    v(
      "Our.PersonalAppearance.Theme.Adults.Dark",
      "Standard Dark",
      "adults",
      e(),
      { mode: "dark" }
    ),
    v("Our.PersonalAppearance.Theme.Kids.Light", "Kids Light", "kids", e(), {
      mode: "light"
    }),
    v("Our.PersonalAppearance.Theme.Kids.Dark", "Kids Dark", "kids", e(), {
      mode: "dark"
    }),
    v(
      "Our.PersonalAppearance.Theme.Teenagers.Light",
      "Teens Light",
      "teenagers",
      e(),
      { mode: "light" }
    ),
    v(
      "Our.PersonalAppearance.Theme.Teenagers.Dark",
      "Teens Dark",
      "teenagers",
      e(),
      { mode: "dark" }
    ),
    v("Our.PersonalAppearance.Theme.Dim", "Dimmed", "dim", e()),
    v("Our.PersonalAppearance.Theme.EyeComfort", "Eye Comfort", "warmComfort", e()),
    v(
      "Our.PersonalAppearance.Theme.BlackAndWhite",
      "Black & White",
      "blackAndWhite",
      e()
    ),
    v(
      "Our.PersonalAppearance.Theme.ColorVisionFriendly",
      "Colour Vision Support",
      "colorVisionFriendly",
      e()
    ),
    v("Our.PersonalAppearance.Theme.HighContrast", "High Contrast", "highContrast", e(), {
      enhancedFocus: !0
    })
  ];
};
function Ye(r) {
  return r.preset === "custom" || r.accessibility.colorVisionFriendly || r.accessibility.highContrast || r.accessibility.reducedMotion || r.accessibility.enhancedFocus || !!r.fontFamilyId && r.fontFamilyId !== "umbraco-default";
}
const Ft = (r) => ({
  type: "theme",
  alias: j,
  name: r.preset === "custom" ? r.customThemeName?.trim() || "My custom theme" : `My ${Tt[r.preset] ?? "configured"} theme`,
  weight: 410,
  css: async () => we(ue(r, Xe()))
}), Tt = {
  followSystem: "Follow System",
  adults: "Standard",
  kids: "Kids",
  teenagers: "Teens",
  dim: "Dimmed",
  warmComfort: "Eye Comfort",
  blackAndWhite: "Black & White",
  colorVisionFriendly: "Colour Vision Support",
  highContrast: "High Contrast"
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis, Ce = se.ShadowRoot && (se.ShadyCSS === void 0 || se.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, xe = Symbol(), Me = /* @__PURE__ */ new WeakMap();
let et = class {
  constructor(e, t, o) {
    if (this._$cssResult$ = !0, o !== xe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Ce && e === void 0) {
      const o = t !== void 0 && t.length === 1;
      o && (e = Me.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), o && Me.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Pt = (r) => new et(typeof r == "string" ? r : r + "", void 0, xe), tt = (r, ...e) => {
  const t = r.length === 1 ? r[0] : e.reduce((o, s, a) => o + ((i) => {
    if (i._$cssResult$ === !0) return i.cssText;
    if (typeof i == "number") return i;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + i + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + r[a + 1], r[0]);
  return new et(t, r, xe);
}, Ot = (r, e) => {
  if (Ce) r.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const o = document.createElement("style"), s = se.litNonce;
    s !== void 0 && o.setAttribute("nonce", s), o.textContent = t.cssText, r.appendChild(o);
  }
}, Ne = Ce ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const o of e.cssRules) t += o.cssText;
  return Pt(t);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Rt, defineProperty: Mt, getOwnPropertyDescriptor: Nt, getOwnPropertyNames: It, getOwnPropertySymbols: zt, getPrototypeOf: Ut } = Object, pe = globalThis, Ie = pe.trustedTypes, Dt = Ie ? Ie.emptyScript : "", Lt = pe.reactiveElementPolyfillSupport, q = (r, e) => r, fe = { toAttribute(r, e) {
  switch (e) {
    case Boolean:
      r = r ? Dt : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, e) {
  let t = r;
  switch (e) {
    case Boolean:
      t = r !== null;
      break;
    case Number:
      t = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(r);
      } catch {
        t = null;
      }
  }
  return t;
} }, Be = (r, e) => !Rt(r, e), ze = { attribute: !0, type: String, converter: fe, reflect: !1, useDefault: !1, hasChanged: Be };
Symbol.metadata ??= Symbol("metadata"), pe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let I = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ze) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const o = Symbol(), s = this.getPropertyDescriptor(e, o, t);
      s !== void 0 && Mt(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, o) {
    const { get: s, set: a } = Nt(this.prototype, e) ?? { get() {
      return this[t];
    }, set(i) {
      this[t] = i;
    } };
    return { get: s, set(i) {
      const n = s?.call(this);
      a?.call(this, i), this.requestUpdate(e, n, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ze;
  }
  static _$Ei() {
    if (this.hasOwnProperty(q("elementProperties"))) return;
    const e = Ut(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(q("properties"))) {
      const t = this.properties, o = [...It(t), ...zt(t)];
      for (const s of o) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [o, s] of t) this.elementProperties.set(o, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, o] of this.elementProperties) {
      const s = this._$Eu(t, o);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const o = new Set(e.flat(1 / 0).reverse());
      for (const s of o) t.unshift(Ne(s));
    } else e !== void 0 && t.push(Ne(e));
    return t;
  }
  static _$Eu(e, t) {
    const o = t.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const o of t.keys()) this.hasOwnProperty(o) && (e.set(o, this[o]), delete this[o]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ot(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, o) {
    this._$AK(e, o);
  }
  _$ET(e, t) {
    const o = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, o);
    if (s !== void 0 && o.reflect === !0) {
      const a = (o.converter?.toAttribute !== void 0 ? o.converter : fe).toAttribute(t, o.type);
      this._$Em = e, a == null ? this.removeAttribute(s) : this.setAttribute(s, a), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const o = this.constructor, s = o._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const a = o.getPropertyOptions(s), i = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : fe;
      this._$Em = s;
      const n = i.fromAttribute(t, a.type);
      this[s] = n ?? this._$Ej?.get(s) ?? n, this._$Em = null;
    }
  }
  requestUpdate(e, t, o, s = !1, a) {
    if (e !== void 0) {
      const i = this.constructor;
      if (s === !1 && (a = this[e]), o ??= i.getPropertyOptions(e), !((o.hasChanged ?? Be)(a, t) || o.useDefault && o.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(i._$Eu(e, o)))) return;
      this.C(e, t, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: o, reflect: s, wrapped: a }, i) {
    o && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, i ?? t ?? this[e]), a !== !0 || i !== void 0) || (this._$AL.has(e) || (this.hasUpdated || o || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [s, a] of this._$Ep) this[s] = a;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [s, a] of o) {
        const { wrapped: i } = a, n = this[s];
        i !== !0 || this._$AL.has(s) || n === void 0 || this.C(s, void 0, a, n);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((o) => o.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (o) {
      throw e = !1, this._$EM(), o;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
I.elementStyles = [], I.shadowRootOptions = { mode: "open" }, I[q("elementProperties")] = /* @__PURE__ */ new Map(), I[q("finalized")] = /* @__PURE__ */ new Map(), Lt?.({ ReactiveElement: I }), (pe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ee = globalThis, Ue = (r) => r, he = Ee.trustedTypes, De = he ? he.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, rt = "$lit$", B = `lit$${Math.random().toFixed(9).slice(2)}$`, ot = "?" + B, Ht = `<${ot}>`, R = document, W = () => R.createComment(""), G = (r) => r === null || typeof r != "object" && typeof r != "function", Fe = Array.isArray, Vt = (r) => Fe(r) || typeof r?.[Symbol.iterator] == "function", $e = `[ 	
\f\r]`, H = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Le = /-->/g, He = />/g, E = RegExp(`>|${$e}(?:([^\\s"'>=/]+)(${$e}*=${$e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ve = /'/g, je = /"/g, st = /^(?:script|style|textarea|title)$/i, jt = (r) => (e, ...t) => ({ _$litType$: r, strings: e, values: t }), f = jt(1), U = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), qe = /* @__PURE__ */ new WeakMap(), T = R.createTreeWalker(R, 129);
function at(r, e) {
  if (!Fe(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return De !== void 0 ? De.createHTML(e) : e;
}
const qt = (r, e) => {
  const t = r.length - 1, o = [];
  let s, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", i = H;
  for (let n = 0; n < t; n++) {
    const c = r[n];
    let u, h, l = -1, A = 0;
    for (; A < c.length && (i.lastIndex = A, h = i.exec(c), h !== null); ) A = i.lastIndex, i === H ? h[1] === "!--" ? i = Le : h[1] !== void 0 ? i = He : h[2] !== void 0 ? (st.test(h[2]) && (s = RegExp("</" + h[2], "g")), i = E) : h[3] !== void 0 && (i = E) : i === E ? h[0] === ">" ? (i = s ?? H, l = -1) : h[1] === void 0 ? l = -2 : (l = i.lastIndex - h[2].length, u = h[1], i = h[3] === void 0 ? E : h[3] === '"' ? je : Ve) : i === je || i === Ve ? i = E : i === Le || i === He ? i = H : (i = E, s = void 0);
    const C = i === E && r[n + 1].startsWith("/>") ? " " : "";
    a += i === H ? c + Ht : l >= 0 ? (o.push(u), c.slice(0, l) + rt + c.slice(l) + B + C) : c + B + (l === -2 ? n : C);
  }
  return [at(r, a + (r[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), o];
};
class K {
  constructor({ strings: e, _$litType$: t }, o) {
    let s;
    this.parts = [];
    let a = 0, i = 0;
    const n = e.length - 1, c = this.parts, [u, h] = qt(e, t);
    if (this.el = K.createElement(u, o), T.currentNode = this.el.content, t === 2 || t === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (s = T.nextNode()) !== null && c.length < n; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const l of s.getAttributeNames()) if (l.endsWith(rt)) {
          const A = h[i++], C = s.getAttribute(l).split(B), X = /([.?@])?(.*)/.exec(A);
          c.push({ type: 1, index: a, name: X[2], strings: C, ctor: X[1] === "." ? Gt : X[1] === "?" ? Kt : X[1] === "@" ? Zt : ge }), s.removeAttribute(l);
        } else l.startsWith(B) && (c.push({ type: 6, index: a }), s.removeAttribute(l));
        if (st.test(s.tagName)) {
          const l = s.textContent.split(B), A = l.length - 1;
          if (A > 0) {
            s.textContent = he ? he.emptyScript : "";
            for (let C = 0; C < A; C++) s.append(l[C], W()), T.nextNode(), c.push({ type: 2, index: ++a });
            s.append(l[A], W());
          }
        }
      } else if (s.nodeType === 8) if (s.data === ot) c.push({ type: 2, index: a });
      else {
        let l = -1;
        for (; (l = s.data.indexOf(B, l + 1)) !== -1; ) c.push({ type: 7, index: a }), l += B.length - 1;
      }
      a++;
    }
  }
  static createElement(e, t) {
    const o = R.createElement("template");
    return o.innerHTML = e, o;
  }
}
function D(r, e, t = r, o) {
  if (e === U) return e;
  let s = o !== void 0 ? t._$Co?.[o] : t._$Cl;
  const a = G(e) ? void 0 : e._$litDirective$;
  return s?.constructor !== a && (s?._$AO?.(!1), a === void 0 ? s = void 0 : (s = new a(r), s._$AT(r, t, o)), o !== void 0 ? (t._$Co ??= [])[o] = s : t._$Cl = s), s !== void 0 && (e = D(r, s._$AS(r, e.values), s, o)), e;
}
class Wt {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: o } = this._$AD, s = (e?.creationScope ?? R).importNode(t, !0);
    T.currentNode = s;
    let a = T.nextNode(), i = 0, n = 0, c = o[0];
    for (; c !== void 0; ) {
      if (i === c.index) {
        let u;
        c.type === 2 ? u = new J(a, a.nextSibling, this, e) : c.type === 1 ? u = new c.ctor(a, c.name, c.strings, this, e) : c.type === 6 && (u = new Jt(a, this, e)), this._$AV.push(u), c = o[++n];
      }
      i !== c?.index && (a = T.nextNode(), i++);
    }
    return T.currentNode = R, s;
  }
  p(e) {
    let t = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(e, o, t), t += o.strings.length - 2) : o._$AI(e[t])), t++;
  }
}
class J {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, o, s) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = o, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = D(this, e, t), G(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== U && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Vt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && G(this._$AH) ? this._$AA.nextSibling.data = e : this.T(R.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: o } = e, s = typeof o == "number" ? this._$AC(e) : (o.el === void 0 && (o.el = K.createElement(at(o.h, o.h[0]), this.options)), o);
    if (this._$AH?._$AD === s) this._$AH.p(t);
    else {
      const a = new Wt(s, this), i = a.u(this.options);
      a.p(t), this.T(i), this._$AH = a;
    }
  }
  _$AC(e) {
    let t = qe.get(e.strings);
    return t === void 0 && qe.set(e.strings, t = new K(e)), t;
  }
  k(e) {
    Fe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let o, s = 0;
    for (const a of e) s === t.length ? t.push(o = new J(this.O(W()), this.O(W()), this, this.options)) : o = t[s], o._$AI(a), s++;
    s < t.length && (this._$AR(o && o._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const o = Ue(e).nextSibling;
      Ue(e).remove(), e = o;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ge {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, o, s, a) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = a, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = d;
  }
  _$AI(e, t = this, o, s) {
    const a = this.strings;
    let i = !1;
    if (a === void 0) e = D(this, e, t, 0), i = !G(e) || e !== this._$AH && e !== U, i && (this._$AH = e);
    else {
      const n = e;
      let c, u;
      for (e = a[0], c = 0; c < a.length - 1; c++) u = D(this, n[o + c], t, c), u === U && (u = this._$AH[c]), i ||= !G(u) || u !== this._$AH[c], u === d ? e = d : e !== d && (e += (u ?? "") + a[c + 1]), this._$AH[c] = u;
    }
    i && !s && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Gt extends ge {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class Kt extends ge {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Zt extends ge {
  constructor(e, t, o, s, a) {
    super(e, t, o, s, a), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = D(this, e, t, 0) ?? d) === U) return;
    const o = this._$AH, s = e === d && o !== d || e.capture !== o.capture || e.once !== o.once || e.passive !== o.passive, a = e !== d && (o === d || s);
    s && this.element.removeEventListener(this.name, this, o), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Jt {
  constructor(e, t, o) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    D(this, e);
  }
}
const Qt = Ee.litHtmlPolyfillSupport;
Qt?.(K, J), (Ee.litHtmlVersions ??= []).push("3.3.3");
const Xt = (r, e, t) => {
  const o = t?.renderBefore ?? e;
  let s = o._$litPart$;
  if (s === void 0) {
    const a = t?.renderBefore ?? null;
    o._$litPart$ = s = new J(e.insertBefore(W(), a), a, void 0, t ?? {});
  }
  return s._$AI(r), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Te = globalThis;
class z extends I {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Xt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return U;
  }
}
z._$litElement$ = !0, z.finalized = !0, Te.litElementHydrateSupport?.({ LitElement: z });
const Yt = Te.litElementPolyfillSupport;
Yt?.({ LitElement: z });
(Te.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const it = (r) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(r, e);
  }) : customElements.define(r, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const er = { attribute: !0, type: String, converter: fe, reflect: !1, hasChanged: Be }, tr = (r = er, e, t) => {
  const { kind: o, metadata: s } = t;
  let a = globalThis.litPropertyMetadata.get(s);
  if (a === void 0 && globalThis.litPropertyMetadata.set(s, a = /* @__PURE__ */ new Map()), o === "setter" && ((r = Object.create(r)).wrapped = !0), a.set(t.name, r), o === "accessor") {
    const { name: i } = t;
    return { set(n) {
      const c = e.get.call(this);
      e.set.call(this, n), this.requestUpdate(i, c, r, !0, n);
    }, init(n) {
      return n !== void 0 && this.C(i, void 0, r, n), n;
    } };
  }
  if (o === "setter") {
    const { name: i } = t;
    return function(n) {
      const c = this[i];
      e.call(this, n), this.requestUpdate(i, c, r, !0, n);
    };
  }
  throw Error("Unsupported decorator location: " + o);
};
function rr(r) {
  return (e, t) => typeof t == "object" ? tr(r, e, t) : ((o, s, a) => {
    const i = s.hasOwnProperty(a);
    return s.constructor.createProperty(a, o), i ? Object.getOwnPropertyDescriptor(s, a) : void 0;
  })(r, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function L(r) {
  return rr({ ...r, state: !0, attribute: !1 });
}
var or = Object.defineProperty, sr = Object.getOwnPropertyDescriptor, Q = (r, e, t, o) => {
  for (var s = o > 1 ? void 0 : o ? sr(e, t) : e, a = r.length - 1, i; a >= 0; a--)
    (i = r[a]) && (s = (o ? i(e, t, s) : i(s)) || s);
  return o && s && or(e, t, s), s;
};
const ar = [
  "followSystem",
  "dim",
  "warmComfort",
  "blackAndWhite",
  "colorVisionFriendly",
  "highContrast",
  "custom",
  "none"
];
let M = class extends z {
  constructor() {
    super(...arguments), this.draft = $(), this.statusMessage = "", this.errorMessage = "", this.busy = !1;
  }
  connectedCallback() {
    super.connectedCallback();
    const e = k.get()?.getEffective() ?? $();
    this.draft = {
      ...e,
      appearanceMode: e.appearanceMode ?? "light",
      accessibility: {
        ...e.accessibility,
        highContrast: e.accessibility.highContrast ?? !1
      }
    }, this.draft.preset === "custom" && !this.draft.customColors && (this.draft = {
      ...this.draft,
      customColors: structuredClone(y.dark.colors)
    });
  }
  get validation() {
    return oe(this.draft);
  }
  selectPreset(r) {
    const e = structuredClone(this.draft);
    e.preset = r, r === "custom" && !e.customColors && (e.customColors = structuredClone(y.dark.colors)), this.draft = e, this.errorMessage = "";
  }
  updateCustomColor(r, e) {
    this.draft.customColors && (this.draft = {
      ...this.draft,
      preset: "custom",
      customColors: { ...this.draft.customColors, [r]: e }
    });
  }
  autoFixForeground(r, e) {
    if (!this.draft.customColors) return;
    const t = this.draft.customColors[r];
    try {
      this.updateCustomColor(e, de(t));
    } catch {
      this.errorMessage = "Could not auto-select foreground for that background.";
    }
  }
  async onPreview() {
    const r = k.get();
    if (!r) return;
    const e = r.setPreview(this.draft);
    if (!e.ok) {
      this.errorMessage = e.reason ?? "Preview blocked — draft is invalid.", this.statusMessage = "";
      return;
    }
    this.errorMessage = "", this.statusMessage = "Preview applied to this tab only. It is not saved.";
  }
  async onSave() {
    const r = k.get();
    if (r) {
      if (!this.validation.isValid) {
        this.errorMessage = "Fix contrast/validation problems before saving. Invalid drafts are not persisted.";
        return;
      }
      this.busy = !0;
      try {
        const e = await r.save(this.draft);
        this.draft = e, this.statusMessage = "Saved for you. Preferences are personal and server-persisted.", this.errorMessage = "";
      } catch (e) {
        this.errorMessage = e instanceof Error ? e.message : "Save failed.";
      } finally {
        this.busy = !1;
      }
    }
  }
  onCancel() {
    const r = k.get();
    r?.cancelPreview(), this.draft = r?.getSaved() ?? $(), this.statusMessage = "Cancelled. Restored your last saved preference in this tab.", this.errorMessage = "";
  }
  async onReset() {
    const r = k.get();
    if (r) {
      this.busy = !0;
      try {
        await r.reset(), this.draft = $(), this.statusMessage = "Reset to Umbraco default. Preference removed; all package overrides cleared.", this.errorMessage = "";
      } catch (e) {
        this.errorMessage = e instanceof Error ? e.message : "Reset failed.";
      } finally {
        this.busy = !1;
      }
    }
  }
  render() {
    const r = this.validation, e = this.draft.customColors;
    return f`
      <section class="panel our-pa-shell-surface" aria-labelledby="our-pa-title">
        <header class="header our-pa-recovery">
          <h2 id="our-pa-title" class="our-pa-shell-label">Appearance Studio</h2>
          <p class="lede">
            Build personal color combinations for your account. Saved custom themes are added to
            Umbraco's existing Theme dropdown. No permission to manage other users is required.
          </p>
          <p class="note">
            Protected native editing fields (text boxes, rich text, code editors) may remain light inside
            a dark interface. Theme changes never modify stored content or mark documents dirty.
          </p>
        </header>

        <section aria-labelledby="our-pa-audience-heading">
          <h3 id="our-pa-audience-heading">Audience palettes</h3>
          <p class="note">
            Each palette has light and dark modes. High contrast and the blue-and-amber colour-vision
            option are independent and combine with either mode.
          </p>
          <div class="presets" role="list">
            ${Qe.map((t) => this.presetCard(t, yt[t]))}
          </div>
        </section>

        <section aria-labelledby="our-pa-other-heading">
          <h3 id="our-pa-other-heading">Other appearances</h3>
          <div class="presets" role="list">
            ${ar.map((t) => this.presetCard(t))}
          </div>
        </section>

        ${vt(this.draft.preset) ? f`
              <fieldset>
                <legend>Mode</legend>
                <div class="choices">
                  ${["light", "dark"].map(
      (t) => f`
                      <label class="check">
                        <input
                          type="radio"
                          name="appearance-mode"
                          value=${t}
                          .checked=${this.draft.appearanceMode === t}
                          @change=${() => {
        this.draft = { ...this.draft, appearanceMode: t };
      }}
                        />
                        ${t === "light" ? "Light mode" : "Dark mode"}
                      </label>
                    `
    )}
                </div>
              </fieldset>
            ` : d}

        ${this.draft.preset === "custom" && e ? f`
              <fieldset class="custom">
                <legend>Custom theme (opaque hex only)</legend>
                <label>
                  Theme name
                  <input
                    type="text"
                    maxlength="60"
                    .value=${this.draft.customThemeName ?? ""}
                    @input=${(t) => {
      this.draft = {
        ...this.draft,
        customThemeName: t.target.value
      };
    }}
                  />
                </label>
                ${this.colorField("Shell background", "shellBackground", "shellForeground")}
                ${this.colorField("Surface background", "surfaceBackground", "surfaceForeground")}
                ${this.colorField("Accent background", "accentBackground", "accentForeground")}
                ${this.colorField("Selected background", "selectedBackground", "selectedForeground")}
                <label>
                  Link
                  <input
                    type="text"
                    .value=${e.link}
                    @input=${(t) => this.updateCustomColor("link", t.target.value)}
                  />
                </label>
                <label>
                  Border
                  <input
                    type="text"
                    .value=${e.border}
                    @input=${(t) => this.updateCustomColor("border", t.target.value)}
                  />
                </label>
                <label>
                  Focus ring
                  <input
                    type="text"
                    .value=${e.focusRing}
                    @input=${(t) => this.updateCustomColor("focusRing", t.target.value)}
                  />
                </label>
              </fieldset>
            ` : d}

        <fieldset>
          <legend>Font family</legend>
          <select
            .value=${this.draft.fontFamilyId ?? "umbraco-default"}
            @change=${(t) => {
      this.draft = {
        ...this.draft,
        fontFamilyId: t.target.value
      };
    }}
          >
            ${ae.map(
      (t) => f`<option value=${t.id}>${t.displayName}</option>`
    )}
          </select>
        </fieldset>

        <fieldset>
          <legend>Accessibility options (independently combinable)</legend>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.highContrast}
              @change=${(t) => {
      this.draft = {
        ...this.draft,
        accessibility: {
          ...this.draft.accessibility,
          highContrast: t.target.checked
        }
      };
    }}
            />
            High contrast (targets 7:1 for interface text)
          </label>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.colorVisionFriendly}
              @change=${(t) => {
      this.draft = {
        ...this.draft,
        accessibility: {
          ...this.draft.accessibility,
          colorVisionFriendly: t.target.checked
        }
      };
    }}
            />
            Alternate blue-and-amber palette (does not rely on red/green distinction)
          </label>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.reducedMotion}
              @change=${(t) => {
      this.draft = {
        ...this.draft,
        accessibility: {
          ...this.draft.accessibility,
          reducedMotion: t.target.checked
        }
      };
    }}
            />
            Reduced motion
          </label>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.enhancedFocus}
              @change=${(t) => {
      this.draft = {
        ...this.draft,
        accessibility: {
          ...this.draft.accessibility,
          enhancedFocus: t.target.checked
        }
      };
    }}
            />
            Enhanced focus indicators
          </label>
        </fieldset>

        <section class="report" aria-live="polite">
          <h3>Contrast report</h3>
          ${r.contrastReport.length === 0 ? f`<p>No package color pairs to report for this preset.</p>` : f`
                <table>
                  <thead>
                    <tr>
                      <th>Pair</th>
                      <th>Ratio</th>
                      <th>Required</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${r.contrastReport.map(
      (t) => f`
                        <tr>
                          <td>${t.label}</td>
                          <td>${t.ratio}:1</td>
                          <td>${t.requiredRatio}:1</td>
                        <td>${t.passes ? "✓ Pass" : "! Fail"}</td>
                        </tr>
                      `
    )}
                  </tbody>
                </table>
              `}
          ${r.problems.length ? f`
                <ul class="problems">
                  ${r.problems.map(
      (t) => f`
                      <li>
                        <strong>${t.message}</strong>
                        ${t.correctionOptions?.length ? f`<div>Options: ${t.correctionOptions.join(" · ")}</div>` : d}
                      </li>
                    `
    )}
                </ul>
              ` : d}
        </section>

        <section class="preview-box our-pa-shell-surface" aria-label="Contained preview">
          <div class="our-pa-shell-label">Shell label sample</div>
          <a href="#">Navigation link sample</a>
          <div class="our-pa-selected" aria-selected="true">Selected state sample</div>
          <div class="status-row" aria-label="Status samples. Colour is never the only signal.">
            <span class="status-chip danger"><span aria-hidden="true">!</span> Error</span>
            <span class="status-chip warning"><span aria-hidden="true">i</span> Warning</span>
            <span class="status-chip positive"><span aria-hidden="true">✓</span> Success</span>
          </div>
          <p class="note">Editors below stay native on purpose:</p>
          <label>
            Protected textbox
            <input type="text" value="Native editing surface" readonly />
          </label>
          <label>
            Protected textarea
            <textarea readonly>RTE / textarea interiors are not restyled.</textarea>
          </label>
        </section>

        <div class="actions our-pa-recovery">
          <button type="button" ?disabled=${this.busy} @click=${this.onPreview}>Preview</button>
          <button type="button" class="primary" ?disabled=${this.busy} @click=${this.onSave}>
            Save for me
          </button>
          <button type="button" ?disabled=${this.busy} @click=${this.onCancel}>Cancel</button>
          <button type="button" ?disabled=${this.busy} @click=${this.onReset}>
            Reset to Umbraco default
          </button>
        </div>

        ${this.statusMessage ? f`<p class="status" role="status"><strong>✓ Success:</strong> ${this.statusMessage}</p>` : d}
        ${this.errorMessage ? f`<p class="error" role="alert"><strong>! Error:</strong> ${this.errorMessage}</p>` : d}
      </section>
    `;
  }
  presetCard(r, e) {
    const t = y[r];
    return f`
      <button
        type="button"
        class="preset-card ${this.draft.preset === r ? "selected our-pa-selected" : ""}"
        role="listitem"
        aria-pressed=${this.draft.preset === r}
        @click=${() => this.selectPreset(r)}
      >
        <span class="swatch" style=${this.swatchStyle(r)}></span>
        <strong>${t.displayName}</strong>
        ${e ? f`
              <span class="hues" aria-label=${`Hues: ${e.join(", ")}`}>
                ${e.map((o) => f`<span class="hue-label">${o}</span>`)}
              </span>
            ` : d}
        <span>${t.description}</span>
      </button>
    `;
  }
  colorField(r, e, t) {
    const o = this.draft.customColors;
    return f`
      <div class="color-row">
        <label>
          ${r}
          <input
            type="text"
            .value=${o[e]}
            @input=${(s) => this.updateCustomColor(e, s.target.value)}
          />
        </label>
        <label>
          Foreground
          <input
            type="text"
            .value=${o[t]}
            @input=${(s) => this.updateCustomColor(t, s.target.value)}
          />
        </label>
        <button type="button" class="our-pa-recovery" @click=${() => this.autoFixForeground(e, t)}>
          Auto foreground
        </button>
      </div>
    `;
  }
  swatchStyle(r) {
    const e = Je(
      r,
      void 0,
      this.draft.appearanceMode === "dark",
      this.draft.appearanceMode
    );
    return `background: linear-gradient(90deg, ${e.shellBackground} 50%, ${e.accentBackground} 50%);`;
  }
};
M.styles = tt`
    :host {
      display: block;
      font-family: var(--our-pa-font-family, inherit);
      color: var(--our-pa-shell-fg, inherit);
    }
    .panel {
      display: grid;
      gap: 1.25rem;
      padding: 1rem;
      border: 1px solid var(--our-pa-border, #6e6e6e);
      background: var(--our-pa-surface-bg, transparent);
    }
    .lede,
    .note {
      max-width: 68ch;
      line-height: 1.45;
    }
    .note {
      opacity: 0.9;
      font-size: 0.95rem;
    }
    .presets {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    .preset-card {
      display: grid;
      gap: 0.35rem;
      text-align: left;
      padding: 0.75rem;
      border: 1px solid var(--our-pa-border, #6e6e6e);
      background: var(--our-pa-shell-bg, transparent);
      color: inherit;
      cursor: pointer;
    }
    .preset-card.selected {
      outline: 2px solid var(--our-pa-focus-ring, #0b57d0);
    }
    .swatch {
      height: 28px;
      border: 1px solid var(--our-pa-border, #6e6e6e);
    }
    .hues {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .hue-label {
      font-size: 0.75rem;
      border: 1px solid var(--our-pa-color-border, #6e6e6e);
      padding: 0.1rem 0.35rem;
    }
    .status-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--our-pa-color-border, #6e6e6e);
    }
    .status-chip.danger {
      background: var(--our-pa-color-status-danger-background, #c60239);
      color: var(--our-pa-color-status-danger-text, #fff);
    }
    .status-chip.warning {
      background: var(--our-pa-color-status-warning-background, #ffd621);
      color: var(--our-pa-color-status-warning-text, #000);
    }
    .status-chip.positive {
      background: var(--our-pa-color-status-positive-background, #0d8844);
      color: var(--our-pa-color-status-positive-text, #fff);
    }
    fieldset {
      border: 1px solid var(--our-pa-border, #6e6e6e);
      padding: 0.75rem;
      display: grid;
      gap: 0.5rem;
    }
    label {
      display: grid;
      gap: 0.25rem;
    }
    label.check {
      grid-template-columns: auto 1fr;
      align-items: start;
      gap: 0.5rem;
    }
    .choices {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    input[type='text'],
    textarea,
    select {
      /* Protected editing interiors — leave native presentation */
      font: inherit;
    }
    .color-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 0.5rem;
      align-items: end;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      border-bottom: 1px solid var(--our-pa-border, #6e6e6e);
      text-align: left;
      padding: 0.35rem 0.25rem;
    }
    .preview-box {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px dashed var(--our-pa-border, #6e6e6e);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    button {
      font: inherit;
      padding: 0.45rem 0.8rem;
      cursor: pointer;
    }
    button.primary {
      background: var(--our-pa-accent-bg, #1b6ec2);
      color: var(--our-pa-accent-fg, #fff);
      border: 1px solid var(--our-pa-border, #6e6e6e);
    }
    .status {
      color: var(--our-pa-status-positive-fg, inherit);
      background: var(--our-pa-status-positive-bg, transparent);
      padding: 0.65rem;
    }
    .error {
      color: var(--our-pa-status-danger-fg, #ffffff);
      background: var(--our-pa-status-danger-bg, #b00020);
      padding: 0.65rem;
    }
    .problems {
      color: var(--our-pa-surface-fg, inherit);
    }
    @media (max-width: 720px) {
      .color-row {
        grid-template-columns: 1fr;
      }
    }
  `;
Q([
  L()
], M.prototype, "draft", 2);
Q([
  L()
], M.prototype, "statusMessage", 2);
Q([
  L()
], M.prototype, "errorMessage", 2);
Q([
  L()
], M.prototype, "busy", 2);
M = Q([
  it("our-pa-appearance-profile-app")
], M);
var ir = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, Pe = (r, e, t, o) => {
  for (var s = o > 1 ? void 0 : o ? nr(e, t) : e, a = r.length - 1, i; a >= 0; a--)
    (i = r[a]) && (s = (o ? i(e, t, s) : i(s)) || s);
  return o && s && ir(e, t, s), s;
};
let Z = class extends z {
  constructor() {
    super(...arguments), this.fontSizeId = "normal", this.busy = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.fontSizeId = k.get()?.getSaved().fontSizeId ?? "normal";
  }
  async onSelect(r) {
    if (!(this.busy || this.fontSizeId === r)) {
      this.busy = !0, this.fontSizeId = r;
      try {
        await k.get()?.setFontSize(r);
      } finally {
        this.busy = !1;
      }
    }
  }
  render() {
    return f`
      <uui-box headline="Font size">
        <div class="row" role="radiogroup" aria-label="Font size">
          ${_e.map(
      (r) => f`
              <uui-button
                type="button"
                look=${this.fontSizeId === r.id ? "primary" : "outline"}
                label=${r.displayName}
                compact
                role="radio"
                aria-checked=${this.fontSizeId === r.id}
                ?disabled=${this.busy}
                @click=${() => this.onSelect(r.id)}
              >
                ${r.displayName}
              </uui-button>
            `
    )}
        </div>
      </uui-box>
    `;
  }
};
Z.styles = tt`
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    uui-button {
      flex: 1 1 0;
    }
  `;
Pe([
  L()
], Z.prototype, "fontSizeId", 2);
Pe([
  L()
], Z.prototype, "busy", 2);
Z = Pe([
  it("our-pa-font-size-user-profile-app")
], Z);
const We = "Our.PersonalAppearance.Section";
function cr(r) {
  const e = [
    {
      type: "section",
      alias: We,
      name: "Appearance Studio",
      weight: 75,
      meta: {
        label: "Appearance",
        pathname: "personal-appearance"
      }
    },
    {
      type: "sectionView",
      alias: "Our.PersonalAppearance.SectionView.Studio",
      name: "Appearance Studio",
      elementName: "our-pa-appearance-profile-app",
      weight: 1e3,
      meta: {
        label: "Theme Studio",
        pathname: "studio",
        icon: "icon-palette"
      },
      conditions: [
        {
          alias: "Umb.Condition.SectionAlias",
          match: We
        }
      ]
    },
    {
      type: "userProfileApp",
      alias: "Our.PersonalAppearance.UserProfileApp.FontSize",
      name: "Font size",
      elementName: "our-pa-font-size-user-profile-app",
      weight: 190,
      meta: {
        label: "Font size",
        pathname: "font-size"
      }
    },
    ...Et()
  ];
  if (typeof r.registerMany == "function")
    r.registerMany(e);
  else
    for (const t of e)
      r.register(t);
}
function dr(r, e) {
  r.unregister?.(j), Ye(e) && (e.preset === "custom" && !e.customColors || r.register(Ft(e)));
}
let te = null, S = null;
function lr() {
  return te || (te = new CSSStyleSheet(), te.replaceSync(`
:host {
  font-size: var(--our-pa-type-size) !important;
}
.uui-text,
.uui-h5,
.uui-p {
  font-size: var(--our-pa-type-size) !important;
  line-height: 1.45;
}
.uui-small,
.uui-text small {
  font-size: var(--uui-type-small-size, var(--our-pa-type-size)) !important;
}
`)), te;
}
function ur(r, e) {
  const t = lr(), o = r.adoptedStyleSheets ?? [], s = o.includes(t);
  e && !s ? r.adoptedStyleSheets = [...o, t] : !e && s && (r.adoptedStyleSheets = o.filter((a) => a !== t));
}
function P(r, e) {
  r instanceof ShadowRoot && (ur(r, e), e && S && S.observe(r, { childList: !0, subtree: !0 }));
  const t = r.querySelectorAll("*");
  for (const o of t)
    o.shadowRoot && P(o.shadowRoot, e);
}
function fr() {
  return S || (S = new MutationObserver((r) => {
    for (const e of r)
      for (const t of e.addedNodes)
        t instanceof HTMLElement && (t.shadowRoot && P(t.shadowRoot, !0), P(t, !0));
  }), S);
}
function Se(r) {
  if (!r) {
    S?.disconnect(), S = null, P(document, !1), document.documentElement.style.removeProperty("--our-pa-type-size");
    return;
  }
  document.documentElement.style.setProperty("--our-pa-type-size", r), fr(), S?.observe(document.documentElement, { childList: !0, subtree: !0 }), P(document, !0);
  const e = document.querySelector("umb-app");
  e?.shadowRoot && S?.observe(e.shadowRoot, { childList: !0, subtree: !0 }), requestAnimationFrame(() => P(document, !0)), window.setTimeout(() => P(document, !0), 300);
}
const nt = {
  light: "umb-light-theme",
  dark: "umb-dark-theme",
  dim: "Our.PersonalAppearance.Theme.Dim",
  warmComfort: "Our.PersonalAppearance.Theme.EyeComfort",
  colorVisionFriendly: "Our.PersonalAppearance.Theme.ColorVisionFriendly",
  highContrast: "Our.PersonalAppearance.Theme.HighContrast",
  blackAndWhite: "Our.PersonalAppearance.Theme.BlackAndWhite",
  followSystem: "Our.PersonalAppearance.Theme.FollowSystem"
}, hr = {
  ...Object.fromEntries(
    Object.entries(nt).map(([r, e]) => [
      e,
      { preset: r }
    ])
  ),
  "Our.PersonalAppearance.Theme.Kids.Light": { preset: "kids", mode: "light" },
  "Our.PersonalAppearance.Theme.Kids.Dark": { preset: "kids", mode: "dark" },
  "Our.PersonalAppearance.Theme.Teenagers.Light": { preset: "teenagers", mode: "light" },
  "Our.PersonalAppearance.Theme.Teenagers.Dark": { preset: "teenagers", mode: "dark" },
  "Our.PersonalAppearance.Theme.Adults.Light": { preset: "adults", mode: "light" },
  "Our.PersonalAppearance.Theme.Adults.Dark": { preset: "adults", mode: "dark" }
};
class k {
  constructor() {
    this.api = new ut(), this.mode = "idle", this.saved = $(), this.preview = null, this.identityReady = !1, this.ignoreNextThemeChange = !1;
  }
  static {
    this.instance = null;
  }
  static start(e, t) {
    return this.instance || (this.instance = new k()), this.instance.extensionRegistry = t, this.instance.bootstrap(e), window.__OUR_PA_RUNTIME__ = this.instance, this.instance;
  }
  static stop() {
    this.instance?.teardown(), this.instance = null, delete window.__OUR_PA_RUNTIME__;
  }
  static get() {
    return this.instance;
  }
  getSaved() {
    return structuredClone(this.saved);
  }
  getEffective() {
    return structuredClone(this.preview ?? this.saved);
  }
  async setFontSize(e) {
    const t = structuredClone(this.saved);
    if (t.fontSizeId = ne(e), this.applyFontSize(t.fontSizeId), t.preset === "none") {
      this.saved = t;
      return;
    }
    try {
      this.saved = re(await this.api.putPreference(t)), this.applyFontSize(this.saved.fontSizeId);
    } catch {
      this.saved = t, this.applyFontSize(t.fontSizeId);
    }
  }
  async bootstrap(e) {
    if (!Bt.isSupported()) {
      this.mode = "unsupported", this.clearOverrides();
      return;
    }
    this.identityReady = !1, this.clearOverrides(), this.mode = "loading", this.bindSystemPreference(), this.consumeThemeContext(e);
    try {
      const t = await this.api.getPreference();
      this.identityReady = !0, this.saved = t.hasPreference && t.preference ? re(t.preference) : $(), this.preview = null, this.registerCustomTheme(), this.activateSavedTheme(), this.applyFontSize(this.saved.fontSizeId), this.mode = "ready";
    } catch {
      this.mode = "error", this.clearOverrides();
    }
  }
  setPreview(e) {
    const t = oe(e);
    return t.isValid ? (this.preview = structuredClone(e), this.mode = "preview", this.applyEffective(), { ok: !0 }) : { ok: !1, reason: t.problems[0]?.message ?? "Invalid draft" };
  }
  cancelPreview() {
    this.preview = null, this.mode = "ready", this.applyEffective();
  }
  async save(e) {
    const t = oe(e);
    if (!t.isValid)
      throw Object.assign(new Error("validation_failed"), { validation: t });
    const o = re(await this.api.putPreference(e));
    return this.saved = o, this.preview = null, this.registerCustomTheme(), this.mode = "ready", this.activateSavedTheme(), o;
  }
  async reset() {
    await this.api.deletePreference(), this.saved = $(), this.preview = null, this.mode = "ready", this.extensionRegistry?.unregister?.(j), this.ignoreNextThemeChange = !0, this.themeContext?.setThemeByAlias("umb-light-theme"), this.clearOverrides();
  }
  onLogoutOrSessionChange() {
    this.api.cancel(), this.identityReady = !1, this.saved = $(), this.preview = null, this.clearOverrides(), this.mode = "idle";
  }
  applyEffective() {
    if (!this.identityReady && !this.preview) {
      this.clearOverrides();
      return;
    }
    const e = this.preview ?? this.saved;
    if (!oe(e).isValid)
      return;
    if (this.applyFontSize(e.fontSizeId), e.preset === "none") {
      this.clearColorOverrides();
      return;
    }
    const o = this.mediaQuery?.matches ?? !1, s = _t(e, o);
    this.ensureStyleElement().textContent = s, document.documentElement.setAttribute(b, "on"), document.documentElement.setAttribute(
      "data-our-pa-enhanced-focus",
      e.accessibility.enhancedFocus ? "on" : "off"
    ), document.documentElement.setAttribute(
      "data-our-pa-reduced-motion",
      e.accessibility.reducedMotion ? "on" : "off"
    );
  }
  applyFontSize(e) {
    const t = Ct(e), o = ne(e), s = Ke(o);
    if (!t) {
      document.getElementById(ee)?.remove(), document.documentElement.removeAttribute(ve), Se(null);
      return;
    }
    let a = document.getElementById(ee);
    a || (a = document.createElement("style"), a.id = ee), a.textContent = t, document.head.appendChild(a), document.documentElement.setAttribute(ve, o), Se(`${s.defaultSizePx}px`);
  }
  clearColorOverrides() {
    document.getElementById(ye)?.remove(), document.documentElement.removeAttribute(b), document.documentElement.removeAttribute("data-our-pa-enhanced-focus"), document.documentElement.removeAttribute("data-our-pa-reduced-motion");
  }
  clearOverrides() {
    this.clearColorOverrides(), document.getElementById(ee)?.remove(), document.documentElement.removeAttribute(ve), Se(null);
  }
  ensureStyleElement() {
    let e = document.getElementById(ye);
    return e || (e = document.createElement("style"), e.id = ye, document.head.appendChild(e)), e;
  }
  bindSystemPreference() {
    this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)"), this.mediaListener = () => this.applyEffective(), this.mediaQuery.addEventListener("change", this.mediaListener);
  }
  registerCustomTheme() {
    this.extensionRegistry && dr(this.extensionRegistry, this.saved);
  }
  consumeThemeContext(e) {
    this.themeConsumer?.destroy(), this.themeConsumer = new ct(
      e,
      dt,
      (t) => {
        t && (this.themeContext = t, this.themeSubscription?.unsubscribe(), this.themeSubscription = t.theme.subscribe((o) => {
          if (!this.identityReady || this.ignoreNextThemeChange) {
            this.ignoreNextThemeChange = !1;
            return;
          }
          this.persistNativeThemeSelection(o);
        }), this.identityReady && this.activateSavedTheme());
      }
    );
  }
  activateSavedTheme() {
    if (!this.themeContext || this.saved.preset === "none") return;
    const e = this.aliasForPreference(this.saved);
    e && (this.ignoreNextThemeChange = !0, this.themeContext.setThemeByAlias(e), this.clearColorOverrides(), this.applyFontSize(this.saved.fontSizeId));
  }
  aliasForPreference(e) {
    return Ye(e) ? j : e.preset === "kids" ? `Our.PersonalAppearance.Theme.Kids.${e.appearanceMode === "dark" ? "Dark" : "Light"}` : e.preset === "teenagers" ? `Our.PersonalAppearance.Theme.Teenagers.${e.appearanceMode === "dark" ? "Dark" : "Light"}` : e.preset === "adults" ? `Our.PersonalAppearance.Theme.Adults.${e.appearanceMode === "dark" ? "Dark" : "Light"}` : nt[e.preset] ?? null;
  }
  async persistNativeThemeSelection(e) {
    if (e === j) return;
    const t = hr[e];
    if (!t) return;
    const o = structuredClone(this.saved);
    o.preset = t.preset, o.appearanceMode = t.mode ?? o.appearanceMode ?? "light", o.customColors = void 0, o.fontFamilyId = "umbraco-default", o.fontSizeId = this.saved.fontSizeId ?? ie, o.accessibility = {
      colorVisionFriendly: !1,
      highContrast: !1,
      reducedMotion: !1,
      enhancedFocus: !1
    };
    try {
      this.saved = re(await this.api.putPreference(o));
    } catch {
    }
  }
  teardown() {
    this.api.cancel(), this.themeSubscription?.unsubscribe(), this.themeConsumer?.destroy(), this.mediaQuery && this.mediaListener && this.mediaQuery.removeEventListener("change", this.mediaListener), this.clearOverrides();
  }
}
function re(r) {
  return {
    ...r,
    appearanceMode: r.appearanceMode ?? "light",
    fontSizeId: ne(r.fontSizeId),
    accessibility: {
      colorVisionFriendly: r.accessibility?.colorVisionFriendly ?? !1,
      highContrast: r.accessibility?.highContrast ?? !1,
      reducedMotion: r.accessibility?.reducedMotion ?? !1,
      enhancedFocus: r.accessibility?.enhancedFocus ?? !1
    }
  };
}
const yr = (r, e) => {
  cr(e), k.start(r, e);
}, vr = () => {
  k.stop();
};
export {
  yr as onInit,
  vr as onUnload
};
//# sourceMappingURL=our-personal-appearance.js.map
