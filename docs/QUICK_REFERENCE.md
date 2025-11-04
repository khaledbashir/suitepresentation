# Quick Reference Guide

## 🎯 What Changed (TL;DR)

### UI/UX Improvements
1. **Dark theme applied everywhere** - No more white menus
2. **PDF → Document export** - Now exports as .docx
3. **Import button moved** - Now in sidebar (⬆️) next to New (+)
4. **Cleaner selection menu** - Only "Ask AI" button when text selected
5. **Version tracking added** - Comment and view version history

---

## 📍 Where to Find Things

### Export Documents
**Location**: Top EditorToolbar (below top bar)
- 📄 **Document** - Exports as .docx (Word format)
- 📝 **Markdown** - Exports as .md (plain text)

### Import Documents
**Location**: Sidebar header (next to + button)
- ⬆️ **Import** - Open file picker for .md, .txt, .docx files

### Copy & Comment
**Location**: EditorToolbar (next to export buttons)
- 📋 **Copy** - Copy selected text with feedback
- 💬 **Comment** - Add comment with inline input
- ⏱️ **Versions** - View all saved versions

### Ask AI (Select text first)
**Location**: Floating toolbar when text is selected
- ✨ **Ask AI** - Opens AI action menu with 9+ options

---

## 🔄 Common Tasks

### Export a Document
```
1. Click "📄 Document" in EditorToolbar
2. File downloads as "document-TIMESTAMP.docx"
3. Open in Microsoft Word or compatible app
```

### Import a Document
```
1. Click "⬆️ Import" in Sidebar header
2. Select .md, .txt, or .docx file
3. New document created in RECENT folder
4. Auto-named from filename
```

### Add a Version Comment
```
1. Click "💬 Comment" button in EditorToolbar
2. Type your comment (e.g., "Fixed typos")
3. Press Enter or click "Save"
4. Version saved with timestamp
```

### View Version History
```
1. Click "⏱️ Versions (N)" button in EditorToolbar
2. Dropdown shows all saved versions
3. Each version shows:
   - Date & time created
   - Your comment (if any)
   - Author name
```

### Ask AI Something
```
1. Select text in editor
2. Floating toolbar appears
3. Click "✨ Ask AI"
4. Choose from menu:
   - Summarize
   - Generate headings
   - Generate outline
   - Generate image
   - Brainstorm ideas
   - Generate presentation
   - Make it real
   - Find actions
   - Continue writing
```

### Copy Text
```
1. Select text in editor
2. Click "📋 Copy" in EditorToolbar
3. Feedback: "✓ Copied!" (2 seconds)
4. Text in clipboard, ready to paste
```

---

## 🎨 Color Scheme (Dark Theme)

All UI uses dark theme colors:
- **Backgrounds**: Various shades of dark gray/black
- **Text**: Light gray (#e3e3e3)
- **Borders**: Dark gray (#333)
- **Hover**: Slightly lighter backgrounds (#2a2a2a)
- **Active**: Even lighter (#333 to #555)

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Document | Sidebar: `+` button |
| Import Document | Sidebar: `⬆️` button |
| Slash Commands | `/` in editor |
| Save Comment | `Enter` (in comment input) |
| Cancel Comment | `Esc` (in comment input) |
| Copy | `Ctrl+C` / `Cmd+C` (or use Copy button) |

---

## 🔧 Technical Details

### Files Modified
- `EditorToolbar.tsx` - Export, Copy, Comment, Versions
- `FloatingToolbar.tsx` - Only Ask AI button now
- `Sidebar.tsx` - Import button added
- `index.css` - New styling for comments/versions

### No Dependencies Added
- All changes use existing libraries
- No new npm packages required
- Works with current BlockSuite version

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers supported

---

## 📊 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| **Export** | PDF only | Document + Markdown |
| **Import** | In toolbar | In sidebar |
| **Copy** | Hidden | Always visible |
| **Comment** | Not available | Full system |
| **Versions** | Not available | Full history |
| **AI Menu** | Cluttered | Focused |
| **Theme** | Partial | Complete |

---

## 🚀 What's New

### ✨ Comment System
- Add notes to each version
- Timestamps automatically added
- Author attribution included
- Simple keyboard support

### 📈 Version History
- Track all saved versions
- View creation times
- See your comments
- Prepare for future rollback feature

### 📄 Document Export
- Professional .docx format
- Ready for Microsoft Office
- XML-structured content
- Proper MIME types

### ⬆️ Sidebar Import
- Easy file access
- Auto-naming from filename
- Multiple format support
- Creates new documents

---

## 🎓 Learning Resources

### Detailed Documentation
- `CHANGES_SUMMARY.md` - Full technical breakdown
- `UI_LAYOUT_GUIDE.md` - Visual diagrams and flows
- `IMPLEMENTATION_CHECKLIST.md` - Complete feature list

### Code References
- Look at `EditorToolbar.tsx` for comment/version logic
- Check `FloatingToolbar.tsx` for AI menu structure
- Review `Sidebar.tsx` for import functionality
- See `index.css` for new component styling

---

## ❓ FAQ

**Q: Where did the Format button go?**  
A: Removed from floating toolbar for clarity. Format tools are in the top bar and editor menu.

**Q: Can I still export as PDF?**  
A: Current version exports as .docx. PDF export planned for future.

**Q: Do versions auto-save?**  
A: Only when you click Comment. Versions are not automatic (can be added in future).

**Q: How long are versions kept?**  
A: Currently in session memory. Persistence would be a future enhancement.

**Q: Can I compare versions?**  
A: Not yet. Version comparison is a planned feature.

**Q: Is data backed up?**  
A: Follow your app's backup strategy. Versions help with change tracking.

**Q: Mobile support?**  
A: Yes! Touch-friendly buttons and responsive layout.

**Q: Keyboard shortcuts?**  
A: Enter to save comment, Esc to cancel, standard keys for everything else.

---

## 🐛 Troubleshooting

### Problem: Export file not downloading
**Solution**: Check browser download settings, ensure popups aren't blocked

### Problem: Import not finding file
**Solution**: Use .md, .txt, or .docx files. Other formats not supported.

### Problem: Comment input not appearing
**Solution**: Click "💬 Comment" button again, close any overlays

### Problem: Version history empty
**Solution**: Normal - only appears after you add comments

### Problem: Floating toolbar not appearing
**Solution**: Select text in editor, toolbar should appear above it

### Problem: Dark theme looks odd
**Solution**: Refresh page, clear browser cache

---

## 📞 Support

For issues or questions:
1. Check documentation files (CHANGES_SUMMARY.md)
2. Review code comments in component files
3. Test in latest browser version
4. Clear cache and retry

---

## 🎉 That's It!

The editor is now more organized, themed consistently, and ready to track changes.

**Start using it**: Open the editor and try selecting text - you'll see the new clean "Ask AI" menu!
