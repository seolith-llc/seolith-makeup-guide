# nginx drops the parent's add_header set whenever a location block adds its own header,
# so every location that sets Cache-Control re-includes the security headers from here.
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header X-Frame-Options "DENY" always;
