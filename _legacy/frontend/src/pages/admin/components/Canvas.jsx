import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BlockRenderer } from "@/components/BlockRenderer";
import { SCHEMAS } from "@/lib/registry";
import { GripVertical, Copy, Trash2, Minus, Plus } from "lucide-react";

export const Canvas = ({ blocks, view, zoom, onZoomChange, selected, onSelect, onDragEnd, onUpdate, onDuplicate, onDelete, onMoveBlock }) => {
  return (
    <main className="flex-1 flex flex-col bg-[#141416] overflow-hidden">
      <div className="h-9 bg-[#0e0e10] border-b border-[#1a1a1e] flex items-center justify-between px-4 shrink-0">
        <span className="text-[9px] text-[#4a4a4e] font-medium">{blocks.length} blocks</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onZoomChange(Math.max(50, zoom - 10))} className="p-1 text-[#5a5a5e] hover:text-[#f0ede8]"><Minus className="w-3 h-3" /></button>
          <span className="text-[9px] text-[#5a5a5e] w-8 text-center">{zoom}%</span>
          <button onClick={() => onZoomChange(Math.min(100, zoom + 10))} className="p-1 text-[#5a5a5e] hover:text-[#f0ede8]"><Plus className="w-3 h-3" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-[#0a0a0b]/50">
        <div className="mx-auto shadow-2xl transition-all rounded overflow-hidden border border-[#1a1a1e]"
          style={{
            width: view === "desktop" ? "100%" : view === "tablet" ? "820px" : "390px",
            maxWidth: "100%",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center"
          }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {blocks.filter(b => b.visible !== false).map((block, idx) => (
                    <Draggable key={block.id} draggableId={block.id} index={idx}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}
                          onClick={() => { onSelect(block.id); }}
                          className={`relative group ${selected === block.id ? "ring-2 ring-[#D4AF37] ring-inset" : "hover:ring-1 hover:ring-[#D4AF37]/30 hover:ring-inset"} ${snapshot.isDragging ? "opacity-90 shadow-2xl" : ""}`}>
                          <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-[#D4AF37] text-[#0a0a0b] text-[9px] font-semibold uppercase tracking-wide ${selected === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                            <span {...provided.dragHandleProps} className="flex items-center gap-1.5 cursor-grab"><GripVertical className="w-3 h-3" />{SCHEMAS[block.type]?.label}</span>
                            <div className="flex gap-1 items-center">
                              {onMoveBlock && (
                                <>
                                  <button type="button" aria-label="Move block up" disabled={idx === 0} onClick={e => { e.stopPropagation(); onMoveBlock(idx, -1); }} className="p-0.5 hover:bg-black/10 rounded disabled:opacity-30">↑</button>
                                  <button type="button" aria-label="Move block down" disabled={idx === blocks.filter(b => b.visible !== false).length - 1} onClick={e => { e.stopPropagation(); onMoveBlock(idx, 1); }} className="p-0.5 hover:bg-black/10 rounded disabled:opacity-30">↓</button>
                                </>
                              )}
                              <button onClick={e => { e.stopPropagation(); onDuplicate(block.id); }} className="p-0.5 hover:bg-black/10 rounded"><Copy className="w-3 h-3" /></button>
                              <button onClick={e => { e.stopPropagation(); onDelete(block.id); }} className="p-0.5 hover:bg-red-500/20 rounded text-red-700"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                          <BlockRenderer block={block} isEditing onEdit={onUpdate} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </main>
  );
};
