/* =====================================================================
   books-data.js — Single source of truth for the library.
   Plain global arrays (no modules / no fetch) so the page works when
   opened directly from disk (file://) as well as on a static host.

   Each book carries display fields (title, tag, topic, desc, url) plus
   structured facets used by the search + filters in library.js:
     stage      one of STAGES[].key
     difficulty 'beginner' | 'intermediate' | 'advanced'
     topics     subset of the Topic facet keys
     audience   subset of the Audience facet keys
   ===================================================================== */

/* The five reading stages (also the home page section panels). */
var STAGES = [
    {
        key: 'basics', num: 1, id: 'phase-1',
        title: 'මූලික බුද්ධිමය පදනම',
        sub: 'ගිහි ප්‍රජාව සඳහා',
        lede: 'ඔබ බුද්ධ ධර්මය හැදෑරීමට නවකයෙකු නම් හෝ දෛනික බෞද්ධ වත්පිළිවෙත්, ගුණධර්ම සහ චාරිත්‍ර වාරිත්‍ර පිළිබඳ නිවැරදි පදනමක් සකස් කරගැනීමට කැමති නම්, ඔබගේ දහම් චාරිකාව මෙතැනින් ආරම්භ කරන්න.'
    },
    {
        key: 'philosophy', num: 2, id: 'phase-2',
        title: 'මූලික ධර්ම කාරණා සහ සදාචාරය',
        sub: '',
        lede: 'මෙම පියවර මගින් මූලික බෞද්ධ මූලධර්ම, තාර්කික චින්තනය සහ හේතු-ඵල දහම (කර්මය) පිළිබඳව පුළුල් අවබෝධයක් ලබා දෙයි.'
    },
    {
        key: 'vinaya', num: 3, id: 'phase-3',
        title: 'ශාසනික විනය සහ ප්‍රතිපදාව',
        sub: 'Vinaya & Sila',
        lede: 'උසස් භාවනාවලට හෝ අභිධර්මයට පිවිසීමට පෙර, ශාසනික පැවැත්ම සහ මහා සංඝරත්නයේ හික්මීම (ශීලය) පිළිබඳව හඳුනාගැනීම වැදගත් වේ.'
    },
    {
        key: 'meditation', num: 4, id: 'phase-4',
        title: 'භාවනා සහ චිත්ත පරිකර්ම',
        sub: 'Bhavana',
        lede: 'පොතපතේ න්‍යායාත්මක දැනුම සෘජු ප්‍රායෝගික අධ්‍යාත්මික අවබෝධයක් බවට පරිවර්තනය කරන භාවනා උපදේශන ග්‍රන්ථ මෙහි ඇතුළත් වේ.'
    },
    {
        key: 'abhidhamma', num: 5, id: 'phase-5',
        title: 'පරමාර්ථ ධර්මය සහ අභිධර්ම විග්‍රහය',
        sub: 'Abhidhamma',
        lede: 'රේරුකානේ මහා නාහිමියන් යනු අභිධර්මය පිළිබඳ අග්‍රගණ්‍ය පණ්ඩිත රත්නයකි. පරමාර්ථ ධර්මයන් (චිත්ත, චෛතසික, රූප, නිවන්) තේරුම් ගැනීමට මෙම පොත් පෙළගැස්ම සෘජුවම උපකාරී වේ.'
    }
];

var BOOKS = [
    /* ---- 1. Basics ---- */
    {
        number: '1', title: 'පුණ්‍යෝපදේශය', tag: 'මූලික දැනුම',
        topic: 'පින සහ කුසලය පිළිබඳ විග්‍රහය',
        desc: 'පින සහ කුසලය යනු කුමක්දැයි හඳුන්වා දෙන මූලිකම ග්‍රන්ථයකි. දෛනික ජීවිතයේදී සිදුකරන සුළු හෝ යහපත් ක්‍රියාවන් තුළින් කර්ම ශක්තිය හැඩගැසෙන ආකාරය මෙහි සරලව විග්‍රහ කර ඇත.',
        url: '1-The-Basics/Punyopadeshaya.html', available: true,
        stage: 'basics', difficulty: 'beginner',
        topics: ['Dana', 'Sila'], audience: ['Lay readers']
    },
    {
        number: '2', title: 'බෞද්ධයාගේ අත්පොත', tag: 'අත්‍යවශ්‍යයි',
        topic: 'Handbook of the Buddhist',
        desc: 'සෑම බෞද්ධ නිවසකම තිබිය යුතුම අත්‍යවශ්‍ය දහම් අත්පොතයි. පංචශීලය රැකීමේ වටිනාකම, දෛනික වත්පිළිවෙත් සහ ගිහි බෞද්ධයෙකු සතු විය යුතු මූලික සදාචාරාත්මක හික්මීම මෙහි ඇතුළත් වේ.',
        url: '1-The-Basics/Baudhdhayage-Athpotha.html', available: true,
        stage: 'basics', difficulty: 'beginner',
        topics: ['Sila'], audience: ['Lay readers']
    },
    {
        number: '3', title: 'පෝය දිනය', tag: 'වත්පිළිවෙත්',
        topic: 'Poya Day Guide',
        desc: 'උපෝසථ සීලය පිළිබඳව ලියැවුණු සුවිශේෂී මාර්ගෝපදේශයකි. අෂ්ටාංග සීලය (අටසිල්) සමාදන් වීමේ වැදගත්කම සහ පෝය දිනක කාලය ධාර්මිකව ගත කරන ආකාරය පිළිබඳව මෙහි පැහැදිලි කර දෙයි.',
        url: '1-The-Basics/Pohoya-Dinaya.html', available: true,
        stage: 'basics', difficulty: 'beginner',
        topics: ['Poya', 'Sila'], audience: ['Lay readers']
    },
    {
        number: '4', title: 'සූවිසි මහා ගුණය', tag: 'ශ්‍රද්ධාව',
        topic: 'Twenty Four Great Virtues',
        desc: 'තෙරුවන් ගුණ පිළිබඳව ගැඹුරින් කෙරෙන විග්‍රහයකි. බුද්ධ, ධම්ම, සංඝ යන ත්‍රිවිධ රත්නයේ පවතින උදාර වූ විසිහතර මහා ගුණාංගයන් ශ්‍රද්ධාව ජනිත වන අයුරින් මෙහි විස්තර කර ඇත.',
        url: '1-The-Basics/Suwisi-Maha-Gunaya.html', available: true,
        stage: 'basics', difficulty: 'beginner',
        topics: ['Sutta'], audience: ['Lay readers']
    },

    /* ---- 2. Philosophy ---- */
    {
        number: '1', title: 'චතුරාර්ය සත්‍යය', tag: 'ධර්ම පදනම',
        topic: 'Four Noble Truths',
        desc: 'බුදුදහමේ මූලිකම සහ සුවිශේෂීම සොයාගැනීම වන චතුරාර්ය සත්‍යය පිළිබඳව ඉතා පැහැදිලි, ව්‍යුහාත්මක සහ තාර්කික විග්‍රහයක් මෙම ග්‍රන්ථයෙන් ඉදිරිපත් කරයි.',
        url: '2-Foundational-Philosophy/Chathurarya-Sathyaya.html', available: true,
        stage: 'philosophy', difficulty: 'intermediate',
        topics: ['Sutta'], audience: ['Lay readers', 'Meditators']
    },
    {
        number: '2', title: 'මංගල ධර්ම විස්තරය', tag: 'ඉදිරියේදී',
        topic: 'ජීවිත මාර්ගය · Maha Mangala Sutta Commentary',
        desc: 'මහා මංගල සූත්‍රය පාදක කරගනිමින්, මෙලොව සහ පරලොව දියුණුව සලසන උදාර මංගල කරුණු 38 දීර්ඝ වශයෙන් සහ ප්‍රායෝගික උදාහරණ සහිතව විස්තර කර ඇත.',
        url: null, available: false,
        stage: 'philosophy', difficulty: 'beginner',
        topics: ['Sutta', 'Sila'], audience: ['Lay readers']
    },
    {
        number: '3', title: 'ධර්ම විනිශ්චය', tag: 'ප්‍රඥාව',
        topic: 'Judging the Teachings',
        desc: 'සමාජයේ පවතින විවිධ ආගමික මතවාද සහ මුළාවන් බැහැර කරමින්, සැබෑ ශුද්ධ බුද්ධ ධර්මය නිවැරදිව හඳුනා ගන්නේ කෙසේදැයි උගන්වන ශාස්ත්‍රීය ග්‍රන්ථයකි.',
        url: '2-Foundational-Philosophy/Dharma-Vinishchaya.html', available: true,
        stage: 'philosophy', difficulty: 'intermediate',
        topics: ['Sutta'], audience: ['Lay readers', 'Advanced students']
    },
    {
        number: '4', title: 'වඤ්චක ධර්ම හා චිත්තෝපක්ලේශ ධර්ම', tag: 'ස්වයං විවේචනය',
        topic: 'Mental Defilements',
        desc: 'අප නොදැනුවත්වම අපව රවටන, අධ්‍යාත්මික දියුණුව වළක්වන සියුම් කෙලෙස් ධර්මයන් සහ සිතේ අපිරිසිදු තත්ත්වයන් පිළිබඳව කෙරෙන මනෝවිද්‍යාත්මක විග්‍රහයකි.',
        url: '2-Foundational-Philosophy/Wanchaka-Dharma-saha-Chiththopaklesha-Dharma.html', available: true,
        stage: 'philosophy', difficulty: 'intermediate',
        topics: ['Abhidhamma'], audience: ['Lay readers', 'Meditators']
    },
    {
        number: '5', title: 'පාරමිතා ප්‍රකරණය', tag: 'උදාර වත්පිළිවෙත්',
        topic: 'Ten Perfections',
        desc: 'නිවන් දැකීම සඳහා පූර්ණය කළ යුතු දස පාරමිතාවන්, උපපාරමිතාවන් සහ පරමත්ථ පාරමිතාවන් පිළිබඳව සහ බෝධිසත්ව චරිතය පිළිබඳව කෙරෙන මහා විවරණයකි.',
        url: '2-Foundational-Philosophy/Paramitha-Prakaranaya.html', available: true,
        stage: 'philosophy', difficulty: 'intermediate',
        topics: ['Parami'], audience: ['Lay readers', 'Advanced students']
    },

    /* ---- 3. Vinaya ---- */
    {
        number: '1', title: 'ශාසනාවතරණය', tag: 'පැවිදි මඟ',
        topic: 'Introduction to Sasana',
        desc: 'ශාසනයට ඇතුළත් වන නවක මහණ බඹසර රැකිය යුතු ආකාරය සහ ශාසනික උරුමය ආරක්ෂා කරගැනීම පිළිබඳව ලියැවුණු මූලික ශාසනික මාර්ගෝපදේශයකි.',
        url: '3-Monastic-Discipline/Shasanavatharanaya.html', available: true,
        stage: 'vinaya', difficulty: 'intermediate',
        topics: ['Vinaya', 'Sila'], audience: ['Monastics']
    },
    {
        number: '2', title: 'උභය ප්‍රාතිමෝක්ෂය / උපසම්පදා ශීලය', tag: 'උසස් ශීලය',
        topic: 'Monastic Discipline',
        desc: 'උපසම්පදා භික්ෂූන් වහන්සේලා උදෙසා පනවා ඇති උසස් විනය නීති පද්ධතිය සහ ප්‍රාතිමෝක්ෂ සංවර ශීලය පිළිබඳව කෙරෙන ඉතා ගැඹුරු විග්‍රහයකි.',
        url: '3-Monastic-Discipline/Ubhaya-Prathimokshaya.html', available: true,
        stage: 'vinaya', difficulty: 'advanced',
        topics: ['Vinaya', 'Sila'], audience: ['Monastics']
    },

    /* ---- 4. Meditation ---- */
    {
        number: '1', title: 'සතිපට්ඨාන භාවනා ක්‍රමය', tag: 'සිහිය පිහිටුවීම',
        topic: 'Foundations of Mindfulness',
        desc: 'මහා සතිපට්ඨාන සූත්‍රයට අනුව කාය, වේදනා, චිත්ත, ධම්ම යන සිව්වැදෑරුම් සතිපට්ඨානය ප්‍රායෝගිකව වර්ධනය කරන ආකාරය පියවරෙන් පියවර කියා දෙන අත්පොතකි.',
        url: '4-Meditation-Bhavana/Sathipatthana-Bhavana-Kramaya.html', available: true,
        stage: 'meditation', difficulty: 'intermediate',
        topics: ['Bhavana', 'Sutta'], audience: ['Meditators']
    },
    {
        number: '2', title: 'විදර්ශනා භාවනා ක්‍රමය', tag: 'ප්‍රඥා වර්ධනය',
        topic: 'Insight Meditation',
        desc: 'අනිච්ච, දුක්ඛ, අනත්ත යන ත්‍රිලක්ෂණය වටහා ගනිමින් සසර දුක කෙළවර කිරීම සඳහා උපකාරී වන විදර්ශනා ඥානයන් දියුණු කරගන්නා ආකාරය පැහැදිලි කරයි.',
        url: '4-Meditation-Bhavana/Vidarshana-Bhavana-Kramaya.html', available: true,
        stage: 'meditation', difficulty: 'intermediate',
        topics: ['Bhavana'], audience: ['Meditators']
    },
    {
        number: '3', title: 'චත්තාලීසාකාර මහා විපස්සනා භාවනාව', tag: 'උසස් භාවනා',
        topic: 'Advanced Vipassana',
        desc: 'විදර්ශනා වර්ධනය සඳහා උපකාරී වන ආකාර හතළිහකින් යුත් (චත්තාලීසාකාර) ගැඹුරු භාවනා මනස හැඩගස්වන උසස් මාර්ගෝපදේශයකි.',
        url: '4-Meditation-Bhavana/Chaththaleesakara-Maha-Vipassana-Bhavana.html', available: true,
        stage: 'meditation', difficulty: 'advanced',
        topics: ['Bhavana'], audience: ['Meditators', 'Advanced students']
    },

    /* ---- 5. Abhidhamma ---- */
    {
        number: '1', title: 'අභිධර්මයේ මූලික කරුණු', tag: 'අභිධර්ම ඇරඹුම',
        topic: 'Basic Facts of Abhidhamma',
        desc: 'අභිධර්මය හැදෑරීමට කැමති ඕනෑම අයෙකු කියවිය යුතුම පළමු පොතයි. නාම-රූප සහ පරමාර්ථ ස්වභාවය ඉතා සරලව මෙහි විග්‍රහ කර ඇත.',
        url: '5-Abhidhamma/Abhidharmaye-Mulika-Karuna.html', available: true,
        stage: 'abhidhamma', difficulty: 'intermediate',
        topics: ['Abhidhamma'], audience: ['Lay readers', 'Advanced students']
    },
    {
        number: '2', title: 'අභිධර්මාර්ථ සංග්‍රහය', tag: 'ඉදිරියේදී',
        topic: 'සම්භාව්‍ය විවරණය · Comprehensive Manual of Abhidhamma',
        desc: 'පැරණි අභිධර්මාර්ථ සංග්‍රහ පාලි ග්‍රන්ථය සිංහල භාෂාවෙන් අර්ථ දක්වමින්, චිත්ත වීථි සහ කර්ම සිද්ධාන්ත පිළිබඳව කෙරෙන අගනා වටිනාකමකින් යුතු පරිවර්තන ව්‍යාඛ්‍යානයකි.',
        url: null, available: false,
        stage: 'abhidhamma', difficulty: 'advanced',
        topics: ['Abhidhamma'], audience: ['Advanced students']
    },
    {
        number: '3', title: 'අභිධර්ම මාර්ගය', tag: 'ගැඹුරු න්‍යාය',
        topic: 'The Path of Abhidhamma',
        desc: 'අභිධර්මයේ එන සංකීර්ණ න්‍යායන් සහ විශ්වයේ ක්‍රියාකාරිත්වය නාම-රූප ව්‍යුහයන් හරහා තවදුරටත් පුළුල්ව පැහැදිලි කරන නිබන්ධනයකි.',
        url: '5-Abhidhamma/Abhidharma-Margaya.html', available: true,
        stage: 'abhidhamma', difficulty: 'advanced',
        topics: ['Abhidhamma'], audience: ['Advanced students']
    },
    {
        number: '4', title: 'පටිච්ච සමුප්පාද විවරණය', tag: 'හේතු-ඵල දහම',
        topic: 'Exposition of Dependent Origination',
        desc: 'භව චක්‍රය සහ සසර පැවැත්ම තීරණය කරන හේතුඵල න්‍යාය (පටිච්චසමුප්පාදය) අංග 12ක් ඔස්සේ, අභිධර්ම විද්‍යාත්මක ක්‍රමවේදයකට අනුව විග්‍රහ කෙරෙන අතිශය උසස් පෙළපොතකි.',
        url: '5-Abhidhamma/Patichcha-Samuppada-Vivaranaya.html', available: true,
        stage: 'abhidhamma', difficulty: 'advanced',
        topics: ['Abhidhamma'], audience: ['Advanced students']
    },
    {
        number: '5', title: 'පට්ඨාන මහා ප්‍රකරණ සන්නය', tag: 'ඉදිරියේදී',
        topic: 'උච්චතම කෘතිය · The 24 Conditional Relations',
        desc: 'නාහිමියන්ගේ සාහිත්‍ය නිර්මාණයන්ගේ මුදුන් මල්කඩයි. විශ්වයේ පවතින සියලුම සංස්කාර ධර්මයන් එකිනෙක බැඳී පවතින ආකාර 24ක (පච්චය) සංකීර්ණ සබඳතාව මෙයින් මනාව විග්‍රහ කරයි.',
        url: null, available: false,
        stage: 'abhidhamma', difficulty: 'advanced',
        topics: ['Abhidhamma'], audience: ['Advanced students']
    },
    {
        number: '6', title: 'නිර්වාණ විනිශ්චය', tag: 'අවසාන ඉලක්කය',
        topic: 'Analysis of Nirvana',
        desc: 'සංස්කාර ලෝකයෙන් එතෙර වූ, අසංඛත ධාතුවක් වූ උදාර නිවන් සුවයේ සැබෑ ස්වභාවය ධර්මානුකූලව සහ තර්කානුකූලව විග්‍රහ කෙරෙන අවසාන නිගමන ග්‍රන්ථයයි.',
        url: '5-Abhidhamma/Nirvana-Vinishchaya.html', available: true,
        stage: 'abhidhamma', difficulty: 'advanced',
        topics: ['Abhidhamma'], audience: ['Advanced students']
    }
];

/* Facet definitions for the filter UI: { value, label } in Sinhala.
   `value` matches the structured fields above; `label` is what shows. */
var FACETS = {
    stage: [
        { value: 'basics', label: 'මූලික' },
        { value: 'philosophy', label: 'ධර්ම' },
        { value: 'vinaya', label: 'විනය' },
        { value: 'meditation', label: 'භාවනා' },
        { value: 'abhidhamma', label: 'අභිධර්ම' }
    ],
    difficulty: [
        { value: 'beginner', label: 'ආරම්භක' },
        { value: 'intermediate', label: 'මධ්‍යම' },
        { value: 'advanced', label: 'උසස්' }
    ],
    topics: [
        { value: 'Sila', label: 'සීල' },
        { value: 'Dana', label: 'දාන' },
        { value: 'Bhavana', label: 'භාවනා' },
        { value: 'Abhidhamma', label: 'අභිධර්ම' },
        { value: 'Vinaya', label: 'විනය' },
        { value: 'Sutta', label: 'සූත්‍ර' },
        { value: 'Poya', label: 'පෝය' },
        { value: 'Parami', label: 'පාරමී' }
    ],
    audience: [
        { value: 'Lay readers', label: 'ගිහි පාඨක' },
        { value: 'Meditators', label: 'භාවනානුයෝගී' },
        { value: 'Monastics', label: 'පැවිදි' },
        { value: 'Advanced students', label: 'උසස් ශිෂ්‍ය' }
    ]
};

var FACET_LABELS = {
    stage: 'පියවර',
    difficulty: 'මට්ටම',
    topics: 'විෂය',
    audience: 'පාඨක පිරිස'
};
