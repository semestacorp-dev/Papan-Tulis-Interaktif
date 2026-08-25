import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Pencil, 
  Highlighter, 
  Eraser, 
  Square, 
  Circle, 
  Triangle, 
  ArrowRight, 
  Minus, 
  Type, 
  StickyNote, 
  Sparkles, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Download, 
  Grid, 
  Palette, 
  Flame,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize,
  HelpCircle,
  FolderOpen,
  Lock,
  Unlock,
  Move,
  Settings,
  Sliders
} from 'lucide-react';
import { ToolType, WhiteboardElement, Point, SlideItem, UserProfile } from '../types';
import { speakText, stopSpeaking } from '../lib/audioService';

interface WhiteboardCanvasProps {
  currentSlide: SlideItem | null;
  currentSlideIndex: number;
  totalSlides: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  user: UserProfile | null;
  roomCode: string;
  onOpenAIForCurrentSlide: (slide: SlideItem) => void;
  onOpenDrive: () => void;
  onStartQuiz: () => void;
  onElementsChange?: (elements: WhiteboardElement[]) => void;
  syncedElements?: WhiteboardElement[];
}

const COLOR_PALETTE = [
  { name: 'Hitam', value: '#1e293b' },
  { name: 'Biru Metro', value: '#0284c7' },
  { name: 'Hijau Daun', value: '#10b981' },
  { name: 'Merah Coral', value: '#ef4444' },
  { name: 'Kuning Emas', value: '#f59e0b' },
  { name: 'Ungu Edukasi', value: '#8b5cf6' },
  { name: 'Putih Kapur', value: '#ffffff' },
  { name: 'Stabilo Neon', value: '#facc15' }
];

const STROKE_WIDTHS = [
  { label: 'Tipis', value: 2 },
  { label: 'Sedang', value: 5 },
  { label: 'Tebal', value: 10 },
  { label: 'Sangat Tebal', value: 18 }
];

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  currentSlide,
  currentSlideIndex,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  user,
  roomCode,
  onOpenAIForCurrentSlide,
  onOpenDrive,
  onStartQuiz,
  onElementsChange,
  syncedElements
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tools state
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#0284c7');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [backgroundTheme, setBackgroundTheme] = useState<'white' | 'blackboard' | 'grid' | 'warm'>('white');
  const [gridPattern, setGridPattern] = useState<'none' | 'math_grid' | 'dots' | 'lines'>('math_grid');

  // Touchscreen interactive board optimizations
  const [toolbarPosition, setToolbarPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [lockTouch, setLockTouch] = useState<boolean>(true);
  const [smoothLines, setSmoothLines] = useState<boolean>(true);
  const [touchTargetScale, setTouchTargetScale] = useState<boolean>(true);
  const [showTouchSettings, setShowTouchSettings] = useState<boolean>(false);

  // Drawing elements history
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Laser pointer temporary points
  const [laserPoints, setLaserPoints] = useState<{ x: number; y: number; time: number }[]>([]);

  // Text / Sticky Note input
  const [textInput, setTextInput] = useState<{ x: number; y: number; text: string; isOpen: boolean }>({
    x: 0,
    y: 0,
    text: '',
    isOpen: false
  });

  // Audio speech narration state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Synchronize incoming elements from remote peers/Firestore
  useEffect(() => {
    if (syncedElements && syncedElements.length > 0) {
      setElements(syncedElements);
    }
  }, [syncedElements]);

  // Adjust canvas size to container
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redraw();
  }, [elements, laserPoints, backgroundTheme, gridPattern, currentSlide]);

  useEffect(() => {
    updateCanvasSize();
    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCanvasSize]);

  // Draw background (Grid, blackboard, or blank)
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fill base background color
    if (backgroundTheme === 'blackboard') {
      ctx.fillStyle = '#1e2e28'; // Classic green chalkboard
    } else if (backgroundTheme === 'warm') {
      ctx.fillStyle = '#faf8f5';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(0, 0, width, height);

    // Draw Grid patterns if enabled
    if (gridPattern === 'math_grid') {
      ctx.strokeStyle = backgroundTheme === 'blackboard' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(14, 165, 233, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 24;

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    } else if (gridPattern === 'dots') {
      ctx.fillStyle = backgroundTheme === 'blackboard' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(100, 116, 139, 0.25)';
      const dotSpacing = 28;
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (gridPattern === 'lines') {
      ctx.strokeStyle = backgroundTheme === 'blackboard' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(203, 213, 225, 0.6)';
      ctx.lineWidth = 1;
      const lineSpacing = 32;
      ctx.beginPath();
      for (let y = lineSpacing; y <= height; y += lineSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }
  };

  // Main Canvas Redraw Function
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height);

    // Draw all stored elements
    elements.forEach((el) => {
      // If element is associated with a specific slide, only render on that slide
      if (el.slideIndex !== undefined && el.slideIndex !== currentSlideIndex) {
        return;
      }

      ctx.save();
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.fillColor || el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = el.opacity ?? 1;

      if (el.type === 'pen' && el.points && el.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'highlighter' && el.points && el.points.length > 1) {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = el.strokeWidth * 3.5;
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'rectangle' && el.width && el.height) {
        ctx.beginPath();
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      } else if (el.type === 'circle' && el.width && el.height) {
        ctx.beginPath();
        const rx = Math.abs(el.width / 2);
        const ry = Math.abs(el.height / 2);
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (el.type === 'triangle' && el.width && el.height) {
        ctx.beginPath();
        ctx.moveTo(el.x + el.width / 2, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.lineTo(el.x, el.y + el.height);
        ctx.closePath();
        ctx.stroke();
      } else if (el.type === 'arrow' && el.width !== undefined && el.height !== undefined) {
        const fromX = el.x;
        const fromY = el.y;
        const toX = el.x + el.width;
        const toY = el.y + el.height;
        const headlen = 16;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (el.type === 'line' && el.width !== undefined && el.height !== undefined) {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.stroke();
      } else if (el.type === 'text' && el.text) {
        ctx.font = `${el.fontSize || 20}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = el.color;
        ctx.fillText(el.text, el.x, el.y);
      } else if (el.type === 'sticky') {
        // Render sticky note box
        const noteWidth = el.width || 180;
        const noteHeight = el.height || 140;

        ctx.fillStyle = '#fef08a'; // Soft yellow note
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, noteWidth, noteHeight, 8);
        ctx.fill();

        // Top decorative bar
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, noteWidth, 14, [8, 8, 0, 0]);
        ctx.fill();

        // Note content text
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#1e293b';
        const lines = (el.text || '').split('\n');
        lines.forEach((line, idx) => {
          ctx.fillText(line, el.x + 10, el.y + 35 + idx * 20);
        });
      }

      ctx.restore();
    });

    // Draw active laser pointer trail
    if (laserPoints.length > 1) {
      const now = Date.now();
      const validPoints = laserPoints.filter(p => now - p.time < 1200);

      ctx.save();
      for (let i = 1; i < validPoints.length; i++) {
        const p1 = validPoints[i - 1];
        const p2 = validPoints[i];
        const age = (now - p2.time) / 1200; // 0 to 1
        const alpha = Math.max(0, 1 - age);

        ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.lineWidth = 6 * (1 - age);
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [elements, laserPoints, backgroundTheme, gridPattern, currentSlideIndex]);

  // Laser animation loop
  useEffect(() => {
    if (laserPoints.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const filtered = laserPoints.filter(p => now - p.time < 1200);
      setLaserPoints(filtered);
      redraw();
    }, 40);
    return () => clearInterval(interval);
  }, [laserPoints, redraw]);

  // Mouse & Touch Event Handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (lockTouch && e.cancelable) {
      e.preventDefault();
    }
    const pt = getCoordinates(e);
    if (!pt) return;

    if (activeTool === 'text') {
      setTextInput({
        x: pt.x,
        y: pt.y,
        text: '',
        isOpen: true
      });
      return;
    }

    if (activeTool === 'sticky') {
      const newSticky: WhiteboardElement = {
        id: `sticky-${Date.now()}`,
        type: 'sticky',
        x: pt.x - 90,
        y: pt.y - 70,
        width: 180,
        height: 140,
        color: '#1e293b',
        strokeWidth: 1,
        text: 'Catatan Guru:\n• Poin penting kelas\n• Diskusi siswa',
        createdAt: Date.now(),
        slideIndex: currentSlideIndex
      };
      const updated = [...elements, newSticky];
      setElements(updated);
      onElementsChange?.(updated);
      return;
    }

    if (activeTool === 'laser') {
      setLaserPoints([{ x: pt.x, y: pt.y, time: Date.now() }]);
      setIsDrawing(true);
      return;
    }

    setIsDrawing(true);
    setStartPoint(pt);
    setCurrentPoints([pt]);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (lockTouch && e.cancelable) {
      e.preventDefault();
    }
    const pt = getCoordinates(e);
    if (!pt) return;

    if (activeTool === 'laser' && isDrawing) {
      setLaserPoints(prev => [...prev.slice(-30), { x: pt.x, y: pt.y, time: Date.now() }]);
      redraw();
      return;
    }

    if (!isDrawing) return;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentPoints(prev => [...prev, pt]);

      // Immediate preview on canvas
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && currentPoints.length > 0) {
        ctx.save();
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = activeTool === 'highlighter' ? strokeWidth * 3.5 : strokeWidth;
        ctx.globalAlpha = activeTool === 'highlighter' ? 0.35 : 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const lastPt = currentPoints[currentPoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPt.x, lastPt.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.restore();
      }
    } else if (['rectangle', 'circle', 'triangle', 'arrow', 'line'].includes(activeTool) && startPoint) {
      // Shape dynamic drag preview
      redraw();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        const w = pt.x - startPoint.x;
        const h = pt.y - startPoint.y;

        if (activeTool === 'rectangle') {
          ctx.strokeRect(startPoint.x, startPoint.y, w, h);
        } else if (activeTool === 'circle') {
          ctx.beginPath();
          ctx.ellipse(startPoint.x + w / 2, startPoint.y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (activeTool === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(startPoint.x + w / 2, startPoint.y);
          ctx.lineTo(startPoint.x + w, startPoint.y + h);
          ctx.lineTo(startPoint.x, startPoint.y + h);
          ctx.closePath();
          ctx.stroke();
        } else if (activeTool === 'arrow' || activeTool === 'line') {
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    } else if (activeTool === 'eraser') {
      // Erase elements near point
      const threshold = 18;
      const remaining = elements.filter(el => {
        if (el.points) {
          return !el.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < threshold);
        }
        return !(Math.abs(el.x - pt.x) < threshold && Math.abs(el.y - pt.y) < threshold);
      });

      if (remaining.length !== elements.length) {
        setElements(remaining);
        onElementsChange?.(remaining);
      }
    }
  };

  const smoothPoints = (pts: Point[]): Point[] => {
    if (pts.length < 3) return pts;
    const smoothed: Point[] = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      smoothed.push({
        x: (pts[i - 1].x + pts[i].x + pts[i + 1].x) / 3,
        y: (pts[i - 1].y + pts[i].y + pts[i + 1].y) / 3
      });
    }
    smoothed.push(pts[pts.length - 1]);
    return smoothed;
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const pt = getCoordinates(e) || currentPoints[currentPoints.length - 1];
    if (!pt) return;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      if (currentPoints.length > 1) {
        const finalPoints = smoothLines ? smoothPoints(currentPoints) : currentPoints;
        const newEl: WhiteboardElement = {
          id: `stroke-${Date.now()}`,
          type: activeTool,
          points: finalPoints,
          x: finalPoints[0].x,
          y: finalPoints[0].y,
          color: selectedColor,
          strokeWidth,
          opacity: activeTool === 'highlighter' ? 0.35 : 1,
          createdAt: Date.now(),
          slideIndex: currentSlideIndex
        };
        const updated = [...elements, newEl];
        setElements(updated);
        setRedoStack([]);
        onElementsChange?.(updated);
      }
    } else if (['rectangle', 'circle', 'triangle', 'arrow', 'line'].includes(activeTool) && startPoint) {
      const w = pt.x - startPoint.x;
      const h = pt.y - startPoint.y;

      if (Math.abs(w) > 4 || Math.abs(h) > 4) {
        const newEl: WhiteboardElement = {
          id: `shape-${Date.now()}`,
          type: activeTool,
          x: startPoint.x,
          y: startPoint.y,
          width: w,
          height: h,
          color: selectedColor,
          strokeWidth,
          createdAt: Date.now(),
          slideIndex: currentSlideIndex
        };
        const updated = [...elements, newEl];
        setElements(updated);
        setRedoStack([]);
        onElementsChange?.(updated);
      }
    }

    setCurrentPoints([]);
    setStartPoint(null);
    redraw();
  };

  // Undo / Redo
  const handleUndo = () => {
    if (elements.length === 0) return;
    const last = elements[elements.length - 1];
    setRedoStack(prev => [...prev, [last]]);
    const updated = elements.slice(0, -1);
    setElements(updated);
    onElementsChange?.(updated);
    redraw();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const toRestore = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    const updated = [...elements, ...toRestore];
    setElements(updated);
    onElementsChange?.(updated);
    redraw();
  };

  // Clear all annotations on the board
  const handleClear = () => {
    if (window.confirm('Bersihkan seluruh coretan pada papan tulis ini?')) {
      setElements([]);
      onElementsChange?.([]);
      redraw();
    }
  };

  // Export board snapshot
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `papan-tulis-bgtk-metro-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Text confirmation
  const handleConfirmText = () => {
    if (textInput.text.trim()) {
      const newEl: WhiteboardElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        x: textInput.x,
        y: textInput.y,
        color: selectedColor,
        strokeWidth: 1,
        text: textInput.text,
        fontSize: 22,
        createdAt: Date.now(),
        slideIndex: currentSlideIndex
      };
      const updated = [...elements, newEl];
      setElements(updated);
      onElementsChange?.(updated);
    }
    setTextInput({ x: 0, y: 0, text: '', isOpen: false });
    redraw();
  };

  // Read slide aloud (TTS)
  const handleToggleNarrate = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (currentSlide) {
      const contentToSpeak = `${currentSlide.title}. ${currentSlide.mainContent}. ${
        currentSlide.bulletPoints?.join('. ') || ''
      }`;
      setIsSpeaking(true);
      speakText(contentToSpeak, () => setIsSpeaking(false));
    }
  };

  const isVertical = toolbarPosition === 'left' || toolbarPosition === 'right';
  
  const toolbarClass = toolbarPosition === 'top'
    ? 'absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-1.5 flex-wrap max-w-[95vw]'
    : toolbarPosition === 'bottom'
    ? 'absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-1.5 flex-wrap max-w-[95vw]'
    : toolbarPosition === 'left'
    ? 'absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-slate-900/95 backdrop-blur-md text-white px-2.5 py-4 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col items-center gap-2 max-h-[80vh] overflow-y-auto'
    : 'absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-slate-900/95 backdrop-blur-md text-white px-2.5 py-4 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col items-center gap-2 max-h-[80vh] overflow-y-auto';

  const groupClass = isVertical 
    ? 'flex flex-col items-center gap-1 border-b border-slate-700/60 pb-2 w-full'
    : 'flex items-center gap-1 border-r border-slate-700/80 pr-2';

  const btnClass = (tool: ToolType, activeBg: string) => `
    rounded-xl transition-all flex items-center justify-center
    ${touchTargetScale ? 'p-2.5 min-w-[42px] min-h-[42px]' : 'p-2 min-w-[34px] min-h-[34px]'}
    ${activeTool === tool ? `${activeBg} text-white shadow-md` : 'text-slate-300 hover:bg-slate-800'}
  `;

  const actionBtnClass = `
    rounded-xl text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center
    ${touchTargetScale ? 'p-2.5 min-w-[42px] min-h-[42px]' : 'p-2 min-w-[34px] min-h-[34px]'}
  `;

  const iconSize = touchTargetScale ? 'w-5 h-5' : 'w-4 h-4';
  const colorSize = touchTargetScale ? 'w-7.5 h-7.5' : 'w-5.5 h-5.5';

  return (
    <div id="whiteboard-container" className="relative flex-1 w-full h-full flex flex-col overflow-hidden bg-slate-100 select-none">
      {/* Positional Adaptive Floating Toolbar */}
      <div id="whiteboard-toolbar" className={toolbarClass}>
        
        {/* Drawing Tools Group */}
        <div className={groupClass}>
          <button
            id="tool-pen"
            onClick={() => setActiveTool('pen')}
            className={btnClass('pen', 'bg-sky-600')}
            title="Pena Coretan Interaktif"
          >
            <Pencil className={iconSize} />
          </button>

          <button
            id="tool-highlighter"
            onClick={() => setActiveTool('highlighter')}
            className={btnClass('highlighter', 'bg-amber-500')}
            title="Stabilo / Highlighter"
          >
            <Highlighter className={iconSize} />
          </button>

          <button
            id="tool-eraser"
            onClick={() => setActiveTool('eraser')}
            className={btnClass('eraser', 'bg-rose-600')}
            title="Penghapus Coretan"
          >
            <Eraser className={iconSize} />
          </button>

          <button
            id="tool-laser"
            onClick={() => setActiveTool('laser')}
            className={btnClass('laser', 'bg-rose-500 animate-pulse')}
            title="Laser Pointer Presentasi (Trail otomatis pudar)"
          >
            <Flame className={`${iconSize} text-rose-400`} />
          </button>
        </div>

        {/* Geometric Shapes Group */}
        <div className={groupClass}>
          <button
            id="tool-rectangle"
            onClick={() => setActiveTool('rectangle')}
            className={btnClass('rectangle', 'bg-sky-600')}
            title="Kotak / Persegi"
          >
            <Square className={iconSize} />
          </button>

          <button
            id="tool-circle"
            onClick={() => setActiveTool('circle')}
            className={btnClass('circle', 'bg-sky-600')}
            title="Lingkaran / Elips"
          >
            <Circle className={iconSize} />
          </button>

          <button
            id="tool-triangle"
            onClick={() => setActiveTool('triangle')}
            className={btnClass('triangle', 'bg-sky-600')}
            title="Segitiga Siku / Sama Sisi"
          >
            <Triangle className={iconSize} />
          </button>

          <button
            id="tool-arrow"
            onClick={() => setActiveTool('arrow')}
            className={btnClass('arrow', 'bg-sky-600')}
            title="Panah Penunjuk Alur"
          >
            <ArrowRight className={iconSize} />
          </button>

          <button
            id="tool-line"
            onClick={() => setActiveTool('line')}
            className={btnClass('line', 'bg-sky-600')}
            title="Garis Lurus"
          >
            <Minus className={iconSize} />
          </button>
        </div>

        {/* Text & Sticky Notes */}
        <div className={groupClass}>
          <button
            id="tool-text"
            onClick={() => setActiveTool('text')}
            className={btnClass('text', 'bg-sky-600')}
            title="Teks Ketik di Papan"
          >
            <Type className={iconSize} />
          </button>

          <button
            id="tool-sticky"
            onClick={() => setActiveTool('sticky')}
            className={btnClass('sticky', 'bg-amber-500')}
            title="Kertas Tempel / Sticky Note Catatan"
          >
            <StickyNote className={`${iconSize} text-amber-300`} />
          </button>
        </div>

        {/* Dynamic Color Palette Grid / Row */}
        <div className={`${isVertical ? 'grid grid-cols-2 gap-1 pb-2 border-b border-slate-700/60 w-full justify-items-center' : 'flex items-center gap-1 border-r border-slate-700/80 pr-2'}`}>
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedColor(c.value)}
              className="rounded-full transition-all border border-slate-600 hover:scale-110 flex-shrink-0"
              style={{ 
                backgroundColor: c.value,
                width: colorSize,
                height: colorSize,
                boxShadow: selectedColor === c.value ? '0 0 0 2px rgba(14, 165, 233, 0.4)' : 'none',
                transform: selectedColor === c.value ? 'scale(1.15)' : 'none',
                borderColor: selectedColor === c.value ? '#ffffff' : '#475569'
              }}
              title={c.name}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className={`${isVertical ? 'flex flex-col gap-1 py-1 border-b border-slate-700/60 w-full items-center' : 'flex items-center gap-1 border-r border-slate-700/80 pr-2'}`}>
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw.value}
              onClick={() => setStrokeWidth(sw.value)}
              className={`px-2 py-1 text-[10px] rounded-lg font-bold transition-colors ${
                strokeWidth === sw.value ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sw.label.replace('Sangat ', 'S. ')}
            </button>
          ))}
        </div>

        {/* Grid & Background Options */}
        <div className={groupClass}>
          <button
            id="btn-switch-bg-theme"
            onClick={() => {
              const themes: ('white' | 'blackboard' | 'warm')[] = ['white', 'blackboard', 'warm'];
              const nextIdx = (themes.indexOf(backgroundTheme as any) + 1) % themes.length;
              setBackgroundTheme(themes[nextIdx]);
            }}
            className="px-1.5 py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
            title="Ganti Tema Papan"
          >
            {backgroundTheme === 'white' ? 'Putih' : backgroundTheme === 'blackboard' ? 'Hijau' : 'Warm'}
          </button>

          <button
            id="btn-switch-grid"
            onClick={() => {
              const patterns: ('none' | 'math_grid' | 'dots' | 'lines')[] = ['math_grid', 'dots', 'lines', 'none'];
              const next = patterns[(patterns.indexOf(gridPattern) + 1) % patterns.length];
              setGridPattern(next);
            }}
            className={actionBtnClass}
            title="Pola Garis / Grid Matematika"
          >
            <Grid className={iconSize} />
          </button>
        </div>

        {/* Action Buttons: Undo, Redo, Clear, Export */}
        <div className="flex items-center gap-0.5">
          <button
            id="btn-undo"
            onClick={handleUndo}
            disabled={elements.length === 0}
            className={actionBtnClass}
            style={{ opacity: elements.length === 0 ? 0.35 : 1 }}
            title="Urungkan (Undo)"
          >
            <RotateCcw className={iconSize} />
          </button>

          <button
            id="btn-redo"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={actionBtnClass}
            style={{ opacity: redoStack.length === 0 ? 0.35 : 1 }}
            title="Ulangi (Redo)"
          >
            <RotateCw className={iconSize} />
          </button>

          <button
            id="btn-clear-board"
            onClick={handleClear}
            className={`${actionBtnClass} text-rose-400 hover:bg-rose-900/40`}
            title="Hapus Semua Coretan"
          >
            <Trash2 className={iconSize} />
          </button>

          <button
            id="btn-export-png"
            onClick={handleExportPNG}
            className={`${actionBtnClass} text-emerald-400 hover:bg-emerald-900/40`}
            title="Simpan Tangkapan Papan (PNG)"
          >
            <Download className={iconSize} />
          </button>
          
          {/* Quick Access Touch Optimization Trigger */}
          <button
            onClick={() => setShowTouchSettings(!showTouchSettings)}
            className={`${actionBtnClass} ${showTouchSettings ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-900/30'}`}
            title="Pengaturan Layar Sentuh Smartboard"
          >
            <Settings className={iconSize} />
          </button>
        </div>
      </div>

      {/* Touch Screen Optimizations Overlay Settings Panel */}
      {showTouchSettings && (
        <div 
          id="touch-optimizer-panel"
          className="absolute z-30 bg-slate-900/95 border border-slate-700/80 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-3 w-72 max-w-[90vw]"
          style={{
            left: toolbarPosition === 'left' ? '90px' : '24px',
            right: toolbarPosition === 'right' ? '90px' : 'auto',
            bottom: toolbarPosition === 'bottom' ? '90px' : '80px',
            top: toolbarPosition === 'top' ? '80px' : 'auto'
          }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              Optimalisasi Layar Sentuh
            </span>
            <button 
              onClick={() => setShowTouchSettings(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold px-1"
            >
              Tutup
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Toggle 1: Lock Scrolling */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Kunci Geser Layar</p>
                <p className="text-[10px] text-slate-400">Cegah halaman bergeser saat menulis</p>
              </div>
              <button
                onClick={() => setLockTouch(!lockTouch)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  lockTouch ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {lockTouch ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {/* Toggle 2: Smooth Lines */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Penghalusan Goresan</p>
                <p className="text-[10px] text-slate-400">Interpolasi kurva agar tulisan mulus</p>
              </div>
              <button
                onClick={() => setSmoothLines(!smoothLines)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  smoothLines ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {smoothLines ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {/* Toggle 3: Large Touch Targets */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Tombol Lebih Besar</p>
                <p className="text-[10px] text-slate-400">Perbesar area sentuh tombol menu</p>
              </div>
              <button
                onClick={() => setTouchTargetScale(!touchTargetScale)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  touchTargetScale ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {touchTargetScale ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {/* Toggle 4: Toolbar Position Selector */}
            <div className="pt-2 border-t border-slate-800">
              <p className="font-bold mb-1.5">Posisi Bilah Menu (Dock):</p>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setToolbarPosition(pos)}
                    className={`py-1 rounded text-center transition-all capitalize ${
                      toolbarPosition === pos ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {pos === 'top' ? 'Atas' : pos === 'bottom' ? 'Bawah' : pos === 'left' ? 'Kiri' : 'Kanan'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas & Slide Overlay Area */}
      <div 
        ref={containerRef} 
        className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Under-Canvas Slide Presentation Layer */}
        {currentSlide && (
          <div 
            id="slide-underlay"
            className="absolute inset-0 pointer-events-none p-6 md:p-12 flex flex-col justify-start max-w-5xl mx-auto z-0 select-none overflow-y-auto"
          >
            <div className={`p-6 md:p-8 rounded-2xl border shadow-sm transition-all ${
              backgroundTheme === 'blackboard' 
                ? 'bg-slate-900/60 border-slate-700/60 text-slate-100' 
                : 'bg-white/85 backdrop-blur-sm border-slate-200 text-slate-900'
            }`}>
              {/* Slide Header */}
              <div className="flex items-center justify-between gap-4 border-b pb-3 mb-4 border-slate-200/50">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600 text-white">
                    Slide {currentSlide.slideNumber} / {totalSlides}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                    {currentSlide.type}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  BGTK Kota Metro Smart Whiteboard
                </div>
              </div>

              {/* Slide Title */}
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                {currentSlide.title}
              </h2>

              {/* Slide Content */}
              <p className="text-base md:text-lg leading-relaxed mb-6 font-normal">
                {currentSlide.mainContent}
              </p>

              {/* Bullet Points */}
              {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
                <ul className="space-y-2.5 mb-6 pl-2">
                  {currentSlide.bulletPoints.map((bp, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm md:text-base">
                      <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 flex-shrink-0" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Quick Check Question / Prompts for Students */}
              {currentSlide.quickCheckQuestion && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Pertanyaan Pemantik Kelas:
                  </p>
                  <p className="text-sm font-semibold">{currentSlide.quickCheckQuestion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active HTML5 Canvas Layer for Real-Time Drawing */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-10"
        />

        {/* Text Input Popup when user clicks with Text Tool */}
        {textInput.isOpen && (
          <div
            className="absolute z-30 bg-white p-2 rounded-xl shadow-2xl border border-sky-400 flex items-center gap-2"
            style={{ left: Math.min(textInput.x, window.innerWidth - 320), top: textInput.y }}
          >
            <input
              type="text"
              value={textInput.text}
              onChange={(e) => setTextInput(prev => ({ ...prev, text: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmText();
                if (e.key === 'Escape') setTextInput({ x: 0, y: 0, text: '', isOpen: false });
              }}
              placeholder="Tuliskan catatan di sini..."
              autoFocus
              className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-64 text-slate-900"
            />
            <button
              onClick={handleConfirmText}
              className="px-3 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-500"
            >
              Simpan
            </button>
          </div>
        )}
      </div>

      {/* Bottom Dock: Slide Navigation, Voice TTS, AI Assistant Trigger, & Quiz Launch */}
      {currentSlide && (
        <footer 
          id="slide-dock"
          className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-white px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 z-20"
        >
          {/* Slide Paging */}
          <div className="flex items-center gap-2">
            <button
              id="btn-prev-slide"
              onClick={onPrevSlide}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 border border-slate-700">
              Slide {currentSlideIndex + 1} / {totalSlides}
            </span>

            <button
              id="btn-next-slide"
              onClick={onNextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Slide Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="text-xs text-slate-300 font-medium truncate max-w-[200px] md:max-w-md hidden sm:inline">
              {currentSlide.title}
            </span>
          </div>

          {/* Slide Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Voice Narrator (TTS) */}
            <button
              id="btn-tts-narrate"
              onClick={handleToggleNarrate}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSpeaking 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Bacakan materi slide ini dengan suara AI"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
              <span>{isSpeaking ? 'Hentikan Suara' : 'Bacakan Slide'}</span>
            </button>

            {/* Quick AI Explainer for this slide */}
            <button
              id="btn-ai-slide-help"
              onClick={() => onOpenAIForCurrentSlide(currentSlide)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-medium transition-all"
              title="Minta AI jelaskan materi slide ini lebih dalam"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Kupas Materi</span>
            </button>

            {/* Start Live Interactive Quiz for this topic */}
            <button
              id="btn-start-slide-quiz"
              onClick={onStartQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              title="Buka Kuis Interaktif untuk Siswa"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Mulai Kuis Kelas</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
