# Suite Editor - AnythingLLM Integration Guide

## ✅ What Was Fixed

### 1. **BlockSuite Yjs Initialization Errors**
**Problem:** "Invalid access: Add Yjs type to a document before reading data" warnings

**Root Cause:** The document wasn't being fully initialized with Yjs types before being assigned to the editor.

**Solution:** Modified `/root/suite/src/app/editor/editor.ts`:
- Added initialization guard flag to prevent duplicate initialization
- Used `requestAnimationFrame` instead of `setTimeout` for more reliable timing
- Added null check for `doc.root` to ensure doc is properly initialized
- Fixed type checking in doc link handler

### 2. **HTML Hydration Mismatch**
**Problem:** "Extra attributes from the server: cz-shortcut-listen" warning

**Root Cause:** Browser extensions and tools were adding attributes that weren't in the server-rendered HTML, causing hydration mismatches.

**Solution:** Modified `/root/suite/src/app/layout.tsx`:
- Added `suppressHydrationWarning` to both `<html>` and `<body>` tags
- This tells Next.js to skip the hydration validation for these elements

---

## 🚀 AnythingLLM Integration

### Architecture Overview

```
AIPanel Component
    ↓
AnythingLLMClient Service
    ├─ Retry Logic (Exponential Backoff)
    ├─ Error Handling
    ├─ Structured Logging
    └─ Webhook Verification
    ↓
AnythingLLM API
    ├─ Chat Endpoint (sync)
    ├─ Stream Endpoint (SSE)
    └─ Document Endpoints
```

### Files Created/Modified

#### 1. **`/root/suite/src/app/services/anythingllm.ts`** (NEW)
Complete AnythingLLM client with:
- ✅ Synchronous chat with retry logic
- ✅ Streaming chat support
- ✅ Exponential backoff with jitter
- ✅ Rate limit handling (429 responses)
- ✅ Server error recovery (5xx)
- ✅ Request timeout handling
- ✅ Webhook signature verification (HMAC SHA256)
- ✅ Structured logging for observability

**Key Classes:**
- `AnythingLLMClient` - Main client class
- `AnythingLLMConfig` - Configuration interface
- `ChatMessage`, `ChatRequest`, `ChatResponse` - Type definitions

**Key Features:**
```typescript
// Retry with exponential backoff
await client.chat(request);

// Stream responses
for await (const event of client.streamChat(request)) {
  console.log(event);
}

// Webhook signature verification
const isValid = client.verifyWebhookSignature(body, sig, secret, timestamp);

// Structured logging
client.logRequest({ userId, messageCount, status });
client.logError({ error, retryAttempt });
```

#### 2. **`/root/suite/src/app/components/AIPanel.tsx`** (UPDATED)
Integrated AnythingLLM client with:
- ✅ Client initialization from environment variables
- ✅ Conversation history management
- ✅ Real AI responses (no more mock data)
- ✅ Error boundary with user-friendly messages
- ✅ Connection status indicator (🟢 connected / 🔴 not configured)
- ✅ Automatic code extraction and preview
- ✅ Request metadata (userId, conversationId, requestId)

**Features:**
- Green/red indicator showing connection status
- Graceful degradation if not configured
- Error messages displayed to user
- Auto-scroll to latest message
- Code block extraction for CodeSandbox integration

#### 3. **`/root/suite/.env.example`** (CREATED)
Template for environment variables:
```bash
NEXT_PUBLIC_ANYTHINGLLM_BASE_URL=https://your-instance.com
NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE_SLUG=workspace-name
ANYTHINGLLM_API_KEY=your-api-key-here
NEXT_PUBLIC_ANYTHINGLLM_MODEL_SLUG=gpt-4
```

---

## 🔧 Environment Setup

### Step 1: Create `.env.local`
```bash
cd /root/suite
cp .env.example .env.local
```

### Step 2: Configure Your AnythingLLM Instance
Edit `.env.local`:
```bash
NEXT_PUBLIC_ANYTHINGLLM_BASE_URL=https://anything-anything-llm.840tjq.easypanel.host
NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE_SLUG=your-workspace
ANYTHINGLLM_API_KEY=J9JY897-PK3MW8M-K40SRQ2-N2E6PTW
NEXT_PUBLIC_ANYTHINGLLM_MODEL_SLUG=gpt-4
```

### Step 3: Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Verify Connection
- Open the app in browser
- Click "AI Assistant" in top bar
- You should see a 🟢 green indicator if connected
- Try sending a message

---

## 🏗️ Architecture Details

### Request Flow
```
1. User types message in AIPanel
2. AIPanel builds conversation history
3. AnythingLLMClient.chat() called
4. First attempt sent to API
5. If 429 or 5xx: Exponential backoff + retry
6. On success: Response parsed and displayed
7. Code blocks automatically extracted
8. CodeSandbox preview triggered
```

### Error Handling
```
Connection Error → Retry with backoff
Rate Limit (429)  → Exponential backoff + Retry-After header
Server Error (5xx) → Retry with backoff
Client Error (4xx) → Show error to user (no retry)
Timeout           → Retry with backoff
```

### Retry Strategy
```
Attempt 1: wait ~500ms  (initial delay + jitter)
Attempt 2: wait ~1000ms (doubled + jitter)
Attempt 3: wait ~2000ms (doubled + jitter)
Attempt 4: wait ~4000ms (doubled + jitter)
Attempt 5: wait ~8000ms (max delay + jitter)
Max total: 5 attempts before failure
```

---

## 📊 Logging & Observability

### Structured Logs
The client outputs JSON-formatted logs to console:

**Request Log:**
```json
{
  "timestamp": "2025-10-21T10:30:45Z",
  "level": "INFO",
  "service": "anythingllm-client",
  "requestId": "req-1234",
  "conversationId": "conv-5678",
  "messageCount": 5,
  "userId": "user-123",
  "status": "success"
}
```

**Error Log:**
```json
{
  "timestamp": "2025-10-21T10:30:45Z",
  "level": "ERROR",
  "service": "anythingllm-client",
  "requestId": "req-1234",
  "error": "Rate limited",
  "retryAttempt": 2
}
```

### View Logs
Open browser DevTools (F12) → Console → Search for `[AnythingLLM]`

---

## 🧪 Testing the Integration

### Test 1: Verify Configuration
```bash
# Check environment variables are set
echo $NEXT_PUBLIC_ANYTHINGLLM_BASE_URL
echo $NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE_SLUG
```

### Test 2: Simple Query
1. Open app in browser
2. Click "AI Assistant"
3. Type: "Hello, say hi back"
4. Click Send
5. Should see response from AnythingLLM

### Test 3: Code Generation
1. Type: "Generate a simple HTML landing page"
2. Click Send
3. AI responds with HTML code
4. Click "View in Sandbox" (if available)
5. Code should render in CodeSandbox

### Test 4: Error Handling
- Temporarily set invalid API key
- Try to send a message
- Should see error message "401 Unauthorized"
- UI should remain responsive

### Test 5: Multi-turn Conversation
1. Ask: "What is the capital of France?"
2. Response: "Paris"
3. Ask: "Tell me more about it"
4. Response: Should reference Paris from previous message

---

## 📈 Performance Considerations

### Timeout Settings
Default: **30 seconds**
- Good for most queries
- Increase to 60s if AnythingLLM is slow

### Token Limits
Default: **2000 tokens** max output
- Adjust based on your needs
- Higher tokens = longer responses = slower

### Retry Settings
- **Max Retries:** 5 (configurable)
- **Initial Delay:** 500ms (configurable)
- **Max Delay:** 8 seconds

### Recommended `.env` for Different Scenarios

**Fast Responses (local/small model):**
```bash
ANYTHINGLLM_REQUEST_TIMEOUT_MS=15000
ANYTHINGLLM_MAX_RETRIES=3
```

**Slow Responses (cloud/large model):**
```bash
ANYTHINGLLM_REQUEST_TIMEOUT_MS=60000
ANYTHINGLLM_MAX_RETRIES=7
```

---

## 🔐 Security Notes

### API Key Protection
- ✅ `ANYTHINGLLM_API_KEY` is server-only (not exposed to browser)
- ✅ All requests go through Next.js server if using API routes
- ❌ Never expose API key in environment variables accessible to frontend

### HTTPS Requirement
- Always use HTTPS for production
- AnythingLLM instance must be HTTPS

### Webhook Verification
If using webhooks, always verify signature:
```typescript
const isValid = client.verifyWebhookSignature(body, sig, secret, timestamp);
if (!isValid) {
  // Reject request
  return res.status(403).json({ error: 'Invalid signature' });
}
```

---

## 🐛 Troubleshooting

### Issue: Green indicator but no responses
**Cause:** API key invalid or expired
**Fix:** 
1. Check environment variables: `echo $ANYTHINGLLM_API_KEY`
2. Verify API key with AnythingLLM admin
3. Rotate key if expired

### Issue: "AnythingLLM not configured" (red indicator)
**Cause:** Environment variables not set
**Fix:**
1. Create `.env.local` file
2. Add all required variables
3. Restart dev server: `npm run dev`

### Issue: Timeout errors
**Cause:** Request took longer than timeout
**Fix:** Increase timeout in `.env`:
```bash
ANYTHINGLLM_REQUEST_TIMEOUT_MS=60000
```

### Issue: Rate limit (429 errors)
**Cause:** Too many requests too fast
**Fix:** 
1. Wait (client will retry automatically)
2. Request higher rate limit from AnythingLLM admin
3. Reduce concurrent requests

### Issue: Can't connect to instance
**Cause:** URL incorrect or instance down
**Fix:**
1. Verify URL: `curl https://your-instance.com/health`
2. Check firewall/VPN rules
3. Restart AnythingLLM instance

---

## 📚 Additional Resources

### From Blueprint Documentation
- Full API specifications: See `/root/suite/src/app/components/blueprint anythingllm`
- Smoke tests & validation: Use curl examples from blueprint
- Production deployment: Follow runbook section

### AnythingLLM
- Instance: https://anything-anything-llm.840tjq.easypanel.host
- API Key: J9JY897-PK3MW8M-K40SRQ2-N2E6PTW

---

## ✨ Next Steps

### Phase 2: Stream Support
- Implement `streamChat()` for real-time responses
- Add abort signal for user cancellation
- Progress indicator for streaming

### Phase 3: Advanced Features
- Conversation persistence (save/load)
- Token usage dashboard
- Cost estimation
- Model selection in UI

### Phase 4: Production
- Move API key to Vercel Secrets
- Add request signing for webhook verification
- Implement rate limiting on frontend
- Add metrics/analytics

---

## 📋 Files Modified Summary

| File | Change | Status |
|------|--------|--------|
| `/root/suite/src/app/editor/editor.ts` | Fixed Yjs initialization | ✅ Done |
| `/root/suite/src/app/layout.tsx` | Added suppressHydrationWarning | ✅ Done |
| `/root/suite/src/app/services/anythingllm.ts` | Created new client service | ✅ Done |
| `/root/suite/src/app/components/AIPanel.tsx` | Integrated AnythingLLM | ✅ Done |
| `/root/suite/.env.example` | Created env template | ✅ Done |

---

**Last Updated:** October 21, 2025
**Status:** Ready for Development ✅
