import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../styles/globals.css'
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Document Editor - Markdown WYSIWYG',
	description: 'A rich text document editor powered by Remirror with Markdown support, toolbar formatting, and selection-to-markdown extraction.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<QueryProvider>
						{children}
						<Toaster position="top-center"/>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
