"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import "./editor.css";

/**
 * Rich Text Editor Component using TipTap.
 *
 * Supported Features:
 * 1. Bold, Italic, Underline
 * 2. Heading (H2), Subheading (H3), Paragraph
 * 3. Link (Insert, Edit, Remove with inline modal)
 * 4. List (Bullet list & Numbered list)
 * 5. Quote (Blockquote)
 * + Undo, Redo, Word & Character count, and Placeholder support.
 *
 * @param {Object} props
 * @param {string} [props.value] - Controlled HTML value
 * @param {string} [props.content] - Alias for value
 * @param {(html: string) => void} [props.onChange] - Callback fired on content change with HTML string
 * @param {string} [props.placeholder] - Placeholder text when editor is empty
 * @param {string} [props.className] - Additional wrapper class names
 * @param {boolean} [props.editable] - Toggle read-only or editable mode (default: true)
 * @param {string} [props.minHeight] - Minimum height of editor area (default: '220px')
 */
export default function Editor({
  value,
  content,
  onChange,
  placeholder = "Write detailed description, responsibilities, or requirements...",
  className = "",
  editable = true,
  minHeight = "220px",
}) {
  const initialContent = value ?? content ?? "";
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const linkInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            class: "text-[#EA580C] underline underline-offset-2 hover:text-[#C2410C] transition-colors",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      }),
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none p-4 sm:p-5 text-[#1C1917] leading-relaxed",
      },
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.isEmpty ? "" : editor.getHTML();
        onChange(html);
      }
    },
  });

  // Sync external value changes with editor instance
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const incoming = value ?? content;
    if (incoming !== undefined) {
      const currentHTML = editor.getHTML();
      if (incoming !== currentHTML && !(incoming === "" && editor.isEmpty)) {
        editor.commands.setContent(incoming, false);
      }
    }
  }, [value, content, editor]);

  // Handle editable prop updates
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Open link dialog
  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const currentHref = editor.getAttributes("link").href || "";
    setLinkUrl(currentHref);
    setLinkModalOpen(true);
    setTimeout(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    }, 50);
  }, [editor]);

  // Apply link
  const applyLink = useCallback(() => {
    if (!editor) return;
    const trimmed = linkUrl.trim();

    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkModalOpen(false);
      return;
    }

    // Format protocol if omitted
    const formattedUrl = /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: formattedUrl })
      .run();

    setLinkModalOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  // Remove link
  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkModalOpen(false);
    setLinkUrl("");
  }, [editor]);

  // Calculate words and characters
  const textContent = editor?.getText() || "";
  const characterCount = textContent.length;
  const wordCount = textContent
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  if (!editor) {
    return (
      <div className={`w-full rounded-xl border border-[#E5DDD0] bg-white p-6 animate-pulse ${className}`}>
        <div className="h-9 bg-[#F4EFE6] rounded-lg mb-4" />
        <div className="h-40 bg-[#FAF7F2] rounded-lg" />
      </div>
    );
  }

  const isLinkActive = editor.isActive("link");

  return (
    <div
      className={`tiptap-editor-wrapper relative flex flex-col w-full rounded-xl border bg-white shadow-xs transition-all duration-200 ${
        isFocused
          ? "border-[#EA580C] ring-3 ring-[#EA580C]/15"
          : "border-[#E5DDD0] hover:border-[#D0C5B4]"
      } ${className}`}
    >
      {/* ── TOOLBAR ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF7F2] border-b border-[#E5DDD0] rounded-t-xl select-none">
        
        {/* GROUP 1: Headings & Paragraph */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
            title="Paragraph"
            ariaLabel="Regular Paragraph"
          >
            <Pilcrow className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading (H2)"
            ariaLabel="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Subheading (H3)"
            ariaLabel="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* GROUP 2: Bold, Italic, Underline */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
            ariaLabel="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
            ariaLabel="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
            ariaLabel="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* GROUP 3: Lists & Quote */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
            ariaLabel="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
            ariaLabel="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
            ariaLabel="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <ToolbarDivider />

        {/* GROUP 4: Link */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={openLinkModal}
            isActive={isLinkActive}
            title={isLinkActive ? "Edit Link" : "Add Link"}
            ariaLabel="Insert or Edit Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          {isLinkActive && (
            <ToolbarButton
              onClick={removeLink}
              isActive={false}
              title="Remove Link"
              ariaLabel="Remove Link"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Unlink className="w-4 h-4" />
            </ToolbarButton>
          )}
        </div>

        <ToolbarDivider />

        {/* GROUP 5: Undo / Redo */}
        <div className="flex items-center gap-0.5 ml-auto">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
            ariaLabel="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
            ariaLabel="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* ── INLINE LINK MODAL / POPOVER ──────────────────────── */}
      {linkModalOpen && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-3 py-2.5 bg-[#F4EFE6] border-b border-[#E5DDD0] animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ExternalLink className="w-4 h-4 text-stone-500 shrink-0" />
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setLinkModalOpen(false);
                  editor.commands.focus();
                }
              }}
              placeholder="Paste or type URL (e.g. https://example.com)..."
              className="w-full bg-white border border-[#E5DDD0] rounded-lg px-3 py-1.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              onClick={applyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EA580C] text-white hover:bg-[#C2410C] text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>

            {isLinkActive && (
              <button
                type="button"
                onClick={removeLink}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E5DDD0] hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-medium transition-colors"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Unlink</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setLinkModalOpen(false);
                editor.commands.focus();
              }}
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-[#EDE6DA] transition-colors"
              title="Cancel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── EDITOR CONTENT AREA ──────────────────────────────── */}
      <div
        className="relative flex-1 cursor-text"
        style={{ minHeight }}
        onClick={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        {/* Placeholder overlay when editor is empty */}
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 text-stone-400 pointer-events-none select-none text-[15px] leading-relaxed">
            {placeholder}
          </div>
        )}

        <EditorContent editor={editor} />
      </div>

      {/* ── FOOTER BAR (STATS & SHORTCUTS) ───────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[#E5DDD0]/70 bg-[#FAF7F2]/60 rounded-b-xl text-xs text-stone-500">
        <span className="hidden sm:inline text-stone-400">
          Tip: Select text to format or insert links
        </span>
        <div className="flex items-center gap-3 ml-auto font-medium">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          <span className="text-stone-300">•</span>
          <span>{characterCount} chars</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────────────

function ToolbarButton({
  children,
  onClick,
  isActive = false,
  disabled = false,
  title,
  ariaLabel,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-all duration-150 ${
        disabled
          ? "opacity-35 cursor-not-allowed text-stone-400"
          : isActive
          ? "bg-[#EA580C] text-white shadow-xs font-semibold"
          : "text-stone-700 hover:text-stone-950 hover:bg-[#EDE6DA]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-5 w-[1px] bg-[#E5DDD0] mx-1 self-center" />;
}

export { Editor };