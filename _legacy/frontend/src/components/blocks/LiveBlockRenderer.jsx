import { BlockRenderer } from "@/components/BlockRenderer";

export const LiveBlockRenderer = ({ block, onEdit }) => (
  <BlockRenderer
    block={block}
    isEditing={!!onEdit}
    onEdit={onEdit ? (id, field, value) => onEdit(field, value) : undefined}
  />
);

export default LiveBlockRenderer;
