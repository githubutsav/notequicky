import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ReactNode } from "react"
import { slugifyHeading } from "@/lib/notes"

function textOf(children: ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(textOf).join("")
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props &&
    typeof children.props === "object" &&
    "children" in children.props
  ) {
    return textOf(children.props.children as ReactNode)
  }
  return ""
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="note-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 id={slugifyHeading(textOf(children))}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 id={slugifyHeading(textOf(children))}>{children}</h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
