import { useRef, useCallback, useEffect, useState } from 'react'
import { sanitizeHtml, sanitizeForOutput, containsDangerousContent } from '../utils/sanitize'
import { useTextFormatting } from '../hooks/useTextFormatting'
import { useHistory } from '../hooks/useHistory'
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { FloatingToolbar } from "./FloatingToolbar";
import { MediaToolbar } from "./MediaToolbar";
import { DragHandle } from "./DragHandle";
import { DropIndicator } from "./DropIndicator";
import { ImageResizer } from "./ImageResizer";
import { ShortcutsOverlay } from "./ShortcutsOverlay";
import './EditorIsolation.css'
import './WysiwygEditor.css'

type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type Alignment = "left" | "center" | "right" | "justify";

export interface Asset {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
}

export interface WysiwygEditorProps {
  /** The HTML content to edit */
  html: string;
  /** Callback fired when content changes */
  onChange: (html: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Debounce delay for onChange in milliseconds */
  debounceMs?: number;
  /** Available assets for media replacement */
  assets?: Asset[];
  /** Callback for file uploads, returns the URL of the uploaded file */
  onUpload?: (file: File) => Promise<string>;
}

export function WysiwygEditor({
  html,
  onChange,
  placeholder = "Start typing...",
  debounceMs = 300,
  assets = [],
  onUpload,
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const isHistoryChange = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [showWarning, setShowWarning] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<
    HTMLImageElement | HTMLVideoElement | null
  >(null);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    blockType: "p" as BlockType,
    bulletList: false,
    numberedList: false,
    currentLink: null as string | null,
    textColor: "",
    backgroundColor: "",
    fontFamily: "",
    fontSize: "",
    alignment: "left" as Alignment,
  });

  // History management
  const { pushToHistory, undo, redo, canUndo, canRedo } = useHistory(html, {
    maxHistory: 50,
    debounceMs: 500,
  });

  // Emit content change
  const emitChange = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (editorRef.current) {
        isInternalChange.current = true;
        const rawHtml = editorRef.current.innerHTML;
        const cleanHtml = sanitizeForOutput(rawHtml);

        if (!isHistoryChange.current) {
          pushToHistory(cleanHtml);
        }
        isHistoryChange.current = false;

        onChange(cleanHtml);
      }
    }, debounceMs);
  }, [onChange, debounceMs, pushToHistory]);

  // Drag and drop
  const { dragState, handleDragStart, findBlockParent } = useDragAndDrop({
    editorRef,
    onContentChange: emitChange,
  });

  // Handle undo
  const handleUndo = useCallback(() => {
    const previousHtml = undo();
    if (previousHtml !== null && editorRef.current) {
      isHistoryChange.current = true;
      isInternalChange.current = true;
      editorRef.current.innerHTML = sanitizeHtml(previousHtml);
      onChange(previousHtml);
    }
  }, [undo, onChange]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const nextHtml = redo();
    if (nextHtml !== null && editorRef.current) {
      isHistoryChange.current = true;
      isInternalChange.current = true;
      editorRef.current.innerHTML = sanitizeHtml(nextHtml);
      onChange(nextHtml);
    }
  }, [redo, onChange]);

  // Text formatting
  const {
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    toggleBulletList,
    toggleNumberedList,
    setBlockType,
    getCurrentBlockType,
    isFormatActive,
    isInList,
    insertLink,
    removeLink,
    getCurrentLink,
    setTextColor,
    setBackgroundColor,
    getCurrentTextColor,
    getCurrentBackgroundColor,
    setFontFamily,
    setFontSize,
    getCurrentFontFamily,
    getCurrentFontSize,
    setAlignment,
    getCurrentAlignment,
    insertBlockquote,
    insertCodeBlock,
    insertHorizontalRule,
  } = useTextFormatting({
    editorRef,
    onContentChange: emitChange,
  });

  // Update format state on selection change
  const updateFormatState = useCallback(() => {
    setFormatState({
      bold: isFormatActive("bold"),
      italic: isFormatActive("italic"),
      underline: isFormatActive("underline"),
      blockType: getCurrentBlockType(),
      bulletList: isInList("ul"),
      numberedList: isInList("ol"),
      currentLink: getCurrentLink(),
      textColor: getCurrentTextColor(),
      backgroundColor: getCurrentBackgroundColor(),
      fontFamily: getCurrentFontFamily(),
      fontSize: getCurrentFontSize(),
      alignment: getCurrentAlignment(),
    });
  }, [
    isFormatActive,
    getCurrentBlockType,
    isInList,
    getCurrentLink,
    getCurrentTextColor,
    getCurrentBackgroundColor,
    getCurrentFontFamily,
    getCurrentFontSize,
    getCurrentAlignment,
  ]);

  // Handle media selection
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if clicked on an image or video
      if (target.tagName === "IMG" || target.tagName === "VIDEO") {
        e.preventDefault();
        setSelectedMedia(target as HTMLImageElement | HTMLVideoElement);

        // Add visual selection indicator
        target.classList.add("media-selected");
      } else {
        // Deselect media
        if (selectedMedia) {
          selectedMedia.classList.remove("media-selected");
          setSelectedMedia(null);
        }
      }
    },
    [selectedMedia]
  );

  // Handle media replace
  const handleMediaReplace = useCallback(
    (url: string) => {
      if (selectedMedia) {
        selectedMedia.setAttribute("src", url);
        selectedMedia.classList.remove("media-selected");
        setSelectedMedia(null);
        emitChange();
      }
    },
    [selectedMedia, emitChange]
  );

  // Handle media delete
  const handleMediaDelete = useCallback(() => {
    if (selectedMedia) {
      selectedMedia.classList.remove("media-selected");
      selectedMedia.remove();
      setSelectedMedia(null);
      emitChange();
    }
  }, [selectedMedia, emitChange]);

  // Handle image resize
  const handleImageResize = useCallback(
    (width: number, height: number) => {
      if (selectedMedia && selectedMedia.tagName === "IMG") {
        selectedMedia.setAttribute("width", String(width));
        selectedMedia.setAttribute("height", String(height));
        selectedMedia.style.width = `${width}px`;
        selectedMedia.style.height = `${height}px`;
        emitChange();
      }
    },
    [selectedMedia, emitChange]
  );

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle delete key for selected media
      if (selectedMedia && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        handleMediaDelete();
        return;
      }

      // Handle Escape to deselect media
      if (selectedMedia && e.key === "Escape") {
        selectedMedia.classList.remove("media-selected");
        setSelectedMedia(null);
        return;
      }

      if (!editorRef.current?.contains(document.activeElement)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (!modifier) return;

      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      if (e.key === "y" && !isMac) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selectedMedia, handleMediaDelete]);

  // Sanitize and initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (containsDangerousContent(html)) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }

      const sanitized = sanitizeHtml(html);

      if (editorRef.current.innerHTML !== sanitized) {
        editorRef.current.innerHTML = sanitized;
      }
    }
    isInternalChange.current = false;
  }, [html]);

  // Handle content changes
  const handleInput = useCallback(() => {
    emitChange();
    updateFormatState();
  }, [emitChange, updateFormatState]);

  // Track selection changes for format state
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current?.contains(document.activeElement)) {
        updateFormatState();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateFormatState]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Prevent default drag behavior
  const handleNativeDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const isEmpty = !html || html === "<br>" || html === "<p><br></p>";

  return (
    <div
      className={`wysiwyg-editor-wrapper ${
        dragState.isDragging ? "is-dragging" : ""
      }`}
    >
      {showWarning && (
        <div className="wysiwyg-warning">
          ⚠️ Potentially unsafe content was sanitized
        </div>
      )}

      {/* Floating toolbar appears on text selection */}
      {!dragState.isDragging && (
        <FloatingToolbar
          editorRef={editorRef}
          formatState={formatState}
          onBold={toggleBold}
          onItalic={toggleItalic}
          onUnderline={toggleUnderline}
          onStrikethrough={toggleStrikethrough}
          onBlockType={setBlockType}
          onBulletList={toggleBulletList}
          onNumberedList={toggleNumberedList}
          onInsertLink={insertLink}
          onRemoveLink={removeLink}
          onTextColor={setTextColor}
          onBackgroundColor={setBackgroundColor}
          onFontFamily={setFontFamily}
          onFontSize={setFontSize}
          onAlignment={setAlignment}
          onInsertBlockquote={insertBlockquote}
          onInsertCodeBlock={insertCodeBlock}
          onInsertHorizontalRule={insertHorizontalRule}
        />
      )}

      {/* Media toolbar appears when image/video is selected */}
      {!dragState.isDragging && (
        <MediaToolbar
          selectedElement={selectedMedia}
          assets={assets}
          onReplace={handleMediaReplace}
          onDelete={handleMediaDelete}
          onUpload={onUpload}
        />
      )}

      {/* Image resize handles */}
      {!dragState.isDragging && selectedMedia?.tagName === "IMG" && (
        <ImageResizer
          selectedImage={selectedMedia as HTMLImageElement}
          onResize={handleImageResize}
        />
      )}

      {/* Drag handle appears on block hover */}
      {!dragState.isDragging && (
        <DragHandle
          editorRef={editorRef}
          onDragStart={handleDragStart}
          findBlockParent={findBlockParent}
        />
      )}

      {/* Drop indicator line */}
      <DropIndicator y={dragState.dropIndicatorY} />

      {/* Hint bar with undo/redo buttons */}
      <div className="wysiwyg-hint-bar">
        <div className="history-buttons">
          <button
            type="button"
            className={`history-btn ${!canUndo ? "disabled" : ""}`}
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            className={`history-btn ${!canRedo ? "disabled" : ""}`}
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷ Redo
          </button>
        </div>
        <span className="hint-text">
          Drag ⋮⋮ to reorder • Select text to format
        </span>
        <button
          type="button"
          className="shortcuts-btn"
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts"
        >
          ⌨️
        </button>
      </div>

      {/* Keyboard shortcuts overlay */}
      <ShortcutsOverlay
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <div
        ref={editorRef}
        className={`wysiwyg-editor ${isEmpty ? "wysiwyg-editor--empty" : ""}`}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onClick={handleClick}
        onDragStart={handleNativeDragStart}
        data-placeholder={placeholder}
        spellCheck
        role="textbox"
        aria-multiline="true"
        aria-label="Rich text editor"
        aria-placeholder={placeholder}
      />
    </div>
  );
}
