{
  "brand": {
    "name": "AEGIS Platform",
    "attributes": ["sleek", "high-end", "trustworthy", "fast", "conversion-focused", "AI-forward"],
    "visual_personality": {
      "mood": "Deep-slate dark mode with crisp typography, subtle glass panels, and restrained neon accents (cyan primary, emerald secondary).",
      "do_not": [
        "Do not use purple as an accent.",
        "Do not use large gradients; keep gradients decorative and under 20% viewport.",
        "Do not center-align the entire app container.",
        "Do not use transition: all."
      ]
    }
  },
  "design_tokens": {
    "css_custom_properties": {
      "notes": "Implement by replacing :root and .dark tokens in /app/frontend/src/index.css. Dark mode is default; set <html class=\"dark\"> in app entry.",
      "colors": {
        "--background": "215 39% 7%",
        "--foreground": "0 0% 98%",
        "--card": "215 33% 11%",
        "--card-foreground": "0 0% 98%",
        "--popover": "215 33% 11%",
        "--popover-foreground": "0 0% 98%",
        "--primary": "186 100% 50%",
        "--primary-foreground": "215 39% 7%",
        "--secondary": "215 28% 14%",
        "--secondary-foreground": "0 0% 98%",
        "--muted": "215 22% 16%",
        "--muted-foreground": "215 10% 62%",
        "--accent": "160 84% 39%",
        "--accent-foreground": "215 39% 7%",
        "--destructive": "0 72% 52%",
        "--destructive-foreground": "0 0% 98%",
        "--border": "215 22% 18%",
        "--input": "215 22% 18%",
        "--ring": "186 100% 50%",
        "--radius": "0.9rem",
        "--aegis-bg": "#0D1117",
        "--aegis-surface": "#161B22",
        "--aegis-text": "#FFFFFF",
        "--aegis-muted": "#8B949E",
        "--aegis-cyan": "#00E5FF",
        "--aegis-emerald": "#10B981",
        "--aegis-border": "rgba(255,255,255,0.08)",
        "--aegis-glass": "rgba(255,255,255,0.06)",
        "--aegis-glass-strong": "rgba(255,255,255,0.09)",
        "--aegis-shadow": "0 18px 60px rgba(0,0,0,0.55)",
        "--aegis-glow-cyan": "0 0 0 1px rgba(0,229,255,0.22), 0 10px 40px rgba(0,229,255,0.10)",
        "--aegis-glow-emerald": "0 0 0 1px rgba(16,185,129,0.22), 0 10px 40px rgba(16,185,129,0.10)"
      },
      "typography": {
        "font_pairing": {
          "heading": "Inter (600–700)",
          "body": "Inter (400–500)",
          "mono": "IBM Plex Mono (optional for IDs, order numbers)"
        },
        "recommended_google_fonts_import": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
        "scale": {
          "h1": "text-4xl sm:text-5xl lg:text-6xl tracking-tight",
          "h2": "text-base md:text-lg text-muted-foreground",
          "h3": "text-lg font-semibold",
          "body": "text-sm md:text-base",
          "caption": "text-xs text-muted-foreground"
        },
        "line_height": {
          "headings": "leading-tight",
          "body": "leading-relaxed"
        }
      },
      "spacing": {
        "system": "Use 4px base. Prefer generous spacing: section py-10 md:py-14; card p-4 md:p-6; gaps 3–6.",
        "container": "max-w-6xl px-4 sm:px-6 lg:px-8"
      },
      "radii": {
        "card": "rounded-2xl",
        "controls": "rounded-xl",
        "chips": "rounded-full",
        "fab": "rounded-2xl"
      },
      "shadows": {
        "glass_panel": "shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
        "focus_ring": "focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-0"
      }
    },
    "tailwind_primitives": {
      "glass_panel_class": "bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
      "glass_panel_strong_class": "bg-white/[0.09] border border-white/[0.10] backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
      "page_bg_class": "bg-[#0D1117] text-white",
      "subtle_grid_overlay": "bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:24px_24px]",
      "noise_overlay": "after:pointer-events-none after:fixed after:inset-0 after:opacity-[0.06] after:bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]"
    }
  },
  "layout": {
    "grid": {
      "dashboard": "Mobile: single column stack. md+: 12-col grid; summary cards span 6; charts span 8; activity span 4.",
      "marketplace": "Mobile: 1-col list; sm: 2-col grid; lg: 3-col grid. Provide grid/list toggle."
    },
    "navigation": {
      "mobile_bottom_nav": {
        "pattern": "Fixed bottom bar with 4 items: Home, Marketplace, AEGIS, Profile. Use icons + labels.",
        "classes": "fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2",
        "container": "mx-auto max-w-md",
        "bar": "rounded-2xl bg-white/[0.06] border border-white/[0.10] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
        "item": "flex flex-col items-center justify-center gap-1 py-2 text-xs",
        "active_state": "text-white",
        "inactive_state": "text-[#8B949E] hover:text-white",
        "indicator": "Active item gets a 2px cyan underline pill or a subtle cyan glow dot."
      },
      "desktop_sidebar": {
        "pattern": "Left sidebar (w-64) with brand lockup, primary nav, secondary links, and a compact user card.",
        "classes": "hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col",
        "panel": "h-full bg-white/[0.04] border-r border-white/[0.08] backdrop-blur-xl",
        "brand": "Top area with AEGIS wordmark + small cyan status dot.",
        "nav_item": "rounded-xl px-3 py-2 text-sm flex items-center gap-2",
        "nav_active": "bg-white/[0.08] text-white shadow-[0_0_0_1px_rgba(0,229,255,0.18)]",
        "nav_hover": "hover:bg-white/[0.06]"
      }
    },
    "floating_action_button": {
      "behavior": "Persistent FAB on Dashboard + Marketplace. Tap opens a Drawer with two primary actions: New Service Request, Ask AEGIS.",
      "placement": "Mobile: bottom-right above bottom nav (respect safe area). Desktop: bottom-right inside content.",
      "classes": "fixed z-50 right-4 bottom-[calc(84px+env(safe-area-inset-bottom))] md:bottom-6 md:right-6",
      "button": "h-14 w-14 rounded-2xl bg-[#00E5FF] text-[#0D1117] shadow-[0_0_0_1px_rgba(0,229,255,0.25),0_18px_50px_rgba(0,229,255,0.18)]",
      "hover_press": "hover:brightness-110 active:scale-[0.98] transition-[filter,box-shadow] duration-200",
      "accessibility": "Always include aria-label and data-testid=\"floating-action-button\""
    }
  },
  "components": {
    "component_path": {
      "shadcn_primary": "/app/frontend/src/components/ui",
      "use_components": [
        {"name": "Button", "path": "src/components/ui/button.jsx"},
        {"name": "Input", "path": "src/components/ui/input.jsx"},
        {"name": "Textarea", "path": "src/components/ui/textarea.jsx"},
        {"name": "Card", "path": "src/components/ui/card.jsx"},
        {"name": "Badge", "path": "src/components/ui/badge.jsx"},
        {"name": "Tabs", "path": "src/components/ui/tabs.jsx"},
        {"name": "Dialog", "path": "src/components/ui/dialog.jsx"},
        {"name": "Drawer", "path": "src/components/ui/drawer.jsx"},
        {"name": "Sheet", "path": "src/components/ui/sheet.jsx"},
        {"name": "Select", "path": "src/components/ui/select.jsx"},
        {"name": "Command", "path": "src/components/ui/command.jsx"},
        {"name": "ScrollArea", "path": "src/components/ui/scroll-area.jsx"},
        {"name": "Separator", "path": "src/components/ui/separator.jsx"},
        {"name": "Avatar", "path": "src/components/ui/avatar.jsx"},
        {"name": "Tooltip", "path": "src/components/ui/tooltip.jsx"},
        {"name": "Progress", "path": "src/components/ui/progress.jsx"},
        {"name": "Calendar", "path": "src/components/ui/calendar.jsx"},
        {"name": "Sonner", "path": "src/components/ui/sonner.jsx"}
      ]
    },
    "buttons": {
      "primary": {
        "style": "Cyan filled, dark text, tall, rounded-xl.",
        "classes": "h-11 px-4 rounded-xl bg-[#00E5FF] text-[#0D1117] font-semibold shadow-[0_0_0_1px_rgba(0,229,255,0.25),0_18px_50px_rgba(0,229,255,0.12)] hover:brightness-110 active:scale-[0.99] transition-[filter,box-shadow] duration-200",
        "data_testid": "primary-action-button"
      },
      "secondary": {
        "style": "Glass button with cyan border glow on hover.",
        "classes": "h-11 px-4 rounded-xl bg-white/[0.06] text-white border border-white/[0.10] hover:border-white/[0.16] hover:bg-white/[0.08] transition-[background-color,border-color] duration-200",
        "data_testid": "secondary-action-button"
      },
      "accent": {
        "style": "Emerald filled for confirm/pay actions.",
        "classes": "h-11 px-4 rounded-xl bg-[#10B981] text-[#0D1117] font-semibold shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_18px_50px_rgba(16,185,129,0.12)] hover:brightness-110 active:scale-[0.99] transition-[filter,box-shadow] duration-200",
        "data_testid": "accent-action-button"
      },
      "ghost": {
        "style": "Text-only with subtle hover surface.",
        "classes": "h-10 px-3 rounded-xl text-[#8B949E] hover:text-white hover:bg-white/[0.06] transition-[color,background-color] duration-200",
        "data_testid": "ghost-action-button"
      }
    },
    "inputs": {
      "base": {
        "classes": "h-11 rounded-xl bg-white/[0.04] border border-white/[0.10] text-white placeholder:text-[#8B949E] focus-visible:ring-2 focus-visible:ring-[#00E5FF]/60 focus-visible:border-white/[0.18] transition-[border-color,box-shadow] duration-200",
        "data_testid": "text-input"
      },
      "search": {
        "pattern": "Search input with left icon + Command palette for advanced search/filter on desktop.",
        "use": ["Input", "Command"],
        "data_testid": "marketplace-search-input"
      }
    },
    "cards_and_panels": {
      "glass_card": {
        "classes": "rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
        "header": "Use CardHeader with title (text-sm font-semibold) + right-aligned badge.",
        "content": "Use CardContent with 16–24px padding and clear dividers (Separator).",
        "data_testid": "glass-card"
      },
      "metric_card": {
        "pattern": "Top row: label + delta badge; middle: big number; bottom: sparkline/progress.",
        "accent_rule": "Only one accent per card: cyan for growth, emerald for healthy/completed.",
        "data_testid": "dashboard-metric-card"
      }
    },
    "badges_and_tags": {
      "tag": {
        "classes": "rounded-full bg-white/[0.06] border border-white/[0.10] text-[#8B949E] hover:text-white hover:border-white/[0.16] transition-[color,border-color] duration-200",
        "selected": "bg-[#00E5FF]/15 text-white border-[#00E5FF]/35",
        "data_testid": "tag-pill"
      }
    },
    "chat": {
      "layout": {
        "header": "Sticky top bar with model/provider selector (Select), conversation title, and overflow menu.",
        "messages": "ScrollArea with message bubbles; assistant bubbles are glass panels; user bubbles are slightly brighter surface.",
        "composer": "Sticky bottom composer with Textarea, attachment button, send button, and prompt pills row above composer when empty."
      },
      "message_bubbles": {
        "assistant": "max-w-[92%] rounded-2xl p-4 bg-white/[0.06] border border-white/[0.08]",
        "user": "max-w-[92%] rounded-2xl p-4 bg-white/[0.10] border border-white/[0.10]",
        "meta": "timestamp text-xs text-[#8B949E]"
      },
      "prompt_pills": {
        "behavior": "Show only when chat is empty or after reset. Clicking inserts text into composer.",
        "classes": "flex flex-wrap gap-2",
        "pill": "rounded-full px-3 py-1.5 text-xs bg-white/[0.06] border border-white/[0.10] hover:bg-white/[0.08] transition-[background-color,border-color] duration-200",
        "data_testid": "chat-prompt-pill"
      },
      "file_upload": {
        "pattern": "Attachment button opens file picker; show inline previews as small chips above composer.",
        "chip": "rounded-xl px-2 py-1 bg-white/[0.06] border border-white/[0.10] text-xs",
        "data_testid": "chat-file-upload-button"
      },
      "streaming": {
        "pattern": "Render assistant message progressively; show a subtle typing indicator (3 dots) in a small glass bubble.",
        "typing_indicator": "w-2 h-2 rounded-full bg-[#8B949E] animate-pulse (staggered via CSS)"
      },
      "provider_selector": {
        "options": ["OpenAI", "Claude"],
        "component": "Select",
        "data_testid": "chat-provider-selector"
      },
      "references": {
        "inspiration_sources": [
          "Delta Components Chat docs (streaming + file upload + model selector): https://deltacomponents.dev/docs/components/chat",
          "Vercel AI Elements PromptInput patterns: https://github.com/vercel/ai-elements/blob/ad919f4b/apps/docs/content/components/(chatbot)/prompt-input.mdx"
        ]
      }
    },
    "marketplace": {
      "toolbar": {
        "pattern": "Sticky toolbar with search, filter button (Sheet), grid/list toggle (ToggleGroup), and active filter chips.",
        "data_testid": "marketplace-toolbar"
      },
      "filters": {
        "pattern": "Use Sheet on mobile, side panel on desktop. Include category, price range (Slider), rating, delivery time.",
        "components": ["Sheet", "Checkbox", "Slider", "Select"],
        "data_testid": "marketplace-filters"
      },
      "service_card": {
        "pattern": "Media thumbnail (AspectRatio), title, provider avatar, rating, starting price, tags, CTA.",
        "cta": "Primary: View details (glass). Secondary: Quick checkout (emerald) only on detail page.",
        "hover": "On desktop: lift by 2px + border brightening (no transform transition-all).",
        "data_testid": "service-card"
      },
      "service_detail": {
        "sections": ["Overview", "Pricing", "Reviews", "Media"],
        "pricing": "Tabs for pricing tiers; each tier is a selectable Card with emerald highlight when selected.",
        "checkout": "Use Dialog for Stripe Checkout modal (test mode).",
        "data_testid": "service-detail"
      }
    },
    "messaging": {
      "conversation_list": {
        "pattern": "Left list (desktop) / full screen (mobile) with search and unread badges.",
        "data_testid": "messages-conversation-list"
      },
      "thread": {
        "pattern": "Chat-like thread with date separators, delivery status ticks, and attachment previews.",
        "composer": "Same composer as AEGIS chat but without provider selector.",
        "data_testid": "messages-thread"
      }
    },
    "onboarding": {
      "auth": {
        "pattern": "Single-column, left-aligned. Glass card centered vertically only on desktop; on mobile it should start near top with generous padding.",
        "google_oauth": "Secondary glass button with Google icon.",
        "data_testid": "auth-form"
      },
      "survey": {
        "pattern": "3-step wizard with Progress, RadioGroup (role), ToggleGroup/Checkbox (categories), Switch (notifications).",
        "navigation": "Sticky bottom action row: Back (ghost) + Continue (primary).",
        "data_testid": "onboarding-survey"
      }
    },
    "orders_tracking": {
      "pattern": "Order timeline with status chips and Progress. Live tracking card pinned near top.",
      "data_testid": "order-tracking"
    }
  },
  "motion": {
    "principles": [
      "Use motion to clarify state changes: open/close, selection, progress, streaming.",
      "Prefer opacity + blur + slight translateY for entrances; keep durations 160–240ms.",
      "Avoid heavy parallax; keep subtle background drift only in hero/auth screens."
    ],
    "micro_interactions": {
      "buttons": "hover: brightness + glow; active: scale 0.99; focus-visible ring cyan.",
      "cards": "hover: border brightens + shadow increases; optional translate-y-0.5 on desktop only.",
      "tabs_toggles": "Animated underline or pill background using Tailwind transitions on background-color/border-color.",
      "fab": "On open: rotate plus icon 45deg; Drawer slides up."
    },
    "library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion",
      "usage": "Use for page transitions (fade/slide), Drawer content stagger, and chat message entrance animations. Keep it minimal for performance."
    }
  },
  "data_visualization": {
    "library": {
      "recommended": "recharts",
      "install": "npm i recharts",
      "usage": "Dashboard sparklines and order tracking charts. Use muted gridlines (white/8%) and cyan line for primary metric."
    },
    "empty_states": {
      "pattern": "Use Skeleton for loading; for empty, show glass card with icon + one-line guidance + primary CTA.",
      "data_testid": "empty-state"
    }
  },
  "pwa": {
    "notes": [
      "Respect safe-area insets for bottom nav and FAB.",
      "Use touch-friendly targets: min 44px height.",
      "Avoid heavy backdrop-blur on low-end devices; provide fallback class without blur if performance issues arise."
    ]
  },
  "image_urls": {
    "notes": "Image provider tool unavailable in this environment. Use CSS-generated abstract backgrounds + optional self-hosted SVGs.",
    "categories": [
      {
        "category": "auth_background",
        "description": "CSS-only subtle radial highlights (cyan + emerald) behind the auth glass card; keep under 20% viewport.",
        "urls": []
      },
      {
        "category": "marketplace_thumbnails",
        "description": "Use neutral, high-contrast service thumbnails; prefer dark/tech abstract or product shots. If needed, use your own CDN or upload assets.",
        "urls": []
      },
      {
        "category": "avatars",
        "description": "Use generated initials avatars (shadcn Avatar fallback) to avoid external dependencies.",
        "urls": []
      }
    ]
  },
  "instructions_to_main_agent": {
    "global": [
      "Replace default shadcn tokens in /app/frontend/src/index.css with the provided dark-first tokens; ensure the app root uses dark mode by default.",
      "Remove any centered layout defaults from App.css (do not use .App { text-align: center }). Current App.css has centered header styles—avoid using App-header for real pages.",
      "All interactive and key informational elements MUST include data-testid attributes (kebab-case).",
      "Use shadcn components from /src/components/ui (JS files) for all primitives (Dialog/Sheet/Select/Calendar/etc.).",
      "Keep glassmorphism subtle: bg-white/4–9%, border-white/8–12%, backdrop-blur-xl."
    ],
    "page_blueprints": {
      "dashboard": [
        "Top: greeting + quick actions.",
        "Bento grid: 3–4 metric cards, active requests list, live order tracking card.",
        "FAB opens Drawer with New Request + Ask AEGIS."
      ],
      "aegis_chat": [
        "Sticky header with provider selector (OpenAI/Claude) and conversation actions.",
        "Prompt pills visible before first message.",
        "Composer supports file upload + streaming responses."
      ],
      "marketplace": [
        "Sticky toolbar with search + filters + grid/list toggle.",
        "Service cards with tags, rating, starting price.",
        "Detail page with Tabs: Overview/Pricing/Reviews/Media and Stripe checkout Dialog."
      ],
      "messages": [
        "Conversation list + thread (desktop split).",
        "Mobile: list -> thread navigation.",
        "Unread badges and delivery status."
      ],
      "onboarding": [
        "3-step wizard with Progress and sticky bottom actions.",
        "Role selection first, categories second, notifications third."
      ]
    }
  }
}

---

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
