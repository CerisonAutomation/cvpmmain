import { useState, useRef, memo } from "react";

export const InlineText = memo(({ value, onChange, className, style, tag: Tag = "span", multiline = false, placeholder = "Click to edit..." }) => {
  const editable = !!onChange;
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);

  if (!editable) {
    return <Tag className={className} style={style}>{value || ""}</Tag>;
  }

  const handleBlur = () => {
    setEditing(false);
    if (ref.current && onChange) {
      const newValue = ref.current.innerText;
      if (newValue !== value) onChange(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) { e.preventDefault(); ref.current?.blur(); }
    if (e.key === "Escape") { ref.current.innerText = value || ""; ref.current?.blur(); }
  };

  return (
    <Tag ref={ref} contentEditable suppressContentEditableWarning
      role="textbox" aria-label={placeholder} aria-multiline={multiline}
      onFocus={() => setEditing(true)} onBlur={handleBlur} onKeyDown={handleKeyDown}
      className={`${className} outline-none cursor-text transition-all duration-150 ${editing ? "ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-black/30 rounded bg-black/30 px-1" : "hover:ring-1 hover:ring-[#D4AF37]/50 hover:bg-black/10 hover:rounded"}`}
      style={style}
      data-placeholder={placeholder}>
      {value || placeholder}
    </Tag>
  );
});
