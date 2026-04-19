import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";
import { uploadCatalogCoverImage } from "../../api/catalogCoverUpload.js";

function ToolbarButton({ active, disabled, onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
        active ? "bg-brand-500/30 text-brand-200" : "bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export default function BlogRichTextEditor({
  initialHtml,
  onChange,
  placeholder = "",
  disabled = false,
  uploadLabel = "Upload",
}) {
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        }),
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: { class: "max-w-full h-auto rounded-lg my-4" },
        }),
        Placeholder.configure({ placeholder }),
      ],
      content: initialHtml || "",
      editable: !disabled,
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const onPickImage = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;
      try {
        const url = await uploadCatalogCoverImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        /* parent can show upload errors */
      }
    },
    [editor],
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const next = window.prompt("URL", prev || "https://");
    if (next === null) return;
    if (next === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: next }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[12rem] rounded-lg border border-white/10 bg-black/30 px-3 py-4 text-sm text-slate-500">
        …
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-2 py-2">
        <ToolbarButton
          title="Bold"
          disabled={disabled}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          disabled={disabled}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          disabled={disabled}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          title="H2"
          disabled={disabled}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          disabled={disabled}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          disabled={disabled}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton title="Link" disabled={disabled} active={editor.isActive("link")} onClick={setLink}>
          Link
        </ToolbarButton>
        <label className="cursor-pointer rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={disabled} onChange={onPickImage} />
          {uploadLabel}
        </label>
      </div>
      <EditorContent
        editor={editor}
        className="blog-rich-editor px-3 py-2 text-sm text-white [&_.ProseMirror]:min-h-[14rem] [&_.ProseMirror]:outline-none [&_.ProseMirror]:max-w-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0 [&_.ProseMirror_p.is-editor-empty:first-child]:before:w-full [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-slate-500 [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-white/20 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_a]:text-brand-400 [&_.ProseMirror_a]:underline"
      />
    </div>
  );
}
