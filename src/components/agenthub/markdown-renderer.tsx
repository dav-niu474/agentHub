'use client'

import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
  variant?: 'light' | 'dark'
}

export function MarkdownRenderer({ content, className, variant = 'light' }: MarkdownRendererProps) {
  const isDark = variant === 'dark'

  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className={cn(
              'font-semibold',
              isDark ? 'text-white' : 'text-gray-900',
            )}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName
            if (isInline) {
              return (
                <code
                  className={cn(
                    'px-1.5 py-0.5 rounded-md text-[13px] font-mono',
                    isDark
                      ? 'bg-white/15 text-white/90'
                      : 'bg-gray-200/80 text-gray-800',
                  )}
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className={cn(
                  'block rounded-lg p-3 text-[12px] font-mono leading-relaxed overflow-x-auto',
                  isDark
                    ? 'bg-white/10 text-white/90'
                    : 'bg-gray-800 text-gray-100',
                )}
                {...props}
              >
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-2 last:mb-0 rounded-lg overflow-x-auto">
              {children}
            </pre>
          ),
          h1: ({ children }) => (
            <h1 className={cn(
              'text-base font-bold mb-2 mt-3 first:mt-0',
              isDark ? 'text-white' : 'text-gray-900',
            )}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn(
              'text-[15px] font-bold mb-1.5 mt-2.5 first:mt-0',
              isDark ? 'text-white' : 'text-gray-900',
            )}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn(
              'text-sm font-bold mb-1 mt-2 first:mt-0',
              isDark ? 'text-white' : 'text-gray-900',
            )}>
              {children}
            </h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className={cn(
              'border-l-2 pl-3 my-2 italic text-[13px]',
              isDark ? 'border-white/30 text-white/80' : 'border-gray-300 text-gray-500',
            )}>
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'underline underline-offset-2',
                isDark ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-gray-900',
              )}
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className={cn(
              'my-3',
              isDark ? 'border-white/20' : 'border-gray-200',
            )} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
