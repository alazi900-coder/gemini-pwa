
import { StylePreset } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'white',
    name: 'أبيض ناصع',
    description: 'خلفية استوديو بيضاء نظيفة وبدون فواصل.',
    prompt: 'pure white seamless studio background, high-key lighting, minimalist commercial photography style',
    tooltipText: 'الأفضل للقوائم القياسية في أمازون أو شوبيفاي. تستخدم إضاءة قوية للتخلص من الظلال المشتتة مع الحفاظ على حدود المنتج واضحة.',
    defaultShadow: { intensity: 15, softness: 80, direction: 'bottom', lightAngle: 0, elevation: 80, shadowDistance: 10, spread: 20 }
  },
  {
    id: 'beige',
    name: 'بيج دافئ',
    description: 'خلفية استوديو بيج دافئة وأنيقة.',
    prompt: 'warm beige seamless studio background, soft shadows, sophisticated neutral tones, professional fashion photography',
    tooltipText: 'تضيف شعوراً بالفخامة والتميز. مثالية للملابس الصوفية، أو القطن العضوي، أو الملابس ذات الألوان المحايدة. تخلق جمالية مريحة.',
    defaultShadow: { intensity: 25, softness: 60, direction: 'bottom-right', lightAngle: 45, elevation: 45, shadowDistance: 25, spread: 40 }
  },
  {
    id: 'gray',
    name: 'رمادي فاتح',
    description: 'خلفية استوديو رمادية فاتحة كلاسيكية.',
    prompt: 'light gray seamless studio background, professional lighting, clean minimal aesthetic',
    tooltipText: 'خيار احترافي متعدد الاستخدامات. يوفر فصلاً أفضل للملابس ذات الألوان الفاتحة أو البيضاء مقارنة بالخلفية البيضاء الصرفة.',
    defaultShadow: { intensity: 20, softness: 70, direction: 'bottom', lightAngle: 0, elevation: 60, shadowDistance: 15, spread: 30 }
  },
  {
    id: 'studio-blue',
    name: 'أزرق استوديو',
    description: 'خلفية استوديو احترافية بلمحة زرقاء خفيفة.',
    prompt: 'professional studio background with a soft, subtle blue gradient and clean lighting',
    tooltipText: 'يعطي مظهراً عصرياً وبارداً للمنتج. مناسب جداً للملابس الرياضية أو الرسمية ذات الألوان الباردة والبيضاء.',
    defaultShadow: { intensity: 20, softness: 70, direction: 'bottom', lightAngle: 0, elevation: 60, shadowDistance: 15, spread: 35 }
  },
  {
    id: 'industrial',
    name: 'كونكريت صناعي',
    description: 'خلفية خرسانية رمادية عصرية (Industrial).',
    prompt: 'industrial chic background with smooth gray concrete walls and floor, minimalist warehouse loft aesthetic, cold neutral tones',
    tooltipText: 'مثالي لملابس الشارع (Streetwear) والملابس الرياضية. يعطي طابعاً عصرياً وقوياً للمنتج.',
    defaultShadow: { intensity: 45, softness: 30, direction: 'bottom-left', lightAngle: 320, elevation: 35, shadowDistance: 35, spread: 45 }
  },
  {
    id: 'sunlight',
    name: 'ضوء النافذة',
    description: 'إضاءة طبيعية مع ظلال نوافذ ناعمة.',
    prompt: 'lifestyle studio background with soft natural sunlight streaming through a window, elegant shadow patterns on a clean off-white wall, airy and bright',
    tooltipText: 'يخلق جواً واقعياً ومنزلياً. رائع لملابس النوم، الملابس الصيفية، أو القطنيات المريحة.',
    defaultShadow: { intensity: 15, softness: 90, direction: 'bottom-right', lightAngle: 55, elevation: 40, shadowDistance: 50, spread: 70 }
  },
  {
    id: 'wall-floor',
    name: 'لوفت عصري',
    description: 'جدار رمادي مزرق مع أرضية أوف وايت.',
    prompt: 'modern minimalist studio with a light neutral blue-gray wall meeting an off-white floor, subtle corner transition, realistic architectural lighting',
    tooltipText: 'يحاكي مساحة استوديو حقيقية بعمق معماري. مثالي لملابس الشارع أو الملابس الكاجوال لإعطائها مظهراً أكثر واقعية وحضرية.',
    defaultShadow: { intensity: 40, softness: 40, direction: 'bottom-left', lightAngle: 315, elevation: 30, shadowDistance: 40, spread: 60 }
  },
  {
    id: 'marble',
    name: 'رخام فاخر',
    description: 'بلاط رخامي كبير مع عروق خفيفة.',
    prompt: 'high-end boutique background with large square marble floor tiles, subtle gray veins, low contrast, luxurious and clean',
    tooltipText: 'جمالية بوتيك فاخرة. رائعة للأزياء الراقية، الأحذية، أو الملابس الرسمية. العروق الرخامية الرقيقة تضيف نسيجاً دون تشتيت الانتباه عن المنتج.',
    defaultShadow: { intensity: 30, softness: 50, direction: 'bottom-right', lightAngle: 60, elevation: 55, shadowDistance: 30, spread: 25 }
  },
  {
    id: 'dark-wood',
    name: 'خشب داكن مصقول',
    description: 'أرضية خشبية داكنة مع انعكاسات بسيطة.',
    prompt: 'dark polished wood floor, subtle reflections, minimalist studio, professional lighting, deep tones',
    tooltipText: 'يوفر خلفية درامية وفاخرة. مثالي للمنتجات الراقية والأزياء الرسمية.',
    defaultShadow: { intensity: 40, softness: 30, direction: 'bottom', lightAngle: 15, elevation: 40, shadowDistance: 35, spread: 45 }
  },
  {
    id: 'fabric-gray',
    name: 'نسيج رمادي',
    description: 'خلفية قماشية رمادية ذات ملمس ناعم.',
    prompt: 'neutral gray textured fabric background, soft studio lighting, fine weave pattern, elegant',
    tooltipText: 'يضيف عمقاً وملمساً ناعماً للصورة دون تشتيت الانتباه. مثالي للملابس الصيفية الخفيفة.',
    defaultShadow: { intensity: 20, softness: 75, direction: 'bottom', lightAngle: 0, elevation: 65, shadowDistance: 15, spread: 50 }
  },
  {
    id: 'bohemian',
    name: 'نسيج بوهيمي',
    description: 'نسيج بوهيمي مزخرف بألوان دافئة.',
    prompt: 'bohemian style woven tapestry with intricate patterns, warm earthy tones, artistic textile background, soft natural lighting',
    tooltipText: 'يعطي طابعاً فنياً وغير تقليدي. مثالي لملابس العطلات، الإكسسوارات اليدوية، والقطع الفنية.',
    defaultShadow: { intensity: 25, softness: 60, direction: 'bottom-right', lightAngle: 45, elevation: 50, shadowDistance: 20, spread: 35 }
  },
  {
    id: 'pastel',
    name: 'باستيل ناعم',
    description: 'خلفية ملونة هادئة (مينت/وردي).',
    prompt: 'soft aesthetic studio background with muted pastel mint and peach gradients, dreamlike lighting, clean and playful',
    tooltipText: 'خيار رائع لملابس الأطفال، الإكسسوارات الملونة، أو الموضة الشبابية المرحة.',
    defaultShadow: { intensity: 12, softness: 85, direction: 'bottom', lightAngle: 0, elevation: 75, shadowDistance: 12, spread: 55 }
  },
  {
    id: 'wooden',
    name: 'أرضية خشبية',
    description: 'خلفية دافئة بأرضية من خشب البلوط.',
    prompt: 'warm interior background with light oak wood parquet flooring, clean white wall, minimalist scandinavian design, soft ambient light',
    tooltipText: 'يعطي إحساساً بالجودة والدفء. مناسب جداً للملابس الشتوية، الحقائب الجلدية، والأحذية.',
    defaultShadow: { intensity: 35, softness: 45, direction: 'bottom-right', lightAngle: 40, elevation: 50, shadowDistance: 20, spread: 30 }
  },
  {
    id: 'gradient',
    name: 'تدرج ناعم',
    description: 'تدرج لوني ناعم وبسيط.',
    prompt: 'soft minimal abstract gradient studio background, ethereal lighting, smooth color transitions',
    tooltipText: 'خيار فني معاصر. انتقالات الإضاءة الناعمة تخلق شعوراً خيالياً، مثالي لصور الأزياء الافتتاحية.',
    defaultShadow: { intensity: 10, softness: 90, direction: 'bottom', lightAngle: 0, elevation: 70, shadowDistance: 5, spread: 80 }
  },
  {
    id: 'custom',
    name: 'نمط مخصص',
    description: 'اكتب وصفك الخاص للخلفية.',
    prompt: '',
    isCustom: true,
    tooltipText: 'اكتب تفاصيل الخلفية التي تتخيلها، مثل "غابة ضبابية" أو "غرفة معيشة حديثة".',
    defaultShadow: { intensity: 30, softness: 70, direction: 'bottom', lightAngle: 15, elevation: 45, shadowDistance: 20, spread: 35 }
  }
];

export const MAGIC_FOCUS_AREAS = [
  { id: 'minimalist', name: 'بسيط (Minimalist)', prompt: 'minimalist, clean, and modern' },
  { id: 'luxury', name: 'فاخر (Luxury)', prompt: 'luxury, high-end, and elegant' },
  { id: 'streetwear', name: 'ملابس شارع (Streetwear)', prompt: 'urban, edgy, streetwear style' },
  { id: 'editorial', name: 'افتتاحي (Editorial)', prompt: 'high-fashion magazine editorial' },
  { id: 'natural', name: 'طبيعي (Natural)', prompt: 'soft, natural light, organic feel' },
  { id: 'cinematic', name: 'سينمائي (Cinematic)', prompt: 'moody, dramatic cinematic lighting' }
];

export const MIN_VARIATIONS = 1;
export const MAX_VARIATIONS = 12;
