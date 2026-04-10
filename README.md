# 📊 Plug & Play

A modular, high-performance data visualization system built with **React**, **D3.js**, and **Jotai**.

## 🚀 What is this?

**Plug & Play Dashboard** is a responsive charting engine designed for real-world applications that need to handle large datasets without compromising on speed or user experience. It lets you plug in different chart types, zoom in on insights, and build interactive dashboards that scale — visually and technically.

## 🎯 Why was it needed?

Building charts isn't hard.  
Building **fast, flexible, and scalable** charts that behave well with **dynamic layouts**, **large data**, and **reactive UI state** is hard.

This system solves that by:
- Decoupling chart logic from layout state
- Enabling flexible resizing and rendering without unnecessary reflows
- Supporting performance modes for high control over rendering cycles
- Allowing charts to remain stateful across layout shifts

## ✨ What makes it great?

- ✅ **Powered by D3.js** — robust rendering and scale control
- ✅ **Responsive** — adapts to container width using `ResizeObserver`
- ✅ **Data-scale ready** — handles 50k+ data points smoothly
- ✅ **Composable** — add new charts or custom views easily
- ✅ **State-aware** — fine-grained control with Jotai (lightweight, no Redux bloat)
- ✅ **Designed for UX** — supports loading overlays, layout pauses, and transition-aware behavior
- ✅ **Easy to extend** — built with clear structure and separation of concerns

## 🧱 Built With

- **React 19**
- **TypeScript**
- **D3.js**
- **Jotai** for atomic state management
- **TailwindCSS** + shadcn/ui components

## 📈 Use Cases

- Real-time monitoring dashboards
- Data exploration and analysis tools
- Embeddable chart modules in enterprise apps
- Visual storytelling with interactive narratives

## 💡 Vision

This is more than a charting tool — it's a frontend **rendering system**. The goal is to create a performance-first foundation that can adapt to Canvas or WebGL rendering, stream data, and scale across charts — while staying declarative and React-friendly.

---

Feel free to fork and build on it.  
Build charts that feel alive ⚡
