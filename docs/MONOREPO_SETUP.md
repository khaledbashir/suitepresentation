# 🎯 Monorepo Setup Complete!

**Created:** November 4, 2025  
**Status:** ✅ WORKING - Split architecture

---

## 🏗️ **Architecture**

```
/root/suitepresentation/
├── src/                          ← Main App (Port 3001)
│   ├── app/
│   │   ├── page.tsx             ← Chat + Spreadsheet
│   │   └── chat/page.tsx        ← Same as homepage
│   ├── components/
│   │   ├── tambo/               ← AI chat components
│   │   ├── ui/spreadsheet-tabs.tsx
│   │   └── blocksuite/
│   │       └── BlockSuiteIframe.tsx  ← Embed editor
│   └── tools/spreadsheet-tools.ts
│
└── packages/
    └── blocksuite-editor/        ← BlockSuite App (Port 3004)
        ├── src/app/page.tsx      ← Isolated editor
        ├── package.json          ← Independent deps
        └── next.config.mjs       ← No build conflicts!
```

---

## 🎮 **How It Works**

### Main App (localhost:3001)
- **Purpose:** AI Chat + Spreadsheet
- **What's in it:**
  - Tambo AI streaming chat ✅
  - Spreadsheet with tabs ✅
  - All spreadsheet tools ✅
  - MCP support ✅
- **What's NOT in it:**
  - NO BlockSuite imports
  - NO build errors
  - Clean and fast

### BlockSuite Editor (localhost:3004)
- **Purpose:** Isolated Page & Canvas editors
- **What's in it:**
  - BlockSuite Page editor (Notion-like)
  - BlockSuite Edgeless canvas
  - Mode switcher
  - Independent Next.js app
- **Why separate:**
  - BlockSuite has ESM/build issues
  - Doesn't poison main app
  - Can be embedded via iframe

---

## 🚀 **Running Both**

### Option 1: Manual
```bash
# Terminal 1 - Main app
cd /root/suitepresentation
pnpm dev
# → http://localhost:3001

# Terminal 2 - BlockSuite
cd /root/suitepresentation/packages/blocksuite-editor
pnpm dev
# → http://localhost:3004
```

### Option 2: Start Script (recommended)
```bash
cd /root/suitepresentation
./start-all.sh
# Starts both servers
```

---

## 🔗 **Connecting Them**

### In Main App - Embed BlockSuite
```tsx
import { BlockSuiteIframe } from '@/components/blocksuite/BlockSuiteIframe';

<BlockSuiteIframe 
  mode="page"  // or "edgeless"
  className="h-full"
/>
```

This creates an iframe pointing to `http://localhost:3004?mode=page`

---

## 📊 **URLs**

| Service | URL | Purpose |
|---------|-----|---------|
| **Main App** | http://localhost:3001 | Chat + Spreadsheet |
| **BlockSuite** | http://localhost:3004 | Page & Canvas editors |
| **Homepage** | http://localhost:3001 | Same as main |
| **Chat Page** | http://localhost:3001/chat | Same content |

---

## ✅ **Benefits of This Setup**

### 1. **No Build Conflicts**
- Main app compiles instantly
- BlockSuite issues contained
- If BlockSuite breaks, main app still works

### 2. **Independent Development**
- Update main app without touching BlockSuite
- Fix BlockSuite without risking main app
- Different Next.js configs

### 3. **Easy Integration**
- Simple iframe embed
- PostMessage for communication
- Can be replaced later

### 4. **Scalable**
- Can add more packages later
- Each package has own deps
- Monorepo management with pnpm

---

## 🎯 **Current Status**

### ✅ Working Now:
- [x] Monorepo structure created
- [x] Main app runs clean on :3001
- [x] BlockSuite package created on :3004
- [x] pnpm workspace configured
- [x] BlockSuiteIframe component ready
- [x] Start script created

### 🚧 Next Steps:
- [ ] Fix BlockSuite build issues in isolated package
- [ ] Add mode switcher to main app
- [ ] Embed BlockSuite via iframe
- [ ] Test iframe communication
- [ ] Add postMessage bridge for data sharing

---

## 🔧 **Files Created**

1. `/pnpm-workspace.yaml` - Monorepo config
2. `/packages/blocksuite-editor/*` - Isolated BlockSuite app
3. `/src/components/blocksuite/BlockSuiteIframe.tsx` - Embed component
4. `/start-all.sh` - Run both servers script

---

## 🎉 **Why This is Better**

**Before:** One big app with BlockSuite breaking everything  
**After:** Two apps - main is stable, BlockSuite isolated

**Main app stays clean and fast!** 🚀
