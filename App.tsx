
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  ChevronLeft, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  RefreshCw,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  Sun,
  MousePointer2,
  Compass,
  MoveHorizontal,
  Maximize2,
  PenTool,
  Scaling,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Wand2,
  History,
  AlertCircle,
  CheckSquare,
  Square,
  Stars,
  Lightbulb,
  Palette,
  Tag,
  DownloadCloud,
  Settings,
  BrainCircuit,
  Focus,
  Camera
} from 'lucide-react';
import { AppState, StylePreset, GeneratedVariation, ShadowConfig, ImageQuality, ShadowDirection } from './types';
import { STYLE_PRESETS, MIN_VARIATIONS, MAX_VARIATIONS, MAGIC_FOCUS_AREAS } from './constants';
import { generateBackgroundVariation, editImageWithGemini, analyzeClothingItem } from './services/geminiService';
import { Button } from './components/ui/Button';
import { Tooltip } from './components/ui/Tooltip';

// External libraries loaded via script tags in index.html
declare const JSZip: any;
declare const saveAs: any;

interface ClothingAnalysis {
  clothingType: string;
  dominantColor: string;
  recommendedIds: string[];
  advice: string;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOADING);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [variationCount, setVariationCount] = useState<number>(3);
  const [padding, setPadding] = useState<number>(10);
  const [quality, setQuality] = useState<ImageQuality>('standard');
  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [matchSelection, setMatchSelection] = useState(false);
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [magicFocusArea, setMagicFocusArea] = useState<string | null>(null);
  const [autoLighting, setAutoLighting] = useState(true);
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [shadowConfig, setShadowConfig] = useState<ShadowConfig>({
    intensity: 20,
    softness: 70,
    direction: 'bottom',
    lightAngle: 180,
    elevation: 45,
    shadowDistance: 15,
    spread: 30
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  // PWA Install Prompt Listener
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    if (selectedStyles.length > 0 && !isMagicMode) {
      const lastSelectedId = selectedStyles[selectedStyles.length - 1];
      const selectedStyle = STYLE_PRESETS.find(s => s.id === lastSelectedId);
      if (selectedStyle && !selectedStyle.isCustom) {
        setShadowConfig(selectedStyle.defaultShadow);
      }
      
      if (matchSelection) {
        setVariationCount(Math.min(selectedStyles.length, MAX_VARIATIONS));
      }
    } else if (matchSelection && !isMagicMode) {
      setVariationCount(MIN_VARIATIONS);
    }
  }, [selectedStyles, matchSelection, isMagicMode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = event.target?.result as string;
        setOriginalImage(img);
        setHistory([img]);
        setAppState(AppState.CONFIGURING);
        
        // Start AI Analysis
        setIsAnalyzing(true);
        const result = await analyzeClothingItem(img);
        setAnalysis(result);
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
      // Use a brief timeout to reset attribute so standard upload still works
      setTimeout(() => {
        fileInputRef.current?.removeAttribute('capture');
      }, 500);
    }
  };

  const handleApplyEdit = async () => {
    if (!editPrompt.trim() || !originalImage) return;
    setIsEditing(true);
    setEditError(null);
    try {
      const result = await editImageWithGemini(originalImage, editPrompt);
      setOriginalImage(result);
      setHistory(prev => [...prev, result]);
      setEditPrompt('');
    } catch (error: any) {
      setEditError(error.message);
    } finally {
      setIsEditing(false);
    }
  };

  const undoEdit = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setOriginalImage(newHistory[newHistory.length - 1]);
      setHistory(newHistory);
    }
  };

  const toggleStyle = (styleId: string) => {
    if (isMagicMode) return;
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId) 
        : [...prev, styleId]
    );
  };

  const selectAllStyles = () => {
    if (isMagicMode) return;
    setSelectedStyles(STYLE_PRESETS.map(s => s.id));
  };

  const deselectAllStyles = () => {
    if (isMagicMode) return;
    setSelectedStyles([]);
  };

  const handleDialInteract = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dialRef.current || autoLighting) return;
    
    if (e.cancelable) e.preventDefault();

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; 
    setShadowConfig(prev => ({ ...prev, lightAngle: Math.round(angle) }));
  };

  const handleStartGeneration = async () => {
    if (!originalImage) return;
    if (!isMagicMode && selectedStyles.length === 0) return;

    setAppState(AppState.GENERATING);
    setIsProcessing(true);
    
    const count = isMagicMode ? variationCount : (matchSelection ? selectedStyles.length : variationCount);
    const newVariations: GeneratedVariation[] = [];
    for (let i = 0; i < count; i++) {
      newVariations.push({
        id: Math.random().toString(36).substring(7),
        url: '',
        styleName: isMagicMode ? 'إبداع ذكي' : (STYLE_PRESETS.find(s => s.id === selectedStyles[i % selectedStyles.length])?.name || 'نسخة'),
        status: 'loading'
      });
    }
    setVariations(newVariations);

    const focusAreaPrompt = magicFocusArea 
      ? MAGIC_FOCUS_AREAS.find(f => f.id === magicFocusArea)?.prompt 
      : "unique, high-end commercial studio background";

    const magicPrompt = `Create a ${focusAreaPrompt} background that perfectly complements this specific clothing item's style, color, and fabric. Use your creative judgment to design an environment that makes the product look spectacular. Ensure the lighting is professional and realistic.`;

    for (let i = 0; i < count; i++) {
      let promptToUse = '';
      if (isMagicMode) {
        promptToUse = magicPrompt;
      } else {
        const currentStyleId = selectedStyles[i % selectedStyles.length];
        const currentStyle = STYLE_PRESETS.find(s => s.id === currentStyleId)!;
        promptToUse = currentStyle.isCustom ? customPrompt : currentStyle.prompt;
      }
      
      try {
        const resultUrl = await generateBackgroundVariation(originalImage, promptToUse, shadowConfig, padding, quality, autoLighting);
        setVariations(prev => prev.map((v, idx) => 
          idx === i ? { ...v, url: resultUrl, status: 'completed' as const } : v
        ));
      } catch (error: any) {
        setVariations(prev => prev.map((v, idx) => 
          idx === i ? { ...v, status: 'error' as const, errorMessage: error.message } : v
        ));
      }
    }
    
    setIsProcessing(false);
    setAppState(AppState.RESULTS);
  };

  const clearVariations = () => {
    setVariations([]);
    setAppState(AppState.CONFIGURING);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setHistory([]);
    setSelectedStyles([]);
    setCustomPrompt('');
    setEditPrompt('');
    setVariationCount(3);
    setPadding(10);
    setQuality('standard');
    setVariations([]);
    setMatchSelection(false);
    setIsMagicMode(false);
    setMagicFocusArea(null);
    setAutoLighting(true);
    setAnalysis(null);
    setAppState(AppState.UPLOADING);
    setShadowConfig({ intensity: 20, softness: 70, direction: 'bottom', lightAngle: 180, elevation: 45, shadowDistance: 15, spread: 30 });
  };

  const downloadSingle = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `variation-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder("background-variations");
    variations.forEach((v, idx) => {
      if (v.status === 'completed') {
        const base64Data = v.url.split(',')[1];
        folder.file(`variation-${v.styleName}-${idx + 1}.png`, base64Data, { base64: true });
      }
    });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "product-variations.zip");
  };

  const applySuggestedStyle = (id: string) => {
    if (!selectedStyles.includes(id)) {
      setSelectedStyles(prev => [...prev, id]);
    }
  };

  const getQualityValue = () => {
    if (quality === 'standard') return 0;
    if (quality === 'high') return 1;
    return 2;
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (val === 0) setQuality('standard');
    else if (val === 1) setQuality('high');
    else setQuality('ultra');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-200 shadow-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg sm:text-xl tracking-tight text-slate-800">استوديو الخلفيات</h1>
          </div>
          <div className="flex items-center gap-2">
            {deferredPrompt && (
              <button onClick={installApp} className="bg-indigo-50 text-indigo-600 p-2 rounded-full hover:bg-indigo-100 transition-colors">
                <DownloadCloud className="w-5 h-5" />
              </button>
            )}
            {appState !== AppState.UPLOADING && (
              <button onClick={resetAll} className="text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1 text-sm font-medium px-2 py-1">
                <Trash2 className="w-4 h-4" /> <span className="hidden xs:inline">إعادة البدء</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Steps */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 no-scrollbar touch-pan-x">
          <Step id={1} label="الرفع" active={appState === AppState.UPLOADING} done={appState !== AppState.UPLOADING} />
          <ChevronLeft className="w-3 h-3 text-slate-300 flex-shrink-0" />
          <Step id={2} label="التهيئة" active={appState === AppState.CONFIGURING} done={appState === AppState.GENERATING || appState === AppState.RESULTS} />
          <ChevronLeft className="w-3 h-3 text-slate-300 flex-shrink-0" />
          <Step id={3} label="التوليد" active={appState === AppState.GENERATING} done={appState === AppState.RESULTS} />
          <ChevronLeft className="w-3 h-3 text-slate-300 flex-shrink-0" />
          <Step id={4} label="المراجعة" active={appState === AppState.RESULTS} done={false} />
        </div>

        {appState === AppState.UPLOADING && (
          <div className="max-w-3xl mx-auto mt-4 sm:mt-10">
            <div 
              className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center hover:border-indigo-400 transition-all cursor-pointer shadow-sm duration-150" 
            >
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              <div className="bg-indigo-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-indigo-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ارفع صورة منتجك</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">ارفع صورة قطعة ملابس واضحة أو التقط صورة حية، وسيقوم الذكاء الاصطناعي بتوليد خلفيات احترافية لك.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-sm mx-auto">
                <Button variant="primary" onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-2xl flex items-center gap-2 justify-center shadow-lg shadow-indigo-100">
                  <Upload className="w-5 h-5" />
                  <span>اختر ملفاً</span>
                </Button>
                <Button variant="outline" onClick={triggerCapture} className="w-full py-4 rounded-2xl flex items-center gap-2 justify-center border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Camera className="w-5 h-5" />
                  <span>التقاط صورة</span>
                </Button>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard icon={<Sparkles />} title="خلفيات ذكية" description="تحليل تلقائي للمنتج لاقتراح أفضل المشاهد." />
              <FeatureCard icon={<Sun />} title="إضاءة واقعية" description="مطابقة الظلال والإضاءة مع البيئة الجديدة." />
              <FeatureCard icon={<Maximize2 />} title="جودة استوديو" description="صور عالية الدقة جاهزة للعرض التجاري." />
            </div>
          </div>
        )}

        {appState === AppState.CONFIGURING && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-6">
              {/* Preview */}
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-slate-700">معاينة الأصل</span>
                  {history.length > 1 && (
                    <button onClick={undoEdit} className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                      <History className="w-3 h-3" /> تراجع
                    </button>
                  )}
                </div>
                <div className="p-4 aspect-square flex items-center justify-center bg-slate-100 relative">
                  <img src={originalImage!} alt="Preview" className="max-h-full max-w-full object-contain shadow-lg rounded-md" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                      <span className="text-xs font-bold text-indigo-600">جاري التعديل...</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Analysis Result */}
              <section className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-800">تحليل الذكاء الاصطناعي</h3>
                </div>
                {isAnalyzing ? (
                  <div className="flex flex-col items-center py-4 gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span className="text-[10px] text-slate-400 font-bold">جاري تحليل المنتج...</span>
                  </div>
                ) : analysis ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-600">{analysis.clothingType}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                        <Palette className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-600">{analysis.dominantColor}</span>
                      </div>
                    </div>
                    <div className="bg-indigo-50/30 p-3 rounded-xl border border-indigo-50">
                      <p className="text-[10px] text-indigo-800 font-medium leading-relaxed">{analysis.advice}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400">أنماط مقترحة:</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.recommendedIds.map(id => {
                          const style = STYLE_PRESETS.find(s => s.id === id);
                          if (!style) return null;
                          const isSelected = selectedStyles.includes(id);
                          return (
                            <button key={id} onClick={() => applySuggestedStyle(id)} className={`px-3 py-2 rounded-full text-[10px] font-bold transition-all border ${isSelected ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-600 border-indigo-200'}`}>{style.name}</button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>

              {/* Smart Editor */}
              <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-800">تعديلات سحرية</h3>
                </div>
                <textarea 
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="مثال: اجعل الألوان أكثر حيوية..."
                  className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none bg-slate-50"
                />
                <Button variant="secondary" className="w-full text-xs py-3 rounded-xl" isLoading={isEditing} disabled={!editPrompt.trim()} onClick={handleApplyEdit}>تطبيق التعديل</Button>
              </section>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {/* Style Selection */}
              <section className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm transition-colors duration-300 ${isMagicMode ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800">أنماط الخلفية</h3>
                    <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer border transition-all ${isMagicMode ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105' : 'bg-slate-50 text-slate-500'}`} onClick={() => setIsMagicMode(!isMagicMode)}>
                      <Stars className="w-3 h-3" />
                      <span className="text-[10px] font-bold">الوضع السحري</span>
                    </div>
                  </div>
                  {!isMagicMode && (
                    <div className="flex gap-2">
                      <button onClick={selectAllStyles} className="text-[10px] font-bold px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full active:bg-indigo-100">الكل</button>
                      <button onClick={deselectAllStyles} className="text-[10px] font-bold px-4 py-2 bg-slate-50 text-slate-500 rounded-full active:bg-slate-100">إلغاء</button>
                    </div>
                  )}
                </div>
                {!isMagicMode && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                    {STYLE_PRESETS.map((style) => (
                      <div key={style.id} onClick={() => toggleStyle(style.id)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-95 ${selectedStyles.includes(style.id) ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-800">{style.name}</span>
                          {selectedStyles.includes(style.id) && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{style.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                {isMagicMode && (
                  <div className="p-8 bg-white rounded-2xl border border-amber-100 shadow-inner space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Stars className="w-12 h-12 text-amber-500 animate-pulse" />
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-amber-800">الرؤية الإبداعية للذكاء الاصطناعي</h4>
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                          {isAnalyzing ? "جاري استكشاف أفضل الاتجاهات الفنية لمنتجك..." : "سيقوم الذكاء الاصطناعي بتصميم خلفيات مبتكرة تناسب منتجك تلقائياً."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Focus className="w-4 h-4" />
                        <h5 className="text-[11px] font-bold">وجّه الإبداع (اختياري):</h5>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {MAGIC_FOCUS_AREAS.map(area => (
                          <button 
                            key={area.id} 
                            onClick={() => setMagicFocusArea(magicFocusArea === area.id ? null : area.id)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${magicFocusArea === area.id ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}
                          >
                            {area.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {analysis && (
                      <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100/50 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2 border-b border-amber-100 pb-2">
                          <BrainCircuit className="w-4 h-4 text-amber-600" />
                          <span className="text-[11px] font-bold text-amber-800">لماذا اخترنا هذا الاتجاه؟</span>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs text-amber-900 leading-relaxed italic">
                            "{analysis.advice}"
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <span className="px-3 py-1 bg-amber-200/50 text-amber-800 rounded-lg text-[9px] font-bold">تناغم لوني: {analysis.dominantColor}</span>
                            <span className="px-3 py-1 bg-amber-200/50 text-amber-800 rounded-lg text-[9px] font-bold">تصنيف النمط: {analysis.clothingType}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Generation Settings */}
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Variation Count */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-slate-800 text-sm">عدد النتائج</h3>
                       <span className="text-2xl font-black text-indigo-600">{variationCount}</span>
                    </div>
                    <input type="range" min={MIN_VARIATIONS} max={MAX_VARIATIONS} value={variationCount} onChange={(e) => setVariationCount(parseInt(e.target.value))} className="w-full" />
                  </div>

                  {/* Quality Control Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-slate-800 text-sm">جودة الصورة</h3>
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                         <Trophy className="w-3.5 h-3.5" />
                         <span className="text-xs font-bold">
                           {quality === 'standard' ? 'عادية' : quality === 'high' ? 'عالية' : 'فائقة'}
                         </span>
                       </div>
                    </div>
                    <div className="relative pt-1">
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="1" 
                        value={getQualityValue()} 
                        onChange={handleQualityChange} 
                        className="w-full" 
                      />
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 px-1">
                        <span>عادية</span>
                        <span className="mr-4">عالية</span>
                        <span>فائقة</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lighting Dial Control */}
                <div className="space-y-6 pt-4 border-t border-slate-50">
                   <div className="flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                       <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                         <Settings className="w-4 h-4 text-indigo-600" />
                         إعدادات الإضاءة والظل
                       </h3>
                       <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer transition-all border ${autoLighting ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105' : 'bg-slate-50 border-slate-200 text-slate-500'}`} onClick={() => setAutoLighting(!autoLighting)}>
                          <Zap className="w-3 h-3" />
                          <span className="text-[10px] font-bold">إضاءة ذكية</span>
                       </div>
                     </div>
                     <p className="text-[10px] text-slate-500 leading-relaxed italic bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                       {autoLighting 
                        ? "سيقوم الذكاء الاصطناعي بمطابقة الإضاءة والظلال تلقائياً مع المشهد المختار." 
                        : "يمكنك التحكم يدوياً في زاوية وكثافة الإضاءة والظلال."}
                     </p>
                   </div>

                   {!autoLighting && (
                    <div className="flex flex-col md:flex-row items-center gap-12 pt-4">
                      <div ref={dialRef} className="relative w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl flex items-center justify-center touch-none" onMouseDown={handleDialInteract} onMouseMove={(e) => e.buttons === 1 && handleDialInteract(e)} onTouchStart={handleDialInteract} onTouchMove={handleDialInteract} style={{ touchAction: 'none' }}>
                        <div className="absolute inset-2 rounded-full border border-slate-100 flex items-center justify-center"><div className="w-1 h-1 bg-slate-300 rounded-full" /></div>
                        <div className="absolute w-9 h-9 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-transform duration-75" style={{ transform: `rotate(${shadowConfig.lightAngle}deg) translateY(-52px) rotate(-${shadowConfig.lightAngle}deg)` }}><Sun className="w-5 h-5 text-white" /></div>
                      </div>
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>كثافة الظل</span><span className="text-indigo-600">{shadowConfig.intensity}%</span></div>
                          <input type="range" min="0" max="100" value={shadowConfig.intensity} onChange={(e) => setShadowConfig({...shadowConfig, intensity: parseInt(e.target.value)})} className="w-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500"><span>نعومة الحواف</span><span className="text-indigo-600">{shadowConfig.softness}%</span></div>
                          <input type="range" min="0" max="100" value={shadowConfig.softness} onChange={(e) => setShadowConfig({...shadowConfig, softness: parseInt(e.target.value)})} className="w-full" />
                        </div>
                      </div>
                    </div>
                   )}
                </div>
                
                <Button variant="primary" className={`w-full py-5 text-lg font-bold rounded-2xl shadow-xl active:scale-95 transition-all ${isMagicMode ? 'bg-amber-500 border-amber-600 shadow-amber-100 hover:bg-amber-600' : 'shadow-indigo-100'}`} isLoading={isProcessing} disabled={(!isMagicMode && selectedStyles.length === 0)} onClick={handleStartGeneration}>توليد الصور الآن</Button>
              </section>
            </div>
          </div>
        )}

        {(appState === AppState.GENERATING || appState === AppState.RESULTS) && (
          <div className="space-y-6 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800">النتائج الجاهزة</h2>
              {appState === AppState.RESULTS && (
                <div className="flex gap-2">
                  <button onClick={downloadAllAsZip} className="flex-1 sm:flex-none bg-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95">
                    <Download className="w-4 h-4" /> تحميل الكل
                  </button>
                  <button onClick={clearVariations} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-50 hover:text-rose-500 active:scale-95">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {variations.map((v, idx) => (
                <div key={v.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
                  <div className="relative aspect-square bg-slate-50 flex items-center justify-center p-3">
                    {v.status === 'loading' ? (
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                        <span className="text-[10px] font-bold text-indigo-500 animate-pulse tracking-wider">جاري التوليد...</span>
                      </div>
                    ) : v.status === 'error' ? (
                      <div className="text-center p-4">
                        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <p className="text-[10px] text-rose-600 font-bold">{v.errorMessage}</p>
                      </div>
                    ) : (
                      <>
                        <img src={v.url} alt={v.styleName} className="max-h-full max-w-full object-contain rounded-lg" />
                        <div className="absolute inset-0 bg-indigo-900/40 opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => downloadSingle(v.url, v.styleName)} className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold text-xs shadow-xl active:scale-95">تحميل</button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-xs font-bold text-slate-800">{v.styleName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-[9px] text-slate-400">نسخة #{idx + 1}</p>
                        {autoLighting && v.status === 'completed' && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-bold">
                            <Zap className="w-2 h-2" /> إضاءة ذكية
                          </div>
                        )}
                      </div>
                    </div>
                    {v.status === 'completed' && (
                      <button onClick={() => downloadSingle(v.url, v.styleName)} className="p-3 sm:hidden text-indigo-600 active:bg-indigo-50 rounded-full transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Step: React.FC<{ id: number, label: string, active: boolean, done: boolean }> = ({ id, label, active, done }) => (
  <div className="flex items-center gap-2 flex-shrink-0 px-2 py-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
      {done ? <CheckCircle2 className="w-5 h-5" /> : id}
    </div>
    <span className={`text-[11px] font-bold whitespace-nowrap ${active ? 'text-indigo-600' : done ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</span>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center sm:flex-col sm:text-center gap-4 hover:shadow-md transition-shadow">
    <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">{icon}</div>
    <div>
      <h4 className="font-bold text-xs text-slate-800 sm:mb-1">{title}</h4>
      <p className="text-[10px] text-slate-500 leading-tight">{description}</p>
    </div>
  </div>
);

export default App;
