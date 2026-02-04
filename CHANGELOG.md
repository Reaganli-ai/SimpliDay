# SimpliDay Changelog

## v2.0 — 2026-02-04 (Current)
**Profile, Home Restructure, Calorie Balance**
- Settings: User profile (gender, age, height, weight, goal, lifestyle)
- Home: 修身/养性 left-right dashboard with TDEE-based calorie balance
- AI: Personalized advice based on user profile

---

## v1.2 — 2026-02-04
**Entry Display Redesign + Edit Fix**
- Fitness display: "椭圆机 · 30分钟 / 消耗 250 kcal"
- Diet display: "鸡蛋, 冰拿铁 / 摄入 420 kcal" + macros in small text
- Edit now re-parses structured data (calories, duration update correctly)
- AI prompt requires calorie estimates for all fitness/diet entries

## v1.1 — 2026-02-04
**Confirm-before-save, Multi-entry, Mobile Fixes**
- AI splits multi-activity messages into separate entries (fitness + diet)
- Confirm button: entries saved only after user clicks "确认记录"
- Conversation history passed to AI for context & corrections
- Late-night detection (0-3am): AI asks "today or yesterday?"
- Upgraded to claude-3.5-haiku for better JSON reliability
- Records page: "Today" tab, compact stats, categorized/timeline toggle
- Fixed white text on mobile (removed dark mode CSS)
- Improved voice recording (continuous mode, interim results)

## v1.0 — 2026-02-03
**Initial Release**
- Chat-based input with AI classification (fitness/diet/mood/energy)
- Supabase auth + PostgreSQL storage
- Dashboard home with today's overview
- Records page with week/month/all filters + 修身/养性 stats
- Settings with language toggle (中文/English)
- Bottom navigation (Home/Records/Settings)
- Deployed to Vercel
