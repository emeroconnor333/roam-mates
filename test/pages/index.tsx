// pages/index.tsx (or your relevant page file)

// --- Core Liveblocks & React Imports (Keep as is) ---
import {
  RoomProvider,
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
  // --- ADD Liveblocks storage hooks ---
  useStorage,
  useMutation,
  // --- ADD Liveblocks List type for explicit array handling (optional but good practice) ---
  // LiveList,
} from "@liveblocks/react";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react"; // Add useRef
import { useRouter } from "next/router";
import Cursor from "../components/Cursor"; // Ensure path is correct
import FlyingReaction from "../components/FlyingReaction"; // Ensure path is correct
import ReactionSelector from "../components/ReactionSelector"; // Ensure path is correct
import useInterval from "../hooks/useInterval"; // Ensure path is correct

// --- ADD Drag and Drop Imports ---
import { DndProvider, useDrag, useDrop, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { Identifier } from 'dnd-core'; // Import Identifier type

// --- Constants and Types (Keep existing) ---

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

enum CursorMode {
  Hidden,
  Chat,
  ReactionSelector,
  Reaction,
}

type CursorState =
    | { mode: CursorMode.Hidden }
    | { mode: CursorMode.Chat; message: string; previousMessage: string | null }
    | { mode: CursorMode.ReactionSelector }
    | { mode: CursorMode.Reaction; reaction: string; isPressed: boolean };

type Reaction = {
  value: string;
  timestamp: number;
  point: { x: number; y: number };
};

type ReactionEvent = { x: number; y: number; value: string };

// --- DEFINE Presence and Storage Types ---

// Presence: Data specific to each user, ephemeral
interface Presence {
  cursor: { x: number; y: number } | null;
  message: string;
  // Add other presence data if needed (e.g., isDraggingCard: boolean)
}

// Card: Structure for a single Kanban card
interface Card {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
}

// ColumnsStructure: Defines the shape of the columns object
interface ColumnsStructure {
  [key: string]: Card[]; // Column ID mapped to an array of cards
  // Alternatively, use LiveList<Card> if using Liveblocks Lists explicitly
  // [key: string]: LiveList<Card>;
}

// Storage: Data shared and persisted for the room
interface Storage {
  columns: ColumnsStructure;
}

// --- DEFINE Drag and Drop Types & Constants ---

const ItemTypes = { CARD: "card" };

// The static list of all possible cards
const initialCardsData: Card[] = [
  { id: "1", title: "Task 1", description: "Description for task 1", labels: ["urgent"] },
  { id: "2", title: "Feature Request", description: "New feature proposal", labels: ["feature"] },
  { id: "3", title: "Bug Fix", description: "Fixing a critical bug", labels: ["bug", "critical"] },
  { id: "4", title: "Documentation", description: "Writing user documentation" },
];

interface DragItem {
  index: number;
  id: string;
  columnId: string;
  type: string; // Ensure type is part of the item
}

interface DraggableCardProps {
  card: Card;
  index: number;
  columnId: string;
  onRearrange: (dragIndex: number, hoverIndex: number, columnId: string) => void;
}

interface DropColumnProps {
  columnId: string;
  cards: Readonly<Card[]> | undefined; // Use Readonly as useStorage provides immutable data
  onDrop: (droppedCard: Card, targetColumnId: string) => void;
  onRearrange: (dragIndex: number, dropIndex: number, columnId: string) => void;
}

// --- Kanban Components (DraggableCard, DropColumn) ---
// Add these components here, adapted for Liveblocks integration

function DraggableCard({ card, index, columnId, onRearrange }: DraggableCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.CARD,
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
    hover(item: DragItem, monitor) {
      if (!ref.current || item.columnId !== columnId) return; // Only care about hovering within the same column
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Perform the rearrange mutation via the passed callback
      onRearrange(dragIndex, hoverIndex, columnId);
      // Mutate the monitor item for performance
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => ({ id: card.id, index, columnId, type: ItemTypes.CARD }), // Return item factory
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    // Optional: Add logic for start/end drag if needed (e.g., update presence)
  });

  drag(drop(ref)); // Combine drag and drop refs

  return (
      <div
          ref={ref}
          data-handler-id={handlerId}
          style={{ opacity: isDragging ? 0.4 : 1, cursor: 'move' }}
          className="mb-2 rounded border border-gray-300 bg-white p-3 shadow-sm transition-opacity"
      >
        <h4 className="font-medium text-gray-800">{card.title}</h4>
        {card.description && <p className="mt-1 text-sm text-gray-600">{card.description}</p>}
        {card.labels && card.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.labels.map((label) => (
                  <span key={label} className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700">
              {label}
            </span>
              ))}
            </div>
        )}
      </div>
  );
}

function DropColumn({ columnId, cards, onDrop, onRearrange }: DropColumnProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: ItemTypes.CARD,
    drop: (item: DragItem) => {
      // Handle drop only if it's from a *different* column (or 'available-cards')
      if (item.columnId !== columnId) {
        // Find the card details from the static list
        const droppedCard = initialCardsData.find(c => c.id === item.id);
        if (droppedCard) {
          onDrop(droppedCard, columnId); // Trigger the drop mutation
        }
      }
      // Reordering within the same column is handled by DraggableCard's hover
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }, [onDrop, columnId]); // Dependencies

  drop(ref); // Attach drop ref

  const isActive = canDrop && isOver;
  let columnBg = "bg-gray-100"; // Default
  if (isActive) {
    columnBg = "bg-blue-100"; // Highlight when actively hovering
  } else if (canDrop) {
    columnBg = "bg-gray-200"; // Highlight when draggable is over *any* valid target
  }

  // Format column name for display
  const displayName = columnId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
      <div
          ref={ref}
          className={`flex h-full w-64 flex-col rounded-lg p-3 shadow-inner transition-colors md:w-72 ${columnBg}`} // Tailwind classes
      >
        <h3 className="mb-3 border-b border-gray-300 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
          {displayName}
        </h3>
        <div className="flex-grow space-y-2 overflow-y-auto"> {/* Scrollable card area */}
          {Array.isArray(cards) && cards.length > 0 ? (
              cards.map((card, index) => (
                  <DraggableCard
                      key={card.id}
                      card={card}
                      index={index}
                      columnId={columnId}
                      onRearrange={onRearrange}
                  />
              ))
          ) : (
              <div className="flex h-20 items-center justify-center text-sm text-gray-400">
                {isActive ? "Release to drop" : "Drag cards here"}
              </div>
          )}
        </div>
      </div>
  );
}

// Define this component above your Example component, or in a separate file

interface AvailableCardsColumnProps {
  availableCards: Card[];
  handleReturnCardToAvailable: (cardId: string) => void;
}

function AvailableCardsColumn({ availableCards, handleReturnCardToAvailable }: AvailableCardsColumnProps) {
  const availableDropRef = useRef<HTMLDivElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: ItemTypes.CARD,
    drop: (item: DragItem) => {
      if (item.columnId !== "available-cards") {
        handleReturnCardToAvailable(item.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }, [handleReturnCardToAvailable]);

  drop(availableDropRef);

  const isActive = canDrop && isOver;
  let availableBg = "bg-gray-100";
  if (isActive) { availableBg = "bg-green-100"; }
  else if (canDrop) { availableBg = "bg-gray-200"; }

  return (
      <div
          ref={availableDropRef}
          className={`flex h-full w-64 flex-col rounded-lg p-3 shadow-inner transition-colors md:w-72 ${availableBg}`}
      >
        <h3 className="mb-3 border-b border-gray-300 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
          Available Cards
        </h3>
        <div className="flex-grow space-y-2 overflow-y-auto">
          {availableCards.length > 0 ? (
              availableCards.map((card, index) => (
                  <DraggableCard
                      key={card.id}
                      card={card}
                      index={index}
                      columnId="available-cards"
                      onRearrange={() => { /* No-op */ }}
                  />
              ))
          ) : (
              <div className="flex h-20 items-center justify-center text-sm text-gray-400">
                {canDrop ? "Release to return card" : "No available cards."}
              </div>
          )}
        </div>
      </div>
  );
}

// --- Main Example Component (Modified) ---
function Example() {
  // --- Existing Liveblocks Hooks (Keep as is) ---
  const others = useOthers(); // Use Presence type
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();

  // --- Existing Local State (Keep as is) ---
  const [cursorState, setCursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // --- ADD Liveblocks Storage Hook for Kanban ---
  // Provides a read-only view of the columns. Use Readonly<> for type safety.
  const columns = useStorage((root) => root.columns as Readonly<ColumnsStructure> | null);

  // --- ADD Mutations for Kanban (Corrected) ---
  const handleDropCard = useMutation(
      ({ storage }, droppedCard: Card, targetColumnId: string) => {
        // Get the columns, could be various LSON types initially
        const currentColumnsLson = storage.get("columns");

        // --- Type Guard ---
        // Ensure it's a non-null object before proceeding
        if (typeof currentColumnsLson !== 'object' || currentColumnsLson === null) {
          console.error("Columns are not an object or are null:", currentColumnsLson);
          return; // Exit if not the expected object structure
        }

        // --- Type Assertion ---
        // Now we know it's an object, treat it as our defined structure
        // Using Readonly because the value from storage should be treated as immutable directly
        // --- Corrected Type Assertion ---
        const currentColumns = currentColumnsLson as unknown as Readonly<ColumnsStructure>;


        // --- Build the new state ---
        // Explicitly type newColumns
        const newColumns: ColumnsStructure = {};
        // No need for cardFoundAndRemoved flag, filter works correctly

        // Iterate over the keys of the *asserted* currentColumns
        for (const colId in currentColumns) {
          // Check if the key actually belongs to the object (good practice with for...in)
          if (Object.prototype.hasOwnProperty.call(currentColumns, colId)) {
            const originalColumn = currentColumns[colId]; // TS now knows currentColumns is indexable
            // Ensure originalColumn is an array before filtering (important if using LiveList potentially)
            if (Array.isArray(originalColumn)) {
              newColumns[colId] = originalColumn.filter((c: Card) => c.id !== droppedCard.id);
            } else {
              // Handle case where a column might not be an array unexpectedly
              console.warn(`Column ${colId} is not an array:`, originalColumn);
              newColumns[colId] = []; // Default to empty array? Or copy original if not array?
            }
          }
        }

        // Add the card to the target column
        // Ensure target column exists or initialize it, then push
        const targetColumn = [...(newColumns[targetColumnId] || [])];
        if (!targetColumn.some(c => c.id === droppedCard.id)) {
          targetColumn.push(droppedCard);
        }
        newColumns[targetColumnId] = targetColumn;

        // --- Update Storage ---
        // Asserting 'newColumns' as 'any' bypasses the strict LSON check.
        // This is generally safe if 'newColumns' only contains JSON-serializable data.
        // Alternatively, consider using Liveblocks data structures (LiveObject, LiveList)
        // for more robust type safety if complexity increases.
        storage.set("columns", newColumns as any);

      },
      [] // Dependencies array for useMutation
  );

  const handleRearrangeCard = useMutation(
      ({ storage }, dragIndex: number, dropIndex: number, columnId: string) => {
        const currentColumnsLson = storage.get("columns");

        // --- Type Guard ---
        if (typeof currentColumnsLson !== 'object' || currentColumnsLson === null) {
          console.error("Columns are not an object or are null:", currentColumnsLson);
          return;
        }

        // --- Type Assertion ---
        const currentColumns = currentColumnsLson as unknown as Readonly<ColumnsStructure>;

        // Check if the specific column exists and is an array
        const columnToModify = currentColumns[columnId];
        if (!columnToModify || !Array.isArray(columnToModify)) {
          console.error(`Column ${columnId} does not exist or is not an array.`);
          return; // Column doesn't exist or isn't an array
        }

        // Create a mutable copy of the specific column array
        const mutableColumn = [...columnToModify]; // Now we know it's an array

        // Perform the rearrangement
        if (dragIndex < 0 || dragIndex >= mutableColumn.length) {
          console.warn(`Invalid dragIndex ${dragIndex} for column ${columnId}`);
          return; // Index out of bounds
        }
        const [draggedItem] = mutableColumn.splice(dragIndex, 1);

        if (draggedItem) { // Ensure item exists before splicing it in
          // Ensure dropIndex is within valid bounds for insertion
          const safeDropIndex = Math.max(0, Math.min(dropIndex, mutableColumn.length));
          mutableColumn.splice(safeDropIndex, 0, draggedItem);
        } else {
          // Should ideally not happen if dragIndex check passed, but good safeguard
          console.warn(`Dragged item at index ${dragIndex} could not be obtained from column ${columnId}`);
          return;
        }

        // Create a mutable copy of the entire columns structure to update
        // Explicitly type newColumns
        const newColumns: ColumnsStructure = { ...currentColumns };
        newColumns[columnId] = mutableColumn; // Assign the rearranged array

        // --- Update Storage ---
        // Use 'as any' assertion for simplicity here as well
        storage.set("columns", newColumns as any);
      },
      [] // Dependencies array for useMutation
  );

  const handleReturnCardToAvailable = useMutation(
      ({ storage }, cardIdToRemove: string) => {
        const currentColumnsLson = storage.get("columns");

        // Type Guard
        if (typeof currentColumnsLson !== 'object' || currentColumnsLson === null) {
          console.error("Columns are not an object or are null:", currentColumnsLson);
          return;
        }

        // Type Assertion
        const currentColumns = currentColumnsLson as unknown as Readonly<ColumnsStructure>;

        // Build the new state, removing the card
        const newColumns: ColumnsStructure = {};
        let cardFound = false;

        for (const colId in currentColumns) {
          if (Object.prototype.hasOwnProperty.call(currentColumns, colId)) {
            const originalColumn = currentColumns[colId];
            if (Array.isArray(originalColumn)) {
              // Filter out the card to remove
              newColumns[colId] = originalColumn.filter((c: Card) => {
                if (c.id === cardIdToRemove) {
                  cardFound = true;
                  return false; // Exclude this card
                }
                return true; // Keep other cards
              });
            } else {
              newColumns[colId] = []; // Keep column structure even if data was bad
            }
          }
        }

        if (!cardFound) {
          console.warn(`Card ID ${cardIdToRemove} not found in any column to return.`);
          return; // Don't update storage if card wasn't found
        }

        // Update Storage
        storage.set("columns", newColumns as any);
      },
      [] // Dependencies
  );

  // --- ADD Derived State for Available Cards ---
  const availableCards = useMemo(() => {
    if (!columns) return []; // Not loaded yet

    const cardsInColumns = new Set<string>();
    Object.values(columns).forEach(columnCards => {
      // Ensure columnCards is treated as an array
      (columnCards as Card[]).forEach(card => cardsInColumns.add(card.id));
    });

    return initialCardsData.filter(card => !cardsInColumns.has(card.id));
  }, [columns]); // Recalculate when columns storage changes

  // --- Existing Reaction Logic (Keep as is) ---
  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  useInterval(() => {
    setReactions((reactions) =>
        reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
    );
  }, 1000);

  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      const reactionToAdd = {
        point: { x: cursor.x, y: cursor.y },
        value: cursorState.reaction,
        timestamp: Date.now(),
      };
      setReactions((prev) => [...prev, reactionToAdd]);
      broadcast({ x: cursor.x, y: cursor.y, value: cursorState.reaction });
    }
  }, 100);

  // --- Existing Event Listener for Others' Reactions (Keep as is) ---
  useEventListener(({ event }) => { // Use ReactionEvent type
    setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: event.x, y: event.y },
            value: event.value,
            timestamp: Date.now(),
          },
        ])
    );
  });


  // --- Existing Keyboard Listeners (Keep as is, minor adjustment) ---
  useEffect(() => {
    function onKeyUp(e: KeyboardEvent) {
      // Prevent shortcuts if focus is inside an input/textarea etc.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.key === "/") {
        setCursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    }
    window.addEventListener("keyup", onKeyUp);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement)) { // Check target here too
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]); // updateMyPresence is stable


  // --- Existing Pointer Handlers (Keep mostly as is) ---
  // Note: react-dnd manages pointer events on draggable items.
  // These handlers primarily control the cursor/reaction overlay.

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    // Only update presence if not showing reaction selector
    if (cursorState.mode !== CursorMode.ReactionSelector) {
      updateMyPresence({
        cursor: {
          x: Math.round(event.clientX),
          y: Math.round(event.clientY),
        },
      });
    }
  }, [updateMyPresence, cursorState.mode]);

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    // Update presence cursor position regardless of mode on pointer down
    updateMyPresence({
      cursor: {
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
      },
    });
    // Set reaction state to pressed if in reaction mode
    setCursorState((state) =>
        state.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
    );
  }, [updateMyPresence]);

  const handlePointerUp = useCallback(() => {
    // Set reaction state to not pressed if in reaction mode
    setCursorState((state) =>
        state.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
    );
  }, []);

  // --- ADD Loading State for Columns ---
  if (columns === null) {
    return (
        <div className="flex h-screen w-full items-center justify-center text-gray-500">
          Loading Kanban Board...
        </div>
    );
  }

  // --- Render Logic (Modified) ---
  return (
      // ADD DndProvider wrapper
      <DndProvider backend={HTML5Backend}>
        {/* Main container: Attach pointer events for cursor/reactions */}
        <div
            className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50 p-4" // Changed background, added padding
            style={{ cursor: cursorState.mode === CursorMode.Chat ? 'none' : 'url(/cursor.svg) 0 0, auto' }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            // Prevent native touch actions like scrolling when interacting with the board/cursors
            // Note: this might interfere with scrolling *inside* columns if content overflows.
            // Adjust if necessary (e.g., allow touch on column scroll areas).
            // touchAction: 'none' // Be cautious with this, test touch interaction
        >
          {/* ADD Kanban Board Layout */}
          <div className="kanban-board flex flex-grow gap-4 overflow-x-auto pb-4">

            {/* --- Modified Available Cards Section --- */}
            {/* Add useDrop hook and attach ref */}
            <AvailableCardsColumn
                availableCards={availableCards}
                handleReturnCardToAvailable={handleReturnCardToAvailable}
            />
            {/* --- End Modified Available Cards Section --- */}

            {/* Drop Columns from Liveblocks Storage */}
            {Object.keys(columns).map((columnKey) => (
                <DropColumn
                    key={columnKey}
                    columnId={columnKey}
                    cards={columns[columnKey]} // Pass the immutable array
                    onDrop={handleDropCard} // Pass drop mutation
                    onRearrange={handleRearrangeCard} // Pass rearrange mutation
                />
            ))}
          </div> {/* End Kanban Board Layout */}


          {/* --- Cursors, Reactions, Chat UI (Rendered on top) --- */}
          {/* Keep this section largely as it was in the working example */}

          {/* Flying Reactions */}
          {reactions.map((r) => (
              <FlyingReaction
                  key={r.timestamp.toString()}
                  x={r.point.x}
                  y={r.point.y}
                  timestamp={r.timestamp}
                  value={r.value}
              />
          ))}

          {/* My Cursor and Input/Reaction Selector */}
          {cursor && (
              <div
                  className="pointer-events-none absolute top-0 left-0 z-40" // Ensure it's above board, pointer-events-none
                  style={{ transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)` }}
              >
                {/* Custom cursor graphic (hide if chatting) */}
                {cursorState.mode !== CursorMode.Chat && <img src="/cursor.svg" alt="Cursor" />}

                {/* Chat Input */}
                {cursorState.mode === CursorMode.Chat && (
                    // Add pointer-events-auto specifically to the chat bubble container
                    <div
                        className="pointer-events-auto absolute top-5 left-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-xl"
                        style={{ borderRadius: '20px' }}
                        // Stop key events from bubbling up (e.g., to window listeners)
                        onKeyUp={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                    >
                      {cursorState.previousMessage && <div className="opacity-70">{cursorState.previousMessage}</div>}
                      <input
                          className="w-60 border-none bg-transparent text-white placeholder-blue-200 outline-none"
                          autoFocus={true}
                          onChange={(e) => {
                            const msg = e.target.value;
                            updateMyPresence({ message: msg });
                            // --- Corrected setCursorState for onKeyDown (Enter) ---
                            setCursorState(prev => {
                              // We know prev.mode must be Chat here too.
                              // We safely access prev.message to set it as previousMessage.
                              if (prev.mode === CursorMode.Chat) {
                                return {
                                  ...prev,
                                  mode: CursorMode.Chat,
                                  message: msg // Clear current message input
                                };
                              }
                              // Fallback: Should not happen if input only exists in Chat mode
                              return { mode: CursorMode.Chat, previousMessage: null, message: "" };
                            });
                          }}
                          onKeyDown={(e) => {
                            // No need to stop propagation again here if done on parent
                            if (e.key === "Enter") {
                              // --- Corrected setCursorState for onKeyDown (Enter) ---
                              setCursorState(prev => {
                                // We know prev.mode must be Chat here too.
                                // We safely access prev.message to set it as previousMessage.
                                if (prev.mode === CursorMode.Chat) {
                                  return {
                                    mode: CursorMode.Chat,
                                    previousMessage: prev.message, // Current message becomes previous
                                    message: "" // Clear current message input
                                  };
                                }
                                // Fallback: Should not happen if input only exists in Chat mode
                                return { mode: CursorMode.Chat, previousMessage: null, message: "" };
                              });
                              // updateMyPresence({ message: "" }); // Optionally clear presence message too

                            } else if (e.key === "Escape") {
                              setCursorState({ mode: CursorMode.Hidden });
                              updateMyPresence({ message: "" });
                            }
                          }}
                          placeholder={cursorState.previousMessage ? "" : "Say something…"}
                          value={cursorState.message}
                          maxLength={50}
                      />
                    </div>
                )}

                {/* Reaction Selector */}
                {cursorState.mode === CursorMode.ReactionSelector && (
                    // Add pointer-events-auto here if interaction is needed
                    <div className="pointer-events-auto">
                      <ReactionSelector
                          setReaction={setReaction} // Pass the callback
                      />
                    </div>
                )}

                {/* Reaction Emoji under Cursor */}
                {cursorState.mode === CursorMode.Reaction && (
                    <div className="absolute top-3.5 left-1 select-none text-xl">
                      {cursorState.reaction}
                    </div>
                )}
              </div>
          )}

          {/* Other Users' Cursors */}
          {others.map(({ connectionId, presence }) => {
            if (!presence?.cursor) { // Simplified check
              return null;
            }
            return (
                <Cursor
                    key={connectionId}
                    color={COLORS[connectionId % COLORS.length]}
                    x={presence.cursor.x}
                    y={presence.cursor.y}
                    message={presence.message} // Display message from their presence
                />
            );
          })}

        </div> {/* End Main Container */}
      </DndProvider> // End DndProvider
  );
}

// --- Page Component (Modified) ---
export default function Page() {
  // Use a distinct room ID for the combined example
  const roomId = useExampleRoomId("nextjs-live-kanban-cursors");

  // Define the initial state for the shared Kanban board storage
  // This runs ONLY if the room storage is empty when the first user joins.
  const initialStorageState: Storage = {
    columns: {
      "todo": [],
      "in-progress": [],
      "done": [],
    }
    // If using LiveList:
    // columns: {
    //   "todo": new LiveList<Card>([]),
    //   "in-progress": new LiveList<Card>([]),
    //   "done": new LiveList<Card>([]),
    // }
  };

  return (
      <RoomProvider // Provide BOTH Presence and Storage types
          id={roomId}
          // Initial presence for *this* user when they join
          initialPresence={{
            cursor: null,
            message: "",
          }}
          // Initial storage for the *room*
          // --- Corrected: Use type assertion ---
          initialStorage={initialStorageState as any}
      >
        {/* Static Help Text Overlay - Adjusted */}
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform select-none rounded-md bg-gray-900 bg-opacity-70 p-2 text-xs text-white shadow-lg backdrop-blur-sm">
          <ul className="flex items-center justify-center space-x-3">
            <li className="flex items-center space-x-1">
              <span>Drag Cards</span>
              <span className="ml-1 block rounded bg-gray-700 px-1 py-0.5 font-mono text-[10px]">Mouse</span>
            </li>
            <li className="flex items-center space-x-1">
              <span>Reactions</span>
              <span className="ml-1 block rounded bg-gray-700 px-1 py-0.5 font-mono text-[10px]">E</span>
            </li>
            <li className="flex items-center space-x-1">
              <span>Chat</span>
              <span className="ml-1 block rounded bg-gray-700 px-1 py-0.5 font-mono text-[10px]">/</span>
            </li>
            <li className="flex items-center space-x-1">
              <span>Exit</span>
              <span className="ml-1 block rounded bg-gray-700 px-1 py-0.5 font-mono text-[10px]">esc</span>
            </li>
          </ul>
        </div>

        {/* Render the main application */}
        <Example />
      </RoomProvider>
  );
}

// --- getStaticProps and useExampleRoomId (Keep as is) ---

export async function getStaticProps() {
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
  const API_KEY_WARNING = process.env.CODESANDBOX_SSE
      ? `Add your public key from https://liveblocks.io/dashboard/apikeys as the \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\` secret in CodeSandbox.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-cursors-chat#codesandbox.`
      : `Create an \`.env.local\` file and add your public key from https://liveblocks.io/dashboard/apikeys as the \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\` environment variable.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-cursors-chat#getting-started.`;

  if (!API_KEY) {
    console.warn(API_KEY_WARNING);
  }
  return { props: {} };
}

function useExampleRoomId(roomId: string) {
  const { query } = useRouter();
  const exampleRoomId = useMemo(() => {
    return query?.exampleId ? `${roomId}-${query.exampleId}` : roomId;
  }, [query, roomId]);
  return exampleRoomId;
}