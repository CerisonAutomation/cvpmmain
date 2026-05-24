# 🔧 COMPREHENSIVE FIXES TODO

## CRITICAL FIXES NEEDED

### 1. Token Background Refresh Never Starts
- `start_background_refresh()` exists but is never called
- Must be started on app startup

### 2. Token File Path Issues  
- TOKEN_FILE points to backend root, should be in data directory
- File doesn't get cleaned up on token invalidation properly

### 3. Security Headers Missing
- CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- HSTS header

### 4. Rate Limiting Missing
- No rate limiting on any API endpoint
- Stripe webhooks vulnerable to replay

### 5. Error Handling
- No 500 error page
- No global error boundaries

### 6. SEO Missing
- No sitemap.xml
- No JSON-LD structured data

### 7. WebSocket Security
- No authentication on WebSocket connections
- Anyone can connect and spam events

### 8. Input Validation
- Some endpoints lack proper input sanitization

### 9. Monitoring
- No error tracking (Sentry)
- No performance monitoring
