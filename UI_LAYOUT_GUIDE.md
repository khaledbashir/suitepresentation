# UI Layout Guide - Updated Editor Interface

## New Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SUITE - Document Editor                                        │
├─────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────┐  ┌──────────────────────────────────────────┐
│  │   SIDEBAR    │  │         MAIN CONTENT AREA               │
│  │              │  │                                          │
│  │ ┌──────────┐ │  │ ┌─ TOP BAR ─────────────────────────────┐
│  │ │+ (New)   │ │  │ │ [Sidebar Toggle] [AI] [Sandbox] [Pres]│
│  │ │⬆️(Import)│ │  │ └───────────────────────────────────────┘
│  │ └──────────┘ │  │
│  │              │  │ ┌─ EDITOR TOOLBAR ──────────────────────┐
│  │ RECENT       │  │ │ [📄 Document] [📝 Markdown]           │
│  │ ▶ Folder     │  │ │ [📋 Copy] [💬 Comment] [⏱️ Versions] │
│  │   📄 Doc 1   │  │ └───────────────────────────────────────┘
│  │   📄 Doc 2   │  │
│  │              │  │ ┌─ EDITOR CONTAINER ────────────────────┐
│  │ ARCHIVED     │  │ │                                        │
│  │ ▼ Folder     │  │ │  [Slash menu on /]    (dark themed)   │
│  │              │  │ │                                        │
│  │              │  │ │  Document content...                   │
│  │              │  │ │  Type to edit...                       │
│  │              │  │ │                                        │
│  │              │  │ │  [Selection shows floating toolbar] ✨ │
│  │              │  │ │                                        │
│  │              │  │ └───────────────────────────────────────┘
│  └──────────────┘  └──────────────────────────────────────────┘

```

---

## Toolbar Behavior

### BEFORE (Confusing Multiple Toolbars)
```
When text is selected:

┌─ FloatingToolbar (Floating Selection Menu) ────────────────┐
│ [✨ Ask AI] [💬 Comment] [📋 Copy] [🎨 Format]            │
└────────────────────────────────────────────────────────────┘
                              AND
┌─ EditorToolbar (Main) ─────────────────────────────────────┐
│ [Markdown] [PDF] [Import]                                  │
└────────────────────────────────────────────────────────────┘
```
**Issue**: User confused - which toolbar should they use? Where to comment?

---

### AFTER (Clear Separation of Concerns)
```
When text is selected:

┌─ FloatingToolbar (Focused AI Menu) ────────────────────────┐
│ [✨ Ask AI]                                                │
│   ├─ GENERATE FROM TEXT                                   │
│   │  ├─ 📝 Summarize                                      │
│   │  ├─ 📋 Generate headings                              │
│   │  ├─ 📄 Generate outline                               │
│   │  ├─ 🖼️  Generate an image                             │
│   │  ├─ 💡 Brainstorm ideas                               │
│   │  ├─ 📊 Generate presentation                          │
│   │  ├─ 🪄 Make it real                                   │
│   │  └─ 🔍 Find actions                                   │
│   └─ DRAFT FROM TEXT                                      │
│      └─ ✍️  Continue writing                               │
└────────────────────────────────────────────────────────────┘

(Always available at top)
┌─ EditorToolbar (Main Document Tools) ──────────────────────┐
│ [📄 Document] [📝 Markdown] [📋 Copy] [💬 Comment] [⏱️ Ver]│
│                                        ↓ (Click Comment)   │
│                                   ┌──────────────────────┐ │
│                                   │ [Input field...] [S] │ │
│                                   └──────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```
**Improvement**: Clear purpose - AI tools when selecting, document tools always available

---

## Feature: Comment & Version History

### Comment Input (Inline)
```
When "💬 Comment" button is clicked:

┌─ EditorToolbar ────────────────────────────────────────────┐
│ [📄 Document] [📝 Markdown] [📋 Copy] [💬 Comment] [⏱️ Ver]│
│
│ ┌─ Comment Input ────────────────────────────────────────┐ │
│ │ [Add a version comment...     ] [Save] [Cancel]        │ │
│ └────────────────────────────────────────────────────────┘ │
│
│ • Type comment (e.g., "Added introduction section")       │
│ • Press Enter or click Save                               │
│ • Version automatically saved with timestamp              │
└────────────────────────────────────────────────────────────┘
```

### Version History (Dropdown)
```
When "⏱️ Versions" button is clicked:

┌─ EditorToolbar ────────────────────────────────────────────┐
│ [📄 Document] [📝 Markdown] [📋 Copy] [💬 Comment] [⏱️ Ver]│
│
│ ┌─ Version History ──────────────────────────────────────┐ │
│ │ VERSION HISTORY                                        │ │
│ │ ──────────────────────────────────────────────────────│ │
│ │ • 10/21/2025 14:30:45                                 │ │
│ │   💭 Added introduction section                        │ │
│ │   by Current User                                      │ │
│ │                                                        │ │
│ │ • 10/21/2025 14:25:12                                 │ │
│ │   💭 Fixed typo in abstract                           │ │
│ │   by Current User                                      │ │
│ │                                                        │ │
│ │ • 10/21/2025 14:20:00                                 │ │
│ │   (no comment)                                         │ │
│ │   by Current User                                      │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Sidebar: Document Management

### BEFORE
```
┌─ Sidebar ─────────────┐
│ [NEW +]               │
│                       │
│ RECENT                │
│ ▶ Folder              │
│   📄 Untitled         │
│                       │
│ ARCHIVED              │
│ ▼ Folder              │
└───────────────────────┘
```
No way to import documents into editor

### AFTER
```
┌─ Sidebar ─────────────┐
│ [NEW +] [IMPORT ⬆️]   │  ← Two buttons for document management
│                       │
│ RECENT                │
│ ▶ Folder              │
│   📄 Untitled         │
│   📄 Imported Doc     │  ← New imported document
│                       │
│ ARCHIVED              │
│ ▼ Folder              │
└───────────────────────┘
```
**Import action**: Opens file picker → creates new document → auto-titles from filename

---

## Export Options

### Location: EditorToolbar

#### Document (📄) Export
- **Format**: `.docx` (Microsoft Word compatible)
- **MIME Type**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Content**: XML-structured document
- **Use Case**: Sharing with Microsoft Office users, professional documents

#### Markdown (📝) Export
- **Format**: `.md` (Plain markdown)
- **MIME Type**: `text/markdown`
- **Content**: Plain text with markdown syntax
- **Use Case**: Version control, GitHub, documentation

#### File Naming
Both exports use timestamp: `document-1729531845000.ext`
- Prevents filename collisions
- Preserves document version identity

---

## Theme Consistency

### Dark Theme Applied to All Components

```
Color Palette:
├─ Primary Background:  #191919
├─ Secondary Bg:        #1a1a1a
├─ Tertiary Bg:         #1e1e1e
├─ Hover State:         #2a2a2a
├─ Active State:        #333
├─ Border Color:        #333
├─ Text Primary:        #e3e3e3
├─ Text Secondary:      #999
└─ Text Tertiary:       #666
```

### Applied To:
✅ Slash commands menu (BlockSuite)  
✅ Format toolbar (BlockSuite)  
✅ Link popup (BlockSuite)  
✅ Code blocks (BlockSuite)  
✅ Floating toolbar  
✅ AI actions menu  
✅ Comment input  
✅ Version history  
✅ All buttons and inputs  

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Show slash menu | `/` (in editor) |
| Save comment | Enter (in comment input) |
| Cancel comment | Esc (in comment input) |
| Toggle AI panel | Set via TopBar button |
| Copy selected | Ctrl+C / Cmd+C |
| New document | Sidebar: `+` button |
| Import document | Sidebar: `⬆️` button |

---

## Responsive Behavior

### Floating Toolbar (Selection Menu)
- Appears 50px above selected text
- Horizontally centered on selection
- Z-index: 1000
- Disappears when selection lost
- Never overlaps with window edges

### Comment/Version UI
- Appears below EditorToolbar
- Min-width: 300px / 350px
- Max-height: 400px with scrollable list
- Positioned relative to toolbar
- Drops down from buttons

### Mobile Consideration
- FloatingToolbar repositions if off-screen
- Dropdown menus stay within viewport
- Touch-friendly button sizing (32px minimum)

---

## Summary of Changes

| Component | Before | After | Impact |
|-----------|--------|-------|--------|
| **FloatingToolbar** | 4 buttons | 1 button (AI) | Cleaner selection UX |
| **EditorToolbar** | Export + Import | Export + Doc Tools | Logical grouping |
| **Sidebar** | N/A | Import button | Document management |
| **Export** | PDF | Document (.docx) | Professional format |
| **Versioning** | None | Full system | Track changes |
| **Theme** | Partial | Complete | Consistent UI |

---

## Next Steps

1. **Test in production** - Verify all exports work correctly
2. **Gather user feedback** - Usability improvements
3. **Version snapshot storage** - Currently placeholder
4. **Version comparison** - Show diff between versions
5. **Version rollback** - Restore previous version
6. **Collaborative avatars** - Show who edited each version
7. **Version tagging** - Label important milestones
