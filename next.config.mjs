const isDev = process.env.NODE_ENV !== "production"

// Next.js precisa de 'unsafe-inline' para os scripts de bootstrap/hydration
// e 'unsafe-eval' só em dev (HMR/Fast Refresh). Sem nonce/strict-dynamic por
// enquanto — adotar isso exigiria instrumentar nonce em cada response.
const csp = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	`connect-src 'self' https://*.supabase.co wss://*.supabase.co${isDev ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
	"frame-src https://www.youtube.com https://www.youtube-nocookie.com https://checkout.stripe.com",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self' https://checkout.stripe.com",
	"frame-ancestors 'self'",
].join("; ")

const securityHeaders = [
	{ key: "Content-Security-Policy", value: csp },
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
	{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "pwbkzjknstbqqemqyppm.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		]
	},
}

export default nextConfig
