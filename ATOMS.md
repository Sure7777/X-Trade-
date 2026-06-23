---
last_updated: 2026-06-22T19:25:38Z
status: active
---

# Project Context

## Project Overview
X-Trader - تطبيق تليجرام مصغر للتداول المالي الذكي مع MEXC. يجمع بين التداول اليدوي، الآلي، التحليل الذكي، رادار الحيتان، ونظام محافظ متكامل.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|
| 2026-06-22 | استخدام Atoms Cloud كـ Backend | Alex | يوفر Auth, Database, Edge Functions |
| 2026-06-22 | React + Tailwind + Framer Motion للواجهة | Alex | أداء عالي وحركات سلسة |
| 2026-06-22 | Lightweight Charts للشموع اليابانية | Alex | مكتبة TradingView خفيفة وسريعة |

## Constraints
- التصميم: Dark Mode / Glassmorphism
- الألوان: كحلي داكن (#0a0e27) كخلفية، أخضر نيون (#00ff88) للربح، أحمر ياقوتي (#ff3366) للخسارة، ذهبي (#ffd700) لصناديق السيولة
- الخطوط: Cairo للعربية (RTL)
- واجهة عربية بالكامل مع اتجاه RTL
- 6 تبويبات سفلية: الرئيسية، المستشار الذكي، التداول، المحفظة، صندوق الحيتان، السجل
- شعار: "X-Trader" مع تذييل "Created by: Muhammad Ahmad Hizam | 2026 Edition"


