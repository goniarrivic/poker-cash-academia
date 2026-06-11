import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import orEP  from './or_p1_0.png';
import orMP  from './or_p1_1.png';
import orCO  from './or_p2_2.png';
import orBTN from './or_p2_3.png';
import orSB  from './or_p3_4.png';
import orLegend from './or_p3_5.png';
import rolMP  from './rol_p1_0.png';
import rolCO  from './rol_p1_1.png';
import rolBTN from './rol_p2_2.png';
import rolSB  from './rol_p2_3.png';
import { SITUATIONS_EXTRA } from './situations/open.js';
import { ISO_SITUATIONS_EXTRA } from './situations/iso.js';
import { CBET_SITUATIONS_EXTRA } from './situations/cbet.js';
import { VBET_SITUATIONS_EXTRA } from './situations/vbet.js';
import { CALL_SITUATIONS_EXTRA } from './situations/call.js';
import { FACING_SITUATIONS_EXTRA } from './situations/facing.js';

// ─── FIREBASE ────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyCO_x36MTd3NlBmA1vmYBlxPfePQZVzzkA",
  authDomain: "cash-academy-4a53b.firebaseapp.com",
  projectId: "cash-academy-4a53b",
  storageBucket: "cash-academy-4a53b.firebasestorage.app",
  messagingSenderId: "259506874841",
  appId: "1:259506874841:web:cb10a7b741f7e1a3edd1c8",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Cuentas con acceso al panel de moderación / administración.
const ADMIN_EMAILS = ["goniarrivic@gmail.com"];

// Motivos de reporte de fallos en una situación.
const REPORT_REASONS = [
  { id: "wrong_answer",   es: "La respuesta marcada como correcta no lo es", en: "The answer marked correct isn't" },
  { id: "missing_context",es: "Falta contexto (no se sabe quién abrió, tamaños, etc.)", en: "Missing context (unclear who opened, sizes, etc.)" },
  { id: "bad_option",     es: "Una de las opciones no tiene sentido", en: "One of the options doesn't make sense" },
  { id: "other",          es: "Otro", en: "Other" },
];



// ─── RANGE GRID DATA ──────────────────────────────────────────────────────────
const EP_OPEN    = new Set(["66","77","87s","88","98s","99","A9s","AA","AJo","AJs","AKs","AQs","ATs","J9s","JJ","JTs","KJs","KK","KQs","KTs","QJs","QQ","QTs","T9s"]);
const EP_EXPLOIT = new Set(["AKo","AQo","KQo","T8s","TT"]);
const MP_OPEN    = new Set(["55","66","77","86s","87s","88","97s","98s","99","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","AA","AJo","AJs","AKs","AQs","ATs","J9s","JJ","JTs","K9s","KJs","KK","KQs","KTs","Q9s","QJs","QQ","QTs","T9s"]);
const MP_EXPLOIT = new Set(["65s","76s","AKo","AQo","KQo","T8s","TT"]);
const CO_OPEN    = new Set(["55","65s","66","76s","77","86s","87s","88","97s","98s","99","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9o","A9s","AA","AJo","AJs","AKo","AKs","AQo","AQs","ATo","ATs","J9s","JJ","JTo","JTs","K8s","K9s","KJo","KJs","KK","KQo","KQs","KTo","KTs","Q9s","QJo","QJs","QQ","QTo","QTs","T8s","T9s","TT"]);
const CO_EXPLOIT = new Set([]);
const BTN_OPEN    = new Set(["22","32s","55","66","77","86s","87s","88","96s","97s","98o","98s","99","A2s","A3s","A4o","A4s","A5s","A6s","A7s","A8o","A8s","A9o","A9s","AA","AJo","AJs","AKs","AQs","ATo","ATs","J7s","J8s","J9o","J9s","JJ","JTo","JTs","K2s","K3s","K4s","K5s","K6s","K7s","K8o","K8s","K9o","K9s","KJo","KJs","KK","KQs","KTo","KTs","Q7s","Q8s","Q9o","Q9s","QJo","QJs","QQ","QTo","QTs","T7s","T9o","T9s"]);
const BTN_EXPLOIT = new Set(["54s","64s","65s","75s","76s","87o","A2o","A3o","A5o","A6o","A7o","AKo","AQo","KQo","T8s","TT"]);
const SB_OPEN    = new Set(["22","32s","43s","44","53s","54o","54s","55","64o","64s","65o","65s","66","74s","75o","75s","76o","76s","77","85s","86o","86s","87o","87s","88","95s","96o","96s","97o","97s","98o","98s","99","A2o","A2s","A3o","A3s","A4o","A4s","A5o","A5s","A6o","A6s","A7o","A7s","A8o","A8s","A9o","A9s","AA","AJo","AJs","AKo","AKs","AQo","AQs","ATo","ATs","J4s","J5s","J6o","J6s","J7o","J7s","J8o","J8s","J9o","J9s","JJ","JTo","JTs","K2o","K2s","K3o","K3s","K4o","K4s","K5o","K5s","K6o","K6s","K7o","K7s","K8o","K8s","K9o","K9s","KJo","KJs","KK","KQo","KQs","KTo","KTs","Q2s","Q3s","Q4s","Q5s","Q6o","Q6s","Q7o","Q7s","Q8o","Q8s","Q9o","Q9s","QJo","QJs","QQ","QTo","QTs","T5s","T6o","T6s","T7o","T7s","T8o","T8s","T9o","T9s","TT"]);
const SB_EXPLOIT  = new Set([]);
const ROL_MP_OPEN    = new Set(["88","99","AA","AJs","AKs","AQs","JJ","JTs","KK","KQs","QJs","QQ"]);
const ROL_MP_EXPLOIT = new Set(["AKo","AQo","TT"]);
const ROL_CO_OPEN    = new Set(["66","77","88","98s","99","A9s","AA","AJo","AJs","AKo","AKs","AQo","AQs","ATs","J9s","JJ","JTs","KJs","KK","KQo","KQs","KTs","QJs","QQ","QTs","T9s","TT"]);
const ROL_BTN_OPEN   = new Set(["55","66","77","88","98s","99","A9s","AA","AJo","AJs","AKo","AKs","AQo","AQs","ATo","ATs","J9s","JJ","JTo","JTs","KJo","KJs","KK","KQo","KQs","KTs","QJo","QJs","QQ","QTs","T9s","TT"]);
const ROL_SB_OPEN    = new Set(["55","66","76s","77","87s","88","97s","98s","99","A8s","A9s","AA","AJo","AJs","AKo","AKs","AQo","AQs","ATo","ATs","J9s","JJ","JTo","JTs","K9s","KJo","KJs","KK","KQo","KQs","KTs","QJo","QJs","QQ","QTs","T8s","T9s","TT"]);

function RangeGridBlock({ data, lang }) {
  const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
  const openSet    = data.open    instanceof Set ? data.open    : new Set(data.open    || []);
  const exploitSet = data.exploit instanceof Set ? data.exploit : new Set(data.exploit || []);

  const getHand = (i, j) => {
    const r1 = RANKS[i], r2 = RANKS[j];
    if (i === j) return r1 + r1;
    if (i < j)  return r1 + r2 + 's';
    return r2 + r1 + 'o';
  };

  const cellStyle = (hand) => {
    if (openSet.has(hand))    return { bg:'#9b1c1c', text:'#fecaca', fw:700 };
    if (exploitSet.has(hand)) return { bg:'#fca5a5', text:'#7f1d1d', fw:600 };
    return { bg:'#111320', text:'#3a3f5a', fw:400 };
  };

  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:12, color:'#8b8fa8', marginBottom:6, fontWeight:600 }}>
        {lang==='es' ? data.labelEs : data.labelEn}
      </div>
      <div style={{ overflowX:'auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(13,1fr)', gap:2, minWidth:364 }}>
          {RANKS.map((_,i) => RANKS.map((_,j) => {
            const hand = getHand(i,j);
            const {bg,text,fw} = cellStyle(hand);
            return (
              <div key={hand} style={{ background:bg, color:text, fontSize:'7px', padding:'3px 1px', textAlign:'center', borderRadius:2, fontWeight:fw, letterSpacing:'-0.3px' }}>
                {hand}
              </div>
            );
          }))}</div>
      </div>
      {(openSet.size > 0 || exploitSet.size > 0) && (
        <div style={{ display:'flex', gap:14, marginTop:6, fontSize:11, color:'#8b8fa8', flexWrap:'wrap' }}>
          <span><span style={{color:'#ef4444'}}>■</span> {lang==='es'?'Siempre abre':'Always open'}</span>
          {exploitSet.size > 0 && <span><span style={{color:'#fca5a5'}}>■</span> {lang==='es'?'Abre vs rivales débiles':'Open vs weak opponents'}</span>}
          <span><span style={{color:'#3a3f5a'}}>■</span> Fold</span>
        </div>
      )}
    </div>
  );
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────

const content = {
  es: {
    nav: { title: "Poker Cash Academy", back: "Inicio" },
    home: { welcome: "Poker Cash Academy", subtitle: "Domina el cash game. Un concepto a la vez." },
    menu: { academia: "Academy", academiaSubtitle: "Lecciones estructuradas paso a paso", stats: "Estadísticas", statsSubtitle: "Tu progreso, nivel y precisión por categoría" },
    academia: {
      title: "Academia",
      subtitle: "Aprende paso a paso",
      completed: "completado",
      locked: "Bloqueado",
      lockedMsg: "Completa las lecciones anteriores para desbloquear.",
      complete: "Marcar como completado →",
      next: "Siguiente lección",
      progress: "Progreso",
      of: "de",
      nextChapter: "Siguiente →",
      prevChapter: "← Anterior",
    },
    practice: {
      title: "Test",
      subtitle: "Mide tu progreso con situaciones reales de toma de decisiones",
      start: "Comenzar sesión",
      situation: "Situación",
      of: "de",
      correct: "¡Correcto!",
      wrong: "Incorrecto",
      next: "Siguiente →",
      finish: "Ver resultado",
      playAgain: "Nueva sesión",
      scoreTitle: "Resultado",
      perfect: "¡Perfecto! Dominas la apertura preflop.",
      good: "Bien hecho. Repasa las que has fallado.",
      review: "Repasa el Capítulo 1 antes de volver a intentarlo.",
      posLabel: "Posición",
      handLabel: "Tu mano",
      contextLabel: "Contexto",
      filterTitle: "Elige las categorías a practicar",
      filterRandom: "Aleatorio (todas)",
      optFold: "Foldear",
      optOpen3: "Abrir a 3x BB",
      optOpen25: "Abrir a 2.5x BB",
      optOpen2: "Abrir a 2x BB",
      optOpen4: "Abrir a 4x BB",
      optLimp: "Pagar la ciega (limp)",
      wrongSizeExp: "Variar el tamaño según la mano revela información. Usa siempre el tamaño estándar de tu posición.",
      wrongLimpExp: "El limp pierde la iniciativa y es una jugada débil. Desde cualquier posición salvo BB: o abres con raise o foldeas.",
      wrongFoldExp: "Esta mano sí está en el rango de apertura de esta posición.",
      wrongOpenExp: "Esta mano no está en el rango de apertura de esta posición.",
      optIso4: "ISO raise a 4BB",
      optIso5: "ISO raise a 5BB",
      optIso6: "ISO raise a 6BB",
      optIso8: "ISO raise a 8BB",
      optLimpBehind: "Pagar también (overlimp)",
      wrongIsoFoldExp: "Esta mano no está en el rango de ISO desde esta posición. Con los jugadores que hay en el bote, foldear es la jugada correcta.",
      wrongIsoOpenExp: "Esta mano sí está en el rango de ISO desde esta posición. ISO raise al tamaño correcto.",
      wrongLimpBehindExp: "El overlimp (pagar detrás sin subir) es casi siempre incorrecto: entras sin iniciativa a un bote multiway. O ISO o foldea.",
      optCbetSmall: "C-bet 33% del bote",
      optVbetMedium:"Apostar 50% del bote",
      optCbetLarge: "C-bet 67% del bote",
      optCbetPot:   "C-bet el bote (100%)",
      optCheck:     "Checkear",
      wrongCbetSizeExp: "El sizing revela información igual que en preflop. Usa el tamaño correcto para la textura del tablero, no para el valor de tu mano.",
      wrongBetWhenCheckExp: "Apostar aquí desperdicia fichas. En tableros que favorecen al rival o en botes multiway con mano débil, checkear es superior.",
      wrongCheckWhenBetExp: "Checkear cede iniciativa y pierde fold equity o valor. La apuesta tiene más EV en esta situación.",
      boardLabel: "Tablero",
      posTypeIP: "En posición (IP)",
      posTypeOOP: "Fuera de posición (OOP)",
      playersLabel: "Jugadores en el bote",
      reportBtn: "Reportar fallo",
      reportTitle: "Reportar un fallo en esta situación",
      reportReasonLabel: "¿Cuál es el problema?",
      reportCommentLabel: "Comentario (opcional)",
      reportCommentPlaceholder: "Cuéntanos qué crees que está mal y por qué...",
      reportCancel: "Cancelar",
      reportSubmit: "Enviar reporte",
      reportSending: "Enviando...",
      reportSuccess: "¡Gracias! Hemos recibido tu reporte.",
      reportError: "No se pudo enviar el reporte. Inténtalo de nuevo.",
      reportLoginRequired: "Inicia sesión para reportar fallos.",
      actionCall: "Pagar (call)",
      editBtn: "Proponer cambio",
      editTitle: "Proponer un cambio en esta situación",
      editCurrentLabel: "Jugada correcta actual",
      editCorrectLabel: "¿Cuál crees que es la jugada correcta?",
      editExplEsLabel: "Explicación corregida (ES)",
      editExplEnLabel: "Explicación corregida (EN)",
      editCommentLabel: "Justificación (obligatorio)",
      editCommentPlaceholder: "Explica por qué crees que esto debería cambiar...",
      editCancel: "Cancelar",
      editSubmit: "Enviar propuesta",
      editSending: "Enviando...",
      editSuccess: "¡Gracias! Tu propuesta se ha enviado a la comunidad para votación.",
      editError: "No se pudo enviar la propuesta. Inténtalo de nuevo.",
      editLoginRequired: "Inicia sesión para proponer cambios.",
      editCommentRequired: "Escribe una breve justificación para tu propuesta.",
      communityNav: "Comunidad",
      communityTitle: "Moderación de propuestas",
      communityDesc: "Vota las propuestas de cambio enviadas por la comunidad. Con suficientes votos a favor o en contra, la propuesta se aprueba o se rechaza automáticamente.",
      communityEmpty: "No hay propuestas pendientes ahora mismo.",
      communityVoteUp: "A favor",
      communityVoteDown: "En contra",
      communityApproved: "Aprobada",
      communityRejected: "Rechazada",
      communityPending: "Pendiente",
      communityNetVotes: "Votos netos",
      communityCurrent: "Actual",
      communityProposed: "Propuesta",
      communityComment: "Justificación",
      communityBy: "Propuesto por",
      communityFilterPending: "Pendientes",
      communityFilterResolved: "Resueltas",
      communityFilterAll: "Todas",
      communityLoginRequired: "Inicia sesión para votar las propuestas de la comunidad.",
      communityAlreadyVoted: "Ya has votado en esta propuesta.",
      communityTabEdits: "Cambios propuestos",
      communityTabNewHands: "Manos nuevas",
      proposeBtn: "✚ Proponer mano nueva",
      proposeTitle: "Proponer una mano nueva",
      proposeCategoryLabel: "Categoría",
      proposePosLabel: "Tu posición",
      proposeHandLabel: "Tu mano (ej: A♠ K♦)",
      proposeBoardLabel: "Board (ej: A♦ 7♣ 2♥)",
      proposeCallPosLabel: "Posición del rival",
      proposePlayersLabel: "Jugadores en la mano",
      proposeHU: "Heads-up (1 rival)",
      propose3way: "3-way (2 rivales)",
      proposeStreetLabel: "Calle",
      proposeStreetFlop: "Flop",
      proposeStreetTurn: "Turn",
      proposeStreetRiver: "River",
      proposeLimpersLabel: "Número de limpers",
      proposeLimper1: "1 limper",
      proposeLimper2: "2 limpers",
      proposeLimperContextLabel: "¿Quién ha limpeado y en qué posición?",
      proposeLimperContextPlaceholder: "Ej: UTG ha limpeado (jugador recreativo)",
      proposeContextLabel: "Contexto / historia de la mano",
      proposeContextPlaceholder: "Describe la situación: tipo de rival, acción previa, stacks, etc.",
      proposeContextOptional: "Contexto adicional (opcional)",
      proposeOptionsLabel: "Opciones de respuesta (rellena las 4)",
      proposeOptionPlaceholder: "Opción",
      proposeCorrectLabel: "¿Cuál opción es la correcta?",
      proposeCorrectExplLabel: "¿Por qué es correcta? (explicación)",
      proposeWrongExplLabel: "¿Por qué son incorrectas las demás? (opcional)",
      proposeCommentLabel: "Comentario adicional (opcional)",
      proposeCancel: "Cancelar",
      proposeSubmit: "Enviar propuesta",
      proposeSending: "Enviando...",
      proposeSuccess: "¡Gracias! Tu mano se ha enviado a la comunidad para votación.",
      proposeError: "No se pudo enviar la propuesta. Inténtalo de nuevo.",
      proposeLoginRequired: "Inicia sesión para proponer manos nuevas.",
      proposeValidation: "Completa la mano, las 4 opciones y la explicación de por qué es correcta.",
      newHandsTitle: "Manos propuestas por la comunidad",
      newHandsDesc: "Vota las manos nuevas enviadas por otros usuarios. Con suficientes votos a favor se añaden al banco de práctica para todos.",
      newHandsEmpty: "No hay manos nuevas pendientes ahora mismo.",
      newHandsAddedToPool: "Añadida al banco de práctica",
      communityProposedBy: "Propuesta por",
      proposeAddOtherLang: "➕ Añadir también en inglés (opcional)",
      proposeOtherLangTitle: "Versión en inglés",
      proposeSecondaryContextLabel: "Contexto / historia de la mano (inglés)",
      proposeSecondaryOptionsLabel: "Opciones de respuesta (inglés)",
      proposeSecondaryCorrectExplLabel: "¿Por qué es correcta? (inglés)",
      proposeSecondaryWrongExplLabel: "¿Por qué son incorrectas las demás? (inglés, opcional)",
    },
    lessons: [
      {
        id: 0,
        title: "0. Fundamentos del Juego",
        summary: "EV, varianza, mental game y cómo se gana dinero al poker.",
        chapters: [
          {
            title: "¿Cómo se gana dinero al poker?",
            body: [
              { type: "text", content: "El poker no es un juego contra la casa. Es un juego de jugador contra jugador donde la sala cobra una pequeña comisión llamada rake por organizar las partidas. Esto significa que para ganar dinero no basta con tener suerte: necesitas tomar mejores decisiones que los rivales con los que compartes mesa de forma consistente." },
              { type: "callout", label: "La fuente real del profit", content: "El dinero que ganas al poker sale directamente del bolsillo de tus rivales. Los jugadores que pierden de forma crónica se llaman fish o recreativos. Los jugadores que ganan de forma consistente se llaman regulars o regs. Tu trabajo es posicionarte en el lado correcto de esa ecuación." },
              { type: "text", content: "El win rate es la métrica central para medir el rendimiento de un jugador. Se expresa en BB/100, es decir, big blinds ganadas por cada 100 manos jugadas. Un win rate de 5 BB/100 en $0.10/$0.25 significa que ganas 5 × $0.25 = $1.25 de media cada 100 manos. No es mucho por mano, pero a 500 manos por hora durante horas largas, se acumula." },
              { type: "callout", label: "El rake: el enemigo silencioso", content: "La sala cobra rake en cada bote — normalmente entre el 4% y el 5% con un máximo por mano. A stakes bajos, el rake puede representar una fracción enorme de lo que se juega. Por eso el rakeback y los bonos de bienvenida son tan importantes al empezar: parte de tu profit vendrá de ahí, no solo de tu juego." },
              { type: "text", content: "La buena noticia es que en stakes bajos (NL10-NL25) el nivel promedio de tus rivales es bajo. No necesitas jugar perfectamente para ganar; necesitas evitar los errores más grandes y explotar los de los demás. Ese es el plan de este curso." },
            ],
          },
          {
            title: "EV — Valor Esperado",
            body: [
              { type: "text", content: "El EV (Expected Value, Valor Esperado) es el concepto más importante del poker. Define el resultado promedio de una decisión si se repitiera un número infinito de veces. Toda decisión en poker tiene un EV positivo (EV+) o negativo (EV–). El objetivo no es ganar cada mano individual, sino tomar constantemente decisiones con EV+." },
              { type: "callout", label: "Ejemplo simple de EV", content: "Imagina una moneda: si sale cara ganas €2, si sale cruz pierdes €1. ¿Juegas? EV = (0.5 × €2) + (0.5 × –€1) = €1 – €0.50 = +€0.50 por tirada. Aunque puedes perder varias veces seguidas, en el largo plazo esta apuesta siempre es rentable. El poker funciona exactamente igual." },
              { type: "text", content: "En una mano concreta, puede que hagas todo bien y pierdas de todas formas. Eso está bien. Lo que importa es si tu decisión tenía EV+ en el momento en que la tomaste, con la información disponible. Un rival que va all-in con 72o contra tu AA tiene EV muy negativo aunque a veces gane el bote." },
              { type: "callout", label: "EV en decisiones preflop", content: "Cuando decides abrir una mano desde UTG con AJs, no esperas ganar esa mano concreta. Lo que sabes es que a largo plazo, abrir AJs desde UTG tiene EV positivo: construyes botes en posición, tienes equidad fuerte cuando pagas y puedes ganar con continuation bets cuando no aciertas. La suma de todos esos factores da un EV+ claro." },
              { type: "text", content: "El corolario directo del EV es este: nunca evalúes una decisión por su resultado. Un river bluff que falla puede haber sido la jugada correcta. Un river call que gana puede haber sido un error. Separa siempre el proceso del resultado." },
            ],
          },
          {
            title: "Varianza: el ruido que tapa la señal",
            body: [
              { type: "text", content: "La varianza es la fluctuación natural de los resultados a corto plazo. Incluso jugando perfectamente, puedes perder durante cientos o miles de manos seguidas. Incluso jugando muy mal, puedes ganar durante semanas. Esto no es una anomalía: es matemáticamente inevitable." },
              { type: "callout", label: "¿Cuántas manos para evaluar el win rate?", content: "Para que el win rate real empiece a manifestarse con cierta fiabilidad, se necesitan entre 50.000 y 100.000 manos. Antes de eso, los resultados son mayoritariamente ruido. Una racha de 5.000 manos perdedoras no significa que juegues mal — puede ser varianza normal incluso con un win rate de +5 BB/100." },
              { type: "text", content: "Los downswings (rachas de pérdidas) son inevitables para todos los jugadores, incluso los mejores del mundo. Lo que diferencia a un jugador ganador de uno perdedor no es que el ganador no tenga downswings — es que el ganador sigue tomando buenas decisiones durante el downswing en lugar de inclinarse (tiltear) y empeorar su juego." },
              { type: "callout", label: "La trampa del resultado a corto plazo", content: "Perder una sesión no significa que hayas jugado mal. Ganarla no significa que hayas jugado bien. Esta distinción es difícil de interiorizar pero es fundamental. Si evalúas tus decisiones por el resultado de una sola sesión, estarás ajustando tu estrategia en base a ruido aleatorio en lugar de a información real." },
              { type: "text", content: "La herramienta práctica para gestionar la varianza es el bankroll management: tener suficientes buy-ins en tu roll para sobrevivir los downswings sin arruinarte. Lo veremos en detalle en la lección de Bankroll y Mentalidad." },
            ],
          },
          {
            title: "Mental Game — La batalla interior",
            body: [
              { type: "text", content: "Puedes estudiar strategy durante horas, conocer todos los rangos y entender el EV — y aun así perder dinero si no tienes el mental game bajo control. El mental game es la capacidad de mantener la calidad de tus decisiones estable independientemente del contexto emocional de la sesión." },
              { type: "callout", label: "¿Qué es el tilt?", content: "El tilt es cualquier estado emocional que deteriora la calidad de tus decisiones. Puede venir de un bad beat, de un cooler, de haber tenido mala sesión, de haber tenido buena sesión y no querer parar, de cansancio, de problemas de fuera del poker... El tilt tiene muchas formas, pero todas producen el mismo resultado: juegas peor y pierdes más dinero del que deberías." },
              { type: "text", content: "El antídoto al tilt no es intentar no sentir emociones — eso es imposible. Es tener un sistema que aísle tus emociones de tus decisiones. Esto incluye establecer reglas claras antes de sentarte a jugar: un stop-loss de 3 buy-ins, un límite de horas, reconocer las señales de alerta personales y actuar en consecuencia." },
              { type: "callout", label: "Proceso vs. resultado: la distinción clave", content: "Una buena decisión que pierde sigue siendo una buena decisión. Una mala decisión que gana sigue siendo una mala decisión. Si internalizas esto de verdad, el poker cambia por completo: dejas de frustrarte por los malos resultados inevitables y te centras en lo único que puedes controlar — la calidad de tus decisiones." },
              { type: "text", content: "El poker de alto nivel es un juego de información incompleta repetido miles de veces. En cualquier mano individual, el factor suerte es enorme. En el largo plazo, la suerte se cancela y solo queda la habilidad. Tu trabajo es jugar suficientes manos con suficiente calidad para que el largo plazo trabaje a tu favor." },
            ],
          },
          {
            title: "Stack depth: jugar con 100 BB",
            body: [
              { type: "text", content: "Toda la estrategia de este curso está calibrada para jugar con 100 big blinds efectivos. Esto no es un detalle menor: el stack depth (profundidad de stack) cambia completamente el valor de las manos, el tamaño óptimo de las apuestas y los rangos que son rentables de jugar." },
              { type: "callout", label: "¿Por qué 100 BB como referencia?", content: "Con 100 BB tienes suficiente dinero para extraer el máximo valor con manos fuertes a lo largo de múltiples calles, para que las manos especulativas tengan los implied odds necesarios para ser rentables, y para que los bluffs y semi-bluffs tengan presión real. Por debajo de 100 BB, la estrategia empieza a cambiar: el juego se simplifica, los draws pierden valor y las decisiones preflop se vuelven más polarizadas." },
              { type: "callout", label: "Recarga si bajas de 80-90 BB", content: "La regla práctica es clara: si tu stack cae por debajo de 80-90 BB, recarga hasta 100 BB antes de seguir jugando. Jugar con 75, 60 o 50 BB no es simplemente 'tener menos fichas' — es un juego diferente con una geometría de botes distinta. La estrategia que estás aprendiendo aquí no funciona igual con stacks cortos." },
              { type: "text", content: "La razón más importante para recargar tiene que ver con las manos especulativas. Pares pequeños (22-66) y suited connectors bajos (65s, 76s, 87s) son rentables con 100 BB porque cuando aciertan una mano muy fuerte (set, straight, flush), pueden extraer suficiente valor a lo largo del bote para compensar las muchas veces que fallan el flop y tienen que foldear." },
              { type: "callout", label: "Por qué los pares pequeños necesitan stack profundo", content: "22-66 hacen set aproximadamente 1 de cada 8 veces que ves el flop. Cuando aciertas, necesitas ganar suficientes fichas para compensar las 7 veces que fallaste. Con 100 BB efectivos, un set en el flop puede ganar 80-100 BB en un bote de varias calles. Con 40 BB, el máximo que puedes ganar es 40 BB — lo que a menudo no compensa los blinds pagados para ver el flop repetidamente." },
              { type: "callout", label: "Por qué los suited connectors necesitan stack profundo", content: "65s, 76s, 87s, 98s son manos que buscan flushes y straights. Cuando aciertan un flush draw en el flop pueden necesitar 2 calles para completar — lo que requiere botes grandes que solo son posibles con stacks profundos. Con stack corto, la equidad de estas manos se reduce drásticamente porque el bote máximo posible no justifica el riesgo de jugarlas." },
              { type: "text", content: "En resumen: las manos especulativas son rentables con implied odds, y los implied odds existen solo cuando hay suficientes fichas en la mesa. 100 BB es el punto donde estas manos pasan de ser marginales a ser claramente rentables con la estrategia correcta." },
            ],
          },
          {
            title: "Herramientas y rutina de estudio",
            body: [
              { type: "text", content: "El poker moderno se mejora tanto fuera de la mesa como dentro. Los jugadores que solo juegan sin estudiar mejoran muy lentamente o no mejoran nada. Los que combinan volumen con estudio estructurado pueden pasar de perder a ganar en cuestión de meses." },
              { type: "callout", label: "Software esencial", content: "PokerTracker 4 o Hold'em Manager 3 son los trackers estándar del sector: registran todas tus manos, calculan tu win rate real, muestran estadísticas de tus rivales (VPIP, PFR, 3-bet %, etc.) y te permiten revisar sesiones mano a mano. Son de pago, pero imprescindibles a partir de NL10." },
              { type: "text", content: "Los solvers (PioSolver, GTO+, Simple Postflop) son herramientas que calculan la estrategia teóricamente óptima para cualquier spot. No necesitas usarlos desde el principio — son más útiles una vez tienes las bases sólidas — pero entender sus outputs te da una ventaja enorme sobre rivales que juegan solo por intuición." },
              { type: "callout", label: "Una rutina de estudio mínima viable", content: "1. Juega una sesión. 2. Al acabar, marca 3-5 manos que te hayan generado dudas. 3. Analízalas fuera de la mesa: ¿qué debería haber hecho? ¿por qué? 4. Una vez por semana, estudia un concepto concreto (un spot, una textura de tablero, un tipo de mano). La consistencia supera la intensidad: 30 minutos al día de estudio real valen más que 5 horas una vez a la semana." },
              { type: "text", content: "En este curso iremos construyendo el conocimiento capa a capa. Cada lección añade conceptos que se apoyan en los anteriores. No tengas prisa: interiorizar bien los fundamentos vale mucho más que conocer superficialmente conceptos avanzados." },
            ],
          },
          {
            title: "Diccionario del poker — términos esenciales",
            body: [
              { type: "text", content: "El poker tiene su propio lenguaje. Aprender estos términos no es opcional: aparecen constantemente en el estudio, en vídeos, en foros y en las propias situaciones de juego. Esta referencia cubre los más importantes." },
              { type: "callout", label: "Hero y Villain", content: "Hero siempre se refiere al jugador activo en cuya perspectiva estamos analizando la mano — somos nosotros. Villain es su oponente. Estos términos permiten describir situaciones sin revelar el resultado: 'Hero tiene KK, Villain apuesta el bote en el river' es un formato neutro que separa la decisión del resultado. Se usan indistintamente con 'nosotros' y 'el rival'." },
              { type: "callout", label: "Fish y Reg", content: "Fish (pez) o recreativo: jugador que pierde dinero de forma crónica porque comete errores sistemáticos — paga demasiado, no foldea, juega demasiadas manos. Regular o Reg: jugador ganador o competente que estudia y aplica estrategia consistente. En stakes bajos la mayoría de la mesa son fish, lo que es una gran ventaja para el reg." },
              { type: "callout", label: "Las Nuts", content: "Las nuts es la mano más fuerte posible dado el tablero. En un tablero A♠K♠Q♠J♠T♠, las nuts sería cualquier flush de picas por encima del T, o específicamente el Royal Flush. El concepto de 'nuts' es relativo al tablero: en K♥8♦3♣ las nuts son las tres K. Una mano puede ser 'los nuts' o simplemente 'cerca de las nuts'. Saber cuáles son las nuts en cada tablero es fundamental para evaluar la fuerza relativa de tu mano." },
              { type: "callout", label: "Draw — Proyecto de mano", content: "Un draw (proyecto) es una mano incompleta que necesita mejorar con cartas futuras para ganar. Los más comunes: Flush draw (FD): 4 cartas del mismo palo, necesita una quinta. Open-ended straight draw (OESD): 4 cartas consecutivas con dos formas de completar el straight (ej. 6789 completa con 5 o T). Gutshot (GS): 4 cartas al straight con solo una forma de completar (ej. 6 8 9 T completa solo con 7). Backdoor draw: necesitas las dos cartas siguientes para completar." },
              { type: "callout", label: "IP / OOP — Posición en la mano", content: "IP (In Position) significa que actúas después que tu rival en las calles postflop. Es una ventaja enorme: ves su acción antes de decidir, puedes controlar el tamaño del bote y blufear con más eficacia. OOP (Out of Position) es lo contrario: actúas antes, sin información sobre lo que hará el rival. En general, quieres jugar IP siempre que puedas y ser selectivo con las manos que juegas OOP." },
              { type: "callout", label: "Open / Open raise", content: "Abrir el bote (open) significa hacer la primera apuesta voluntaria preflop cuando nadie más ha entrado aún. Específicamente es un raise (subida), no un limp (pagar la ciega). Un open desde UTG a 3x BB significa apostar 3 veces la big blind siendo el primero en actuar. La filosofía básica es: o abres con raise o foldeas. El limp (llamar la ciega sin subir) cede la iniciativa y casi siempre es un error." },
              { type: "callout", label: "Rango — Range", content: "El rango de un jugador es el conjunto de todas las manos con las que tomaría una acción determinada. No piensas 'el rival tiene AK' sino 'el rival tiene un rango de aperturas desde UTG que incluye AA-TT, AKs-AJs, KQs, etc.'. Pensar en rangos en lugar de manos específicas es el salto conceptual más importante del poker moderno." },
              { type: "callout", label: "Equidad / Equity", content: "La equidad de una mano es su porcentaje de probabilidad de ganar el bote si la mano llega a showdown con todas las cartas comunitarias. AK tiene ~67% de equidad frente a QQ antes del flop. La equidad cambia con cada carta que cae. Tener equidad no significa apostar siempre — a veces la equidad se realiza mejor checkando." },
              { type: "callout", label: "SDV — Showdown Value", content: "El Showdown Value (valor en showdown) de una mano es su capacidad de ganar si llega al showdown sin mejorar. Una mano con SDV alto (ej. top pair buena kicker) conviene a veces no apostar para llegar al showdown. Una mano sin SDV (aire, draws fallidos) no tiene valor en showdown y solo gana si fuerza un fold o mejora." },
              { type: "callout", label: "Bluff / Value bet / Semi-bluff", content: "Value bet: apostar esperando ser llamado por manos peores. Bluff: apostar sin mano fuerte para forzar un fold. Semi-bluff: apostar con un draw — si folda el rival, bien; si llama, aún puedes mejorar a la mejor mano. La diferencia entre value y bluff no es lo que tienes, sino la equidad de tu mano frente al rango que te llama." },
              { type: "callout", label: "C-bet — Continuation Bet", content: "La c-bet (continuation bet) es la apuesta del agresor preflop en el flop. Si abriste el bote preflop y pagas el flop, la c-bet es 'continuar la historia': seguiste siendo el agresor. Una value c-bet la haces con una mano fuerte esperando llamadas de manos peores. Una light c-bet la haces sin mano, esperando que el rival foldee." },
              { type: "callout", label: "Effective stack — Stack efectivo", content: "El stack efectivo es el stack más pequeño de los que están en juego en una mano. Si Hero tiene 100BB y Villain tiene 60BB, el stack efectivo es 60BB — eso es todo lo que puede apostarse entre ellos. El stack efectivo determina cuánto se puede ganar o perder en la mano y afecta completamente la estrategia." },
              { type: "callout", label: "Pot odds / Implied odds", content: "Pot odds: la relación entre el tamaño del bote y lo que tienes que pagar para continuar. Si el bote es 10BB y debes pagar 2BB, tienes pot odds de 5:1 (necesitas ganar 1 de cada 6 veces para ser rentable). Implied odds: el crédito adicional que recibes considerando lo que puedes ganar en calles futuras si mejoras tu mano. Los implied odds justifican calls que los pot odds no." },
            ],
          },
          {
            title: "Rake y Rakeback — el coste real de jugar",
            body: [
              { type: "text", content: "El rake es la comisión que cobra la sala de poker por organizar las partidas. No juegas contra la sala — la sala solo cobra por el servicio. Pero ese coste existe y es importante entender exactamente cómo funciona, cuánto te cuesta y cómo minimizarlo." },
              { type: "callout", label: "¿Cómo funciona el rake?", content: "En cash games, la sala cobra un porcentaje del bote — normalmente entre el 4% y el 6% — con un tope máximo por mano (el 'cap'). Ejemplo típico: rake del 5% con cap de 3BB. Si el bote llega a 20BB, la sala se lleva 1BB (el 5%). Si el bote es de 200BB, la sala sigue cobrando solo 3BB (el cap). El rake se descuenta del bote ganado, no se cobra al jugador directamente." },
              { type: "callout", label: "Rake por stakes: cuánto paga cada nivel", content: "En NL2 (ciegas $0.01/$0.02): rake 5%, cap $0.30 → prácticamente el 100% de los botes pequeños va al rake. Es el stake más difícil de batir por rake. NL10 ($0.05/$0.10): rake 5%, cap $1 → más manejable. NL25 ($0.10/$0.25): rake 5%, cap $1.25 → el punto donde el juego ganador se vuelve más viable. A medida que subes de stakes, el rake como porcentaje del dinero en juego disminuye, lo que es una de las razones por las que los stakes altos son más beateables." },
              { type: "text", content: "En la práctica, el rake tiene un impacto enorme en el win rate. Un jugador break-even antes de rake (que toma las mismas decisiones correctas que sus rivales en promedio) pierde dinero porque el rake lo convierte en perdedor neto. Para ganar dinero tienes que ser suficientemente mejor que tus rivales para compensar el rake Y sacar profit." },
              { type: "callout", label: "Rakeback — recuperar parte del rake", content: "El rakeback es un programa de fidelización por el cual la sala devuelve al jugador un porcentaje del rake que ha generado. Si pagas 100$ de rake en un mes y tienes un 30% de rakeback, recibes 30$ de vuelta. En stakes bajos el rakeback puede representar la diferencia entre perder y ganar — o entre un win rate mediocre y uno sólido." },
              { type: "callout", label: "Tipos de programas de rakeback", content: "Rakeback directo: la sala acredita un % fijo del rake a tu cuenta. Puntos VPP/FPP: sistemas de puntos que se canjean por cash, entradas a torneos o bonos. Bonos de bienvenida: muchas salas ofrecen un bono del 100% del primer depósito hasta cierto límite, que se libera gradualmente a medida que generas rake. Programas de lealtad: niveles VIP con beneficios crecientes. Las mejores plataformas en términos de rake+rakeback para stakes bajos varían — investiga comparativas actualizadas antes de elegir sala." },
              { type: "callout", label: "¿Qué sala elegir?", content: "La elección de sala impacta enormemente la rentabilidad. Considera: (1) Tasa de rake y estructura del cap. (2) Programa de rakeback o puntos. (3) Calidad del juego — mesas más blandas compensan un rake más alto. (4) Sofware y usabilidad. (5) Seguridad y historial de la sala. Salas reconocidas: PokerStars, GGPoker, Winamax, 888poker, PartyPoker. Las condiciones cambian — consulta foros especializados como r/poker o 2+2 para reviews actualizadas." },
              { type: "text", content: "La conclusión práctica es esta: el rake no es el enemigo al que hay que temer si juegas bien, pero sí es un factor real que hay que gestionar inteligentemente. Maximiza el rakeback, elige tu sala con cuidado, y asegúrate de que tu win rate es suficientemente positivo para cubrir el rake y aun así terminar en verde." },
            ],
          },
        ],
      },
      {
        id: 1,
        title: "1. Abrir el Bote",
        summary: "Qué es un open, tipos de manos y rangos por posición en 6-max.",
        chapters: [
          {
            title: "¿Qué es abrir el bote?",
            body: [
              {
                type: "text",
                content:
                  "Abrir el bote (open the pot) significa ser el primer jugador en realizar una apuesta antes del flop, específicamente mediante una subida (raise). En un juego de cash 6-max, antes de que empiece la acción preflop, los dos jugadores que ocupan las posiciones de Small Blind (SB) y Big Blind (BB) ya han puesto dinero obligatorio en el bote.",
              },
              {
                type: "text",
                content:
                  "Cuando los jugadores anteriores a ti han pasado (folded) y tú eres el primero en meter fichas con una raise, se dice que has abierto el bote. Este es uno de los conceptos más fundamentales del poker: la acción preflop define el contexto de toda la mano.",
              },
              {
                type: "callout",
                label: "¿Por qué raise y no limp?",
                content:
                  "Entrar al bote solo pagando la ciega (limp) es una jugada débil. No construyes el bote con tus manos buenas, regalas información sobre tu debilidad, y juegas fuera de posición sin iniciativa. El open-raise te da iniciativa, construye el bote y aplica presión sobre los blinds.",
              },
              {
                type: "text",
                content:
                  "El tamaño del open también importa. En cash 6-max moderno, el estándar es abrir a entre 2.5x y 3x el BB. Abrir muy grande asusta a las manos débiles pero también reduce tu EV con manos de valor. Abrir muy pequeño invita a muchos callers y convierte la mano en un multiway pot donde tu ventaja se reduce.",
              },
            ],
          },
          {
            title: "Tipos de manos y clasificación",
            body: [
              {
                type: "text",
                content:
                  "Antes de hablar de rangos por posición, necesitas saber clasificar las manos. En poker hay cuatro categorías principales que determinan cómo juegas una mano preflop y qué objetivos tienes postflop.",
              },
              {
                type: "handCategory",
                categories: [
                  {
                    name: "Manos Premium",
                    color: "#f59e0b",
                    icon: "👑",
                    hands: "AA, KK, QQ, JJ, AKs, AKo",
                    description:
                      "Las manos más fuertes del poker. Siempre las abres desde cualquier posición, y en la mayoría de casos las 3-betteas si hay raise antes que tú. Con ellas quieres construir el bote y llegar al all-in preflop o en calles tempranas.",
                  },
                  {
                    name: "Manos Fuertes",
                    color: "#c9a84c",
                    icon: "💪",
                    hands: "TT, 99, AQs, AJs, AQo, KQs, KQo",
                    description:
                      "Manos con mucha equidad pero que necesitan algo más de cuidado. Las abres desde la mayoría de posiciones y en general las juegas para valor. Postflop quieres hacer top pair fuerte, overpair, o flush/straight draws.",
                  },
                  {
                    name: "Manos Jugables",
                    color: "#10b981",
                    icon: "🎯",
                    hands: "88-66, ATs-A8s, KJs, QJs, JTs, T9s, AJo, KJo",
                    description:
                      "Manos con buen potencial pero dependientes de la posición. Las abres desde posiciones medias-tardías (CO, BTN, SB) y en posiciones tempranas solo las mejores. Buscan flushes, straights, dos pares o top pair con buena kicker.",
                  },
                  {
                    name: "Manos Especulativas",
                    color: "#8b8fa8",
                    icon: "🔮",
                    hands: "55-22, A7s-A2s, K9s-K6s, suited connectors bajos, suited gappers",
                    description:
                      "Manos que necesitan posición y implied odds para ser rentables. Solo las abres desde el BTN, CO y a veces SB. Buscan hacer sets, flushes cerrados y straights. Si no aciertan en el flop, en general las abandonas.",
                  },
                ],
              },
              {
                type: "callout",
                label: "Suited vs Offsuit",
                content:
                  "Una mano suited (del mismo palo) vale aproximadamente 2-4% más de equidad que su versión offsuit. No es solo el flush: la posibilidad de hacer flush añade valor en cada calle y hace que la mano sea más jugable postflop. AKs y AKo son manos muy distintas en términos de jugabilidad, aunque ambas son aberturas en todas las posiciones.",
              },
            ],
          },
          {
            title: "Las posiciones en 6-max",
            body: [
              {
                type: "text",
                content:
                  "En una mesa de 6 jugadores, las posiciones van rotando con cada mano. Cuanto más tarde actúas, más información tienes sobre los jugadores que han actuado antes. La posición es, junto con tus cartas, el factor más importante en poker.",
              },
              {
                type: "tableImage",
              },
              {
                type: "positionMap",
                positions: [
                  { name: "UTG", full: "Under the Gun", desc: "Primero en actuar. Máxima presión, mínima info." },
                  { name: "MP", full: "Middle Position", desc: "Segundo en actuar. Ligeramente más cómodo que UTG." },
                  { name: "CO", full: "Cutoff", desc: "Penúltimo antes del BTN. Posición muy buena." },
                  { name: "BTN", full: "Button", desc: "El mejor asiento. Actúa último en todas las calles postflop." },
                  { name: "SB", full: "Small Blind", desc: "Obligado a poner media ciega. Peor posición postflop." },
                  { name: "BB", full: "Big Blind", desc: "Obligado a poner la ciega entera. Cierra la acción preflop." },
                ],
              },
              {
                type: "callout",
                label: "La regla de oro de la posición",
                content:
                  "Cuanto antes actúas, más ajustado debes ser. UTG puede que tenga 5 jugadores detrás con manos fuertes. El BTN solo tiene los blinds, que tienen posición desventajosa postflop. Esa asimetría define completamente los rangos de apertura.",
              },
            ],
          },
          {
            title: "UTG — Under the Gun",
            body: [
              {
                type: "positionHeader",
                name: "UTG",
                range: "~14%",
                size: "3x BB",
                color: "#ef4444",
              },
              {
                type: "text",
                content:
                  "UTG es la posición más difícil. Actúas el primero de los 6 jugadores y tienes a todos por detrás con la posibilidad de 3-bettear o hacer cold call. Esto significa que tu rango debe ser el más ajustado de la mesa: solo abres manos que soporten mucha presión.",
              },
              { type:"rangeImage", src:orEP, alt:"Rango apertura EP/UTG" },
              {
                type: "text",
                content:
                  "Notarás que desde UTG no abrimos pares pequeños (66-22), casi ningún suited connector bajo ni manos tipo K9s o Q9s. ¿Por qué? Porque estas manos son rentables solo con posición y pocos jugadores detrás. Desde UTG se puede enfrentar un 3-bet o un cold call de CO y BTN, poniendo a estas manos en situaciones difíciles.",
              },
              {
                type: "callout",
                label: "Tamaño: 3x BB",
                content:
                  "Desde UTG usamos 3x (o incluso 3.5x en mesas muy pasivas) para compensar que vamos a jugar muchas calles fuera de posición si los blinds pagan. Una apuesta mayor reduce el número de callers y nos da un bote más manejable.",
              },
            ],
          },
          {
            title: "MP — Middle Position",
            body: [
              {
                type: "positionHeader",
                name: "MP",
                range: "~20%",
                size: "2.5–3x BB",
                color: "#f97316",
              },
              {
                type: "text",
                content:
                  "Desde MP tienes una posición ligeramente mejor que UTG: ya ha actuado un jugador antes que tú, y si ese jugador ha foldeado, solo quedan CO, BTN, SB y BB detrás. Esto te permite ampliar el rango moderadamente.",
              },
              { type:"rangeImage", src:orMP, alt:"Rango apertura MP" },
              {
                type: "text",
                content:
                  "Desde MP ampliamos el rango considerablemente: todos los ases suited (A2s-AKs), pares hasta 55, reyes suited hasta K9s, damas suited hasta Q9s, jacks suited hasta J9s, y suited connectors hasta 65s. El rango crece respecto a UTG porque hay un jugador menos por detrás y las manos especulativas tienen más implied odds.",
              },
              {
                type: "callout",
                label: "Ojo con AJo y KQo desde MP",
                content:
                  "AJo y KQo son manos que parecen fuertes pero tienen dificultades cuando enfrentan un 3-bet: son demasiado débiles para pagar cómodamente y demasiado fuertes para foldear siempre. Desde MP las abrimos, pero en rangos de 3-bet vs 3-bet necesitan estructura clara.",
              },
            ],
          },
          {
            title: "CO — Cutoff",
            body: [
              {
                type: "positionHeader",
                name: "CO",
                range: "~27%",
                size: "2.5x BB",
                color: "#eab308",
              },
              {
                type: "text",
                content:
                  "El Cutoff es una de las posiciones más lucrativas de la mesa. Solo tienes al BTN, SB y BB detrás. El BTN puede pagarte o 3-bettear, pero los blinds jugarán postflop fuera de posición. Esto te permite abrir un rango considerablemente más amplio.",
              },
              {
                type: "text",
                content:
                  "Desde CO heredamos todo el rango de MP y añadimos: 44, K8s, A9o, KJo, QTo y JTo. Con solo BTN y blinds por detrás, las manos con potencial de valor y posición son muy rentables. A9o, QTo y JTo son abribles desde CO porque el contexto posicional lo justifica.",
              },
              { type:"rangeImage", src:orCO, alt:"Rango apertura CO" },
              { type:"callout", label:"🟥 Rojo oscuro vs 🩷 Rosa claro — dos colores, dos situaciones", content:"Las manos en rojo oscuro (desfavorable) las abres siempre, incluso cuando los rivales por detrás son activos o agresivos. Las manos en rosa claro (favorable) son aperturas explotativas: solo son EV+ cuando los jugadores que actúan después de ti foldean con frecuencia — ya sea al open raise, o en caso de que paguen, foldean mucho a la c-bet en el flop. Si el BTN y los blinds son jugadores ajustados que foldean sus blinds más del 70% de las veces, las manos rosas se vuelven directamente rentables. Si son estaciones de pago o jugadores muy activos, descarta las manos rosas." },
              {
                type: "callout",
                label: "ATo desde CO",
                content:
                  "ATo es una apertura válida desde CO, pero hay que manejarla con cuidado frente a 3-bets. No tiene la fuerza para 4-betear light ni la jugabilidad para pagar un 3-bet de forma cómoda fuera de posición. En algunos spots, foldearla ante un 3-bet es perfectamente correcto.",
              },
            ],
          },
          {
            title: "BTN — Button",
            body: [
              {
                type: "positionHeader",
                name: "BTN",
                range: "~42%",
                size: "2.5x BB",
                color: "#10b981",
              },
              {
                type: "text",
                content:
                  "El Button es la posición más poderosa del poker. Actúas último en todas las calles postflop, lo que te da control total sobre el tamaño del bote, la posibilidad de blufear con más eficacia y la ventaja de ver todas las acciones antes de decidir. Esto justifica abrir casi el doble de manos que UTG.",
              },
              { type:"rangeImage", src:orBTN, alt:"Rango apertura BTN" },
              { type:"callout", label:"🟥 Rojo oscuro vs 🩷 Rosa claro — ajuste explotativo BTN", content:"Las manos en rojo oscuro las abres siempre desde BTN. Las manos en rosa claro son aperturas explotativas: son EV+ cuando los blinds foldean con frecuencia al open (SB y BB con Fold to Steal >70%) o cuando pagan pero foldean mucho a tu c-bet en el flop. Desde BTN la ventaja posicional es tan grande que el umbral de apertura explotativa es muy bajo — si los blinds son ajustados o pasivos postflop, casi toda la tabla de color rosa pasa a ser apertura estándar." },
              {
                type: "text",
                content:
                  "Desde BTN abrimos absolutamente todos los pares, todos los ases suited y offsuit, todos los kings suited, kings offsuit hasta K8o, queens suited hasta Q7s, jacks suited hasta J7s, tens suited hasta T7s, y una amplia gama de suited gappers. Con solo los blinds detrás actuando OOP, incluso manos como Q7s o 74s son rentables a largo plazo.",
              },
              {
                type: "callout",
                label: "¿Por qué tan amplio?",
                content:
                  "Porque la ventaja posicional es tan grande que incluso manos mediocres se vuelven rentables. Postflop verás todas las acciones de SB y BB antes de actuar. Esa información vale mucho dinero en el largo plazo. Además, abrir amplio construye una imagen activa que te permite presionar a los blinds sistemáticamente.",
              },
            ],
          },
          {
            title: "SB — Small Blind",
            body: [
              {
                type: "positionHeader",
                name: "SB",
                range: "~35%",
                size: "3x BB",
                color: "#8b5cf6",
              },
              {
                type: "text",
                content:
                  "El Small Blind es la posición más compleja del juego. Tienes que poner media ciega obligatoria y, si abres, siempre jugarás postflop fuera de posición contra el BB (que actuará después de ti en todas las calles). Esto hace que el SB sea estructuralmente el puesto más difícil para abrir y jugar manos.",
              },
              {
                type: "text",
                content:
                  "Sin embargo, cuando los jugadores anteriores han foldeado y solo tienes al BB detrás, la situación cambia radicalmente: estás jugando heads-up. Dado que es un enfrentamiento de dos jugadores donde el BB actúa OOP postflop, se puede abrir un rango muy amplio — prácticamente el 62% de las manos. La clave es usar un tamaño de 3x para compensar la desventaja posicional.",
              },
              { type:"rangeImage", src:orSB, alt:"Rango apertura SB" },
              { type:"callout", label:"🟥 Rojo oscuro vs 🩷 Rosa claro — ajuste explotativo SB", content:"Desde SB las manos en rojo oscuro las abres siempre contra el BB. Las manos en rosa claro son explotativas: solo abres estas manos cuando el BB foldea con frecuencia — tanto al open (Fold to SB Steal >60%) como a la c-bet en el flop. Si el BB es un calling station que defiende muy amplio y nunca foldea postflop, descarta las manos rosas: no tienen suficiente equity para ser rentables sin fold equity." },
              {
                type: "callout",
                label: "Tamaño: 3x BB desde SB",
                content:
                  "Abrimos a 3x (en lugar de 2.5x) desde el SB por dos razones: primero, queremos compensar la desventaja posicional reduciendo el número de callers. Segundo, el BB ya tiene 1 BB en el bote, así que una apuesta de 3x solo le cuesta 2 BB adicionales — si abriéramos a 2.5x, le daríamos odds demasiado buenas para defender con un rango muy amplio.",
              },
              {
                type: "text",
                content:
                  "Una estrategia alternativa moderna es usar un rango de 3-bet desde SB en lugar de abrir muchas manos. Si hay un raise de BTN o CO, a menudo es mejor 3-bettear con las mejores manos y foldear el resto, en lugar de hacer cold call (que te deja OOP sin iniciativa).",
              },
            ],
          },
          {
            title: "Ajustes según el tipo de rival",
            body: [
              {
                type: "text",
                content: "Todo lo que hemos visto hasta ahora es una estrategia equilibrada: funciona razonablemente bien contra cualquier tipo de rival porque no tiene fugas explotables evidentes. Pero en stakes bajos, la gran mayoría de los jugadores no juegan equilibrado — y eso es una oportunidad enorme para ti.",
              },
              {
                type: "text",
                content: "El juego explotativo consiste en detectar el desequilibrio de un rival y ajustar tu estrategia para maximizar el profit frente a ese desequilibrio concreto. Aplicado a los rangos de apertura, hay dos situaciones clave:",
              },
              {
                type: "callout",
                label: "Nits por detrás → amplía el rango",
                content: "Un jugador nit es aquel que juega muy pocas manos y rara vez 3-betea sin tener manos premium. Si en BTN o CO tienes uno o dos nits por detrás, puedes abrir más manos de las que dictaría el rango estándar. Los nits van a foldear sus blinds la mayoría de las veces, y si entran al bote lo hacen con rangos tan ajustados que sabrás dónde estás parado. Ampliar el rango contra nits es directamente rentable: robas más ciegas y juegas más botes en posición.",
              },
              {
                type: "callout",
                label: "Maniacs o 3-bettors agresivos → cierra el rango",
                content: "Si el jugador sentado en BTN 3-betea el 15-20% de tus aperturas, abrir manos marginales desde CO o MP se convierte en una pérdida de dinero. Manos como Q9s, KTo o A7o difícilmente aguantan un 3-bet: son demasiado débiles para 4-betear y demasiado incómodas para pagar OOP. La solución es eliminar las manos más débiles del rango hasta que solo abras manos que tengan una respuesta clara frente al 3-bet.",
              },
              {
                type: "text",
                content: "Esta dinámica se aplica a cada posición. Antes de abrir cualquier mano, dedica un segundo a pensar: ¿quién tengo por detrás? ¿es un nit, un regular o alguien muy agresivo? Esa lectura rápida vale más que memorizar rangos exactos.",
              },
              {
                type: "callout",
                label: "Estrategia equilibrada vs. estrategia explotativa",
                content: "La estrategia que hemos presentado en esta lección es equilibrada: está diseñada para no ser explotada por un rival que juega perfectamente. Pero en stakes bajos, nadie juega perfectamente. Si tu rival está claramente desequilibrado (foldea demasiado, paga demasiado, 3-betea demasiado), la jugada correcta es desviarte del equilibrio y explotar ese desequilibrio directamente. En el largo plazo, la estrategia explotativa tiene más EV que la equilibrada cuando los rivales tienen fugas claras.",
              },
            ],
          },
          {
            title: "Consistencia en el tamaño del open",
            body: [
              {
                type: "text",
                content: "Uno de los errores más frecuentes en jugadores de nivel bajo e intermedio es variar el tamaño del open según la fuerza de la mano desde la misma posición. Por ejemplo: abrir AA a 5x porque quieren 'protegerla', y luego abrir 76s a 2.5x porque 'no quieren comprometer mucho'. Esto es un error grave.",
              },
              {
                type: "callout",
                label: "Por qué variar el tamaño revela tu mano",
                content: "Si siempre abres a 3x con tus manos fuertes y a 2x con las manos especulativas, un rival atento aprenderá a leer el tamaño de tu apuesta. Cuando abres a 3x, foldeará las manos medias y solo continuará con sus mejores manos. Cuando abres a 2x, intentará florearte o 3-bettear porque sabe que tienes algo débil. Estás dándole información gratuita en cada mano.",
              },
              {
                type: "text",
                content: "La solución es usar un tamaño estándar desde cada posición independientemente de las cartas que tengas. Si desde CO abres a 2.5x, eso aplica tanto para AA como para 87s. Tu tamaño no debe revelar nada sobre tu fuerza.",
              },
              {
                type: "callout",
                label: "¿Pueden variar los tamaños entre posiciones?",
                content: "Sí. Es totalmente correcto abrir a 3x desde UTG y a 2.5x desde BTN — porque el tamaño cambia según la posición, no según la mano. Lo que no puedes hacer es abrir AK a 4x y 65s a 2x desde la misma posición. Dentro de cada posición, un solo tamaño estándar.",
              },
              {
                type: "text",
                content: "Una excepción válida: en mesas muy pasivas con varios limpers, a veces tiene sentido aumentar el tamaño del iso-raise para limpiar el bote. Pero eso aplica igual a todas las manos que iso-raises desde esa situación, no solo a las fuertes.",
              },
            ],
          },
          {
            title: "Ejercicios: ¿Qué harías tú?",
            body: [
              {
                type: "text",
                content: "Pon a prueba lo aprendido. En cada situación tienes información sobre tu posición, tus cartas y el perfil de los jugadores que tienes por detrás. Elige la mejor jugada.",
              },
              {
                type: "quiz",
                questions: [
                  {
                    situation: "Mesa $0.10/$0.25 · 6-max · Estás en BTN",
                    hand: "K♠ 5♠",
                    context: "UTG, MP y CO han foldeado. El SB es un nit que folda a los opens el 80% de las veces. El BB también es un jugador ajustado que defiende poco.",
                    question: "¿Qué haces con K5s en BTN?",
                    options: [
                      { label: "Foldear — K5s es demasiado débil", correct: false, explanation: "K5s entra perfectamente en el rango del BTN (~55%). No es una mano premium, pero tiene flush draw potencial y contra nits que foldean mucho, robar los blinds es directamente rentable." },
                      { label: "Abrir a 2.5x BB", correct: true, explanation: "¡Correcto! K5s es una apertura estándar desde BTN, y con dos nits por detrás que foldean muy a menudo, incluso amplías un poco el rango respecto al estándar. Abrir a 2.5x con tamaño consistente es la jugada perfecta." },
                      { label: "Pagar la ciega (limp)", correct: false, explanation: "El limp es una jugada débil. Pierdes la iniciativa, no construyes el bote y regalas información de debilidad. Desde BTN siempre o abres o foldeas." },
                      { label: "Abrir a 5x para protegerte", correct: false, explanation: "Abrir grande no 'protege' las manos débiles — solo aumenta lo que arriesgas sin mejorar tu equidad. Además, variar el tamaño según la fuerza de la mano es una fuga explotable." },
                    ],
                  },
                  {
                    situation: "Mesa $0.05/$0.10 · 6-max · Estás en CO",
                    hand: "Q♣ 9♣",
                    context: "UTG y MP han foldeado. El BTN es un jugador muy agresivo que 3-betea tus aperturas aproximadamente el 20% de las veces.",
                    question: "¿Qué haces con Q9s en CO teniendo un BTN muy agresivo?",
                    options: [
                      { label: "Abrir a 2.5x — Q9s es apertura estándar de CO", correct: false, explanation: "Q9s es apertura estándar de CO en teoría, pero frente a un BTN que 3-betea el 20%, se convierte en un problema: no es suficientemente fuerte para 4-betear con valor y es incómoda para pagar un 3-bet fuera de posición." },
                      { label: "Foldear directamente", correct: true, explanation: "¡Correcto! Contra un BTN hiper-agresivo, la jugada explotativa es cerrar el rango y eliminar las manos que no aguantan bien un 3-bet. Q9s es exactamente ese tipo de mano: demasiado débil para 4-betear, demasiado marginal para pagar OOP." },
                      { label: "Abrir a 4x para disuadirle de 3-betear", correct: false, explanation: "Aumentar el tamaño no disuade a un jugador agresivo — probablemente lo incentiva más. Además, variar el tamaño revela información sobre tu rango." },
                      { label: "Pagar la ciega para ver flop barato", correct: false, explanation: "Hacer limp desde CO es una jugada débil que regala la iniciativa sin conseguir nada. Si decides jugar la mano, siempre con un open-raise." },
                    ],
                  },
                  {
                    situation: "Mesa $0.25/$0.50 · 6-max · Estás en MP",
                    hand: "A♥ A♦",
                    context: "UTG ha foldeado. Tienes AA. Normalmente abres a 2.5x desde MP, pero piensas en subir a 5x para 'proteger' tu mano.",
                    question: "¿Con qué tamaño abres AA desde MP?",
                    options: [
                      { label: "Abrir a 5x para proteger la mano fuerte", correct: false, explanation: "Abrir AA más grande que el resto de manos es una fuga enorme. Los rivales aprenderán que tamaños grandes = manos fuertes y foldearán todo. Ganarás poco con tus mejores manos." },
                      { label: "Abrir a 2.5x (tu tamaño estándar)", correct: true, explanation: "¡Correcto! AA se abre exactamente igual que cualquier otra mano desde MP. La consistencia en el sizing es fundamental: tu tamaño no debe revelar nada sobre tu fuerza. Con AA quieres acción, no ahuyentar rivales." },
                      { label: "Pagar la ciega (limp) para hacer trampa", correct: false, explanation: "El limp con AA (slow play preflop) es un error clásico. Dejas que todos entren barato con manos que pueden hacerte perder si aciertan en el flop. Siempre se abre con raise." },
                      { label: "Abrir a 2x para invitar acción", correct: false, explanation: "Abrir a un tamaño menor con tus mejores manos también revela información. Si abres a 2x con AA y a 2.5x con el resto, los rivales atentos lo detectarán y ajustarán." },
                    ],
                  },
                  {
                    situation: "Mesa $0.10/$0.25 · 6-max · Estás en UTG",
                    hand: "A♠ 9♠",
                    context: "Eres el primero en actuar. La mesa tiene regulares sólidos en todas las posiciones. Nadie tiene tendencias extremas.",
                    question: "¿Qué haces con A9s desde UTG?",
                    options: [
                      { label: "Foldear — A9s es demasiado débil desde UTG", correct: false, explanation: "A9s entra en el rango estándar de UTG (~14%). Tiene buen potencial de flush y top pair con buena kicker. No es necesario foldearla desde UTG." },
                      { label: "Abrir a 3x BB", correct: true, explanation: "¡Correcto! A9s está incluida en el rango UTG. Contra regulares sólidos sin tendencias extremas, la estrategia equilibrada es la correcta: abre a tu tamaño estándar de 3x." },
                      { label: "Pagar la ciega para ver flop barato", correct: false, explanation: "El limp pierde la iniciativa, regala información y te deja vulnerable a raises de las posiciones tardías. Nunca hagas limp desde UTG." },
                      { label: "Abrir a 2x porque es una mano intermedia", correct: false, explanation: "No existe el 'tamaño intermedio para manos intermedias'. Un solo tamaño estándar desde cada posición, independientemente de las cartas." },
                    ],
                  },
                  {
                    situation: "Mesa $0.10/$0.25 · 6-max · Estás en SB",
                    hand: "J♦ 8♦",
                    context: "Todos los jugadores hasta el BTN han foldeado. Solo queda el BB, que es un jugador muy activo que 3-betea tus aperturas desde SB el 25% de las veces. Abres a 3x y el BB te mete un 3-bet.",
                    question: "Abres J8s desde SB, el BB te hace un 3-bet. ¿Qué haces?",
                    options: [
                      { label: "Pagar el 3-bet y jugar el flop OOP", correct: false, explanation: "Pagar un 3-bet con J8s fuera de posición no es rentable de forma consistente. Sin iniciativa y actuando primero en cada calle, esta mano pierde mucho valor. Necesitas manos con más equidad o con blockers para pagar 3-bets OOP." },
                      { label: "Foldear — J8s no aguanta bien el 3-bet OOP", correct: true, explanation: "¡Correcto! Abrir J8s desde SB es perfectamente válido — es una mano dentro del rango. El ajuste contra un BB agresivo no es dejar de abrirla, sino tener claro qué harás cuando llegue el 3-bet: J8s no tiene suficiente equidad para pagar OOP ni blockers relevantes para 4-betear como bluff. Abres y foldeas al 3-bet." },
                      { label: "4-betear como bluff para presionar al BB", correct: false, explanation: "Un 4-bet bluff con J8s no tiene mucho sentido: no bloqueas las manos fuertes del BB (no tienes A ni K) y el BB agresivo probablemente esté encantado de pagar o meter un 5-bet. Reserva los 4-bet bluffs para manos con blockers como A5s o K4s." },
                      { label: "Completar la ciega en lugar de abrir", correct: false, explanation: "Completar desde SB (limp) en lugar de abrir ya fue el error antes del 3-bet. La mano merece un open-raise a 3x — el problema no es abrirla, sino saber folderarla cuando el BB 3-betea." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: "2. Cuando Alguien Limpea",
        summary: "Por qué el limp es malo, cómo explotarlo con el ISO raise y rangos por posición.",
        chapters: [
          {
            title: "¿Por qué es malo pagar la ciega?",
            body: [
              { type: "text", content: "Pagar la ciega (limp) significa entrar al bote igualando el BB en lugar de hacer raise. Aunque parece una jugada conservadora, es uno de los errores más comunes y costosos en stakes bajos — y uno de los más fáciles de explotar." },
              { type: "callout", label: "Los 3 problemas del limp", content: "1. Sin iniciativa: el limper nunca tiene el control de la mano. En el flop va a checkear casi siempre, lo que le convierte en fácil de presionar. 2. Rango expuesto: un limper raramente tiene AA-QQ o AKs. Si las tuviera, haría raise. Esto significa que su rango está 'capped' por arriba y todos los demás jugadores lo saben. 3. Bote multiway: limping invita a otros jugadores a entrar barato. Cuantos más jugadores hay en el bote, más se diluye la ventaja de cualquier mano." },
              { type: "text", content: "El limp es especialmente dañino desde posiciones tempranas porque invita a toda la mesa a ver el flop barato. Pero incluso desde el BTN o SB tiene los mismos problemas fundamentales: el limper llega al flop sin iniciativa, con un rango identificable como débil, y en un bote que puede ser multiway." },
              { type: "callout", label: "El rango del limper está 'capped'", content: "Capped significa que el rango tiene un techo de fuerza. Un jugador que limpa preflop nunca tiene AA, KK, QQ, JJ ni AKs — esas manos siempre abren con raise. Esta información es pública y cambia completamente cómo debes reaccionar a sus apuestas postflop: cuando el limper apuesta fuerte en el flop, su mano no puede ser muy premium. Puedes presionarle con mucha más frecuencia que a un agresor normal." },
              { type: "text", content: "En resumen: el limp es malo porque cede la iniciativa, revela debilidad de rango y construye botes multiway donde el limper no tiene ventaja táctica. En stakes bajos, los limpers son una de las fuentes de profit más grandes — siempre que sepas cómo explotarlos correctamente." },
            ],
          },
          {
            title: "El ISO raise — cómo explotar al limper",
            body: [
              { type: "text", content: "El ISO raise (raise de aislamiento) consiste en subir después de uno o varios limpers con el objetivo de quedarte heads-up contra ellos. Aprovechas que tienen un rango débil y capped, y que tú tienes la iniciativa y, normalmente, posición." },
              { type: "text", content: "Cuando haces un ISO raise correcto consigues tres cosas a la vez: tomás la iniciativa como agresor preflop, forzas a los otros jugadores a pagar demasiado para continuar (o foldean), y te quedas solo contra la mano débil del limper con todo el contexto a tu favor." },
              { type: "callout", label: "¿Cuándo ISO raisear?", content: "Casi siempre desde BTN y CO vs un solo limper fish. La combinación de posición + agresor + rango capped del limper hace que el ISO sea rentable con un rango muy amplio. Desde MP el ISO sigue siendo correcto pero con un rango más ajustado porque tienes más jugadores detrás que pueden 3-betear o cold-callear." },
              { type: "callout", label: "¿Cuándo NO hacer ISO?", content: "Con 3+ limpers y mano especulativa: la equidad se diluye demasiado en bote multiway. Cuando el limper es un regular sólido (rara vez limpa, probablemente tiene trampa). Cuando tu mano no justifica el riesgo: manos muy débiles deben foldearse directamente en lugar de hacer ISO desde posición temprana." },
              { type: "text", content: "Una situación especial: el limp-reraise. Algunos jugadores experimentados hacen limp para re-raise si alguien sube. Si sospechas que un jugador usa esta táctica, reduce el rango de ISO o evítalo completamente. Los regulares nunca hacen limp sin intención, así que el perfil del limper importa mucho." },
            ],
          },
          {
            title: "Sizing del ISO raise",
            body: [
              { type: "text", content: "El sizing del ISO raise es siempre mayor que el open estándar. La razón es simple: si solo subes a 2.5x-3x, el limper y el resto de jugadores tienen buenos pot odds para pagar. Necesitas abrir más grande para hacer la entrada cara y quedarte heads-up." },
              { type: "callout", label: "La regla del ISO", content: "Tamaño base 3x BB + 1BB por cada limper en el bote. Ejemplos: 1 limper → sube a 4BB. 2 limpers → sube a 5BB. 3 limpers → sube a 6BB. Si el limper está en SB y tú en BB: ISO a 4BB mínimo, ya que estás OOP." },
              { type: "text", content: "Algunos jugadores usan base de 4x en lugar de 3x, especialmente en mesas muy pasivas o contra limpers que son calling stations (pagan todo). Esto es válido y a veces preferible: el objetivo siempre es quedar heads-up o con pocas personas donde tu ventaja posicional sea máxima." },
              { type: "callout", label: "No ISO demasiado grande", content: "Si tu ISO es de 8x, 10x o más, estás arriesgando demasiado cuando alguien hace 3-bet. Además, con tamaños muy grandes el limper foldeará manos con las que estaría 'donando' al bote. Mantén el ISO entre 4BB y 6BB en la mayoría de situaciones. La excepción es en juego live o mesas muy pasivas donde toda la mesa paga cualquier tamaño — ahí sí se justifica abrir más grande." },
              { type: "text", content: "El tamaño debe ser siempre el mismo independientemente de tu mano. Así como en el open estándar, usar el mismo ISO size con AA que con T8s es fundamental para no revelar información sobre tu rango al limper y al resto de jugadores." },
            ],
          },
          {
            title: "Rangos de ISO — MP vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_MP", range: "~24%", size: "4x BB", color: "#f97316" },
              { type:"rangeImage", src:rolMP, alt:"ROL / MP" },
              { type:"callout", label:"🟥 Rojo oscuro vs 🩷 Rosa claro — ISO explotativo desde MP", content:"Las manos en rojo oscuro son el core del rango: las usas para ISO siempre, independientemente del tipo de jugadores por detrás. Las manos en rosa claro son ISOs explotativos: solo son EV+ cuando los jugadores que actúan después de ti (CO, BTN, blinds) foldean con frecuencia — ya sea al raise de ISO, o si pagan, foldean mucho a tu c-bet. Desde MP, dado que tienes 4 jugadores por detrás, el umbral es más alto: solo añades las manos rosas cuando la mesa es muy pasiva o cuando los jugadores específicos a tu izquierda son muy ajustados." },
              { type: "text", content: "Desde MP el ISO es considerablemente más ajustado. Tienes a CO, BTN y los blinds por detrás — cuatro jugadores que pueden entrar al bote o hacerte 3-bet. Solo deberías ISO desde MP con manos que aguanten presión y que tengan clara ventaja sobre el rango del limper." },
                            { type: "callout", label: "La regla práctica desde MP", content: "Si dudarías en abrir la mano desde MP en un spot normal, probablemente tampoco deberías hacer ISO. El hecho de que haya un limper no cambia dramáticamente el rango desde MP — sí amplía ligeramente, pero la presión de los jugadores por detrás sigue siendo la misma." },
            ],
          },
          {
            title: "Rangos de ISO — CO vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_CO", range: "~32%", size: "4x BB", color: "#eab308" },
              { type:"rangeImage", src:rolCO, alt:"ROL / CO" },
              { type:"callout", label:"🟥 Rojo oscuro vs 🩷 Rosa claro — ISO explotativo desde CO", content:"Las manos en rojo oscuro las usas para ISO siempre desde CO. Las manos en rosa claro son explotativas: son EV+ cuando el BTN y los blinds foldean frecuentemente al raise (Fold to ISO >65%) o cuando pagan el ISO pero foldean mucho a tu c-bet en el flop. Con solo 3 jugadores por detrás desde CO, el umbral de ISO explotativo es más accesible que desde MP." },
              { type: "text", content: "Desde CO con un limper delante, el rango es más ajustado que desde BTN porque tienes al BTN y los blinds por detrás — cualquiera puede cold-callear o 3-betear. Aun así, el ISO desde CO sigue siendo más amplio que el open estándar de CO." },
                            { type: "callout", label: "Ajuste con BTN agresivo", content: "Si el BTN es un jugador que 3-betea mucho, ajusta el rango de ISO desde CO hacia arriba: elimina las manos más débiles (A4s, K8s, 64s) que no aguantan bien un 3-bet y conserva las que tienen respuesta clara (AA-77, AJs+, KQs)." },
            ],
          },
          {
            title: "Rangos de ISO — BTN vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_BTN", range: "~50%", size: "4x BB", color: "#10b981" },
              { type:"rangeImage", src:rolBTN, alt:"ROL / BTN" },
              { type:"callout", label:"🟥 Rojo oscuro vs 🩷 Rosa claro — ISO explotativo desde BTN", content:"Las manos en rojo oscuro son el core del rango de ISO desde BTN — siempre rentables con posición perfecta. Las manos en rosa claro son explotativas: son EV+ cuando los blinds foldean frecuentemente al ISO (Fold to ISO >60%) o cuando pagan pero ceden postflop a la c-bet. Desde BTN el umbral es muy bajo porque ya tienes la posición más favorable — en la práctica, casi toda la tabla rosa se convierte en ISO estándar contra blinds ajustados." },
              { type: "text", content: "Desde el BTN con un solo limper delante, tu rango de ISO es enorme: aproximadamente el 50% de las manos. La combinación de posición perfecta (actúas último en todas las calles), el rango débil del limper y el hecho de que solo hay dos jugadores detrás (SB y BB, que suelen foldear) lo justifica." },
                            { type: "callout", label: "¿Por qué tan amplio?", content: "Porque incluso manos mediocres tienen +EV en esta situación: el limper tiene un rango capped y débil, tú tienes posición, y la iniciativa hace que seas tú quien dicta el ritmo de la mano postflop. Manos como Q7s o 73s que no abrirías normalmente se vuelven ISOs rentables desde BTN." },
            ],
          },
          {
            title: "Rangos de ISO — SB vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_SB", range: "~30%", size: "4x BB", color: "#8b5cf6" },
              { type:"rangeImage", src:rolSB, alt:"ROL / SB" },
              { type:"callout", label:"🟥 Rojo oscuro vs 🩷 Rosa claro — ISO explotativo desde SB", content:"Las manos en rojo oscuro las usas para ISO siempre desde SB. Las manos en rosa claro son explotativas: son EV+ cuando el BB foldea con frecuencia al ISO o a tu c-bet postflop. Ten en cuenta que desde SB juegas OOP contra el limper — las manos rosas requieren más fold equity para ser rentables precisamente porque no tienes la ventaja posicional que sí tienes desde CO o BTN." },
              { type: "text", content: "Desde SB con un limper delante la situación es especial: solo tienes al BB por detrás, pero jugarás postflop fuera de posición contra el limper. Esto ajusta el rango hacia manos con más equidad y menos dependencia de la posición." },
              { type: "callout", label: "ISO desde SB vs limp", content: "El ISO desde SB es rentable pero exige más cuidado: el limper puede tener manos trampa y vas OOP. Prioriza manos con valor directo (pares medianos-altos, broadways) y suited connectors con buen potencial de equity. Las manos muy especulativas pierden valor fuera de posición." },
            ],
          },
          {
            title: "ISO vs 2+ limpers",
            body: [
              { type: "text", content: "Con dos o más limpers, el bote crece pero también crecen los problemas: más jugadores = más probabilidades de que alguien tenga una mano fuerte o floppe algo. El ISO con múltiples limpers requiere manos con más potencial de equidad en botes multiway." },
              { type: "callout", label: "Tamaño con 2 limpers", content: "2 limpers → ISO a 5BB mínimo. 3 limpers → ISO a 6BB. El objetivo es el mismo: hacer que el bote sea caro para jugadores que entrarían barato." },
                            { type: "callout", label: "Con 3+ limpers", content: "Con 3 o más limpers el bote se vuelve muy multiway y el ISO pierde eficacia a menos que tengas una mano muy fuerte (AA-QQ, AKs, AKo) o manos con mucho potencial de equidad en multiway (AXs, suited connectors altos, pares medianos para set mining). Las manos tipo K7s o Q6s directamente foldean con 3+ limpers." },
            ],
          },
          {
            title: "Ejercicios: Situaciones con limpers",
            body: [
              { type: "text", content: "Pon a prueba lo aprendido. En cada situación hay uno o varios limpers en el bote. Decide la mejor jugada." },
              { type: "quiz", questions: [
                {
                  situation: "Mesa $0.10/$0.25 · BTN · UTG ha limpeado",
                  hand: "T♠ 8♠",
                  context: "UTG es un jugador recreativo (fish) que limpa frecuentemente. CO ha foldeado. Estás en BTN.",
                  question: "¿Qué haces con T8s en BTN vs el limper fish de UTG?",
                  options: [
                    { label: "ISO raise a 4BB", correct: true, explanation: "¡Correcto! T8s desde BTN vs 1 limper fish es ISO claro. Tienes posición perfecta, el limper tiene rango capped y débil, y T8s tiene buen potencial de straight y flush. Sube a 4BB (3x + 1 por el limper)." },
                    { label: "Foldear — T8s es demasiado débil", correct: false, explanation: "T8s está cómodamente en el rango de ISO desde BTN vs 1 limper (~50%). Con posición y un limper fish, es una apertura clara a 4BB." },
                    { label: "Pagar también (limp behind)", correct: false, explanation: "Limpar detrás (overlimping) es casi siempre un error: entras al bote sin iniciativa, sin información y en un bote multiway. Con T8s en BTN deberías ISO o foldear, nunca overlimpar." },
                    { label: "Abrir a 2.5x (tamaño estándar)", correct: false, explanation: "Con un limper en el bote el tamaño estándar de 2.5x es insuficiente — el limper y los blinds tienen odds demasiado buenas para pagar. El ISO vs limper siempre va a tamaño mayor: 4BB mínimo." },
                  ],
                },
                {
                  situation: "Mesa $0.10/$0.25 · CO · MP ha limpeado",
                  hand: "2♠ 2♣",
                  context: "MP es un jugador pasivo que limpa mucho. UTG ha foldeado. Estás en CO con 22.",
                  question: "¿Qué haces con 22 en CO vs el limper de MP?",
                  options: [
                    { label: "ISO raise a 4BB", correct: true, explanation: "¡Correcto! 22 desde CO vs 1 limper es ISO. Tienes posición, el par te da potencial de set y el rango del limper es débil. Si aciertas el set en el flop (1 de cada 8 veces) tendrás una mano muy fuerte en un bote con iniciativa." },
                    { label: "Foldear — 22 es muy débil para ISO", correct: false, explanation: "22 entra en el rango ISO de CO vs limper. El set mining es rentable en posición con implied odds de un fish que pagará calles. ISO a 4BB." },
                    { label: "Pagar también (limp behind)", correct: false, explanation: "Overlimpar con 22 es tentador pero incorrecto. Sin iniciativa, el bote se vuelve multiway y pierdes control. ISO a 4BB o fold — never limp." },
                    { label: "Foldear — 22 no aguanta un 3-bet", correct: false, explanation: "Si alguien hace 3-bet puedes foldear 22 sin problema — eso no significa que no debas hacer el ISO inicial. Haz el ISO a 4BB y si hay 3-bet, foldeas. El EV del ISO es positivo aunque a veces tengas que foldar al 3-bet." },
                  ],
                },
                {
                  situation: "Mesa $0.25/$0.50 · MP · UTG ha limpeado",
                  hand: "K♠ 6♠",
                  context: "UTG es un jugador recreativo. Estás en MP con K6s. CO, BTN y los blinds todavía por actuar.",
                  question: "¿Qué haces con K6s en MP vs el limper de UTG?",
                  options: [
                    { label: "ISO raise a 4BB", correct: false, explanation: "K6s no está en el rango ISO de MP. Tienes a CO, BTN y blinds por detrás que pueden 3-betear o cold-callear. K6s no aguanta bien esa presión y no está en las manos que ISO desde MP (~24%). Aquí la jugada es fold." },
                    { label: "Foldear", correct: true, explanation: "¡Correcto! K6s no está en el rango ISO de MP. El rango ISO desde MP es más ajustado por la presión de los jugadores por detrás. Necesitas K9s o mejor desde MP para ISO. Con K6s la mejor jugada es foldear y esperar un mejor spot." },
                    { label: "Pagar también (limp behind)", correct: false, explanation: "Overlimpar es casi siempre incorrecto. Entrarías sin iniciativa a un bote multiway con una mano mediocre. Si K6s no justifica el ISO, tampoco justifica el limp behind." },
                    { label: "ISO raise a 2.5x", correct: false, explanation: "Con un limper, 2.5x es insuficiente — les das odds muy buenas para continuar. Además K6s no está en el rango ISO de MP, así que la jugada correcta es foldear directamente." },
                  ],
                },
                {
                  situation: "Mesa $0.10/$0.25 · BTN · UTG y MP han limpeado",
                  hand: "A♥ J♥",
                  context: "UTG es un fish y MP es un jugador pasivo. Dos limpers en el bote. Estás en BTN con AJs.",
                  question: "¿A qué tamaño haces el ISO con AJs en BTN vs 2 limpers?",
                  options: [
                    { label: "ISO a 5BB", correct: true, explanation: "¡Correcto! Con 2 limpers el tamaño es: 3x base + 1BB por cada limper = 5BB. AJs es una mano excelente para ISO: tiene mucha equidad, potencial de flush y top pair fuerte. Con posición y 2 fishs en el bote, el EV es muy alto." },
                    { label: "ISO a 3BB (tamaño normal)", correct: false, explanation: "Con 2 limpers en el bote, abrir a 3BB da odds demasiado buenas a todos para continuar. El bote se volvería multiway de 4-5 jugadores donde tu ventaja se diluye. La regla: 3x base + 1BB por limper = 5BB." },
                    { label: "ISO a 8BB para limpiar el bote", correct: false, explanation: "ISO excesivamente grande es un error: arriesgas demasiado y, paradójicamente, puedes asustar incluso a los fishs que querías que pagaran. 5BB es suficiente. Además, tamaños variables revelan información sobre tu mano." },
                    { label: "Pagar también — AJs juega bien multiway", correct: false, explanation: "Overlimpar con AJs es un grave error. Renuncias a toda la iniciativa y valor de una mano fuerte. AJs merece iso raise siempre que haya limpers." },
                  ],
                },
                {
                  situation: "Mesa $0.10/$0.25 · SB · BTN ha limpeado",
                  hand: "9♣ 8♣",
                  context: "BTN es un jugador recreativo que limpa frecuentemente. Estás en SB con 98s. El BB todavía por actuar.",
                  question: "¿Qué haces con 98s en SB vs el limper del BTN?",
                  options: [
                    { label: "ISO raise a 4BB", correct: true, explanation: "¡Correcto! 98s desde SB vs limper es ISO. Tienes una mano con excelente potencial de straight y flush, el limper tiene rango capped, y aunque irás OOP postflop, la mano justifica el ISO. Sube a 4BB (base 3x + 1 por el limper)." },
                    { label: "Completar la ciega (pagar)", correct: false, explanation: "Completar desde SB (limp) mete a BB gratis al bote y crea un bote de 3 jugadores sin iniciativa. Esto es exactamente lo que querías evitar. Con 98s suited y un limper débil, el ISO a 4BB es claramente superior." },
                    { label: "Foldear — 98s no aguanta bien OOP", correct: false, explanation: "98s tiene suficiente potencial para justificar el ISO incluso OOP. La mano tiene draw potencial fuerte y en muchos flops podrás aplicar presión. El EV del ISO es positivo aquí." },
                    { label: "ISO a 2x — tamaño pequeño para ver si alguien 3-betea", correct: false, explanation: "Usar un tamaño pequeño para 'testear' no tiene sentido estratégico y revela debilidad. Además 2x con un limper da odds demasiado buenas. Usa siempre el tamaño correcto: base + 1BB por limper = 4BB." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 3,
        title: "3. El Continuation Bet",
        summary: "Cuándo apostar el flop como agresor, texturas de tablero, sizing y cuándo checkear.",
        chapters: [
          {
            title: "La iniciativa: el concepto más importante del postflop",
            body: [
              { type:"text", content:"Antes de hablar del C-bet, hay que entender el concepto que lo hace posible: la iniciativa. La iniciativa es el derecho implícito a apostar primero en una calle porque fuiste el último en subir en la calle anterior. El jugador que hizo el último raise preflop llega al flop con iniciativa." },
              { type:"callout", label:"¿Qué significa tener iniciativa?", content:"Tener iniciativa significa que el rival te cede el primer turno de acción esperando que apuestes. Si abres desde BTN y el BB paga, el BB va a checkear en el flop la mayoría de las veces — porque eres el agresor y se espera que continues. Esa expectativa es un arma: puedes apostar con manos fuertes para extraer valor, y también con manos débiles para robar el bote. El rival no puede saber cuál es cuál." },
              { type:"text", content:"La iniciativa también refleja algo crucial sobre los rangos: el jugador con iniciativa normalmente tiene un rango más fuerte en el flop. Cuando alguien abre desde UTG, su rango preflop es el más ajustado de la mesa. Cuando el BB paga ese open, entra con un rango amplio lleno de manos especulativas que fallan el flop con frecuencia. Esa asimetría de rangos es la base de la ventaja del agresor en el postflop." },
              { type:"callout", label:"Perder la iniciativa: el mayor error del postflop", content:"Si tienes iniciativa y chequeas sin razón clara, la cedes al rival. Desde ese momento, el rival puede apostar con cualquier mano — valor o bluff — y tú solo puedes reaccionar. Los jugadores que no usan su iniciativa pierden dinero de dos formas: no extraen valor cuando deberían apostar, y regalan botes cuando deberían presionar. La iniciativa es un activo. Úsala." },
              { type:"text", content:"Un matiz importante: la iniciativa no es eterna. Se puede recuperar con un check-raise, y se pierde si chequeas dos calles seguidas. En este capítulo aprenderás cuándo usar la iniciativa para apostar (C-bet), cuándo preservarla checkeando con trampas, y cuándo ya no tienes ventaja suficiente para usarla." },
            ],
          },
          {
            title: "¿Qué es el C-bet?",
            body: [
              { type:"text", content:"El continuation bet (C-bet) es una apuesta en el flop hecha por el jugador que fue el agresor preflop — es decir, quien abrió o hizo el último raise antes de ver el flop. Como tienes la iniciativa de la mano anterior, tienes el derecho a 'continuar' esa agresión apostando en el flop, independientemente de lo que te hayan tocado." },
              { type:"text", content:"Un C-bet puede ser de dos tipos: de valor, cuando tienes una mano fuerte y quieres construir el bote, o como semi-bluff/bluff, cuando has fallado el flop pero apuestas para forzar folds. Ambos son correctos en los contextos adecuados." },
              { type:"callout", label:"Por qué el C-bet funciona", content:"El rival falla el flop estadísticamente alrededor del 65-70% de las veces. Cuando el tablero es seco y el rival no tiene nada, una apuesta pequeña consigue un fold con mucha frecuencia — y eso ya tiene EV positivo por sí solo, sin importar las cartas que tengas. A eso hay que añadir todos los casos donde sí tienes equidad o una mano fuerte." },
              { type:"callout", label:"El 'auto-profit'", content:"Si el rival foldea más de lo que los pot odds requieren para tu bluff, cada C-bet tiene EV+ automáticamente. Por ejemplo, si apuestas 33% del bote, el rival necesita foldear solo el 25% del tiempo para que el bluff sea rentable. En tableros secos contra rangos desconectados, eso ocurre con mucha más frecuencia." },
              { type:"text", content:"No C-betear por defecto es un error grave a stakes bajos. Muchos principiantes solo apuestan cuando tienen buena mano — lo que hace su juego completamente predecible. La iniciativa del preflop no vale nada si no se usa." },
            ],
          },
          {
            title: "Texturas de tablero",
            body: [
              { type:"text", content:"La textura del flop es el factor más importante para decidir si hacer C-bet, con qué frecuencia y a qué tamaño. Los tableros se dividen en dos grandes categorías: secos y mojados (wet)." },
              { type:"handCategory", categories: [
                { name:"Tableros Secos (Dry)", color:"#10b981", icon:"🏜️",
                  hands:"A♠7♦2♣ · K♥8♦3♠ · Q♦6♣2♥ · J♣4♦2♠",
                  description:"Tablero rainbow (tres palos distintos), sin cartas conectadas, sin draws evidentes. El agresor preflop tiene casi siempre ventaja de rango en estos tableros — nadie tiene draws y el rival falla frecuentemente. C-bet con alta frecuencia y sizing pequeño (33%)." },
                { name:"Tableros Mojados (Wet)", color:"#ef4444", icon:"🌊",
                  hands:"J♠T♠9♦ · 8♣7♣6♦ · 9♥8♦7♥ · K♠J♠T♥",
                  description:"Tablero con dos o tres palos iguales, cartas conectadas, posibles straights y flushes. El rival puede tener muchos draws y hands que conectan bien. C-bet más selectivo: solo con manos fuertes, draws potentes o cuando tienes ventaja de rango clara. Sizing mayor (67%+)." },
                { name:"Tableros Intermedios", color:"#c9a84c", icon:"⚖️",
                  hands:"A♠K♦7♣ · K♠Q♣8♦ · Q♥J♦6♠ · T♥9♦3♠",
                  description:"Ni completamente secos ni completamente mojados. Un palo repetido o conectividad moderada. Requieren análisis: evalúa la ventaja de rango y el perfil del rival para decidir tamaño y frecuencia." },
              ]},
              { type:"callout", label:"Regla práctica de tablero", content:"Hazte estas dos preguntas: (1) ¿Cuántos draws hay? Si pocos, tablero seco — C-bet pequeño. (2) ¿Mi rango o el del rival conecta mejor con este tablero? Si mi rango es más fuerte aquí, C-bet con alta frecuencia." },
            ],
          },
          {
            title: "Ventaja de rango y ventaja de nuts",
            body: [
              { type:"text", content:"Antes de hacer C-bet, la pregunta clave no es '¿qué tengo yo?' sino '¿qué rango tengo yo aquí versus qué rango tiene el rival?'. Hay dos conceptos fundamentales:" },
              { type:"callout", label:"Ventaja de Rango", content:"Cuando tu rango completo es más fuerte que el del rival en un tablero concreto. Ejemplo: abres desde UTG y el BB paga. El flop es A♠7♦2♣. Tu rango UTG está lleno de manos que conectan fuerte aquí: AA, KK-99 (overpairs), AKs-ATs, AKo-AQo (top pair fuerte). El BB pagó con un rango muy amplio donde muchas manos no tienen nada en este tablero. Tienes ventaja de rango clara — C-bet muy amplio." },
              { type:"callout", label:"Ventaja de Nuts", content:"Cuando tienes más combos de las manos más fuertes (nuts) que el rival en ese tablero. Ejemplo: BTN abre, BB paga. El flop es Q♠T♦9♣. El BB puede tener muchos combos de J8 que hacen straight, pero el BTN tiene todos los combos de KJ (la escalera más alta) — KJs y KJo son aperturas estándar desde BTN. El BB, al pagar preflop, tiene KJ con menos frecuencia porque suele 3-betear o re-subir con esas manos. El BTN tiene ventaja de nuts en Q-T-9, lo que justifica usar tamaños grandes cuando tiene las manos más fuertes." },
              { type:"text", content:"La situación contraria también existe: si el BB paga tu apertura de BTN y el flop es 8♠7♠6♦, el BB tiene en realidad más manos que conectan con ese tablero (suited connectors, pares bajos) porque pagó tu apertura con un rango muy amplio. En ese caso, tu ventaja de rango se reduce y deberías C-betear menos y más selectivo." },
              { type:"callout", label:"El truco para evaluar rápido", content:"¿Qué tipo de manos 'ama' este flop? Si las manos que aman el flop están mayoritariamente en mi rango preflop → tengo ventaja → C-bet amplio. Si están mayoritariamente en el rango del rival → sin ventaja → ser selectivo." },
            ],
          },
          {
            title: "Sizing del C-bet",
            body: [
              { type:"text", content:"El tamaño del C-bet es tan importante como la decisión de apostar. El error más común es variar el tamaño según la fuerza de tu mano — exactamente como en preflop, eso regala información. Usa el mismo sizing para todas las manos que apuestas en ese tablero." },
              { type:"rangeBlock", label:"Guía de sizing", hands: [
                { group:"33% del bote", cards:"Tableros secos (A72r, K83r). Bluffs y valor se apuestan igual. Alta frecuencia de apuesta. El rival necesita foldear solo el 25% para que sea rentable." },
                { group:"50% del bote", cards:"Tableros intermedios. Sizing balanceado. Funciona bien en muchos spots cuando no hay textura extrema." },
                { group:"67% del bote", cards:"Tableros semi-mojados o cuando quieres polarizar. Draws y manos fuertes en tu rango. Proteges tu mano de draws baratos." },
                { group:"75-100% del bote", cards:"Tableros muy mojados o polarización extrema. Manos muy fuertes + bluffs potentes. Obliga al rival a pagar caro por sus draws." },
              ]},
              { type:"callout", label:"La regla de oro del sizing", content:"Elige el tamaño según la TEXTURA del tablero, no según la FUERZA de tu mano. Si en un A72r apuestas 33% con AA y 75% con AK y chequeas con 72, el rival aprende a leer tus manos. Usa 33% con todo lo que apuestas en ese tablero." },
              { type:"text", content:"Una excepción válida: cambiar el sizing entre tableros secos y mojados es perfectamente correcto y no da información, porque el cambio se debe al tablero, no a tu mano. Lo que no debes hacer es usar tamaños diferentes para distintas manos en el mismo tablero." },
            ],
          },
          {
            title: "En posición vs fuera de posición",
            body: [
              { type:"text", content:"La posición cambia completamente las matemáticas del C-bet. Actuar después del rival es una ventaja enorme que te da más libertad para apostar." },
              { type:"callout", label:"En Posición (IP) — más libertad", content:"Puedes C-betear más amplio porque: (1) si el rival checkea-raise, tienes información sobre su mano. (2) Si paga, puedes controlar el sizing en calles futuras. (3) Si foldeó, lo hará antes de que tú tengas que actuar en el turn. IP permite bluffear con más frecuencia y con manos más débiles." },
              { type:"callout", label:"Fuera de Posición (OOP) — más selectivo", content:"El rival actúa después de ti en cada calle. Si C-beteas y él paga, perderás información en el turn. Si C-beteas y él raise, no tienes el contexto de haber visto su acción primero. OOP debes ser más selectivo: C-bet más con manos fuertes y draws potentes, checkea más el aire." },
              { type:"text", content:"OOP tienes también la herramienta del check-raise: si chequeas con una mano muy fuerte y el rival apuesta, puedes subir. Esta jugada es devastadora para el rival porque destruye su expectativa de ver el turn barato. Los check-raises con manos de valor son especialmente rentables contra jugadores que C-betean mucho." },
              { type:"callout", label:"Check-raise como arma OOP", content:"Desde OOP en un tablero seco, checkear AA, KK o sets puede ser superior a C-betear si el rival es un jugador agresivo que apostará cuando cheques. Así extraes más valor que apostando directamente. Pero no lo hagas de forma predecible — si solo check-raiseas con nuts, el rival aprenderá a no apostar." },
            ],
          },
          {
            title: "Ajustes explotativos según el tipo de rival",
            body: [
              { type:"text", content:"Todo lo que hemos visto hasta ahora es estrategia equilibrada: funciona bien contra cualquier rival porque no tiene fugas evidentes. Pero en stakes bajos, la mayoría de jugadores están desequilibrados — y eso es una oportunidad enorme. La clave es detectar ese desequilibrio y ajustar tu estrategia para explotarlo directamente." },
              { type:"callout", label:"Calling stations — apuesta por valor, no bluffees", content:"Un calling station paga independientemente del tamaño. Ante este perfil: elimina casi todos los C-bet bluffs (si nunca foldea, el bluff no tiene EV positivo) y aumenta la frecuencia y el tamaño de tus apuestas de valor. Con top pair o mejor, apuesta más caro — el calling station pagará igual. No intentes inducir ni slowplay; apuesta directo con cada mano fuerte." },
              { type:"callout", label:"Nits — bluffea más, con sizing ajustado", content:"Un nit foldea demasiado: teme cualquier tablero conectado y rara vez paga sin una mano real. Ante este perfil puedes aumentar la frecuencia de C-bet bluff, incluso en tableros semi-mojados que normalmente no justificarían apostar. Un C-bet pequeño (33%) contra un nit en un tablero de escalera tiene fold equity muy alta — el nit asume que tienes algo y foldea sus pares débiles y draws. Eso tiene EV+ directo." },
              { type:"callout", label:"Jugadores agresivos — sé más selectivo, usa el check-raise", content:"Un jugador que apuesta o sube mucho pierde su ventaja si adoptas líneas de trampa. OOP contra un aggressive, checkear manos fuertes y dejar que apueste es más rentable que C-betear. IP con manos mediocres, reducir el C-bet bluff evita que te hagan float o raise con aire. Contra agresivos el check-raise de valor es tu arma principal." },
              { type:"text", content:"La lógica detrás de estos ajustes es simple: si un rival está desequilibrado, es explotable. Un calling station foldea menos de lo que debería — explotación: apostar por valor más. Un nit foldea más de lo que debería — explotación: bluffear más. Todo ajuste explotativo tiene EV positivo contra el desequilibrio del rival, siempre que ese desequilibrio sea real y consistente." },
              { type:"callout", label:"El riesgo de desbalancearte tú mismo", content:"Cuando te desequilibras para explotar a un rival, te vuelves explotable a tu vez. Si empiezas a bluffear mucho contra el nit y él se da cuenta, puede ajustarse y empezar a check-raise tus C-bets. Si apuestas muy grande con valor siempre ante la calling station y ella aprende a pagar solo tus apuestas grandes, habrás perdido esa ventaja. La regla de oro: mientras el rival no se ajuste, explota. En el momento en que detectes que se ha dado cuenta, vuelve al equilibrio o cambia de táctica." },
              { type:"text", content:"Este es el ciclo de adaptación del poker: estrategia equilibrada → detectar el desequilibrio del rival → explotar → el rival se ajusta → nuevo equilibrio → nuevo ciclo. En stakes bajos, la mayoría de rivales no se ajustan durante una sesión, lo que significa que una lectura correcta de su perfil te da ventaja sostenida durante toda la mesa." },
            ],
          },
          {
            title: "Cuándo NO hacer C-bet",
            body: [
              { type:"text", content:"C-betear siempre es tan malo como no C-betear nunca. Hay situaciones claras donde checkear tiene más EV que apostar." },
              { type:"callout", label:"Botes multiway (3+ jugadores)", content:"En un bote de 3 o más jugadores, las probabilidades de que alguien tenga algo cambian drásticamente. Mientras que en heads-up el rival falla el flop ~65% del tiempo, en un bote de 3 ese porcentaje baja a ~37% de que nadie tenga nada bueno. C-bet solo con manos fuertes (top pair buena kicker+, draws potentes). Bluffear en multiway es casi siempre un error." },
              { type:"callout", label:"Tableros que conectan con el rango del rival", content:"Si el rival pagó tu apertura desde BTN y el flop es 8♠7♠6♦, ese tablero conecta muy bien con los suited connectors y pares bajos que están en su rango de call. Tu range advantage se reduce o desaparece. Checkea más, apuesta solo con tus mejores manos." },
              { type:"callout", label:"Rivals calling stations", content:"Contra jugadores que pagan todo (calling stations), los bluffs no tienen valor — el rival no va a foldear. Elimina casi todos los C-bet bluffs y apuesta solo por valor. Con un calling station, C-bet de valor más frecuente y con más manos de las que normalmente apostarías." },
              { type:"text", content:"La regla práctica: ante la duda, chequea. El C-bet debe tener una razón clara — fold equity, valor claro, draw potente, ventaja de rango evidente. Si no tienes ninguna de estas razones, checkear y reconducir la mano en el turn suele ser superior." },
            ],
          },
          {
            title: "Ejercicios: Decisiones de C-bet",
            body: [
              { type:"text", content:"En cada situación eres el agresor preflop. Decides si apuestas y a qué tamaño, o checkeas." },
              { type:"quiz", questions: [
                {
                  situation: "BTN vs BB · Bote heads-up · En posición",
                  hand: "A♠ K♠",
                  context: "Abriste desde BTN, BB pagó. El flop es A♦7♣2♥ (rainbow, seco). BB checkea.",
                  question: "¿Qué haces con AKs en el flop A♦7♣2♥?",
                  options: [
                    { label:"C-bet 33% del bote", correct:true, explanation:"¡Correcto! Tienes top pair top kicker en un tablero seco donde tienes enorme ventaja de rango. C-bet 33% extrae valor de manos como A2-A9, pares de 7, y dobla como bluff cuando el rival tiene absolutamente nada. No hay razón para usar sizing mayor en un tablero tan seco." },
                    { label:"C-bet 75% del bote", correct:false, explanation:"Sizing demasiado grande para este tablero. A♦7♣2♥ es un board seco donde el 33% es el tamaño correcto — capturas valor de más manos del rango del rival y no revelas fuerza. El 75% solo tendría sentido si el tablero fuera mojado o quisieras polarizar." },
                    { label:"Checkear para incitar al rival a apostar", correct:false, explanation:"Checkear con TPTK en un tablero seco en posición es un error. El rival checkea para fold en el turn si chequeas dos veces, o apuesta con manos que pierden igual (bluffs). C-bet 33% extrae más valor que el slowplay." },
                  ],
                },
                {
                  situation: "CO vs BTN · Bote heads-up · Fuera de posición",
                  hand: "A♣ 8♦",
                  context: "Abriste desde CO, BTN pagó. El flop es J♠T♠9♦ (muy mojado, tres cartas conectadas, flush draw). Actúas primero.",
                  question: "¿Qué haces con A8o en el flop J♠T♠9♦ OOP?",
                  options: [
                    { label:"C-bet 33% del bote", correct:false, explanation:"Un tablero tan mojado con as-high sin par ni draw real OOP no justifica ningún C-bet. El BTN conecta muy bien aquí con suited connectors, pares de 9s/Ts/Js. Sin equity y sin fold equity suficiente, checkear es claramente superior." },
                    { label:"C-bet 67% del bote", correct:false, explanation:"C-bet grande OOP con mano perdida en el tablero más conectado posible es el error clásico. Vas a enfrentar mucha presión de un rival que conecta aquí. Checkea siempre con aire en tableros muy mojados OOP." },
                    { label:"Checkear", correct:true, explanation:"¡Correcto! J♠T♠9♦ es un tablero extremadamente conectado que favorece al caller (BTN tiene suited connectors, pares). OOP con A8o sin par ni draw real — checkear es claramente correcto. Si el BTN apuesta, evalúas tu respuesta con la información de su apuesta." },
                  ],
                },
                {
                  situation: "UTG vs BB · Bote 3-way · Fuera de posición",
                  hand: "Q♣ Q♦",
                  context: "Abriste desde UTG, MP y BB pagaron. Bote de 3 jugadores. El flop es K♥8♦3♠ (seco). Actúas primero.",
                  question: "¿Qué haces con QQ en un bote 3-way en K♥8♦3♠?",
                  options: [
                    { label:"C-bet 33% del bote", correct:true, explanation:"¡Correcto! Aunque estés en bote 3-way y OOP, QQ en K♥8♦3♠ sigue siendo una mano fuerte que merece C-bet. El tablero es seco, tu par de Reinas pierde solo ante KX. C-bet 33% extrae valor y recaba información: si alguien sube, tendrás kx o mejor. No es ideal, pero apostar tiene más EV que checkear." },
                    { label:"C-bet 75% del bote", correct:false, explanation:"Sizing demasiado grande en bote multiway y tablero seco. El 75% sobreexpondrías tu mano. Si alguien tiene KX, te pueden raise y estarás en un spot difícil con una inversión grande. C-bet pequeño o checkea, nunca grande en multiway." },
                    { label:"Checkear — bote multiway es peligroso", correct:false, explanation:"Checkear con QQ en K83r tiene sentido en algunas situaciones, pero aquí pierdes demasiado valor. Los rivales pueden tener 88, 33, A8, K9 que pagan felizmente un C-bet pequeño. C-bet 33% es superior al check en este caso." },
                  ],
                },
                {
                  situation: "BTN vs BB · Bote heads-up · En posición",
                  hand: "7♥ 6♥",
                  context: "Abriste desde BTN, BB pagó. El flop es J♣T♥9♦ (conectado, con hearts en el tablero). BB checkea.",
                  question: "¿Qué haces con 7♥6♥ en J♣T♥9♦?",
                  options: [
                    { label:"C-bet 67% del bote", correct:false, explanation:"76h en J♣T♥9♦ no es el semi-bluff que parece. Solo tienes 4 outs (los cuatro 8s) para una escalera por abajo (6-7-8-9-T), y si cae el 8, cualquier dama en la mano del rival le da una escalera mejor (Q-J-T-9-8). No es una mano de semi-bluff fuerte aquí — C-bet 67% sobrevalora la mano." },
                    { label:"C-bet 33% del bote", correct:false, explanation:"Aunque 33% arriesga menos, el problema fundamental sigue siendo el mismo: solo tienes 4 outs vulnerables. Cuando el 8 cae no tienes los nuts y puedes estar perdiendo ante QX. En este tablero, la mejor opción es checkear y ver el turn." },
                    { label:"Checkear — evalúas en el turn", correct:true, explanation:"¡Correcto! 7♥6♥ en J♣T♥9♦ tiene solo 4 outs (los cuatro 8s) para una escalera por abajo que no es la nuts — cualquier dama supera tu escalera. Es una draw débil y no ciegamente faroleable. La jugada correcta es checkear el flop y reevaluar: si el turn es un corazón, aparece un backdoor flush draw real y entonces sí puedes considerar el semi-bluff con más equidad." },
                  ],
                },
                {
                  situation: "MP vs calling station · Bote heads-up · En posición",
                  hand: "A♦ 9♦",
                  context: "Abriste desde MP, el BB (calling station conocido, paga casi todo) pagó. El flop es A♠7♦2♣. BB checkea.",
                  question: "Con A9s en A♠7♦2♣ vs calling station, ¿qué haces?",
                  options: [
                    { label:"C-bet 50% del bote", correct:true, explanation:"¡Correcto! Este es el ajuste explotativo clave contra calling stations: son inelásticos al tamaño. Un jugador normal foldea más cuando apuestas grande, pero un calling station paga prácticamente igual el 33% que el 50%. Si pagas de todas formas, ¿por qué no cobrar más? C-bet 50% extrae más valor que el 33% estándar sin reducir la frecuencia con la que pagas — siempre que no se haya dado cuenta del ajuste." },
                    { label:"C-bet 33% del bote", correct:false, explanation:"El 33% es el sizing estándar de equilibrio para este tablero seco, pero contra una calling station estás dejando valor sobre la mesa. Como son inelásticos al tamaño, puedes ir al 50% y cobrar más por mano sin que foldeen más. El ajuste explotativo aquí es ir un poco más grande." },
                    { label:"C-bet 75% del bote", correct:false, explanation:"El 75% ya es demasiado — incluso los calling stations tienen un límite y pueden empezar a foldear sus manos más débiles. El ajuste óptimo no es máximo, sino el punto donde cobras más sin cambiar significativamente la frecuencia con la que pagan. El 50% es ese punto." },
                    { label:"Checkear para incitar al rival a bluffear", correct:false, explanation:"No intentes inducir a calling stations — raramente bluffean. Si chequeas, simplemente checkearán detrás con manos que habrían pagado. Siempre C-bet por valor cuando tienes mano fuerte contra este perfil." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 4,
        title: "4. Value Betting",
        summary: "Cuándo apostar para valor, cómo construir el bote y el concepto de elasticidad.",
        chapters: [
          {
            title: "Introducción al value bet",
            body: [
              { type: "text", content: "La mayoría del dinero que ganas al poker no viene de los regulars — viene de los fish. Y el error más común de los fish no es blufear demasiado: es pagar demasiado. Pagan con manos marginales y no encuentran el botón de fold cuando deberían. Tu trabajo contra estos jugadores no es blufearlos, sino extraer el máximo valor cuando tienes la mejor mano. Ese es el arte del value betting." },
              { type: "callout", label: "Definición exacta de value bet", content: "Una value bet no es simplemente apostar cuando crees que estás por delante. Para hacer una value bet, debes tener más del 50% de equidad frente al SUBRANGO que el rival no foldea a esa apuesta. La distinción crítica: no importa si estás por delante de su rango total — importa si estás por delante cuando te llama. Muchas veces estás por delante del rango total pero por detrás cuando pagas." },
              { type: "text", content: "Para tomar la decisión de si hacer value bet, el Grinder's Manual introduce un flowchart de tres preguntas que debes responder en orden. Este proceso no es mecánico — con experiencia se vuelve automático — pero al principio es esencial tenerlo explícito." },
              { type: "callout", label: "El flowchart del value bet", content: "Pregunta 1: ¿Tengo suficiente fuerza relativa de mano para apostar por valor? (¿Estoy por delante del rango que me paga más del 50%?) Si NO → Check. Si SÍ → Pregunta 2. Pregunta 2: ¿Necesito construir el bote? Si SÍ → Value bet. Si NO → Pregunta 3. Pregunta 3: ¿El slowplay tiene sentido aquí? Si NO → Value bet. Si SÍ → Check (slowplay)." },
              { type: "callout", label: "Fuerza absoluta vs fuerza relativa", content: "La fuerza absoluta de una mano es su rango objetivo (straight, flush, set...). La fuerza relativa es su valor en el contexto de ese tablero específico frente a ese rival específico. Un straight puede ser las nuts en un tablero (Q♠J♥T♦9♣2♠) o ser casi un bluff catcher en otro (Q♠J♥T♦9♣8♠ donde cualquier K o 8 te supera). El principiante mira la fuerza absoluta; el jugador ganador piensa siempre en fuerza relativa." },
              { type: "text", content: "Recuerda también el concepto de 'procedural check': cuando actúas primero en una calle y el agresor de la calle anterior no ha actuado aún, normalmente debes checkear con todo tu rango antes de que el agresor actúe. En estos spots, el flowchart del value bet no aplica — simplemente checks." },
            ],
          },
          {
            title: "Pregunta 1 — Fuerza relativa de la mano",
            body: [
              { type: "text", content: "La primera pregunta del flowchart es la más fundamental: ¿cuando el rival paga mi apuesta, tengo la mejor mano más del 50% de las veces? Responder esta pregunta correctamente requiere pensar en el rango del rival, no en su mano específica." },
              { type: "callout", label: "Ejemplo claro: Sí a Q1", content: "Tablero: K♥J♦T♣2♠. Hero tiene A♠Q♠ (straight al As). Es las nuts — nada puede ganarle. ¿Tiene suficiente fuerza relativa para apostar? ¡Aplastante! Cuando el rival llama, sigue siendo las nuts. Respuesta: SÍ a Q1. Pasa a Q2." },
              { type: "callout", label: "Ejemplo claro: No a Q1", content: "Mismo straight (A♠Q♠ en K♥J♦T♣), pero el tablero es K♥J♦T♦9♦2♦ — cuatro diamantes en el tablero. Ahora cualquier diamante en la mano del rival hace flush. Cualquier Q hace mejor straight. La fuerza relativa es pésima. Aunque en términos absolutos tenemos un straight, cuando el rival paga es muy probable que tenga algo mejor. Respuesta: NO a Q1 → Check." },
              { type: "text", content: "El caso intermedio — y el más habitual — es evaluar overpairs, top pair buena kicker, o dos pares contra rangos de fish que incluyen muchos draws y pares inferiores. La clave es: ¿cuántas manos del rango probable del rival te ganan cuando pagan? Si la respuesta es 'pocas', tienes suficiente fuerza relativa. Si la respuesta es 'muchas', quizás no." },
              { type: "callout", label: "El tipo de rival importa enormemente", content: "La fuerza relativa no depende solo del tablero — depende del rival. El mismo AA en el mismo flop puede ser value bet contra un fish con WTSD alto (Went To ShowDown: % de veces que va al showdown — cuanto más alto, más paga con manos débiles) y puede ser check contra un reg sólido que solo continúa con manos muy fuertes. Contra el fish, estás por delante de su rango de call. Contra el reg en ciertos tableros, quizás no. Los stats de tus rivales — VTSD, VPIP, Fold to C-bet — son información crítica para responder Q1." },
              { type: "quiz", questions: [
                {
                  situation: "NL25 · BTN vs BB · Flop K♠7♥2♣",
                  hand: "K♦Q♦",
                  context: "Hero abrió desde BTN, BB (fish con VPIP 55%) pagó. Flop K♠7♥2♣, BB checkea. ¿Qué fuerza relativa tiene top pair + buena kicker?",
                  question: "¿Tienes suficiente fuerza relativa para c-bet por valor en este flop?",
                  options: [
                    { label: "Sí — value c-bet", correct: true, explanation: "¡Correcto! KQ tiene top pair buena kicker en tablero seco. El fish paga con K weak, 7x, draws escasos... estás por delante de la mayoría de su rango. Value c-bet clara." },
                    { label: "No — muy vulnerable", correct: false, explanation: "En un tablero seco K72 rainbow, tu overpair/top pair tiene muy buena fuerza relativa vs un fish. Las manos que te ganan (K+kicker mejor, sets) son minoría en su rango amplio." },
                    { label: "Depende del tamaño", correct: false, explanation: "El tamaño afecta al sizing del value, no a la decisión de si tienes fuerza relativa. Aquí la fuerza relativa es clara — el tamaño lo ajustas después." },
                    { label: "Check para pot control", correct: false, explanation: "Pot control es válido con manos de fuerza media, pero KQ en K72r contra fish es value clara. No necesitas pot control aquí — necesitas construir el bote." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Pregunta 2 — ¿Necesitas construir el bote?",
            body: [
              { type: "text", content: "Si has respondido SÍ a la Q1 (tienes fuerza relativa suficiente), la siguiente pregunta es si necesitas hacer crecer el bote activamente. La respuesta es casi siempre SÍ en cash games con 100BB efectivos — los botes son pequeños relativos a los stacks y hay mucho dinero que extraer." },
              { type: "callout", label: "El error exponencial", content: "Un fallo en construir el bote en el flop tiene consecuencias que se multiplican. Si el bote en el flop es 10BB y no apuestas, en el turn el bote sigue siendo 10BB y tu apuesta máxima razonable es 7BB. Si hubieras apostado 7BB en el flop, el turn tendría 24BB y podrías apostar 16BB. En el river la diferencia es enorme. Este efecto de cascada se llama el 'exponential mistake': fallar en construir el bote temprano multiplica la pérdida de EV en todas las calles siguientes." },
              { type: "callout", label: "WTSD — Went To ShowDown", content: "El stat WTSD (porcentaje de veces que el jugador va al showdown) es clave para entender cuándo necesitas construir el bote. Un fish con WTSD del 35%+ va a showdown con muchas manos débiles — no puedes confiar en que él construya el bote por ti. Debes apostar cada calle de valor. Un jugador con WTSD bajo y muy agresivo a veces construye el bote por ti — y en ese caso podrías checkear para induciarlo a apostar." },
              { type: "text", content: "La situación en la que Q2 = NO es principalmente cuando el stack efectivo es pequeño en relación al bote. En botes de 3-bet o en situaciones con stacks más cortos, a veces no necesitas apostar el flop porque con dos apuestas futuras ya entra todo el dinero. En ese caso, tienes un 'spare street' — una calle que puedes no apostar sin perder valor." },
              { type: "callout", label: "Ejemplo: construir bote vs. fish pasivo con AA", content: "Hero tiene AA en BTN vs fish pasivo en BB. Flop: K♥7♦3♣. Hero hace overpair. El fish es estacionario (WTSD alto — Went To ShowDown: % de veces que llega al showdown, indica cuánto paga, fold to c-bet bajo). ¿Checkeamos para 'inducir'? Error. Los fish pasivos pagan bets pero no hacen bets cuando se checkea a ellos. Necesitas apostar el flop, el turn y el river. Cada calle que no apuestas es valor perdido permanentemente. La geometría del bote importa: apuesta el 60-70% del bote en cada calle para llegar al river con un bote grande." },
              { type: "quiz", questions: [
                {
                  situation: "NL25 · CO vs BB · Flop A♦J♣5♥",
                  hand: "A♠K♠",
                  context: "Hero tiene top pair buena kicker. BB es fish pasivo con WTSD 38%, fold to c-bet 42%. Bote preflop 5BB.",
                  question: "¿Debes apostar en el flop?",
                  options: [
                    { label: "Sí — value c-bet 60% del bote", correct: true, explanation: "¡Correcto! AK tiene top pair top kicker. El fish pasivo paga bets con Ax débil, Jx, draws... Necesitas construir el bote ahora. Con un WTSD alto (va al showdown frecuentemente, paga mucho) no construirá el bote por ti — apuesta y construye cada calle." },
                    { label: "Check para inducir — es fish agresivo", correct: false, explanation: "El fish tiene WTSD 38% (Went To ShowDown — va al showdown el 38% de las manos, perfil pasivo) y fold to cbet 42% (paga la c-bet el 58% de las veces). No es agresivo — no apostará si checkeas. Necesitas apostar tú para construir el bote." },
                    { label: "Check — el tablero es muy bueno para el BB", correct: false, explanation: "A♦J♣5♥ rainbow no es un tablero especialmente bueno para el BB. AK tiene gran ventaja de rango aquí. Checkear en esta situación es el exponential mistake clásico." },
                    { label: "All-in — maximiza el valor", correct: false, explanation: "All-in en el flop con top pair en un bote de 5BB desperdicia el potencial de extraer 3 calles. Apuesta calibrado para que entren 3 bets (flop-turn-river) con las fichas disponibles." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Pregunta 3 — ¿Slowplay?",
            body: [
              { type: "text", content: "El slowplay (jugar pasivamente una mano muy fuerte) es una de las jugadas más mal entendidas en el poker. Los principiantes lo hacen demasiado — creen que ser 'tricky' siempre es mejor. El Grinder's Manual es claro: el slowplay casi siempre cuesta dinero. Solo es correcto en circunstancias muy específicas." },
              { type: "callout", label: "¿Cuándo aplica el slowplay?", content: "El slowplay solo tiene sentido cuando se cumplen TODAS estas condiciones: (1) Q1 = SÍ (tienes mano muy fuerte). (2) Q2 = NO (no necesitas construir el bote urgentemente — ya sea porque el stack efectivo es corto o el bote ya es grande en relación al stack). (3) Hay una alternativa de mayor EV que apostar — típicamente porque el rival apostará si checkeas (es agresivo) y además incluirá en su rango de apuesta manos con las que no habría pagado tu bet." },
              { type: "callout", label: "Slowplay 1: OOP contra rival muy agresivo", content: "Ejemplo: Hero OOP con QQ en un flop Q♦7♣2♥. Si el rival es altamente agresivo (Float Flop alto), probablemente apostará si Hero checkea — con draws, con overcards, con aire. Aquí checkear sirve para: (a) que el rival ponga dinero con manos que habría foldeado a un bet, (b) inducir bluffs que puedes check/raise. Condición clave: necesitas alta confianza en que el rival apostará — no sirve si es pasivo." },
              { type: "callout", label: "Slowplay 2: stack corto + tablero seco", content: "Ejemplo: En un 3-bet pot con 30BB efectivos y Hero tiene top set en flop seco. Con 30BB efectivos en un bote ya grande, solo necesitas 2 bets más para meter todo el dinero. Tienes una 'calle de cortesía' — puedes checkear el flop sin perder la capacidad de ir al all-in. Además, si el rival es activo, él puede apostar el turn y facilitar que entres todo el dinero. Slowplay válido aquí." },
              { type: "callout", label: "Slowplay 3: 'crushando' el tablero", content: "Ejemplo: Hero tiene QQ en flop Q♠Q♥7♦ — quads. Hay tan pocos rivales que puedan tener una mano buena para pagar que la c-bet tendrá fold equity enorme. Aquí checkear induce al rival a apostar con aire y da tiempo para que mejore una mano mediana en el turn. El riesgo de dar carta gratis es mínimo cuando ya tienes quads." },
              { type: "text", content: "La conclusión del Grinder's Manual sobre el slowplay: hazlo rara vez, solo con manos muy fuertes, y solo cuando tienes evidencia sólida de que el rival apostará si checkeas O cuando el stack ya garantiza el all-in sin necesidad de bet en cada calle. En todos los demás casos — value bet." },
            ],
          },
          {
            title: "Valor grueso y valor fino",
            body: [
              { type: "text", content: "Hasta ahora hemos visto situaciones de 'thick value' — casos claros donde tu mano está cómodamente por delante del rango de call del rival. Pero hay situaciones más complejas donde el value es 'thin' (fino) — donde tu equidad cuando te pagan es real pero ajustada. Saber encontrar estas situaciones finas añade EV significativo." },
              { type: "callout", label: "Valor grueso (Thick value)", content: "Thick value: estás cómodamente por delante del rango de call — no hay duda. Ej: AA en un flop 7♦4♣2♠ vs fish. Tu overpair domina absolutamente lo que el fish puede pagar (pares menores, draws escasos, aspiraciones). Apuestas las 3 calles sin dudar." },
              { type: "callout", label: "Valor fino (Thin value)", content: "Thin value: tienes más del 50% de equidad vs el rango de call, pero no por mucho. Requiere un análisis más cuidadoso. Ej: top pair kicker media en un tablero húmedo en el river. ¿Paga el rival con peores manos? ¿Hay suficientes manos en su rango que son peores y pagan? Si la respuesta es sí (aunque ajustada), apostar es +EV." },
              { type: "callout", label: "Rango capped vs uncapped", content: "Un rango capped (limitado) es uno que no puede contener las manos más fuertes posibles dado las acciones tomadas. Si el rival ha checkeado dos veces (incluyendo el turn como agresor potencial), su rango está probablemente capped — pocas manos muy fuertes. Esto facilita el thin value: si su rango no puede tener muchas manos que te ganen, tu valor fino es más seguro. Un rango uncapped (ilimitado) puede contener manos muy fuertes — thin value es más arriesgado." },
              { type: "callout", label: "Las tres líneas OOP en el river", content: "Fuera de posición en el river tienes tres opciones: (1) Bet/fold — hacer una thin value bet y foldear a un raise. Bueno cuando el rango de call del rival es más débil que su rango de bet. Funciona bien contra fish pasivos. (2) Check/call — checkear para capturar bluffs. Bueno cuando el rival apostará con muchas manos peores que las que pagarían tu bet. (3) Check/fold — resignarte a que no puedes extraer valor ni capturar bluffs. Válido cuando el rival tiene rango de bet muy fuerte y rango de call reducido a manos mejores que la tuya." },
            ],
          },
          {
            title: "Sizing y Elasticidad",
            body: [
              { type: "text", content: "El sizing del value bet es tan importante como la decisión de apostar. Apostar demasiado pequeño contra un fish es el error de 'exponential mistake' silencioso — perder valor que era tuyo. Apostar demasiado grande puede 'volar' del bote a un jugador que habría pagado un tamaño razonable." },
              { type: "callout", label: "Elasticidad del rango", content: "La elasticidad describe cómo varía el rango de call de un rival al cambiar el sizing. Un rango ELÁSTICO se contrae mucho con tamaños grandes: si subes el bet de 50% a 100% del bote, muchas manos que habrían pagado al 50% ya no pagan al 100%. Un rango INELÁSTICO apenas cambia: el rival llama prácticamente igual haya un bet del 50% o del 80% del bote. Los fish suelen tener rangos inelásticos — les gusta pagar y no ajustan mucho según el tamaño." },
              { type: "callout", label: "Implicación práctica: apuesta grande vs fish", content: "Si el rival tiene rango inelástico (fish con WTSD alto), la estrategia correcta es apostar grande para maximizar el valor. La objeción clásica del principiante: 'no quiero asustarlo del bote'. Respuesta: si tiene rango inelástico, no se asusta — paga igual. Y si se va una vez de X, ganarás mucho más en todas las demás. Evita el error exponencial: no subapostes contra fish que pagan de todas formas." },
              { type: "callout", label: "Sizing vs Regs: balance es clave", content: "Contra regulars atentos, la estrategia cambia. Variar el tamaño según la fuerza de tu mano (grande con valor, pequeño sin valor) es un leak explotable. Los regs notarán el patrón y se ajustarán. Contra regulars, usa el mismo tamaño con todo tu rango en la misma situación (balanced sizing). La excepción: cuando tienes una lectura clara de que el reg tiene rango inelástico en ese spot específico." },
              { type: "callout", label: "El error exponencial: un ejemplo", content: "Mano 1 (correcto): Hero tiene AA en BTN, fish en BB. Flop K♦7♣2♥, bote 5BB. Hero apuesta 4BB → Turn bote 13BB, Hero apuesta 10BB → River bote 33BB, Hero apuesta 25BB. Total extraído: ~39BB. Mano 2 (error): misma situación pero Hero checkea el flop 'para inducir'. Turn bote 5BB, Hero apuesta 4BB → River bote 13BB, Hero apuesta 10BB. Total extraído: ~14BB. Diferencia: 25BB de EV perdido en una sola mano por no construir el bote en el flop." },
              { type: "text", content: "El valor betting es, en última instancia, el corazón del poker ganador. Los bluffs son importantes, la defensa importa, la posición importa — pero la mayor fuente de beneficio contra fish es simplemente apostar grande con tus buenas manos en cada calle y no dar descuentos. Domina el value betting y tendrás la habilidad más rentable del cash game." },
            ],
          },
          {
            title: "Ejercicios: Value Betting",
            body: [
              { type: "text", content: "Pon a prueba lo aprendido. En cada situación tienes que decidir si hacer value bet, qué tamaño usar, o si checkear. Aplica el flowchart: Q1 (fuerza relativa) → Q2 (¿necesito construir bote?) → Q3 (¿slowplay?)" },
              { type: "quiz", questions: [
                {
                  situation: "NL25 · BTN vs BB · River K♦9♣4♠J♥2♦",
                  hand: "K♠J♠",
                  context: "Hero tiene dos pares (reyes y jotas) en el river. El BB es un calling station (WTSD 40%) que pagó flop y turn. Bote: 22BB.",
                  question: "¿Qué haces en el river con dos pares top vs calling station?",
                  options: [
                    { label: "Value bet grande (75% bote)", correct: true, explanation: "¡Correcto! Dos pares top contra un calling station con WTSD 40% es valor grueso. Su rango de pago incluye Kx, Jx, pares de 9s. Apuesta grande — su rango es inelástico y paga tamaños grandes igual que pequeños." },
                    { label: "Check — el river es peligroso", correct: false, explanation: "K♦9♣4♠J♥2♦ es un tablero bastante seguro para dos pares top. Nada conectó dramáticamente. Contra un calling station no checks valor — apuestas." },
                    { label: "Value bet pequeña (33%)", correct: false, explanation: "Contra un calling station con WTSD 40% en el river puedes ir grande — su rango es inelástico. Subvaloras la situación con sizing pequeño. Apuesta 60-75% del bote." },
                    { label: "Overbet (150%)", correct: false, explanation: "Aunque su rango es inelástico, un overbet en el river con dos pares (no las nuts) es demasiado agresivo. Puede foldear manos que pagarían una bet normal. Ve 67-75% del bote." },
                  ],
                },
                {
                  situation: "NL25 · CO vs BTN · Turn A♠8♦3♣K♥",
                  hand: "A♦K♣",
                  context: "Hero tiene dos pares top (ases y reyes) en el turn. BTN es un regular sólido (WTSD 24%, VPIP 20%). Bote: 12BB.",
                  question: "¿Value bet o check en el turn vs regular con dos pares?",
                  options: [
                    { label: "Value bet 60% del bote", correct: true, explanation: "¡Correcto! Dos pares top es mano muy fuerte. Contra un regular sólido usas sizing balanceado (mismo tamaño con toda tu range). 60% es razonable — construyes bote con tu mejor mano sin revelar información." },
                    { label: "Bet pot (100%) para maximizar", correct: false, explanation: "Contra regulars (VPIP 20%, WTSD 24%) el rango es elástico — bet pot les da odds perfectas para foldear manos que pagarían sizing menor. Usa sizing balanceado, no sobreapuestes." },
                    { label: "Check para inducing bluffs", correct: false, explanation: "Con WTSD 24% el regular es sólido y no bluffeará frecuentemente si checkeas. Además, el turn A-K-8-3 favorece tu rango de abridor. Apuesta para extraer valor." },
                    { label: "Check — tablero muy peligroso", correct: false, explanation: "A♠8♦3♣K♥ no es un tablero peligroso para dos pares. Es un board de cartas altas que favorece tu rango de abridor desde CO. Value bet clara." },
                  ],
                },
                {
                  situation: "NL25 · BTN vs BB · Flop Q♠Q♦7♣",
                  hand: "Q♥8♠",
                  context: "Hero tiene trips de reinas (three of a kind). BB es un jugador muy agresivo (VPIP 55%, WTSD 35%, Float flop 45%: paga flop y apuesta turn frecuentemente).",
                  question: "Con trips en flop seco vs jugador muy agresivo, ¿qué haces?",
                  options: [
                    { label: "Check — induce al agresivo a apostar", correct: true, explanation: "¡Correcto! Slowplay válido aquí: Q1=Sí (trips), Q2=No urgente (tienes 3 calles), Q3=Sí (el agresivo apostará si checkeas). Con Float Flop 45%, él apostará turn frecuentemente. Checkeas, él apuesta con aire/draws, y atacas en turn o river. Este es un slowplay textbook." },
                    { label: "C-bet 33% del bote", correct: false, explanation: "Con trips en Q-Q-7 el flop seco, c-bet small es subóptimo. El rival agresivo tiene Float Flop 45% — apostará si checkeas. Checkeas e inducirás mucho más valor que con una c-bet pequeña que probablemente foldee su bluffing range." },
                    { label: "C-bet grande (67%)", correct: false, explanation: "C-bet grande con trips vs un jugador agresivo en flop seco es perder valor. Cuando c-betas grande aquí, el rival solo continuará con manos que te llaman bien. Si checkeas, apostará con todo su rango incluyendo aire." },
                    { label: "Raise all-in", correct: false, explanation: "All-in en el flop con trips en un bote pequeño sobrevalora la mano. No necesitas protección en Q-Q-7 y raramente te pagarán peor. Construye el bote gradualmente." },
                  ],
                },
                {
                  situation: "NL25 · BTN vs BB · River 7♠8♦9♣T♥J♠",
                  hand: "6♠5♠",
                  context: "Hero tiene el straight del 6 al T (6-7-8-9-T) con 6♠5♠ en tablero 7-8-9-T-J. BB es un fish pasivo que pagó el flop y el turn.",
                  question: "¿Tienes suficiente fuerza relativa para value bet en este river?",
                  options: [
                    { label: "Check — fuerza relativa insuficiente", correct: true, explanation: "¡Correcto! Aunque Hero tiene un straight (6-7-8-9-T), es el straight MÁS BAJO posible en este tablero. Cualquier rival con J en la mano tiene mejor straight (7-8-9-T-J). Cualquier rival con QJ tiene straight Q-high. El rango del fish que pagó dos calles incluye muchos Jx, QJ, y connected hands que hacen straights mejores. La fuerza relativa es muy baja — la mayoría de manos que pagan te ganan. Check/fold." },
                    { label: "Value bet pequeña (33%)", correct: false, explanation: "Aunque tienes un straight, es el straight mínimo del tablero. Cualquier J en la mano del rival hace un straight superior al tuyo. Con un fish que ha pagado dos calles en un tablero conectado, su rango de call está lleno de manos que te ganan. No tienes fuerza relativa para value bet." },
                    { label: "Value bet grande (75%)", correct: false, explanation: "Error grave. Tu straight es el más débil posible en 7-8-9-T-J. El rango del fish que pagó flop y turn en este tablero tan conectado contiene muchos Jx, QJ y straight draws que llegaron. Apostar grande aquí es value-ownarte." },
                    { label: "Bluff all-in", correct: false, explanation: "Bluffear tampoco funciona — el fish que pagó dos calles en un tablero 7-8-9-T-J tiene demasiado equity realizado (pares, straights, draws completados) para foldear a un all-in. Sin fold equity real." },
                  ],
                },
                {
                  situation: "NL25 · BTN vs BB · Turn A♣7♦2♠9♥",
                  hand: "A♠9♣",
                  context: "Hero tiene dos pares (ases y nueves). El BB es un fish pasivo (WTSD 38%, fold to c-bet 35%). Bote flop 8BB después de c-bet. Ahora bote 8BB, Hero actúa primero en el turn.",
                  question: "¿Qué tamaño de value bet usas en el turn con dos pares?",
                  options: [
                    { label: "Apuesta grande (70% del bote)", correct: true, explanation: "¡Correcto! Dos pares top-bottom (A+9) vs fish pasivo con WTSD 38% = construye el bote agresivamente. Su rango de pago incluye Ax, 9x, 7x, draws. El fish tiene rango inelástico — paga tamaños grandes prácticamente igual. Apuesta 70% para llegar al river con un bote grande." },
                    { label: "Check — pot control", correct: false, explanation: "Pot control con dos pares top vs fish pasivo es el error exponencial clásico. El fish no construirá el bote por ti (WTSD 38%, pasivo). Si no apuestas el turn, el river pot será la mitad de lo que debería. Apuesta." },
                    { label: "Apuesta pequeña (33%)", correct: false, explanation: "Sizing demasiado pequeño. El fish tiene rango inelástico — paga tamaños grandes igual que pequeños. Subapostar contra fish es perder EV directamente. Ve al 65-75% del bote." },
                    { label: "Overbet (130%)", correct: false, explanation: "Overbet con dos pares (no el nuts) es arriesgado incluso vs fish. Aunque su rango es inelástico, un overbet puede fold manos que habrían pagado sizing normal. 65-75% es el punto óptimo." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 5,
        title: "5. Pagar Aperturas",
        summary: "Cuándo y cómo pagar una apertura preflop: implied odds, set mining, pagar IP y OOP.",
        chapters: [
          {
            title: "¿Por qué pagar una apertura?",
            body: [
              { type:"text", content:"Hasta ahora hemos hablado de abrir el bote y de apostar postflop. Pero una parte fundamental del poker es decidir cuándo pagar la apertura de otro jugador en lugar de subir o foldear. Pagar no es la jugada pasiva y débil que muchos principiantes creen — con la lógica correcta es una herramienta poderosa y rentable." },
              { type:"callout", label:"Las 4 razones para pagar una apertura", content:"1. Implied odds: tienes una mano especulativa que puede ganar un bote enorme si conecta (pares pequeños para set mining, suited connectors). 2. Buena forma vs el rango del abridor: tienes una mano como KQo que conecta frecuentemente y está bien posicionada contra lo que el rival abre. 3. Jugadores débiles en el bote: hay un fish en el bote que justifica entrar aunque la mano no sea ideal. 4. Pot odds: la relación bote/inversión hace rentable pagar aunque la mano no sea muy fuerte (principalmente desde BB)." },
              { type:"text", content:"El error clásico del principiante es pagar demasiado — entrar al bote con manos mediocres sin tener clara ninguna de estas 4 razones. El error opuesto, menos común pero también costoso, es foldear manos rentables por miedo a estar OOP o por no calcular correctamente los pot odds. La clave es tener una razón específica antes de pagar." },
              { type:"callout", label:"El Gap Concept", content:"El Gap Concept establece que necesitas una mano más fuerte para pagar una apertura que para hacer esa apertura tú mismo desde esa posición. Si abres KJo desde CO, eso no significa que debas pagar KJo cuando alguien abre desde UTG — contra un rango UTG ajustado, KJo tiene muchos problemas de dominación. El rango de apertura y el rango de pago son distintos." },
            ],
          },
          {
            title: "Razón 1 — Implied Odds y Set Mining",
            body: [
              { type:"text", content:"Los implied odds son la razón más importante para pagar con pares pequeños y suited connectors. La lógica: aunque pagas una cantidad modesta ahora, cuando conectas una mano muy fuerte (set, flush, straight) puedes ganar un bote mucho más grande. La inversión preflop se justifica por lo que puedes ganar postflop." },
              { type:"callout", label:"La regla del set mining", content:"Con un par pequeño/medio, flopeás un set aproximadamente 1 de cada 8 veces (11.8%). Como necesitas ganar suficiente para compensar las 8 veces que fallás, necesitas ganar aproximadamente 10 veces tu inversión preflop. Si pagas 3BB preflop, necesitas poder ganar ~30BB cuando aciertas el set. Si el stack efectivo y el tipo de rival lo permiten, el set mining es rentable. Si el stack es corto o el rival no pagará postflop, no lo es." },
              { type:"text", content:"Los 7 factores que determinan si los implied odds son suficientes: (1) Tamaño de la inversión — cuanto más pequeño, mejor. (2) Frecuencia de mano fuerte — sets se hacen 1/8 veces. (3) Fuerza del rango del rival — rangos más fuertes pagan más postflop. (4) Stack depth — más fichas = más valor potencial. (5) Tendencia a foldear del rival — si foldea mucho postflop, los implied odds bajan. (6) Potencial multiway — más jugadores en el bote = más implied odds. (7) Posición — IP extrae más valor con manos fuertes." },
              { type:"callout", label:"Qué pares son mineable y cuáles no", content:"Pares 66-88: buenos set mines en la mayoría de situaciones. Tienen algo de valor de overpair si no hay cartas altas en el flop. Pares 22-55: set mines puros — si no flopeás el set, la mano no vale casi nada. Necesitan condiciones más favorables. Pares 99-JJ: son híbridos — tienen valor de overpair frecuente, no solo valor de set. JJ puede ser overpair en muchos flops y 99 en flops bajos. No son puramente set mines." },
              { type:"callout", label:"Suited connectors: implied odds distintos a los pares", content:"JTs flopeará dos pares o mejor solo el 5.6% de las veces (vs 11.8% de sets para pares). Sin embargo, flopeará draws potentes (12 outs+) el 6.9% y flush draws u OESDs el 13.2%. En total, conecta de forma fuerte el 25% de las veces. Los suited connectors son menos poderosos que los pares para set mining puro, pero más versátiles — conectan de más formas y juegan mejor multiway." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · HJ vs UTG open 3BB",
                  hand:"7♥ 7♣",
                  context:"UTG es un regular sólido (VPIP 14%, rango ajustado). Eres el único en el bote además de los blinds. Stacks 100BB.",
                  question:"¿Pagas con 77 vs apertura UTG de 3BB en HJ?",
                  options:[
                    { label:"Sí — set mining rentable", correct:true, explanation:"¡Correcto! 77 tiene buenos implied odds vs UTG: el rango es fuerte (paga sets postflop), stacks son 100BB (necesitas ganar ~30BB cuando flopeás set, muy alcanzable), estás IP. La regla: inversión 3BB × 10 = 30BB objetivo. Rentable." },
                    { label:"No — demasiado riesgo OOP", correct:false, explanation:"HJ está IP contra UTG (BTN y blinds actúan después, pero tú actúas después de UTG postflop). Además 77 tiene buenos implied odds vs rango UTG ajustado. Set mining correcto aquí." },
                    { label:"Subir a 9BB (3-bet)", correct:false, explanation:"3-bet con 77 vs UTG es arriesgado — el rango UTG es muy fuerte y 77 no tiene la equity necesaria para valor. Pagar y buscar el set es la mejor línea." },
                    { label:"Foldear — rango UTG muy fuerte", correct:false, explanation:"Precisamente porque el rango UTG es fuerte, los implied odds son buenos — el rival tiene manos con las que pagará postflop. 77 tiene justamente suficientes implied odds para pagar aquí." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Razón 2 — Buena forma vs el rango del abridor",
            body: [
              { type:"text", content:"No todas las manos que pagamos dependen de implied odds. Las manos tipo broadway (KQo, AJo, QJs) tienen lo que se llama Good Pair Potential — flopeán top pair frecuentemente y cuando lo hacen suelen estar bien posicionadas contra el rango del rival. Estas manos tienen buena 'fuerza frecuente' (Frequent Strength)." },
              { type:"callout", label:"Frequent Strength: cuándo las broadways brillan", content:"Vs rangos de apertura más amplios (CO, BTN), manos como KQo, AJo o QJs flopeán top pair frecuente con kicker buena, lo que les da ventaja contra muchas manos del rival. Cuanto más amplio el rango del abridor, más manos como estas superan el rango al conectar con el flop. Vs rangos ajustados (UTG), estas manos sufren más de dominación (AJo pierde a AK, AQ) y son menos atractivas como pagos." },
              { type:"callout", label:"Problema de dominación en rangos ajustados", content:"AJo parece una mano fuerte, pero vs un abridor UTG con rango que incluye AK, AQ frecuentemente, AJo está dominado: si flopeás la J y el rival tiene AJ+, pierdes. Si flopeás la A, el rival puede tener AK/AQ y te destroza. Por eso, AJo es pago cómodo vs CO/BTN pero problemático vs UTG donde hay más manos que lo dominan." },
              { type:"text", content:"La regla práctica: las manos de valor frecuente (KQ, AJ, QJ) van subiendo en valor a medida que la apertura del rival es desde posiciones más tardías. Vs BTN y CO, flopeán top pair que domina muchas de las manos del abridor. Vs UTG y MP, el riesgo de dominación sube y estas manos valen menos." },
            ],
          },
          {
            title: "Razón 3 — Jugadores débiles en el bote",
            body: [
              { type:"text", content:"La presencia de un fish en el bote puede convertir un pago que normalmente no harías en uno claramente rentable. Un fish cambia la ecuación completamente: sus errores postflop (pagar demasiado, no foldear, apostar de forma irracional) amplían los implied odds de cualquier mano especulativa." },
              { type:"callout", label:"Cómo el fish cambia la ecuación", content:"Ejemplo: 87s normalmente es fold vs apertura UTG en HJ sin ningún incentivo. Pero si los dos blinds son fish que casi nunca foldean preflop y juegan muy pasivamente postflop: (a) el bote será multiway frecuentemente, (b) los fish pagarán tus top pairs débiles cuando conectes, (c) pagarán draws incluso cuando ya no tienen equity. El fish convierte manos especulativas marginalse en pagos claramente rentables." },
              { type:"callout", label:"Factores que reducen el valor del fish en el bote", content:"(1) Si el fish va corto de stack, los implied odds bajan aunque esté en el bote. (2) Si el fish está en posición a ti (actúa después postflop), es más difícil extraer valor. (3) Si hay un squeezers agresivo en el bote que puede 3-bettear, el fish no ayuda porque igual tienes que foldear antes del flop. Siempre evalúa si podrás llegar al flop para aprovechar al fish." },
              { type:"text", content:"La conclusión práctica: cuando hay un fish en el bote, especialmente sentado OOP y con stack profundo, el umbral de manos con las que es rentable entrar baja significativamente. Manos como 87s, 65s, pares pequeños que normalmente foldearías pasan a ser pagos claros cuando el fish está presente y las condiciones son favorables." },
            ],
          },
          {
            title: "Razón 4 — Pot Odds: pagar desde la BB",
            body: [
              { type:"text", content:"Desde la BB tienes una ventaja única: ya tienes 1BB invertida obligatoriamente, lo que mejora significativamente tus pot odds para pagar aperturas. Tu coste para ver el flop es menor que desde cualquier otra posición, lo que convierte pagos que serían -EV en IP en +EV desde la BB." },
              { type:"callout", label:"Cálculo de pot odds en la BB", content:"Si UTG abre a 3BB y foldan todos hasta la BB: bote = 3BB (apertura) + 0.5BB (SB) + 1BB (tu BB) = 4.5BB ya en el bote. Tu coste para pagar: 2BB (3BB de la apertura menos tu 1BB ya invertida). Pot odds: 4.5:2 = 2.25:1. Vs el mismo open pero desde CO (sin BB invertida): bote = 4.5BB, coste = 3BB, pot odds = 4.5:3 = 1.5:1. La BB tiene mejores odds y puede pagar más manos." },
              { type:"callout", label:"Equidad de equilibrio y pagos de BB", content:"La 'equidad de equilibrio' (RE) es el mínimo de veces que necesitas ganar para que el pago sea +EV. Con pot odds 2.25:1 desde BB, RE = 2/(2+4.5) = 30.8%. Esto significa que solo necesitas ganar el bote el 31% de las veces para igualar. Manos como K4s tienen 44% de equidad vs rango BTN del 45% — claramente rentable pagar aunque no seas el abridor." },
              { type:"callout", label:"Rangos de defensa de la BB vs diferentes tamaños", content:"El principio es simple: cuanto más pequeña la apertura, más manos son rentables de pagar. Vs apertura de 3x BTN: pagas broadway hands (KQo, AJo), pares medianos, suited connectors medios-altos. Vs apertura de 2.5x BTN: añades más hands de top pair como KTo, Q9s. Vs apertura de 2x BTN (min-raise): puedes pagar casi toda mano jugable porque los pot odds son excelentes. La BB nunca debe foldear demasiado." },
              { type:"text", content:"Un error muy común en stakes bajos es jugar desde BB con una estrategia de 'sub o foldea' — 3-bettear o foldear sin pagar nunca. Este enfoque pierde todos los pagos rentables que existen con manos medianas. La BB es la posición donde más dinero se pierde estructuralmente, pero pagar correctamente minimiza esas pérdidas significativamente." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BB vs BTN open 2.5BB",
                  hand:"K♠ 4♠",
                  context:"BTN es un regular activo (RFI BTN 45%). Todos han foldeado hasta BTN. SB también foldea. Estás en BB.",
                  question:"¿Pagas K4s desde BB vs apertura BTN de 2.5BB?",
                  options:[
                    { label:"Sí — pot odds + equity suficiente", correct:true, explanation:"¡Correcto! Pot odds desde BB: bote 4BB (2.5+1+0.5), tu coste 1.5BB → odds 2.67:1. K4s tiene ~44% equity vs rango BTN del 45%. Flop rey el 17% de las veces con kicker K alta. Con estos pot odds excelentes y el BTN teniendo rango muy amplio, pagar es claramente +EV." },
                    { label:"No — K4s es demasiado débil", correct:false, explanation:"K4s es pago perfectamente válido desde BB vs min/2.5x BTN. Los pot odds compensan la debilidad de la mano. Con rango BTN tan amplio, tu K4s está en buena forma un porcentaje suficiente de las veces." },
                    { label:"3-bet a 7.5BB", correct:false, explanation:"3-bet con K4s desde BB vs BTN puede ser válido como bluff en algunas estrategias, pero aquí pagar tiene muy buen EV y es la línea más simple y sólida. El 3-bet expose más dinero con una mano que funciona mejor con pot odds." },
                    { label:"Foldear — vas OOP", correct:false, explanation:"Ir OOP es una desventaja, pero los pot odds desde BB son tan buenos que compensan. Con pot odds de 2.67:1 solo necesitas ganar el 27% de las veces para igualar — K4s claramente supera ese umbral vs rango BTN del 45%." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Pagar aperturas en posición (IP)",
            body: [
              { type:"text", content:"Cuando pagas en posición (IP), tienes la ventaja de actuar último postflop, pero también tienes el riesgo de que alguien 3-bettee desde atrás. La posición que ocupas importa mucho: cuanto más cerca del BTN, menos jugadores hay por detrás para 3-bettear y mejor posición postflop tendrás." },
              { type:"callout", label:"Reglas generales para pagar IP", content:"(1) Cuanto más cerca del BTN, mejor — menos squeezers y posición postflop más fuerte. (2) Vs rangos ajustados (UTG/MP), sube el valor de las manos de implied odds (sets). Vs rangos amplios (CO/BTN), sube el valor de manos de top pair (KQo, AJo). (3) Aperturas más pequeñas son más fáciles de pagar — tu inversión es menor y los pot odds son mejores. (4) Pares pequeños 22-55 vs aperturas IP son muy dependientes de contexto: si hay squeezers activos, su valor baja enormemente porque nunca llegas al flop." },
              { type:"callout", label:"Pagar vs apertura UTG en IP (HJ/CO/BTN)", content:"Vs UTG (rango ~14%): pagas pares 66+ para set mining, suited connectors altos (JTs, QJs, T9s) como híbridos y broadways premium (AQs, AJs, KQs). Vs HJ (rango ~20%): añades pares medianos 55+, más suited connectors y broadways como AJo, KQo, QJs. Vs CO/BTN (rangos 25-40%): el rango del rival es tan amplio que manos como KTo, A9s, QTo pasan a ser pagos razonables desde BTN." },
              { type:"callout", label:"El escenario más complicado: CO vs BTN", content:"CO vs BTN es el duelo entre las dos posiciones más agresivas. El BTN abre muy amplio (40%+), lo que significa que muchas manos de broadway dominan su rango. CO puede pagar más manos de top pair frecuente (KJo, QJo) y suited connectors medianos. Los pares pequeños 22-55 ya no son buenos pagos aquí: el BTN no tendrá manos premium que paguen sets, y los squeezers en los blinds son más probables con aperturas tardías." },
              { type:"text", content:"La clave al construir tu rango de pagos IP es tener claridad sobre qué tipo de mano estás jugando: implied odds o frequent strength. Las primeras necesitan rivales con rangos ajustados y buenos stacks. Las segundas funcionan mejor contra rangos amplios donde conectas bien. Mezclar ambas categorías sin pensar en qué condiciones cada una es buena es el error más habitual." },
            ],
          },
          {
            title: "Pagar desde la BB — defensa correcta",
            body: [
              { type:"text", content:"La BB es la posición donde más dinero pierdes a largo plazo, pero no porque sea imposible jugarla bien — es porque ya invertiste 1BB con cualquier mano antes de saber qué cartas tienes. Tu objetivo en la BB no es ganar dinero desde esa posición, sino minimizar las pérdidas pagando las manos correctas y foldeando las incorrectas." },
              { type:"callout", label:"BB vs aperturas UTG-CO (3BB)", content:"Pagas: pares 66+, suited connectors medios-altos (T9s, JTs, QJs), broadways como KQo, AJo, QJo, y ases suited (A9s+). Foleas: pares 22-55 (el set mining OOP sin implied odds suficientes), suited connectors bajos (54s, 65s), manos offsuit débiles (K7o, Q8o). El criterio: ¿tiene la mano suficientes implied odds o frequent strength para compensar jugar OOP?" },
              { type:"callout", label:"BB vs apertura BTN — depende del tamaño", content:"Vs 3x BTN: pagas broadways, pares 66+, suited connectors medianos+. Vs 2.5x BTN: añades KTo, Q9s, A8s, más suited one-gappers. Vs 2x BTN (min-raise): casi todas las manos jugables son pagos porque los pot odds son excelentes. Incluso manos como J8s, K5s, Q6s pasan a ser pagos razonables. El principio: cuanto más pequeña la apertura, más manos son rentables de pagar desde BB." },
              { type:"callout", label:"El error más común en BB: jugar solo 3-bet o fold", content:"Muchos jugadores de stakes bajos juegan un 3-bet or fold desde BB, pensando que es 'más GTO'. Error: pierden todos los pagos rentables con manos medianas. Pagar KTo vs BTN 2.5x es claramente +EV con buenos pot odds. Pagar 66 vs CO 3x es +EV con implied odds. Foldear estas manos porque no quieres 'complicarte' es perder EV directamente." },
            ],
          },
          {
            title: "Pagar desde la SB — cuándo y cómo",
            body: [
              { type:"text", content:"La SB es la posición más difícil para pagar aperturas. Tienes dos desventajas que se combinan brutalmente: (1) peores pot odds que la BB porque solo tienes media BB invertida, y (2) no cierras la acción — la BB puede 3-bettear y si lo hace, tienes que foldear perdiendo tu pago. Generalmente la estrategia más sólida desde SB es 3-bet o fold." },
              { type:"callout", label:"Cuándo SÍ puedes tener rango de pagos en SB", content:"1. Vs aperturas UTG/HJ: el rango es ajustado (menos probable el squeeze), y los implied odds son buenos. Pagas: JJ, QQ, AQs+, KQs y poco más. 2. Vs aperturas CO/BTN cuando la BB es un fish: el fish en el bote cambia la ecuación — pagas más manos especulativas para explotar al fish. 3. Vs aperturas CO/BTN cuando la BB es un nit o pasivo que nunca squeezea: sabes que verás el flop, así que puedes pagar más manos." },
              { type:"callout", label:"Por qué el squeeze arruina los pagos de SB", content:"Si pagas desde SB y la BB squeezea, tienes que foldear casi siempre con tu rango de pago capped. Eso significa que la mitad de tus pagos los pierdes antes del flop. Si calculas que pagás 2.5BB con 87s y luego foldeás el 30% de las veces al squeeze de la BB, tu EV real se hunde. Por eso en SB, si la BB es un jugador desconocido o agresivo, la estrategia es 3-bet o fold." },
              { type:"text", content:"La regla práctica: en la SB, antes de pagar cualquier apertura, pregúntate qué hará la BB. Si es un jugador desconocido, pasivo o nit → puedes pagar algunas manos selectas. Si es un jugador activo, agresivo o desconocido → 3-bet o fold. El pago en SB solo es rentable cuando puedes asegurar (con buena probabilidad) que verás el flop sin que la BB te saque del bote." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · SB vs BTN open 2.5BB",
                  hand:"Q♣ J♣",
                  context:"BTN es un regular activo. BB es un jugador desconocido que acabas de sentar. Stacks 100BB.",
                  question:"¿Pagas QJs desde SB vs BTN 2.5BB con BB desconocido?",
                  options:[
                    { label:"No — 3-bet o fold con BB desconocido", correct:true, explanation:"¡Correcto! Con BB desconocido, no puedes asumir que no squeezea. Si squeezea el 15% de las veces y tienes que foldear, tu pago con QJs se convierte en -EV. La estrategia correcta es 3-bet (si quieres jugar QJs) o fold para evitar el riesgo del squeeze." },
                    { label:"Sí — QJs tiene buenos implied odds", correct:false, explanation:"QJs tiene implied odds, pero el riesgo de squeeze con BB desconocido es real y destruye el EV del pago. Con BB desconocido desde SB, la estrategia correcta es 3-bet o fold." },
                    { label:"Sí — pot odds suficientes", correct:false, explanation:"Los pot odds en SB (2.5BB apertura, ya tienes 0.5BB) son peores que en BB. Además, con BB desconocido, el riesgo de squeeze es alto. No es situación de pagar solo por pot odds." },
                    { label:"Foldear — QJs no vale vs BTN", correct:false, explanation:"QJs es mano perfectamente jugable, pero la acción correcta no es necesariamente pagar. Con BB desconocido en SB, 3-bet o fold es la estrategia. Si quieres jugar QJs, la opción es 3-bettear." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Ejercicios: Pagar Aperturas",
            body: [
              { type:"text", content:"Pon a prueba lo aprendido. En cada situación decide si pagar la apertura o foldear, y con qué lógica." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · CO vs UTG open 3BB",
                  hand:"5♠ 5♦",
                  context:"UTG es un regular sólido (VPIP 14%). BTN y blinds son regulars estándar. Stacks 100BB.",
                  question:"¿Pagas 55 desde CO vs apertura UTG de 3BB?",
                  options:[
                    { label:"No — 55 vs UTG sin fish es fold", correct:true, explanation:"¡Correcto! 55 necesita ganar 30BB cuando flopeá set (inversión 3BB × 10). Vs rango UTG ajustado, el regular pagará postflop, pero sin fish en el bote y con BTN por detrás (potencial squeeze), los implied odds no son suficientes para 22-55. Foleas 55, pagas 66+ en esta situación." },
                    { label:"Sí — set mining siempre rentable con 100BB", correct:false, explanation:"Set mining no es automáticamente rentable. 22-55 son set mines puros que necesitan condiciones favorables. Vs UTG sin fish y con squeezers potenciales, los implied odds no justifican el riesgo." },
                    { label:"Sí — estás en posición", correct:false, explanation:"La posición ayuda pero no es suficiente para justificar set mining con 22-55 vs UTG ajustado sin fish. Los implied odds de pares tan pequeños no llegan al umbral necesario en esta situación." },
                    { label:"3-bet a 9BB", correct:false, explanation:"3-bet con 55 vs UTG sólido es un error grave — el rango UTG te domina y 55 no tiene ni la equity de valor ni las características de 3-bet bluff ideal (no bloquea 3-bet folds del rival)." },
                  ],
                },
                {
                  situation:"NL25 · BTN vs CO open 2.5BB",
                  hand:"K♥ Q♣",
                  context:"CO es un regular activo (VPIP 28%, RFI CO 27%). SB y BB son regulars estándar. Stacks 100BB.",
                  question:"¿Pagas KQo desde BTN vs apertura CO de 2.5BB?",
                  options:[
                    { label:"Sí — KQo tiene frequent strength vs rango CO", correct:true, explanation:"¡Correcto! KQo flopeá top pair con buena kicker frecuentemente contra el rango del 27% del CO, y esas manos están en buena forma. Estás en BTN (posición perfecta), inversión pequeña (2.5BB), sin squeezers reales por detrás. KQo es pago claro IP vs CO." },
                    { label:"No — KQo puede estar dominado", correct:false, explanation:"KQo puede estar dominado vs UTG (AK, AQ están en ese rango), pero vs CO con rango del 27%, hay mucho menos dominación y muchas más manos que KQo supera cuando conecta. Es pago correcto IP vs CO." },
                    { label:"3-bet a 7.5BB", correct:true, explanation:"También correcto — 3-bet con KQo vs CO desde BTN es perfectamente válido como 3-bet de valor/semi-valor. Tanto pagar como 3-bet son líneas razonables con KQo desde BTN." },
                    { label:"Foldear — riesgo de dominación", correct:false, explanation:"Con rango CO del 27%, la dominación de KQo es mínima. El rival tiene muchas manos que KQo supera cuando conecta el flop. Foldear KQo en BTN vs CO sería demasiado pasivo." },
                  ],
                },
                {
                  situation:"NL25 · BB vs BTN open 2BB (min-raise)",
                  hand:"J♦ 8♦",
                  context:"BTN es regular activo (RFI BTN 45%). SB ha foldeado. Stacks 100BB.",
                  question:"¿Pagas J8s desde BB vs min-raise del BTN?",
                  options:[
                    { label:"Sí — pot odds excelentes vs min-raise", correct:true, explanation:"¡Correcto! Bote 3.5BB (2BB apertura + 0.5BB SB + 1BB tu BB), tu coste 1BB. Pot odds 3.5:1. Solo necesitas ganar 1 de 4.5 veces = 22%. J8s tiene implied odds, potencial de flush/straight, y el rango BTN del 45% es muy amplio. Pagar es claramente +EV con estos pot odds." },
                    { label:"No — J8s es demasiado débil OOP", correct:false, explanation:"Vs min-raise, los pot odds son tan buenos que compensan jugar OOP. J8s tiene suficiente potencial (draws, top pair occasional) para que pagar sea +EV. No foldees manos playables vs min-raise desde BB." },
                    { label:"3-bet a 6BB", correct:false, explanation:"3-bet con J8s vs BTN min-raise puede ser válido como bluff en algunas estrategias, pero pagar es la línea más sólida y simple aquí. Los pot odds son tan buenos que pagar maximiza EV con J8s." },
                    { label:"Foldear — vas OOP todo el juego", correct:false, explanation:"Ir OOP es desventaja, pero con pot odds 3.5:1 solo necesitas ganar el 22% de las veces para igualar. J8s vs rango BTN del 45% claramente supera ese umbral. Foldear aquí pierde EV directamente." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 7,
        title: "7. Facing Bets — Spots de Fin de Acción (Avanzado)",
        summary: "Overbets, double barrels, all-ins y calibración avanzada del call vs fold en los spots más complejos.",
        chapters: [
          {
            title: "Overbets: cuando el rival apuesta más del bote",
            body: [
              { type:"text", content:"Una overbet es cualquier apuesta que supera el 100% del bote. Cuando un rival apuesta 1.5x, 2x o más, cambia radicalmente la dinámica. Las overbets tienen dos usos principales: (1) maximizar valor con manos muy fuertes (nuts o cerca) donde el rival puede tener muchas manos que pagan, y (2) bluffear con alto fold equity forzando folds en rangos que no pueden costear la alta ER." },
              { type:"callout", label:"ER de las overbets: números críticos", content:"Overbet 1.25x el bote → ER ≈ 38%. Overbet 1.5x el bote → ER ≈ 43%. Overbet 2x el bote → ER ≈ 50%. Overbet 3x el bote → ER ≈ 60%. Con 2x bote necesitas ganar exactamente el 50% del tiempo para ser break-even. Esto hace las overbets decisiones binarias: o tienes suficiente equidad o no tienes ninguna." },
              { type:"callout", label:"¿Qué rango overbettea por valor?", content:"Un rival que overbettea por valor en el river tiene rango muy polarizado hacia el tope: nuts o cerca. Sets completos, flushes, straights en tableros donde son las nuts. La overbet de valor implica concentración en las manos más fuertes — raramente incluye manos medias que se apuestan mejor con sizing menor." },
              { type:"callout", label:"Cómo responder a overbets del river", content:"Paso 1: calcula la ER (con 1.5x bote necesitas 43%). Paso 2: ¿Tienes manos que ganan al rango de valor del rival? Si es imposible ganar a su rango de valor, foldea directamente. Paso 3: en NL10-NL25 la población sobreutiliza overbets con valor y las subutiliza como bluff — sesgo hacia fold ante overbets de rivales desconocidos. Paso 4: ante Aggro Regs con CBet River >50%, el sesgo se invierte parcialmente." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BTN vs BB · River A♦K♣8♠3♥J♠",
                  hand:"Q♦ Q♥",
                  context:"Hero abre BTN 2.5BB. BB (regular, VPIP 26%, PFR 19%, CBet River 28%) paga. Flop A♦K♣8♠: BB checkea. Hero apuesta 3.5BB. BB paga. Bote: 12.5BB. Turn 3♥: BB checkea. Hero checkea. River J♠: BB apuesta 25BB (overbet 2x el bote).",
                  question:"¿Pagas QQ ante la overbet del BB en el river?",
                  options:[
                    { label:"No — ER alta y rango de valor aplastante", correct:true, explanation:"¡Correcto! ER = 25/(25+37.5) ≈ 40%. QQ en tablero A-K-8-3-J no supera ningún par del tablero. El BB pagó el flop con A en mesa, checkeó el turn, y overbettea el river. Su rango de valor incluye AX+, KX, JX, sets. QQ no gana a casi nada. P4: regular conservador (CBet River 28%) tiene rango de bet muy sesgado hacia valor cuando apuesta grande. Foldea." },
                    { label:"Sí — QQ tiene showdown value", correct:false, explanation:"QQ tiene SDV en tableros bajos, pero en A-K-8-3-J el overpair vale muy poco. El rango de la overbet del BB está concentrado en Ax+, sets, dos pares, straights. No puedes ganar en showdown si el rango de valor te aplasta completamente. Foldea." },
                    { label:"Sí — overbet indica bluff", correct:false, explanation:"Las overbets no siempre son bluffs. Con CBet River 28% este jugador apuesta poco en general — cuando apuesta 2x bote tiende fuertemente al valor. QQ en este tablero está muy por debajo del rango de valor. Foldea." },
                    { label:"Depende del tamaño exacto", correct:false, explanation:"ER = 40% con esta overbet. Incluso con pot odds matemáticos, QQ en A-K-8-3-J no tiene el 40% de equidad contra el rango de overbet de este regular conservador. Los pot odds solo ayudan si alcanzas la ER. Foldea." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Double barrel: enfrentando apuestas en el turn",
            body: [
              { type:"text", content:"El double barrel ocurre cuando el agresor preflop apuesta tanto el flop como el turn. Enfrentar un double barrel no siempre es fin de acción — queda el river — pero el call del turn debe considerar qué ocurre después. La decisión no existe en vacío: en el turn estás decidiendo también cómo llega la mano al river." },
              { type:"callout", label:"Stack-to-pot ratio (SPR) después de pagar el turn", content:"Antes de pagar el turn, calcula el SPR restante: SPR = stack restante / bote después del call. Si SPR ≤ 1, estás comprometido al all-in del river en casi cualquier spot. Esto convierte el call del turn en 'decisión de llegar al all-in del river'. Si no quieres ir all-in con tu mano en el river, ese es motivo extra para foldear en el turn." },
              { type:"callout", label:"Cuándo pagar el turn double barrel", content:"Paga cuando: (1) tienes draw fuerte (FD + par, OESD + overcards, combo draw 12+ outs); (2) tienes bluff catcher con SDV y el rival puede tener mucho aire; (3) tienes mano de valor (set, dos pares, straight) que puede extraer value en el river; (4) el rival tiene alto CBet Turn pero rango amplio que incluye mucho aire." },
              { type:"callout", label:"Cuándo foldear al turn double barrel", content:"Foldea cuando: (1) tienes solo SDV sin draws y el rival tiene rango polarizado hacia valor; (2) la turn card completó flushes/straights que favorecen el rango del rival; (3) el rival rara vez bluffea el turn — sus double barrels tienen mucho valor; (4) el SPR resultante te compromete a un all-in donde no tienes equidad suficiente." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BB vs BTN · Turn A♣7♦2♥K♠",
                  hand:"7♣ 7♦",
                  context:"BTN (reg, VPIP 28%, PFR 22%, CBet Turn 55%) abre 2.5BB. Hero BB paga. Bote: 5.5BB. Flop A♣7♦2♥: Hero checkea. BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB. Turn K♠: Hero checkea. BTN apuesta 9BB.",
                  question:"¿Pagas tu set de 7s al double barrel del BTN en el turn?",
                  options:[
                    { label:"Sí — set de 7s, extraigo value masivo en el river", correct:true, explanation:"¡Correcto! Set de 7s en A-7-2-K es una mano muy fuerte. ER = 9/(9+21.5) ≈ 30%. P1: puede apostar con AK (dos pares), AX, KX que son manos peores que el set. No solo pagas para llegar al river — pagas con una mano que extrae value masivo en el river. Paga sin dudar." },
                    { label:"No — puede tener AA o AK que me dominan", correct:false, explanation:"AK son dos pares — pierden contra tu set de 7s. AA sería set de ases que batea al set de 7s, pero son pocos combos. El set de 7s es claramente la mano correcta para pagar el turn. Piensa en extraer value en el river." },
                    { label:"No — el turn K empeora mi posición relativa", correct:false, explanation:"El turn K da al rival más manos que pagan (AK), que es bueno para ti. Tu set de 7s sigue siendo muy fuerte. Paga el turn." },
                    { label:"Depende — miro el river antes de decidir", correct:false, explanation:"El rival ya apostó el turn. Tu opción es pagar o foldear ahora. Con set de 7s en A-7-2-K, pagas." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "All-in en el flop o el turn",
            body: [
              { type:"text", content:"Los all-ins en el flop o el turn son spots de fin de acción: no hay más calles. El proceso es el mismo que en el river: ER primero, equidad real después. La diferencia es que la equidad incluye todas las cartas futuras — se calcula como '% de veces que ganas el showdown en el river dado el rango del rival', teniendo en cuenta las mejoras potenciales de ambas manos." },
              { type:"callout", label:"All-in en el flop: referencias de equidad", content:"Sets vs dos pares: ~65-70% equity — paga siempre. Sets vs overpairs: ~80% equity — paga siempre. Flush draw + par vs set: ~42-45% — borderline (necesitas ~47%). Combo draw (FD + OESD) vs top pair: ~55% — paga. OESD puro vs top pair: ~35% — no paga. Overpair vs flush draw: ~60% — paga. La ER en all-ins de flop con 100BB efectivos es aproximadamente 47-50%." },
              { type:"callout", label:"Reads críticos para all-ins de flop/turn", content:"Fish agresivo all-ineando el flop: rango MUY amplio — top pair, pares, draws, premium. Tu equidad mejora enormemente vs este rango. Regular all-ineando el flop: rango ajustado — sets, dos pares, overpairs fuertes. Tu equidad baja. Regular all-ineando el turn: aún más ajustado — casi siempre valor muy fuerte. El tipo de rival define si tienes suficiente equity o no." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BTN vs BB · Flop 8♣7♦2♥ · All-in",
                  hand:"9♣ 8♦",
                  context:"Hero abre BTN 2.5BB. BB (fish recreativo, VPIP 62%, PFR 8%) paga. Bote: 5.5BB. Flop 8♣7♦2♥: BB apuesta 5BB (pot). Hero sube a 14BB. BB va all-in total 97.5BB. Stacks 100BB efectivos.",
                  question:"¿Pagas el all-in del fish en el flop con top pair + gutshot?",
                  options:[
                    { label:"Sí — equidad suficiente vs rango amplio del fish", correct:true, explanation:"¡Correcto! ER ≈ 42%. Fish VPIP 62% que va all-in en el flop tiene rango AMPLIO: 8X (top pair), 77, 22, draws como 65s, J9, pares cualesquiera... Tienes top pair + gutshot al straight. Vs rango amplio del fish tu equidad es ~45-48%. Superas el 42% requerido. Paga." },
                    { label:"No — puede tener 77 o 22", correct:false, explanation:"Aunque puede tener sets, el fish VPIP 62% también mete el dinero con 8X, 7X, draws mal evaluados. Vs su rango TOTAL tu equidad supera el 42% requerido. Los sets son solo una fracción del rango amplio del fish. Paga." },
                    { label:"No — solo tengo top pair con gutshot", correct:false, explanation:"Contra un regular esto sería fold. Contra un FISH VPIP 62% que va all-in en el flop, su rango es tan amplio que top pair + gutshot tiene más que suficiente equidad. El tipo de rival lo cambia todo." },
                    { label:"Fold — flop muy conectado", correct:false, explanation:"8-7-2 es semiconectado pero no extremadamente. El fish con VPIP 62% que va all-in aquí tiene un rango lleno de manos débiles. Tu equidad supera el 42% requerido. Paga." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Tendencias de población: NL10-NL25",
            body: [
              { type:"text", content:"Los reads de población son el último recurso cuando no tienes información específica. En NL10-NL25 existen patrones estadísticos claros que guían tus decisiones en spots de fin de acción contra rivales desconocidos." },
              { type:"callout", label:"Lo que la población de NL10-NL25 hace en el river", content:"Tendencias comprobadas: (1) La mayoría de jugadores NO bluffean el river con suficiente frecuencia. (2) Cuando la población apuesta las 3 calles, casi siempre tiene valor fuerte. (3) Las overbets de rivales desconocidos tienen más valor que bluffs en promedio. (4) Los regs sólidos raramente bluffean con sizings grandes en el river después de 3 calles. (5) Los fish pasivos casi nunca bluffean el river." },
              { type:"callout", label:"La regla del fold por defecto en NL10-NL25", content:"En spots de fin de acción vs rival desconocido: si no tienes información específica que sugiera que bluffea frecuentemente (alto CBet River, alto WWSF), el sesgo por defecto es hacia el fold con manos no near-nuts. La población simplemente no bluffea suficiente para justificar calls ligeros de forma consistente." },
              { type:"callout", label:"¿Cuándo desviarte del fold por defecto?", content:"El sesgo se invierte (hacia el call) cuando: (1) CBet River >50% o WWSF >55%; (2) la línea del rival es inconsistente con valor (check-check-overbet; múltiples checks + bet river); (3) tienes un buen bluff catcher y el tablero favorece draws fallidos en el river; (4) el rival mostró un bluff reciente en showdown; (5) es un Aggro Fish conocido que apuesta con cualquier cosa." },
            ],
          },
          {
            title: "Calls thin: el arte de pagar con lo justo",
            body: [
              { type:"text", content:"Un call thin es cuando pagas una apuesta con una mano que apenas supera la equidad requerida. En NL10-NL25 son la excepción, no la regla. Sin embargo, identificar cuándo tienes suficiente equidad para el call thin separa a los jugadores avanzados de los intermedios." },
              { type:"callout", label:"Tres condiciones para un call thin", content:"(1) SDV suficiente — tu mano gana en showdown al menos al 30-35% del rango de bet del rival. (2) El rival puede tener bluffs — sin bluffs en su rango no hay call thin posible. (3) La ER es alcanzable — la apuesta no es tan grande que necesites 50%+ de equity con una mano mediocre. Calls thin con ER de 25-33% son más justificables que con ER de 40%+." },
              { type:"callout", label:"Errores comunes en calls thin", content:"Error 1: Pagar 'porque eres el favorito nominal' — tener top pair no te convierte en favorito si el rival nunca bluffea. Error 2: Confundir SDV con equity vs rango — tu mano puede ganar muchos showdowns pero si el rival solo apuesta con valor, no tienes el 33% requerido vs su rango. Error 3: Ignorar el sizing — un call thin con ER del 25% puede ser válido, el mismo call con ER del 45% raramente lo es." },
              { type:"text", content:"La clave del call thin: en NL10-NL25 el sesgo hacia el fold es más rentable que hacia el call en spots thin. Los errores de 'call incorrecto' son más caros que los 'fold incorrecto' cuando la población no bluffea suficiente para justificar calls ligeros frecuentes." },
            ],
          },
          {
            title: "Ejercicios: Spots de fin de acción (avanzado)",
            body: [
              { type:"text", content:"Aplica el proceso completo: (1) ER, (2) ¿value peor?, (3) ¿puede tener aire?, (4) ¿línea coherente para valor?, (5) read del rival." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · CO vs BB · River K♥Q♦J♠T♣7♠",
                  hand:"A♦ Q♠",
                  context:"Hero abre CO 2.5BB. BB (regular sólido, VPIP 24%, PFR 18%, CBet River 30%, WWSF 48%) paga. Flop K♥Q♦J♠: BB checkea. Hero apuesta 3.5BB. BB paga. Bote: 12.5BB. Turn T♣: BB checkea. Hero checkea. River 7♠: BB apuesta 10BB en bote de 12.5BB.",
                  question:"¿Pagas AQ (dos pares, A+Q) en este river?",
                  options:[
                    { label:"No — tablero lleno de straights, rango de BB peligroso", correct:true, explanation:"¡Correcto! En K-Q-J-T-7, cualquier KJ, QT, J9, AK, AJ, AT, KQ... muchas manos hacen straight o tienen dos pares superiores. ER = 10/(10+22.5) ≈ 31%. P1: ¿value peor? Pocas manos en su rango de bet pierden contra AQ aquí. P2: ¿bluffs? Pocos — en K-Q-J-T casi no hay draws fallidos. Regular sólido (CBet River 30%, WWSF 48%) que apuesta el river en este tablero tiene abrumadoramente valor. Foldea." },
                    { label:"Sí — AQ tiene dos pares fuertes", correct:false, explanation:"Dos pares en K-Q-J-T-7 valen poco. El rango del BB que pagó flop (K en tablero, posibles T, J, Q) incluye muchas manos que ahora tienen straight o mejor. Regular sólido apostando aquí tiene casi siempre valor que te gana. Foldea." },
                    { label:"Sí — ER de 31% justifica el call", correct:false, explanation:"La ER baja solo importa si tienes el 31% de equidad vs el rango de bet. En K-Q-J-T-7 AQ no tiene esa equidad contra un regular sólido. Los pot odds son irrelevantes sin la equidad necesaria. Foldea." },
                    { label:"Sí — puede tener draws fallidos", correct:false, explanation:"En K-Q-J-T-7 casi no hay draws que fallen. El tablero completa todo. Regular sólido (WWSF 48%) que apuesta aquí tiene valor. Foldea." },
                  ],
                },
                {
                  situation:"NL25 · BTN vs BB · River 8♦5♣2♥4♠A♣",
                  hand:"8♥ 8♣",
                  context:"Hero abre BTN 2.5BB. BB (aggro reg, VPIP 32%, PFR 26%, CBet River 52%, WWSF 58%) paga. Flop 8♦5♣2♥: BB checkea. Hero apuesta 3.5BB. BB paga. Bote: 12.5BB. Turn 4♠: BB checkea. Hero apuesta 8BB. BB paga. Bote: 28.5BB. River A♣: BB apuesta 28.5BB (pot).",
                  question:"¿Pagas set de 8s ante la pot-bet del BB aggro reg?",
                  options:[
                    { label:"Sí — set con equidad suficiente, rival agresivo con muchos bluffs", correct:true, explanation:"¡Correcto! ER = 28.5/(28.5+57) ≈ 33%. El river A♣ es carta de bluff perfecta — el BB puede llegar con 6-7 (straight), 9-7, 3-6, flush draws fallidos, overcards. P2: Aggro Reg CBet River 52% DEFINITIVAMENTE puede bluffear aquí. P3: check-call-call-pot-river es línea de bluff frecuente para este tipo de jugador. P4: WWSF 58% — este rival apuesta con mucho aire. Paga el set." },
                    { label:"No — puede tener A8, AA, 55, 22, 44", correct:false, explanation:"A8 requirió pagar toda la mano desde preflop. AA/55/22/44 son pocos combos. El Aggro Reg CBet River 52% tiene muchos más bluffs que sets en su rango de pot-bet. El set paga." },
                    { label:"No — pot-bet siempre indica valor", correct:false, explanation:"Pot-bet NO siempre indica valor. Jugadores agresivos usan pot-bet como bluff porque fuerza folds del 33% del rango rival. Este aggro reg (WWSF 58%) es exactamente el tipo que usa pot-bets como bluff en el river. Paga." },
                    { label:"Fold — el river A empeora mi mano relativa", correct:false, explanation:"El river A es una carta de bluff para el BB, no una carta que mejora su valor necesariamente. Tu set de 8s sigue siendo una mano muy fuerte vs el rango de bluffs del aggro reg. Paga." },
                  ],
                },
                {
                  situation:"NL25 · SB vs BB · River J♦T♠9♥2♣6♦",
                  hand:"J♣ 9♦",
                  context:"Hero abre SB 3BB. BB (fish pasivo, VPIP 54%, PFR 6%, CBet River 15%, WTSD 44%) paga. Flop J♦T♠9♥: BB checkea. Hero apuesta 4BB. BB paga. Bote: 14BB. Turn 2♣: BB checkea. Hero apuesta 9BB. BB paga. Bote: 32BB. River 6♦: BB apuesta 25BB.",
                  question:"¿Pagas J9 (dos pares top) vs fish pasivo que apuesta el river por primera vez?",
                  options:[
                    { label:"No — fish pasivo apostando river = valor casi siempre", correct:true, explanation:"¡Correcto! ER = 25/(25+57) ≈ 30%. P4: Fish pasivo con CBet River 15% — cuando apuesta el river su rango es EXTREMADAMENTE sesgado hacia valor fuerte: sets (JJ, TT, 99), straights (KQ, Q8), dos pares superiores. Este fish casi nunca bluffea el river; su WTSD 44% muestra que llega al showdown pasivamente. J9 no tiene el 30% de equity contra ese rango. Foldea." },
                    { label:"Sí — J9 tiene dos pares fuertes", correct:false, explanation:"Dos pares no son protección cuando el fish pasivo apuesta. CBet River 15% indica que este jugador solo apuesta cuando tiene algo muy fuerte. Tu equidad vs su rango de river bet es insuficiente. Foldea." },
                    { label:"Sí — pot odds suficientes", correct:false, explanation:"Los pot odds solo importan si tienes la equidad. Con fish pasivo (CBet River 15%), el 70%+ de su rango de river bet te gana. No tienes el 30% de equity requerido. Foldea." },
                    { label:"Sí — puede value con T9 o JX peor", correct:false, explanation:"Con CBet River 15%, este fish NO apuesta con T9 o JX mediocre — esas manos las lleva al showdown checkando. Solo apuesta cuando tiene algo muy fuerte. Foldea J9 aquí." },
                  ],
                },
              ]},
            ],
          },
        ],
      },

    ],
  },
  en: {
    nav: { title: "Poker Cash Academy", back: "Home" },
    home: { welcome: "Poker Cash Academy", subtitle: "Master cash game. One concept at a time." },
    menu: { academia: "Academy", academiaSubtitle: "Structured lessons step by step", stats: "Statistics", statsSubtitle: "Your progress, level and accuracy by category" },
    academia: {
      title: "Academia",
      subtitle: "Learn step by step",
      completed: "completed",
      locked: "Locked",
      lockedMsg: "Complete previous lessons to unlock.",
      complete: "Mark as completed →",
      next: "Next lesson",
      progress: "Progress",
      of: "of",
      nextChapter: "Next →",
      prevChapter: "← Previous",
    },
    practice: {
      title: "Test",
      subtitle: "Track your progress with real decision-making situations",
      start: "Start session",
      situation: "Situation",
      of: "of",
      correct: "Correct!",
      wrong: "Incorrect",
      next: "Next →",
      finish: "See results",
      playAgain: "New session",
      scoreTitle: "Results",
      perfect: "Perfect! You've mastered preflop opening.",
      good: "Good work. Review the ones you missed.",
      review: "Review Chapter 1 before trying again.",
      posLabel: "Position",
      handLabel: "Your hand",
      contextLabel: "Context",
      filterTitle: "Choose categories to practice",
      filterRandom: "Random (all)",
      optFold: "Fold",
      optOpen3: "Open to 3x BB",
      optOpen25: "Open to 2.5x BB",
      optOpen2: "Open to 2x BB",
      optOpen4: "Open to 4x BB",
      optLimp: "Call the blind (limp)",
      wrongSizeExp: "Varying size based on hand strength leaks information. Always use your position's standard size.",
      wrongLimpExp: "Limping gives away initiative and is a weak play. From any position except BB: either open-raise or fold.",
      wrongFoldExp: "This hand is in the opening range for this position.",
      wrongOpenExp: "This hand is not in the opening range for this position.",
      optIso4: "ISO raise to 4BB",
      optIso5: "ISO raise to 5BB",
      optIso6: "ISO raise to 6BB",
      optIso8: "ISO raise to 8BB",
      optLimpBehind: "Call too (overlimp)",
      wrongIsoFoldExp: "This hand is not in the ISO range for this position. With the players in the pot, folding is correct.",
      wrongIsoOpenExp: "This hand is in the ISO range for this position. ISO raise to the correct size.",
      wrongLimpBehindExp: "Overlimping (calling behind without raising) is almost always wrong: you enter without initiative into a multiway pot. Either ISO or fold.",
      optCbetSmall: "C-bet 33% of the pot",
      optVbetMedium:"Bet 50% of the pot",
      optCbetLarge: "C-bet 67% of the pot",
      optCbetPot:   "C-bet the pot (100%)",
      optCheck:     "Check",
      wrongCbetSizeExp: "Sizing reveals information just like preflop. Use the correct size for the board texture, not for the strength of your hand.",
      wrongBetWhenCheckExp: "Betting here wastes chips. On boards that favor the villain or in multiway pots with a weak hand, checking is superior.",
      wrongCheckWhenBetExp: "Checking surrenders initiative and loses fold equity or value. Betting has more EV in this situation.",
      boardLabel: "Board",
      posTypeIP: "In position (IP)",
      posTypeOOP: "Out of position (OOP)",
      playersLabel: "Players in pot",
      reportBtn: "Report issue",
      reportTitle: "Report an issue with this situation",
      reportReasonLabel: "What's the problem?",
      reportCommentLabel: "Comment (optional)",
      reportCommentPlaceholder: "Tell us what you think is wrong and why...",
      reportCancel: "Cancel",
      reportSubmit: "Send report",
      reportSending: "Sending...",
      reportSuccess: "Thanks! We've received your report.",
      reportError: "Couldn't send the report. Please try again.",
      reportLoginRequired: "Sign in to report issues.",
      actionCall: "Call",
      editBtn: "Propose change",
      editTitle: "Propose a change to this situation",
      editCurrentLabel: "Current correct play",
      editCorrectLabel: "What do you think the correct play is?",
      editExplEsLabel: "Corrected explanation (ES)",
      editExplEnLabel: "Corrected explanation (EN)",
      editCommentLabel: "Justification (required)",
      editCommentPlaceholder: "Explain why you think this should change...",
      editCancel: "Cancel",
      editSubmit: "Send proposal",
      editSending: "Sending...",
      editSuccess: "Thanks! Your proposal was sent to the community for voting.",
      editError: "Couldn't send the proposal. Please try again.",
      editLoginRequired: "Sign in to propose changes.",
      editCommentRequired: "Write a short justification for your proposal.",
      communityNav: "Community",
      communityTitle: "Proposal moderation",
      communityDesc: "Vote on change proposals submitted by the community. With enough votes for or against, a proposal is automatically approved or rejected.",
      communityEmpty: "No pending proposals right now.",
      communityVoteUp: "Agree",
      communityVoteDown: "Disagree",
      communityApproved: "Approved",
      communityRejected: "Rejected",
      communityPending: "Pending",
      communityNetVotes: "Net votes",
      communityCurrent: "Current",
      communityProposed: "Proposed",
      communityComment: "Justification",
      communityBy: "Proposed by",
      communityFilterPending: "Pending",
      communityFilterResolved: "Resolved",
      communityFilterAll: "All",
      communityLoginRequired: "Sign in to vote on community proposals.",
      communityAlreadyVoted: "You've already voted on this proposal.",
      communityTabEdits: "Proposed edits",
      communityTabNewHands: "New hands",
      proposeBtn: "✚ Propose new hand",
      proposeTitle: "Propose a new hand",
      proposeCategoryLabel: "Category",
      proposePosLabel: "Your position",
      proposeHandLabel: "Your hand (e.g. A♠ K♦)",
      proposeBoardLabel: "Board (e.g. A♦ 7♣ 2♥)",
      proposeCallPosLabel: "Opponent's position",
      proposePlayersLabel: "Players in the hand",
      proposeHU: "Heads-up (1 opponent)",
      propose3way: "3-way (2 opponents)",
      proposeStreetLabel: "Street",
      proposeStreetFlop: "Flop",
      proposeStreetTurn: "Turn",
      proposeStreetRiver: "River",
      proposeLimpersLabel: "Number of limpers",
      proposeLimper1: "1 limper",
      proposeLimper2: "2 limpers",
      proposeLimperContextLabel: "Who limped and from which position?",
      proposeLimperContextPlaceholder: "E.g.: UTG limped (recreational player)",
      proposeContextLabel: "Context / hand history",
      proposeContextPlaceholder: "Describe the situation: opponent type, prior action, stacks, etc.",
      proposeContextOptional: "Additional context (optional)",
      proposeOptionsLabel: "Answer options (fill all 4)",
      proposeOptionPlaceholder: "Option",
      proposeCorrectLabel: "Which option is correct?",
      proposeCorrectExplLabel: "Why is it correct? (explanation)",
      proposeWrongExplLabel: "Why are the others incorrect? (optional)",
      proposeCommentLabel: "Additional comment (optional)",
      proposeCancel: "Cancel",
      proposeSubmit: "Submit proposal",
      proposeSending: "Sending...",
      proposeSuccess: "Thanks! Your hand has been sent to the community for voting.",
      proposeError: "Could not submit the proposal. Please try again.",
      proposeLoginRequired: "Sign in to propose new hands.",
      proposeValidation: "Fill in the hand, all 4 options, and the explanation of why it's correct.",
      newHandsTitle: "Hands proposed by the community",
      newHandsDesc: "Vote on new hands submitted by other users. Once a hand gets enough upvotes it's added to the practice pool for everyone.",
      newHandsEmpty: "No pending new hands right now.",
      newHandsAddedToPool: "Added to practice pool",
      communityProposedBy: "Proposed by",
      proposeAddOtherLang: "➕ Also add in Spanish (optional)",
      proposeOtherLangTitle: "Spanish version",
      proposeSecondaryContextLabel: "Context / hand history (Spanish)",
      proposeSecondaryOptionsLabel: "Answer options (Spanish)",
      proposeSecondaryCorrectExplLabel: "Why is it correct? (Spanish)",
      proposeSecondaryWrongExplLabel: "Why are the others incorrect? (Spanish, optional)",
    },
    lessons: [
      {
        id: 0,
        title: "0. Game Fundamentals",
        summary: "EV, variance, mental game, and how money is made at poker.",
        chapters: [
          {
            title: "How do you make money at poker?",
            body: [
              { type: "text", content: "Poker is not a game against the house. It's a player-versus-player game where the room takes a small commission called rake to run the games. This means that luck alone is not enough to win: you need to make better decisions than your opponents consistently over time." },
              { type: "callout", label: "Where the money actually comes from", content: "The money you win at poker comes directly from other players' pockets. Players who consistently lose are called fish or recreational players. Players who consistently win are called regulars or regs. Your job is to position yourself on the right side of that equation." },
              { type: "text", content: "Win rate is the central metric for measuring a player's performance. It's expressed in BB/100 — big blinds won per 100 hands played. A win rate of 5 BB/100 at $0.10/$0.25 means you win 5 × $0.25 = $1.25 on average every 100 hands. That's not much per hand, but at 500 hands per hour over long sessions, it adds up." },
              { type: "callout", label: "Rake: the silent enemy", content: "The room takes rake from every pot — usually 4–5% up to a cap per hand. At low stakes, rake can represent a huge portion of the money in play. That's why rakeback and welcome bonuses matter so much when starting out: part of your profit will come from there, not just from your play." },
              { type: "text", content: "The good news is that at low stakes (NL10–NL25), the average skill level of your opponents is low. You don't need to play perfectly to win; you need to avoid the biggest mistakes and exploit those of others. That's the plan of this course." },
            ],
          },
          {
            title: "EV — Expected Value",
            body: [
              { type: "text", content: "EV (Expected Value) is the most important concept in poker. It defines the average outcome of a decision if it were repeated an infinite number of times. Every poker decision has a positive EV (EV+) or negative EV (EV–). The goal is not to win every individual hand, but to consistently make EV+ decisions." },
              { type: "callout", label: "Simple EV example", content: "Imagine a coin flip: heads you win €2, tails you lose €1. Do you play? EV = (0.5 × €2) + (0.5 × –€1) = €1 – €0.50 = +€0.50 per flip. Even though you might lose several flips in a row, in the long run this bet is always profitable. Poker works exactly the same way." },
              { type: "text", content: "In a specific hand, you might do everything right and still lose. That's fine. What matters is whether your decision had EV+ at the moment you made it, with the information available. An opponent who shoves all-in with 72o against your AA has very negative EV even if they occasionally win the pot." },
              { type: "callout", label: "EV in preflop decisions", content: "When you decide to open AJs from UTG, you don't expect to win that specific hand. What you know is that over the long run, opening AJs from UTG has positive EV: you build pots in position, you have strong equity when called, and you can win with continuation bets when you miss. The sum of all those factors produces a clear EV+." },
              { type: "text", content: "The direct corollary of EV is this: never evaluate a decision by its outcome. A river bluff that fails might have been the correct play. A river call that wins might have been a mistake. Always separate the process from the result." },
            ],
          },
          {
            title: "Variance: the noise that masks the signal",
            body: [
              { type: "text", content: "Variance is the natural fluctuation of short-term results. Even playing perfectly, you can lose for hundreds or thousands of hands in a row. Even playing badly, you can win for weeks. This is not an anomaly: it's mathematically inevitable." },
              { type: "callout", label: "How many hands to evaluate win rate?", content: "For your true win rate to emerge with reasonable reliability, you need between 50,000 and 100,000 hands. Before that, results are mostly noise. A 5,000-hand losing stretch doesn't mean you're playing badly — it can be normal variance even with a +5 BB/100 win rate." },
              { type: "text", content: "Downswings are inevitable for every player, including the best in the world. What separates a winning player from a losing one is not that the winner doesn't have downswings — it's that the winner keeps making good decisions during the downswing instead of tilting and making their play worse." },
              { type: "callout", label: "The short-term result trap", content: "Losing a session doesn't mean you played badly. Winning it doesn't mean you played well. This distinction is hard to internalize but fundamental. If you evaluate your decisions based on the result of a single session, you'll be adjusting your strategy based on random noise rather than real information." },
              { type: "text", content: "The practical tool for managing variance is bankroll management: having enough buy-ins in your roll to survive downswings without going broke. We'll cover this in detail in the Bankroll & Mindset lesson." },
            ],
          },
          {
            title: "Mental Game — The inner battle",
            body: [
              { type: "text", content: "You can study strategy for hours, know all the ranges and understand EV — and still lose money if your mental game isn't under control. Mental game is the ability to keep the quality of your decisions stable regardless of the emotional context of a session." },
              { type: "callout", label: "What is tilt?", content: "Tilt is any emotional state that deteriorates the quality of your decisions. It can come from a bad beat, a cooler, a bad session, a good session you don't want to leave, fatigue, problems outside poker... Tilt has many forms, but they all produce the same result: you play worse and lose more money than you should." },
              { type: "text", content: "The antidote to tilt is not trying not to feel emotions — that's impossible. It's having a system that isolates your emotions from your decisions. This includes setting clear rules before you sit down: a 3 buy-in stop-loss, a time limit, recognizing your personal warning signs and acting accordingly." },
              { type: "callout", label: "Process vs. result: the key distinction", content: "A good decision that loses is still a good decision. A bad decision that wins is still a bad decision. If you truly internalize this, poker changes completely: you stop getting frustrated by inevitable bad results and focus on the only thing you can control — the quality of your decisions." },
              { type: "text", content: "High-level poker is a game of incomplete information repeated thousands of times. In any individual hand, the luck factor is enormous. In the long run, luck cancels out and only skill remains. Your job is to play enough hands with enough quality for the long run to work in your favor." },
            ],
          },
          {
            title: "Stack depth: playing with 100 BB",
            body: [
              { type: "text", content: "All the strategy in this course is calibrated for playing with 100 effective big blinds. This is not a minor detail: stack depth completely changes the value of hands, the optimal bet sizing, and which ranges are profitable to play." },
              { type: "callout", label: "Why 100 BB as the reference point?", content: "With 100 BB you have enough money to extract maximum value with strong hands across multiple streets, for speculative hands to have the implied odds needed to be profitable, and for bluffs and semi-bluffs to carry real pressure. Below 100 BB the strategy starts to change: the game simplifies, draws lose value, and preflop decisions become more polarized." },
              { type: "callout", label: "Rebuy if you drop below 80-90 BB", content: "The practical rule is clear: if your stack falls below 80-90 BB, top up to 100 BB before continuing. Playing with 75, 60 or 50 BB is not simply 'having fewer chips' — it's a different game with a different pot geometry. The strategy you're learning here doesn't work the same way with short stacks." },
              { type: "text", content: "The most important reason to rebuy has to do with speculative hands. Small pairs (22-66) and low suited connectors (65s, 76s, 87s) are profitable with 100 BB because when they hit a very strong hand (set, straight, flush), they can extract enough value across the pot to compensate for the many times they miss the flop and have to fold." },
              { type: "callout", label: "Why small pairs need deep stacks", content: "22-66 make a set roughly 1 in 8 times they see the flop. When you hit, you need to win enough chips to compensate for the 7 times you missed. With 100 BB effective, a flopped set can win 80-100 BB in a multi-street pot. With 40 BB, the maximum you can win is 40 BB — which often doesn't cover the blinds paid to repeatedly see the flop." },
              { type: "callout", label: "Why suited connectors need deep stacks", content: "65s, 76s, 87s, 98s are hands that aim for flushes and straights. When they hit a flush draw on the flop they may need 2 streets to complete — which requires large pots only possible with deep stacks. With a short stack, the equity of these hands drops dramatically because the maximum possible pot doesn't justify the risk of playing them." },
              { type: "text", content: "In summary: speculative hands are profitable with implied odds, and implied odds only exist when there are enough chips on the table. 100 BB is the point where these hands go from marginal to clearly profitable with the right strategy." },
            ],
          },
          {
            title: "Tools and study routine",
            body: [
              { type: "text", content: "Modern poker is improved as much away from the table as at it. Players who only play without studying improve very slowly or not at all. Those who combine volume with structured study can go from losing to winning in a matter of months." },
              { type: "callout", label: "Essential software", content: "PokerTracker 4 or Hold'em Manager 3 are the industry standard trackers: they record all your hands, calculate your real win rate, show opponent statistics (VPIP, PFR, 3-bet %, etc.) and let you review sessions hand by hand. They're paid tools, but essential from NL10 onward." },
              { type: "text", content: "Solvers (PioSolver, GTO+, Simple Postflop) calculate the theoretically optimal strategy for any spot. You don't need them from the start — they're more useful once you have solid fundamentals — but understanding their outputs gives you a huge edge over opponents who play purely on intuition." },
              { type: "callout", label: "A minimum viable study routine", content: "1. Play a session. 2. When done, flag 3–5 hands that gave you doubts. 3. Analyze them away from the table: what should you have done? Why? 4. Once a week, study one specific concept (a spot, a board texture, a hand type). Consistency beats intensity: 30 minutes of real study per day is worth more than 5 hours once a week." },
              { type: "text", content: "In this course we'll build knowledge layer by layer. Each lesson adds concepts that build on the previous ones. Don't rush: thoroughly understanding the fundamentals is worth far more than superficially knowing advanced concepts." },
            ],
          },
          {
            title: "Poker Dictionary — essential terms",
            body: [
              { type: "text", content: "Poker has its own language. Learning these terms is not optional: they appear constantly in study, videos, forums and the game situations themselves. This reference covers the most important ones." },
              { type: "callout", label: "Hero and Villain", content: "Hero always refers to the active player whose perspective we analyze the hand from — that's us. Villain is the opponent. These terms allow describing situations without revealing the result: 'Hero has KK, Villain bets pot on the river' is a neutral format that separates the decision from the outcome. They're used interchangeably with 'we' and 'the opponent'." },
              { type: "callout", label: "Fish and Reg", content: "Fish (or recreational player): a player who chronically loses money by making systematic mistakes — paying off too much, not folding, playing too many hands. Regular (Reg): a winning or competent player who studies and applies consistent strategy. At low stakes most of the table are fish, which is a huge advantage for the reg." },
              { type: "callout", label: "The Nuts", content: "The nuts is the strongest possible hand given the board. On a board of A♠K♠Q♠J♠T♠, the nuts would be any flush above the T, or specifically the Royal Flush. 'Nuts' is relative to the board: on K♥8♦3♣ the nuts is trip Kings. A hand can be 'the nuts' or simply 'near-nuts'. Knowing what the nuts is on each board is essential to evaluating relative hand strength." },
              { type: "callout", label: "Draw — Drawing hand", content: "A draw is an incomplete hand that needs improvement from future cards to win. Most common types: Flush draw (FD): 4 cards of the same suit, needs a fifth. Open-ended straight draw (OESD): 4 consecutive cards with two ways to complete (e.g. 6789 completes with 5 or T). Gutshot (GS): 4 cards to a straight with only one way to complete (e.g. 6 8 9 T only fills with 7). Backdoor draw: needs both next cards to complete." },
              { type: "callout", label: "IP / OOP — Position in the hand", content: "IP (In Position) means you act after your opponent on postflop streets. This is a huge advantage: you see their action before deciding, can control pot size and bluff more effectively. OOP (Out of Position) is the opposite: you act first, without information on what the opponent will do. Generally you want to play IP whenever possible and be selective about hands you play OOP." },
              { type: "callout", label: "Open / Open raise", content: "Opening the pot means making the first voluntary preflop bet when nobody else has entered yet. Specifically it's a raise, not a limp (just calling the blind). An open from UTG to 3x BB means betting 3 times the big blind as the first to act. The basic philosophy: either open with a raise or fold. Limping (calling the blind without raising) gives up initiative and is almost always a mistake." },
              { type: "callout", label: "Range", content: "A player's range is the set of all hands they would take a given action with. You don't think 'the opponent has AK' but 'the opponent has a UTG opening range that includes AA-TT, AKs-AJs, KQs, etc.' Thinking in ranges rather than specific hands is the most important conceptual leap in modern poker." },
              { type: "callout", label: "Equity", content: "A hand's equity is its percentage chance of winning the pot if the hand goes to showdown with all community cards out. AK has ~67% equity against QQ before the flop. Equity changes with each card that falls. Having equity doesn't mean always betting — sometimes equity is best realized by checking." },
              { type: "callout", label: "SDV — Showdown Value", content: "Showdown Value of a hand is its ability to win if it reaches showdown without improving. A hand with high SDV (e.g. top pair good kicker) is sometimes best not bet, to reach showdown. A hand without SDV (air, missed draws) has no showdown value and only wins if it forces a fold or improves." },
              { type: "callout", label: "Bluff / Value bet / Semi-bluff", content: "Value bet: betting expecting to be called by worse hands. Bluff: betting without a strong hand to force a fold. Semi-bluff: betting with a draw — if opponent folds, great; if they call, you can still improve to the best hand. The difference between value and bluff isn't what you hold, but your hand's equity against the range that calls you." },
              { type: "callout", label: "C-bet — Continuation Bet", content: "The c-bet is a bet made by the preflop aggressor on the flop. If you opened the pot preflop and the flop is reached, the c-bet 'continues the story' — you remain the aggressor. A value c-bet is made with a strong hand expecting calls from worse hands. A light c-bet is made without a hand, expecting the opponent to fold." },
              { type: "callout", label: "Effective Stack", content: "The effective stack is the smallest stack among the players in a hand. If Hero has 100BB and Villain has 60BB, the effective stack is 60BB — that's all that can be wagered between them. The effective stack determines how much can be won or lost in the hand and completely affects strategy." },
              { type: "callout", label: "Pot odds / Implied odds", content: "Pot odds: the ratio of the current pot size to what you have to pay to continue. If the pot is 10BB and you must pay 2BB, you have pot odds of 5:1 (need to win 1 in 6 times to break even). Implied odds: the additional credit you receive considering what you can win on future streets if you improve. Implied odds justify calls that pot odds alone don't." },
            ],
          },
          {
            title: "Rake and Rakeback — the real cost of playing",
            body: [
              { type: "text", content: "Rake is the commission the poker room charges to run the games. You don't play against the house — the house just charges for the service. But that cost exists and it's important to understand exactly how it works, how much it costs you, and how to minimize it." },
              { type: "callout", label: "How does rake work?", content: "In cash games, the room takes a percentage of the pot — typically between 4% and 6% — with a maximum cap per hand. Typical example: 5% rake with a 3BB cap. If the pot reaches 20BB, the room takes 1BB (5%). If the pot is 200BB, the room still only takes 3BB (the cap). Rake is deducted from the winning pot, not charged directly to the player." },
              { type: "callout", label: "Rake by stakes: how much each level pays", content: "At NL2 ($0.01/$0.02): rake 5%, cap $0.30 → practically 100% of small pots goes to rake. The hardest stake to beat due to rake. NL10 ($0.05/$0.10): rake 5%, cap $1 → more manageable. NL25 ($0.10/$0.25): rake 5%, cap $1.25 → the point where winning play becomes more viable. As stakes increase, rake as a percentage of money in play decreases — one reason higher stakes are more beatable." },
              { type: "text", content: "In practice, rake has a huge impact on win rate. A break-even player before rake (who makes the same correct decisions as opponents on average) loses money because rake makes them a net loser. To make money you need to be good enough to cover the rake AND generate profit on top." },
              { type: "callout", label: "Rakeback — recovering part of the rake", content: "Rakeback is a loyalty program where the room returns a percentage of the rake you generated. If you pay $100 in rake in a month and have 30% rakeback, you get $30 back. At low stakes, rakeback can represent the difference between losing and winning — or between a mediocre win rate and a solid one." },
              { type: "callout", label: "Types of rakeback programs", content: "Direct rakeback: the room credits a fixed % of rake to your account. VPP/FPP points: points systems redeemable for cash, tournament entries or bonuses. Welcome bonuses: many rooms offer a 100% match on your first deposit up to a limit, released gradually as you generate rake. Loyalty programs: VIP tiers with increasing benefits. The best platforms in terms of rake+rakeback for low stakes vary — research up-to-date comparisons before choosing a room." },
              { type: "callout", label: "Which room to choose?", content: "Room choice hugely impacts profitability. Consider: (1) Rake rate and cap structure. (2) Rakeback or points program. (3) Game quality — softer tables compensate for higher rake. (4) Software and usability. (5) Security and track record. Established rooms: PokerStars, GGPoker, Winamax, 888poker, PartyPoker. Conditions change — check specialized forums like r/poker or 2+2 for updated reviews." },
              { type: "text", content: "The practical conclusion: rake isn't an enemy to fear if you play well, but it is a real factor to manage intelligently. Maximize rakeback, choose your room carefully, and ensure your win rate is positive enough to cover rake and still finish in the green." },
            ],
          },
        ],
      },
      {
        id: 1,
        title: "1. Opening the Pot",
        summary: "What an open is, hand types, and ranges per position in 6-max.",
        chapters: [
          {
            title: "What is opening the pot?",
            body: [
              {
                type: "text",
                content:
                  "Opening the pot means being the first player to make a bet preflop — specifically, an open-raise. In a 6-max cash game, before preflop action begins, the two players in the Small Blind (SB) and Big Blind (BB) positions have already posted mandatory money in the pot.",
              },
              {
                type: "text",
                content:
                  "When the players before you have folded and you are the first to put chips in with a raise, you have opened the pot. This is one of the most fundamental concepts in poker: preflop action defines the context of the entire hand.",
              },
              {
                type: "callout",
                label: "Why raise and not limp?",
                content:
                  "Entering the pot by just calling the blind (limping) is a weak play. You don't build the pot with your good hands, you give away information about weakness, and you play out of position without initiative. An open-raise gives you initiative, builds the pot, and puts pressure on the blinds.",
              },
              {
                type: "text",
                content:
                  "Open sizing also matters. In modern 6-max cash, the standard is to open between 2.5x and 3x BB. Opening too large scares off weak hands but also reduces your EV with value hands. Opening too small invites many callers and turns the hand into a multiway pot where your edge shrinks.",
              },
            ],
          },
          {
            title: "Hand types and classification",
            body: [
              {
                type: "text",
                content:
                  "Before talking about ranges by position, you need to know how to classify hands. In poker there are four main categories that determine how you play a hand preflop and what your postflop objectives are.",
              },
              {
                type: "handCategory",
                categories: [
                  {
                    name: "Premium Hands",
                    color: "#f59e0b",
                    icon: "👑",
                    hands: "AA, KK, QQ, JJ, AKs, AKo",
                    description:
                      "The strongest hands in poker. You always open these from any position, and in most cases you 3-bet them if there's a raise in front of you. With these you want to build the pot and aim for an all-in preflop or on early streets.",
                  },
                  {
                    name: "Strong Hands",
                    color: "#c9a84c",
                    icon: "💪",
                    hands: "TT, 99, AQs, AJs, AQo, KQs, KQo",
                    description:
                      "Hands with a lot of equity but requiring more care. You open these from most positions and generally play them for value. Postflop you want to make a strong top pair, overpair, or flush/straight draws.",
                  },
                  {
                    name: "Playable Hands",
                    color: "#10b981",
                    icon: "🎯",
                    hands: "88-66, ATs-A8s, KJs, QJs, JTs, T9s, AJo, KJo",
                    description:
                      "Hands with good potential but position-dependent. Open these from middle-to-late positions (CO, BTN, SB) and only the best ones from early position. They aim for flushes, straights, two pairs, or top pair with a good kicker.",
                  },
                  {
                    name: "Speculative Hands",
                    color: "#8b8fa8",
                    icon: "🔮",
                    hands: "55-22, A7s-A2s, K9s-K6s, low suited connectors, suited gappers",
                    description:
                      "Hands that need position and implied odds to be profitable. Only open from BTN, CO, and sometimes SB. They aim for sets, made flushes, and straights. If they miss the flop, generally fold them.",
                  },
                ],
              },
              {
                type: "callout",
                label: "Suited vs Offsuit",
                content:
                  "A suited hand is worth approximately 2–4% more equity than its offsuit version. It's not just the flush: the possibility of making a flush adds value on every street and makes the hand more playable postflop. AKs and AKo are very different hands in terms of playability, even though both are opens from all positions.",
              },
            ],
          },
          {
            title: "Positions in 6-max",
            body: [
              {
                type: "text",
                content:
                  "At a 6-player table, positions rotate with each hand. The later you act, the more information you have about the players who acted before you. Position is, along with your cards, the most important factor in poker.",
              },
              {
                type: "tableImage",
              },
              {
                type: "positionMap",
                positions: [
                  { name: "UTG", full: "Under the Gun", desc: "First to act. Maximum pressure, minimum info." },
                  { name: "MP", full: "Middle Position", desc: "Second to act. Slightly more comfortable than UTG." },
                  { name: "CO", full: "Cutoff", desc: "Second to last before BTN. Very good position." },
                  { name: "BTN", full: "Button", desc: "The best seat. Acts last on all postflop streets." },
                  { name: "SB", full: "Small Blind", desc: "Must post half a blind. Worst position postflop." },
                  { name: "BB", full: "Big Blind", desc: "Must post the full blind. Closes preflop action." },
                ],
              },
              {
                type: "callout",
                label: "The golden rule of position",
                content:
                  "The earlier you act, the tighter you must be. UTG may have 5 players behind with strong hands. The BTN only has the blinds, who are at a positional disadvantage postflop. That asymmetry completely defines opening ranges.",
              },
            ],
          },
          {
            title: "UTG — Under the Gun",
            body: [
              { type: "positionHeader", name: "UTG", range: "~11%", size: "3x BB", color: "#ef4444" },
              {
                type: "text",
                content:
                  "UTG is the hardest position. You act first out of 6 players and have everyone behind you with the ability to 3-bet or cold call. This means your range must be the tightest at the table: only open hands that can withstand heavy pressure.",
              },
              { type:"rangeImage", src:orEP, alt:"EP/UTG opening range" },
              {
                type: "text",
                content:
                  "Notice that from UTG we don't open small pairs (66-22), almost no low suited connectors, or hands like K9s or Q9s. Why? Because these hands are only profitable with position and few players behind. From UTG you can face a 3-bet or a cold call from CO and BTN, putting these hands in difficult spots.",
              },
              {
                type: "callout",
                label: "Size: 3x BB",
                content:
                  "From UTG we use 3x (or even 3.5x at very passive tables) to compensate for the fact that we'll play many streets out of position if the blinds call. A larger bet reduces the number of callers and gives us a more manageable pot.",
              },
            ],
          },
          {
            title: "MP — Middle Position",
            body: [
              { type: "positionHeader", name: "MP", range: "~15%", size: "2.5–3x BB", color: "#f97316" },
              {
                type: "text",
                content:
                  "From MP you have a slightly better position than UTG: one player has already acted before you, and if that player folded, only CO, BTN, SB, and BB remain. This lets you expand the range moderately.",
              },
              { type:"rangeImage", src:orMP, alt:"MP opening range" },
              {
                type: "callout",
                label: "Watch out with AJo and KQo from MP",
                content:
                  "AJo and KQo look strong but have difficulties when facing a 3-bet: too weak to call comfortably and too strong to always fold. We open them from MP, but they need a clear structure when facing 3-bets.",
              },
            ],
          },
          {
            title: "CO — Cutoff",
            body: [
              { type: "positionHeader", name: "CO", range: "~26%", size: "2.5x BB", color: "#eab308" },
              {
                type: "text",
                content:
                  "The Cutoff is one of the most profitable positions at the table. You only have BTN, SB, and BB behind you. BTN can call or 3-bet you, but the blinds will play postflop out of position. This allows you to open a considerably wider range.",
              },
              { type:"rangeImage", src:orCO, alt:"CO opening range" },
              { type:"callout", label:"🟥 Dark red vs 🩷 Light pink — two colors, two situations", content:"Dark red hands (unfavorable) are always opens, even when players behind are active or aggressive. Light pink hands are exploitative opens: they are only EV+ when the players acting after you fold frequently — either to the open raise itself, or if they call, they fold a lot to your c-bet on the flop. If BTN and the blinds are tight players who fold their blinds more than 70% of the time, the pink hands become directly profitable. If they are calling stations or very active players, skip the pink hands." },
              {
                type: "callout",
                label: "ATo from CO",
                content:
                  "ATo is a valid open from CO, but needs careful handling vs 3-bets. It lacks the strength to 4-bet light and the playability to comfortably call a 3-bet out of position. In some spots, folding to a 3-bet is perfectly correct.",
              },
            ],
          },
          {
            title: "BTN — Button",
            body: [
              { type: "positionHeader", name: "BTN", range: "~45%", size: "2.5x BB", color: "#10b981" },
              {
                type: "text",
                content:
                  "The Button is the most powerful position in poker. You act last on all postflop streets, giving you full control over pot size, the ability to bluff more effectively, and the advantage of seeing all actions before deciding. This justifies opening almost twice as many hands as UTG.",
              },
              { type:"rangeImage", src:orBTN, alt:"BTN opening range" },
              { type:"callout", label:"🟥 Dark red vs 🩷 Light pink — exploitative adjustment BTN", content:"Dark red hands are always opens from BTN. Light pink hands are exploitative: they are EV+ when the blinds fold frequently to the open (SB and BB with Fold to Steal >70%) or when they call but fold a lot to your c-bet. From BTN, the positional edge is so large that the threshold for exploitative opens is very low — if the blinds are tight or passive postflop, virtually the entire pink portion becomes a standard open." },
              {
                type: "callout",
                label: "Why so wide?",
                content:
                  "Because the positional advantage is so large that even mediocre hands become profitable. Postflop you see all SB and BB actions before acting. That information is worth a lot of money long-term. Also, opening wide builds an active image that lets you systematically pressure the blinds.",
              },
            ],
          },
          {
            title: "SB — Small Blind",
            body: [
              { type: "positionHeader", name: "SB", range: "~36%", size: "3x BB", color: "#8b5cf6" },
              {
                type: "text",
                content:
                  "The Small Blind is the most complex position in the game. You must post half a blind and, if you open, you will always play postflop out of position against the BB. This makes SB structurally the hardest seat to open and play hands from.",
              },
              { type:"rangeImage", src:orSB, alt:"SB opening range" },
              { type:"callout", label:"🟥 Dark red vs 🩷 Light pink — exploitative adjustment SB", content:"Dark red hands are always opens from SB vs BB. Light pink hands are exploitative: only open these when BB folds frequently — either to the open (Fold to SB Steal >60%) or to your c-bet on the flop. If BB is a calling station who defends very wide and never folds postflop, skip the pink hands: they don't have enough equity to be profitable without fold equity." },
              {
                type: "callout",
                label: "Size: 3x BB from SB",
                content:
                  "We open to 3x from SB to compensate for the positional disadvantage by reducing callers, and because the BB already has 1 BB in — a 2.5x open gives them too good odds to defend an extremely wide range.",
              },
            ],
          },
          {
            title: "Adjustments based on player type",
            body: [
              {
                type: "text",
                content: "Everything we've covered so far is a balanced strategy: it works reasonably well against any type of opponent because it has no obvious exploitable leaks. But at low stakes, the vast majority of players don't play balanced — and that's a huge opportunity for you.",
              },
              {
                type: "text",
                content: "Exploitative play means identifying an opponent's imbalance and adjusting your strategy to maximally profit from that specific imbalance. Applied to opening ranges, there are two key situations:",
              },
              {
                type: "callout",
                label: "Nits behind → widen your range",
                content: "A nit is a player who plays very few hands and rarely 3-bets without premium holdings. If you have one or two nits behind you in BTN or CO, you can open more hands than the standard range would suggest. Nits fold their blinds most of the time, and when they do enter the pot they have such tight ranges that you always know where you stand. Widening against nits is directly profitable: you steal more blinds and play more pots in position.",
              },
              {
                type: "callout",
                label: "Maniacs or aggressive 3-bettors → tighten your range",
                content: "If the player in BTN 3-bets 15-20% of your opens, playing marginal hands from CO or MP becomes a losing proposition. Hands like Q9s, KTo, or A7o don't play well vs a 3-bet: too weak to 4-bet and uncomfortable to call out of position. The solution is to remove the weakest hands from your range until you only open hands that have a clear response to a 3-bet.",
              },
              {
                type: "callout",
                label: "Balanced strategy vs. exploitative strategy",
                content: "The strategy presented in this lesson is balanced: designed to not be exploited by a perfect player. But at low stakes, nobody plays perfectly. If your opponent is clearly imbalanced (folds too much, calls too much, 3-bets too much), the correct play is to deviate from balance and exploit that imbalance directly. In the long run, exploitative strategy has more EV than balanced play when opponents have clear leaks.",
              },
            ],
          },
          {
            title: "Open sizing: stay consistent",
            body: [
              {
                type: "text",
                content: "One of the most frequent mistakes at low and intermediate levels is varying open size based on hand strength from the same position. For example: opening AA to 5x to 'protect it', then opening 76s to 2.5x because they 'don't want to commit too much'. This is a serious mistake.",
              },
              {
                type: "callout",
                label: "Why varying size reveals your hand",
                content: "If you always open 3x with strong hands and 2x with speculative hands, an attentive opponent learns to read your sizing. When you open 3x, they fold medium hands and only continue with their best holdings. When you open 2x, they float or 3-bet because they know you're weak. You're giving away free information every hand.",
              },
              {
                type: "text",
                content: "The solution is to use a standard size from each position regardless of your cards. If you open 2.5x from CO, that applies to both AA and 87s. Your sizing should reveal nothing about your hand strength.",
              },
              {
                type: "callout",
                label: "Can sizes vary between positions?",
                content: "Yes. It's perfectly correct to open 3x from UTG and 2.5x from BTN — the size changes based on position, not hand strength. What you cannot do is open AK to 4x and 65s to 2x from the same position. Within each position: one standard size.",
              },
            ],
          },
          {
            title: "Exercises: What would you do?",
            body: [
              {
                type: "text",
                content: "Put your knowledge to the test. In each situation you have information about your position, your cards, and the player types behind you. Choose the best play.",
              },
              {
                type: "quiz",
                questions: [
                  {
                    situation: "$0.10/$0.25 table · 6-max · You are on the BTN",
                    hand: "K♠ 5♠",
                    context: "UTG, MP and CO have all folded. The SB is a nit who folds to opens about 80% of the time. The BB is also a tight player who defends rarely.",
                    question: "What do you do with K5s on the BTN?",
                    options: [
                      { label: "Fold — K5s is too weak", correct: false, explanation: "K5s fits comfortably in the BTN opening range (~42%). It's not a premium hand, but it has flush draw potential and against nits who fold a lot, stealing the blinds is directly profitable." },
                      { label: "Open to 2.5x BB", correct: true, explanation: "Correct! K5s is a standard BTN open, and with two nits behind who fold frequently, you can even widen slightly beyond the standard range. Opening 2.5x with a consistent size is the perfect play." },
                      { label: "Limp to see a cheap flop", correct: false, explanation: "Limping is a weak play. You lose initiative, don't build the pot and give away information about weakness. From the BTN you either open or fold." },
                      { label: "Open to 5x to protect yourself", correct: false, explanation: "Opening large doesn't 'protect' weak hands — it just increases your risk without improving your equity. Varying size based on hand strength is an exploitable leak." },
                    ],
                  },
                  {
                    situation: "$0.05/$0.10 table · 6-max · You are in CO",
                    hand: "Q♣ 9♣",
                    context: "UTG and MP have folded. The BTN is a very aggressive player who 3-bets your opens approximately 20% of the time.",
                    question: "What do you do with Q9s in CO with a very aggressive BTN?",
                    options: [
                      { label: "Open to 2.5x — Q9s is a standard CO open", correct: false, explanation: "Q9s is a standard CO open in theory, but against a BTN who 3-bets 20%, it becomes a problem: not strong enough to 4-bet for value and uncomfortable to call a 3-bet out of position." },
                      { label: "Fold and wait for a better spot", correct: true, explanation: "Correct! Against a hyper-aggressive BTN, the exploitative adjustment is to tighten your range and remove hands that don't handle a 3-bet well. Q9s is exactly that type of hand: too weak to 4-bet, too marginal to call OOP." },
                      { label: "Open to 4x to discourage the 3-bet", correct: false, explanation: "A larger size doesn't deter an aggressive player — it probably gives them more incentive. It also reveals information about your range." },
                      { label: "Limp to see a cheap flop", correct: false, explanation: "Limping from CO is almost always a mistake: you give away initiative and remain OOP without any leverage. If you're going to play the hand, always open-raise." },
                    ],
                  },
                  {
                    situation: "$0.25/$0.50 table · 6-max · You are in MP",
                    hand: "A♥ A♦",
                    context: "UTG has folded. You have AA. You normally open 2.5x from MP, but you're thinking about going to 5x to 'protect' your hand.",
                    question: "What size do you open AA from MP?",
                    options: [
                      { label: "Open to 5x to protect the strong hand", correct: false, explanation: "Opening AA bigger than the rest of your range is a massive leak. Opponents will learn that large sizes = strong hands and will fold everything, leaving you winning tiny pots with your best hands." },
                      { label: "Open to 2.5x (your standard size)", correct: true, explanation: "Correct! AA gets opened exactly the same as any other hand from MP. Sizing consistency is fundamental: your sizing should reveal nothing about your strength. With AA you want action, not to scare players away." },
                      { label: "Limp to set a trap", correct: false, explanation: "Limping with AA (preflop slow-play) is a classic mistake. You let everyone in cheaply with hands that can crack you if they hit the flop. Always open-raise." },
                      { label: "Open to 2x to invite action", correct: false, explanation: "Opening smaller with your best hands also leaks information. If you open 2x with AA and 2.5x otherwise, attentive opponents will detect the pattern and adjust." },
                    ],
                  },
                  {
                    situation: "$0.10/$0.25 table · 6-max · You are in UTG",
                    hand: "A♠ 9♠",
                    context: "You are first to act. The table has solid regulars in all positions. Nobody has extreme tendencies.",
                    question: "What do you do with A9s from UTG?",
                    options: [
                      { label: "Fold — A9s is too weak from UTG", correct: false, explanation: "A9s falls within the standard UTG range (~14%). It has good flush potential and makes top pair with a solid kicker. No need to fold it from UTG." },
                      { label: "Open to 3x BB", correct: true, explanation: "Correct! A9s is included in the UTG range. Against solid regulars with no extreme tendencies, the balanced strategy is correct: open at your standard 3x size." },
                      { label: "Limp to see a cheap flop", correct: false, explanation: "Limping gives away initiative, leaks information and leaves you vulnerable to raises from late position. Never limp from UTG." },
                      { label: "Open to 2x because it's a medium hand", correct: false, explanation: "There's no 'medium size for medium hands'. One standard size per position, regardless of your cards." },
                    ],
                  },
                  {
                    situation: "$0.10/$0.25 table · 6-max · You are in SB",
                    hand: "J♦ 8♦",
                    context: "All players through BTN have folded. The BB is a very active player who 3-bets your SB opens about 25% of the time. You open to 3x and the BB 3-bets.",
                    question: "You open J8s from SB, the BB 3-bets. What do you do?",
                    options: [
                      { label: "Call the 3-bet and play the flop OOP", correct: false, explanation: "Calling a 3-bet with J8s out of position is not consistently profitable. Without initiative and acting first on every street, this hand loses a lot of value. You need hands with more equity or blockers to profitably call 3-bets OOP." },
                      { label: "Fold — J8s doesn't play well vs a 3-bet OOP", correct: true, explanation: "Correct! Opening J8s from SB is perfectly valid — it's a hand within the range. The adjustment against an aggressive BB is not to stop opening it, but to have a clear plan when the 3-bet comes: J8s lacks the equity to call OOP and lacks key blockers to 4-bet bluff. Open it, and fold to the 3-bet." },
                      { label: "4-bet bluff to put pressure on the BB", correct: false, explanation: "A 4-bet bluff with J8s doesn't make much sense: you don't block the BB's strong hands (no A or K in your hand) and an aggressive BB will often be happy to call or 5-bet. Save 4-bet bluffs for hands with blockers like A5s or K4s." },
                      { label: "Complete instead of raising in the first place", correct: false, explanation: "Completing from SB (limping) instead of opening was already the mistake before the 3-bet. The hand merits an open-raise to 3x — the point is not to avoid opening it, but to know to fold when the BB 3-bets." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: "2. When Someone Limps",
        summary: "Why limping is bad, how to exploit it with the ISO raise, and ranges by position.",
        chapters: [
          {
            title: "Why is limping bad?",
            body: [
              { type: "text", content: "Limping means entering the pot by calling the BB instead of raising. While it seems like a conservative play, it's one of the most common and costly mistakes at low stakes — and one of the easiest to exploit." },
              { type: "callout", label: "The 3 problems with limping", content: "1. No initiative: the limper never controls the hand. They'll check the flop almost every time, making them easy to pressure. 2. Exposed range: a limper rarely has AA-QQ or AKs. If they did, they'd raise. This means their range is capped at the top and everyone at the table knows it. 3. Multiway pot: limping invites other players to enter cheaply. The more players in the pot, the more any hand's edge gets diluted." },
              { type: "text", content: "Limping is especially damaging from early positions because it invites the whole table to see the flop cheaply. But even from the BTN or SB it has the same fundamental problems: the limper reaches the flop without initiative, with a range that's identifiably weak, and in a pot that may go multiway." },
              { type: "callout", label: "The limper's range is 'capped'", content: "Capped means the range has a ceiling of strength. A player who limps preflop never has AA, KK, QQ, JJ or AKs — those hands always raise. This information is public and completely changes how you should react to their postflop bets: when the limper bets hard on the flop, their hand can't be very premium. You can apply pressure far more often than against a normal aggressor." },
              { type: "text", content: "In short: limping is bad because it surrenders initiative, reveals range weakness and builds multiway pots where the limper has no tactical advantage. At low stakes, limpers are one of the biggest sources of profit — as long as you know how to exploit them correctly." },
            ],
          },
          {
            title: "The ISO raise — exploiting the limper",
            body: [
              { type: "text", content: "The ISO raise (isolation raise) means raising after one or more limpers with the goal of getting heads-up against them. You're exploiting the fact that they have a weak, capped range — and that you have initiative and usually position." },
              { type: "text", content: "A correct ISO raise achieves three things at once: you take initiative as the preflop aggressor, you force other players to overpay to continue (or they fold), and you're often left alone against the limper's weak hand with all the context in your favor." },
              { type: "callout", label: "When to ISO raise", content: "Almost always from BTN and CO vs a single fish limper. The combination of position + aggressor + capped limper range makes ISO profitable with a very wide range. From MP, ISO is still correct but with a tighter range because you have more players behind who can 3-bet or cold-call." },
              { type: "callout", label: "When NOT to ISO", content: "With 3+ limpers and a speculative hand: equity gets too diluted in a multiway pot. When the limper is a solid regular (rarely limps — probably has a trap). When your hand doesn't justify the risk: very weak hands should just be folded rather than ISO raised from early position." },
              { type: "text", content: "A special case: the limp-reraise. Some experienced players limp to re-raise if someone raises. If you suspect a player uses this tactic, reduce your ISO range or avoid it entirely. Regulars never limp without a reason, so the limper's profile matters a lot." },
            ],
          },
          {
            title: "ISO raise sizing",
            body: [
              { type: "text", content: "ISO raise sizing is always larger than the standard open. The reason is simple: if you only raise to 2.5x-3x, the limper and other players have good pot odds to call. You need to open bigger to make entry expensive and get heads-up." },
              { type: "callout", label: "The ISO sizing rule", content: "Base size 3x BB + 1BB per limper in the pot. Examples: 1 limper → raise to 4BB. 2 limpers → raise to 5BB. 3 limpers → raise to 6BB. If the limper is in SB and you're in BB: ISO to at least 4BB since you'll be OOP." },
              { type: "text", content: "Some players use a base of 4x instead of 3x, especially at very passive tables or against limpers who are calling stations (they call everything). This is valid and sometimes preferable — the goal is always to get heads-up or play with few people where your positional advantage is maximum." },
              { type: "callout", label: "Don't ISO too large", content: "If your ISO is 8x, 10x or more, you're risking too much when someone 3-bets. Also, with very large sizes the limper will fold hands they would have 'donated' to the pot. Keep ISO between 4BB and 6BB in most situations. The exception is live games or very passive tables where everyone calls any size — then larger sizing is justified." },
              { type: "text", content: "The size should always be the same regardless of your hand. Just as with standard opens, using the same ISO size with AA as with T8s is fundamental to avoid leaking information about your range to the limper and the rest of the table." },
            ],
          },
          {
            title: "ISO ranges — MP vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_MP", range: "~24%", size: "4x BB", color: "#f97316" },
              { type:"rangeImage", src:rolMP, alt:"ROL / MP" },
              { type:"callout", label:"🟥 Dark red vs 🩷 Light pink — exploitative ISO from MP", content:"Dark red hands are the core ISO range: use them always regardless of player types behind. Light pink hands are exploitative ISOs: they are EV+ only when the players after you (CO, BTN, blinds) fold frequently — either to the ISO raise, or if they call, fold a lot to your c-bet. From MP, with 4 players behind, the threshold is higher: only add the pink hands when the table is very passive or the specific players to your left are very tight." },
              { type: "text", content: "From MP the ISO is considerably tighter. You have CO, BTN and the blinds behind — four players who can enter the pot or 3-bet you. Only ISO from MP with hands that can withstand pressure and have a clear edge over the limper's range." },
                            { type: "callout", label: "The practical rule from MP", content: "If you'd hesitate to open the hand from MP in a standard spot, you probably shouldn't ISO either. The presence of a limper doesn't dramatically change the range from MP — it does widen it slightly, but the pressure from players behind remains the same." },
            ],
          },
          {
            title: "ISO ranges — CO vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_CO", range: "~32%", size: "4x BB", color: "#eab308" },
              { type:"rangeImage", src:rolCO, alt:"ROL / CO" },
              { type:"callout", label:"🟥 Dark red vs 🩷 Light pink — exploitative ISO from CO", content:"Dark red hands are always ISO raises from CO. Light pink hands are exploitative: EV+ when BTN and the blinds fold frequently to the raise (Fold to ISO >65%) or call but fold to your flop c-bet. With only 3 players behind from CO, the exploitative ISO threshold is more accessible than from MP." },
              { type: "text", content: "From CO with a limper in front, the range is tighter than BTN because you have BTN and the blinds behind — any of whom can cold-call or 3-bet. Even so, the CO ISO range is still wider than the standard CO open." },
                            { type: "callout", label: "Adjustment with aggressive BTN", content: "If BTN is a player who 3-bets a lot, tighten your CO ISO range upward: remove weaker hands (A4s, K8s, 64s) that don't handle a 3-bet well and keep those with a clear response (AA-77, AJs+, KQs)." },
            ],
          },
          {
            title: "ISO ranges — BTN vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_BTN", range: "~50%", size: "4x BB", color: "#10b981" },
              { type:"rangeImage", src:rolBTN, alt:"ROL / BTN" },
              { type:"callout", label:"🟥 Dark red vs 🩷 Light pink — exploitative ISO from BTN", content:"Dark red hands are the core BTN ISO range — always profitable with perfect position. Light pink hands are exploitative: EV+ when the blinds fold frequently to the ISO (Fold to ISO >60%) or call but give up postflop to your c-bet. From BTN the threshold is very low — in practice, almost the entire pink range becomes a standard ISO against tight blinds." },
              { type: "text", content: "From the BTN with a single limper in front, your ISO range is huge: approximately 50% of hands. The combination of perfect position (you act last on all postflop streets), the limper's weak range, and the fact that only two players are behind (SB and BB, who usually fold) all justify this." },
                            { type: "callout", label: "Why so wide?", content: "Because even mediocre hands are +EV here: the limper has a capped, weak range, you have position, and initiative means you dictate the pace of the hand postflop. Hands like Q7s or 73s that you wouldn't normally open become profitable ISOs from BTN." },
            ],
          },
          {
            title: "ISO ranges — SB vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_SB", range: "~30%", size: "4x BB", color: "#8b5cf6" },
              { type:"rangeImage", src:rolSB, alt:"ROL / SB" },
              { type:"callout", label:"🟥 Dark red vs 🩷 Light pink — exploitative ISO from SB", content:"Dark red hands are always ISO raises from SB. Light pink hands are exploitative: EV+ when BB folds frequently to the ISO or to your postflop c-bet. Note that from SB you play OOP against the limper — the pink hands require more fold equity to be profitable precisely because you lack the positional advantage you'd have from CO or BTN." },
              { type: "text", content: "From SB with a limper in front the situation is special: you only have BB behind, but you'll play postflop out of position against the limper. This shifts the range toward hands with more equity and less positional dependency." },
              { type: "callout", label: "ISO from SB vs limp", content: "ISO from SB is profitable but requires more care: the limper may have trap hands and you're OOP. Prioritize hands with direct value (medium-high pairs, broadways) and suited connectors with good equity potential. Very speculative hands lose value out of position." },
            ],
          },
          {
            title: "ISO vs 2+ limpers",
            body: [
              { type: "text", content: "With two or more limpers, the pot grows but so do the problems: more players means higher probability that someone has a strong hand or flops something. ISO with multiple limpers requires hands with more equity potential in multiway pots." },
              { type: "callout", label: "Sizing with 2 limpers", content: "2 limpers → ISO to at least 5BB. 3 limpers → ISO to 6BB. The goal is the same: make the pot expensive for players who would enter cheaply." },
                            { type: "callout", label: "With 3+ limpers", content: "With 3 or more limpers the pot becomes very multiway and ISO loses effectiveness unless you have a very strong hand (AA-QQ, AKs, AKo) or hands with great multiway equity potential (AXs, high suited connectors, medium pairs for set mining). Hands like K7s or Q6s should simply fold against 3+ limpers." },
            ],
          },
          {
            title: "Exercises: Limper situations",
            body: [
              { type: "text", content: "Put your knowledge to the test. In each situation there are one or more limpers. Choose the best play." },
              { type: "quiz", questions: [
                {
                  situation: "$0.10/$0.25 table · BTN · UTG has limped",
                  hand: "T♠ 8♠",
                  context: "UTG is a recreational player who limps frequently. CO has folded. You are on the BTN.",
                  question: "What do you do with T8s on BTN vs the fish limper from UTG?",
                  options: [
                    { label: "ISO raise to 4BB", correct: true, explanation: "Correct! T8s from BTN vs 1 fish limper is a clear ISO. You have perfect position, the limper has a capped weak range, and T8s has great straight and flush potential. Raise to 4BB (3x base + 1 for the limper)." },
                    { label: "Fold — T8s is too weak", correct: false, explanation: "T8s is comfortably in the BTN ISO range vs 1 limper (~50%). With position and a fish limper, this is a clear raise to 4BB." },
                    { label: "Limp behind", correct: false, explanation: "Overlimping is almost always a mistake: you enter the pot without initiative or information in a multiway pot. With T8s on BTN you should ISO or fold, never overlimp." },
                    { label: "Open to 2.5x (standard size)", correct: false, explanation: "With a limper in the pot, standard sizing of 2.5x gives the limper and blinds too good odds to call. ISO vs limper always uses a bigger size: at least 4BB." },
                  ],
                },
                {
                  situation: "$0.10/$0.25 table · CO · MP has limped",
                  hand: "2♠ 2♣",
                  context: "MP is a passive player who limps a lot. UTG has folded. You are in CO with 22.",
                  question: "What do you do with 22 in CO vs the MP limper?",
                  options: [
                    { label: "ISO raise to 4BB", correct: true, explanation: "Correct! 22 from CO vs 1 limper is an ISO. You have position, the pair gives you set potential, and the limper's range is weak. When you flop a set (1 in 8 times) you'll have a very strong hand in a pot where you have initiative." },
                    { label: "Fold — 22 is too weak to ISO", correct: false, explanation: "22 is in the CO ISO range vs a limper. Set mining is profitable in position with implied odds from a fish who will pay streets. ISO to 4BB." },
                    { label: "Limp behind", correct: false, explanation: "Overlimping with 22 is tempting but incorrect. Without initiative the pot goes multiway and you lose control. ISO to 4BB or fold — never limp behind." },
                    { label: "Fold — 22 can't handle a 3-bet", correct: false, explanation: "If someone 3-bets you can fold 22 with no problem — that doesn't mean you shouldn't make the ISO in the first place. Make the ISO to 4BB; if there's a 3-bet, fold. The EV of the ISO is positive even accounting for the times you fold to a 3-bet." },
                  ],
                },
                {
                  situation: "$0.25/$0.50 table · MP · UTG has limped",
                  hand: "K♠ 6♠",
                  context: "UTG is a recreational player. You are in MP with K6s. CO, BTN and the blinds still to act.",
                  question: "What do you do with K6s in MP vs the UTG limper?",
                  options: [
                    { label: "ISO raise to 4BB", correct: false, explanation: "K6s is not in the MP ISO range. You have CO, BTN and the blinds behind who can 3-bet or cold-call. K6s doesn't handle that pressure well and is not among the hands that ISO from MP (~24%). The correct play here is fold." },
                    { label: "Fold", correct: true, explanation: "Correct! K6s is not in the MP ISO range. The ISO range from MP is tighter because of the players behind. You need K9s or better from MP to ISO. With K6s the best play is to fold and wait for a better spot." },
                    { label: "Limp behind", correct: false, explanation: "Overlimping is almost always incorrect. You'd enter without initiative into a multiway pot with a mediocre hand. If K6s doesn't justify the ISO, it doesn't justify limping behind either." },
                    { label: "ISO raise to 2.5x", correct: false, explanation: "With a limper, 2.5x is insufficient — it gives them great odds to continue. Also K6s isn't in the MP ISO range, so the correct play is simply to fold." },
                  ],
                },
                {
                  situation: "$0.10/$0.25 table · BTN · UTG and MP have limped",
                  hand: "A♥ J♥",
                  context: "UTG is a fish and MP is a passive player. Two limpers in the pot. You are on BTN with AJs.",
                  question: "What size do you ISO with AJs on BTN vs 2 limpers?",
                  options: [
                    { label: "ISO to 5BB", correct: true, explanation: "Correct! With 2 limpers the size is: 3x base + 1BB per limper = 5BB. AJs is an excellent ISO hand: lots of equity, flush potential and strong top pair. With position and 2 fish in the pot, the EV is very high." },
                    { label: "ISO to 3BB (standard size)", correct: false, explanation: "With 2 limpers in the pot, opening to 3BB gives everyone too good odds to continue. The pot would go multiway with 4-5 players where your edge gets diluted. The rule: 3x base + 1BB per limper = 5BB." },
                    { label: "ISO to 8BB to clean out the pot", correct: false, explanation: "Excessively large ISO is a mistake: you risk too much and paradoxically may scare away the fish you wanted to call. 5BB is enough. Also, variable sizes leak information about your hand." },
                    { label: "Limp behind — AJs plays well multiway", correct: false, explanation: "Overlimping with AJs is a serious mistake. You give up all initiative and value of a strong hand. AJs should always ISO raise when there are limpers." },
                  ],
                },
                {
                  situation: "$0.10/$0.25 table · SB · BTN has limped",
                  hand: "9♣ 8♣",
                  context: "BTN is a recreational player who limps frequently. You are in SB with 98s. BB still to act.",
                  question: "What do you do with 98s in SB vs the BTN limper?",
                  options: [
                    { label: "ISO raise to 4BB", correct: true, explanation: "Correct! 98s from SB vs a limper is an ISO. You have a hand with excellent straight and flush potential, the limper has a capped range, and while you'll be OOP postflop the hand justifies the ISO. Raise to 4BB (3x base + 1 for the limper)." },
                    { label: "Complete the blind (call)", correct: false, explanation: "Completing from SB lets BB in for free and creates a 3-way pot with no initiative. That's exactly what you want to avoid. With 98s suited and a weak limper, ISO to 4BB is clearly superior." },
                    { label: "Fold — 98s doesn't play well OOP", correct: false, explanation: "98s has enough potential to justify the ISO even OOP. The hand has strong draw potential and in many flops you'll be able to apply pressure. The EV of the ISO is positive here." },
                    { label: "ISO to 2x to see if anyone 3-bets", correct: false, explanation: "Using a small size to 'test' makes no strategic sense and leaks weakness. Also 2x with a limper gives too good odds to everyone. Always use the correct sizing: base + 1BB per limper = 4BB." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 3,
        title: "3. The Continuation Bet",
        summary: "When to bet the flop as the aggressor, board textures, sizing, and when to check.",
        chapters: [
          {
            title: "Initiative: the most important postflop concept",
            body: [
              { type:"text", content:"Before talking about the C-bet, you need to understand the concept that makes it possible: initiative. Initiative is the implicit right to bet first on a street because you were the last to raise on the previous street. The player who made the last preflop raise arrives at the flop with initiative." },
              { type:"callout", label:"What does having initiative mean?", content:"Having initiative means the villain gives you the first action expecting you to bet. If you open from BTN and BB calls, the BB will check on the flop most of the time — because you're the aggressor and it's expected you'll continue your story. That expectation is a weapon: you can bet with strong hands to extract value, and also with weak hands to steal the pot. The villain can't tell which is which." },
              { type:"text", content:"Initiative also reflects something crucial about ranges: the player with initiative usually has a stronger range on the flop. When someone opens from UTG, their preflop range is the tightest at the table. When the BB calls that open, they enter with a wide range full of speculative hands that frequently miss the flop. That range asymmetry is the foundation of the aggressor's postflop edge." },
              { type:"callout", label:"Losing initiative: the biggest postflop mistake", content:"If you have initiative and check without a clear reason, you surrender it to the villain. From that point, the villain can bet with any hand — value or bluff — and you can only react. Players who don't use their initiative lose money in two ways: they don't extract value when they should bet, and they give away pots when they should apply pressure. Initiative is an asset. Use it." },
              { type:"text", content:"An important nuance: initiative is not permanent. It can be reclaimed with a check-raise, and it's lost if you check two streets in a row. In this chapter you'll learn when to use initiative to bet (C-bet), when to preserve it by checking with traps, and when you no longer have enough edge to use it." },
            ],
          },
          {
            title: "What is a C-bet?",
            body: [
              { type:"text", content:"A continuation bet (C-bet) is a bet made on the flop by the player who was the preflop aggressor — whoever opened or made the last raise before seeing the flop. Since you have initiative from the previous street, you have the right to 'continue' that aggression by betting the flop, regardless of what you were dealt." },
              { type:"text", content:"A C-bet can be one of two types: for value, when you have a strong hand and want to build the pot, or as a semi-bluff/bluff, when you missed the flop but bet to force folds. Both are correct in the right context." },
              { type:"callout", label:"Why C-betting works", content:"The villain misses the flop roughly 65-70% of the time. When the board is dry and the villain has nothing, a small bet gets a fold frequently — and that already has positive EV on its own, regardless of your cards. Add to that the cases where you do have equity or a strong hand." },
              { type:"callout", label:"The 'auto-profit' concept", content:"If the villain folds more than pot odds require for your bluff, every C-bet has automatic EV+. For example, if you bet 33% of the pot, the villain only needs to fold 25% of the time for the bluff to be profitable. On dry boards against disconnected ranges, that happens much more frequently." },
              { type:"text", content:"Failing to C-bet by default is a serious mistake at low stakes. Many beginners only bet when they have a good hand — making their game completely predictable. Preflop initiative is worth nothing if you don't use it." },
            ],
          },
          {
            title: "Board textures",
            body: [
              { type:"text", content:"The flop texture is the most important factor in deciding whether to C-bet, how frequently, and at what size. Boards fall into two main categories: dry and wet." },
              { type:"handCategory", categories: [
                { name:"Dry Boards", color:"#10b981", icon:"🏜️",
                  hands:"A♠7♦2♣ · K♥8♦3♠ · Q♦6♣2♥ · J♣4♦2♠",
                  description:"Rainbow (three different suits), no connected cards, no obvious draws. The preflop aggressor almost always has range advantage on these boards — nobody has draws and the villain frequently misses. C-bet with high frequency and small sizing (33%)." },
                { name:"Wet Boards", color:"#ef4444", icon:"🌊",
                  hands:"J♠T♠9♦ · 8♣7♣6♦ · 9♥8♦7♥ · K♠J♠T♥",
                  description:"Board with two or three matching suits, connected cards, possible straights and flushes. The villain can have many draws and hands that connect well. More selective C-betting: only with strong hands, strong draws, or when you have clear range advantage. Larger sizing (67%+)." },
                { name:"Intermediate Boards", color:"#c9a84c", icon:"⚖️",
                  hands:"A♠K♦7♣ · K♠Q♣8♦ · Q♥J♦6♠ · T♥9♦3♠",
                  description:"Neither completely dry nor completely wet. One repeated suit or moderate connectivity. Requires analysis: evaluate range advantage and villain's profile to decide size and frequency." },
              ]},
              { type:"callout", label:"Quick board assessment rule", content:"Ask yourself two questions: (1) How many draws are there? If few, dry board — small C-bet. (2) Does my range or the villain's range connect better with this board? If my range is stronger here, C-bet with high frequency." },
            ],
          },
          {
            title: "Range advantage and nut advantage",
            body: [
              { type:"text", content:"Before C-betting, the key question is not 'what do I have?' but 'what range do I have here versus what range does the villain have?'. There are two fundamental concepts:" },
              { type:"callout", label:"Range Advantage", content:"When your overall range is stronger than the villain's on a specific board. Example: you open from UTG and BB calls. Flop is A♠7♦2♣. Your UTG range is full of hands that connect strongly here: AA, KK-99 (overpairs), AKs-ATs, AKo-AQo (strong top pair). The BB called with a very wide range where many hands have nothing on this board. You have clear range advantage — C-bet very widely." },
              { type:"callout", label:"Nut Advantage", content:"When you have more combos of the strongest hands (nuts) than the villain on that board. Example: BTN opens, BB calls. Flop is Q♠T♦9♣. The BB can have many J8 combos making a straight, but BTN holds all the KJ combos (the highest straight) — KJs and KJo are standard BTN opens. The BB, having called preflop, is less likely to hold KJ since those hands are more commonly 3-bet or raised. BTN has nut advantage on Q-T-9, justifying large sizes when holding the strongest hands." },
              { type:"text", content:"The opposite situation also exists: if BB calls your BTN open and the flop is 8♠7♠6♦, the BB actually has more hands that connect with that board (suited connectors, low pairs) because they called with a very wide range. In that case, your range advantage shrinks and you should C-bet less and more selectively." },
              { type:"callout", label:"The quick evaluation trick", content:"Which types of hands 'love' this flop? If those hands are mostly in my preflop range → I have advantage → C-bet widely. If they're mostly in the villain's range → no advantage → be selective." },
            ],
          },
          {
            title: "C-bet sizing",
            body: [
              { type:"text", content:"C-bet sizing is just as important as the decision to bet. The most common mistake is varying the size based on hand strength — exactly like preflop, that gives away information. Use the same sizing for all the hands you bet on that board." },
              { type:"rangeBlock", label:"Sizing guide", hands: [
                { group:"33% of the pot", cards:"Dry boards (A72r, K83r). Bluffs and value bets are the same size. High betting frequency. Villain only needs to fold 25% for it to be profitable." },
                { group:"50% of the pot", cards:"Intermediate boards. Balanced sizing. Works well in many spots when there's no extreme texture." },
                { group:"67% of the pot", cards:"Semi-wet boards or when you want to polarize. Draws and strong hands in your range. Protects your hand from cheap draws." },
                { group:"75-100% of the pot", cards:"Very wet boards or extreme polarization. Very strong hands + powerful bluffs. Forces villain to pay dearly for their draws." },
              ]},
              { type:"callout", label:"The golden rule of sizing", content:"Choose the size based on BOARD TEXTURE, not HAND STRENGTH. If you bet 33% with AA and 75% with AK on A72r, the villain learns to read your hands. Use 33% with everything you bet on that board." },
              { type:"text", content:"One valid exception: changing sizing between dry and wet boards is perfectly correct and gives no information, because the change is due to the board, not your hand. What you can't do is use different sizes for different hands on the same board." },
            ],
          },
          {
            title: "In position vs out of position",
            body: [
              { type:"text", content:"Position completely changes the math of C-betting. Acting after the villain is a huge advantage that gives you much more freedom to bet." },
              { type:"callout", label:"In Position (IP) — more freedom", content:"You can C-bet more widely because: (1) if the villain check-raises, you have information about their hand. (2) If they call, you can control sizing on future streets. (3) If they fold, they'll do so before you need to act on the turn. IP allows bluffing more frequently and with weaker hands." },
              { type:"callout", label:"Out of Position (OOP) — be more selective", content:"The villain acts after you on every street. If you C-bet and they call, you lose information on the turn. If you C-bet and they raise, you don't have the context of having seen their action first. OOP you must be more selective: C-bet more with strong hands and powerful draws, check more air." },
              { type:"text", content:"OOP you also have the check-raise weapon: if you check with a very strong hand and the villain bets, you can raise. This play is devastating for the villain because it destroys their expectation of seeing the turn cheaply. Check-raises for value are especially profitable against players who C-bet a lot." },
              { type:"callout", label:"Check-raise as a weapon OOP", content:"From OOP on a dry board, checking AA, KK, or sets can be superior to C-betting if the villain is an aggressive player who will bet when you check. This extracts more value. But don't do it predictably — if you only check-raise with the nuts, the villain will learn not to bet." },
            ],
          },
          {
            title: "Exploitative adjustments by opponent type",
            body: [
              { type:"text", content:"Everything we've covered so far is balanced strategy: it works well against any opponent because it has no obvious leaks. But at low stakes, most players are unbalanced — and that's a huge opportunity. The key is to detect that imbalance and adjust your strategy to exploit it directly." },
              { type:"callout", label:"Calling stations — bet for value, don't bluff", content:"A calling station calls regardless of sizing. Against this profile: eliminate almost all C-bet bluffs (if they never fold, bluffing has no positive EV) and increase the frequency and size of your value bets. With top pair or better, bet bigger — the calling station will call anyway. Don't try to induce or slow-play; bet directly with every strong hand." },
              { type:"callout", label:"Nits — bluff more, with adjusted sizing", content:"A nit folds too much: they're afraid of any connected board and rarely call without a real hand. Against this profile you can increase your C-bet bluff frequency, even on semi-wet boards that wouldn't normally justify betting. A small C-bet (33%) against a nit on a straight-draw board has very high fold equity — the nit assumes you have something and folds their weak pairs and draws. That's direct EV+." },
              { type:"callout", label:"Aggressive players — be more selective, use the check-raise", content:"A player who bets or raises a lot loses their edge if you adopt trapping lines. OOP against an aggro, checking strong hands and letting them bet is more profitable than C-betting. IP with mediocre hands, reducing C-bet bluffs avoids getting floated or raised with air. Against aggressive players the value check-raise is your main weapon." },
              { type:"text", content:"The logic behind these adjustments is simple: if an opponent is unbalanced, they're exploitable. A calling station folds less than they should — exploitation: bet for value more. A nit folds more than they should — exploitation: bluff more. Every exploitative adjustment has positive EV against the opponent's imbalance, as long as that imbalance is real and consistent." },
              { type:"callout", label:"The risk of unbalancing yourself", content:"When you deviate from balance to exploit an opponent, you become exploitable in turn. If you start bluffing a lot against the nit and they notice, they can adjust and start check-raising your C-bets. If you always bet large for value against the calling station and they learn to only call your big bets, you've lost that edge. The golden rule: while the opponent isn't adjusting, exploit. The moment you detect they've noticed, return to balance or change tactics." },
              { type:"text", content:"This is poker's adaptation cycle: balanced strategy → detect opponent imbalance → exploit → opponent adjusts → new equilibrium → new cycle. At low stakes, most opponents don't adjust within a session, which means a correct read of their profile gives you sustained advantage for the entire table time." },
            ],
          },
          {
            title: "When NOT to C-bet",
            body: [
              { type:"text", content:"Always C-betting is just as bad as never C-betting. There are clear situations where checking has more EV than betting." },
              { type:"callout", label:"Multiway pots (3+ players)", content:"In a 3+ player pot, the odds that someone has something change dramatically. While heads-up the villain misses the flop ~65% of the time, in a 3-way pot that drops to ~37% that nobody has anything good. C-bet only with strong hands (top pair good kicker+, powerful draws). Bluffing multiway is almost always a mistake." },
              { type:"callout", label:"Boards that connect with the villain's range", content:"If the villain called your BTN open from BB and the flop is 8♠7♠6♦, that board connects very well with the suited connectors and low pairs in their calling range. Your range advantage shrinks or disappears. Check more, bet only with your best hands." },
              { type:"callout", label:"Calling station villains", content:"Against players who call everything (calling stations), bluffs have no value — the villain won't fold. Eliminate almost all C-bet bluffs and bet only for value. Against a calling station, value C-bet more frequently and with more hands than you normally would." },
              { type:"text", content:"The practical rule: when in doubt, check. The C-bet must have a clear reason — fold equity, clear value, strong draw, obvious range advantage. If you don't have any of these reasons, checking and redirecting the hand on the turn is usually superior." },
            ],
          },
          {
            title: "Exercises: C-bet decisions",
            body: [
              { type:"text", content:"In each situation you are the preflop aggressor. Decide whether to bet and at what size, or check." },
              { type:"quiz", questions: [
                {
                  situation: "BTN vs BB · Heads-up pot · In position",
                  hand: "A♠ K♠",
                  context: "You opened from BTN, BB called. Flop is A♦7♣2♥ (rainbow, dry). BB checks.",
                  question: "What do you do with AKs on the flop A♦7♣2♥?",
                  options: [
                    { label:"C-bet 33% of the pot", correct:true, explanation:"Correct! You have top pair top kicker on a dry board where you have massive range advantage. C-bet 33% extracts value from hands like A2-A9, sevens, and doubles as a bluff when the villain has absolutely nothing. No reason to use a larger size on such a dry board." },
                    { label:"C-bet 75% of the pot", correct:false, explanation:"Size too large for this board. A♦7♣2♥ is a dry board where 33% is the correct size — you capture value from more of the villain's range and don't reveal strength. 75% only makes sense on wet boards or when polarizing." },
                    { label:"Check to induce the villain to bet", correct:false, explanation:"Checking with TPTK on a dry board in position is a mistake. The villain checks to fold on the turn if you check twice, or bets with hands that lose anyway. C-bet 33% extracts more value than slowplaying." },
                  ],
                },
                {
                  situation: "CO vs BTN · Heads-up pot · Out of position",
                  hand: "A♣ 8♦",
                  context: "You opened from CO, BTN called. Flop is J♠T♠9♦ (very wet, three connected cards, flush draw). You act first.",
                  question: "What do you do with A8o on the flop J♠T♠9♦ OOP?",
                  options: [
                    { label:"C-bet 33% of the pot", correct:false, explanation:"A wet board like this with ace-high and no pair or real draw OOP doesn't justify any C-bet. BTN connects very well here with suited connectors and pairs. No equity and no real fold equity — checking is clearly superior." },
                    { label:"C-bet 67% of the pot", correct:false, explanation:"Large C-bet OOP with a missed hand on the most connected board possible is the classic mistake. You'll face heavy pressure from a villain who connects well here. Always check with air on very wet boards OOP." },
                    { label:"Check", correct:true, explanation:"Correct! J♠T♠9♦ is an extremely connected board that strongly favors the caller (BTN has suited connectors, pairs). OOP with A8o — ace-high with no pair or draw — checking is clearly correct. If BTN bets, you then evaluate with the information from their bet." },
                  ],
                },
                {
                  situation: "UTG vs BB · 3-way pot · Out of position",
                  hand: "Q♣ Q♦",
                  context: "You opened from UTG, MP and BB called. 3-way pot. Flop is K♥8♦3♠ (dry). You act first.",
                  question: "What do you do with QQ in a 3-way pot on K♥8♦3♠?",
                  options: [
                    { label:"C-bet 33% of the pot", correct:true, explanation:"Correct! Even in a 3-way OOP pot, QQ on K♥8♦3♠ is still a strong hand worth C-betting. The board is dry and your pair of queens only loses to KX. C-bet 33% extracts value and gathers information: if someone raises, they have KX or better. Not ideal but betting has more EV than checking." },
                    { label:"C-bet 75% of the pot", correct:false, explanation:"Size too large in multiway and dry board. With 75% you overexpose yourself. If someone has KX, they can raise and you'll be in a tough spot with a big investment. Small C-bet or check, never large in multiway." },
                    { label:"Check — 3-way pot is dangerous", correct:false, explanation:"Checking QQ on K83r loses too much value. Villains can have 88, 33, A8, K9 that will happily call a small C-bet. C-bet 33% is superior to checking here." },
                  ],
                },
                {
                  situation: "BTN vs BB · Heads-up pot · In position",
                  hand: "7♥ 6♥",
                  context: "You opened from BTN, BB called. Flop is J♣T♥9♦ (connected, hearts on board). BB checks.",
                  question: "What do you do with 7♥6♥ on J♣T♥9♦?",
                  options: [
                    { label:"C-bet 67% of the pot", correct:false, explanation:"7♥6♥ on J♣T♥9♦ is not the semi-bluff it might appear. You only have 4 outs (the four 8s) for a low straight (6-7-8-9-T), and when the 8 falls, any queen in the villain's hand makes a better straight (Q-J-T-9-8). This is not a strong semi-bluff hand here — C-bet 67% overvalues it." },
                    { label:"C-bet 33% of the pot", correct:false, explanation:"Even with a smaller size the core problem remains: you only have 4 vulnerable outs. When the 8 comes you don't have the nuts and can be losing to QX. On this board, the best play is to check and see the turn." },
                    { label:"Check — reassess on the turn", correct:true, explanation:"Correct! 7♥6♥ on J♣T♥9♦ has only 4 outs (the four 8s) for a low straight that isn't the nuts — any queen beats your straight. It's a weak draw and not blindly bluffable. The right play is to check the flop and reassess: if the turn is a heart, you gain a real backdoor flush draw and can then consider a semi-bluff with more equity." },
                  ],
                },
                {
                  situation: "MP vs calling station · Heads-up pot · In position",
                  hand: "A♦ 9♦",
                  context: "You opened from MP, BB (known calling station who pays almost everything) called. Flop is A♠7♦2♣. BB checks.",
                  question: "With A9s on A♠7♦2♣ vs a calling station, what do you do?",
                  options: [
                    { label:"C-bet 50% of the pot", correct:true, explanation:"Correct! This is the key exploitative adjustment against calling stations: they are inelastic to bet sizing. A normal player folds more when you bet large, but a calling station calls 33% and 50% at roughly the same frequency. If they're going to call anyway, why not charge more? C-bet 50% extracts more value than the standard 33% without reducing how often they pay — as long as they haven't caught on to the adjustment." },
                    { label:"C-bet 33% of the pot", correct:false, explanation:"33% is the balanced sizing for this dry board, but against a calling station you're leaving value on the table. Since they're inelastic to size, you can go to 50% and collect more per hand without them folding more. The exploitative adjustment here is to size up slightly." },
                    { label:"C-bet 75% of the pot", correct:false, explanation:"75% is too much — even calling stations have a limit and may start folding their weakest hands. The optimal exploit isn't maximum, it's the point where you earn more without meaningfully changing how often they pay. 50% is that point." },
                    { label:"Check to induce the villain to bluff", correct:false, explanation:"Don't try to induce calling stations — they rarely bluff. If you check, they'll simply check behind with hands that would have called. Always C-bet for value with a strong hand against this profile." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 4,
        title: "4. Value Betting",
        summary: "When to bet for value, how to build the pot, and the elasticity concept.",
        chapters: [
          {
            title: "Introducing the Value Bet",
            body: [
              { type: "text", content: "Most of the money you make at poker doesn't come from regulars — it comes from fish. And the most common fish leak isn't bluffing too much: it's calling too much. They put money in with marginal hands and can't find the fold button when they should. Your job against these players is not to bluff them, but to extract maximum value when you have the best hand. That's the art of value betting." },
              { type: "callout", label: "Exact definition of a value bet", content: "A value bet isn't simply betting when you think you're ahead. To value bet, you must have over 50% equity against the SUBRANGE that Villain doesn't fold to that bet. The critical distinction: it doesn't matter if you're ahead of their total range — what matters is whether you're ahead when called. Often you're ahead of the full range but behind when called." },
              { type: "text", content: "To decide whether to value bet, The Grinder's Manual introduces a three-question flowchart you must answer in order. This process isn't mechanical — with experience it becomes automatic — but at first it's essential to make it explicit." },
              { type: "callout", label: "The value bet flowchart", content: "Question 1: Do I have sufficient relative hand strength to bet for value? (Am I ahead of the calling range more than 50%?) If NO → Check. If YES → Question 2. Question 2: Do I need to build the pot? If YES → Value bet. If NO → Question 3. Question 3: Does slowplaying make sense here? If NO → Value bet. If YES → Check (slowplay)." },
              { type: "callout", label: "Absolute vs relative hand strength", content: "Absolute hand strength is the objective rank (straight, flush, set...). Relative hand strength is its value in the specific context of that board against that specific opponent. A straight can be the nuts on one board (Q♠J♥T♦9♣2♠) or near a bluff-catcher on another (Q♠J♥T♦9♣8♠ where any K or 8 beats you). Beginners look at absolute strength; winning players always think in relative hand strength." },
              { type: "text", content: "Remember the 'procedural check' concept: when you act first on a street and the aggressor of the previous street hasn't acted yet, you should normally check your whole range before the aggressor acts. In these spots the value bet flowchart doesn't apply — just check." },
            ],
          },
          {
            title: "Question 1 — Relative Hand Strength",
            body: [
              { type: "text", content: "The first flowchart question is the most fundamental: when the opponent calls my bet, do I have the best hand more than 50% of the time? Answering this correctly requires thinking about the opponent's range, not their specific hand." },
              { type: "callout", label: "Clear example: Yes to Q1", content: "Board: K♥J♦T♣2♠. Hero has A♠Q♠ (Ace-high straight). It's the nuts — nothing beats it. Does Hero have sufficient relative strength to bet for value? Overwhelming yes! When the opponent calls, it's still the nuts. Answer: YES to Q1. Move to Q2." },
              { type: "callout", label: "Clear example: No to Q1", content: "Same straight (A♠Q♠ on K♥J♦T♣), but the board is K♥J♦T♦9♦2♦ — four diamonds on board. Now any diamond in the opponent's hand makes a flush. Any Q makes a better straight. Relative strength is terrible. Even though we have a straight in absolute terms, when the opponent calls they very likely have something better. Answer: NO to Q1 → Check." },
              { type: "text", content: "The intermediate case — and the most common — is evaluating overpairs, top pair good kicker, or two pair against fish ranges that include many draws and inferior pairs. The key question: how many hands in the opponent's likely range beat you when they call? If the answer is 'few', you have sufficient relative strength. If 'many', perhaps not." },
              { type: "callout", label: "Opponent type matters enormously", content: "Relative strength depends not just on the board — it depends on the opponent. The same AA on the same flop can be a value bet against a fish with high WTSD (goes to showdown with many weak hands) but should be checked against a solid reg who only continues with very strong hands. Against the fish you're ahead of their calling range. Against the reg on certain boards, maybe not. Opponent stats — WTSD, VPIP, Fold to C-bet — are critical information for answering Q1." },
              { type: "quiz", questions: [
                {
                  situation: "NL25 · BTN vs BB · Flop K♠7♥2♣",
                  hand: "K♦Q♦",
                  context: "Hero opened from BTN, BB (fish with VPIP 55%) called. Flop K♠7♥2♣, BB checks. What relative strength does top pair + good kicker have?",
                  question: "Do you have sufficient relative strength to c-bet for value on this flop?",
                  options: [
                    { label: "Yes — value c-bet", correct: true, explanation: "Correct! KQ has top pair good kicker on a dry board. The fish calls with weak K, 7x, scarce draws... you're ahead of most of their range. Clear value c-bet." },
                    { label: "No — too vulnerable", correct: false, explanation: "On a dry K72 rainbow board, your top pair has very good relative strength vs a fish. The hands that beat you (better kicker, sets) are a minority of their wide range." },
                    { label: "Depends on the size", correct: false, explanation: "Sizing affects the value bet amount, not whether you have relative strength. Here the relative strength is clear — you adjust sizing afterward." },
                    { label: "Check for pot control", correct: false, explanation: "Pot control is valid with medium-strength hands, but KQ on K72r against a fish is a clear value situation. You don't need pot control here — you need to build the pot." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Question 2 — Do You Need to Build the Pot?",
            body: [
              { type: "text", content: "If you've answered YES to Q1, the next question is whether you need to actively grow the pot. The answer is almost always YES in cash games with 100BB effective stacks — pots are small relative to stacks and there's a lot of money to extract." },
              { type: "callout", label: "The Exponential Mistake", content: "Failing to build the pot on the flop has cascading consequences. If the flop pot is 10BB and you don't bet, on the turn it's still 10BB and your reasonable max bet is 7BB. If you had bet 7BB on the flop, the turn would have 24BB and you could bet 16BB. By the river the difference is enormous. This cascade effect is called the 'exponential mistake': failing to build the pot early multiplies the EV loss on all subsequent streets." },
              { type: "callout", label: "WTSD — Went To ShowDown", content: "The WTSD stat (percentage of times a player goes to showdown) is key for understanding when you need to build the pot. A fish with WTSD of 35%+ goes to showdown with many weak hands — you can't count on them to build the pot for you. You must bet every value street. A player with low WTSD and high aggression sometimes builds the pot for you — and in that case you might check to induce them to bet." },
              { type: "text", content: "The situation where Q2 = NO is mainly when the effective stack is small relative to the pot. In 3-bet pots or shorter stack situations, sometimes you don't need to bet the flop because two future bets are enough to get all the money in. In that case you have a 'spare street' — one street you can skip betting without losing value." },
              { type: "callout", label: "Example: building pot vs passive fish with AA", content: "Hero has AA on BTN vs passive fish in BB. Flop: K♥7♦3♣. Hero has an overpair. The fish is stationary (high WTSD, low fold to c-bet). Should you check 'to induce'? Mistake. Passive fish call bets but don't bet when checked to. You need to bet flop, turn and river. Every street you don't bet is permanently lost value. Pot geometry matters: bet 60-70% of the pot each street to arrive at the river with a large pot." },
              { type: "quiz", questions: [
                {
                  situation: "NL25 · CO vs BB · Flop A♦J♣5♥",
                  hand: "A♠K♠",
                  context: "Hero has top pair good kicker. BB is a passive fish with WTSD 38%, fold to c-bet 42%. Preflop pot 5BB.",
                  question: "Should you bet on the flop?",
                  options: [
                    { label: "Yes — value c-bet 60% of pot", correct: true, explanation: "Correct! AK has top pair top kicker. The passive fish calls bets with weak Ax, Jx, draws... You need to build the pot now. With high WTSD he won't build it for you — bet and build every street." },
                    { label: "Check to induce — fish is aggressive", correct: false, explanation: "The fish has WTSD 38% (passive) and fold to c-bet 42% (calls a lot). He's not aggressive — he won't bet if you check. You need to bet to build the pot." },
                    { label: "Check — board is good for BB", correct: false, explanation: "A♦J♣5♥ rainbow isn't especially good for BB. AK has a big range advantage here. Checking in this situation is the classic exponential mistake." },
                    { label: "All-in — maximize value", correct: false, explanation: "All-in on the flop in a 5BB pot wastes the potential of extracting 3 streets. Bet calibrated for 3 streets (flop-turn-river) to get all the chips in." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Question 3 — Slowplay?",
            body: [
              { type: "text", content: "Slowplay (playing a very strong hand passively) is one of the most misunderstood plays in poker. Beginners do it too much — they think being 'tricky' is always better. The Grinder's Manual is clear: slowplay almost always costs money. It's only correct in very specific circumstances." },
              { type: "callout", label: "When does slowplay apply?", content: "Slowplay only makes sense when ALL of these conditions are met: (1) Q1 = YES (you have a very strong hand). (2) Q2 = NO (you don't urgently need to build the pot — either because the effective stack is short or the pot is already large relative to the stack). (3) There's a higher-EV alternative to betting — typically because the opponent will bet if you check (they're aggressive) and will include in their betting range hands they wouldn't have called your bet with." },
              { type: "callout", label: "Slowplay 1: OOP vs very aggressive opponent", content: "Example: Hero OOP with QQ on a Q♦7♣2♥ flop. If the opponent is highly aggressive (high Float Flop), they'll likely bet if Hero checks — with draws, overcards, air. Checking here serves to: (a) get the opponent to put money in with hands they'd have folded to a bet, (b) induce bluffs you can check/raise. Key condition: you need high confidence the opponent will bet — doesn't work if they're passive." },
              { type: "callout", label: "Slowplay 2: short stack + dry board", content: "Example: In a 3-bet pot with 30BB effective and Hero has top set on a dry flop. With 30BB effective in an already large pot, you only need 2 more bets to get all the money in. You have a 'courtesy street' — you can check the flop without losing the ability to go all-in. Plus, if the opponent is active, they may bet the turn and make it easy to get all the money in. Valid slowplay here." },
              { type: "callout", label: "Slowplay 3: 'Crushing the deck'", content: "Example: Hero has QQ on a Q♠Q♥7♦ flop — quads. So few opponents can have a good hand to call that a c-bet will have enormous fold equity. Checking here induces the opponent to bet with air and gives time for them to improve a medium hand on the turn. The risk of giving a free card is minimal when you already have quads." },
              { type: "text", content: "The Grinder's Manual conclusion on slowplay: do it rarely, only with very strong hands, and only when you have solid evidence the opponent will bet if you check OR when stack size already guarantees all-in without needing to bet every street. In all other cases — value bet." },
            ],
          },
          {
            title: "Thick and Thin Value",
            body: [
              { type: "text", content: "So far we've looked at 'thick value' situations — clear cases where your hand is comfortably ahead of the opponent's calling range. But there are more complex situations where value is 'thin' — where your equity when called is real but tight. Finding these thin spots adds significant EV." },
              { type: "callout", label: "Thick value", content: "Thick value: you're comfortably ahead of the calling range — no doubt. E.g.: AA on a 7♦4♣2♠ flop vs a fish. Your overpair absolutely dominates what the fish can call (lower pairs, scarce draws). Bet all three streets without hesitation." },
              { type: "callout", label: "Thin value", content: "Thin value: you have over 50% equity vs the calling range, but not by much. Requires more careful analysis. E.g.: top pair medium kicker on a wet board on the river. Does the opponent call with worse hands? Are there enough hands in their range that are worse and still call? If the answer is yes (even tightly), betting is +EV." },
              { type: "callout", label: "Capped vs uncapped range", content: "A capped range is one that can't contain the strongest possible hands given the actions taken. If the opponent has checked twice (including the turn as a potential aggressor), their range is probably capped — few very strong hands. This enables thin value: if their range can't contain many hands that beat you, your thin value is safer. An uncapped range can contain very strong hands — thin value is riskier." },
              { type: "callout", label: "The three OOP river lines", content: "Out of position on the river you have three options: (1) Bet/fold — make a thin value bet and fold to a raise. Good when the opponent's calling range is weaker than their betting range. Works well against passive fish. (2) Check/call — check to catch bluffs. Good when the opponent will bet with many hands worse than those that would call your bet. (3) Check/fold — resign yourself to not being able to extract value or catch bluffs. Valid when the opponent has a strong betting range and only calls with hands that beat you." },
            ],
          },
          {
            title: "Sizing and Elasticity",
            body: [
              { type: "text", content: "Value bet sizing is as important as the decision to bet. Betting too small against a fish is the silent 'exponential mistake' — losing value that was rightfully yours. Betting too large can 'blow' a player out of the pot who would have called a reasonable size." },
              { type: "callout", label: "Range elasticity", content: "Elasticity describes how a player's calling range changes with different bet sizes. An ELASTIC range contracts a lot with larger sizes: going from 50% to 100% pot bet, many hands that would have called 50% no longer call 100%. An INELASTIC range barely changes: the opponent calls roughly the same whether you bet 50% or 80% of the pot. Fish tend to have inelastic ranges — they like calling and don't adjust much by bet size." },
              { type: "callout", label: "Practical implication: bet big vs fish", content: "If the opponent has an inelastic range (fish with high WTSD), the correct strategy is to bet large to maximize value. The classic beginner objection: 'I don't want to scare them out of the pot.' Response: if their range is inelastic, they don't scare — they call anyway. And even if they fold once from bet X, you'll win much more on all other occasions. Avoid the exponential mistake: don't underbet against fish who call regardless." },
              { type: "callout", label: "Sizing vs Regs: balance is key", content: "Against attentive regulars the strategy changes. Varying size based on hand strength (large for value, small without value) is an exploitable leak. Regs will notice the pattern and adjust. Against regulars, use the same size across your whole range in the same situation (balanced sizing). The exception: when you have a clear read that the reg has an inelastic range in that specific spot." },
              { type: "callout", label: "The exponential mistake: an example", content: "Hand 1 (correct): Hero has AA on BTN, fish in BB. Flop K♦7♣2♥, pot 5BB. Hero bets 4BB → Turn pot 13BB, Hero bets 10BB → River pot 33BB, Hero bets 25BB. Total extracted: ~39BB. Hand 2 (mistake): same situation but Hero checks the flop 'to induce'. Turn pot 5BB, Hero bets 4BB → River pot 13BB, Hero bets 10BB. Total extracted: ~14BB. Difference: 25BB of EV lost in a single hand by not building the pot on the flop." },
              { type: "text", content: "Value betting is, ultimately, the heart of winning poker. Bluffs matter, defense matters, position matters — but the biggest source of profit against fish is simply betting large with your good hands every street and not giving discounts. Master value betting and you'll have the most profitable skill in cash games." },
            ],
          },
          {
            title: "Exercises: Value Betting",
            body: [
              { type: "text", content: "Test what you've learned. In each situation decide whether to value bet, what size, or check. Apply the flowchart: Q1 (relative strength) → Q2 (do I need to build the pot?) → Q3 (slowplay?)." },
              { type: "quiz", questions: [
                {
                  situation: "NL25 · BTN vs BB · River K♦9♣4♠J♥2♦",
                  hand: "K♠J♠",
                  context: "Hero has two pair (kings and jacks) on the river. BB is a calling station (WTSD 40%) who called flop and turn. Pot: 22BB.",
                  question: "What do you do on the river with top two pair vs calling station?",
                  options: [
                    { label: "Large value bet (75% pot)", correct: true, explanation: "Correct! Top two pair against a calling station with WTSD 40% is thick value. Their calling range includes Kx, Jx, nines. Bet big — their range is inelastic and they pay large sizing almost as often as small." },
                    { label: "Check — the river is dangerous", correct: false, explanation: "K♦9♣4♠J♥2♦ is a fairly safe board for two pair. Nothing connected dramatically. Against a calling station you don't check value — you bet." },
                    { label: "Small value bet (33%)", correct: false, explanation: "Against a calling station with WTSD 40% on the river you can go big — their range is inelastic. You're undervaluing the spot with small sizing. Bet 60-75% of the pot." },
                    { label: "Overbet (150%)", correct: false, explanation: "Even though their range is inelastic, an overbet on the river with two pair (not the nuts) is too aggressive. They may fold hands that would pay normal sizing. Go 67-75% of the pot." },
                  ],
                },
                {
                  situation: "NL25 · CO vs BTN · Turn A♠8♦3♣K♥",
                  hand: "A♦K♣",
                  context: "Hero has top two pair (aces and kings) on the turn. BTN is a solid regular (WTSD 24%, VPIP 20%). Pot: 12BB.",
                  question: "Value bet or check on the turn vs regular with two pair?",
                  options: [
                    { label: "Value bet 60% of pot", correct: true, explanation: "Correct! Top two pair is a very strong hand. Against a solid regular you use balanced sizing (same size with your whole range). 60% is reasonable — build the pot with your best hand without leaking info." },
                    { label: "Bet pot (100%) to maximize", correct: false, explanation: "Against regulars (VPIP 20%, WTSD 24%) the range is elastic — pot sizing gives them perfect odds to fold hands that would pay smaller sizes. Use balanced sizing, don't overbet." },
                    { label: "Check to induce bluffs", correct: false, explanation: "With WTSD 24% the regular is solid and won't bluff frequently if you check. Also the A-K-8-3 turn favors your opener's range. Bet to extract value." },
                    { label: "Check — board is very dangerous", correct: false, explanation: "A♠8♦3♣K♥ is not a dangerous board for two pair. It's a high-card board that favors your CO opening range. Clear value bet." },
                  ],
                },
                {
                  situation: "NL25 · BTN vs BB · Flop Q♠Q♦7♣",
                  hand: "Q♥8♠",
                  context: "Hero has trip queens. BB is a very aggressive player (VPIP 55%, WTSD 35%, Float flop 45%: calls flop and bets turn frequently).",
                  question: "With trips on a dry flop vs a very aggressive player, what do you do?",
                  options: [
                    { label: "Check — induce the aggro to bet", correct: true, explanation: "Correct! Valid slowplay: Q1=Yes (trips), Q2=Not urgent (3 streets available), Q3=Yes (the aggro will bet if you check). With Float Flop 45%, they'll bet turn frequently. You check, they bet with air/draws, and you attack on turn or river. Textbook slowplay." },
                    { label: "C-bet 33% of pot", correct: false, explanation: "With trips on a dry Q-Q-7 board, small c-bet is suboptimal. The aggressive opponent has Float Flop 45% — they'll bet if you check. Checking will induce far more value than a small c-bet that probably folds their bluffing range." },
                    { label: "C-bet large (67%)", correct: false, explanation: "Large c-bet with trips vs an aggressive player on a dry board loses value. When you c-bet big, the opponent only continues with hands that call you well. If you check, they'll bet their entire range including air." },
                    { label: "Shove all-in", correct: false, explanation: "All-in on the flop with trips in a small pot overvalues the hand. You don't need protection on Q-Q-7 and rarely get called by worse. Build the pot gradually." },
                  ],
                },
                {
                  situation: "NL25 · BTN vs BB · River 7♠8♦9♣T♥J♠",
                  hand: "6♠5♠",
                  context: "Hero has the 6-high straight (6-7-8-9-T) with 6♠5♠ on a 7-8-9-T-J board. BB is a passive fish who called flop and turn.",
                  question: "Do you have sufficient relative strength to value bet on this river?",
                  options: [
                    { label: "Check — insufficient relative strength", correct: true, explanation: "Correct! Even though Hero has a straight (6-7-8-9-T), it's the LOWEST possible straight on this board. Any opponent with a J in their hand has a better straight (7-8-9-T-J). Any opponent with QJ has a Q-high straight. The fish's range after calling two streets includes many Jx, QJ, and connected hands that make better straights. Relative strength is very low — most hands that pay you beat you. Check/fold." },
                    { label: "Small value bet (33%)", correct: false, explanation: "Even though you have a straight, it's the minimum straight on this board. Any J in the opponent's hand makes a straight that beats yours. With a fish who called two streets on a connected board, their calling range is full of hands that beat you. No relative strength to value bet." },
                    { label: "Large value bet (75%)", correct: false, explanation: "Serious mistake. Your straight is the weakest possible on 7-8-9-T-J. The fish's range after calling flop and turn on such a connected board contains many Jx, QJ, and completed straight draws. Betting big here is value-owning yourself." },
                    { label: "All-in bluff", correct: false, explanation: "Bluffing doesn't work either — the fish who called two streets on a 7-8-9-T-J board has too much realized equity (pairs, straights, completed draws) to fold to an all-in. No real fold equity." },
                  ],
                },
                {
                  situation: "NL25 · BTN vs BB · Turn A♣7♦2♠9♥",
                  hand: "A♠9♣",
                  context: "Hero has two pair (aces and nines). BB is a passive fish (WTSD 38%, fold to c-bet 35%). Flop pot 8BB after c-bet. Now pot is 8BB, Hero acts first on the turn.",
                  question: "What size value bet do you use on the turn with two pair?",
                  options: [
                    { label: "Large bet (70% of pot)", correct: true, explanation: "Correct! Top-bottom two pair (A+9) vs passive fish with WTSD 38% = build the pot aggressively. Their calling range includes Ax, 9x, 7x, draws. The fish has an inelastic range — they pay large sizing almost as often as small. Bet 70% to arrive at the river with a large pot." },
                    { label: "Check — pot control", correct: false, explanation: "Pot control with top two pair vs passive fish is the classic exponential mistake. The fish won't build the pot for you (WTSD 38%, passive). If you don't bet the turn, the river pot will be half what it should be. Bet." },
                    { label: "Small bet (33%)", correct: false, explanation: "Sizing too small. The fish has an inelastic range — they pay large sizing almost as often as small. Underbetting against fish is directly losing EV. Go 65-75% of pot." },
                    { label: "Overbet (130%)", correct: false, explanation: "Overbet with two pair (not the nuts) is risky even vs fish. Even though their range is inelastic, an overbet can fold hands that would pay normal sizing. 65-75% is the optimal point." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 5,
        title: "5. Calling Opens",
        summary: "When and how to call a preflop open: implied odds, set mining, calling IP and OOP.",
        chapters: [
          {
            title: "Why call an open?",
            body: [
              { type:"text", content:"Until now we've talked about opening the pot and betting postflop. But a fundamental part of poker is deciding when to call another player's open rather than raise or fold. Calling is not the passive, weak play many beginners think — with the right logic it's a powerful and profitable tool." },
              { type:"callout", label:"The 4 reasons to call an open", content:"1. Implied odds: you have a speculative hand that can win a huge pot if it connects (small pairs for set mining, suited connectors). 2. Being in good shape vs the opener's range: you have a hand like KQo that connects frequently and is well positioned against what the opponent opens. 3. Weaker players in the pot: there's a fish in the pot that justifies entering even though the hand isn't ideal. 4. Pot odds: the pot/investment ratio makes calling profitable even when the hand isn't very strong (mainly from the BB)." },
              { type:"text", content:"The classic beginner mistake is calling too much — entering the pot with mediocre hands without having a clear reason from these 4. The opposite error, less common but also costly, is folding profitable hands out of fear of being OOP or from miscalculating pot odds. The key is having a specific reason before calling." },
              { type:"callout", label:"The Gap Concept", content:"The Gap Concept states that you need a stronger hand to call an open than to make that open yourself from that position. If you open KJo from CO, that doesn't mean you should call KJo when someone opens from UTG — against a tight UTG range, KJo has many domination problems. The opening range and calling range are different things." },
            ],
          },
          {
            title: "Reason 1 — Implied Odds and Set Mining",
            body: [
              { type:"text", content:"Implied odds are the most important reason to call with small pairs and suited connectors. The logic: even though you're investing a modest amount now, when you connect a very strong hand (set, flush, straight) you can win a much bigger pot. The preflop investment is justified by what you can win postflop." },
              { type:"callout", label:"The set mining rule", content:"With a small/medium pair, you flop a set approximately 1 in 8 times (11.8%). Since you need to win enough to compensate for the 8 times you miss, you need to win approximately 10 times your preflop investment. If you call 3BB preflop, you need to be able to win ~30BB when you hit the set. If effective stacks and opponent type allow this, set mining is profitable. If stacks are short or the opponent won't pay postflop, it isn't." },
              { type:"text", content:"The 7 factors that determine if implied odds are sufficient: (1) Investment size — the smaller, the better. (2) Frequency of big hand — sets come in 1/8 times. (3) Strength of opponent's range — stronger ranges pay more postflop. (4) Stack depth — more chips = more potential value. (5) Opponent's tendency to fold — if they fold a lot postflop, implied odds drop. (6) Multiway potential — more players in the pot = more implied odds. (7) Position — IP extracts more value with strong hands." },
              { type:"callout", label:"Which pairs are minable and which aren't", content:"Pairs 66-88: good set mines in most situations. They have some overpair value when no high cards appear on the flop. Pairs 22-55: pure set mines — if you don't flop the set, the hand is nearly worthless. Need more favorable conditions. Pairs 99-JJ: these are hybrids — they have frequent overpair value, not just set value. JJ can be an overpair on many flops and 99 on low flops. They're not purely set mines." },
              { type:"callout", label:"Suited connectors: different implied odds from pairs", content:"JTs will flop two pair or better only 5.6% of the time (vs 11.8% set frequency for pairs). However, it flops powerful draws (12 outs+) 6.9% and flush draws or OESDs 13.2%. In total, it connects strongly 25% of the time. Suited connectors are less powerful than pairs for pure set mining, but more versatile — they connect in more ways and play better multiway." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · HJ vs UTG open 3BB",
                  hand:"7♥ 7♣",
                  context:"UTG is a solid regular (VPIP 14%, tight range). You're the only player in the pot besides the blinds. Stacks 100BB.",
                  question:"Do you call with 77 vs UTG 3BB open from HJ?",
                  options:[
                    { label:"Yes — profitable set mining", correct:true, explanation:"Correct! 77 has good implied odds vs UTG: the range is strong (pays off sets postflop), stacks are 100BB (you need to win ~30BB when you flop a set, very achievable), you're IP. The rule: 3BB investment × 10 = 30BB target. Profitable." },
                    { label:"No — too much risk OOP", correct:false, explanation:"HJ is IP vs UTG (BTN and blinds act after, but you act after UTG postflop). Also 77 has good implied odds vs a tight UTG range. Correct set mining here." },
                    { label:"3-bet to 9BB", correct:false, explanation:"3-betting with 77 vs UTG is risky — the UTG range is very strong and 77 doesn't have enough equity for value. Calling and looking for the set is the best line." },
                    { label:"Fold — UTG range too strong", correct:false, explanation:"Precisely because the UTG range is strong, implied odds are good — the opponent has hands they'll pay off with postflop. 77 has just enough implied odds to call here." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Reason 2 — Being in good shape vs opener's range",
            body: [
              { type:"text", content:"Not all hands we call depend on implied odds. Broadway-type hands (KQo, AJo, QJs) have what's called Good Pair Potential — they flop top pair frequently and when they do, they're usually well positioned against the opponent's range. These hands have good Frequent Strength." },
              { type:"callout", label:"Frequent Strength: when broadways shine", content:"Vs wider opening ranges (CO, BTN), hands like KQo, AJo or QJs flop top pair frequently with a good kicker, which gives them an edge against many of the opponent's hands. The wider the opener's range, the more hands like these beat the range when connecting with the flop. Vs tight ranges (UTG), these hands suffer more from domination (AJo loses to AK, AQ) and are less attractive as calls." },
              { type:"callout", label:"Domination problem in tight ranges", content:"AJo looks like a strong hand, but vs a UTG opener whose range frequently includes AK, AQ, AJo is dominated: if you flop the J and the opponent has AJ+, you lose big. If you flop the A, the opponent may have AK/AQ and crushes you. That's why AJo is a comfortable call vs CO/BTN but problematic vs UTG where there are more hands that dominate it." },
              { type:"text", content:"Practical rule: frequent value hands (KQ, AJ, QJ) go up in value as the opponent's open comes from later positions. Vs BTN and CO, they flop top pair that dominates many of the opener's hands. Vs UTG and MP, domination risk goes up and these hands are worth less." },
            ],
          },
          {
            title: "Reason 3 — Weaker players in the pot",
            body: [
              { type:"text", content:"The presence of a fish in the pot can turn a call you normally wouldn't make into a clearly profitable one. A fish changes the equation completely: their postflop mistakes (calling too much, not folding, betting irrationally) increase the implied odds of any speculative hand." },
              { type:"callout", label:"How the fish changes the equation", content:"Example: 87s is normally a fold vs UTG open from HJ with no incentive. But if both blinds are fish who almost never fold preflop and play very passively postflop: (a) the pot will frequently be multiway, (b) the fish will pay your weak top pairs when you connect, (c) they'll pay draws even when they have no more equity. The fish turns marginal speculative hands into clearly profitable calls." },
              { type:"callout", label:"Factors that reduce the fish's value in the pot", content:"(1) If the fish has a short stack, implied odds drop even with them in the pot. (2) If the fish is in position to you (acts after you postflop), it's harder to extract value. (3) If there's an aggressive squeezer in the pot who might 3-bet, the fish doesn't help because you'll have to fold before the flop anyway. Always evaluate whether you'll be able to reach the flop to exploit the fish." },
              { type:"text", content:"Practical conclusion: when there's a fish in the pot, especially sitting OOP with a deep stack, the threshold of hands with which it's profitable to enter drops significantly. Hands like 87s, 65s, small pairs that you'd normally fold become clear calls when the fish is present and conditions are favorable." },
            ],
          },
          {
            title: "Reason 4 — Pot Odds: calling from the BB",
            body: [
              { type:"text", content:"From the BB you have a unique advantage: you've already invested 1BB obligatorily, which significantly improves your pot odds to call opens. Your cost to see the flop is lower than from any other position, which makes calls that would be -EV in position become +EV from the BB." },
              { type:"callout", label:"Pot odds calculation in the BB", content:"If UTG opens to 3BB and everyone folds to the BB: pot = 3BB (open) + 0.5BB (SB) + 1BB (your BB) = 4.5BB already in the pot. Your cost to call: 2BB (3BB open minus your 1BB already invested). Pot odds: 4.5:2 = 2.25:1. Vs the same open from CO (no BB invested): pot = 4.5BB, cost = 3BB, pot odds = 4.5:3 = 1.5:1. The BB has better odds and can call more hands." },
              { type:"callout", label:"Break-even equity and BB calls", content:"Required equity (RE) is the minimum times you need to win for calling to be +EV. With pot odds 2.25:1 from BB, RE = 2/(2+4.5) = 30.8%. This means you only need to win the pot 31% of the time to break even. Hands like K4s have 44% equity vs BTN range of 45% — clearly profitable to call even though you're not the opener." },
              { type:"callout", label:"BB defense ranges vs different sizes", content:"The principle is simple: the smaller the open, the more hands are profitable to call. Vs 3x BTN open: call broadway hands (KQo, AJo), medium pairs, mid-high suited connectors. Vs 2.5x BTN: add KTo, Q9s. Vs 2x BTN (min-raise): you can call almost any playable hand because pot odds are excellent. The BB should never fold too much." },
              { type:"text", content:"A very common mistake at low stakes is to play from the BB with a 3-bet or fold strategy — always 3-betting or folding, never calling. This approach misses all the profitable calls that exist with medium hands. The BB is the position where the most money is structurally lost, but calling correctly minimizes those losses significantly." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BB vs BTN open 2.5BB",
                  hand:"K♠ 4♠",
                  context:"BTN is an active regular (BTN RFI 45%). Everyone folded to BTN. SB also folds. You're in BB.",
                  question:"Do you call K4s from BB vs BTN 2.5BB open?",
                  options:[
                    { label:"Yes — pot odds + sufficient equity", correct:true, explanation:"Correct! Pot odds from BB: pot 4BB (2.5+1+0.5), your cost 1.5BB → odds 2.67:1. K4s has ~44% equity vs BTN 45% range. Flops a king 17% of the time with K-high. With these excellent pot odds and BTN having a very wide range, calling is clearly +EV." },
                    { label:"No — K4s is too weak", correct:false, explanation:"K4s is a perfectly valid call from BB vs 2.5x BTN. Pot odds compensate for the hand's weakness. With BTN's wide range, your K4s is in good shape often enough." },
                    { label:"3-bet to 7.5BB", correct:false, explanation:"3-betting with K4s from BB vs BTN can be valid as a bluff in some strategies, but calling has very good EV and is the simplest, most solid line here." },
                    { label:"Fold — you're OOP the whole hand", correct:false, explanation:"Being OOP is a disadvantage, but BB pot odds are so good they compensate. With pot odds 2.67:1 you only need to win 27% of the time to break even — K4s clearly exceeds that threshold vs BTN's 45% range." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Calling opens in position (IP)",
            body: [
              { type:"text", content:"When you call in position (IP), you have the advantage of acting last postflop, but also the risk of someone 3-betting from behind. Your position matters a lot: the closer you are to the BTN, the fewer players behind to 3-bet and the stronger your postflop position." },
              { type:"callout", label:"General rules for calling IP", content:"(1) The closer to the BTN, the better — fewer squeezers and stronger postflop position. (2) Vs tight ranges (UTG/MP), implied odds hands go up in value (sets). Vs wide ranges (CO/BTN), top pair hands go up in value (KQo, AJo). (3) Smaller opens are easier to call — your investment is lower and pot odds are better. (4) Small pairs 22-55 vs opens in position are very context-dependent: if there are active squeezers, their value drops enormously because you never reach the flop." },
              { type:"callout", label:"Calling vs UTG open IP (HJ/CO/BTN)", content:"Vs UTG (~14% range): call 66+ for set mining, high suited connectors (JTs, QJs, T9s) as hybrids and premium broadways (AQs, AJs, KQs). Vs HJ (~20% range): add medium pairs 55+, more suited connectors and broadways like AJo, KQo, QJs. Vs CO/BTN (25-40% ranges): the opponent's range is so wide that hands like KTo, A9s, QTo become reasonable calls from BTN." },
              { type:"callout", label:"The most complex scenario: CO vs BTN", content:"CO vs BTN is the duel between the two most aggressive positions. BTN opens very wide (40%+), meaning many broadway hands beat their range. CO can call more frequent top pair hands (KJo, QJo) and medium suited connectors. Small pairs 22-55 are no longer good calls here: BTN won't have premium hands to pay off sets, and squeezers in the blinds are more likely with late position opens." },
              { type:"text", content:"The key when building your IP calling range is clarity about what type of hand you're playing: implied odds or frequent strength. The former needs opponents with tight ranges and good stacks. The latter works better against wide ranges where you connect well. Mixing both categories without thinking about which conditions each is good in is the most common mistake." },
            ],
          },
          {
            title: "Calling from the BB — correct defense",
            body: [
              { type:"text", content:"The BB is the position where you lose the most money long-term, but not because it's impossible to play well — it's because you've already invested 1BB with any hand before knowing your cards. Your goal in the BB is not to profit from that position, but to minimize losses by calling the right hands and folding the wrong ones." },
              { type:"callout", label:"BB vs UTG-CO opens (3BB)", content:"Call: pairs 66+, mid-high suited connectors (T9s, JTs, QJs), broadways like KQo, AJo, QJo, and suited aces (A9s+). Fold: pairs 22-55 (set mining OOP without sufficient implied odds), low suited connectors (54s, 65s), weak offsuit hands (K7o, Q8o). The criterion: does the hand have enough implied odds or frequent strength to compensate for playing OOP?" },
              { type:"callout", label:"BB vs BTN open — depends on size", content:"Vs 3x BTN: call broadways, pairs 66+, medium+ suited connectors. Vs 2.5x BTN: add KTo, Q9s, A8s, more suited one-gappers. Vs 2x BTN (min-raise): almost all playable hands are calls because pot odds are excellent. Even hands like J8s, K5s, Q6s become reasonable calls. The principle: the smaller the open, the more hands are profitable to call from BB." },
              { type:"callout", label:"Most common BB mistake: playing only 3-bet or fold", content:"Many low-stakes players play 3-bet or fold from BB, thinking it's 'more GTO'. Mistake: they miss all profitable calls with medium hands. Calling KTo vs BTN 2.5x is clearly +EV with good pot odds. Calling 66 vs CO 3x is +EV with implied odds. Folding these hands because you don't want to 'complicate things' is directly losing EV." },
            ],
          },
          {
            title: "Calling from the SB — when and how",
            body: [
              { type:"text", content:"The SB is the hardest position to call opens from. You have two disadvantages that combine brutally: (1) worse pot odds than the BB because you only have half a BB invested, and (2) you don't close the action — the BB can 3-bet and if they do, you have to fold losing your call. Generally the most solid strategy from the SB is 3-bet or fold." },
              { type:"callout", label:"When you CAN have a calling range from SB", content:"1. Vs UTG/HJ opens: the range is tight (less likely to be squeezed), and implied odds are good. Call: JJ, QQ, AQs+, KQs and little else. 2. Vs CO/BTN opens when the BB is a fish: the fish in the pot changes the equation — call more speculative hands to exploit the fish. 3. Vs CO/BTN opens when the BB is a nit or passive player who never squeezes: you know you'll see the flop, so you can call more hands." },
              { type:"callout", label:"Why the squeeze ruins SB calls", content:"If you call from SB and the BB squeezes, you have to fold almost always with your capped wide calling range. That means half your calls are lost before the flop. If you calculate that you're calling 2.5BB with 87s and then fold 30% of the time to the BB's squeeze, your real EV collapses. That's why in the SB, if the BB is an unknown or aggressive player, the strategy is 3-bet or fold." },
              { type:"text", content:"Practical rule: in the SB, before calling any open, ask what the BB will do. If they're a passive, tight or unknown player → you can call some selective hands. If they're an active, aggressive or unknown player → 3-bet or fold. Calling from SB is only profitable when you can reasonably expect to see the flop without the BB knocking you out of the pot." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · SB vs BTN open 2.5BB",
                  hand:"Q♣ J♣",
                  context:"BTN is an active regular. BB is a player who just sat down — unknown. Stacks 100BB.",
                  question:"Do you call QJs from SB vs BTN 2.5BB with unknown BB?",
                  options:[
                    { label:"No — 3-bet or fold with unknown BB", correct:true, explanation:"Correct! With an unknown BB, you can't assume they won't squeeze. If they squeeze 15% of the time and you have to fold, your call with QJs becomes -EV. The correct strategy is 3-bet (if you want to play QJs) or fold to avoid the squeeze risk." },
                    { label:"Yes — QJs has good implied odds", correct:false, explanation:"QJs has implied odds, but the squeeze risk with an unknown BB is real and destroys call EV. With an unknown BB from SB, the correct strategy is 3-bet or fold." },
                    { label:"Yes — pot odds are sufficient", correct:false, explanation:"Pot odds in SB (2.5BB open, you have 0.5BB) are worse than in BB. Plus with an unknown BB, squeeze risk is high. Not a situation to call just for pot odds." },
                    { label:"Fold — QJs isn't worth it vs BTN", correct:false, explanation:"QJs is a perfectly playable hand, but the correct action isn't necessarily to call. With an unknown BB from SB, 3-bet or fold is the strategy. If you want to play QJs, the option is to 3-bet." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Exercises: Calling Opens",
            body: [
              { type:"text", content:"Test what you've learned. In each situation, decide whether to call the open or fold, and with what logic." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · CO vs UTG open 3BB",
                  hand:"5♠ 5♦",
                  context:"UTG is a solid regular (VPIP 14%). BTN and blinds are standard regulars. Stacks 100BB.",
                  question:"Do you call 55 from CO vs UTG 3BB open?",
                  options:[
                    { label:"No — 55 vs UTG without fish is a fold", correct:true, explanation:"Correct! 55 needs to win 30BB when flopping a set (3BB investment × 10). Vs tight UTG range, the regular will pay postflop, but without fish in the pot and with BTN behind (potential squeeze), implied odds aren't sufficient for 22-55. Fold 55, call 66+ in this situation." },
                    { label:"Yes — set mining always profitable with 100BB", correct:false, explanation:"Set mining isn't automatically profitable. 22-55 are pure set mines that need favorable conditions. Vs UTG without fish and with potential squeezers, implied odds don't justify the risk." },
                    { label:"Yes — you're in position", correct:false, explanation:"Position helps but isn't enough to justify set mining with 22-55 vs tight UTG without fish. Implied odds for such small pairs don't reach the necessary threshold in this situation." },
                    { label:"3-bet to 9BB", correct:false, explanation:"3-betting with 55 vs solid UTG is a serious mistake — the UTG range dominates you and 55 has neither the value equity nor the ideal 3-bet bluff characteristics." },
                  ],
                },
                {
                  situation:"NL25 · BTN vs CO open 2.5BB",
                  hand:"K♥ Q♣",
                  context:"CO is an active regular (VPIP 28%, CO RFI 27%). SB and BB are standard regulars. Stacks 100BB.",
                  question:"Do you call KQo from BTN vs CO 2.5BB open?",
                  options:[
                    { label:"Yes — KQo has frequent strength vs CO range", correct:true, explanation:"Correct! KQo flops top pair with a good kicker frequently against CO's 27% range, and those hands are in good shape. You're on the BTN (perfect position), small investment (2.5BB), no real squeezers behind. KQo is a clear call IP vs CO." },
                    { label:"No — KQo can be dominated", correct:false, explanation:"KQo can be dominated vs UTG (AK, AQ are in that range), but vs CO with 27% range, there's much less domination and many more hands that KQo beats when connecting. Correct call IP vs CO." },
                    { label:"3-bet to 7.5BB", correct:true, explanation:"Also correct — 3-betting with KQo vs CO from BTN is perfectly valid as a value/semi-value 3-bet. Both calling and 3-betting are reasonable lines with KQo from BTN." },
                    { label:"Fold — domination risk", correct:false, explanation:"With CO range of 27%, domination of KQo is minimal. The opponent has many hands that KQo beats when connecting on the flop. Folding KQo on the BTN vs CO would be overly passive." },
                  ],
                },
                {
                  situation:"NL25 · BB vs BTN open 2BB (min-raise)",
                  hand:"J♦ 8♦",
                  context:"BTN is active regular (BTN RFI 45%). SB has folded. Stacks 100BB.",
                  question:"Do you call J8s from BB vs BTN min-raise?",
                  options:[
                    { label:"Yes — excellent pot odds vs min-raise", correct:true, explanation:"Correct! Pot 3.5BB (2BB open + 0.5BB SB + 1BB your BB), your cost 1BB. Pot odds 3.5:1. You only need to win 1 in 4.5 times = 22%. J8s has implied odds, flush/straight potential, and BTN's 45% range is very wide. Calling is clearly +EV with these pot odds." },
                    { label:"No — J8s is too weak OOP", correct:false, explanation:"Vs a min-raise, pot odds are so good they compensate for playing OOP. J8s has enough potential (draws, occasional top pair) for calling to be +EV. Don't fold playable hands vs min-raise from BB." },
                    { label:"3-bet to 6BB", correct:false, explanation:"3-betting with J8s vs BTN min-raise can be valid as a bluff in some strategies, but calling is the most solid and simple line here. Pot odds are so good that calling maximizes EV with J8s." },
                    { label:"Fold — you're OOP the whole hand", correct:false, explanation:"Being OOP is a disadvantage, but with pot odds 3.5:1 you only need to win 22% of the time to break even. J8s vs BTN's 45% range clearly exceeds that threshold. Folding here directly loses EV." },
                  ],
                },
              ]},
            ],
          },
        ],
      },
      {
        id: 7,
        title: "7. Facing Bets — End of Action Spots (Advanced)",
        summary: "Overbets, double barrels, all-ins and advanced calibration of the call vs fold decision in the most complex spots.",
        chapters: [
          {
            title: "Overbets: when the opponent bets more than the pot",
            body: [
              { type:"text", content:"An overbet is any bet that exceeds 100% of the pot. When an opponent bets 1.5x, 2x or more, it radically changes the spot's dynamics. Overbets have two main uses: (1) maximizing value with very strong hands (nuts or near-nuts) where the opponent can have many hands that pay, and (2) bluffing with high fold equity by using aggressive sizing to force folds from ranges that can't afford the high RE." },
              { type:"callout", label:"Overbet RE: critical numbers", content:"Overbet 1.25x pot → RE ≈ 38%. Overbet 1.5x pot → RE ≈ 43%. Overbet 2x pot → RE ≈ 50%. Overbet 3x pot → RE ≈ 60%. With 2x pot you need to win exactly 50% of the time to break even. This makes overbets binary decisions: either you have enough equity or you have none." },
              { type:"callout", label:"What range overbets for value?", content:"An opponent who overbets for value on the river has a range polarized toward the top: nuts or near. Completed sets, flushes, straights on boards where they're the nuts. The value overbet implies concentration in the strongest hands — it rarely includes medium value hands that are better bet with smaller sizing for more calls." },
              { type:"callout", label:"How to respond to river overbets", content:"Step 1: calculate the RE (with 1.5x pot you need 43%). Step 2: can your hand beat the opponent's value range? If it's impossible to beat their value range, fold directly. Step 3: in NL10-NL25 the population overuses overbets for value and underuses them as bluffs — default bias toward fold vs overbets from unknown opponents. Step 4: vs Aggro Regs with CBet River >50%, the bias partially reverses." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BTN vs BB · River A♦K♣8♠3♥J♠",
                  hand:"Q♦ Q♥",
                  context:"Hero opens BTN to 2.5BB. BB (regular, VPIP 26%, PFR 19%, CBet River 28%) calls. Pot: 5.5BB. Flop A♦K♣8♠: BB checks. Hero bets 3.5BB. BB calls. Pot: 12.5BB. Turn 3♥: BB checks. Hero checks. River J♠: BB bets 25BB (2x pot overbet).",
                  question:"Do you call with QQ facing the BB's river overbet?",
                  options:[
                    { label:"No — high RE and crushing value range", correct:true, explanation:"Correct! RE = 25/(25+37.5) ≈ 40%. QQ on A-K-8-3-J doesn't beat any board pair. BB called the flop with an A on board, checked the turn, and now overbets the river. Their value range includes AX+, KX, JX, sets. QQ beats almost nothing. P4: conservative regular (CBet River 28%) has a betting range heavily skewed toward value when betting big. Fold." },
                    { label:"Yes — QQ has showdown value", correct:false, explanation:"QQ has SDV on low boards, but on A-K-8-3-J the overpair is worth very little. The BB's overbet range is concentrated in Ax+, sets, two pairs, straights. You can't win at showdown if the value range completely crushes you. Fold." },
                    { label:"Yes — overbet means bluff", correct:false, explanation:"Overbets don't always mean bluffs. With CBet River 28% this player rarely bets in general — when they bet 2x pot they lean strongly toward value. QQ on this board is far below the value range. Fold." },
                    { label:"Depends on exact sizing", correct:false, explanation:"RE = 40% with this overbet. Even with mathematical pot odds, QQ on A-K-8-3-J doesn't have 40% equity against this conservative regular's overbet range. Pot odds only help if you reach the RE. Fold." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Double barrel: facing bets on the turn",
            body: [
              { type:"text", content:"A double barrel occurs when the preflop aggressor bets both the flop and the turn. Facing a double barrel isn't always an end-of-action spot — the river remains — but the turn call must consider what happens next. The decision doesn't exist in a vacuum: on the turn you're also deciding how the hand reaches the river." },
              { type:"callout", label:"Stack-to-pot ratio (SPR) after calling the turn", content:"Before calling the turn, calculate remaining SPR: SPR = remaining stack / pot after calling. If SPR ≤ 1, you're virtually committed to river all-in in most spots. This turns the turn call into 'pay to reach river all-in'. If you don't want to go all-in with your hand on the river, that's extra reason to fold on the turn." },
              { type:"callout", label:"When to call the turn double barrel", content:"Call when: (1) you have a strong draw (FD + pair, OESD + overcards, combo draw 12+ outs); (2) you have a bluff catcher with SDV and the opponent has a wide range including lots of air; (3) you have a value hand (set, two pair, straight) that can extract value on the river; (4) the opponent has high CBet Turn but a wide range including lots of air." },
              { type:"callout", label:"When to fold the turn double barrel", content:"Fold when: (1) you only have SDV without draws and the opponent has a polarized value range; (2) the turn card completed flushes/straights that favor the opponent's range; (3) the opponent rarely bluffs the turn — their double barrels are heavily value-weighted; (4) resulting SPR commits you to an all-in where you don't have enough equity." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BB vs BTN · Turn A♣7♦2♥K♠",
                  hand:"7♣ 7♦",
                  context:"BTN (reg, VPIP 28%, PFR 22%, CBet Turn 55%) opens 2.5BB. Hero BB calls. Pot: 5.5BB. Flop A♣7♦2♥: Hero checks. BTN bets 3.5BB. Hero calls. Pot: 12.5BB. Turn K♠: Hero checks. BTN bets 9BB.",
                  question:"Do you call with your set of sevens facing BTN's double barrel on the turn?",
                  options:[
                    { label:"Yes — set of 7s, extract massive value on the river", correct:true, explanation:"Correct! Set of 7s on A-7-2-K is very strong. RE = 9/(9+21.5) ≈ 30%. P1: can he value bet worse? AK (two pair), AX, KX — yes, many hands that lose to the set. You're not just paying to see the river — you're paying with a hand that extracts massive value on the river. Call without hesitation." },
                    { label:"No — he could have AA or AK that dominate me", correct:false, explanation:"AK is two pair — it loses to your set of 7s. AA would be a set of aces beating your set, but those are few combos. Set of 7s is clearly the right hand to call the turn with. Think about extracting value on the river." },
                    { label:"No — the K turn worsens my relative position", correct:false, explanation:"The K turn gives the opponent more value hands that will pay you (AK), which is good for you. Your set of 7s is still very strong. Call the turn." },
                    { label:"I'll wait to see the river before deciding", correct:false, explanation:"The opponent already bet the turn. Your options are call or fold now. With set of 7s on A-7-2-K, you call." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "All-in on the flop or turn",
            body: [
              { type:"text", content:"All-ins on the flop or turn are end-of-action spots: no more streets remain. The process is the same as on the river: RE first, real equity second. The difference is that equity includes all future cards — calculated as '% of times you win at showdown on the river given the opponent's range', accounting for potential improvements by both hands." },
              { type:"callout", label:"Flop all-in equity references", content:"Sets vs two pair: ~65-70% equity — always call. Sets vs overpairs: ~80% equity — always call. Flush draw + pair vs set: ~42-45% — borderline (need ~47%). Combo draw (FD + OESD) vs top pair: ~55% — call. Pure OESD vs top pair: ~35% — don't call. Overpair vs flush draw: ~60% — call. RE on flop all-ins with 100BB effective stacks is approximately 47-50%." },
              { type:"callout", label:"Critical reads for flop/turn all-ins", content:"Aggressive fish going all-in on flop: VERY wide range — top pair, pairs, draws, premium hands. Your equity improves enormously vs this range. Regular going all-in on flop: tighter range — sets, two pairs, strong overpairs. Your equity drops. Regular going all-in on turn: even tighter — almost always very strong value. The opponent type completely defines whether you have enough equity or not." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · BTN vs BB · Flop 8♣7♦2♥ · All-in",
                  hand:"9♣ 8♦",
                  context:"Hero opens BTN to 2.5BB. BB (recreational fish, VPIP 62%, PFR 8%) calls. Pot: 5.5BB. Flop 8♣7♦2♥: BB bets 5BB (pot). Hero raises to 14BB. BB goes all-in for 97.5BB total. Effective stacks 100BB.",
                  question:"Do you call the fish's all-in on the flop with top pair + gutshot?",
                  options:[
                    { label:"Yes — enough equity vs fish's wide range", correct:true, explanation:"Correct! RE ≈ 42%. Fish VPIP 62% going all-in on the flop has a WIDE range: 8X (top pair), 77, 22, draws like 65s, J9, any pair... You have top pair + gutshot straight draw. Vs the fish's wide range your equity is ~45-48%. You exceed the 42% required. Call." },
                    { label:"No — he could have 77 or 22 (set)", correct:false, explanation:"Although he can have sets, the VPIP 62% fish also puts money in with 8X, 7X, badly evaluated draws. Vs his TOTAL range your equity exceeds the 42% required. Sets are only a fraction of the fish's wide range. Call." },
                    { label:"No — I only have top pair with gutshot", correct:false, explanation:"Against a regular this would be a fold. Against a FISH with VPIP 62% going all-in on the flop, their range is so wide that top pair + gutshot has more than enough equity. The opponent type changes everything." },
                    { label:"Fold — flop is too connected", correct:false, explanation:"8-7-2 is semi-connected but not extremely so. The VPIP 62% fish going all-in here has a range full of weak hands. Your equity exceeds the 42% required. Call." },
                  ],
                },
              ]},
            ],
          },
          {
            title: "Population tendencies: NL10-NL25",
            body: [
              { type:"text", content:"Population reads are the last resort when you have no specific information. In NL10-NL25 there are clear statistical patterns that guide your end-of-action decisions against unknown opponents." },
              { type:"callout", label:"What the NL10-NL25 population does on the river", content:"Proven tendencies: (1) Most players do NOT bluff the river with sufficient frequency. (2) When the population bets all 3 streets, they almost always have strong value. (3) Overbets from unknown opponents have more value than bluffs on average. (4) Solid regs rarely bluff with large sizings on the river after 3-street betting. (5) Passive fish almost never bluff the river." },
              { type:"callout", label:"The default fold rule in NL10-NL25", content:"In end-of-action spots vs unknown opponents: if you have no specific information suggesting the opponent bluffs frequently (high CBet River, high WWSF), the default bias is toward folding with non-near-nuts hands. The population simply doesn't bluff enough to consistently justify light calls." },
              { type:"callout", label:"When to deviate from the default fold?", content:"The bias reverses (toward call) when: (1) CBet River >50% or WWSF >55%; (2) the opponent's line is inconsistent with value (check-check-overbet; multiple checks + river bet); (3) you have a good bluff catcher and the board favors missed draws on the river; (4) the opponent showed a bluff recently at showdown; (5) they're a known Aggro Fish who bets with anything." },
            ],
          },
          {
            title: "Thin calls: the art of paying with just enough",
            body: [
              { type:"text", content:"A thin call is when you call a bet with a hand that barely meets the required equity. In NL10-NL25 they're the exception, not the rule. However, identifying when you have enough equity for the thin call separates advanced players from intermediate ones." },
              { type:"callout", label:"Three conditions for a thin call", content:"(1) Sufficient SDV — your hand wins at showdown against at least 30-35% of the opponent's betting range. (2) The opponent can have bluffs — without bluffs in their range, no thin call is possible. (3) The RE is achievable — the bet isn't so large that you need 50%+ equity with a mediocre hand. Thin calls with RE of 25-33% are more justifiable than with RE of 40%+." },
              { type:"callout", label:"Common mistakes in thin calls", content:"Mistake 1: Calling 'because you're the nominal favorite' — having top pair doesn't make you a favorite if the opponent never bluffs. Mistake 2: Confusing SDV with equity vs range — your hand may win many showdowns but if the opponent only bets with strong value, you don't have the 33% required vs their betting range. Mistake 3: Ignoring sizing — a thin call with 25% RE may be valid, the same call with 45% RE rarely is." },
              { type:"text", content:"The key to thin calls: in NL10-NL25 a fold bias is more profitable than a call bias in thin spots. 'Incorrect call' mistakes are more expensive than 'incorrect fold' mistakes when the population doesn't bluff enough to consistently justify light calls." },
            ],
          },
          {
            title: "Exercises: End of Action Spots (Advanced)",
            body: [
              { type:"text", content:"Apply the full process: (1) RE, (2) can he value worse?, (3) can he have air?, (4) is the line consistent with value?, (5) player read." },
              { type:"quiz", questions:[
                {
                  situation:"NL25 · CO vs BB · River K♥Q♦J♠T♣7♠",
                  hand:"A♦ Q♠",
                  context:"Hero opens CO to 2.5BB. BB (solid regular, VPIP 24%, PFR 18%, CBet River 30%, WWSF 48%) calls. Pot: 5.5BB. Flop K♥Q♦J♠: BB checks. Hero bets 3.5BB. BB calls. Pot: 12.5BB. Turn T♣: BB checks. Hero checks. River 7♠: BB bets 10BB into pot of 12.5BB.",
                  question:"Do you call with AQ (two pair A+Q) on this river?",
                  options:[
                    { label:"No — board full of straights, BB's range is dangerous", correct:true, explanation:"Correct! On K-Q-J-T-7, KJ, QT, AT, AK, AJ make straight. Many hands in BB's range now have a straight or better two pair. RE = 10/(10+22.5) ≈ 31%. P1: can he value worse? Few hands in his betting range lose to AQ here. P2: bluffs? Few — on K-Q-J-T almost no draws miss. Solid regular (CBet River 30%, WWSF 48%) betting the river here almost always has value. Fold." },
                    { label:"Yes — AQ has strong two pair", correct:false, explanation:"Two pair on K-Q-J-T-7 is worth little. The BB's range that called flop (K on board, possible T, J, Q) includes many hands now with a straight or better. Solid regular betting here almost always has value that beats you. Fold." },
                    { label:"Yes — 31% RE justifies the call", correct:false, explanation:"Low RE only matters if you have that 31% equity vs the betting range. On K-Q-J-T-7 AQ doesn't have that equity against a solid regular. Pot odds are irrelevant without the necessary equity. Fold." },
                    { label:"Yes — he might be bluffing with missed draws", correct:false, explanation:"On K-Q-J-T-7 almost no draws miss. The board completes everything. Solid regular (WWSF 48%) betting here almost always has value. Fold." },
                  ],
                },
                {
                  situation:"NL25 · BTN vs BB · River 8♦5♣2♥4♠A♣",
                  hand:"8♥ 8♣",
                  context:"Hero opens BTN to 2.5BB. BB (aggro reg, VPIP 32%, PFR 26%, CBet River 52%, WWSF 58%) calls. Pot: 5.5BB. Flop 8♦5♣2♥: BB checks. Hero bets 3.5BB. BB calls. Pot: 12.5BB. Turn 4♠: BB checks. Hero bets 8BB. BB calls. Pot: 28.5BB. River A♣: BB bets 28.5BB (pot).",
                  question:"Do you call with set of 8s facing the aggro reg's pot-bet on the river?",
                  options:[
                    { label:"Yes — set with enough equity, aggressive opponent with many bluffs", correct:true, explanation:"Correct! RE = 28.5/(28.5+57) ≈ 33%. The A♣ river is a perfect bluff card — BB can arrive with 6-7 (straight), 9-7, 3-6, missed flush draws, overcards. P2: Aggro Reg CBet River 52% DEFINITELY can bluff here. P3: check-call-call-pot-river is a frequent bluffing line for this type of player. P4: WWSF 58% — this opponent bets with lots of air. Call the set." },
                    { label:"No — he might have A8, AA, 55, 22, 44", correct:false, explanation:"A8 required calling all the way from preflop. AA/55/22/44 are few combos. The Aggro Reg with CBet River 52% has far more bluffs than sets in their pot-bet range. The set calls." },
                    { label:"No — pot-bet always means value", correct:false, explanation:"Pot-bet does NOT always mean value. Aggressive players use pot-bet as a bluff because it forces folds from 33% of the opponent's range. This aggro reg (WWSF 58%) is exactly the type who uses pot-bets as bluffs on the river. Call." },
                    { label:"Fold — the A river worsens my relative hand", correct:false, explanation:"The river A is actually a bluff card for the BB, not necessarily a card that improves their value. Your set of 8s is still a very strong hand vs the aggro reg's bluffing range. Call." },
                  ],
                },
                {
                  situation:"NL25 · SB vs BB · River J♦T♠9♥2♣6♦",
                  hand:"J♣ 9♦",
                  context:"Hero opens SB to 3BB. BB (passive fish, VPIP 54%, PFR 6%, CBet River 15%, WTSD 44%) calls. Pot: 6.5BB. Flop J♦T♠9♥: BB checks. Hero bets 4BB. BB calls. Pot: 14.5BB. Turn 2♣: BB checks. Hero bets 9BB. BB calls. Pot: 32.5BB. River 6♦: BB bets 25BB.",
                  question:"Do you call J9 (top two pair) vs passive fish who bets the river for the first time?",
                  options:[
                    { label:"No — passive fish betting river = strong value almost always", correct:true, explanation:"Correct! RE = 25/(25+57.5) ≈ 30%. P4: Passive fish with CBet River 15% — when they bet the river their range is EXTREMELY skewed toward strong value: sets (JJ, TT, 99), straights (KQ, Q8), better two pairs. This fish almost never bluffs the river; their WTSD 44% shows they reach showdown passively. J9 doesn't have the 30% equity against that range. Fold." },
                    { label:"Yes — J9 has strong two pair", correct:false, explanation:"Two pair is not protection when a passive fish bets. CBet River 15% means this player only bets when they have something very strong. Your equity vs their river betting range is insufficient. Fold." },
                    { label:"Yes — sufficient pot odds", correct:false, explanation:"Pot odds only matter if you have the equity. With a passive fish (CBet River 15%), 70%+ of their river betting range beats you. You don't have the 30% required equity. Fold." },
                    { label:"Yes — he might value bet T9 or weaker Jx", correct:false, explanation:"With CBet River 15%, this fish does NOT bet T9 or mediocre Jx — those hands they take passively to showdown. They only bet when they have something very strong. Fold J9 here." },
                  ],
                },
              ]},
            ],
          },
        ],
      },

    ],
  },
};

// ─── RANGE GRID ──────────────────────────────────────────────────────────────

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

function buildSet(arrays) { return new Set(arrays.flat()); }

const POSITION_RANGES = {
  UTG: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77'],
    ['AKs','AQs','AJs','ATs','A9s'],
    ['KQs','KJs','QJs','JTs'],
    ['AKo','AQo','KQo'],
  ]),
  MP: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66'],
    ['AKs','AQs','AJs','ATs','A9s','A8s'],
    ['KQs','KJs','KTs','QJs','QTs','JTs','T9s'],
    ['AKo','AQo','AJo','KQo','KJo'],
  ]),
  CO: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s'],
    ['KQs','KJs','KTs','K9s','QJs','QTs','Q9s','JTs','J9s','T9s','98s','87s','76s'],
    ['AKo','AQo','AJo','ATo','KQo','KJo','QJo'],
  ]),
  BTN: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s'],
    ['KQs','KJs','KTs','K9s','K8s','K7s','K6s'],
    ['QJs','QTs','Q9s','Q8s'],
    ['JTs','J9s','J8s'],
    ['T9s','T8s','T7s'],
    ['98s','97s','96s'],
    ['87s','86s','85s'],
    ['76s','75s','74s'],
    ['65s','64s','54s','53s'],
    ['AKo','AQo','AJo','ATo','A9o','A8o'],
    ['KQo','KJo','KTo'],
    ['QJo','QTo','JTo'],
  ]),
  SB: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s'],
    ['KQs','KJs','KTs','K9s','K8s','K7s'],
    ['QJs','QTs','Q9s','Q8s'],
    ['JTs','J9s','J8s'],
    ['T9s','T8s'],
    ['98s','97s','96s'],
    ['87s','86s','85s'],
    ['76s','75s','74s'],
    ['65s','64s','63s','54s','53s'],
    ['AKo','AQo','AJo','ATo','A9o','A8o','A7o'],
    ['KQo','KJo','KTo','K9o'],
    ['QJo','QTo','JTo'],
  ]),
  BB: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s'],
    ['KQs','KJs','KTs','K9s','K8s','K7s','K4s','K3s','K2s'],
    ['QJs','QTs','Q9s','Q8s','Q4s'],
    ['JTs','J9s','J8s','J4s'],
    ['T9s','T8s','T7s','T4s'],
    ['98s','97s','96s'],
    ['87s','86s','85s'],
    ['76s','75s','74s'],
    ['65s','64s','63s'],
    ['AKo','AQo','AJo','ATo','A9o'],
    ['KQo','KJo','KTo'],
    ['QJo','QTo','JTo'],
  ]),
  // ISO ranges vs 1 limper
  ISO_BTN: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s'],
    ['KQs','KJs','KTs','K9s','K8s','K7s','K6s','K5s'],
    ['QJs','QTs','Q9s','Q8s','Q7s'],
    ['JTs','J9s','J8s','J7s'],
    ['T9s','T8s','T7s','T6s'],
    ['98s','97s','96s','95s'],
    ['87s','86s','85s','84s'],
    ['76s','75s','74s','73s'],
    ['65s','64s','63s','54s','53s'],
    ['AKo','AQo','AJo','ATo','A9o','A8o','A7o','A6o'],
    ['KQo','KJo','KTo','K9o'],
    ['QJo','QTo','JTo'],
  ]),
  ISO_CO: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s'],
    ['KQs','KJs','KTs','K9s','K8s'],
    ['QJs','QTs','Q9s','Q8s'],
    ['JTs','J9s','J8s'],
    ['T9s','T8s','T7s'],
    ['98s','97s','96s'],
    ['87s','86s','85s'],
    ['76s','75s','74s'],
    ['65s','64s'],
    ['AKo','AQo','AJo','ATo','A9o'],
    ['KQo','KJo','KTo'],
    ['QJo','JTo'],
  ]),
  ISO_MP: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s'],
    ['KQs','KJs','KTs','K9s'],
    ['QJs','QTs','Q9s'],
    ['JTs','J9s'],
    ['T9s','T8s'],
    ['98s','97s'],
    ['87s'],
    ['AKo','AQo','AJo','ATo'],
    ['KQo','KJo'],
    ['QJo'],
  ]),
  ISO_BTN_2L: buildSet([
    ['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22'],
    ['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s'],
    ['KQs','KJs','KTs','K9s','K8s','K7s','K6s'],
    ['QJs','QTs','Q9s','Q8s'],
    ['JTs','J9s','J8s'],
    ['T9s','T8s','T7s'],
    ['98s','97s','96s'],
    ['87s','86s','85s'],
    ['76s','75s','74s'],
    ['65s','64s','54s'],
    ['AKo','AQo','AJo','ATo','A9o','A8o'],
    ['KQo','KJo','KTo'],
    ['QJo','QTo'],
  ]),
};

function RangeGrid({ position, lang = "es" }) {
  const openSet = POSITION_RANGES[position] || new Set();
  const W = 30, H = 20;
  const openLabel = lang === "es" ? "Abrir" : "Open";
  const foldLabel = "Fold";
  return (
    <div>
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "inline-block", border: "1px solid #1e2235", borderRadius: 8, overflow: "hidden" }}>
          {RANKS.map((r1, i) => (
            <div key={i} style={{ display: "flex" }}>
              {RANKS.map((r2, j) => {
                let hand;
                if (i === j) hand = r1 + r1;
                else if (i < j) hand = r1 + r2 + "s";
                else hand = r2 + r1 + "o";
                const isOpen = openSet.has(hand);
                return (
                  <div key={j} title={hand} style={{
                    width: W, height: H,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isOpen ? "#3b82f6" : "#16181f",
                    borderRight: j < 12 ? "1px solid #1e2030" : "none",
                    borderBottom: i < 12 ? "1px solid #1e2030" : "none",
                    fontSize: 7, fontFamily: "monospace",
                    fontWeight: i === j ? 700 : 400,
                    color: isOpen ? "#fff" : "#3a3d52",
                    letterSpacing: "-0.3px", userSelect: "none",
                  }}>
                    {hand}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 12, height: 12, background: "#3b82f6", borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: "#8b8fa8" }}>{openLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 12, height: 12, background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: "#8b8fa8" }}>{foldLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ─── QUIZ BLOCK ──────────────────────────────────────────────────────────────

function QuizBlock({ questions, lang = "es" }) {
  const [answers, setAnswers] = useState({});
  const score = Object.values(answers).filter(a => a.correct).length;
  const done = Object.keys(answers).length === questions.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {questions.map((q, qi) => {
        const answered = answers[qi];
        return (
          <div key={qi} style={{ background: "#111320", border: `1px solid ${answered ? (answered.correct ? "#10b98155" : "#ef444455") : "#1e2235"}`, borderRadius: 12, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #2a2d3a", background: "#0d0f1a" }}>
              <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                {lang === "es" ? "Mano" : "Hand"} {qi + 1} · {q.situation}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 20, fontFamily: "monospace", fontWeight: 700, color: "#fff", letterSpacing: 1 }}>{q.hand}</span>
                <span style={{ fontSize: 13, color: "#b0b4cc" }}>{q.context}</span>
              </div>
            </div>
            {/* Question */}
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontWeight: 600, color: "#dde1f5", fontSize: 15, marginBottom: 12 }}>{q.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const isSelected = answered && answered.index === oi;
                  let borderColor = "#1e2235";
                  let bg = "transparent";
                  let labelColor = "#c8cce0";
                  if (answered) {
                    if (opt.correct) { borderColor = "#10b981"; bg = "#10b98111"; labelColor = "#10b981"; }
                    else if (isSelected && !opt.correct) { borderColor = "#ef4444"; bg = "#ef444411"; labelColor = "#ef4444"; }
                  }
                  return (
                    <div key={oi}>
                      <button
                        disabled={!!answered}
                        onClick={() => setAnswers(prev => ({ ...prev, [qi]: { correct: opt.correct, index: oi } }))}
                        style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, border: `1px solid ${borderColor}`, background: bg, color: labelColor, cursor: answered ? "default" : "pointer", fontSize: 14, transition: "border-color 0.15s" }}
                      >
                        {opt.label}
                      </button>
                      {answered && isSelected && (
                        <div style={{ marginTop: 6, padding: "10px 14px", background: opt.correct ? "#10b98115" : "#ef444415", borderRadius: 8, border: `1px solid ${opt.correct ? "#10b98133" : "#ef444433"}`, fontSize: 13, color: opt.correct ? "#6ee7b7" : "#fca5a5", lineHeight: 1.6 }}>
                          {opt.correct ? "✓ " : "✗ "}{opt.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {done && (
        <div style={{ background: score === questions.length ? "#10b98122" : score >= 3 ? "#c9a84c22" : "#f9731622", border: `1px solid ${score === questions.length ? "#10b98155" : score >= 3 ? "#c9a84c55" : "#f9731655"}`, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{score === questions.length ? "🏆" : score >= 3 ? "👍" : "📚"}</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", marginBottom: 4 }}>
            {score} / {questions.length}
          </div>
          <div style={{ fontSize: 14, color: "#b0b4cc" }}>
            {lang === "es"
              ? score === questions.length ? "¡Perfecto! Dominas la apertura del bote." : score >= 3 ? "Buen trabajo. Repasa los errores antes de continuar." : "Repasa los capítulos anteriores y vuelve a intentarlo."
              : score === questions.length ? "Perfect! You've mastered opening the pot." : score >= 3 ? "Good work. Review your mistakes before moving on." : "Go back over the previous chapters and try again."}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RENDERERS ───────────────────────────────────────────────────────────────

function RenderBody({ blocks, lang = "es" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {blocks.map((block, i) => {
        if (block.type === "text") return <p key={i} style={{ margin: 0, color: "#c8cce0", fontSize: 15, lineHeight: 1.75 }}>{block.content}</p>;

        if (block.type === "callout") return (
          <div key={i} style={{ background: "#1e2030", border: "1px solid #c9a84c44", borderLeft: "3px solid #c9a84c", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{block.label}</div>
            <div style={{ color: "#b0b4cc", fontSize: 14, lineHeight: 1.7 }}>{block.content}</div>
          </div>
        );

        if (block.type === "positionHeader") return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#1e2030", border: `1px solid ${block.color}44`, borderRadius: 12, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: block.color }}>{block.name.replace("ISO_BTN_2L","BTN×2").replace("ISO_BTN","BTN").replace("ISO_CO","CO").replace("ISO_MP","MP")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div><div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8 }}>Rango / Range</div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{block.range}</div></div>
                  <div><div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8 }}>Open Size</div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{block.size}</div></div>
                </div>
              </div>
            </div>
          </div>
        );

        if (block.type === "rangeBlock") return (
          <div key={i} style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", background: "#1e2030", fontSize: 12, fontWeight: 700, color: "#e8c96a", textTransform: "uppercase", letterSpacing: 0.8 }}>{block.label}</div>
            {block.legend && (
              <div style={{ padding: "6px 16px 0", display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#c0392b", display: "inline-block" }} /><span style={{ color: "#8b8fa8" }}>{block.legend.core}</span></span>
                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#c9a84c", display: "inline-block" }} /><span style={{ color: "#8b8fa8" }}>{block.legend.exploit}</span></span>
                <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#1e2235", border: "1px solid #333", display: "inline-block" }} /><span style={{ color: "#8b8fa8" }}>{block.legend.fold}</span></span>
              </div>
            )}
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {block.hands.map((row, j) => {
                const tierColor = row.tier === "exploit" ? "#c9a84c" : row.tier === "fold" ? "#3a3d4a" : "#e85555";
                const textColor = row.tier === "exploit" ? "#e8c96a" : row.tier === "fold" ? "#5a5e70" : "#ffc0b0";
                return (
                  <div key={j} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                    <span style={{ fontSize: 11, color: tierColor, minWidth: 14, fontWeight: 800 }}>{row.tier === "exploit" ? "◆" : row.tier === "fold" ? "✕" : "●"}</span>
                    <span style={{ fontSize: 12, color: "#8b8fa8", minWidth: 110 }}>{row.group}</span>
                    <span style={{ fontSize: 13, color: textColor, fontFamily: "monospace", fontWeight: 600 }}>{row.cards}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

        if (block.type === "handCategory") return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {block.categories.map((cat, j) => (
              <div key={j} style={{ background: "#111320", border: `1px solid ${cat.color}33`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ fontWeight: 700, color: cat.color, fontSize: 14 }}>{cat.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12, fontFamily: "monospace", color: "#8b8fa8" }}>{cat.hands}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#b0b4cc", lineHeight: 1.6 }}>{cat.description}</p>
              </div>
            ))}
          </div>
        );

        if (block.type === "tableImage") return (
          <div key={i} style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 14, padding: "16px", display: "flex", justifyContent: "center" }}>
            <svg viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 520 }}>
              {/* Table felt */}
              <ellipse cx="280" cy="160" rx="195" ry="115" fill="#1a4731" stroke="#2d6a4f" strokeWidth="3" />
              {/* Inner felt line */}
              <ellipse cx="280" cy="160" rx="170" ry="95" fill="none" stroke="#2d6a4f" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
              {/* Table rail */}
              <ellipse cx="280" cy="160" rx="195" ry="115" fill="none" stroke="#7c4a1e" strokeWidth="8" />

              {/* Action order arrow (clockwise arc, subtle) */}
              <text x="280" y="166" textAnchor="middle" fill="#2d6a4f" fontSize="11" fontFamily="monospace" opacity="0.7">6-MAX</text>

              {/* ── Seats ── */}
              {/* UTG: top center (280, 50) */}
              <circle cx="280" cy="45" r="26" fill="#ef444422" stroke="#ef4444" strokeWidth="2" />
              <text x="280" y="41" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold" fontFamily="sans-serif">UTG</text>
              <text x="280" y="56" textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="sans-serif">~14%</text>

              {/* MP: top right (449, 105) */}
              <circle cx="449" cy="100" r="26" fill="#f9731622" stroke="#f97316" strokeWidth="2" />
              <text x="449" y="96" textAnchor="middle" fill="#f97316" fontSize="13" fontWeight="bold" fontFamily="sans-serif">MP</text>
              <text x="449" y="111" textAnchor="middle" fill="#f97316" fontSize="9" fontFamily="sans-serif">~20%</text>

              {/* CO: right (449, 215) */}
              <circle cx="449" cy="215" r="26" fill="#eab30822" stroke="#eab308" strokeWidth="2" />
              <text x="449" y="211" textAnchor="middle" fill="#eab308" fontSize="13" fontWeight="bold" fontFamily="sans-serif">CO</text>
              <text x="449" y="226" textAnchor="middle" fill="#eab308" fontSize="9" fontFamily="sans-serif">~27%</text>

              {/* BTN: bottom center (280, 270) — with dealer button */}
              <circle cx="280" cy="273" r="26" fill="#10b98122" stroke="#10b981" strokeWidth="2" />
              <text x="280" y="269" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold" fontFamily="sans-serif">BTN</text>
              <text x="280" y="284" textAnchor="middle" fill="#10b981" fontSize="9" fontFamily="sans-serif">~42%</text>
              {/* Dealer button */}
              <circle cx="314" cy="256" r="9" fill="#fff" stroke="#10b981" strokeWidth="1.5" />
              <text x="314" y="260" textAnchor="middle" fill="#1a1c28" fontSize="9" fontWeight="bold" fontFamily="sans-serif">D</text>

              {/* SB: bottom left (111, 215) */}
              <circle cx="111" cy="215" r="26" fill="#8b5cf622" stroke="#8b5cf6" strokeWidth="2" />
              <text x="111" y="211" textAnchor="middle" fill="#8b5cf6" fontSize="13" fontWeight="bold" fontFamily="sans-serif">SB</text>
              <text x="111" y="226" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontFamily="sans-serif">~35%</text>

              {/* BB: top left (111, 105) */}
              <circle cx="111" cy="100" r="26" fill="#06b6d422" stroke="#06b6d4" strokeWidth="2" />
              <text x="111" y="96" textAnchor="middle" fill="#06b6d4" fontSize="13" fontWeight="bold" fontFamily="sans-serif">BB</text>
              <text x="111" y="111" textAnchor="middle" fill="#06b6d4" fontSize="9" fontFamily="sans-serif">defensa</text>

              {/* Clockwise direction arrows between seats */}
              {[
                { x1: 280, y1: 72, x2: 423, y2: 105, color: "#ffffff22" },
                { x1: 449, y1: 127, x2: 449, y2: 188, color: "#ffffff22" },
                { x1: 430, y1: 233, x2: 310, y2: 264, color: "#ffffff22" },
                { x1: 250, y1: 266, x2: 137, y2: 233, color: "#ffffff22" },
                { x1: 111, y1: 188, x2: 111, y2: 127, color: "#ffffff22" },
                { x1: 130, y1: 82, x2: 253, y2: 52, color: "#ffffff22" },
              ].map((arrow, j) => (
                <line key={j} x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} stroke={arrow.color} strokeWidth="1.5" markerEnd="url(#arr)" />
              ))}
              <defs>
                <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff33" />
                </marker>
              </defs>
            </svg>
          </div>
        );

        if (block.type === "positionMap") return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {block.positions.map((pos, j) => (
              <div key={j} style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontWeight: 700, color: "#e8c96a", fontSize: 14 }}>{pos.name} <span style={{ color: "#8b8fa8", fontWeight: 400, fontSize: 12 }}>— {pos.full}</span></div>
                <div style={{ fontSize: 12, color: "#8b8fa8", marginTop: 4, lineHeight: 1.5 }}>{pos.desc}</div>
              </div>
            ))}
          </div>
        );

        if (block.type === "rangeGrid") return (
          <RangeGridBlock key={i} data={block} lang={lang} />
        );
        if (block.type === "rangeImage") return (
          <div key={i} style={{ display:"flex", justifyContent:"center", margin:"16px 0" }}>
            <img src={block.src} alt={block.alt||"Range table"} style={{ maxWidth:"100%", borderRadius:8 }} />
          </div>
        );
        if (block.type === "quiz") return (
          <QuizBlock key={i} questions={block.questions} lang={lang} />
        );

        return null;
      })}
    </div>
  );
}

// ─── LESSON READER ───────────────────────────────────────────────────────────

function LessonReader({ lesson, t, onComplete, onBack }) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const chapters = lesson.chapters;
  const chapter = chapters[chapterIdx];
  const isLast = chapterIdx === chapters.length - 1;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px" }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#8b8fa8" }}>{lesson.title}</span>
          <span style={{ fontSize: 12, color: "#8b8fa8" }}>{chapterIdx + 1} / {chapters.length}</span>
        </div>
        <div style={{ height: 4, background: "#1e2235", borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${((chapterIdx + 1) / chapters.length) * 100}%`, background: "#c9a84c", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Chapter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
        {chapters.map((ch, i) => (
          <button key={i} onClick={() => setChapterIdx(i)}
            style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid", fontSize: 12, cursor: "pointer", borderColor: i === chapterIdx ? "#c9a84c" : "#1e2235", background: i === chapterIdx ? "#c9a84c22" : "transparent", color: i === chapterIdx ? "#e8c96a" : i < chapterIdx ? "#c9a84c" : "#8b8fa8", fontWeight: i === chapterIdx ? 600 : 400 }}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Chapter content */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 24, marginTop: 0 }}>{chapter.title}</h2>
        <RenderBody blocks={chapter.body} lang={t.academia.lockedMsg === "Completa las lecciones anteriores para desbloquear." ? "es" : "en"} />
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #2a2d3a", paddingTop: 20 }}>
        {chapterIdx > 0 && (
          <button onClick={() => { setChapterIdx(chapterIdx - 1); window.scrollTo(0,0); }}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #1e2235", background: "transparent", color: "#8b8fa8", cursor: "pointer", fontSize: 14 }}>
            {t.academia.prevChapter}
          </button>
        )}
        {!isLast ? (
          <button onClick={() => { setChapterIdx(chapterIdx + 1); window.scrollTo(0,0); }}
            style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#c9a84c", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            {t.academia.nextChapter}
          </button>
        ) : (
          <button onClick={onComplete}
            style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            {t.academia.complete}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ACADEMIA PAGE ────────────────────────────────────────────────────────────

function AcademiaPage({ t, completed, onComplete, lang }) {
  const [openLesson, setOpenLesson] = useState(null);

  if (openLesson !== null) {
    const lesson = t.lessons[openLesson];
    return (
      <LessonReader
        lesson={lesson}
        t={t}
        onComplete={() => { onComplete(lesson.id); setOpenLesson(null); }}
        onBack={() => setOpenLesson(null)}
      />
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{t.academia.title}</div>
        <div style={{ fontSize: 13, color: "#8b8fa8", marginTop: 3 }}>{t.academia.subtitle}</div>
        <div style={{ marginTop: 12, fontSize: 13, color: "#c9a84c" }}>
          {t.academia.progress}: {completed.size} {t.academia.of} {t.lessons.length}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {t.lessons.map((lesson, idx) => {
          const isDone = completed.has(lesson.id);
          const isSoon = !!lesson.comingSoon;
          // Locked: needs chapters + previous lesson completed (except lesson 0)
          const isLocked = !isSoon && !lesson.comingSoon && idx > 0 && !completed.has(t.lessons[idx - 1].id);
          const isClickable = !isSoon && !isLocked;
          const soonLabel = lang === "es" ? "Próximamente" : "Coming soon";
          const lockedLabel = lang === "es" ? "Completa la lección anterior para desbloquear" : "Complete the previous lesson to unlock";

          let borderColor = isDone ? "#10b98155" : "#1e2235";
          let opacity = isSoon ? 0.4 : isLocked ? 0.5 : 1;
          let icon = isSoon ? "🚧" : isLocked ? "🔒" : isDone ? "✅" : "▶";
          let titleColor = (isSoon || isLocked) ? "#8b8fa8" : isDone ? "#10b981" : "#dde1f5";

          return (
            <div
              key={lesson.id}
              onClick={() => isClickable && setOpenLesson(idx)}
              style={{ background: "#0d0f1a", border: `1px solid ${borderColor}`, borderRadius: 12, padding: "16px 20px", cursor: isClickable ? "pointer" : "default", opacity, transition: "border-color 0.15s" }}
              onMouseEnter={(e) => isClickable && (e.currentTarget.style.borderColor = isDone ? "#10b98188" : "#c9a84c88")}
              onMouseLeave={(e) => isClickable && (e.currentTarget.style.borderColor = isDone ? "#10b98155" : "#1e2235")}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: titleColor, fontSize: 16 }}>{lesson.title}</span>
                <span style={{ fontSize: 18 }}>{icon}</span>
              </div>
              <div style={{ fontSize: 13, color: "#8b8fa8", marginTop: 5 }}>{lesson.summary}</div>
              {isSoon && <div style={{ fontSize: 11, color: "#c9a84c", marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{soonLabel}</div>}
              {isLocked && <div style={{ fontSize: 11, color: "#8b8fa8", marginTop: 6 }}>{lockedLabel}</div>}
              {isDone && !isSoon && !isLocked && (
                <div style={{ fontSize: 11, color: "#10b981", marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>✓ {t.academia.completed}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({ t, onNavigate, onPropose }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Decorative suits background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", userSelect: "none", overflow: "hidden" }}>
        <span style={{ position: "absolute", top: "8%", left: "3%", fontSize: 120, color: "#c9a84c", opacity: 0.04, lineHeight: 1 }}>♠</span>
        <span style={{ position: "absolute", top: "5%", right: "4%", fontSize: 100, color: "#ef4444", opacity: 0.05, lineHeight: 1 }}>♥</span>
        <span style={{ position: "absolute", bottom: "10%", left: "5%", fontSize: 90, color: "#ef4444", opacity: 0.04, lineHeight: 1 }}>♦</span>
        <span style={{ position: "absolute", bottom: "8%", right: "3%", fontSize: 110, color: "#c9a84c", opacity: 0.04, lineHeight: 1 }}>♣</span>
      </div>

      {/* Logo area */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 28, color: "#c9a84c" }}>♠</span>
          <span style={{ fontSize: 28, color: "#ef4444" }}>♥</span>
          <span style={{ fontSize: 28, color: "#ef4444" }}>♦</span>
          <span style={{ fontSize: 28, color: "#c9a84c" }}>♣</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 50%, #a07830 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5, lineHeight: 1.1 }}>
          {t.home.welcome}
        </h1>
        <div style={{ marginTop: 6, width: 60, height: 2, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", margin: "10px auto 0" }} />
      </div>

      <p style={{ fontSize: 15, color: "#8b8fa8", marginBottom: 44, marginTop: 14, letterSpacing: 0.2 }}>{t.home.subtitle}</p>

      {/* Menu buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360, margin: "0 auto" }}>
        <button
          onClick={() => onNavigate("academia")}
          style={{ display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #111320 0%, #0d0f1a 100%)", border: "1px solid #c9a84c44", borderRadius: 16, padding: "20px 24px", color: "#f0f0f5", cursor: "pointer", fontSize: 16, fontWeight: 700, width: "100%", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: "0 4px 24px #00000066" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; e.currentTarget.style.boxShadow = "0 4px 32px #c9a84c22"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#c9a84c44"; e.currentTarget.style.boxShadow = "0 4px 24px #00000066"; }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #c9a84c22, #c9a84c11)", border: "1px solid #c9a84c44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>♠</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f5" }}>{t.menu.academia}</div>
            <div style={{ fontSize: 12, color: "#8b8fa8", marginTop: 2 }}>{t.menu.academiaSubtitle}</div>
          </div>
          <span style={{ marginLeft: "auto", color: "#c9a84c", fontSize: 20 }}>→</span>
        </button>

        <button
          onClick={() => onNavigate("practice")}
          style={{ display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #111320 0%, #0d0f1a 100%)", border: "1px solid #10b98144", borderRadius: 16, padding: "20px 24px", color: "#f0f0f5", cursor: "pointer", fontSize: 16, fontWeight: 700, width: "100%", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: "0 4px 24px #00000066" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.boxShadow = "0 4px 32px #10b98122"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#10b98144"; e.currentTarget.style.boxShadow = "0 4px 24px #00000066"; }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #10b98122, #10b98111)", border: "1px solid #10b98144", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>♥</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f5" }}>{t.practice.title}</div>
            <div style={{ fontSize: 12, color: "#8b8fa8", marginTop: 2 }}>{t.practice.subtitle}</div>
          </div>
          <span style={{ marginLeft: "auto", color: "#10b981", fontSize: 20 }}>→</span>
        </button>

        <button
          onClick={() => onNavigate("stats")}
          style={{ display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(135deg, #111320 0%, #0d0f1a 100%)", border: "1px solid #8b5cf644", borderRadius: 16, padding: "20px 24px", color: "#f0f0f5", cursor: "pointer", fontSize: 16, fontWeight: 700, width: "100%", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: "0 4px 24px #00000066" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 4px 32px #8b5cf622"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#8b5cf644"; e.currentTarget.style.boxShadow = "0 4px 24px #00000066"; }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #8b5cf622, #8b5cf611)", border: "1px solid #8b5cf644", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>♦</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f5" }}>{t.menu.stats}</div>
            <div style={{ fontSize: 12, color: "#8b8fa8", marginTop: 2 }}>{t.menu.statsSubtitle}</div>
          </div>
          <span style={{ marginLeft: "auto", color: "#8b5cf6", fontSize: 20 }}>→</span>
        </button>

        <button
          onClick={onPropose}
          style={{ display: "flex", alignItems: "center", gap: 16, background: "transparent", border: "1px solid #1e2235", borderRadius: 16, padding: "16px 24px", color: "#c9a84c", cursor: "pointer", fontSize: 14, fontWeight: 700, width: "100%", transition: "border-color 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a84c"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e2235"; }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#c9a84c11", border: "1px solid #c9a84c44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✚</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#c9a84c" }}>{t.practice.proposeBtn}</div>
          </div>
        </button>
      </div>

      {/* Bottom suits strip */}
      <div style={{ marginTop: 52, display: "flex", justifyContent: "center", gap: 20, opacity: 0.15 }}>
        {["♠","♥","♦","♣"].map(s => <span key={s} style={{ fontSize: 20, color: s === "♥" || s === "♦" ? "#ef4444" : "#c9a84c" }}>{s}</span>)}
      </div>
    </div>
  );
}

// ─── PRACTICE DATA ───────────────────────────────────────────────────────────

const CTX = {
  neutral:    { es: "Situación de open raise. Todos los jugadores delante de ti han foldeado. Mesa regular, sin tendencias extremas.", en: "Open raise situation. All players before you have folded. Regular table, no extreme tendencies." },
  nit_btn:    { es: "Situación de open raise. Todos los jugadores delante de ti han foldeado. El BTN es un nit que foldea mucho preflop.", en: "Open raise situation. All players before you have folded. BTN is a nit who folds a lot preflop." },
  nit_blind:  { es: "Situación de open raise. Todos los jugadores delante de ti han foldeado. SB y BB son jugadores muy ajustados.", en: "Open raise situation. All players before you have folded. SB and BB are very tight players." },
  agg_btn:    { es: "Situación de open raise. Todos los jugadores delante de ti han foldeado. El BTN 3-betea el 18% de tus aperturas.", en: "Open raise situation. All players before you have folded. BTN 3-bets 18% of your opens." },
  agg_bb:     { es: "Situación de open raise. Todos los jugadores delante de ti han foldeado. El BB es agresivo y 3-betea con frecuencia.", en: "Open raise situation. All players before you have folded. BB is aggressive and 3-bets often." },
  passive_bb: { es: "Situación de open raise. Todos los jugadores delante de ti han foldeado. El BB es pasivo y casi nunca 3-betea.", en: "Open raise situation. All players before you have folded. BB is passive and rarely 3-bets." },
  limper_utg_fish:  { es: "UTG ha limpeado (jugador recreativo).", en: "UTG has limped (recreational player)." },
  limper_mp_fish:   { es: "MP ha limpeado (jugador recreativo).", en: "MP has limped (recreational player)." },
  limper_co_fish:   { es: "CO ha limpeado (jugador recreativo).", en: "CO has limped (recreational player)." },
  limper_btn_fish:  { es: "BTN ha limpeado (jugador recreativo).", en: "BTN has limped (recreational player)." },
  limpers_2_fish:   { es: "UTG y MP han limpeado (ambos recreativos).", en: "UTG and MP have limped (both recreational)." },
  limpers_2_mix:    { es: "UTG ha limpeado (fish) y MP ha limpeado (regular pasivo).", en: "UTG has limped (fish) and MP has limped (passive regular)." },
  cb_hu_ip:         { es: "pagó. Llegas al flop como agresor. Rival checkea — actúas tú último (IP).", en: "called. You reach the flop as the aggressor. Villain checks — you act last (IP)." },
  cb_hu_oop:        { es: "pagó. Llegas al flop como agresor. Actúas tú primero (OOP).", en: "called. You reach the flop as the aggressor. You act first (OOP)." },
  cb_hu_ip_nit:     { es: "nit pagó. Rival checkea — actúas tú último (IP). El nit foldea mucho postflop.", en: "nit called. Villain checks — you act last (IP). The nit folds a lot postflop." },
  cb_hu_ip_fish:    { es: "calling station pagó. Rival checkea — actúas tú último (IP). Paga casi todo.", en: "calling station called. Villain checks — you act last (IP). Pays almost everything." },
  cb_3way:          { es: "dos rivales pagaron (bote 3-way). Llegas al flop como agresor. Actúas tú primero.", en: "two villains called (3-way pot). You reach the flop as the aggressor. You act first." },
  cb_3way_ip:       { es: "dos rivales pagaron (bote 3-way). Llegas al flop como agresor. Actúas tú el último.", en: "two villains called (3-way pot). You reach the flop as the aggressor. You act last." },
  vbet_fish_ip:     { es: "Rival es un fish (WTSD alto, rango inelástico). Actúas tú último (IP).", en: "Villain is a fish (high WTSD, inelastic range). You act last (IP)." },
  vbet_fish_oop:    { es: "Rival es un fish (WTSD alto). Actúas tú primero (OOP).", en: "Villain is a fish (high WTSD). You act first (OOP)." },
  vbet_reg_ip:      { es: "Rival es un regular sólido. Actúas tú último (IP). Usa sizing balanceado.", en: "Villain is a solid regular. You act last (IP). Use balanced sizing." },
  vbet_reg_oop:     { es: "Rival es un regular sólido. Actúas tú primero (OOP). Cuidado con el tamaño.", en: "Villain is a solid regular. You act first (OOP). Be careful with sizing." },
  vbet_check:       { es: "Situación donde check tiene más EV que apostar (slowplay o fuerza relativa insuficiente).", en: "Situation where checking has more EV than betting (slowplay or insufficient relative strength)." },
  call_ip_fish:     { es: "Hay un fish recreativo en el bote. Decides si pagar la apertura en posición.", en: "There's a recreational fish in the pot. You decide whether to call the open in position." },
  call_ip_reg:      { es: "Mesa de regulars. Decides si pagar la apertura en posición.", en: "Regular table. You decide whether to call the open in position." },
  call_bb_reg:      { es: "Estás en la BB. Decides si pagar la apertura.", en: "You're in the BB. You decide whether to call the open." },
  call_sb_reg:      { es: "Estás en la SB. Decides si pagar, 3-betear o foldear.", en: "You're in the SB. You decide whether to call, 3-bet or fold." },
  call_sb_fish:     { es: "Estás en la SB y hay un fish recreativo en el bote. Decides si pagar, 3-betear o foldear.", en: "You're in the SB and there's a recreational fish in the pot. You decide whether to call, 3-bet or fold." },
  facing_river:     { es: "El rival apuesta en el river. Evalúa su rango, calcula la ER y decide si tienes suficiente equidad para pagar.", en: "Villain bets on the river. Evaluate their range, calculate required equity and decide if you have enough to call." },
  facing_turn:      { es: "El rival apuesta en el turn (double barrel). Evalúa tu equidad, el SPR restante y el rango del rival.", en: "Villain bets on the turn (double barrel). Evaluate your equity, remaining SPR and villain's range." },
  facing_allin:     { es: "El rival va all-in. No quedan más calles — calcula tu equidad real vs su rango probable.", en: "Villain goes all-in. No more streets — calculate your real equity vs their likely range." },
};

// { id, pos, hand, code, open, size, ctx, es, en }
// open=true → correct answer is to open at 'size'
// es/en = explanation of the correct decision
const SITUATIONS = [
  // ── UTG opens ────────────────────────────────────────────────
  { id:1,  pos:"UTG", hand:"A♠ A♦", code:"AA",  open:true,  size:"3x", ctx:"neutral", es:"AA es siempre apertura desde cualquier posición. Abre a 3x.", en:"AA is always an open from any position. Open to 3x." },
  { id:2,  pos:"UTG", hand:"K♥ K♦", code:"KK",  open:true,  size:"3x", ctx:"neutral", es:"KK abre siempre desde UTG. Tamaño estándar 3x.", en:"KK always opens from UTG. Standard 3x sizing." },
  { id:3,  pos:"UTG", hand:"Q♠ Q♥", code:"QQ",  open:true,  size:"3x", ctx:"neutral", es:"QQ es mano premium. Apertura estándar 3x desde UTG.", en:"QQ is a premium hand. Standard 3x open from UTG." },
  { id:4,  pos:"UTG", hand:"J♣ J♦", code:"JJ",  open:true,  size:"3x", ctx:"neutral", es:"JJ entra en el rango UTG. Abre a 3x.", en:"JJ is in the UTG range. Open to 3x." },
  { id:5,  pos:"UTG", hand:"T♠ T♣", code:"TT",  open:true,  size:"3x", ctx:"neutral", es:"TT está en el rango UTG. Abre a 3x.", en:"TT is in the UTG range. Open to 3x." },
  { id:6,  pos:"UTG", hand:"9♥ 9♦", code:"99",  open:true,  size:"3x", ctx:"neutral", es:"99 entra en el rango UTG. Abre a 3x.", en:"99 is in the UTG range. Open to 3x." },
  { id:7,  pos:"UTG", hand:"8♠ 8♣", code:"88",  open:true,  size:"3x", ctx:"neutral", es:"88 está en el rango UTG. Abre a 3x.", en:"88 is in the UTG range. Open to 3x." },
  { id:8,  pos:"UTG", hand:"7♦ 7♥", code:"77",  open:true,  size:"3x", ctx:"neutral", es:"77 está en el rango UTG. Abre a 3x.", en:"77 is in the UTG range. Open to 3x." },
  { id:9,  pos:"UTG", hand:"A♣ K♣", code:"AKs", open:true,  size:"3x", ctx:"neutral", es:"AKs es mano premium suited. Siempre abre desde UTG.", en:"AKs is a premium suited hand. Always opens from UTG." },
  { id:10, pos:"UTG", hand:"A♦ Q♦", code:"AQs", open:true,  size:"3x", ctx:"neutral", es:"AQs tiene excelente equidad y entra en el rango UTG.", en:"AQs has excellent equity and is in the UTG range." },
  { id:11, pos:"UTG", hand:"A♠ J♠", code:"AJs", open:true,  size:"3x", ctx:"neutral", es:"AJs es apertura estándar desde UTG. Buen potencial de flush y top pair.", en:"AJs is a standard UTG open. Good flush and top pair potential." },
  { id:12, pos:"UTG", hand:"A♥ T♥", code:"ATs", open:true,  size:"3x", ctx:"neutral", es:"ATs entra en el rango UTG. Suited con buen potencial postflop.", en:"ATs is in the UTG range. Suited with good postflop potential." },
  { id:13, pos:"UTG", hand:"A♣ 9♣", code:"A9s", open:true,  size:"3x", ctx:"neutral", es:"A9s está al límite del rango UTG pero es apertura válida.", en:"A9s is at the edge of the UTG range but is a valid open." },
  { id:14, pos:"UTG", hand:"K♠ Q♠", code:"KQs", open:true,  size:"3x", ctx:"neutral", es:"KQs es broadway suited y entra claramente en el rango UTG.", en:"KQs is broadway suited and clearly in the UTG range." },
  { id:15, pos:"UTG", hand:"K♦ J♦", code:"KJs", open:true,  size:"3x", ctx:"neutral", es:"KJs es broadway suited y entra en el rango UTG.", en:"KJs is broadway suited and in the UTG range." },
  { id:16, pos:"UTG", hand:"Q♣ J♣", code:"QJs", open:true,  size:"3x", ctx:"neutral", es:"QJs broadway suited entra en el rango UTG.", en:"QJs broadway suited is in the UTG range." },
  { id:17, pos:"UTG", hand:"J♠ T♠", code:"JTs", open:true,  size:"3x", ctx:"neutral", es:"JTs entra en el rango UTG. Suited connector de alto nivel.", en:"JTs is in the UTG range. High-level suited connector." },
  { id:18, pos:"UTG", hand:"A♥ K♣", code:"AKo", open:true,  size:"3x", ctx:"neutral", es:"AKo es mano premium. Siempre abre desde UTG.", en:"AKo is a premium hand. Always opens from UTG." },
  { id:19, pos:"UTG", hand:"A♦ Q♥", code:"AQo", open:true,  size:"3x", ctx:"neutral", es:"AQo entra en el rango UTG. Buena fuerza offsuit.", en:"AQo is in the UTG range. Good offsuit strength." },
  { id:20, pos:"UTG", hand:"K♣ Q♥", code:"KQo", open:true,  size:"3x", ctx:"neutral", es:"KQo entra en el rango UTG. Broadway offsuit de buena fuerza.", en:"KQo is in the UTG range. Strong broadway offsuit." },
  // ── UTG folds ────────────────────────────────────────────────
  { id:21, pos:"UTG", hand:"6♠ 6♣", code:"66",  open:false, size:"3x", ctx:"neutral", es:"66 está fuera del rango UTG. Con 5 jugadores por detrás no tiene suficiente potencial.", en:"66 is outside the UTG range. With 5 players behind it lacks sufficient potential." },
  { id:22, pos:"UTG", hand:"5♥ 5♦", code:"55",  open:false, size:"3x", ctx:"neutral", es:"55 no está en el rango UTG. Necesita posición e implied odds para ser rentable.", en:"55 is not in the UTG range. Needs position and implied odds to be profitable." },
  { id:23, pos:"UTG", hand:"A♠ 8♠", code:"A8s", open:false, size:"3x", ctx:"neutral", es:"A8s está fuera del rango UTG. Desde UTG solo abres hasta A9s suited.", en:"A8s is outside the UTG range. From UTG you only open down to A9s suited." },
  { id:24, pos:"UTG", hand:"A♥ 7♥", code:"A7s", open:false, size:"3x", ctx:"neutral", es:"A7s no está en el rango UTG. Demasiado débil con tantos jugadores por detrás.", en:"A7s is not in the UTG range. Too weak with so many players behind." },
  { id:25, pos:"UTG", hand:"K♣ T♣", code:"KTs", open:false, size:"3x", ctx:"neutral", es:"KTs no está en el rango UTG. Entra en MP, pero desde UTG es fold.", en:"KTs is not in the UTG range. It enters at MP, but UTG is a fold." },
  { id:26, pos:"UTG", hand:"Q♦ 9♦", code:"Q9s", open:false, size:"3x", ctx:"neutral", es:"Q9s no está en el rango UTG. Demasiado débil para jugar desde primera posición.", en:"Q9s is not in the UTG range. Too weak to play from first position." },
  { id:27, pos:"UTG", hand:"T♠ 9♠", code:"T9s", open:false, size:"3x", ctx:"neutral", es:"T9s no está en el rango UTG. Buen suited connector pero necesita posición.", en:"T9s is not in the UTG range. Good suited connector but needs position." },
  { id:28, pos:"UTG", hand:"9♣ 8♣", code:"98s", open:false, size:"3x", ctx:"neutral", es:"98s no está en el rango UTG. Suited connector que necesita posición para ser rentable.", en:"98s is not in the UTG range. Suited connector that needs position to be profitable." },
  { id:29, pos:"UTG", hand:"A♥ J♣", code:"AJo", open:false, size:"3x", ctx:"neutral", es:"AJo no está en el rango UTG. Offsuit y sin la fuerza necesaria desde primera posición.", en:"AJo is not in the UTG range. Offsuit and not strong enough from first position." },
  { id:30, pos:"UTG", hand:"K♠ J♥", code:"KJo", open:false, size:"3x", ctx:"neutral", es:"KJo no está en el rango UTG. Demasiado débil sin suits desde primera posición.", en:"KJo is not in the UTG range. Too weak without suits from first position." },
  // ── MP opens ─────────────────────────────────────────────────
  { id:31, pos:"MP",  hand:"6♦ 6♥", code:"66",  open:true,  size:"3x", ctx:"neutral", es:"66 entra en el rango MP. Un jugador ya ha pasado y hay menos presión que en UTG.", en:"66 is in the MP range. One player has folded and there's less pressure than UTG." },
  { id:32, pos:"MP",  hand:"A♠ 8♠", code:"A8s", open:true,  size:"3x", ctx:"neutral", es:"A8s entra en el rango MP. Desde UTG es fold pero MP tiene más flexibilidad.", en:"A8s is in the MP range. From UTG it's a fold but MP has more flexibility." },
  { id:33, pos:"MP",  hand:"K♣ T♣", code:"KTs", open:true,  size:"3x", ctx:"neutral", es:"KTs entra en MP. Broadway suited con buen potencial de flush y straight.", en:"KTs enters at MP. Broadway suited with good flush and straight potential." },
  { id:34, pos:"MP",  hand:"Q♥ T♥", code:"QTs", open:true,  size:"3x", ctx:"neutral", es:"QTs entra en el rango MP. Suited con potencial de flush y straight draws.", en:"QTs is in the MP range. Suited with flush and straight draw potential." },
  { id:35, pos:"MP",  hand:"T♦ 9♦", code:"T9s", open:true,  size:"3x", ctx:"neutral", es:"T9s entra en el rango MP. Suited connector con buen potencial postflop.", en:"T9s is in the MP range. Suited connector with good postflop potential." },
  { id:36, pos:"MP",  hand:"J♣ T♣", code:"JTs", open:true,  size:"3x", ctx:"neutral", es:"JTs entra en MP (y también en UTG). Suited connector de primer nivel.", en:"JTs is in the MP range (also UTG). Top-tier suited connector." },
  { id:37, pos:"MP",  hand:"A♣ J♣", code:"AJo", open:true,  size:"3x", ctx:"neutral", es:"AJo entra en el rango MP. Desde UTG es fold, pero MP permite abrirlo.", en:"AJo is in the MP range. From UTG it's a fold, but MP allows opening it." },
  { id:38, pos:"MP",  hand:"K♠ J♣", code:"KJo", open:true,  size:"3x", ctx:"neutral", es:"KJo entra en el rango MP. Broadway offsuit jugable desde posición media.", en:"KJo is in the MP range. Playable broadway offsuit from middle position." },
  { id:39, pos:"MP",  hand:"7♠ 7♣", code:"77",  open:true,  size:"3x", ctx:"neutral", es:"77 entra tanto en UTG como en MP. Par medio con buen potencial de set.", en:"77 is in both UTG and MP ranges. Medium pair with good set potential." },
  { id:40, pos:"MP",  hand:"A♦ 9♦", code:"A9s", open:true,  size:"3x", ctx:"neutral", es:"A9s entra en UTG y MP. Suited ace con buen potencial.", en:"A9s is in both UTG and MP ranges. Suited ace with good potential." },
  // ── MP folds ─────────────────────────────────────────────────
  { id:41, pos:"MP",  hand:"5♣ 5♦", code:"55",  open:true, size:"3x", ctx:"neutral", es:"55 entra en el rango MP (~28%). Con el rango ampliado, 55 tiene set potential suficiente desde MP.", en:"55 is in the MP range (~28%). With the wider range, 55 has sufficient set potential from MP." },
  { id:42, pos:"MP",  hand:"A♦ 6♦", code:"A6s", open:true, size:"3x", ctx:"neutral", es:"A6s entra en el rango MP. Todos los ases suited se abren desde MP.", en:"A6s is in the MP range. All suited aces are opened from MP." },
  { id:43, pos:"MP",  hand:"K♥ 8♥", code:"K8s", open:false, size:"3x", ctx:"neutral", es:"K8s no está en el rango MP (mínimo K9s). Desde MP se abren K9s y superiores.", en:"K8s is not in the MP range (minimum K9s). From MP we open K9s and above." },
  { id:44, pos:"MP",  hand:"9♠ 8♠", code:"98s", open:true, size:"3x", ctx:"neutral", es:"98s entra en el rango MP. Los suited connectors hasta 65s se abren desde MP.", en:"98s is in the MP range. Suited connectors down to 65s are opened from MP." },
  { id:45, pos:"MP",  hand:"8♦ 7♦", code:"87s", open:true, size:"3x", ctx:"neutral", es:"87s entra en el rango MP. Suited connectors y gappers hasta 65s se abren desde MP.", en:"87s is in the MP range. Suited connectors and gappers down to 65s are opened from MP." },
  { id:46, pos:"MP",  hand:"A♣ T♥", code:"ATo", open:false, size:"3x", ctx:"neutral", es:"ATo no está en el rango MP. Los ases offsuit se abren desde MP hasta AJo. ATo entra desde CO.", en:"ATo is not in the MP range. Offsuit aces from MP go down to AJo. ATo enters from CO." },
  { id:47, pos:"MP",  hand:"J♠ 9♥", code:"J9o", open:false, size:"3x", ctx:"neutral", es:"J9o no está en ningún rango de apertura. Offsuit gapper demasiado débil.", en:"J9o is not in any opening range. Offsuit gapper too weak to open." },
  { id:48, pos:"MP",  hand:"7♣ 6♣", code:"76s", open:true, size:"3x", ctx:"neutral", es:"76s entra en el rango MP. Los suited connectors hasta 65s se abren desde MP.", en:"76s is in the MP range. Suited connectors down to 65s are opened from MP." },
  // ── CO opens ─────────────────────────────────────────────────
  { id:49, pos:"CO",  hand:"5♠ 5♦", code:"55",  open:true,  size:"2.5x", ctx:"neutral", es:"55 entra en el rango CO. Con solo BTN y blinds, el potencial de set vale la pena.", en:"55 is in the CO range. With only BTN and blinds behind, set potential is worth it." },
  { id:50, pos:"CO",  hand:"A♣ 7♣", code:"A7s", open:true,  size:"2.5x", ctx:"neutral", es:"A7s entra en el rango CO. Desde UTG/MP es fold pero CO tiene más flexibilidad.", en:"A7s is in the CO range. From UTG/MP it's a fold but CO has more flexibility." },
  { id:51, pos:"CO",  hand:"A♥ 5♥", code:"A5s", open:true,  size:"2.5x", ctx:"neutral", es:"A5s entra en el rango CO. Tiene valor adicional como 3-bet bluff con blocker al as.", en:"A5s is in the CO range. Has extra value as a 3-bet bluff with an ace blocker." },
  { id:52, pos:"CO",  hand:"K♦ 9♦", code:"K9s", open:true,  size:"2.5x", ctx:"neutral", es:"K9s entra en el rango CO. Broadway suited con buen potencial postflop.", en:"K9s is in the CO range. Broadway suited with good postflop potential." },
  { id:53, pos:"CO",  hand:"Q♣ 9♣", code:"Q9s", open:true,  size:"2.5x", ctx:"neutral", es:"Q9s entra en el rango CO. Suited con potencial de flush y straight.", en:"Q9s is in the CO range. Suited with flush and straight potential." },
  { id:54, pos:"CO",  hand:"J♠ 9♠", code:"J9s", open:true,  size:"2.5x", ctx:"neutral", es:"J9s entra en el rango CO. Suited connector con buen potencial postflop.", en:"J9s is in the CO range. Suited connector with good postflop potential." },
  { id:55, pos:"CO",  hand:"9♥ 8♥", code:"98s", open:true,  size:"2.5x", ctx:"neutral", es:"98s entra en el rango CO. Suited connector con excelente potencial.", en:"98s is in the CO range. Suited connector with excellent potential." },
  { id:56, pos:"CO",  hand:"8♣ 7♣", code:"87s", open:true,  size:"2.5x", ctx:"neutral", es:"87s entra en el rango CO. En posición tardía los suited connectors son rentables.", en:"87s is in the CO range. In late position suited connectors are profitable." },
  { id:57, pos:"CO",  hand:"7♦ 6♦", code:"76s", open:true,  size:"2.5x", ctx:"neutral", es:"76s entra en el rango CO. Suited connector bajo pero rentable desde CO.", en:"76s is in the CO range. Low suited connector but profitable from CO." },
  { id:58, pos:"CO",  hand:"A♣ T♥", code:"ATo", open:true,  size:"2.5x", ctx:"neutral", es:"ATo entra en el rango CO. Desde MP es fold pero CO lo permite.", en:"ATo is in the CO range. From MP it's a fold but CO allows it." },
  { id:59, pos:"CO",  hand:"Q♠ J♥", code:"QJo", open:true,  size:"2.5x", ctx:"neutral", es:"QJo entra en el rango CO. Broadway offsuit con buenos outs.", en:"QJo is in the CO range. Broadway offsuit with good outs." },
  { id:60, pos:"CO",  hand:"A♦ 4♦", code:"A4s", open:true,  size:"2.5x", ctx:"nit_btn",  es:"A4s normalmente es fold desde CO, pero con un BTN nit el rango se amplía y A4s suited es apertura rentable.", en:"A4s is normally a fold from CO, but with a nit BTN the range widens and A4s suited becomes a profitable open." },
  // ── CO folds ─────────────────────────────────────────────────
  { id:61, pos:"CO",  hand:"4♥ 4♣", code:"44",  open:true, size:"2.5x", ctx:"neutral", es:"44 entra en el rango CO (~33%). Set mining es rentable desde CO.", en:"44 is in the CO range (~33%). Set mining is profitable from CO." },
  { id:62, pos:"CO",  hand:"A♠ 3♠", code:"A3s", open:true, size:"2.5x", ctx:"neutral", es:"A3s entra en el rango CO. Todos los ases suited se abren desde CO.", en:"A3s is in the CO range. All suited aces are opened from CO." },
  { id:63, pos:"CO",  hand:"K♣ 5♣", code:"K5s", open:false, size:"2.5x", ctx:"neutral", es:"K5s no está en el rango CO siempre. Es explotativo — abre vs rival nit detrás.", en:"K5s is not in the always-open CO range. It's exploitative — open vs a nit behind." },
  { id:64, pos:"CO",  hand:"Q♥ 7♥", code:"Q7s", open:false, size:"2.5x", ctx:"neutral", es:"Q7s está en el rango explotativo de CO (vs rivales débiles). En situación neutral es fold.", en:"Q7s is in the CO exploitative range (vs weak opponents). In neutral situations it's a fold." },
  { id:65, pos:"CO",  hand:"J♦ 7♦", code:"J7s", open:false, size:"2.5x", ctx:"neutral", es:"J7s está en el rango explotativo de CO (vs rivales débiles). En mesa neutral es fold.", en:"J7s is in the CO exploitative range (vs weak opponents). In neutral table it's a fold." },
  { id:66, pos:"CO",  hand:"Q♠ 9♥", code:"Q9o", open:false, size:"2.5x", ctx:"neutral", es:"Q9o no está en el rango CO estándar. Offsuit con kicker media — sigue siendo fold en neutral.", en:"Q9o is not in the standard CO range. Offsuit with medium kicker — still a fold in neutral." },
  { id:67, pos:"CO",  hand:"J♠ 7♠", code:"J7s", open:false, size:"2.5x", ctx:"agg_btn",  es:"J7s no está en el rango CO. Con BTN agresivo que 3-betea el 18%, manos que no están en el rango estándar son fold directo.", en:"J7s is not in the CO range. With an aggressive BTN 3-betting 18%, hands outside the standard range are a direct fold." },
  // ── BTN opens ────────────────────────────────────────────────
  { id:68, pos:"BTN", hand:"4♦ 4♣", code:"44",  open:true,  size:"2.5x", ctx:"neutral", es:"44 entra en el rango BTN. Desde el button todos los pares se abren.", en:"44 is in the BTN range. From the button all pairs are opened." },
  { id:69, pos:"BTN", hand:"3♠ 3♥", code:"33",  open:true,  size:"2.5x", ctx:"neutral", es:"33 entra en el rango BTN. Set mining es rentable en posición.", en:"33 is in the BTN range. Set mining is profitable in position." },
  { id:70, pos:"BTN", hand:"2♣ 2♦", code:"22",  open:true,  size:"2.5x", ctx:"neutral", es:"22 entra en el rango BTN. El par más bajo es apertura válida desde el button.", en:"22 is in the BTN range. The lowest pair is a valid open from the button." },
  { id:71, pos:"BTN", hand:"A♦ 4♦", code:"A4s", open:true,  size:"2.5x", ctx:"neutral", es:"A4s entra en el rango BTN. Todos los ases suited se abren desde el button.", en:"A4s is in the BTN range. All suited aces are opened from the button." },
  { id:72, pos:"BTN", hand:"A♠ 2♠", code:"A2s", open:true,  size:"2.5x", ctx:"neutral", es:"A2s entra en el rango BTN. Incluso el ace-deuce suited abre desde el button.", en:"A2s is in the BTN range. Even ace-deuce suited opens from the button." },
  { id:73, pos:"BTN", hand:"K♣ 7♣", code:"K7s", open:true,  size:"2.5x", ctx:"neutral", es:"K7s entra en el rango BTN. Desde BTN abrimos todos los kings suited (K2s incluido como mínimo K5s siempre).", en:"K7s is in the BTN range. From BTN we open all suited kings (down to K2s, K5s minimum always)." },
  { id:74, pos:"BTN", hand:"Q♠ 8♠", code:"Q8s", open:true,  size:"2.5x", ctx:"neutral", es:"Q8s entra en el rango BTN. Queens suited bajas son apertura desde el button.", en:"Q8s is in the BTN range. Low suited queens are opens from the button." },
  { id:75, pos:"BTN", hand:"J♥ 8♥", code:"J8s", open:true,  size:"2.5x", ctx:"neutral", es:"J8s entra en el rango BTN. Suited connector con buen potencial en posición.", en:"J8s is in the BTN range. Suited connector with good potential in position." },
  { id:76, pos:"BTN", hand:"T♣ 8♣", code:"T8s", open:true,  size:"2.5x", ctx:"neutral", es:"T8s entra en el rango BTN. Suited connector rentable desde el button.", en:"T8s is in the BTN range. Profitable suited connector from the button." },
  { id:77, pos:"BTN", hand:"T♦ 7♦", code:"T7s", open:true,  size:"2.5x", ctx:"neutral", es:"T7s entra en el rango BTN. Suited gapper jugable desde el button.", en:"T7s is in the BTN range. Playable suited gapper from the button." },
  { id:78, pos:"BTN", hand:"9♠ 7♠", code:"97s", open:true,  size:"2.5x", ctx:"neutral", es:"97s entra en el rango BTN. Suited gapper con potencial de straight y flush.", en:"97s is in the BTN range. Suited gapper with straight and flush potential." },
  { id:79, pos:"BTN", hand:"8♥ 6♥", code:"86s", open:true,  size:"2.5x", ctx:"neutral", es:"86s entra en el rango BTN. Suited connector bajo pero rentable en posición.", en:"86s is in the BTN range. Low suited connector but profitable in position." },
  { id:80, pos:"BTN", hand:"7♣ 5♣", code:"75s", open:true,  size:"2.5x", ctx:"neutral", es:"75s entra en el rango BTN. Suited connector que se juega bien en posición.", en:"75s is in the BTN range. Suited connector that plays well in position." },
  { id:81, pos:"BTN", hand:"6♦ 4♦", code:"64s", open:true,  size:"2.5x", ctx:"neutral", es:"64s entra en el rango BTN. Desde el button los suited gappers bajos son aperturas.", en:"64s is in the BTN range. From the button low suited gappers are opens." },
  { id:82, pos:"BTN", hand:"5♠ 3♠", code:"53s", open:true,  size:"2.5x", ctx:"neutral", es:"53s entra en el rango BTN. Suited connector muy bajo pero apertura válida desde el button.", en:"53s is in the BTN range. Very low suited connector but valid open from the button." },
  { id:83, pos:"BTN", hand:"A♥ 9♥", code:"A9o", open:true,  size:"2.5x", ctx:"neutral", es:"A9o entra en el rango BTN. Ace offsuit con kicker alta es apertura desde el button.", en:"A9o is in the BTN range. Offsuit ace with high kicker is an open from the button." },
  { id:84, pos:"BTN", hand:"K♦ T♥", code:"KTo", open:true,  size:"2.5x", ctx:"neutral", es:"KTo entra en el rango BTN. Broadway offsuit de buena fuerza.", en:"KTo is in the BTN range. Good strength broadway offsuit." },
  { id:85, pos:"BTN", hand:"Q♣ T♦", code:"QTo", open:true,  size:"2.5x", ctx:"neutral", es:"QTo entra en el rango BTN. Broadway offsuit que abre desde el button.", en:"QTo is in the BTN range. Broadway offsuit that opens from the button." },
  { id:86, pos:"BTN", hand:"7♠ 4♠", code:"74s", open:true,  size:"2.5x", ctx:"nit_blind", es:"74s está en el rango BTN. Con nits en los blinds que foldean mucho, incluso los suited connectors bajos son aperturas claras.", en:"74s is in the BTN range. With nits in the blinds who fold a lot, even low suited connectors are clear opens." },
  // ── BTN folds ────────────────────────────────────────────────
  { id:87, pos:"BTN", hand:"J♠ 3♠", code:"J3s", open:false, size:"2.5x", ctx:"neutral", es:"J3s no está en el rango BTN. El gapper es demasiado grande para ser jugable.", en:"J3s is not in the BTN range. The gap is too large to be playable." },
  { id:88, pos:"BTN", hand:"T♥ 3♥", code:"T3s", open:false, size:"2.5x", ctx:"neutral", es:"T3s no está en el rango BTN. Gapper demasiado grande.", en:"T3s is not in the BTN range. Gap too large." },
  { id:89, pos:"BTN", hand:"9♦ 3♦", code:"93s", open:false, size:"2.5x", ctx:"neutral", es:"93s no está en el rango BTN. El gapper hace esta mano injugable.", en:"93s is not in the BTN range. The gap makes this hand unplayable." },
  { id:90, pos:"BTN", hand:"K♣ 2♥", code:"K2o", open:false, size:"2.5x", ctx:"neutral", es:"K2o no está en el rango BTN. King offsuit necesita kicker más alta para abrir.", en:"K2o is not in the BTN range. Offsuit king needs a higher kicker to open." },
  { id:91, pos:"BTN", hand:"Q♠ 2♥", code:"Q2o", open:false, size:"2.5x", ctx:"neutral", es:"Q2o no está en el rango BTN. Queen offsuit con kicker muy baja no es apertura.", en:"Q2o is not in the BTN range. Queen offsuit with very low kicker is not an open." },
  { id:92, pos:"BTN", hand:"8♣ 2♣", code:"82s", open:false, size:"2.5x", ctx:"neutral", es:"82s no está en el rango BTN. Demasiado débil incluso desde el button.", en:"82s is not in the BTN range. Too weak even from the button." },
  // ── SB opens ─────────────────────────────────────────────────
  { id:93,  pos:"SB", hand:"3♣ 3♦", code:"33",  open:true,  size:"3x", ctx:"neutral",    es:"33 entra en el rango SB vs BB. Todos los pares se abren heads-up desde SB.", en:"33 is in the SB range vs BB. All pairs are opened heads-up from SB." },
  { id:94,  pos:"SB", hand:"2♠ 2♥", code:"22",  open:true,  size:"3x", ctx:"neutral",    es:"22 entra en el rango SB vs BB. Set mining es rentable incluso heads-up.", en:"22 is in the SB range vs BB. Set mining is profitable even heads-up." },
  { id:95,  pos:"SB", hand:"A♣ 5♣", code:"A5s", open:true,  size:"3x", ctx:"neutral",    es:"A5s entra en el rango SB. Todos los ases suited se abren desde SB vs BB.", en:"A5s is in the SB range. All suited aces are opened from SB vs BB." },
  { id:96,  pos:"SB", hand:"A♦ 3♦", code:"A3s", open:true,  size:"3x", ctx:"neutral",    es:"A3s entra en el rango SB vs BB. Buen blocker y potencial de flush.", en:"A3s is in the SB range vs BB. Good blocker and flush potential." },
  { id:97,  pos:"SB", hand:"K♠ 8♠", code:"K8s", open:true,  size:"3x", ctx:"neutral",    es:"K8s entra en el rango SB. Desde SB se abren todos los kings suited.", en:"K8s is in the SB range. From SB all suited kings are opened." },
  { id:98,  pos:"SB", hand:"K♥ 7♥", code:"K7s", open:true,  size:"3x", ctx:"neutral",    es:"K7s entra en el rango SB. Desde SB abrimos todos los kings suited incluido K2s.", en:"K7s is in the SB range. From SB we open all suited kings including K2s." },
  { id:99,  pos:"SB", hand:"J♣ 8♣", code:"J8s", open:true,  size:"3x", ctx:"neutral",    es:"J8s entra en el rango SB. Suited connector con buen potencial postflop.", en:"J8s is in the SB range. Suited connector with good postflop potential." },
  { id:100, pos:"SB", hand:"T♠ 8♠", code:"T8s", open:true,  size:"3x", ctx:"neutral",    es:"T8s entra en el rango SB. Suited connector rentable desde SB vs BB.", en:"T8s is in the SB range. Profitable suited connector from SB vs BB." },
  { id:101, pos:"SB", hand:"8♥ 6♥", code:"86s", open:true,  size:"3x", ctx:"neutral",    es:"86s entra en el rango SB. Suited connector bajo pero jugable heads-up.", en:"86s is in the SB range. Low suited connector but playable heads-up." },
  { id:102, pos:"SB", hand:"K♣ 9♥", code:"K9o", open:true,  size:"3x", ctx:"neutral",    es:"K9o entra en el rango SB vs BB. Offsuit con buena kicker para jugar heads-up.", en:"K9o is in the SB range vs BB. Offsuit with a good kicker for heads-up play." },
  { id:103, pos:"SB", hand:"Q♠ T♠", code:"QTs", open:true,  size:"3x", ctx:"passive_bb", es:"QTs entra en el rango SB. Con un BB pasivo que raramente 3-betea, ampliar el rango ofensivo es correcto.", en:"QTs is in the SB range. With a passive BB who rarely 3-bets, widening the offensive range is correct." },
  // ── SB folds ─────────────────────────────────────────────────
  { id:104, pos:"SB", hand:"T♥ 3♥", code:"T3s", open:false, size:"3x", ctx:"neutral",    es:"T3s no está en el rango SB (T4s-T2s excluidos explícitamente).", en:"T3s is not in the SB range (T4s-T2s explicitly excluded)." },
  { id:105, pos:"SB", hand:"4♠ 3♠", code:"43s", open:false, size:"3x", ctx:"neutral",    es:"43s no está en el rango SB (43s-42s excluidos explícitamente).", en:"43s is not in the SB range (43s-42s explicitly excluded)." },
  { id:106, pos:"SB", hand:"J♦ 2♦", code:"J2s", open:false, size:"3x", ctx:"neutral",   es:"J2s no está en el rango SB (J3s-J2s excluidos explícitamente).", en:"J2s is not in the SB range (J3s-J2s explicitly excluded)." },
  { id:107, pos:"SB", hand:"T♦ 3♦", code:"T3s", open:false, size:"3x", ctx:"neutral",   es:"T3s no está en el rango SB. Demasiado débil incluso heads-up.", en:"T3s is not in the SB range. Too weak even heads-up." },
  { id:108, pos:"SB", hand:"K♠ 2♣", code:"K2o", open:false, size:"3x", ctx:"neutral",   es:"K2o no está en el rango SB. King offsuit necesita al menos K9o para abrir.", en:"K2o is not in the SB range. Offsuit king needs at least K9o to open." },
  { id:109, pos:"SB", hand:"Q♥ 3♠", code:"Q3o", open:false, size:"3x", ctx:"neutral",   es:"Q3o no está en el rango SB. Queen offsuit con kicker muy baja es fold.", en:"Q3o is not in the SB range. Queen offsuit with very low kicker is a fold." },
  { id:110, pos:"SB", hand:"9♣ 2♣", code:"92s", open:false, size:"3x", ctx:"neutral",   es:"92s no está en el rango SB. El gap de 7 cartas hace esta mano muy débil incluso heads-up.", en:"92s is not in the SB range. The 7-card gap makes this hand too weak even heads-up." },
];

// ─── ISO SITUATIONS ──────────────────────────────────────────────────────────
// type:"iso" — open=true → should ISO raise; open=false → should fold
// limpers: number of limpers (determines correct size: 1→4BB, 2→5BB)

const ISO_SITUATIONS = [
  // ── BTN ISO 1 limper — should ISO (25) ───────────────────────────────────
  {id:201,type:"iso",pos:"BTN",hand:"A♠ A♦",code:"AA", open:true, limpers:1,ctx:"limper_utg_fish",es:"AA siempre ISO. Con posición y limper fish, sube a 4BB para construir el bote.",en:"AA always ISOs. With position and a fish limper, raise to 4BB to build the pot."},
  {id:202,type:"iso",pos:"BTN",hand:"K♥ K♣",code:"KK", open:true, limpers:1,ctx:"limper_mp_fish", es:"KK ISO siempre desde BTN. El limper tiene rango capped — nunca tiene AA o KK.",en:"KK always ISOs from BTN. The limper has a capped range — they never have AA or KK."},
  {id:203,type:"iso",pos:"BTN",hand:"Q♠ Q♥",code:"QQ", open:true, limpers:1,ctx:"limper_utg_fish",es:"QQ ISO siempre. Con posición y limper fish, 4BB es el tamaño correcto.",en:"QQ always ISOs. With position and a fish limper, 4BB is correct."},
  {id:204,type:"iso",pos:"BTN",hand:"J♦ J♣",code:"JJ", open:true, limpers:1,ctx:"limper_mp_fish", es:"JJ ISO desde BTN. El rango del limper es débil y capped. Sube a 4BB.",en:"JJ ISOs from BTN. The limper's range is weak and capped. Raise to 4BB."},
  {id:205,type:"iso",pos:"BTN",hand:"T♠ T♥",code:"TT", open:true, limpers:1,ctx:"limper_utg_fish",es:"TT ISO desde BTN vs limper fish. Posición + iniciativa = ventaja enorme.",en:"TT ISOs from BTN vs fish limper. Position + initiative = huge edge."},
  {id:206,type:"iso",pos:"BTN",hand:"9♣ 9♦",code:"99", open:true, limpers:1,ctx:"limper_mp_fish", es:"99 ISO desde BTN. El rango del limper está capped y tus 9s son overpair probable en muchos flops.",en:"99 ISOs from BTN. The limper's range is capped and nines are likely an overpair on many flops."},
  {id:207,type:"iso",pos:"BTN",hand:"8♥ 8♦",code:"88", open:true, limpers:1,ctx:"limper_utg_fish",es:"88 ISO desde BTN. Set mining y valor de overpair con posición.",en:"88 ISOs from BTN. Set mining and overpair value with position."},
  {id:208,type:"iso",pos:"BTN",hand:"7♠ 7♣",code:"77", open:true, limpers:1,ctx:"limper_mp_fish", es:"77 ISO desde BTN. Set potential con rango limper capped.",en:"77 ISOs from BTN. Set potential with the limper's capped range."},
  {id:209,type:"iso",pos:"BTN",hand:"6♦ 6♥",code:"66", open:true, limpers:1,ctx:"limper_utg_fish",es:"66 ISO desde BTN vs limper fish. Set mining en posición es rentable.",en:"66 ISOs from BTN vs fish limper. Set mining in position is profitable."},
  {id:210,type:"iso",pos:"BTN",hand:"5♣ 5♦",code:"55", open:true, limpers:1,ctx:"limper_mp_fish", es:"55 ISO desde BTN. Todos los pares ISO desde BTN con 1 limper.",en:"55 ISOs from BTN. All pairs ISO from BTN with 1 limper."},
  {id:211,type:"iso",pos:"BTN",hand:"4♠ 4♥",code:"44", open:true, limpers:1,ctx:"limper_utg_fish",es:"44 ISO desde BTN vs limper fish. Todos los pares ISO desde BTN.",en:"44 ISOs from BTN vs fish limper. All pairs ISO from BTN."},
  {id:212,type:"iso",pos:"BTN",hand:"3♦ 3♣",code:"33", open:true, limpers:1,ctx:"limper_mp_fish", es:"33 ISO desde BTN. Set mining en posición con implied odds del fish.",en:"33 ISOs from BTN. Set mining in position with implied odds from the fish."},
  {id:213,type:"iso",pos:"BTN",hand:"2♠ 2♥",code:"22", open:true, limpers:1,ctx:"limper_utg_fish",es:"22 ISO desde BTN. Incluso el par más bajo ISO vs 1 limper fish.",en:"22 ISOs from BTN. Even the lowest pair ISOs vs 1 fish limper."},
  {id:214,type:"iso",pos:"BTN",hand:"A♣ K♣",code:"AKs",open:true, limpers:1,ctx:"limper_mp_fish", es:"AKs ISO desde BTN. Mano premium con posición vs limper capped. ISO 4BB.",en:"AKs ISOs from BTN. Premium hand with position vs capped limper. ISO 4BB."},
  {id:215,type:"iso",pos:"BTN",hand:"A♦ Q♦",code:"AQs",open:true, limpers:1,ctx:"limper_co_fish", es:"AQs ISO desde BTN. Excelente equidad y posición. ISO a 4BB.",en:"AQs ISOs from BTN. Excellent equity and position. ISO to 4BB."},
  {id:216,type:"iso",pos:"BTN",hand:"A♠ 7♠",code:"A7s",open:true, limpers:1,ctx:"limper_utg_fish",es:"A7s ISO desde BTN (~50%). Suited ace con posición vs limper fish. ISO a 4BB.",en:"A7s ISOs from BTN (~50%). Suited ace with position vs fish limper. ISO to 4BB."},
  {id:217,type:"iso",pos:"BTN",hand:"A♥ 4♥",code:"A4s",open:true, limpers:1,ctx:"limper_mp_fish", es:"A4s ISO desde BTN. Todos los ases suited ISO desde BTN vs 1 limper.",en:"A4s ISOs from BTN. All suited aces ISO from BTN vs 1 limper."},
  {id:218,type:"iso",pos:"BTN",hand:"A♦ 2♦",code:"A2s",open:true, limpers:1,ctx:"limper_utg_fish",es:"A2s ISO desde BTN. Incluso el ace-deuce suited ISO desde BTN vs limper fish.",en:"A2s ISOs from BTN. Even ace-deuce suited ISOs from BTN vs fish limper."},
  {id:219,type:"iso",pos:"BTN",hand:"K♣ Q♥",code:"KQo",open:true, limpers:1,ctx:"limper_mp_fish", es:"KQo ISO desde BTN. Broadway offsuit con posición vs limper capped.",en:"KQo ISOs from BTN. Broadway offsuit with position vs capped limper."},
  {id:220,type:"iso",pos:"BTN",hand:"Q♠ 8♠",code:"Q8s",open:true, limpers:1,ctx:"limper_utg_fish",es:"Q8s ISO desde BTN. Queens suited hasta Q7s son ISO desde BTN vs 1 limper.",en:"Q8s ISOs from BTN. Suited queens down to Q7s are ISOs from BTN vs 1 limper."},
  {id:221,type:"iso",pos:"BTN",hand:"J♥ 7♥",code:"J7s",open:true, limpers:1,ctx:"limper_mp_fish", es:"J7s ISO desde BTN. Suited con potencial de straight y flush. En rango BTN ISO.",en:"J7s ISOs from BTN. Suited with straight and flush potential. In BTN ISO range."},
  {id:222,type:"iso",pos:"BTN",hand:"T♣ 8♣",code:"T8s",open:true, limpers:1,ctx:"limper_co_fish", es:"T8s ISO desde BTN. Suited connector con excelente potencial postflop.",en:"T8s ISOs from BTN. Suited connector with excellent postflop potential."},
  {id:223,type:"iso",pos:"BTN",hand:"7♦ 5♦",code:"75s",open:true, limpers:1,ctx:"limper_utg_fish",es:"75s ISO desde BTN. Suited connector bajo pero en rango BTN ISO vs 1 limper.",en:"75s ISOs from BTN. Low suited connector but in the BTN ISO range vs 1 limper."},
  {id:224,type:"iso",pos:"BTN",hand:"6♣ 3♣",code:"63s",open:true, limpers:1,ctx:"limper_mp_fish", es:"63s ISO desde BTN. Al límite del rango BTN ISO, pero con limper fish y posición es rentable.",en:"63s ISOs from BTN. At the edge of the BTN ISO range, but profitable with a fish limper and position."},
  {id:225,type:"iso",pos:"BTN",hand:"5♠ 3♠",code:"53s",open:true, limpers:1,ctx:"limper_utg_fish",es:"53s ISO desde BTN. Suited connector muy bajo pero en rango BTN ISO vs 1 limper fish.",en:"53s ISOs from BTN. Very low suited connector but in the BTN ISO range vs 1 fish limper."},
  // ── BTN ISO 1 limper — should fold (5) ───────────────────────────────────
  {id:226,type:"iso",pos:"BTN",hand:"J♠ 3♠",code:"J3s",open:false,limpers:1,ctx:"limper_utg_fish",es:"J3s no está en el rango BTN ISO. El gapper es demasiado grande — foldea incluso vs limper fish.",en:"J3s is not in the BTN ISO range. The gap is too large — fold even vs a fish limper."},
  {id:227,type:"iso",pos:"BTN",hand:"T♥ 3♥",code:"T3s",open:false,limpers:1,ctx:"limper_mp_fish", es:"T3s no está en el rango BTN ISO. Demasiado débil incluso desde el button.",en:"T3s is not in the BTN ISO range. Too weak even from the button."},
  {id:228,type:"iso",pos:"BTN",hand:"9♦ 3♦",code:"93s",open:false,limpers:1,ctx:"limper_utg_fish",es:"93s no está en el rango BTN ISO. Suited con gap demasiado grande.",en:"93s is not in the BTN ISO range. Suited with a gap too large."},
  {id:229,type:"iso",pos:"BTN",hand:"K♣ 2♥",code:"K2o",open:false,limpers:1,ctx:"limper_mp_fish", es:"K2o no está en el rango BTN ISO. King offsuit necesita kicker mínima K9o.",en:"K2o is not in the BTN ISO range. Offsuit king needs at least K9o."},
  {id:230,type:"iso",pos:"BTN",hand:"8♠ 2♦",code:"82o",open:false,limpers:1,ctx:"limper_utg_fish",es:"82o no está en ningún rango de ISO. Demasiado débil desde cualquier posición.",en:"82o is not in any ISO range. Too weak from any position."},
  // ── CO ISO 1 limper — should ISO (15) ────────────────────────────────────
  {id:231,type:"iso",pos:"CO", hand:"A♠ A♥",code:"AA", open:true, limpers:1,ctx:"limper_utg_fish",es:"AA ISO desde CO siempre. ISO a 4BB.",en:"AA always ISOs from CO. ISO to 4BB."},
  {id:232,type:"iso",pos:"CO", hand:"K♦ K♣",code:"KK", open:true, limpers:1,ctx:"limper_mp_fish", es:"KK ISO desde CO. Mano premium, ISO a 4BB.",en:"KK ISOs from CO. Premium hand, ISO to 4BB."},
  {id:233,type:"iso",pos:"CO", hand:"J♠ J♦",code:"JJ", open:true, limpers:1,ctx:"limper_utg_fish",es:"JJ ISO desde CO. Overpair probable con posición y limper capped.",en:"JJ ISOs from CO. Likely overpair with position and capped limper."},
  {id:234,type:"iso",pos:"CO", hand:"T♥ T♣",code:"TT", open:true, limpers:1,ctx:"limper_mp_fish", es:"TT ISO desde CO. En rango CO ISO, sube a 4BB vs limper fish.",en:"TT ISOs from CO. In the CO ISO range, raise to 4BB vs fish limper."},
  {id:235,type:"iso",pos:"CO", hand:"8♠ 8♦",code:"88", open:true, limpers:1,ctx:"limper_utg_fish",es:"88 ISO desde CO. Set mining con posición vs limper fish.",en:"88 ISOs from CO. Set mining with position vs fish limper."},
  {id:236,type:"iso",pos:"CO", hand:"6♣ 6♥",code:"66", open:true, limpers:1,ctx:"limper_mp_fish", es:"66 ISO desde CO. Pares desde 44 en adelante ISO desde CO vs 1 limper.",en:"66 ISOs from CO. Pairs from 44 up ISO from CO vs 1 limper."},
  {id:237,type:"iso",pos:"CO", hand:"4♦ 4♣",code:"44", open:true, limpers:1,ctx:"limper_utg_fish",es:"44 ISO desde CO. Al límite del rango CO ISO, pero set mining vs fish con posición es rentable.",en:"44 ISOs from CO. At the edge of the CO ISO range, but set mining vs fish with position is profitable."},
  {id:238,type:"iso",pos:"CO", hand:"A♣ K♣",code:"AKs",open:true, limpers:1,ctx:"limper_mp_fish", es:"AKs ISO desde CO. Mano premium suited, ISO claro a 4BB.",en:"AKs ISOs from CO. Premium suited hand, clear ISO to 4BB."},
  {id:239,type:"iso",pos:"CO", hand:"A♦ Q♦",code:"AQs",open:true, limpers:1,ctx:"limper_utg_fish",es:"AQs ISO desde CO. Excelente equidad y posición vs limper capped.",en:"AQs ISOs from CO. Excellent equity and position vs capped limper."},
  {id:240,type:"iso",pos:"CO", hand:"A♠ 8♠",code:"A8s",open:true, limpers:1,ctx:"limper_mp_fish", es:"A8s ISO desde CO. Suited ace en rango CO ISO — sube a 4BB.",en:"A8s ISOs from CO. Suited ace in CO ISO range — raise to 4BB."},
  {id:241,type:"iso",pos:"CO", hand:"A♥ 5♥",code:"A5s",open:true, limpers:1,ctx:"limper_utg_fish",es:"A5s ISO desde CO. Suited ace con valor de blocker al as.",en:"A5s ISOs from CO. Suited ace with ace blocker value."},
  {id:242,type:"iso",pos:"CO", hand:"K♣ T♣",code:"KTs",open:true, limpers:1,ctx:"limper_mp_fish", es:"KTs ISO desde CO. Broadway suited con buen potencial postflop.",en:"KTs ISOs from CO. Broadway suited with good postflop potential."},
  {id:243,type:"iso",pos:"CO", hand:"Q♠ 9♠",code:"Q9s",open:true, limpers:1,ctx:"limper_utg_fish",es:"Q9s ISO desde CO. Suited con flush y straight potential. En rango CO ISO.",en:"Q9s ISOs from CO. Suited with flush and straight potential. In CO ISO range."},
  {id:244,type:"iso",pos:"CO", hand:"J♦ T♦",code:"JTs",open:true, limpers:1,ctx:"limper_mp_fish", es:"JTs ISO desde CO. Suited connector de primer nivel con posición.",en:"JTs ISOs from CO. Top-tier suited connector with position."},
  {id:245,type:"iso",pos:"CO", hand:"T♣ 9♣",code:"T9s",open:true, limpers:1,ctx:"limper_utg_fish",es:"T9s ISO desde CO. Suited connector en rango CO ISO. Sube a 4BB.",en:"T9s ISOs from CO. Suited connector in CO ISO range. Raise to 4BB."},
  // ── CO ISO 1 limper — should fold (10) ───────────────────────────────────
  {id:246,type:"iso",pos:"CO", hand:"3♠ 3♥",code:"33", open:false,limpers:1,ctx:"limper_utg_fish",es:"33 no está en el rango CO ISO (empieza en 44). Foldea incluso vs limper fish.",en:"33 is not in the CO ISO range (starts at 44). Fold even vs a fish limper."},
  {id:247,type:"iso",pos:"CO", hand:"2♦ 2♣",code:"22", open:false,limpers:1,ctx:"limper_mp_fish", es:"22 no está en el rango CO ISO. Desde CO el mínimo par para ISO es 44.",en:"22 is not in the CO ISO range. From CO the minimum pair for ISO is 44."},
  {id:248,type:"iso",pos:"CO", hand:"A♠ 3♠",code:"A3s",open:false,limpers:1,ctx:"limper_utg_fish",es:"A3s no está en el rango CO ISO (mínimo A4s). Foldea desde CO.",en:"A3s is not in the CO ISO range (minimum A4s). Fold from CO."},
  {id:249,type:"iso",pos:"CO", hand:"K♥ 5♥",code:"K5s",open:false,limpers:1,ctx:"limper_mp_fish", es:"K5s no está en el rango CO ISO (mínimo K8s). Foldea.",en:"K5s is not in the CO ISO range (minimum K8s). Fold."},
  {id:250,type:"iso",pos:"CO", hand:"Q♦ 7♦",code:"Q7s",open:false,limpers:1,ctx:"limper_utg_fish",es:"Q7s no está en el rango CO ISO (mínimo Q8s). Demasiado débil desde CO.",en:"Q7s is not in the CO ISO range (minimum Q8s). Too weak from CO."},
  {id:251,type:"iso",pos:"CO", hand:"J♣ 6♣",code:"J6s",open:false,limpers:1,ctx:"limper_mp_fish", es:"J6s no está en el rango CO ISO. Jack suited necesita J8s+ para ISO desde CO.",en:"J6s is not in the CO ISO range. Suited jacks need J8s+ to ISO from CO."},
  {id:252,type:"iso",pos:"CO", hand:"T♠ 6♠",code:"T6s",open:false,limpers:1,ctx:"limper_utg_fish",es:"T6s no está en el rango CO ISO (mínimo T7s). Foldea.",en:"T6s is not in the CO ISO range (minimum T7s). Fold."},
  {id:253,type:"iso",pos:"CO", hand:"9♥ 5♥",code:"95s",open:false,limpers:1,ctx:"limper_mp_fish", es:"95s no está en el rango CO ISO (mínimo 96s). Demasiado especulativo.",en:"95s is not in the CO ISO range (minimum 96s). Too speculative."},
  {id:254,type:"iso",pos:"CO", hand:"Q♣ 9♥",code:"Q9o",open:false,limpers:1,ctx:"limper_utg_fish",es:"Q9o no está en el rango CO ISO. Offsuit con kicker media no justifica el ISO desde CO.",en:"Q9o is not in the CO ISO range. Offsuit with medium kicker doesn't justify ISO from CO."},
  {id:255,type:"iso",pos:"CO", hand:"J♦ 8♣",code:"J8o",open:false,limpers:1,ctx:"limper_mp_fish", es:"J8o no está en el rango CO ISO. Offsuit gapper es fold desde CO.",en:"J8o is not in the CO ISO range. Offsuit gapper is a fold from CO."},
  // ── MP ISO 1 limper — should ISO (10) ────────────────────────────────────
  {id:256,type:"iso",pos:"MP", hand:"A♠ A♣",code:"AA", open:true, limpers:1,ctx:"limper_utg_fish",es:"AA ISO desde MP siempre. Sube a 4BB y construye bote con la mejor mano.",en:"AA always ISOs from MP. Raise to 4BB and build the pot with the best hand."},
  {id:257,type:"iso",pos:"MP", hand:"K♠ K♥",code:"KK", open:true, limpers:1,ctx:"limper_utg_fish",es:"KK ISO desde MP. Mano premium, ISO a 4BB.",en:"KK ISOs from MP. Premium hand, ISO to 4BB."},
  {id:258,type:"iso",pos:"MP", hand:"Q♦ Q♣",code:"QQ", open:true, limpers:1,ctx:"limper_utg_fish",es:"QQ ISO desde MP. Overpair con posición relativa buena vs limper.",en:"QQ ISOs from MP. Overpair with good relative position vs limper."},
  {id:259,type:"iso",pos:"MP", hand:"9♠ 9♦",code:"99", open:true, limpers:1,ctx:"limper_utg_fish",es:"99 ISO desde MP. En rango MP ISO, sube a 4BB vs limper fish.",en:"99 ISOs from MP. In the MP ISO range, raise to 4BB vs fish limper."},
  {id:260,type:"iso",pos:"MP", hand:"7♥ 7♣",code:"77", open:true, limpers:1,ctx:"limper_utg_fish",es:"77 ISO desde MP. Set mining y potencial de overpair con posición relativa.",en:"77 ISOs from MP. Set mining and overpair potential with relative position."},
  {id:261,type:"iso",pos:"MP", hand:"5♦ 5♣",code:"55", open:true, limpers:1,ctx:"limper_utg_fish",es:"55 ISO desde MP. Al límite del rango MP ISO. Set mining vs fish es rentable.",en:"55 ISOs from MP. At the edge of the MP ISO range. Set mining vs fish is profitable."},
  {id:262,type:"iso",pos:"MP", hand:"A♣ K♣",code:"AKs",open:true, limpers:1,ctx:"limper_utg_fish",es:"AKs ISO desde MP siempre. Mano premium suited.",en:"AKs always ISOs from MP. Premium suited hand."},
  {id:263,type:"iso",pos:"MP", hand:"A♠ J♠",code:"AJs",open:true, limpers:1,ctx:"limper_utg_fish",es:"AJs ISO desde MP. En rango MP ISO (AKs-A7s), sube a 4BB.",en:"AJs ISOs from MP. In MP ISO range (AKs-A7s), raise to 4BB."},
  {id:264,type:"iso",pos:"MP", hand:"A♦ 9♦",code:"A9s",open:true, limpers:1,ctx:"limper_utg_fish",es:"A9s ISO desde MP. Suited ace en rango MP ISO.",en:"A9s ISOs from MP. Suited ace in MP ISO range."},
  {id:265,type:"iso",pos:"MP", hand:"K♥ Q♥",code:"KQs",open:true, limpers:1,ctx:"limper_utg_fish",es:"KQs ISO desde MP. Broadway suited con buena equidad vs limper capped.",en:"KQs ISOs from MP. Broadway suited with good equity vs capped limper."},
  // ── MP ISO 1 limper — should fold (10) ───────────────────────────────────
  {id:266,type:"iso",pos:"MP", hand:"4♣ 4♦",code:"44", open:false,limpers:1,ctx:"limper_utg_fish",es:"44 no está en el rango MP ISO (empieza en 55). Con jugadores por detrás, 44 es fold.",en:"44 is not in the MP ISO range (starts at 55). With players behind, 44 is a fold."},
  {id:267,type:"iso",pos:"MP", hand:"3♠ 3♦",code:"33", open:false,limpers:1,ctx:"limper_utg_fish",es:"33 no está en el rango MP ISO. Necesitas CO o BTN para ISO estos pares pequeños.",en:"33 is not in the MP ISO range. You need CO or BTN to ISO these small pairs."},
  {id:268,type:"iso",pos:"MP", hand:"A♥ 6♥",code:"A6s",open:false,limpers:1,ctx:"limper_utg_fish",es:"A6s no está en el rango MP ISO (mínimo A7s). Foldea desde MP.",en:"A6s is not in the MP ISO range (minimum A7s). Fold from MP."},
  {id:269,type:"iso",pos:"MP", hand:"A♦ 5♦",code:"A5s",open:false,limpers:1,ctx:"limper_utg_fish",es:"A5s no está en el rango MP ISO. Los ases bajos suited entran desde CO.",en:"A5s is not in the MP ISO range. Low suited aces enter from CO."},
  {id:270,type:"iso",pos:"MP", hand:"K♠ 8♠",code:"K8s",open:false,limpers:1,ctx:"limper_utg_fish",es:"K8s no está en el rango MP ISO (mínimo K9s). Foldea.",en:"K8s is not in the MP ISO range (minimum K9s). Fold."},
  {id:271,type:"iso",pos:"MP", hand:"Q♣ 8♣",code:"Q8s",open:false,limpers:1,ctx:"limper_utg_fish",es:"Q8s no está en el rango MP ISO (mínimo Q9s). Demasiado débil desde MP.",en:"Q8s is not in the MP ISO range (minimum Q9s). Too weak from MP."},
  {id:272,type:"iso",pos:"MP", hand:"T♠ 6♠",code:"T6s",open:false,limpers:1,ctx:"limper_utg_fish",es:"T6s no está en el rango MP ISO. Suited connector bajo necesita posición tardía.",en:"T6s is not in the MP ISO range. Low suited connector needs late position."},
  {id:273,type:"iso",pos:"MP", hand:"8♦ 6♦",code:"86s",open:false,limpers:1,ctx:"limper_utg_fish",es:"86s no está en el rango MP ISO. Suited gapper que necesita CO o BTN.",en:"86s is not in the MP ISO range. Suited gapper that needs CO or BTN."},
  {id:274,type:"iso",pos:"MP", hand:"K♣ T♥",code:"KTo",open:false,limpers:1,ctx:"limper_utg_fish",es:"KTo no está en el rango MP ISO (solo KQo y KJo offsuit). Foldea.",en:"KTo is not in the MP ISO range (only KQo and KJo offsuit). Fold."},
  {id:275,type:"iso",pos:"MP", hand:"A♠ 8♣",code:"A8o",open:false,limpers:1,ctx:"limper_utg_fish",es:"A8o no está en el rango MP ISO (mínimo offsuit ATo). Foldea.",en:"A8o is not in the MP ISO range (minimum offsuit ATo). Fold."},
  // ── BTN ISO 2 limpers — should ISO (10) ──────────────────────────────────
  {id:276,type:"iso",pos:"BTN",hand:"A♣ A♦",code:"AA", open:true, limpers:2,ctx:"limpers_2_fish",es:"AA ISO a 5BB con 2 limpers. Construyes un bote grande con la mejor mano.",en:"AA ISOs to 5BB with 2 limpers. Build a big pot with the best hand."},
  {id:277,type:"iso",pos:"BTN",hand:"Q♠ Q♦",code:"QQ", open:true, limpers:2,ctx:"limpers_2_fish",es:"QQ ISO a 5BB con 2 limpers. Mano premium, construye el bote con 2 fish.",en:"QQ ISOs to 5BB with 2 limpers. Premium hand, build the pot with 2 fish."},
  {id:278,type:"iso",pos:"BTN",hand:"T♠ T♦",code:"TT", open:true, limpers:2,ctx:"limpers_2_fish",es:"TT ISO a 5BB con 2 limpers. Overpair probable, posición y 2 rangos capped.",en:"TT ISOs to 5BB with 2 limpers. Likely overpair, position and 2 capped ranges."},
  {id:279,type:"iso",pos:"BTN",hand:"8♣ 8♦",code:"88", open:true, limpers:2,ctx:"limpers_2_fish",es:"88 ISO a 5BB con 2 limpers. Set mining con implied odds x2 y posición.",en:"88 ISOs to 5BB with 2 limpers. Set mining with x2 implied odds and position."},
  {id:280,type:"iso",pos:"BTN",hand:"6♠ 6♥",code:"66", open:true, limpers:2,ctx:"limpers_2_mix", es:"66 ISO a 5BB con 2 limpers. Set mining en posición contra 2 rangos débiles.",en:"66 ISOs to 5BB with 2 limpers. Set mining in position against 2 weak ranges."},
  {id:281,type:"iso",pos:"BTN",hand:"A♦ K♦",code:"AKs",open:true, limpers:2,ctx:"limpers_2_fish",es:"AKs ISO a 5BB con 2 limpers. Mano premium, maximiza el valor con los 2 fish.",en:"AKs ISOs to 5BB with 2 limpers. Premium hand, maximize value with both fish."},
  {id:282,type:"iso",pos:"BTN",hand:"A♥ Q♥",code:"AQs",open:true, limpers:2,ctx:"limpers_2_fish",es:"AQs ISO a 5BB con 2 limpers. Excelente equidad vs 2 rangos capped.",en:"AQs ISOs to 5BB with 2 limpers. Excellent equity vs 2 capped ranges."},
  {id:283,type:"iso",pos:"BTN",hand:"A♠ 7♠",code:"A7s",open:true, limpers:2,ctx:"limpers_2_fish",es:"A7s ISO a 5BB con 2 limpers. Suited ace en rango BTN 2L ISO.",en:"A7s ISOs to 5BB with 2 limpers. Suited ace in BTN 2L ISO range."},
  {id:284,type:"iso",pos:"BTN",hand:"K♣ J♣",code:"KJs",open:true, limpers:2,ctx:"limpers_2_fish",es:"KJs ISO a 5BB con 2 limpers. Broadway suited con posición vs 2 rangos débiles.",en:"KJs ISOs to 5BB with 2 limpers. Broadway suited with position vs 2 weak ranges."},
  {id:285,type:"iso",pos:"BTN",hand:"Q♦ 8♦",code:"Q8s",open:true, limpers:2,ctx:"limpers_2_mix", es:"Q8s ISO a 5BB con 2 limpers. Suited en rango BTN 2L ISO. Tamaño correcto: 5BB.",en:"Q8s ISOs to 5BB with 2 limpers. Suited in BTN 2L ISO range. Correct size: 5BB."},
  // ── BTN ISO 2 limpers — should fold (5) ──────────────────────────────────
  {id:286,type:"iso",pos:"BTN",hand:"J♦ 3♦",code:"J3s",open:false,limpers:2,ctx:"limpers_2_fish",es:"J3s no está en el rango BTN ISO con 2 limpers. El bote multiway hace esta mano injugable.",en:"J3s is not in the BTN ISO range with 2 limpers. The multiway pot makes this hand unplayable."},
  {id:287,type:"iso",pos:"BTN",hand:"K♠ 2♠",code:"K2s",open:false,limpers:2,ctx:"limpers_2_fish",es:"K2s no está en el rango BTN ISO con 2 limpers (mínimo K6s). Foldea.",en:"K2s is not in the BTN ISO range with 2 limpers (minimum K6s). Fold."},
  {id:288,type:"iso",pos:"BTN",hand:"A♥ 7♣",code:"A7o",open:false,limpers:2,ctx:"limpers_2_fish",es:"A7o no está en el rango BTN 2L ISO (mínimo offsuit A8o). Foldea con 2 limpers.",en:"A7o is not in the BTN 2L ISO range (minimum offsuit A8o). Fold with 2 limpers."},
  {id:289,type:"iso",pos:"BTN",hand:"K♦ 3♦",code:"K3s",open:false,limpers:2,ctx:"limpers_2_fish",es:"K3s no está en el rango BTN ISO con 2 limpers (mínimo K6s). Con más jugadores el rango se ajusta.",en:"K3s is not in the BTN ISO range with 2 limpers (minimum K6s). With more players the range tightens."},
  {id:290,type:"iso",pos:"BTN",hand:"T♣ 3♣",code:"T3s",open:false,limpers:2,ctx:"limpers_2_fish",es:"T3s no está en el rango BTN ISO con 2 limpers. Demasiado débil para ISO multiway.",en:"T3s is not in the BTN ISO range with 2 limpers. Too weak to ISO multiway."},
  // ── SB ISO 1 limper (BTN limped) — should ISO (5) ────────────────────────
  {id:291,type:"iso",pos:"SB", hand:"A♣ K♣",code:"AKs",open:true, limpers:1,ctx:"limper_btn_fish",es:"AKs ISO desde SB vs BTN limper. Mano suficientemente fuerte para ISO incluso OOP. ISO a 4BB.",en:"AKs ISOs from SB vs BTN limper. Strong enough to ISO even OOP. ISO to 4BB."},
  {id:292,type:"iso",pos:"SB", hand:"A♠ J♠",code:"AJs",open:true, limpers:1,ctx:"limper_btn_fish",es:"AJs ISO desde SB. Suited ace con suficiente valor para ISO incluso OOP.",en:"AJs ISOs from SB. Suited ace with enough value to ISO even OOP."},
  {id:293,type:"iso",pos:"SB", hand:"T♦ 9♦",code:"T9s",open:true, limpers:1,ctx:"limper_btn_fish",es:"T9s ISO desde SB vs BTN limper. Suited connector con buen potencial. ISO a 4BB.",en:"T9s ISOs from SB vs BTN limper. Suited connector with good potential. ISO to 4BB."},
  {id:294,type:"iso",pos:"SB", hand:"7♥ 7♣",code:"77", open:true, limpers:1,ctx:"limper_btn_fish",es:"77 ISO desde SB. Set mining con implied odds del BTN fish, incluso OOP.",en:"77 ISOs from SB. Set mining with implied odds from the BTN fish, even OOP."},
  {id:295,type:"iso",pos:"SB", hand:"K♠ 9♠",code:"K9s",open:true, limpers:1,ctx:"limper_btn_fish",es:"K9s ISO desde SB. Mano sólida que justifica el ISO incluso jugando OOP.",en:"K9s ISOs from SB. Solid hand that justifies ISO even playing OOP."},
  // ── SB ISO 1 limper (BTN limped) — should fold (5) ───────────────────────
  {id:296,type:"iso",pos:"SB", hand:"J♠ 4♠",code:"J4s",open:false,limpers:1,ctx:"limper_btn_fish",es:"J4s no está en el rango SB ISO. OOP con mano débil vs BTN limper es fold.",en:"J4s is not in the SB ISO range. OOP with a weak hand vs BTN limper is a fold."},
  {id:297,type:"iso",pos:"SB", hand:"T♥ 3♥",code:"T3s",open:false,limpers:1,ctx:"limper_btn_fish",es:"T3s no está en el rango SB ISO. Demasiado débil para jugar OOP.",en:"T3s is not in the SB ISO range. Too weak to play OOP."},
  {id:298,type:"iso",pos:"SB", hand:"8♣ 3♣",code:"83s",open:false,limpers:1,ctx:"limper_btn_fish",es:"83s no está en el rango SB ISO. El gap es demasiado grande para justificar el ISO OOP.",en:"83s is not in the SB ISO range. The gap is too large to justify ISO OOP."},
  {id:299,type:"iso",pos:"SB", hand:"K♦ 2♣",code:"K2o",open:false,limpers:1,ctx:"limper_btn_fish",es:"K2o no está en el rango SB ISO. King offsuit necesita kicker alta para ISO OOP.",en:"K2o is not in the SB ISO range. Offsuit king needs a high kicker to ISO OOP."},
  {id:300,type:"iso",pos:"SB", hand:"Q♠ 3♦",code:"Q3o",open:false,limpers:1,ctx:"limper_btn_fish",es:"Q3o no está en el rango SB ISO. Offsuit con kicker muy baja es fold desde SB.",en:"Q3o is not in the SB ISO range. Offsuit with very low kicker is a fold from SB."},
];

// ─── CBET SITUATIONS ─────────────────────────────────────────────────────────
// type:"cbet" — open=true → should C-bet; open=false → should check
// size: "small"(33%), "large"(67%), "pot"(100%) — only when open=true
// hand: hero cards, board: flop texture, players: 1=HU 2=3way+

const CBET_SITUATIONS = [
  // ── IP, dry board, should C-bet small (33%) — 20 situations ────────────────
  {id:301,type:"cbet",hand:"A♠K♣",board:"A♦7♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"TPTK en tablero seco rainbow. C-bet 33% para extraer valor de pares de 7, draws de as. No sobrevalores el tablero.", en:"TPTK on a dry rainbow board. C-bet 33% to extract value from sevens and weak aces. Don't over-size on a dry board.", pos:"BTN", callPos:"BB"},
  {id:302,type:"cbet",hand:"K♥K♦",board:"Q♦8♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Overpair en tablero seco. C-bet 33% — el rival difícilmente tiene Q y el resto del rango foldea.",en:"Overpair on a dry board. C-bet 33% — villain rarely has Q and the rest of their range folds.", pos:"BTN", callPos:"BB"},
  {id:303,type:"cbet",hand:"A♣Q♣",board:"A♠7♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Top pair buena kicker en A72r. C-bet 33% frecuente. Tablero totalmente seco, no hay draws.",en:"Top pair good kicker on A72r. C-bet 33% at high frequency. Completely dry board, no draws.", pos:"BTN", callPos:"BB"},
  {id:304,type:"cbet",hand:"J♠J♦",board:"T♥8♦3♠",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Overpair en tablero bajo seco. C-bet 33% para proteger y extraer valor.",en:"Overpair on a low dry board. C-bet 33% to protect and extract value.", pos:"BTN", callPos:"BB"},
  {id:305,type:"cbet",hand:"Q♣Q♦",board:"J♦7♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"QQ overpair en J72r. C-bet 33% — tienes ventaja de rango y el tablero es seco.",en:"QQ overpair on J72r. C-bet 33% — you have range advantage and the board is dry.", pos:"BTN", callPos:"BB"},
  {id:306,type:"cbet",hand:"K♣T♣",board:"K♦8♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Top pair en tablero casi seco (un palo repetido). C-bet 33% extrae valor de manera eficiente.",en:"Top pair on a near-dry board (one suit repeated). C-bet 33% extracts value efficiently.", pos:"BTN", callPos:"BB"},
  {id:307,type:"cbet",hand:"A♦5♦",board:"A♠9♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Pareja de ases con kicker baja en tablero seco. C-bet 33% — aún tienes top pair y range advantage.",en:"Pair of aces with low kicker on dry board. C-bet 33% — you still have top pair and range advantage.", pos:"CO", callPos:"BB"},
  {id:308,type:"cbet",hand:"T♠T♦",board:"8♦4♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_ip_nit", es:"TT overpair en tablero muy seco 842r vs nit. C-bet 33% — el nit foldea casi todo el rango.",en:"TT overpair on very dry 842r vs nit. C-bet 33% — the nit folds almost their entire range.", pos:"BTN", callPos:"BB"},
  {id:309,type:"cbet",hand:"9♥9♦",board:"7♦5♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"99 overpair en tablero bajo seco. C-bet 33% con alta frecuencia.",en:"99 overpair on a low dry board. C-bet 33% at high frequency.", pos:"CO", callPos:"BTN"},
  {id:310,type:"cbet",hand:"K♠J♠",board:"K♣7♦2♠",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair con buena kicker en tablero seco. C-bet 33% — estándar.",en:"Top pair with good kicker on dry board. C-bet 33% — standard.", pos:"CO", callPos:"BTN"},
  // ── IP, dry board, bluff C-bet small — 10 situations ──────────────────────
  {id:311,type:"cbet",hand:"J♣T♣",board:"A♦8♥2♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Missed mano en tablero de as seco. C-bet 33% — el as favorece tu rango de apertura, el rival foldea mucho.",en:"Missed hand on dry ace-high board. C-bet 33% — the ace favors your opening range, villain folds a lot.", pos:"BTN", callPos:"BB"},
  {id:312,type:"cbet",hand:"Q♥J♥",board:"K♦7♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Sin mano en tablero de rey seco. C-bet 33% — tu rango como abridor tiene más reyes que el caller. Fold equity alta.",en:"No hand on dry king-high board. C-bet 33% — your opening range has more kings than the caller's range. High fold equity.", pos:"BTN", callPos:"BB"},
  {id:313,type:"cbet",hand:"A♦3♦",board:"K♠9♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"A3s sin par en tablero seco. C-bet 33% — backdoor flush draw + blocker al as da extra fold equity.",en:"A3s no pair on dry board. C-bet 33% — backdoor flush draw + ace blocker gives extra fold equity.", pos:"CO", callPos:"BB"},
  {id:314,type:"cbet",hand:"K♣Q♣",board:"A♦8♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_ip_nit", es:"Sin par en tablero de as vs nit. C-bet 33% — el nit foldea todos sus pares de 8 y 2.",en:"No pair on ace board vs nit. C-bet 33% — the nit folds all their eights and twos.", pos:"BTN", callPos:"BB"},
  {id:315,type:"cbet",hand:"T♠8♠",board:"A♥6♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Missed suited connector en tablero de as seco. C-bet 33% — tablero favorece abridor, fold equity suficiente.",en:"Missed suited connector on dry ace board. C-bet 33% — board favors opener, sufficient fold equity.", pos:"CO", callPos:"BB"},
  {id:316,type:"cbet",hand:"7♦6♦",board:"K♠9♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_ip_nit", es:"Sin nada en tablero desconectado vs nit. C-bet 33% — el nit foldea casi todo excepto KX.",en:"Nothing on disconnected board vs nit. C-bet 33% — the nit folds almost everything except KX.", pos:"BTN", callPos:"BB"},
  {id:317,type:"cbet",hand:"A♠2♠",board:"Q♦8♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"A2s sin par en tablero de dama seco. C-bet 33% — blocker al as, backdoor draw, rango abridor fuerte aquí.",en:"A2s no pair on dry queen board. C-bet 33% — ace blocker, backdoor draw, opener's range is strong here.", pos:"BTN", callPos:"BB"},
  {id:318,type:"cbet",hand:"J♦9♦",board:"A♠7♥2♦",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Mano perdida en tablero de as seco. C-bet 33% — fold equity alta vs rangos de call del BB.",en:"Missed hand on dry ace board. C-bet 33% — high fold equity vs BB calling ranges.", pos:"CO", callPos:"BB"},
  {id:319,type:"cbet",hand:"K♥4♥",board:"Q♠8♦3♣",players:1,open:true, size:"small",ctx:"cb_hu_ip_nit", es:"K4s sin par vs nit en tablero seco. C-bet 33% — el nit foldea la mayoría del rango.",en:"K4s no pair vs nit on dry board. C-bet 33% — the nit folds most of their range.", pos:"BTN", callPos:"BB"},
  {id:320,type:"cbet",hand:"5♠5♣",board:"A♦K♣7♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Par de 5s en tablero de dos cartas altas. C-bet 33% — tienes un bluff con equidad residual. Si pagan checkeas turn.",en:"Pair of fives on two-high-card board. C-bet 33% — you have a bluff with residual equity. If called, check the turn.", pos:"BTN", callPos:"BB"},
  // ── IP, wet board, should C-bet large (67%) — 10 situations ───────────────
  {id:321,type:"cbet",hand:"A♠K♠",board:"A♠T♠8♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"TPTK con nut flush draw en tablero mojado. C-bet 67% — construyes bote con draw + valor, cargas al rival por sus draws.",en:"TPTK with nut flush draw on wet board. C-bet 67% — build the pot with draw + value, charge villain for their draws.", pos:"BTN", callPos:"BB"},
  {id:322,type:"cbet",hand:"K♣K♦",board:"J♠T♠9♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"KK overpair en tablero muy conectado. C-bet 67% — mano fuerte pero muchos draws por detrás, cobra por ellos.",en:"KK overpair on very connected board. C-bet 67% — strong hand but many draws behind, charge for them.", pos:"BTN", callPos:"BB"},
  {id:323,type:"cbet",hand:"9♥9♠",board:"9♦8♠7♦",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Set de 9s en tablero monotone-style. C-bet 67% — mano de valor muy fuerte pero tablero peligroso con draws.",en:"Set of nines on a very connected board. C-bet 67% — very strong value hand but dangerous board full of draws.", pos:"CO", callPos:"BTN"},
  {id:324,type:"cbet",hand:"J♦T♦",board:"J♠9♠8♥",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + gutshot en tablero muy mojado. C-bet 67% — protege tu mano y construye bote con equity.",en:"Top pair + gutshot on very wet board. C-bet 67% — protect your hand and build pot with equity.", pos:"BTN", callPos:"BB"},
  {id:325,type:"cbet",hand:"A♥Q♥",board:"Q♠J♥T♥",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + nut flush draw en tablero de rainbow a tres colores. C-bet 67% — draw potente + valor.",en:"Top pair + nut flush draw on rainbow three-suit board. C-bet 67% — strong draw + value.", pos:"BTN", callPos:"BB"},
  {id:326,type:"cbet",hand:"K♠Q♠",board:"Q♥J♠T♠",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Top pair + flush draw en tablero conectado peligroso. C-bet 67% — extrae valor y cobra por los draws.",en:"Top pair + flush draw on dangerous connected board. C-bet 67% — extract value and charge for draws.", pos:"CO", callPos:"BTN"},
  {id:327,type:"cbet",hand:"T♥9♥",board:"T♠9♠8♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Dos pares en tablero mojado. C-bet 67% — mano fuerte pero tablero peligroso. Cobra a los draws ya.",en:"Two pair on wet board. C-bet 67% — strong hand but dangerous board. Charge the draws now.", pos:"BTN", callPos:"BB"},
  {id:328,type:"cbet",hand:"8♣8♦",board:"8♠7♠6♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Set en tablero muy conectado y con flush draw. C-bet 67% — necesitas cobrar a los draws ya, no puedes dormir.",en:"Set on a very connected board with flush draw. C-bet 67% — need to charge draws now, can't slow-play.", pos:"BTN", callPos:"BB"},
  {id:329,type:"cbet",hand:"A♣J♣",board:"J♥9♣8♣",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + nut flush draw en tablero conectado. C-bet 67% — draw combo potentísimo, construye el bote.",en:"Top pair + nut flush draw on connected board. C-bet 67% — powerful combo draw, build the pot.", pos:"CO", callPos:"BB"},
  {id:330,type:"cbet",hand:"Q♦Q♣",board:"Q♠J♦T♠",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Set de reinas en tablero muy peligroso. C-bet 67% — set > draws pero cobra ya, el turn puede ser terrible.",en:"Set of queens on very dangerous board. C-bet 67% — set beats draws but charge now, the turn can be terrible.", pos:"BTN", callPos:"BB"},
  // ── IP, should CHECK — 15 situations ──────────────────────────────────────
  {id:331,type:"cbet",hand:"J♣T♣",board:"9♠8♠7♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"JT en tablero 987 = escalera completada (J-T-9-8-7). Mano muy fuerte. C-bet 67% — tienes el nuts straight pero el tablero es peligroso con flush draw. Cobra ya.",en:"JT on 987 board = completed straight (J-T-9-8-7). Very strong hand. C-bet 67% — you have the nuts straight but the board is dangerous with a flush draw. Charge now.", pos:"BTN", callPos:"BB"},
  {id:332,type:"cbet",hand:"K♣J♦",board:"8♠7♠6♦",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"Sin par en tablero muy mojado. El rango del caller conecta mejor aquí. Checkea y evalúa.",en:"No pair on very wet board. Caller's range connects better here. Check and evaluate.", pos:"CO", callPos:"BB"},
  {id:333,type:"cbet",hand:"A♦Q♦",board:"K♠Q♠J♠",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"Tablero monotone de picas. Par de damas pero el rival puede tener flush o straight. Sin equidad real. Checkea.",en:"Monotone spade board. Pair of queens but villain can have flush or straight. No real edge. Check.", pos:"BTN", callPos:"BB"},
  {id:334,type:"cbet",hand:"7♠6♠",board:"A♣K♦Q♠",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"Gutshot en tablero de tres cartas altas. Poca fold equity y mucha equidad del rival. Checkea.",en:"Gutshot on three-high-card board. Low fold equity and high villain equity. Check.", pos:"BTN", callPos:"BB"},
  {id:335,type:"cbet",hand:"5♦5♣",board:"9♠8♠7♦",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"Par de 5s underpair en tablero muy conectado. Sin equity y mucho riesgo. Checkea.",en:"Pair of fives underpair on very connected board. No equity and high risk. Check.", pos:"CO", callPos:"BB"},
  {id:336,type:"cbet",hand:"A♠2♠",board:"T♠9♠8♦",players:1,open:false,size:null,ctx:"cb_hu_ip_fish",   es:"A2s en tablero conectado vs calling station. No bluffees a calling stations. Sin hand fuerte aquí. Checkea.",en:"A2s on connected board vs calling station. Don't bluff calling stations. No strong hand here. Check.", pos:"BTN", callPos:"BB"},
  {id:337,type:"cbet",hand:"K♣Q♣",board:"J♠T♠9♠",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"KQ en tablero J♠T♠9♠ = escalera de rey (K-Q-J-T-9). Tienes el nuts straight aunque el tablero sea monotone de picas. C-bet 67% — cobra al rival que tiene el flush draw o draws al straight inferior.",en:"KQ on J♠T♠9♠ board = king-high straight (K-Q-J-T-9). You have the nut straight even though the board is monotone spades. C-bet 67% — charge the villain who has the flush draw or inferior straight draws.", pos:"BTN", callPos:"BB"},
  {id:338,type:"cbet",hand:"Q♥J♥",board:"A♠K♠Q♦",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"Par de damas en tablero de as-rey peligroso. El rival tiene muchos AK, AQ, KQ. Checkea y evalúa.",en:"Pair of queens on dangerous ace-king board. Villain has many AK, AQ, KQ. Check and evaluate.", pos:"CO", callPos:"BB"},
  {id:339,type:"cbet",hand:"T♦9♦",board:"A♠K♠Q♠",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"Mano perdida en tablero monotone de tres broadways. Sin flush de picas. Checkea.",en:"Missed hand on monotone three-broadway board. No spade flush. Check.", pos:"BTN", callPos:"BB"},
  {id:340,type:"cbet",hand:"6♣6♦",board:"K♠Q♦J♠",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"Underpair en tablero de tres cartas altas conectadas. Sin valor real, sin fold equity. Checkea.",en:"Underpair on three connected high cards. No real value, no fold equity. Check.", pos:"BTN", callPos:"BB"},
  // ── OOP, dry board, should C-bet ── 10 situations ─────────────────────────
  {id:341,type:"cbet",hand:"A♠K♦",board:"A♥7♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"TPTK OOP en tablero seco. C-bet 33% — aún tienes la iniciativa y la mano más fuerte. El tablero es seco.",en:"TPTK OOP on dry board. C-bet 33% — you still have initiative and the strongest hand. Dry board.", pos:"CO", callPos:"BTN"},
  {id:342,type:"cbet",hand:"K♣K♥",board:"Q♦8♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"KK overpair OOP en tablero seco. C-bet 33% — construye bote con mano fuerte. No hay draws.",en:"KK overpair OOP on dry board. C-bet 33% — build pot with strong hand. No draws.", pos:"SB", callPos:"BB"},
  {id:343,type:"cbet",hand:"A♦J♦",board:"A♠9♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair OOP en tablero seco. C-bet 33% para extraer valor.",en:"Top pair OOP on dry board. C-bet 33% to extract value.", pos:"CO", callPos:"BTN"},
  {id:344,type:"cbet",hand:"Q♠Q♦",board:"J♣7♦2♠",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"QQ overpair OOP en tablero seco de J. C-bet 33% — extraes valor de JX y manos más débiles.",en:"QQ overpair OOP on dry jack-high board. C-bet 33% — extract value from JX and weaker hands.", pos:"SB", callPos:"BB"},
  {id:345,type:"cbet",hand:"K♦Q♦",board:"K♣8♦3♠",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair OOP en tablero seco. C-bet 33% por valor.",en:"Top pair OOP on dry board. C-bet 33% for value.", pos:"CO", callPos:"BTN"},
  {id:346,type:"cbet",hand:"A♥T♥",board:"A♦6♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair + backdoor flush draw OOP en tablero seco. C-bet 33% — valor + algo de potencial.",en:"Top pair + backdoor flush draw OOP on dry board. C-bet 33% — value + some potential.", pos:"SB", callPos:"BB"},
  {id:347,type:"cbet",hand:"J♠J♦",board:"T♦6♣2♠",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"JJ overpair OOP en tablero bajo seco. C-bet 33% — mano fuerte en tablero favorable.",en:"JJ overpair OOP on low dry board. C-bet 33% — strong hand on favorable board.", pos:"CO", callPos:"BTN"},
  {id:348,type:"cbet",hand:"T♣T♦",board:"8♠5♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"TT overpair OOP en tablero muy seco. C-bet 33% con alta frecuencia — nadie tiene nada aquí.",en:"TT overpair OOP on very dry board. C-bet 33% at high frequency — nobody has anything here.", pos:"SB", callPos:"BB"},
  {id:349,type:"cbet",hand:"A♣8♣",board:"A♦7♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair buena kicker OOP en tablero seco. C-bet 33% por valor.",en:"Top pair good kicker OOP on dry board. C-bet 33% for value.", pos:"CO", callPos:"BTN"},
  {id:350,type:"cbet",hand:"Q♦Q♣",board:"9♦5♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"QQ overpair OOP en tablero muy bajo. C-bet 33% — tienes la mano más fuerte probable.",en:"QQ overpair OOP on very low board. C-bet 33% — you likely have the strongest hand.", pos:"SB", callPos:"BB"},
  // ── OOP, should CHECK ── 15 situations ────────────────────────────────────
  {id:351,type:"cbet",hand:"K♠Q♠",board:"9♠8♠7♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Mano perdida OOP en tablero muy mojado. Sin equidad real. El rival tiene mejor posición y rango que conecta. Checkea.",en:"Missed hand OOP on very wet board. No real equity. Villain has better position and connecting range. Check.", pos:"CO", callPos:"BTN"},
  {id:352,type:"cbet",hand:"A♦Q♦",board:"J♠T♠9♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Sin par OOP en tablero extremadamente conectado. No apostar — checkea y evalúa la apuesta del rival.",en:"No pair OOP on extremely connected board. Don't bet — check and evaluate villain's bet.", pos:"SB", callPos:"BB"},
  {id:353,type:"cbet",hand:"J♣T♣",board:"A♠K♦Q♦",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"JT en tablero A-K-Q = broadway straight (A-K-Q-J-T). Tienes el nuts straight OOP. C-bet 67% — incluso OOP, la mano es demasiado fuerte para checkear. Cobra al rival que tiene draws o pares de broadway.",en:"JT on A-K-Q board = broadway straight (A-K-Q-J-T). You have the nut straight OOP. C-bet 67% — even OOP, the hand is too strong to check. Charge the villain who has draws or broadway pairs.", pos:"CO", callPos:"BTN"},
  {id:354,type:"cbet",hand:"7♦6♦",board:"K♠Q♣J♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Missed suited connector OOP en tablero de tres cartas altas. Sin fold equity relevante. Checkea.",en:"Missed suited connector OOP on three-high-card board. No relevant fold equity. Check.", pos:"SB", callPos:"BTN"},
  {id:355,type:"cbet",hand:"9♣8♣",board:"A♦K♣Q♥",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Sin nada OOP en tablero de tres cartas altas. Bluffear aquí es tirar fichas. Checkea.",en:"Nothing OOP on three-high-card board. Bluffing here is wasting chips. Check.", pos:"SB", callPos:"BB"},
  {id:356,type:"cbet",hand:"A♠5♠",board:"8♠7♠6♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"A5s OOP en tablero muy conectado que favorece al caller. Backdoor flush no es suficiente. Checkea.",en:"A5s OOP on very connected board favoring the caller. Backdoor flush isn't enough. Check.", pos:"CO", callPos:"BTN"},
  {id:357,type:"cbet",hand:"K♥J♥",board:"T♠9♠8♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Gutshot OOP en tablero muy conectado. Poca fold equity. El rival tiene más equity aquí. Checkea.",en:"Gutshot OOP on very connected board. Low fold equity. Villain has more equity here. Check.", pos:"SB", callPos:"BB"},
  {id:358,type:"cbet",hand:"Q♣J♦",board:"A♠K♠Q♣",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Par de damas OOP en tablero peligroso. El rival puede tener AK, AQ, KQ, flush draw. Checkea.",en:"Pair of queens OOP on dangerous board. Villain can have AK, AQ, KQ, flush draw. Check.", pos:"CO", callPos:"BTN"},
  {id:359,type:"cbet",hand:"5♠5♦",board:"J♣T♣9♥",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Underpair OOP en tablero muy conectado. Sin equity real. Checkea.",en:"Underpair OOP on very connected board. No real equity. Check.", pos:"SB", callPos:"BTN"},
  {id:360,type:"cbet",hand:"A♦2♦",board:"K♠Q♠J♦",players:1,open:false,size:null,ctx:"cb_hu_ip_fish",   es:"A2s sin par en tablero de tres cartas altas vs calling station. No bluffees. Checkea.",en:"A2s no pair on three-high-card board vs calling station. Don't bluff. Check.", pos:"BTN", callPos:"BB"},
  // ── OOP, wet board, C-bet large — 5 situations ────────────────────────────
  {id:361,type:"cbet",hand:"A♠A♦",board:"J♠T♠9♦",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"AA OOP en tablero extremadamente peligroso. C-bet 67% — mano premium pero debes cobrar a los draws YA.",en:"AA OOP on extremely dangerous board. C-bet 67% — premium hand but you must charge the draws NOW.", pos:"CO", callPos:"BTN"},
  {id:362,type:"cbet",hand:"K♣K♦",board:"9♠8♣7♠",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"KK OOP en tablero mojado. C-bet 67% — overpair fuerte pero tablero peligroso. Cobra a los draws.",en:"KK OOP on wet board. C-bet 67% — strong overpair but dangerous board. Charge the draws.", pos:"CO", callPos:"BTN"},
  {id:363,type:"cbet",hand:"T♠T♦",board:"T♣9♣8♦",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Set de tens OOP en tablero conectado. C-bet 67% — set fuerte pero necesita cobrar a los draws.",en:"Set of tens OOP on connected board. C-bet 67% — strong set but needs to charge the draws.", pos:"CO", callPos:"BTN"},
  {id:364,type:"cbet",hand:"A♥J♥",board:"J♠T♥9♠",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Top pair + flush draw OOP en tablero peligroso. C-bet 67% — draw + valor justifican tamaño grande.",en:"Top pair + flush draw OOP on dangerous board. C-bet 67% — draw + value justify large size.", pos:"CO", callPos:"BTN"},
  {id:365,type:"cbet",hand:"Q♠Q♦",board:"Q♣J♠T♣",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Set OOP en tablero con straight draws y flush draw. C-bet 67% — cobra YA, no puedes dormir este set.",en:"Set OOP on board with straight and flush draws. C-bet 67% — charge NOW, can't slow-play this set.", pos:"SB", callPos:"BB"},
  // ── Multiway, should CHECK — 10 situations ────────────────────────────────
  {id:366,type:"cbet",hand:"A♣J♣",board:"K♦8♣3♠",players:2,open:false,size:null,ctx:"cb_3way",         es:"Sin par en tablero seco 3-way. Bluffear multiway tiene poca fold equity. Checkea.",en:"No pair on dry board 3-way. Bluffing multiway has low fold equity. Check.", pos:"UTG", callPos:"MP+BB"},
  {id:367,type:"cbet",hand:"J♠T♠",board:"A♦9♣4♥",players:2,open:false,size:null,ctx:"cb_3way",         es:"Mano perdida 3-way. En botes de 3 jugadores el bluff rara vez funciona. Checkea.",en:"Missed hand 3-way. In 3-player pots bluffing rarely works. Check.", pos:"UTG", callPos:"MP+BB"},
  {id:368,type:"cbet",hand:"7♦6♦",board:"Q♦J♣T♠",players:2,open:false,size:null,ctx:"cb_3way",         es:"Mano perdida 3-way en tablero conectado. Checkea — alguien tiene algo aquí.",en:"Missed hand 3-way on connected board. Check — someone has something here.", pos:"CO", callPos:"BTN+BB"},
  {id:369,type:"cbet",hand:"K♣Q♣",board:"A♠9♦5♣",players:2,open:false,size:null,ctx:"cb_3way",         es:"Sin par en tablero de as 3-way. Checkea — fold equity mínima con 2 callers.",en:"No pair on ace board 3-way. Check — minimal fold equity with 2 callers.", pos:"UTG", callPos:"MP+BB"},
  {id:370,type:"cbet",hand:"9♥9♠",board:"A♦K♣8♦",players:2,open:false,size:null,ctx:"cb_3way",         es:"Underpair en tablero de dos cartas altas 3-way. Sin valor real aquí. Checkea.",en:"Underpair on two-high-card board 3-way. No real value here. Check.", pos:"UTG", callPos:"MP+BB"},
  {id:371,type:"cbet",hand:"A♦3♦",board:"T♠9♠8♣",players:2,open:false,size:null,ctx:"cb_3way",         es:"Par de ases pero tablero muy conectado 3-way. El riesgo es demasiado alto. Checkea.",en:"Pair of aces but very connected board 3-way. Risk is too high. Check.", pos:"UTG", callPos:"MP+BB"},
  {id:372,type:"cbet",hand:"K♠J♦",board:"Q♣J♠T♦",players:2,open:false,size:null,ctx:"cb_3way",         es:"Par de J en tablero conectado 3-way. Alguien tiene KX, AX, 9X. Checkea.",en:"Pair of jacks on connected board 3-way. Someone has KX, AX, 9X. Check.", pos:"CO", callPos:"BTN+BB"},
  {id:373,type:"cbet",hand:"T♣9♣",board:"A♠K♦Q♣",players:2,open:false,size:null,ctx:"cb_3way",         es:"Gutshot en tablero de tres cartas altas 3-way. Sin fold equity, sin valor. Checkea.",en:"Gutshot on three-high-card board 3-way. No fold equity, no value. Check.", pos:"UTG", callPos:"MP+BB"},
  {id:374,type:"cbet",hand:"6♣6♦",board:"K♦Q♠J♣",players:2,open:false,size:null,ctx:"cb_3way",         es:"Underpair en tablero de tres cartas altas 3-way. Sin equity real. Checkea.",en:"Underpair on three-high-card board 3-way. No real equity. Check.", pos:"CO", callPos:"BTN+BB"},
  {id:375,type:"cbet",hand:"5♠4♠",board:"A♦T♣7♠",players:2,open:false,size:null,ctx:"cb_3way",         es:"Mano especulativa sin par ni draw real 3-way. Checkea — bote multiway requiere manos fuertes.",en:"Speculative hand with no pair or real draw 3-way. Check — multiway pot requires strong hands.", pos:"UTG", callPos:"MP+BB"},
  // ── Multiway, C-bet for value — 5 situations ──────────────────────────────
  {id:376,type:"cbet",hand:"A♠A♣",board:"K♦8♣3♠",players:2,open:true, size:"small",ctx:"cb_3way",      es:"AA en tablero seco 3-way. C-bet 33% — mano premium que merece apostar incluso multiway.",en:"AA on dry board 3-way. C-bet 33% — premium hand worth betting even multiway.", pos:"UTG", callPos:"MP+BB"},
  {id:377,type:"cbet",hand:"K♠K♦",board:"Q♦7♣2♥",players:2,open:true, size:"small",ctx:"cb_3way",      es:"KK overpair en tablero seco 3-way. C-bet 33% — extrae valor aunque el bote sea multiway.",en:"KK overpair on dry board 3-way. C-bet 33% — extract value even in multiway pot.", pos:"UTG", callPos:"MP+BB"},
  {id:378,type:"cbet",hand:"8♠8♦",board:"8♣4♦2♥",players:2,open:true, size:"large",ctx:"cb_3way",      es:"Set de 8s en tablero seco 3-way. C-bet 67% — set poderoso, construye el bote agresivamente.",en:"Set of eights on dry board 3-way. C-bet 67% — powerful set, build pot aggressively.", pos:"CO", callPos:"BTN+BB"},
  {id:379,type:"cbet",hand:"A♥K♥",board:"A♦9♣3♥",players:2,open:true, size:"small",ctx:"cb_3way_ip",   es:"TPTK IP 3-way en tablero seco. C-bet 33% — mano fuerte que merece apostar en posición.",en:"TPTK IP 3-way on dry board. C-bet 33% — strong hand worth betting in position.", pos:"BTN", callPos:"SB+BB"},
  {id:380,type:"cbet",hand:"Q♣Q♦",board:"Q♠7♦2♣",players:2,open:true, size:"large",ctx:"cb_3way",      es:"Set de damas en tablero seco 3-way. C-bet 67% — set top en tablero bueno, construye el bote.",en:"Set of queens on dry board 3-way. C-bet 67% — top set on good board, build the pot.", pos:"CO", callPos:"BTN+BB"},
  // ── Mixed / Edge cases — 20 situations ────────────────────────────────────
  {id:381,type:"cbet",hand:"A♦K♦",board:"K♠T♦5♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Top pair (reyes) IP en tablero semi-seco. C-bet 33% — mano fuerte en tablero manejable.",en:"Top pair (kings) IP on semi-dry board. C-bet 33% — strong hand on manageable board.", pos:"BTN", callPos:"BB"},
  {id:382,type:"cbet",hand:"J♥J♦",board:"9♠8♠7♦",players:1,open:false,size:null,ctx:"cb_hu_ip",        es:"JJ overpair pero tablero extremadamente peligroso. Sin fold equity, el rival conecta bien. Checkea.",en:"JJ overpair but extremely dangerous board. No fold equity, villain connects well. Check.", pos:"BTN", callPos:"BB"},
  {id:383,type:"cbet",hand:"K♣Q♦",board:"K♥Q♦J♠",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Dos pares top IP en tablero conectado. C-bet 67% — construye bote con mano fuerte pero peligrosa.",en:"Top two pair IP on connected board. C-bet 67% — build pot with strong but vulnerable hand.", pos:"BTN", callPos:"BB"},
  {id:384,type:"cbet",hand:"A♠4♠",board:"A♦5♠2♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Top pair + wheel draw (A2345) IP en tablero seco. C-bet 33% — valor + potencial de straight.",en:"Top pair + wheel draw (A2345) IP on dry board. C-bet 33% — value + straight potential.", pos:"BTN", callPos:"BB"},
  {id:385,type:"cbet",hand:"T♦8♦",board:"9♦7♦6♣",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Straight abierto + flush draw IP en tablero conectado. C-bet 67% — monster combo draw.",en:"Open-ended straight draw + flush draw IP on connected board. C-bet 67% — monster combo draw.", pos:"BTN", callPos:"BB"},
  {id:386,type:"cbet",hand:"Q♠J♠",board:"T♠9♣8♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Straight completado (Q high) IP en tablero conectado. C-bet 67% — mano fuerte, extrae valor.",en:"Completed straight (Q high) IP on connected board. C-bet 67% — strong hand, extract value.", pos:"BTN", callPos:"BB"},
  {id:387,type:"cbet",hand:"7♣7♦",board:"7♠6♦5♣",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Set de 7s en tablero conectado. C-bet 67% — set poderoso pero tablero peligroso con draws.",en:"Set of sevens on connected board. C-bet 67% — powerful set but dangerous board with draws.", pos:"CO", callPos:"BB"},
  {id:388,type:"cbet",hand:"A♣9♣",board:"9♦8♣7♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + flush draw IP en tablero mojado. C-bet 67% — semi-bluff con mucha equity.",en:"Top pair + flush draw IP on wet board. C-bet 67% — semi-bluff with lots of equity.", pos:"CO", callPos:"BB"},
  {id:389,type:"cbet",hand:"K♦K♣",board:"A♠T♦5♣",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"KK OOP pero hay un as en el tablero. Mucho riesgo de que el rival tenga AX. Checkea.",en:"KK OOP but there's an ace on the board. High risk villain has AX. Check.", pos:"CO", callPos:"BTN"},
  {id:390,type:"cbet",hand:"5♦5♣",board:"A♦5♠2♣",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Set de 5s en tablero de as. C-bet 67% — set poderoso, cobra al rival que tiene AX.",en:"Set of fives on ace board. C-bet 67% — powerful set, charge the villain who has AX.", pos:"CO", callPos:"BTN"},
  {id:391,type:"cbet",hand:"Q♣T♣",board:"Q♦T♦8♣",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Dos pares top IP en tablero con flush draw. C-bet 67% — mano fuerte pero vulnerable a flushes.",en:"Top two pair IP on board with flush draw. C-bet 67% — strong but vulnerable to flushes.", pos:"BTN", callPos:"BB"},
  {id:392,type:"cbet",hand:"A♠8♣",board:"8♦8♠3♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Trips (8s) + top kicker. C-bet 33% small — tablero seco, no hay draws, extrae valor tranquilamente.",en:"Trips (eights) + top kicker. C-bet 33% small — dry board, no draws, extract value calmly.", pos:"BTN", callPos:"BB"},
  {id:393,type:"cbet",hand:"J♠9♠",board:"J♦9♣4♥",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Dos pares top IP en tablero rainbow. C-bet 67% — protege tu mano de overcards y construye el bote.",en:"Top two pair IP on rainbow board. C-bet 67% — protect your hand from overcards and build the pot.", pos:"BTN", callPos:"BB"},
  {id:394,type:"cbet",hand:"K♥8♥",board:"K♦8♦4♠",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Dos pares IP en tablero con dos palos repetidos. C-bet 67% — cobra a los flush draws.",en:"Two pair IP on board with two repeated suits. C-bet 67% — charge the flush draws.", pos:"BTN", callPos:"BB"},
  {id:395,type:"cbet",hand:"A♦Q♦",board:"Q♠8♦3♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + nut flush draw IP. C-bet 67% — draw + valor es la combinación ideal para bet grande.",en:"Top pair + nut flush draw IP. C-bet 67% — draw + value is the ideal combination for a large bet.", pos:"BTN", callPos:"BB"},
  {id:396,type:"cbet",hand:"T♠T♦",board:"T♣T♥3♠",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Quads (cuadra de tens). C-bet 33% pequeño — tablero ultra-seco, el rival no tiene nada. Extrae valor lentamente.",en:"Quads (four tens). C-bet 33% small — ultra-dry board, villain has nothing. Extract value slowly.", pos:"BTN", callPos:"BB"},
  {id:397,type:"cbet",hand:"A♥K♣",board:"A♣J♠T♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"TPTK + draw en tablero conectado peligroso. C-bet 67% — tienes valor pero el tablero es peligroso.",en:"TPTK + draw on dangerous connected board. C-bet 67% — you have value but the board is dangerous.", pos:"CO", callPos:"BB"},
  {id:398,type:"cbet",hand:"3♦3♣",board:"A♦K♣3♠",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Set de 3s en tablero de dos cartas altas. C-bet 67% — set poderoso, cobra a las manos altas.",en:"Set of threes on two-high-card board. C-bet 67% — powerful set, charge the high-card hands.", pos:"CO", callPos:"BB"},
  {id:399,type:"cbet",hand:"Q♦Q♣",board:"A♦K♣5♠",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"QQ OOP en tablero de A-K. El rival probablemente tiene AX o KX. Peligro real. Checkea y evalúa.",en:"QQ OOP on A-K board. Villain likely has AX or KX. Real danger. Check and evaluate.", pos:"CO", callPos:"BTN"},
  {id:400,type:"cbet",hand:"8♣7♣",board:"J♣T♣9♠",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Straight + flush draw (monster combo). C-bet 67% — mano muy fuerte y draw adicional, construye el bote.",en:"Straight + flush draw (monster combo). C-bet 67% — very strong hand with additional draw, build the pot.", pos:"BTN", callPos:"BB"},
];

// ─── PRACTICE PAGE ───────────────────────────────────────────────────────────

// buildOptions is defined outside to avoid temporal dead zone issues
function buildOptions(sit, p, lang) {
  if (sit.community && (Array.isArray(sit.optionsEs) || Array.isArray(sit.optionsEn) || Array.isArray(sit.options))) {
    const opts = (lang === "es" ? sit.optionsEs : sit.optionsEn) || sit.optionsEs || sit.optionsEn || sit.options;
    const correctExplain = (lang === "es" ? sit.correctExplainEs : sit.correctExplainEn) || sit.correctExplainEs || sit.correctExplainEn || sit.correctExplain || "";
    const wrongExplain = (lang === "es" ? sit.wrongExplainEs : sit.wrongExplainEn) || sit.wrongExplainEs || sit.wrongExplainEn || sit.wrongExplain || "";
    return opts.map((opt, idx) => ({
      id: "opt" + idx,
      label: opt,
      correct: idx === sit.correctIndex,
      explanation: idx === sit.correctIndex ? correctExplain : (wrongExplain || correctExplain),
    })).sort(() => Math.random() - 0.5);
  }

  const correctExp = lang === "es" ? sit.es : sit.en;

  if (sit.type === "cbet") {
    const correctExp = lang === "es" ? sit.es : sit.en;
    if (sit.open) {
      // correct size + check + two wrong sizes (exclude duplicate of correct)
      const allSizes = [
        { id:"small", label: p.optCbetSmall },
        { id:"large", label: p.optCbetLarge },
        { id:"pot",   label: p.optCbetPot   },
      ];
      const correctOpt = { id:"correct", label: allSizes.find(s => s.id === sit.size).label, correct: true,  explanation: correctExp };
      const wrongSizes = allSizes.filter(s => s.id !== sit.size).map(s => ({ id:"w_"+s.id, label: s.label, correct: false, explanation: p.wrongCbetSizeExp }));
      return [
        correctOpt,
        { id:"check", label: p.optCheck, correct: false, explanation: p.wrongCheckWhenBetExp },
        wrongSizes[0],
        wrongSizes[1],
      ].sort(() => Math.random() - 0.5);
    } else {
      return [
        { id:"correct", label: p.optCheck,      correct: true,  explanation: correctExp },
        { id:"wsmall",  label: p.optCbetSmall,  correct: false, explanation: p.wrongBetWhenCheckExp },
        { id:"wlarge",  label: p.optCbetLarge,  correct: false, explanation: p.wrongBetWhenCheckExp },
        { id:"wpot",    label: p.optCbetPot,    correct: false, explanation: p.wrongBetWhenCheckExp },
      ].sort(() => Math.random() - 0.5);
    }
  }

  if (sit.type === "call") {
    if (sit.open) {
      return [
        { id:"correct", label: lang==="es" ? "Pagar" : "Call",   correct:true,  explanation:correctExp },
        { id:"fold",    label: p.optFold,                        correct:false, explanation: lang==="es" ? "Esta mano sí es pago rentable en esta situación." : "This hand is a profitable call in this situation." },
        { id:"wsize",   label: lang==="es" ? "3-bet" : "3-bet",  correct:false, explanation: lang==="es" ? "Pagar es la línea más correcta aquí, no 3-bet." : "Calling is the most correct line here, not 3-betting." },
        { id:"limp",    label: p.optLimp,                        correct:false, explanation: lang==="es" ? "No se limpa — o pagas la apertura correctamente o foldeas." : "Don't limp — either call the open correctly or fold." },
      ].sort(() => Math.random() - 0.5);
    } else {
      return [
        { id:"correct", label: p.optFold,                        correct:true,  explanation:correctExp },
        { id:"call",    label: lang==="es" ? "Pagar" : "Call",   correct:false, explanation: lang==="es" ? "Esta mano no es pago rentable aquí." : "This hand is not a profitable call here." },
        { id:"limp",    label: p.optLimp,                        correct:false, explanation: p.wrongLimpExp },
        { id:"w3bet",   label: lang==="es" ? "3-bet" : "3-bet",  correct:false, explanation: lang==="es" ? "Foldear es la mejor opción aquí." : "Folding is the best option here." },
      ].sort(() => Math.random() - 0.5);
    }
  }

  if (sit.type === "vbet") {
    if (sit.open) {
      const allSizes = [
        { id:"small",  label: p.optCbetSmall  },
        { id:"medium", label: p.optVbetMedium },
        { id:"large",  label: p.optCbetLarge  },
        { id:"pot",    label: p.optCbetPot    },
      ];
      const correctOpt = { id:"correct", label: allSizes.find(s => s.id === sit.size).label, correct: true,  explanation: correctExp };
      const wrongSizes = allSizes.filter(s => s.id !== sit.size).map(s => ({ id:"w_"+s.id, label: s.label, correct: false, explanation: p.wrongCbetSizeExp }));
      return [
        correctOpt,
        { id:"check", label: p.optCheck, correct: false, explanation: p.wrongCheckWhenBetExp },
        wrongSizes[0],
        wrongSizes[1],
      ].sort(() => Math.random() - 0.5);
    } else {
      return [
        { id:"correct", label: p.optCheck,      correct: true,  explanation: correctExp },
        { id:"wsmall",  label: p.optCbetSmall,  correct: false, explanation: p.wrongBetWhenCheckExp },
        { id:"wlarge",  label: p.optCbetLarge,  correct: false, explanation: p.wrongBetWhenCheckExp },
        { id:"wpot",    label: p.optCbetPot,    correct: false, explanation: p.wrongBetWhenCheckExp },
      ].sort(() => Math.random() - 0.5);
    }
  }

  if (sit.type === "iso") {
    const isoLabel   = sit.limpers === 2 ? p.optIso5 : p.optIso4;
    const wrongLabel = sit.limpers === 2 ? p.optIso6 : p.optIso8;
    if (sit.open) {
      return [
        { id:"correct", label: isoLabel,         correct: true,  explanation: correctExp },
        { id:"fold",    label: p.optFold,         correct: false, explanation: p.wrongIsoOpenExp },
        { id:"limp",    label: p.optLimpBehind,   correct: false, explanation: p.wrongLimpBehindExp },
        { id:"wsize",   label: wrongLabel,         correct: false, explanation: p.wrongSizeExp },
      ].sort(() => Math.random() - 0.5);
    } else {
      return [
        { id:"correct", label: p.optFold,         correct: true,  explanation: correctExp },
        { id:"wiso",    label: isoLabel,           correct: false, explanation: p.wrongIsoFoldExp },
        { id:"limp",    label: p.optLimpBehind,   correct: false, explanation: p.wrongLimpBehindExp },
        { id:"wsize",   label: wrongLabel,         correct: false, explanation: p.wrongSizeExp },
      ].sort(() => Math.random() - 0.5);
    }
  }

  if (sit.type === "facing") {
    const callLabel  = lang === "es" ? "Pagar (call)" : "Call";
    const raiseLabel = lang === "es" ? "Resubir (raise)" : "Raise";
    if (sit.open) {
      return [
        { id:"correct", label: callLabel,  correct: true,  explanation: correctExp },
        { id:"fold",    label: p.optFold,  correct: false, explanation: lang==="es" ? "Con la equidad que tienes vs el rango del rival, pagar tiene más EV que foldear." : "With your equity vs villain's range, calling has more EV than folding." },
        { id:"raise",   label: raiseLabel, correct: false, explanation: lang==="es" ? "Resubir aquí no tiene sentido estratégico. La decisión es call o fold." : "Raising here makes no strategic sense. The decision is call or fold." },
        { id:"check",   label: lang==="es" ? "Checkear" : "Check", correct: false, explanation: lang==="es" ? "El rival ya apostó — no puedes checkear. Debes pagar o foldear." : "Villain already bet — you can't check. You must call or fold." },
      ].sort(() => Math.random() - 0.5);
    } else {
      return [
        { id:"correct", label: p.optFold,  correct: true,  explanation: correctExp },
        { id:"call",    label: callLabel,   correct: false, explanation: lang==="es" ? "No tienes la equidad necesaria para justificar el call contra el rango probable del rival." : "You don't have the required equity to justify the call vs villain's likely range." },
        { id:"raise",   label: raiseLabel,  correct: false, explanation: lang==="es" ? "Bluffear con un raise aquí no tiene sentido — el rango del rival está cargado de valor." : "Bluff-raising here makes no sense — villain's range is value-heavy." },
        { id:"check",   label: lang==="es" ? "Checkear" : "Check", correct: false, explanation: lang==="es" ? "El rival ya apostó — tienes que call o fold, no puedes checkear." : "Villain already bet — you have to call or fold, you can't check." },
      ].sort(() => Math.random() - 0.5);
    }
  }

  // Standard open situation
  const correctLabel = sit.open ? (sit.size === "3x" ? p.optOpen3 : p.optOpen25) : p.optFold;
  if (!sit.open) {
    return [
      { id:"correct", label: p.optFold,   correct: true,  explanation: correctExp },
      { id:"wopen3",  label: p.optOpen3,  correct: false, explanation: p.wrongOpenExp },
      { id:"wopen25", label: p.optOpen25, correct: false, explanation: p.wrongOpenExp },
      { id:"limp",    label: p.optLimp,   correct: false, explanation: p.wrongLimpExp },
    ].sort(() => Math.random() - 0.5);
  }
  return [
    { id:"correct", label: correctLabel,                                  correct: true,  explanation: correctExp },
    { id:"fold",    label: p.optFold,                                     correct: false, explanation: p.wrongFoldExp },
    { id:"wsize",   label: sit.size === "3x" ? p.optOpen2 : p.optOpen4,  correct: false, explanation: p.wrongSizeExp },
    { id:"limp",    label: p.optLimp,                                     correct: false, explanation: p.wrongLimpExp },
  ].sort(() => Math.random() - 0.5);
}

// Genera la lista de "jugadas correctas" posibles para una situación, según su tipo.
// Cada opción es { open, size, label }. Usado por EditProposalModal para que el usuario
// elija cuál cree que debería ser la jugada correcta.
function correctActionOptions(sit, p, lang) {
  if (sit.type === "cbet" || sit.type === "vbet") {
    const opts = [
      { open: false, size: null, label: p.optCheck },
      { open: true,  size: "small", label: p.optCbetSmall },
    ];
    if (sit.type === "vbet") opts.push({ open: true, size: "medium", label: p.optVbetMedium });
    opts.push({ open: true, size: "large", label: p.optCbetLarge });
    opts.push({ open: true, size: "pot", label: p.optCbetPot });
    return opts;
  }
  if (sit.type === "iso") {
    const isoLabel = sit.limpers === 2 ? p.optIso5 : p.optIso4;
    return [
      { open: true,  size: null, label: isoLabel },
      { open: false, size: null, label: p.optFold },
    ];
  }
  if (sit.type === "call" || sit.type === "facing") {
    return [
      { open: true,  size: null, label: p.actionCall },
      { open: false, size: null, label: p.optFold },
    ];
  }
  // open type (RFI)
  const openLabel = sit.size === "3x" ? p.optOpen3 : p.optOpen25;
  return [
    { open: true,  size: null, label: openLabel },
    { open: false, size: null, label: p.optFold },
  ];
}

// Aplica un override aprobado por la comunidad (si existe) sobre una situación.
// `overrides` es un mapa { "type_id": { open, size, es, en } }.
function applyOverride(sit, overrides) {
  if (!overrides || !sit) return sit;
  const ov = overrides[`${sit.type}_${sit.id}`];
  if (!ov) return sit;
  const merged = { ...sit };
  if (ov.open !== null && ov.open !== undefined) merged.open = ov.open;
  if (ov.size !== null && ov.size !== undefined) merged.size = ov.size;
  if (ov.es) merged.es = ov.es;
  if (ov.en) merged.en = ov.en;
  return merged;
}


// ── VALUE BETTING SITUATIONS ──────────────────────────────────────────────────
// type:"vbet" — open=true → value bet at 'size'; open=false → check
// descEs/descEn: full hand history shown to player before deciding
const VBET_SITUATIONS = [
  // ── FLOP VALUE vs FISH IP (20) ───────────────────────────────────────────
  {id:401,type:"vbet",hand:"A♠K♣",board:"A♦7♣2♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish recreativo, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB efectivos.\nFlop A♦7♣2♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (recreational fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB effective.\nFlop A♦7♣2♥: BB checks. Hero acts.",
   es:"TPTK en flop seco vs fish. Value bet 67% — el fish paga con Ax débil, 7x, draws. Construye bote 3 calles.",en:"TPTK on dry flop vs fish. Value bet 67% — fish pays with weak Ax, 7x, draws. Build the pot for 3 streets."},
  {id:402,type:"vbet",hand:"K♥K♦",board:"Q♦8♣3♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 60%, WTSD 40%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop Q♦8♣3♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 60%, WTSD 40%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop Q♦8♣3♥: BB checks. Hero acts.",
   es:"KK overpair en flop seco. Value bet 67% — el fish paga con Q, pares menores y draws.",en:"KK overpair on dry flop. Value bet 67% — fish pays with Q, lower pairs and draws."},
  {id:403,type:"vbet",hand:"Q♠Q♥",board:"J♦7♣2♠",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish pasivo, VPIP 52%, WTSD 36%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop J♦7♣2♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (passive fish, VPIP 52%, WTSD 36%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop J♦7♣2♠: BB checks. Hero acts.",
   es:"QQ overpair en J72r. Value bet 67% vs fish — paga con Jx, pares menores.",en:"QQ overpair on J72r. Value bet 67% vs fish — pays with Jx, lower pairs."},
  {id:404,type:"vbet",hand:"A♦Q♦",board:"A♠J♣4♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"CO",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BB (fish, VPIP 58%, WTSD 37%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♠J♣4♥: BB checkea. Hero actúa desde CO (IP).",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BB (fish, VPIP 58%, WTSD 37%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♠J♣4♥: BB checks. Hero acts from CO (IP).",
   es:"TPTK en A-J-4r vs fish. El fish paga con Ax débil, Jx, draws. Apuesta 67%.",en:"TPTK on A-J-4r vs fish. Fish pays with weak Ax, Jx, flush draws. Bet 67%."},
  {id:405,type:"vbet",hand:"J♠J♦",board:"9♦5♣2♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish recreativo, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop 9♦5♣2♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (recreational fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop 9♦5♣2♥: BB checks. Hero acts.",
   es:"JJ overpair en flop muy bajo. El fish tiene muchos 9x y 5x en rango. Apuesta 67%.",en:"JJ overpair on very low board. Fish has lots of 9x and 5x in range. Bet 67%."},
  {id:406,type:"vbet",hand:"T♠T♦",board:"8♠5♦2♣",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 62%, WTSD 41%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop 8♠5♦2♣: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 62%, WTSD 41%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop 8♠5♦2♣: BB checks. Hero acts.",
   es:"TT overpair en flop 852r. El fish tiene muchos 8x, 5x, manos débiles. Bet 67%.",en:"TT overpair on 852r board. Fish has lots of 8x, 5x, weak hands. Bet 67%."},
  {id:407,type:"vbet",hand:"8♠8♦",board:"8♥5♦2♣",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop 8♥5♦2♣: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop 8♥5♦2♣: BB checks. Hero acts with a set.",
   es:"Set de 8s en flop seco. Apuesta 67% — construye bote, no hay draws reales que regalar.",en:"Set of eights on dry board. Bet 67% — build pot, no real draws to give away."},
  {id:408,type:"vbet",hand:"A♣J♣",board:"A♥9♦3♣",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 58%, WTSD 40%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♥9♦3♣: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 58%, WTSD 40%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♥9♦3♣: BB checks. Hero acts.",
   es:"TPTK con backdoor flush. El fish paga con Ax, 9x. Apuesta 67%.",en:"TPTK with backdoor flush. Fish pays with Ax, 9x. Bet 67%."},
  {id:409,type:"vbet",hand:"K♠Q♠",board:"K♦8♣3♠",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 53%, WTSD 36%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop K♦8♣3♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 53%, WTSD 36%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop K♦8♣3♠: BB checks. Hero acts.",
   es:"Top pair buena kicker en flop seco. Fish paga con K débil, 8x. Bet 67%.",en:"Top pair good kicker on dry flop. Fish pays with weak K, 8x. Bet 67%."},
  {id:410,type:"vbet",hand:"9♥9♦",board:"7♦4♣2♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"CO",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BB (fish, VPIP 57%, WTSD 39%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop 7♦4♣2♥: BB checkea. Hero actúa desde CO (IP).",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BB (fish, VPIP 57%, WTSD 39%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop 7♦4♣2♥: BB checks. Hero acts from CO (IP).",
   es:"99 overpair en flop muy bajo seco. Apuesta 67% — el fish pagará con todo su rango amplio.",en:"99 overpair on very low dry flop. Bet 67% — fish pays with their whole wide range."},
  {id:411,type:"vbet",hand:"K♣K♥",board:"K♠9♦4♣",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop K♠9♦4♣: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop K♠9♦4♣: BB checks. Hero acts with a set.",
   es:"Set de reyes en flop seco. Aunque hay tentación de slowplay, el fish pasivo no apostará — value bet 67%.",en:"Set of kings on dry board. Though tempting to slowplay, the passive fish won't bet — value bet 67%."},
  {id:412,type:"vbet",hand:"J♣T♦",board:"J♥T♣4♠",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 60%, WTSD 41%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop J♥T♣4♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 60%, WTSD 41%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop J♥T♣4♠: BB checks. Hero acts.",
   es:"Dos pares top en flop semi-seco. Mucho rango pagando (Jx, Tx, draws). Bet 67%.",en:"Top two pair on semi-dry flop. Wide paying range (Jx, Tx, draws). Bet 67%."},
  {id:413,type:"vbet",hand:"A♦A♣",board:"A♠7♦3♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♠7♦3♥: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♠7♦3♥: BB checks. Hero acts with a set.",
   es:"Set de ases en flop seco. El fish paga con cualquier A, 7x, 3x. Bet 67% para construir.",en:"Set of aces on dry board. Fish pays with any A, 7x, 3x. Bet 67% to build."},
  {id:414,type:"vbet",hand:"A♥8♥",board:"A♣8♦3♠",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 57%, WTSD 39%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♣8♦3♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 57%, WTSD 39%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♣8♦3♠: BB checks. Hero acts.",
   es:"Dos pares top-bottom (A+8) en flop seco. Bet 67% — fish paga con Ax, 8x.",en:"Top-bottom two pair (A+8) on dry flop. Bet 67% — fish pays with Ax, 8x."},
  {id:415,type:"vbet",hand:"T♣9♣",board:"T♦9♠4♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 37%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop T♦9♠4♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 37%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop T♦9♠4♥: BB checks. Hero acts.",
   es:"Dos pares top en T94r. El fish paga con Tx, 9x, draws. Bet 67%.",en:"Top two pair on T94r. Fish pays with Tx, 9x, draws. Bet 67%."},
  {id:416,type:"vbet",hand:"A♠T♠",board:"A♦6♣2♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"CO",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BB (fish, VPIP 58%, WTSD 40%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♦6♣2♥: BB checkea. Hero actúa desde CO (IP).",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BB (fish, VPIP 58%, WTSD 40%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♦6♣2♥: BB checks. Hero acts from CO (IP).",
   es:"TPTK en A62r. Apuesta 67% — construye bote vs rango débil del fish.",en:"TPTK on A62r. Bet 67% — build pot vs fish's weak range."},
  {id:417,type:"vbet",hand:"Q♦Q♣",board:"Q♥6♣2♠",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"CO",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop Q♥6♣2♠: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop Q♥6♣2♠: BB checks. Hero acts with a set.",
   es:"Set de reinas en Q62r. Apuesta grande — fish tiene amplio rango de pago.",en:"Set of queens on Q62r. Bet big — fish has wide paying range."},
  {id:418,type:"vbet",hand:"A♣K♦",board:"A♠K♣7♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 60%, WTSD 42%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♠K♣7♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 60%, WTSD 42%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♠K♣7♥: BB checks. Hero acts.",
   es:"Dos pares top (A+K) en AK7r. Mano premium, apuesta 67% vs fish.",en:"Top two pair (A+K) on AK7r. Premium hand, bet 67% vs fish."},
  {id:419,type:"vbet",hand:"7♥7♦",board:"7♠4♣2♥",street:"flop",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop 7♠4♣2♥: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop 7♠4♣2♥: BB checks. Hero acts with a set.",
   es:"Set de 7s en flop muy bajo. Fish paga con cualquier par. Bet 67%.",en:"Set of sevens on very low board. Fish pays with any pair. Bet 67%."},
  // ── TURN VALUE vs FISH IP (20) ─────────────────────────────────────────────
  {id:420,type:"vbet",hand:"A♠K♣",board:"A♦7♣2♥9♠",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop A♦7♣2♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 9♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop A♦7♣2♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 9♠: BB checks. Hero acts.",
   es:"TPTK segunda calle vs fish. El 9 no cambia nada. Bet 67% turn para construir hacia river.",en:"TPTK second street vs fish. The 9 changes nothing. Bet 67% turn to build toward river."},
  {id:421,type:"vbet",hand:"K♥K♦",board:"Q♦8♣3♥K♠",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 60%, WTSD 40%) paga. Bote: 5.5BB.\nFlop Q♦8♣3♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn K♠: BB checkea. Hero actúa (ahora tiene set de reyes).",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 60%, WTSD 40%) calls. Pot: 5.5BB.\nFlop Q♦8♣3♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn K♠: BB checks. Hero acts (now has set of kings).",
   es:"Set de reyes en turn. Mano monster. Bet 67% — construye hacia el river.",en:"Set of kings on turn. Monster hand. Bet 67% — build toward river."},
  {id:422,type:"vbet",hand:"J♠J♦",board:"9♦5♣2♥4♠",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 52%, WTSD 36%) paga. Bote: 5.5BB.\nFlop 9♦5♣2♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 4♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 52%, WTSD 36%) calls. Pot: 5.5BB.\nFlop 9♦5♣2♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 4♠: BB checks. Hero acts.",
   es:"JJ overpair segunda calle en board bajo. Straight draw llegó pero JJ sigue liderando el rango del fish. Bet 67%.",en:"JJ overpair second street on low board. Straight draw arrived but JJ still leads fish's range. Bet 67%."},
  {id:423,type:"vbet",hand:"A♦Q♦",board:"A♠J♣4♥8♦",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"CO",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BB (fish, VPIP 58%, WTSD 37%) paga. Bote: 5.5BB.\nFlop A♠J♣4♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 8♦: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BB (fish, VPIP 58%, WTSD 37%) calls. Pot: 5.5BB.\nFlop A♠J♣4♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 8♦: BB checks. Hero acts.",
   es:"TPTK en turn. La 8 no cambia mucho. El fish sigue teniendo Ax, Jx. Bet 67%.",en:"TPTK on turn. The 8 doesn't change much. Fish still has Ax, Jx. Bet 67%."},
  {id:424,type:"vbet",hand:"T♣9♣",board:"T♦9♠4♥Q♣",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 37%) paga. Bote: 5.5BB.\nFlop T♦9♠4♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn Q♣: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 37%) calls. Pot: 5.5BB.\nFlop T♦9♠4♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn Q♣: BB checks. Hero acts.",
   es:"Dos pares en turn con Q. La Q ayuda a JK pero fish sigue pagando con Tx, 9x, draws. Bet 67%.",en:"Two pair on turn with Q. Q helps JK but fish still pays with Tx, 9x, draws. Bet 67%."},
  {id:425,type:"vbet",hand:"8♣8♦",board:"8♥5♦2♣J♠",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop 8♥5♦2♣: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn J♠: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop 8♥5♦2♣: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn J♠: BB checks. Hero acts with a set.",
   es:"Set de 8s en turn con J. Algún draw de J pero set sigue siendo dominante. Bet 67%.",en:"Set of eights on turn with J. Some J draws but set still dominant. Bet 67%."},
  {id:426,type:"vbet",hand:"A♥8♥",board:"A♣8♦3♠7♥",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 57%, WTSD 39%) paga. Bote: 5.5BB.\nFlop A♣8♦3♠: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 7♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 57%, WTSD 39%) calls. Pot: 5.5BB.\nFlop A♣8♦3♠: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 7♥: BB checks. Hero acts.",
   es:"Dos pares en turn. La 7 añade algo de draws pero el fish sigue pagando. Bet 67%.",en:"Two pair on turn. The 7 adds some draws but fish still pays. Bet 67%."},
  {id:427,type:"vbet",hand:"Q♥Q♣",board:"J♦7♣2♥T♠",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 52%, WTSD 36%) paga. Bote: 5.5BB.\nFlop J♦7♣2♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn T♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 52%, WTSD 36%) calls. Pot: 5.5BB.\nFlop J♦7♣2♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn T♠: BB checks. Hero acts.",
   es:"QQ overpair en turn con T. Mano fuerte vs rango de fish. Bet 67%.",en:"QQ overpair on turn with T. Strong hand vs fish range. Bet 67%."},
  {id:428,type:"vbet",hand:"K♣K♦",board:"Q♦8♣3♥5♦",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 60%, WTSD 40%) paga. Bote: 5.5BB.\nFlop Q♦8♣3♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 5♦: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 60%, WTSD 40%) calls. Pot: 5.5BB.\nFlop Q♦8♣3♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 5♦: BB checks. Hero acts.",
   es:"KK overpair en turn. Sin cartas de peligro graves. El fish paga con Qx. Bet 67%.",en:"KK overpair on turn. No serious danger cards. Fish pays with Qx. Bet 67%."},
  {id:429,type:"vbet",hand:"A♣A♦",board:"A♠7♦3♥5♣",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop A♠7♦3♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 5♣: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop A♠7♦3♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 5♣: BB checks. Hero acts with a set.",
   es:"Set de ases en turn. La 5 no cambia nada. Fish paga con cualquier cosa. Bet 67%.",en:"Set of aces on turn. The 5 changes nothing. Fish pays with anything. Bet 67%."},
  {id:430,type:"vbet",hand:"J♦T♦",board:"J♥T♣4♠K♠",street:"turn",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 60%, WTSD 41%) paga. Bote: 5.5BB.\nFlop J♥T♣4♠: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn K♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 60%, WTSD 41%) calls. Pot: 5.5BB.\nFlop J♥T♣4♠: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn K♠: BB checks. Hero acts.",
   es:"Dos pares en turn con K. La K ayuda a AQ pero fish sigue teniendo Jx, Tx. Bet 67%.",en:"Two pair on turn with K. K helps AQ but fish still has Jx, Tx. Bet 67%."},
  // ── RIVER VALUE BETS — THICK & THIN (25) ──────────────────────────────────
  {id:431,type:"vbet",hand:"A♠K♣",board:"A♦7♣2♥9♠J♦",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop A♦7♣2♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 9♠: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver J♦: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop A♦7♣2♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 9♠: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver J♦: BB checks. Hero acts.",
   es:"TPTK en river sin draws completados. El fish pagó 2 calles — sigue teniendo Ax, Jx, 9x. Bet 67%.",en:"TPTK on river with no completed draws. Fish called 2 streets — still has Ax, Jx, 9x. Bet 67%."},
  {id:432,type:"vbet",hand:"K♥K♦",board:"Q♦8♣3♥K♠5♠",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 60%, WTSD 40%) paga. Bote: 5.5BB.\nFlop Q♦8♣3♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn K♠: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 5♠: BB checkea. Hero actúa con set de reyes.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 60%, WTSD 40%) calls. Pot: 5.5BB.\nFlop Q♦8♣3♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn K♠: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 5♠: BB checks. Hero acts with set of kings.",
   es:"Set de reyes en river. Flush llegó pero es de picas (5♠). El fish puede tener Qx, trips. Bet 67%.",en:"Set of kings on river. Flush arrived but it's spades (5♠). Fish may have Qx, trips. Bet 67%."},
  {id:433,type:"vbet",hand:"J♣T♣",board:"J♠T♦4♥9♣2♠",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 37%) paga. Bote: 5.5BB.\nFlop J♠T♦4♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 9♣: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 2♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 37%) calls. Pot: 5.5BB.\nFlop J♠T♦4♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 9♣: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 2♠: BB checks. Hero acts.",
   es:"Dos pares top en river seco. El fish pagó 2 calles — tiene Jx, Tx. Bet 67%.",en:"Top two pair on dry river. Fish called 2 streets — has Jx, Tx. Bet 67%."},
  {id:434,type:"vbet",hand:"A♦Q♦",board:"A♠J♣4♥8♦3♠",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"CO",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BB (fish, VPIP 58%, WTSD 37%) paga. Bote: 5.5BB.\nFlop A♠J♣4♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 8♦: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 3♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BB (fish, VPIP 58%, WTSD 37%) calls. Pot: 5.5BB.\nFlop A♠J♣4♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 8♦: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 3♠: BB checks. Hero acts.",
   es:"TPTK en river blank. Sin draws completados. Fish sigue pagando con Ax. Bet 67%.",en:"TPTK on blank river. No completed draws. Fish still pays with Ax. Bet 67%."},
  {id:435,type:"vbet",hand:"Q♥9♥",board:"Q♠9♦2♣K♥7♠",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop Q♠9♦2♣: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn K♥: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 7♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop Q♠9♦2♣: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn K♥: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 7♠: BB checks. Hero acts.",
   es:"Dos pares en river. La K ayuda a algunas manos pero fish paga con Qx, 9x. Bet 67%.",en:"Two pair on river. The K helps some hands but fish pays with Qx, 9x. Bet 67%."},
  {id:436,type:"vbet",hand:"8♣8♦",board:"8♥5♦2♣J♠4♣",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop 8♥5♦2♣: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn J♠: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 4♣: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop 8♥5♦2♣: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn J♠: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 4♣: BB checks. Hero acts with set.",
   es:"Set de 8s en river. La 4 no ayuda al rival. Fish paga con Jx, pares menores. Bet 67%.",en:"Set of eights on river. The 4 doesn't help villain. Fish pays with Jx, lower pairs. Bet 67%."},
  {id:437,type:"vbet",hand:"K♠Q♠",board:"K♦J♣8♠Q♥6♠",street:"river",open:true,size:"small",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop K♦J♣8♠: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn Q♥: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 6♠: BB checkea. Hero actúa. Flush de picas llegó.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop K♦J♣8♠: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn Q♥: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 6♠: BB checks. Hero acts. Spade flush arrived.",
   es:"Dos pares en river con flush completado. Thin value 33% — el fish tiene mucho Kx, Qx que paga sizing pequeño. No apuestes grande con flush en tablero.",en:"Two pair on river with completed flush. Thin value 33% — fish has lots of Kx, Qx paying small sizing. Don't bet big with flush on board."},
  {id:438,type:"vbet",hand:"A♣T♣",board:"A♦6♣2♥T♠Q♥",street:"river",open:true,size:"small",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 57%, WTSD 39%) paga. Bote: 5.5BB.\nFlop A♦6♣2♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn T♠: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver Q♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 57%, WTSD 39%) calls. Pot: 5.5BB.\nFlop A♦6♣2♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn T♠: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver Q♥: BB checks. Hero acts.",
   es:"Dos pares A+T en river con Q. La Q puede haber dado a KJ un straight. Thin value 33%.",en:"Two pair A+T on river with Q. Q may have given KJ a straight. Thin value 33%."},
  {id:439,type:"vbet",hand:"J♦J♣",board:"9♦5♣2♥K♠7♥",street:"river",open:true,size:"small",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 52%, WTSD 36%) paga. Bote: 5.5BB.\nFlop 9♦5♣2♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn K♠: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 7♥: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 52%, WTSD 36%) calls. Pot: 5.5BB.\nFlop 9♦5♣2♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn K♠: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 7♥: BB checks. Hero acts.",
   es:"JJ overpair en river. La K y 7 pueden haber conectado. Thin value 33% — fish tiene 9x, pares medios.",en:"JJ overpair on river. K and 7 may have connected. Thin value 33% — fish has 9x, medium pairs."},
  {id:440,type:"vbet",hand:"9♠9♦",board:"9♥6♦3♠2♣Q♦",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop 9♥6♦3♠: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 2♣: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver Q♦: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop 9♥6♦3♠: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 2♣: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver Q♦: BB checks. Hero acts with set.",
   es:"Set de 9s en river. La Q no daña tu mano. Fish paga con 6x, Qx, pares. Bet 67%.",en:"Set of nines on river. The Q doesn't hurt your hand. Fish pays with 6x, Qx, pairs. Bet 67%."},
  {id:441,type:"vbet",hand:"A♠8♣",board:"A♦8♠5♣3♥K♦",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 57%, WTSD 39%) paga. Bote: 5.5BB.\nFlop A♦8♠5♣: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 3♥: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver K♦: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 57%, WTSD 39%) calls. Pot: 5.5BB.\nFlop A♦8♠5♣: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 3♥: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver K♦: BB checks. Hero acts.",
   es:"Dos pares A+8 en river. La K no daña tu rango. Fish paga con Ax, 8x. Bet 67%.",en:"Two pair A+8 on river. The K doesn't hurt your range. Fish pays with Ax, 8x. Bet 67%."},
  {id:442,type:"vbet",hand:"K♣K♦",board:"K♠9♦4♣7♠2♥",street:"river",open:true,size:"pot",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop K♠9♦4♣: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 7♠: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 2♥: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop K♠9♦4♣: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 7♠: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 2♥: BB checks. Hero acts with set.",
   es:"Set de reyes en river seco. El fish pagó 2 calles con rango amplio. Bet pot para maximizar.",en:"Set of kings on dry river. Fish called 2 streets with wide range. Bet pot to maximize."},
  {id:443,type:"vbet",hand:"A♥A♦",board:"A♣7♦3♥5♣J♠",street:"river",open:true,size:"pot",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop A♣7♦3♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 5♣: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver J♠: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop A♣7♦3♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 5♣: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver J♠: BB checks. Hero acts with set.",
   es:"Set de ases en river. River blank. Fish sigue pagando con Ax, Jx. Bet pot.",en:"Set of aces on river. Blank river. Fish still pays with Ax, Jx. Bet pot."},
  {id:444,type:"vbet",hand:"A♣Q♣",board:"A♠Q♦5♥3♣7♦",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 58%, WTSD 40%) paga. Bote: 5.5BB.\nFlop A♠Q♦5♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 3♣: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 7♦: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 58%, WTSD 40%) calls. Pot: 5.5BB.\nFlop A♠Q♦5♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 3♣: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 7♦: BB checks. Hero acts.",
   es:"Dos pares A+Q en river seco. Sin draws. Fish paga con Ax, Qx, 5x. Bet 67%.",en:"Two pair A+Q on dry river. No draws. Fish pays with Ax, Qx, 5x. Bet 67%."},
  {id:445,type:"vbet",hand:"T♦9♦",board:"T♠9♣4♥2♦8♣",street:"river",open:true,size:"medium",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 37%) paga. Bote: 5.5BB.\nFlop T♠9♣4♥: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn 2♦: BB checkea. Hero apuesta 9BB (67%). BB paga. Bote: 31.5BB.\nRiver 8♣: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 37%) calls. Pot: 5.5BB.\nFlop T♠9♣4♥: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn 2♦: BB checks. Hero bets 9BB (67%). BB calls. Pot: 31.5BB.\nRiver 8♣: BB checks. Hero acts.",
   es:"Dos pares en river. La 8 completa algunos draws pero tienes full info de 2 calles pagadas. Bet 67%.",en:"Two pair on river. The 8 completes some draws but you have full info from 2 called streets. Bet 67%."},
  // ── SHOULD CHECK — WRONG TO BET (30) ─────────────────────────────────────
  {id:446,type:"vbet",hand:"K♣J♦",board:"A♠Q♠J♦",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (regular, VPIP 22%, WTSD 24%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♠Q♠J♦: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (regular, VPIP 22%, WTSD 24%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♠Q♠J♦: BB checks. Hero acts.",
   es:"Par de jotas en flop A-Q-J vs regular. El regular tiene AX, QX, dos pares, sets. Fuerza relativa insuficiente. Check.",en:"Pair of jacks on A-Q-J vs regular. Regular has AX, QX, two pair, sets. Insufficient relative strength. Check."},
  {id:447,type:"vbet",hand:"Q♥J♥",board:"K♠Q♠J♣",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop K♠Q♠J♣: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop K♠Q♠J♣: BB checks. Hero acts.",
   es:"Dos pares en flop K-Q-J muy conectado. El fish tiene AX, AJ, flush draw. Fuerza relativa mediocre. Check.",en:"Two pair on very connected K-Q-J flop. Fish has AX, AJ, flush draw. Mediocre relative strength. Check."},
  {id:448,type:"vbet",hand:"J♠J♦",board:"A♦K♣Q♠",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (regular, VPIP 22%, WTSD 24%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♦K♣Q♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (regular, VPIP 22%, WTSD 24%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♦K♣Q♠: BB checks. Hero acts.",
   es:"JJ (underpair) en tablero A-K-Q. Fuerza relativa pésima — el regular tiene broadway constantemente. Check.",en:"JJ (underpair) on A-K-Q board. Terrible relative strength — regular constantly has broadway. Check."},
  {id:449,type:"vbet",hand:"Q♠Q♦",board:"Q♥J♥T♥",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish agresivo, VPIP 60%, WTSD 35%, Float flop 45%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop Q♥J♥T♥: BB checkea. Hero actúa con set.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (aggressive fish, VPIP 60%, WTSD 35%, Float flop 45%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop Q♥J♥T♥: BB checks. Hero acts with set.",
   es:"Set de reinas en tablero monotone de corazones muy conectado. Slowplay — el agresivo apostará si checkeas, induciendo valor con todo su rango.",en:"Set of queens on monotone very connected hearts board. Slowplay — the aggressive player bets if you check, inducing value from their whole range."},
  {id:450,type:"vbet",hand:"A♣5♣",board:"A♠Q♣J♣",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"CO",callPos:"BTN",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BTN (regular sólido, VPIP 22%, WTSD 24%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop A♠Q♣J♣: BTN checkea. Hero actúa (OOP).",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BTN (solid regular, VPIP 22%, WTSD 24%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop A♠Q♣J♣: BTN checks. Hero acts (OOP).",
   es:"Top pair kicker mala vs regular IP en A-Q-J conectado. El reg tiene AQ, AJ, sets, KT. Fuerza relativa dudosa. Check.",en:"Top pair bad kicker vs regular IP on connected A-Q-J. Reg has AQ, AJ, sets, KT. Doubtful relative strength. Check."},
  {id:451,type:"vbet",hand:"8♠7♠",board:"8♦7♣6♣",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB · Stacks: 100BB.\nFlop 8♦7♣6♣: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB · Stacks: 100BB.\nFlop 8♦7♣6♣: BB checks. Hero acts.",
   es:"Dos pares en tablero mojado con flush draw y straight draw. Fuerza relativa disminuida — muchos draws te baten. Checkea e induce o controla el bote.",en:"Two pair on wet board with flush and straight draws. Diminished relative strength — many draws beat you. Check and induce or control pot."},
  {id:452,type:"vbet",hand:"K♦Q♦",board:"K♠Q♥J♠",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"SB",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre SB a 3BB. BB (fish agresivo, VPIP 60%, Float flop 48%) paga. Bote: 6BB · Stacks: 100BB.\nFlop K♠Q♥J♠: Hero actúa primero (OOP).",
   descEn:"Preflop (NL25): Hero opens SB to 3BB. BB (aggressive fish, VPIP 60%, Float flop 48%) calls. Pot: 6BB · Stacks: 100BB.\nFlop K♠Q♥J♠: Hero acts first (OOP).",
   es:"Dos pares OOP vs BB agresivo. El agresivo apostará si checkeas — induces más valor checkeando.",en:"Two pair OOP vs aggressive BB. The aggressive player bets if you check — induce more value by checking."},
  {id:453,type:"vbet",hand:"A♥Q♥",board:"A♦Q♠T♥",street:"flop",open:false,size:null,ctx:"vbet_check",pos:"SB",callPos:"BTN",
   descEs:"Preflop (NL25): Hero abre SB a 3BB. BTN (regular IP agresivo, VPIP 28%, Float flop 42%) paga. Bote: 6.5BB · Stacks: 100BB.\nFlop A♦Q♠T♥: Hero actúa primero (OOP).",
   descEn:"Preflop (NL25): Hero opens SB to 3BB. BTN (aggressive regular IP, VPIP 28%, Float flop 42%) calls. Pot: 6.5BB · Stacks: 100BB.\nFlop A♦Q♠T♥: Hero acts first (OOP).",
   es:"Dos pares OOP vs regular IP agresivo. El regular apostará si checkeas — slowplay válido. Check e induce.",en:"Two pair OOP vs aggressive regular IP. The regular will bet if you check — valid slowplay. Check and induce."},
  {id:454,type:"vbet",hand:"A♠K♠",board:"A♦7♠2♠",street:"turn",open:true,size:"large",ctx:"vbet_reg_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (regular, VPIP 22%, WTSD 24%) paga. Bote: 5.5BB.\nFlop A♦7♠2♠: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn ?: El turn completa el quinto pica. BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (regular, VPIP 22%, WTSD 24%) calls. Pot: 5.5BB.\nFlop A♦7♠2♠: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn ?: The turn completes the fifth spade. BB checks. Hero acts.",
   es:"Color de As en turn (picas): tienes A♠K♠, el flop trae 7♠2♠ y el turn completa el quinto pica — tu color de As es la nuts (nadie puede tener un color más alto). Sigue apostando fuerte para construir el bote contra un regular que ya pagó el flop. Bet 67%.",en:"Ace-high flush on the turn (spades): you hold A♠K♠, the flop brought 7♠2♠, and the turn completes the fifth spade — your nut flush is the best possible hand (no one can have a higher flush). Keep betting big to build the pot against a regular who already called the flop. Bet 67%."},
  {id:455,type:"vbet",hand:"J♦T♦",board:"J♥T♣4♠Q♠",street:"turn",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (regular, VPIP 22%, WTSD 24%) paga. Bote: 5.5BB.\nFlop J♥T♣4♠: BB checkea. Hero apuesta 4BB (67%). BB paga. Bote: 13.5BB.\nTurn Q♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (regular, VPIP 22%, WTSD 24%) calls. Pot: 5.5BB.\nFlop J♥T♣4♠: BB checks. Hero bets 4BB (67%). BB calls. Pot: 13.5BB.\nTurn Q♠: BB checks. Hero acts.",
   es:"Dos pares en turn con Q que ayuda a AK, AJ. Fuerza relativa deteriorada vs regular. Thin check — evalúa el river.",en:"Two pair on turn with Q helping AK, AJ. Deteriorated relative strength vs regular. Thin check — evaluate river."},
  {id:456,type:"vbet",hand:"K♣Q♣",board:"K♠Q♦T♠J♣",street:"river",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop K♠Q♦T♠: BB checkea. Hero apuesta 4BB. BB paga. Bote: 13.5BB.\nTurn J♣: BB checkea. Hero apuesta 9BB. BB paga. Bote: 31.5BB.\nRiver ?: El river es un blank. BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop K♠Q♦T♠: BB checks. Hero bets 4BB. BB calls. Pot: 13.5BB.\nTurn J♣: BB checks. Hero bets 9BB. BB calls. Pot: 31.5BB.\nRiver ?: Blank river. BB checks. Hero acts.",
   es:"Dos pares en tablero K-Q-J-T. Cualquier A hace el straight. Cualquier 9 también. Fuerza relativa insuficiente. Check.",en:"Two pair on K-Q-J-T board. Any A makes the straight. Any 9 too. Insufficient relative strength. Check."},
  {id:457,type:"vbet",hand:"K♣K♦",board:"K♠K♥7♣2♥Q♠",street:"river",open:false,size:null,ctx:"vbet_check",pos:"SB",callPos:"BTN",
   descEs:"Preflop (NL25): Hero abre SB a 3BB. BTN (regular IP agresivo, Float flop 42%) paga. Bote: 6.5BB.\nFlop K♠K♥7♣: Hero checkea (slowplay). BTN checkea detrás. Bote: 6.5BB.\nTurn 2♥: Hero checkea. BTN checkea. Bote: 6.5BB.\nRiver Q♠: Hero actúa (OOP). Tiene quads.",
   descEn:"Preflop (NL25): Hero opens SB to 3BB. BTN (aggressive regular IP, Float flop 42%) calls. Pot: 6.5BB.\nFlop K♠K♥7♣: Hero checks (slowplay). BTN checks behind. Pot: 6.5BB.\nTurn 2♥: Hero checks. BTN checks. Pot: 6.5BB.\nRiver Q♠: Hero acts (OOP). Has quads.",
   es:"Quads de reyes OOP vs regular IP agresivo. Slowplay perfecto en river — el regular apostará si checkeas. Checkea e induce a apostar.",en:"Quad kings OOP vs aggressive regular IP. Perfect slowplay on river — the regular will bet if you check. Check and induce them to bet."},
  {id:458,type:"vbet",hand:"Q♣J♣",board:"Q♠J♦8♥K♣A♠",street:"river",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (regular, VPIP 22%, WTSD 24%) paga. Bote: 5.5BB.\nFlop Q♠J♦8♥: BB checkea. Hero apuesta 4BB. BB paga. Bote: 13.5BB.\nTurn K♣: BB checkea. Hero apuesta 9BB. BB paga. Bote: 31.5BB.\nRiver A♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (regular, VPIP 22%, WTSD 24%) calls. Pot: 5.5BB.\nFlop Q♠J♦8♥: BB checks. Hero bets 4BB. BB calls. Pot: 13.5BB.\nTurn K♣: BB checks. Hero bets 9BB. BB calls. Pot: 31.5BB.\nRiver A♠: BB checks. Hero acts.",
   es:"Dos pares Q+J en river A. El rango del regular que pagó 2 calles tiene mucho AX, KX. Fuerza relativa insuficiente. Check/fold.",en:"Two pair Q+J on A river. Regular's range that called 2 streets has lots of AX, KX. Insufficient relative strength. Check/fold."},
  {id:459,type:"vbet",hand:"A♦Q♦",board:"A♠Q♣T♦J♣K♠",street:"river",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop A♠Q♣T♦: BB checkea. Hero apuesta 4BB. BB paga. Bote: 13.5BB.\nTurn J♣: BB checkea. Hero apuesta 9BB. BB paga. Bote: 31.5BB.\nRiver K♠: BB checkea. Hero actúa.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop A♠Q♣T♦: BB checks. Hero bets 4BB. BB calls. Pot: 13.5BB.\nTurn J♣: BB checks. Hero bets 9BB. BB calls. Pot: 31.5BB.\nRiver K♠: BB checks. Hero acts.",
   es:"Dos pares A+Q en tablero completo A-K-Q-J-T. El straight comunitario aplana tu mano. Fuerza relativa pésima. Check.",en:"Two pair A+Q on complete A-K-Q-J-T board. The community straight flattens your hand. Terrible relative strength. Check."},
  {id:460,type:"vbet",hand:"K♥J♥",board:"K♠J♣8♥9♥T♥",street:"river",open:true,size:"large",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop K♠J♣8♥: BB checkea. Hero apuesta 4BB. BB paga. Bote: 13.5BB.\nTurn 9♥: BB checkea. Hero apuesta 9BB. BB paga. Bote: 31.5BB.\nRiver T♥: BB checkea. Hero actúa. El tablero es monotone de corazones.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop K♠J♣8♥: BB checks. Hero bets 4BB. BB calls. Pot: 13.5BB.\nTurn 9♥: BB checks. Hero bets 9BB. BB calls. Pot: 31.5BB.\nRiver T♥: BB checks. Hero acts. Board is monotone hearts.",
   es:"Color de K en tablero monotone de corazones (K♠J♣8♥9♥T♥): tienes K♥J♥ y el board trae 8♥9♥T♥, así que tienes color de Rey — solo pierdes contra Ax de corazones. El fish que pagó 2 calles tiene mucho corazón peor (Qx, Jx, 9x) y dos pares. Bet 67%.",en:"King-high flush on a monotone hearts board (K♠J♣8♥9♥T♥): you hold K♥J♥ and the board shows 8♥9♥T♥, so you have a King-high flush — you only lose to Ax of hearts. The fish who called 2 streets has lots of worse hearts (Qx, Jx, 9x) and two pair. Bet 67%."},
  {id:461,type:"vbet",hand:"T♣8♣",board:"T♦8♠6♥7♠9♣",street:"river",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop T♦8♠6♥: BB checkea. Hero apuesta 4BB. BB paga. Bote: 13.5BB.\nTurn 7♠: BB checkea. Hero apuesta 9BB. BB paga. Bote: 31.5BB.\nRiver 9♣: BB checkea. Hero actúa. El straight 6-7-8-9-T está en el board.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop T♦8♠6♥: BB checks. Hero bets 4BB. BB calls. Pot: 13.5BB.\nTurn 7♠: BB checks. Hero bets 9BB. BB calls. Pot: 31.5BB.\nRiver 9♣: BB checks. Hero acts. The 6-7-8-9-T straight is on the board.",
   es:"Dos pares T+8 en tablero con straight completo (6-7-8-9-T). Cualquier J o 5 tiene straight. Fuerza relativa destruida. Check.",en:"Two pair T+8 on board with completed straight (6-7-8-9-T). Any J or 5 has a straight. Relative strength destroyed. Check."},
  {id:462,type:"vbet",hand:"9♣8♣",board:"9♠8♦4♠2♥Q♠",street:"river",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"SB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. SB (fish, VPIP 55%, WTSD 38%) paga (los demás foldean). Bote: 5.5BB.\nFlop 9♠8♦4♠: SB checkea. Hero apuesta 4BB. SB paga. Bote: 13.5BB.\nTurn 2♥: SB checkea. Hero apuesta 9BB. SB paga. Bote: 31.5BB.\nRiver Q♠: SB checkea. Hero actúa. Hay 3 picas en el board.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. SB (fish, VPIP 55%, WTSD 38%) calls (others fold). Pot: 5.5BB.\nFlop 9♠8♦4♠: SB checks. Hero bets 4BB. SB calls. Pot: 13.5BB.\nTurn 2♥: SB checks. Hero bets 9BB. SB calls. Pot: 31.5BB.\nRiver Q♠: SB checks. Hero acts. 3 spades on the board.",
   es:"Dos pares 9+8 en river con flush de picas completo. El fish que pagó 2 calles puede tener flush. Fuerza relativa comprometida. Check.",en:"Two pair 9+8 on river with completed spade flush. Fish who called 2 streets may have the flush. Compromised relative strength. Check."},
  {id:463,type:"vbet",hand:"J♦J♣",board:"J♠8♦5♣Q♥K♣",street:"river",open:false,size:null,ctx:"vbet_check",pos:"CO",callPos:"BTN",
   descEs:"Preflop (NL25): Hero abre CO a 2.5BB. BTN (regular sólido IP, VPIP 22%, WTSD 24%) paga. Bote: 5.5BB.\nFlop J♠8♦5♣: BTN checkea. Hero apuesta 4BB. BTN paga. Bote: 13.5BB.\nTurn Q♥: BTN checkea. Hero apuesta 9BB. BTN paga. Bote: 31.5BB.\nRiver K♣: BTN checkea. Hero actúa (OOP).",
   descEn:"Preflop (NL25): Hero opens CO to 2.5BB. BTN (solid regular IP, VPIP 22%, WTSD 24%) calls. Pot: 5.5BB.\nFlop J♠8♦5♣: BTN checks. Hero bets 4BB. BTN calls. Pot: 13.5BB.\nTurn Q♥: BTN checks. Hero bets 9BB. BTN calls. Pot: 31.5BB.\nRiver K♣: BTN checks. Hero acts (OOP).",
   es:"Set de jotas OOP en river con K-Q arriba. El regular IP tiene AJ (full house), QQ, KK en rango. Fuerza relativa comprometida. Check/call sizing pequeño.",en:"Set of jacks OOP on river with K-Q on top. Regular IP has AJ (full house), QQ, KK in range. Compromised relative strength. Check/call small sizing."},
  {id:464,type:"vbet",hand:"5♠5♦",board:"5♥4♣3♦2♠A♥",street:"river",open:false,size:null,ctx:"vbet_check",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop 5♥4♣3♦: BB checkea. Hero apuesta 4BB. BB paga. Bote: 13.5BB.\nTurn 2♠: BB checkea. Hero apuesta 9BB. BB paga. Bote: 31.5BB.\nRiver A♥: BB checkea. Hero actúa con set. Tablero A-2-3-4-5 (wheel completa).",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop 5♥4♣3♦: BB checks. Hero bets 4BB. BB calls. Pot: 13.5BB.\nTurn 2♠: BB checks. Hero bets 9BB. BB calls. Pot: 31.5BB.\nRiver A♥: BB checks. Hero acts with set. Board is A-2-3-4-5 (complete wheel).",
   es:"Set de 5s en tablero wheel straight completo (A-2-3-4-5). Cualquier 6 tiene straight superior. La wheel es la mano que TIENE el rival si tiene A-2, A-3. Check.",en:"Set of fives on complete wheel straight board (A-2-3-4-5). Any 6 has a superior straight. The wheel is the hand the villain HAS if they have A-2, A-3. Check."},
  {id:465,type:"vbet",hand:"A♥T♥",board:"A♦T♣8♥Q♥K♥",street:"river",open:true,size:"large",ctx:"vbet_fish_ip",pos:"BTN",callPos:"BB",
   descEs:"Preflop (NL25): Hero abre BTN a 2.5BB. BB (fish, VPIP 55%, WTSD 38%) paga. Bote: 5.5BB.\nFlop A♦T♣8♥: BB checkea. Hero apuesta 4BB. BB paga. Bote: 13.5BB.\nTurn Q♥: BB checkea. Hero apuesta 9BB. BB paga. Bote: 31.5BB.\nRiver K♥: BB checkea. Hero actúa. Tablero monotone de corazones con A-T-8-Q-K.",
   descEn:"Preflop (NL25): Hero opens BTN to 2.5BB. BB (fish, VPIP 55%, WTSD 38%) calls. Pot: 5.5BB.\nFlop A♦T♣8♥: BB checks. Hero bets 4BB. BB calls. Pot: 13.5BB.\nTurn Q♥: BB checks. Hero bets 9BB. BB calls. Pot: 31.5BB.\nRiver K♥: BB checks. Hero acts. Monotone hearts board A-T-8-Q-K.",
   es:"Color de As en tablero monotone de corazones (A♦T♣8♥Q♥K♥): tienes A♥T♥ y el board ya trae 8♥Q♥K♥, así que tu color de As es la nuts (nadie puede tener un color más alto). El fish paga river con corazones peores (Kx, Qx, Jx, 9x) y con dos pares/sets. Bet 67%.",en:"Ace-high flush on a monotone hearts board (A♦T♣8♥Q♥K♥): you hold A♥T♥ and the board already shows 8♥Q♥K♥, so your Ace-high flush is the nuts (no one can have a higher flush). The fish calls river with worse hearts (Kx, Qx, Jx, 9x) and with two pair/sets. Bet 67%."},
];



// ─── STATS PAGE ───────────────────────────────────────────────────────────────
function StatsPage({ t, lang, xpData, completed, totalLessons }) {
  const lv = getLevelInfo(xpData.xp);
  const es = lang === "es";
  const catTotals = Object.values(xpData.categoryStats || {}).reduce(
    (acc, v) => ({ correct: acc.correct + (v?.correct || 0), total: acc.total + (v?.total || 0) }),
    { correct: 0, total: 0 }
  );
  const accuracy = catTotals.total > 0
    ? Math.round((catTotals.correct / catTotals.total) * 100)
    : 0;

  const typeLabels = {
    open:   { es:"Apertura (OR)",  en:"Opening (OR)",  icon:"♠" },
    iso:    { es:"ROL / ISO",      en:"ROL / ISO",     icon:"♣" },
    cbet:   { es:"C-Bet",          en:"C-Bet",          icon:"♥" },
    vbet:   { es:"Value Bet",      en:"Value Bet",      icon:"♦" },
    call:   { es:"Pagar apert.",   en:"Calling Opens",  icon:"⟵" },
    facing: { es:"Facing Bets",    en:"Facing Bets",    icon:"⚡" },
  };
  const typeOrder = ["open","iso","cbet","vbet","call","facing"];

  const StatCard = ({ label, value, sub, color="#c9a84c" }) => (
    <div style={{ background:"#0d0f1a", border:"1px solid #1e2235", borderRadius:12, padding:"14px 18px" }}>
      <div style={{ fontSize:11, color:"#8b8fa8", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#8b8fa8", marginTop:2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"28px 16px" }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:"#fff", margin:"0 0 24px" }}>
        {es?"Mis Estadísticas":"My Statistics"}
      </h2>

      {/* Level card */}
      <div style={{ background:"linear-gradient(135deg,#120f04,#0d0f1a)", border:"1px solid #c9a84c44", borderRadius:14, padding:"20px 24px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"#c9a84c22", border:"1px solid #c9a84c44", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>
            {xpData.level >= 6 ? "🏆" : xpData.level >= 4 ? "⭐" : xpData.level >= 2 ? "📈" : "🐟"}
          </div>
          <div>
            <div style={{ fontSize:13, color:"#8b8fa8" }}>{es?"Nivel":"Level"} {xpData.level}</div>
            <div style={{ fontSize:22, fontWeight:800, color:"#e8c96a" }}>{es ? lv.name : lv.nameEn}</div>
          </div>
          <div style={{ marginLeft:"auto", textAlign:"right" }}>
            <div style={{ fontSize:20, fontWeight:800, color:"#c9a84c" }}>{xpData.xp.toLocaleString()} XP</div>
            {lv.next && <div style={{ fontSize:11, color:"#8b8fa8" }}>{es?"Siguiente":"Next"}: {lv.next.min.toLocaleString()} XP</div>}
          </div>
        </div>
        {lv.next && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:"#8b8fa8" }}>{es?"Progreso":"Progress"} {lv.pct}%</span>
              <span style={{ fontSize:11, color:"#8b8fa8" }}>{lv.next.min.toLocaleString()} XP</span>
            </div>
            <div style={{ height:6, background:"#1e2235", borderRadius:4 }}>
              <div style={{ width:`${lv.pct}%`, height:"100%", background:"linear-gradient(90deg,#c9a84c,#e8c96a)", borderRadius:4, transition:"width 0.5s" }}/>
            </div>
          </div>
        )}
      </div>

      {/* Key stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:16 }}>
        <StatCard label={es?"Racha actual":"Current streak"} value={`🔥 ${xpData.streak}`} sub={es?`Máx: ${xpData.longestStreak} días`:`Best: ${xpData.longestStreak} days`} color="#f97316"/>
        <StatCard label={es?"Precisión global":"Global accuracy"} value={`${accuracy}%`} sub={`${catTotals.correct}/${catTotals.total} ${es?"correctas":"correct"}`} color={accuracy>=80?"#10b981":accuracy>=60?"#c9a84c":"#ef4444"}/>
        <StatCard label={es?"Sesiones jugadas":"Sessions played"} value={xpData.totalSessions} sub={es?"sesiones completadas":"completed sessions"} color="#8b5cf6"/>
        <StatCard label={es?"Lecciones":"Lessons"} value={`${completed.size}/${totalLessons}`} sub={es?"capítulos completados":"chapters completed"} color="#10b981"/>
      </div>

      {/* Category breakdown */}
      <div style={{ background:"#0d0f1a", border:"1px solid #1e2235", borderRadius:14, padding:"18px 20px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:16 }}>
          {es?"Precisión por categoría":"Accuracy by category"}
        </div>
        {typeOrder.map(typ => {
          const stats = (xpData.categoryStats || {})[typ];
          const { icon } = typeLabels[typ];
          const label = es ? typeLabels[typ].es : typeLabels[typ].en;
          if (!stats || stats.total === 0) {
            return (
              <div key={typ} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, color:"#8b8fa8" }}>{icon} {label}</span>
                  <span style={{ fontSize:12, color:"#3a3f5a" }}>{es?"Sin datos":"No data"}</span>
                </div>
                <div style={{ height:4, background:"#1e2235", borderRadius:4 }}/>
              </div>
            );
          }
          const pct = Math.round((stats.correct/stats.total)*100);
          const col = pct>=80?"#10b981":pct>=60?"#c9a84c":"#ef4444";
          return (
            <div key={typ} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:13, color:"#e8e8e8" }}>{icon} {label}</span>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:11, color:"#8b8fa8" }}>{stats.correct}/{stats.total}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:col, minWidth:36, textAlign:"right" }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height:5, background:"#1e2235", borderRadius:4 }}>
                <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:4, transition:"width 0.6s" }}/>
              </div>
            </div>
          );
        })}
        {Object.keys(xpData.categoryStats || {}).length === 0 && (
          <div style={{ textAlign:"center", padding:"24px 0", color:"#8b8fa8", fontSize:13 }}>
            {es?"Completa sesiones de test para ver tus estadísticas por categoría.":"Complete test sessions to see your stats by category."}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CALLING OPENS SITUATIONS ──────────────────────────────────────────────────
// type:"call" — open=true → should call; open=false → should fold/3-bet
const CALL_SITUATIONS = [
  // ── SET MINING IP — should call (20) ────────────────────────────────────────
  {id:501,type:"call",hand:"7♠ 7♦",board:null,open:true,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"77 vs UTG 3BB. Implied odds suficientes: rango UTG ajustado paga sets, stacks 100BB, estás IP. Inversión 3BB × 10 = target 30BB alcanzable. Paga.",en:"77 vs UTG 3BB. Sufficient implied odds: tight UTG range pays sets, 100BB stacks, you're IP. 3BB × 10 = 30BB target achievable. Call."},
  {id:502,type:"call",hand:"8♥ 8♦",board:null,open:true,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"88 vs MP 3BB desde CO. Excelente set mine: rango MP más amplio que UTG pero aún con manos premium que pagan sets postflop. IP con buenos implied odds. Paga.",en:"88 vs MP 3BB from CO. Excellent set mine: MP range wider than UTG but still has premium hands that pay off sets postflop. IP with good implied odds. Call."},
  {id:503,type:"call",hand:"6♣ 6♦",board:null,open:true,ctx:"call_ip_fish",pos:"BTN",callPos:"CO",es:"66 vs CO con fish en blinds. Fish amplían implied odds enormemente — pagarán tus sets. 66 es set mine claro con fish en el bote. Paga.",en:"66 vs CO with fish in blinds. Fish greatly increase implied odds — they'll pay off your sets. 66 is a clear set mine with fish in the pot. Call."},
  {id:504,type:"call",hand:"9♣ 9♦",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"99 vs CO BTN. 99 es híbrido: tiene valor de overpair en muchos flops bajos además del set value. Paga cómodamente IP vs CO.",en:"99 vs CO from BTN. 99 is a hybrid: has overpair value on many low boards plus set value. Comfortable call IP vs CO."},
  {id:505,type:"call",hand:"J♥ T♥",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"JTs vs CO 2.5BB desde BTN. Suited connector de primera clase: implied odds buenos (flush, straight), top pair potencial vs rango amplio CO. Paga.",en:"JTs vs CO 2.5BB from BTN. Top-class suited connector: good implied odds (flush, straight), top pair potential vs wide CO range. Call."},
  {id:506,type:"call",hand:"T♠ 9♠",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"T9s vs CO. Suited connector con buenos implied odds IP. Flopeá draws y top pair decente vs rango amplio CO. Paga desde BTN.",en:"T9s vs CO. Suited connector with good implied odds IP. Flops draws and decent top pair vs wide CO range. Call from BTN."},
  {id:507,type:"call",hand:"5♦ 5♣",board:null,open:true,ctx:"call_ip_fish",pos:"CO",callPos:"UTG",es:"55 vs UTG con fish en BB. Normalmente fold 55 vs UTG, pero el fish en el BB añade implied odds extra — sus errores postflop compensan la debilidad de la mano. Paga.",en:"55 vs UTG with fish in BB. Normally fold 55 vs UTG, but the fish in the BB adds extra implied odds — their postflop mistakes compensate for the hand's weakness. Call."},
  {id:508,type:"call",hand:"Q♠ J♠",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"QJs vs CO desde BTN. Suited connector alto con frequent strength y implied odds. Flopeá top pair bueno, flush draw y straight draws vs rango amplio CO. Paga.",en:"QJs vs CO from BTN. High suited connector with frequent strength and implied odds. Flops good top pair, flush draw and straight draws vs wide CO range. Call."},
  {id:509,type:"call",hand:"A♥ J♠",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"AJo vs CO 2.5BB desde BTN. Rango CO ~27% incluye muchas manos que AJo domina. Frequent strength, IP, tamaño pequeño. Paga.",en:"AJo vs CO 2.5BB from BTN. CO range ~27% includes many hands AJo dominates. Frequent strength, IP, small sizing. Call."},
  {id:510,type:"call",hand:"K♣ Q♦",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"KQo vs CO desde BTN. Frequent strength clara vs rango amplio CO — flopeá top pair que domina mucho del rango. Estás IP. Paga.",en:"KQo vs CO from BTN. Clear frequent strength vs wide CO range — flops top pair that dominates much of the range. You're IP. Call."},
  {id:511,type:"call",hand:"8♦ 7♦",board:null,open:true,ctx:"call_ip_fish",pos:"HJ",callPos:"UTG",es:"87s vs UTG con fish en blinds. Normalmente fold, pero fish en BB o SB añaden implied odds para suited connectors especulativos. Paga.",en:"87s vs UTG with fish in blinds. Normally fold, but fish in BB or SB add implied odds for speculative suited connectors. Call."},
  {id:512,type:"call",hand:"A♠ K♠",board:null,open:true,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"AKs vs MP desde CO. Mano premium que juega muy bien IP. Pagar mantiene el bote controlado y entras al flop con la mejor mano y posición — la línea más sólida aquí.",en:"AKs vs MP from CO. Premium hand that plays great IP. Calling keeps the pot controlled and you enter the flop with the best hand and position — the soundest line here."},
  {id:513,type:"call",hand:"9♥ 8♥",board:null,open:true,ctx:"call_ip_fish",pos:"BTN",callPos:"SB",es:"98s vs SB open con fish en BB. Fish en BB asegura bote multiway y implied odds extra. 98s conecta bien multiway. Paga.",en:"98s vs SB open with fish in BB. Fish in BB ensures multiway pot and extra implied odds. 98s connects well multiway. Call."},
  {id:514,type:"call",hand:"J♦ J♣",board:null,open:true,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"JJ vs MP desde CO. Pagar IP es la línea más sólida: mantienes el bote controlado, evitas inflarlo contra una mano que te domine (QQ+), y postflop juegas con posición y una mano fuerte.",en:"JJ vs MP from CO. Calling IP is the soundest line: keep the pot controlled, avoid bloating it against a hand that dominates you (QQ+), and postflop you play with position and a strong hand."},
  {id:515,type:"call",hand:"6♠ 5♠",board:null,open:true,ctx:"call_ip_fish",pos:"BTN",callPos:"CO",es:"65s vs CO con fish en blinds. Suited connector bajo con buenos implied odds cuando hay fish. Multiway potencial alto. Paga desde BTN.",en:"65s vs CO with fish in blinds. Low suited connector with good implied odds when fish are present. High multiway potential. Call from BTN."},
  {id:516,type:"call",hand:"A♦ T♦",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"ATs vs CO desde BTN. Suited ace con frequent strength (flopeá top pair bueno) y implied odds (flush draw). Paga IP.",en:"ATs vs CO from BTN. Suited ace with frequent strength (flops good top pair) and implied odds (flush draw). Call IP."},
  {id:517,type:"call",hand:"K♥ J♥",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"KJs vs CO. Suited broadway con frecuente strength vs rango CO amplio. IP desde BTN hace este pago cómodo.",en:"KJs vs CO. Suited broadway with frequent strength vs wide CO range. IP from BTN makes this call comfortable."},
  {id:518,type:"call",hand:"T♦ T♣",board:null,open:true,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"TT vs UTG desde HJ. TT es overpair frecuente en flops bajos y tiene set value. Pagar es la línea más sólida vs un rango UTG fuerte: mantiene el bote controlado y evita inflarlo contra manos que te dominen (JJ+).",en:"TT vs UTG from HJ. TT is a frequent overpair on low boards and has set value. Calling is the soundest line vs a strong UTG range: keeps the pot controlled and avoids bloating it against hands that dominate you (JJ+)."},
  {id:519,type:"call",hand:"Q♦ T♦",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"QTs vs CO desde BTN. Suited connector alto con frequent strength y implied odds. Flopeá buenas manos frecuentemente vs rango CO. Paga.",en:"QTs vs CO from BTN. High suited connector with frequent strength and implied odds. Flops good hands frequently vs CO range. Call."},
  {id:520,type:"call",hand:"A♣ 9♣",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"A9s vs CO desde BTN. Suited ace en posición perfecta. Flopeá top pair decente y tiene flush potential. Paga IP.",en:"A9s vs CO from BTN. Suited ace in perfect position. Flops decent top pair and has flush potential. Call IP."},
  // ── SHOULD FOLD IP — wrong to call (15) ─────────────────────────────────────
  {id:521,type:"call",hand:"3♣ 3♦",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"33 vs UTG 3BB en HJ. Set mine puro sin fish. 33 necesita ganar 30BB cuando flopeá set — vs rango UTG ajustado es marginal, pero con squeezers potenciales (CO/BTN/blinds por detrás) los implied odds no compensan. Foldea.",en:"33 vs UTG 3BB from HJ. Pure set mine without fish. 33 needs to win 30BB when flopping a set — vs tight UTG range it's marginal, but with potential squeezers (CO/BTN/blinds behind) implied odds don't compensate. Fold."},
  {id:522,type:"call",hand:"2♥ 2♣",board:null,open:false,ctx:"call_ip_reg",pos:"CO",callPos:"UTG",es:"22 vs UTG desde CO. 22 necesita condiciones perfectas para set mine. Vs UTG ajustado sin fish, con BTN por detrás, los implied odds no justifican 3BB de inversión. Foldea.",en:"22 vs UTG from CO. 22 needs perfect conditions for set mining. Vs tight UTG without fish, with BTN behind, implied odds don't justify 3BB investment. Fold."},
  {id:523,type:"call",hand:"8♣ 7♣",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"87s vs UTG 3BB en HJ sin fish. Sin fish en el bote, 87s no tiene suficientes implied odds vs rango UTG. No es set mine puro y el top pair que flopeá estará dominado frecuentemente. Foldea.",en:"87s vs UTG 3BB from HJ without fish. Without fish in the pot, 87s doesn't have enough implied odds vs UTG range. Not a pure set mine and the top pair it flops will frequently be dominated. Fold."},
  {id:524,type:"call",hand:"K♠ 4♦",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"K4o vs UTG desde HJ. Sin suited, sin implied odds, top pair con kicker mala que sufre de dominación vs rango ajustado. Foldea.",en:"K4o vs UTG from HJ. Not suited, no implied odds, top pair with bad kicker that suffers domination vs tight range. Fold."},
  {id:525,type:"call",hand:"J♣ 6♣",board:null,open:false,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"J6s vs MP desde CO. Demasiado débil como suited connector, demasiado dominado como top pair hand. Sin una razón clara (fish, pot odds extra), foldea.",en:"J6s vs MP from CO. Too weak as a suited connector, too dominated as a top pair hand. Without a clear reason (fish, extra pot odds), fold."},
  {id:526,type:"call",hand:"9♦ 6♦",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"96s vs UTG 3BB. Suited connector bajo vs rango muy ajustado — los implied odds no son suficientes sin fish. Foldea.",en:"96s vs UTG 3BB. Low suited connector vs very tight range — implied odds aren't sufficient without fish. Fold."},
  {id:527,type:"call",hand:"Q♣ 4♣",board:null,open:false,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"Q4s vs MP. Demasiado débil — no tiene neither frequent strength ni implied odds suficientes para justificar el pago IP vs rango MP. Foldea.",en:"Q4s vs MP. Too weak — has neither sufficient frequent strength nor implied odds to justify calling IP vs MP range. Fold."},
  {id:528,type:"call",hand:"A♠ 2♦",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"A2o vs UTG desde HJ. Offsuit, kicker muy débil, sufre dominación (A+mejor kicker). Sin implied odds ni frequent strength. Foldea.",en:"A2o vs UTG from HJ. Offsuit, very weak kicker, suffers domination (A+better kicker). No implied odds or frequent strength. Fold."},
  {id:529,type:"call",hand:"5♥ 5♣",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"55 vs UTG sin fish en HJ. Con squeezers potenciales por detrás (CO/BTN) y sin fish, 55 no tiene implied odds suficientes vs rango ajustado. Foldea.",en:"55 vs UTG without fish from HJ. With potential squeezers behind (CO/BTN) and no fish, 55 doesn't have sufficient implied odds vs tight range. Fold."},
  {id:530,type:"call",hand:"T♠ 3♠",board:null,open:false,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"T3s vs MP. Suited connector muy bajo — flopeá manos fácilmente dominadas y los implied odds no compensan el riesgo. Foldea.",en:"T3s vs MP. Very low suited connector — flops easily dominated hands and implied odds don't compensate the risk. Fold."},
  {id:531,type:"call",hand:"K♦ 8♣",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"K8o vs UTG. Mano sin suit, kicker media que sufre dominación. No tiene implied odds ni buena posición respecto al rango UTG. Foldea.",en:"K8o vs UTG. Unsuited, medium kicker that suffers domination. Has no implied odds and poor shape vs UTG range. Fold."},
  {id:532,type:"call",hand:"J♥ 4♥",board:null,open:false,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"J4s vs MP desde CO. Suited pero demasiado débil — J4 tiene muy poca frequent strength y los implied odds de suited connectors tan bajos no compensan. Foldea.",en:"J4s vs MP from CO. Suited but too weak — J4 has very little frequent strength and implied odds of such low suited connectors don't compensate. Fold."},
  {id:533,type:"call",hand:"4♠ 3♠",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"43s vs UTG. Suited connector muy bajo vs rango muy ajustado sin fish. Los implied odds de 43s son buenos con condiciones perfectas, pero no aquí. Foldea.",en:"43s vs UTG. Very low suited connector vs very tight range without fish. 43s implied odds are good with perfect conditions, but not here. Fold."},
  {id:534,type:"call",hand:"Q♦ 7♦",board:null,open:false,ctx:"call_ip_reg",pos:"CO",callPos:"MP",es:"Q7s vs MP. Too weak — no es suited connector real, no tiene frequent strength suficiente. Foldea desde CO.",en:"Q7s vs MP. Too weak — not a real suited connector, doesn't have sufficient frequent strength. Fold from CO."},
  {id:535,type:"call",hand:"A♣ 3♦",board:null,open:false,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"A3o vs UTG. Sin suit, kicker baja, sufre dominación brutal vs rango UTG. Foldea sin dudarlo.",en:"A3o vs UTG. Unsuited, low kicker, suffers brutal domination vs UTG range. Fold without hesitation."},
  // ── BB DEFENSE — should call (20) ────────────────────────────────────────────
  {id:536,type:"call",hand:"K♠ T♠",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"KTs desde BB vs BTN 2.5BB. Suited broadway con frequent strength e implied odds. Pot odds BB excelentes. Paga.",en:"KTs from BB vs BTN 2.5BB. Suited broadway with frequent strength and implied odds. Excellent BB pot odds. Call."},
  {id:537,type:"call",hand:"7♦ 7♣",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"77 desde BB vs BTN 2.5BB. Implied odds + pot odds BB = pago rentable. 77 tiene set value y algo de overpair value en flops bajos. Paga.",en:"77 from BB vs BTN 2.5BB. Implied odds + BB pot odds = profitable call. 77 has set value and some overpair value on low boards. Call."},
  {id:538,type:"call",hand:"A♥ 8♥",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"A8s desde BB vs BTN 2.5BB. Suited ace con frequent strength. Pot odds BB buenos, rango BTN amplio donde A8s domina frecuentemente. Paga.",en:"A8s from BB vs BTN 2.5BB. Suited ace with frequent strength. Good BB pot odds, wide BTN range where A8s frequently dominates. Call."},
  {id:539,type:"call",hand:"Q♣ 9♣",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"Q9s desde BB vs BTN 2.5BB. Suited connector con buenos implied odds y pot odds BB. Rango BTN amplio donde Q9s juega bien. Paga.",en:"Q9s from BB vs BTN 2.5BB. Suited connector with good implied odds and BB pot odds. Wide BTN range where Q9s plays well. Call."},
  {id:540,type:"call",hand:"J♠ 8♠",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"J8s desde BB vs BTN 2BB (min-raise). Pot odds excelentes vs min-raise. J8s tiene draws y potencial de top pair. Con rango BTN del 45%+, pagar es claramente +EV. Paga.",en:"J8s from BB vs BTN 2BB (min-raise). Excellent pot odds vs min-raise. J8s has draws and top pair potential. With BTN range of 45%+, calling is clearly +EV. Call."},
  {id:541,type:"call",hand:"K♦ 4♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"K4s desde BB vs BTN 2.5BB. Suited ace de kicker baja, pero pot odds BB + rango amplio BTN hacen el pago rentable. Flopeá K el 17% de las veces. Paga.",en:"K4s from BB vs BTN 2.5BB. Suited low-kicker ace, but BB pot odds + wide BTN range make the call profitable. Flops a K 17% of the time. Call."},
  {id:542,type:"call",hand:"T♥ 8♥",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"T8s desde BB vs CO 2.5BB. Suited connector con draws e implied odds. Desde BB con pot odds razonables vs rango CO. Paga.",en:"T8s from BB vs CO 2.5BB. Suited connector with draws and implied odds. From BB with reasonable pot odds vs CO range. Call."},
  {id:543,type:"call",hand:"A♣ J♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"AJo desde BB vs CO 3BB. Frequent strength buena vs rango CO. A pesar de ser OOP, AJo domina mucho del rango CO. Pot odds BB razonables. Paga.",en:"AJo from BB vs CO 3BB. Good frequent strength vs CO range. Despite being OOP, AJo dominates much of CO range. Reasonable BB pot odds. Call."},
  {id:544,type:"call",hand:"9♠ 8♠",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"98s desde BB vs BTN 2.5BB. Suited connector con buenos draws y pot odds BB. Rango BTN muy amplio donde 98s juega bien multiway. Paga.",en:"98s from BB vs BTN 2.5BB. Suited connector with good draws and BB pot odds. Very wide BTN range where 98s plays well multiway. Call."},
  {id:545,type:"call",hand:"6♥ 6♣",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"66 desde BB vs BTN 2.5BB. Set mining con buenos pot odds BB. 66 tiene implied odds decentes vs rango amplio BTN. Paga.",en:"66 from BB vs BTN 2.5BB. Set mining with good BB pot odds. 66 has decent implied odds vs wide BTN range. Call."},
  {id:546,type:"call",hand:"K♠ Q♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"KQo desde BB vs CO 3BB. Frequent strength excelente — KQo domina mucho del rango CO. OOP pero mano muy fuerte que justifica el pago. Paga.",en:"KQo from BB vs CO 3BB. Excellent frequent strength — KQo dominates much of CO range. OOP but very strong hand that justifies the call. Call."},
  {id:547,type:"call",hand:"J♣ T♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"JTo desde BB vs BTN 2.5BB. Broadway offsuit con frequent strength vs rango amplio BTN. Pot odds BB hacen este pago rentable. Paga.",en:"JTo from BB vs BTN 2.5BB. Offsuit broadway with frequent strength vs wide BTN range. BB pot odds make this call profitable. Call."},
  {id:548,type:"call",hand:"A♦ Q♣",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"AQo desde BB vs CO 3BB. Mano muy fuerte. AQo tiene frequent strength excelente vs cualquier rango. OOP pero claramente rentable pagar. Paga.",en:"AQo from BB vs CO 3BB. Very strong hand. AQo has excellent frequent strength vs any range. OOP but clearly profitable to call. Call."},
  {id:549,type:"call",hand:"5♠ 4♠",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"54s desde BB vs BTN 2BB (min-raise). Pot odds excelentes (casi 3:1). 54s tiene muy buenos implied odds multiway y flopeá draws poderosos. Paga vs min-raise.",en:"54s from BB vs BTN 2BB (min-raise). Excellent pot odds (almost 3:1). 54s has very good multiway implied odds and flops powerful draws. Call vs min-raise."},
  {id:550,type:"call",hand:"Q♥ 7♥",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"Q7s desde BB vs BTN 2BB (min-raise). Normalmente fold, pero vs min-raise los pot odds son tan buenos que hasta Q7s se convierte en pago. Paga solo vs min-raise.",en:"Q7s from BB vs BTN 2BB (min-raise). Normally fold, but vs min-raise pot odds are so good that even Q7s becomes a call. Call only vs min-raise."},
  {id:551,type:"call",hand:"8♠ 6♠",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"86s desde BB vs BTN 2.5BB. Suited connector con buenos draws. Pot odds BB razonables, rango BTN muy amplio. Paga.",en:"86s from BB vs BTN 2.5BB. Suited connector with good draws. Reasonable BB pot odds, very wide BTN range. Call."},
  {id:552,type:"call",hand:"T♣ 9♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"T9o desde BB vs CO 2.5BB. Offsuit connector con frequent strength vs rango CO. Pot odds BB hacen este pago marginalmente rentable. Paga.",en:"T9o from BB vs CO 2.5BB. Offsuit connector with frequent strength vs CO range. BB pot odds make this call marginally profitable. Call."},
  {id:553,type:"call",hand:"A♠ 5♠",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"A5s desde BB vs BTN 2.5BB. Suited ace con wheel straight potential, flush draw y top pair. Muy versátil. Pot odds BB buenos. Paga.",en:"A5s from BB vs BTN 2.5BB. Suited ace with wheel straight potential, flush draw and top pair. Very versatile. Good BB pot odds. Call."},
  {id:554,type:"call",hand:"J♦ 9♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"J9s desde BB vs BTN 2.5BB. Suited connector con buenas draws e implied odds. Rango BTN amplio donde J9s juega bien. Paga.",en:"J9s from BB vs BTN 2.5BB. Suited connector with good draws and implied odds. Wide BTN range where J9s plays well. Call."},
  {id:555,type:"call",hand:"K♣ J♣",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"KJs desde BB vs CO 3BB. Suited broadway con excelente frequent strength vs CO range. OOP pero mano demasiado buena para foldear. Paga.",en:"KJs from BB vs CO 3BB. Suited broadway with excellent frequent strength vs CO range. OOP but hand too good to fold. Call."},
  // ── BB — should fold (15) ────────────────────────────────────────────────────
  {id:556,type:"call",hand:"8♠ 2♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"UTG",es:"82o desde BB vs UTG 3BB. Sin suit, sin conexión, sin equidad. Foldea aunque estés en BB — los pot odds no compensan esta mano vs rango ajustado UTG.",en:"82o from BB vs UTG 3BB. No suit, no connection, no equity. Fold even from BB — pot odds don't compensate this hand vs tight UTG range."},
  {id:557,type:"call",hand:"7♥ 2♦",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"UTG",es:"72o desde BB vs UTG 3BB. La peor mano del poker. Sin suit, sin conexión, dominada por casi todo. Foldea aunque estés en BB.",en:"72o from BB vs UTG 3BB. The worst hand in poker. No suit, no connection, dominated by almost everything. Fold even from BB."},
  {id:558,type:"call",hand:"9♠ 4♦",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"UTG",es:"94o desde BB vs UTG 3BB. Sin suit, muy débil, sin implied odds ni frequent strength. Con rango UTG ajustado y 3BB de apertura, foldea.",en:"94o from BB vs UTG 3BB. No suit, very weak, no implied odds or frequent strength. With tight UTG range and 3BB open, fold."},
  {id:559,type:"call",hand:"J♣ 3♦",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"UTG",es:"J3o desde BB vs UTG 3BB. Sin suit, muy dominada cuando flopeá J. Foldea vs apertura UTG ajustada.",en:"J3o from BB vs UTG 3BB. No suit, heavily dominated when flopping a J. Fold vs tight UTG open."},
  {id:560,type:"call",hand:"Q♦ 3♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"MP",es:"Q3o desde BB vs MP 3BB. Sin suit, kicker muy débil, dominada por la mayoría del rango MP. Foldea.",en:"Q3o from BB vs MP 3BB. No suit, very weak kicker, dominated by most of MP range. Fold."},
  {id:561,type:"call",hand:"K♥ 2♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"UTG",es:"K2o desde BB vs UTG 3BB. Sin suit, kicker baja — cuando flopeás K el rival puede tener AK, KQ, KJ. Sufres dominación. Foldea.",en:"K2o from BB vs UTG 3BB. No suit, low kicker — when you flop K the opponent may have AK, KQ, KJ. You suffer domination. Fold."},
  {id:562,type:"call",hand:"A♠ 2♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"UTG",es:"A2o desde BB vs UTG 3BB. Sin suit, kicker muy baja. A2o sufre dominación vs rango UTG. Con apertura de 3BB, los pot odds no compensan. Foldea.",en:"A2o from BB vs UTG 3BB. No suit, very low kicker. A2o suffers domination vs UTG range. With 3BB open, pot odds don't compensate. Fold."},
  {id:563,type:"call",hand:"6♦ 2♦",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"62s desde BB vs CO 3BB. Aunque es suited, demasiado débil — flopeá manos muy fácilmente dominadas. Foldea.",en:"62s from BB vs CO 3BB. Even though it's suited, too weak — flops very easily dominated hands. Fold."},
  {id:564,type:"call",hand:"8♣ 3♦",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"MP",es:"83o desde BB vs MP 3BB. Sin suit, sin conexión relevante. Foldea vs apertura de posición media.",en:"83o from BB vs MP 3BB. No suit, no relevant connection. Fold vs middle position open."},
  {id:565,type:"call",hand:"5♥ 2♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"52o desde BB vs CO 2.5BB. Aunque los pot odds son mejores, 52o sin suit no tiene suficiente equity vs cualquier rango razonable. Foldea.",en:"52o from BB vs CO 2.5BB. Even though pot odds are better, 52o without suit doesn't have enough equity vs any reasonable range. Fold."},
  {id:566,type:"call",hand:"J♦ 4♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"UTG",es:"J4o desde BB vs UTG 3BB. Sin suit, kicker muy baja. J4o sufre dominación cuando flopeá J. Foldea vs apertura UTG.",en:"J4o from BB vs UTG 3BB. No suit, very low kicker. J4o suffers domination when flopping a J. Fold vs UTG open."},
  {id:567,type:"call",hand:"T♠ 3♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"MP",es:"T3o desde BB vs MP 3BB. Sin suit, sin conexión fuerte. No tiene ni implied odds ni frequent strength suficiente. Foldea.",en:"T3o from BB vs MP 3BB. No suit, no strong connection. Has neither sufficient implied odds nor frequent strength. Fold."},
  {id:568,type:"call",hand:"Q♥ 2♦",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"Q2o desde BB vs CO 2.5BB. Sin suit, kicker baja — cuando flopeás Q el rival puede tener AQ, KQ. Sufres dominación. Foldea.",en:"Q2o from BB vs CO 2.5BB. No suit, low kicker — when you flop Q the opponent may have AQ, KQ. You suffer domination. Fold."},
  {id:569,type:"call",hand:"9♣ 3♦",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"MP",es:"93o desde BB vs MP 3BB. Sin suit, sin conexión relevante. No tiene razón para pagar vs apertura MP. Foldea.",en:"93o from BB vs MP 3BB. No suit, no relevant connection. No reason to call vs MP open. Fold."},
  {id:570,type:"call",hand:"6♠ 2♣",board:null,open:false,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"62o desde BB vs CO 2.5BB. Completamente inmanejable postflop. Foldea aunque los pot odds sean razonables.",en:"62o from BB vs CO 2.5BB. Completely unmanageable postflop. Fold even though pot odds are reasonable."},
  // ── SB SITUATIONS (15) ───────────────────────────────────────────────────────
  {id:571,type:"call",hand:"A♣ Q♣",board:null,open:true,ctx:"call_sb_reg",pos:"SB",callPos:"UTG",es:"AQs desde SB vs UTG 3BB con BB nit. BB es nit que nunca squeezea — puedes pagar. AQs tiene excelente frequent strength vs UTG ajustado. Paga.",en:"AQs from SB vs UTG 3BB with nit BB. BB is a nit who never squeezes — you can call. AQs has excellent frequent strength vs tight UTG. Call."},
  {id:572,type:"call",hand:"J♠ J♦",board:null,open:true,ctx:"call_sb_reg",pos:"SB",callPos:"HJ",es:"JJ desde SB vs HJ con BB pasivo. BB es regular pasivo que casi nunca squeezea, así que el riesgo de pagar OOP es bajo. Pagar mantiene el bote controlado con una mano que puede estar dominada por rangos de apertura tempranos. JJ es demasiado fuerte para foldear.",en:"JJ from SB vs HJ with passive BB. Passive BB almost never squeezes, so the risk of calling OOP is low. Calling keeps the pot controlled with a hand that can be dominated by early-position opening ranges. JJ is too strong to fold."},
  {id:573,type:"call",hand:"K♥ Q♥",board:null,open:true,ctx:"call_sb_reg",pos:"SB",callPos:"UTG",es:"KQs desde SB vs UTG con BB nit. BB nit no squeezea, rango UTG tiene manos que KQs domina frecuentemente. Paga.",en:"KQs from SB vs UTG with nit BB. Nit BB doesn't squeeze, UTG range has hands that KQs frequently dominates. Call."},
  {id:574,type:"call",hand:"9♣ 8♣",board:null,open:true,ctx:"call_sb_fish",pos:"SB",callPos:"CO",es:"98s desde SB vs CO con fish en BB. Fish en BB añade implied odds y potencial multiway — justifica pagar 98s desde SB a pesar de la desventaja posicional. Paga.",en:"98s from SB vs CO with fish in BB. Fish in BB adds implied odds and multiway potential — justifies calling 98s from SB despite positional disadvantage. Call."},
  {id:575,type:"call",hand:"Q♦ J♦",board:null,open:true,ctx:"call_sb_reg",pos:"SB",callPos:"UTG",es:"QJs desde SB vs UTG con BB nit. Mano híbrida fuerte — frequent strength e implied odds. BB nit garantiza ver el flop. Paga.",en:"QJs from SB vs UTG with nit BB. Strong hybrid hand — frequent strength and implied odds. Nit BB guarantees seeing the flop. Call."},
  {id:576,type:"call",hand:"8♦ 7♦",board:null,open:false,ctx:"call_sb_reg",pos:"SB",callPos:"BTN",es:"87s desde SB vs BTN con BB desconocido. Con BB desconocido, el riesgo de squeeze destruye el EV del pago con 87s. 3-bet o fold — no pagas.",en:"87s from SB vs BTN with unknown BB. With unknown BB, squeeze risk destroys call EV with 87s. 3-bet or fold — don't call."},
  {id:577,type:"call",hand:"5♠ 5♦",board:null,open:false,ctx:"call_sb_reg",pos:"SB",callPos:"BTN",es:"55 desde SB vs BTN sin fish y BB desconocido. Sin fish, con BB desconocido — el riesgo de squeeze y las malas pot odds hacen este pago -EV. Foldea o 3-bet.",en:"55 from SB vs BTN without fish and unknown BB. Without fish, with unknown BB — squeeze risk and bad pot odds make this call -EV. Fold or 3-bet."},
  {id:578,type:"call",hand:"A♠ J♦",board:null,open:false,ctx:"call_sb_reg",pos:"SB",callPos:"BTN",es:"AJo desde SB vs BTN con BB agresivo. BB agresivo squeezea frecuentemente — pagar AJo desde SB es -EV con esa amenaza. 3-bet o fold.",en:"AJo from SB vs BTN with aggressive BB. Aggressive BB squeezes frequently — calling AJo from SB is -EV with that threat. 3-bet or fold."},
  {id:579,type:"call",hand:"K♣ T♣",board:null,open:true,ctx:"call_sb_fish",pos:"SB",callPos:"BTN",es:"KTs desde SB vs BTN con fish en BB. Fish en BB justifica pagar KTs — tiene frequent strength vs rango amplio BTN y el fish añade implied odds. Paga.",en:"KTs from SB vs BTN with fish in BB. Fish in BB justifies calling KTs — has frequent strength vs wide BTN range and fish adds implied odds. Call."},
  {id:580,type:"call",hand:"T♥ 9♥",board:null,open:false,ctx:"call_sb_reg",pos:"SB",callPos:"CO",es:"T9s desde SB vs CO con BB desconocido. Sin certeza de que no squeezea, T9s desde SB es pago arriesgado. 3-bet o fold.",en:"T9s from SB vs CO with unknown BB. Without certainty they won't squeeze, T9s from SB is a risky call. 3-bet or fold."},
  {id:583,type:"call",hand:"6♣ 4♣",board:null,open:false,ctx:"call_sb_reg",pos:"SB",callPos:"BTN",es:"64s desde SB vs BTN con BB desconocido. Demasiado débil para pagar desde SB con riesgo de squeeze. Foldea.",en:"64s from SB vs BTN with unknown BB. Too weak to call from SB with squeeze risk. Fold."},
  {id:584,type:"call",hand:"J♥ T♣",board:null,open:false,ctx:"call_sb_reg",pos:"SB",callPos:"CO",es:"JTo desde SB vs CO con BB desconocido. Offsuit y con riesgo de squeeze — desde SB 3-bet o fold. JTo no tiene suficiente valor para arriesgarse OOP con amenaza de squeeze.",en:"JTo from SB vs CO with unknown BB. Offsuit and with squeeze risk — from SB 3-bet or fold. JTo doesn't have enough value to risk going OOP with squeeze threat."},
  {id:585,type:"call",hand:"7♠ 6♠",board:null,open:false,ctx:"call_sb_reg",pos:"SB",callPos:"BTN",es:"76s desde SB vs BTN con BB agresivo. Aunque tiene buenos implied odds, el squeeze de BB agresivo destruye el EV del pago. Foldea.",en:"76s from SB vs BTN with aggressive BB. Even though it has good implied odds, aggressive BB squeeze destroys call EV. Fold."},
  // ── MIXED SPOTS — tricky decisions (15) ──────────────────────────────────────
  {id:586,type:"call",hand:"A♥ K♣",board:null,open:true,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"AKo vs UTG desde HJ. Mano premium. Pagar mantiene el bote controlado frente al rango más fuerte de la mesa (UTG) y postflop tendrás la mejor mano con frecuencia. La línea más sólida aquí es pagar.",en:"AKo vs UTG from HJ. Premium hand. Calling keeps the pot controlled against the strongest range at the table (UTG) and postflop you'll frequently have the best hand. Calling is the soundest line here."},
  {id:587,type:"call",hand:"3♠ 3♣",board:null,open:true,ctx:"call_ip_fish",pos:"BTN",callPos:"CO",es:"33 vs CO con fish en BB. Fish en BB transforma 33 en pago rentable — sus errores postflop cuando flopeás set compensan el riesgo. Paga.",en:"33 vs CO with fish in BB. Fish in BB transforms 33 into a profitable call — their postflop mistakes when you flop a set compensate the risk. Call."},
  {id:588,type:"call",hand:"Q♠ Q♣",board:null,open:true,ctx:"call_ip_reg",pos:"CO",callPos:"UTG",es:"QQ vs UTG desde CO. Mano fuerte, pero UTG tiene el rango más fuerte de la mesa (más combos de KK/AA). Pagar mantiene el bote pequeño, limitando el daño en los spots donde estás dominado, y juegas postflop con posición. La línea más sólida aquí es pagar.",en:"QQ vs UTG from CO. Strong hand, but UTG has the strongest range at the table (more KK/AA combos). Calling keeps the pot small, limiting the damage in spots where you're dominated, and you play postflop with position. Calling is the soundest line here."},
  {id:589,type:"call",hand:"A♠ Q♦",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"AQo vs CO desde BTN. Frequent strength excelente vs rango CO. IP con mano fuerte — pagar mantiene el bote controlado y juegas postflop con posición frente a un rango amplio. La línea más sólida aquí es pagar.",en:"AQo vs CO from BTN. Excellent frequent strength vs CO range. IP with a strong hand — calling keeps the pot controlled and you play postflop with position against a wide range. Calling is the soundest line here."},
  {id:590,type:"call",hand:"2♠ 2♦",board:null,open:true,ctx:"call_ip_fish",pos:"BTN",callPos:"UTG",es:"22 vs UTG con dos fish en blinds. Normalmente fold 22 vs UTG, pero con dos fish en los blinds los implied odds son excelentes. Flopeás set el 12% — fish pagarán generosamente. Paga.",en:"22 vs UTG with two fish in blinds. Normally fold 22 vs UTG, but with two fish in the blinds implied odds are excellent. You flop a set 12% — fish will pay generously. Call."},
  {id:591,type:"call",hand:"A♦ 4♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"A4s desde BB vs BTN 2BB. Min-raise da pot odds excelentes. A4s tiene wheel straight, flush draw y top pair potencial. Con rango BTN amplio y pot odds de casi 3:1, paga.",en:"A4s from BB vs BTN 2BB. Min-raise gives excellent pot odds. A4s has wheel straight, flush draw and top pair potential. With wide BTN range and almost 3:1 pot odds, call."},
  {id:592,type:"call",hand:"J♣ J♥",board:null,open:true,ctx:"call_sb_fish",pos:"SB",callPos:"BTN",es:"JJ desde SB vs BTN con fish en BB. Fish en BB + JJ (mano muy fuerte) = pagar es razonable. El fish añade implied odds y hace más rentable el pago OOP. Paga.",en:"JJ from SB vs BTN with fish in BB. Fish in BB + JJ (very strong hand) = calling is reasonable. Fish adds implied odds and makes OOP call more profitable. Call."},
  {id:593,type:"call",hand:"K♦ T♦",board:null,open:true,ctx:"call_ip_reg",pos:"BTN",callPos:"CO",es:"KTs vs CO desde BTN. Suited broadway con excelente frequent strength e implied odds. BTN es posición perfecta. Paga cómodamente.",en:"KTs vs CO from BTN. Suited broadway with excellent frequent strength and implied odds. BTN is perfect position. Comfortable call."},
  {id:594,type:"call",hand:"7♣ 7♦",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"CO",es:"77 desde BB vs CO 3BB. Set mining desde BB — pot odds BB razonables y rango CO tiene manos premium que pagan sets. Implied odds decentes. Paga.",en:"77 from BB vs CO 3BB. Set mining from BB — reasonable BB pot odds and CO range has premium hands that pay sets. Decent implied odds. Call."},
  {id:595,type:"call",hand:"A♥ 7♥",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"A7s desde BB vs BTN 2.5BB. Suited ace con flush draw, top pair potencial. Pot odds BB buenos. Rango BTN amplio donde A7s juega bien. Paga.",en:"A7s from BB vs BTN 2.5BB. Suited ace with flush draw, top pair potential. Good BB pot odds. Wide BTN range where A7s plays well. Call."},
  {id:596,type:"call",hand:"Q♣ 8♣",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"Q8s desde BB vs BTN 2.5BB. Suited one-gapper con potencial vs rango BTN amplio. Pot odds BB hacen el pago rentable. Paga.",en:"Q8s from BB vs BTN 2.5BB. Suited one-gapper with potential vs wide BTN range. BB pot odds make the call profitable. Call."},
  {id:597,type:"call",hand:"6♠ 6♦",board:null,open:true,ctx:"call_ip_fish",pos:"HJ",callPos:"UTG",es:"66 vs UTG con fish en BB. Fish en BB transforma 66 en set mine rentable vs rango UTG ajustado. Paga.",en:"66 vs UTG with fish in BB. Fish in BB transforms 66 into profitable set mine vs tight UTG range. Call."},
  {id:598,type:"call",hand:"T♠ T♦",board:null,open:true,ctx:"call_ip_reg",pos:"HJ",callPos:"UTG",es:"TT vs UTG desde HJ. Mano híbrida fuerte — overpair frecuente + set value. Pagar es la línea más sólida: mantiene el bote controlado frente a un rango UTG muy fuerte y juegas postflop con posición.",en:"TT vs UTG from HJ. Strong hybrid hand — frequent overpair + set value. Calling is the soundest line: keeps the pot controlled against a very strong UTG range and you play postflop with position."},
  {id:599,type:"call",hand:"9♦ 7♦",board:null,open:true,ctx:"call_ip_fish",pos:"BTN",callPos:"CO",es:"97s vs CO con fish en SB. Fish en SB añade implied odds extra para suited connectors especulativos. 97s conecta bien multiway. Paga desde BTN con fish.",en:"97s vs CO with fish in SB. Fish in SB adds extra implied odds for speculative suited connectors. 97s connects well multiway. Call from BTN with fish."},
  {id:600,type:"call",hand:"A♣ 6♣",board:null,open:true,ctx:"call_bb_reg",pos:"BB",callPos:"BTN",es:"A6s desde BB vs BTN 2.5BB. Suited ace con wheel potential, flush draw y top pair. Versátil. Pot odds BB buenos vs rango BTN amplio. Paga.",en:"A6s from BB vs BTN 2.5BB. Suited ace with wheel potential, flush draw and top pair. Versatile. Good BB pot odds vs wide BTN range. Call."},
];

// ── FACING BETS SITUATIONS — Capítulo 7 (20) ─────────────────────────────────
// type:"facing" — open=true → call es la jugada correcta; open=false → fold
// Cubre: overbets, double barrels, all-ins flop/turn, thin calls, tendencias población
// descEs/descEn: historia completa de la mano calle a calle
const FACING_SITUATIONS = [

  // ── OVERBETS (5) ─────────────────────────────────────────────────────────

  // S601: Fish pasivo overbet 2x river → FOLD
  {id:601,type:"facing",hand:"Q♥ Q♦",board:"A♠K♣8♦3♥J♠",street:"river",open:false,
   ctx:"facing_river",pos:"BTN",callPos:"BB",
   descEs:"NL25 · BTN vs BB · Fish pasivo (VPIP 58%, PFR 5%, CBet River 12%, WTSD 42%)\nPreflop: Hero abre BTN 2.5BB. BB paga. Bote: 5.5BB.\nFlop A♠K♣8♦: BB checkea. Hero apuesta 3.5BB. BB paga. Bote: 12.5BB.\nTurn 3♥: BB checkea. Hero checkea. Bote: 12.5BB.\nRiver J♠: BB apuesta 25BB (overbet 2x el bote).",
   descEn:"NL25 · BTN vs BB · Passive fish (VPIP 58%, PFR 5%, CBet River 12%, WTSD 42%)\nPreflop: Hero opens BTN 2.5BB. BB calls. Pot: 5.5BB.\nFlop A♠K♣8♦: BB checks. Hero bets 3.5BB. BB calls. Pot: 12.5BB.\nTurn 3♥: BB checks. Hero checks. Pot: 12.5BB.\nRiver J♠: BB bets 25BB (overbet 2x the pot).",
   es:"FOLD. QQ no supera ninguna carta del tablero A-K-8-3-J. ER = 25/(25+37.5) = 40%. El fish pasivo (CBet River 12%) apuesta el river rarísimas veces — cuando lo hace con overbet 2x su rango es abrumadoramente valor: AX, KX, JX, sets. Sin bluffs en su rango no tienes el 40% de equity requerido. Foldea.",
   en:"FOLD. QQ beats nothing on A-K-8-3-J. ER = 25/(25+37.5) = 40%. Passive fish (CBet River 12%) almost never bets river — when they do with 2x overbet their range is overwhelmingly value: AX, KX, JX, sets. No bluffs in range means you don't have the required 40% equity. Fold."},

  // S602: Aggro reg overbet 1.5x river, bluff catcher con top pair → CALL
  {id:602,type:"facing",hand:"K♣ 9♣",board:"K♠8♦5♣2♥6♠",street:"river",open:true,
   ctx:"facing_river",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Aggro reg (VPIP 34%, PFR 27%, CBet River 55%, WWSF 60%)\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop K♠8♦5♣: Hero checkea. BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB.\nTurn 2♥: Hero checkea. BTN checkea. Bote: 12.5BB.\nRiver 6♠: Hero checkea. BTN apuesta 19BB (overbet 1.5x el bote).",
   descEn:"NL25 · BB vs BTN · Aggro reg (VPIP 34%, PFR 27%, CBet River 55%, WWSF 60%)\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop K♠8♦5♣: Hero checks. BTN bets 3.5BB. Hero calls. Pot: 12.5BB.\nTurn 2♥: Hero checks. BTN checks. Pot: 12.5BB.\nRiver 6♠: Hero checks. BTN bets 19BB (overbet 1.5x the pot).",
   es:"PAGAR. K9s es bluff catcher sólido. ER = 19/(19+31.5) = 38%. El aggro reg (CBet River 55%, WWSF 60%) checkeó el turn — eso amplía su rango del river hacia bluffs: draws de flush fallidos (A♣X♣, Q♣J♣), draws de straight fallidos (79o, 74s). K9s gana vs todo ese rango de bluffs. Con WWSF 60% genera suficientes bluffs para justificar el call. Paga.",
   en:"CALL. K9s is a solid bluff catcher. ER = 19/(19+31.5) = 38%. Aggro reg (CBet River 55%, WWSF 60%) checked turn — that widens their river range toward bluffs: missed flush draws (A♣X♣, Q♣J♣), missed straight draws (79o, 74s). K9s beats all those bluff hands. With WWSF 60% they generate enough bluffs to justify the call. Call."},

  // S603: Regular sólido overbet 2x river, JJ no bate nada → FOLD
  {id:603,type:"facing",hand:"J♠ J♥",board:"A♦K♦Q♣8♣5♦",street:"river",open:false,
   ctx:"facing_river",pos:"CO",callPos:"BB",
   descEs:"NL25 · CO vs BB · Regular (VPIP 26%, PFR 20%, CBet River 30%, WWSF 47%)\nPreflop: Hero abre CO 2.5BB. BB paga. Bote: 5.5BB.\nFlop A♦K♦Q♣: BB checkea. Hero apuesta 3.5BB. BB paga. Bote: 12.5BB.\nTurn 8♣: BB checkea. Hero checkea. Bote: 12.5BB.\nRiver 5♦: BB apuesta 25BB (overbet 2x el bote).",
   descEn:"NL25 · CO vs BB · Regular (VPIP 26%, PFR 20%, CBet River 30%, WWSF 47%)\nPreflop: Hero opens CO 2.5BB. BB calls. Pot: 5.5BB.\nFlop A♦K♦Q♣: BB checks. Hero bets 3.5BB. BB calls. Pot: 12.5BB.\nTurn 8♣: BB checks. Hero checks. Pot: 12.5BB.\nRiver 5♦: BB bets 25BB (overbet 2x the pot).",
   es:"FOLD. JJ en A-K-Q-8-5 con flush de diamantes completado — no supera casi nada del rango del BB. ER = 40%. Regular conservador (CBet River 30%, WWSF 47%) que overbet river después de check-call, check-check tiene rango cargado de valor: AX, KX, QX, flush de diamantes, two pair. Tendencia de población en NL25: overbets de regulares desconocidos son valor, no bluffs. Foldea.",
   en:"FOLD. JJ on A-K-Q-8-5 with diamond flush on board — beats almost nothing in BB's range. ER = 40%. Conservative regular (CBet River 30%, WWSF 47%) overbetting river after check-call, check-check has value-heavy range: AX, KX, QX, diamond flush, two pair. Population tendency in NL25: overbets from unknown regulars are value, not bluffs. Fold."},

  // S604: Regular 3 calles de apuesta + overbet river final, TT → FOLD
  {id:604,type:"facing",hand:"T♦ T♣",board:"J♥9♠8♦K♣2♠",street:"river",open:false,
   ctx:"facing_river",pos:"BTN",callPos:"SB",
   descEs:"NL25 · BTN vs SB · Regular (VPIP 28%, PFR 22%, CBet River 35%, WWSF 50%)\nPreflop: Hero abre BTN 2.5BB. SB 3-bet a 9BB. Hero paga. Bote: 18.5BB.\nFlop J♥9♠8♦: SB apuesta 8BB. Hero paga. Bote: 34.5BB.\nTurn K♣: SB apuesta 20BB. Hero paga. Bote: 74.5BB.\nRiver 2♠: SB apuesta 93BB (overbet 1.25x el bote).",
   descEn:"NL25 · BTN vs SB · Regular (VPIP 28%, PFR 22%, CBet River 35%, WWSF 50%)\nPreflop: Hero opens BTN 2.5BB. SB 3-bets to 9BB. Hero calls. Pot: 18.5BB.\nFlop J♥9♠8♦: SB bets 8BB. Hero calls. Pot: 34.5BB.\nTurn K♣: SB bets 20BB. Hero calls. Pot: 74.5BB.\nRiver 2♠: SB bets 93BB (overbet 1.25x the pot).",
   es:"FOLD. TT en J-9-8-K-2 tras 3 calles de apuestas del SB (3-bet + 3 barriles + overbet). ER = 93/(93+167.5) = 36%. TT hace straight (7-8-9-T-J), pero CUALQUIER Q da straight mejor (8-9-T-J-Q). El SB que apuesta las 3 calles en tablero conectado y termina overbet tiene rango muy concentrado: QT (straight Q-high), JJ/99/88 (sets), KK. Regular desconocido apostando 3 calles con overbet final → valor extremo. Foldea.",
   en:"FOLD. TT on J-9-8-K-2 after 3 streets of betting by SB (3-bet + 3 barrels + overbet). ER = 93/(93+167.5) = 36%. TT makes a straight (7-8-9-T-J), but ANY Q gives a better straight (8-9-T-J-Q). SB betting all 3 streets on connected board ending with overbet has concentrated range: QT (Q-high straight), JJ/99/88 (sets), KK. Unknown regular betting 3 streets with final overbet → extreme value. Fold."},

  // S605: Aggro fish overbet river, top pair buena kicker → CALL
  {id:605,type:"facing",hand:"A♣ 8♣",board:"A♠7♦2♣K♥3♠",street:"river",open:true,
   ctx:"facing_river",pos:"BTN",callPos:"BB",
   descEs:"NL25 · BTN vs BB · Aggro fish (VPIP 65%, PFR 22%, CBet River 48%, WWSF 55%)\nPreflop: Hero abre BTN 2.5BB. BB paga. Bote: 5.5BB.\nFlop A♠7♦2♣: BB checkea. Hero apuesta 3.5BB. BB paga. Bote: 12.5BB.\nTurn K♥: BB checkea. Hero apuesta 8BB. BB paga. Bote: 28.5BB.\nRiver 3♠: BB apuesta 43BB (overbet 1.5x el bote).",
   descEn:"NL25 · BTN vs BB · Aggro fish (VPIP 65%, PFR 22%, CBet River 48%, WWSF 55%)\nPreflop: Hero opens BTN 2.5BB. BB calls. Pot: 5.5BB.\nFlop A♠7♦2♣: BB checks. Hero bets 3.5BB. BB calls. Pot: 12.5BB.\nTurn K♥: BB checks. Hero bets 8BB. BB calls. Pot: 28.5BB.\nRiver 3♠: BB bets 43BB (overbet 1.5x the pot).",
   es:"PAGAR. A8s (top pair + nut flush draw completado en palo de trébol) vs aggro fish. ER = 43/(43+71.5) = 37.5%. El aggro fish (VPIP 65%, CBet River 48%) apuesta el river con: Kx, 7x, 3x, draws fallidos, pares mediocres, incluso aire total. Su rango de overbet no está concentrado en valor como lo haría un regular. A8s gana a suficientes manos de ese rango para superar el 37.5% requerido. Paga.",
   en:"CALL. A8s (top pair on dry board) vs aggro fish. ER = 43/(43+71.5) = 37.5%. Aggro fish (VPIP 65%, CBet River 48%) bets river with: Kx, 7x, 3x, missed draws, medium pairs, even total air. Their overbet range isn't concentrated in value like a regular's would be. A8s beats enough hands in that range to exceed the required 37.5%. Call."},

  // ── DOUBLE BARREL TURN (4) ───────────────────────────────────────────────

  // S606: Nut flush draw + overcards en turn, aggro reg double barrel → CALL
  {id:606,type:"facing",hand:"A♥ J♥",board:"K♥8♥5♣Q♦",street:"turn",open:true,
   ctx:"facing_turn",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Reg (VPIP 29%, PFR 23%, CBet Turn 52%)\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop K♥8♥5♣: Hero checkea. BTN apuesta 3.5BB. Hero paga (nut flush draw). Bote: 12.5BB.\nTurn Q♦: Hero checkea. BTN apuesta 9BB (72% del bote). Stacks restantes: ~77BB.",
   descEn:"NL25 · BB vs BTN · Reg (VPIP 29%, PFR 23%, CBet Turn 52%)\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop K♥8♥5♣: Hero checks. BTN bets 3.5BB. Hero calls (nut flush draw). Pot: 12.5BB.\nTurn Q♦: Hero checks. BTN bets 9BB (72% of pot). Remaining stacks: ~77BB.",
   es:"PAGAR. A♥J♥ tiene nut flush draw (NFD con As de corazones — 9 outs seguros) + 2 overcards a 8 y 5. Total ~12-13 outs. ER = 9/(9+21.5) = 30%. Equidad real con NFD + overcards vs rango BTN: ~48-52%. CBet Turn 52% del BTN incluye muchos semi-bluffs y value mediocre. SPR restante ≈ 2.8 — el river tendrá todo el dinero si completas. Tu equidad supera el 30% requerido con comodidad. Paga.",
   en:"CALL. A♥J♥ has nut flush draw (NFD with A♥ — 9 clean outs) + 2 overcards to 8 and 5. Total ~12-13 outs. ER = 9/(9+21.5) = 30%. Real equity with NFD + overcards vs BTN range: ~48-52%. BTN CBet Turn 52% includes many semi-bluffs and mediocre value. Remaining SPR ≈ 2.8 — river will get all the money if you complete. Your equity comfortably exceeds the required 30%. Call."},

  // S607: SDV sin draws, tight reg double barrel turn con A cayendo → FOLD
  {id:607,type:"facing",hand:"T♣ 9♦",board:"J♠8♦3♥A♣",street:"turn",open:false,
   ctx:"facing_turn",pos:"BB",callPos:"CO",
   descEs:"NL25 · BB vs CO · Tight reg (VPIP 21%, PFR 17%, CBet Turn 38%)\nPreflop: CO abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop J♠8♦3♥: Hero checkea. CO apuesta 3.5BB. Hero paga (gutshot + overcards a 3). Bote: 12.5BB.\nTurn A♣: Hero checkea. CO apuesta 9BB (72% del bote).",
   descEn:"NL25 · BB vs CO · Tight reg (VPIP 21%, PFR 17%, CBet Turn 38%)\nPreflop: CO opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop J♠8♦3♥: Hero checks. CO bets 3.5BB. Hero calls (gutshot + overcards to 3). Pot: 12.5BB.\nTurn A♣: Hero checks. CO bets 9BB (72% of pot).",
   es:"FOLD. T9o en J-8-3-A: gutshot fallido (necesitaba Q), sin flush draw, SDV mínimo contra rango del rival. ER = 9/(9+21.5) = 30%. El tight reg (CBet Turn 38%) barrelea selectivamente — con A en turn su rango incluye AX fuerte, AA, sets (JJ). T9o tiene apenas ~10-12% de equidad real vs ese rango ajustado. Sin draws reales y con rango del rival fortalecido por el As → foldea.",
   en:"FOLD. T9o on J-8-3-A: gutshot missed (needed Q), no flush draw, minimal SDV against villain's range. ER = 9/(9+21.5) = 30%. Tight reg (CBet Turn 38%) double barrels selectively — with A on turn their range includes strong AX, AA, sets (JJ). T9o has only ~10-12% real equity vs that tight range. No real draws and villain's range strengthened by the ace → fold."},

  // S608: OESD en turn vs aggro reg double barrel → CALL
  {id:608,type:"facing",hand:"9♠ 7♠",board:"J♦8♥6♣T♠",street:"turn",open:true,
   ctx:"facing_turn",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Aggro reg (VPIP 33%, PFR 26%, CBet Turn 62%)\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop J♦8♥6♣: Hero checkea. BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB.\nTurn T♠: Hero checkea. BTN apuesta 9BB (72% del bote). Stacks restantes: ~75BB.",
   descEn:"NL25 · BB vs BTN · Aggro reg (VPIP 33%, PFR 26%, CBet Turn 62%)\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop J♦8♥6♣: Hero checks. BTN bets 3.5BB. Hero calls. Pot: 12.5BB.\nTurn T♠: Hero checks. BTN bets 9BB (72% of pot). Remaining stacks: ~75BB.",
   es:"PAGAR. 9-7 en J-8-6-T: tienes straight abierto (6-7-8-9-T — completa con J por arriba o 5 por abajo). 8 outs puros. ER = 9/(9+21.5) = 30%. Con 8 outs tienes ~33-35% de equidad en el river. El BTN aggro (CBet Turn 62%) puede tener mucho aire/semi-bluffs. SPR restante ≈ 3.5. Superas el 30% requerido y el river ofrece valor potencial si completas el straight. Paga.",
   en:"CALL. 9-7 on J-8-6-T: you have an open-ended straight draw (6-7-8-9-T — completes with J above or 5 below). 8 clean outs. ER = 9/(9+21.5) = 30%. With 8 outs you have ~33-35% equity on the river. Aggro BTN (CBet Turn 62%) can have lots of air/semi-bluffs. Remaining SPR ≈ 3.5. You exceed the required 30% and the river offers potential value if you complete the straight. Call."},

  // S609: Overpair QQ vs donk bet tight reg en turn → FOLD
  {id:609,type:"facing",hand:"Q♦ Q♣",board:"K♠9♦4♣8♥",street:"turn",open:false,
   ctx:"facing_turn",pos:"BTN",callPos:"BB",
   descEs:"NL25 · BTN vs BB · Tight reg (VPIP 22%, PFR 18%, Fold to C-bet Flop 60%)\nPreflop: Hero abre BTN 2.5BB. BB paga. Bote: 5.5BB.\nFlop K♠9♦4♣: BB checkea. Hero apuesta 3.5BB. BB paga (Fold to C-bet 60% — esta vez no foldeó). Bote: 12.5BB.\nTurn 8♥: BB sale apostando 9BB (donk bet). Bote: 12.5BB. Stacks restantes: ~80BB.",
   descEn:"NL25 · BTN vs BB · Tight reg (VPIP 22%, PFR 18%, Fold to C-bet Flop 60%)\nPreflop: Hero opens BTN 2.5BB. BB calls. Pot: 5.5BB.\nFlop K♠9♦4♣: BB checks. Hero bets 3.5BB. BB calls (Fold to C-bet 60% — this time didn't fold). Pot: 12.5BB.\nTurn 8♥: BB leads 9BB (donk bet). Pot: 12.5BB. Remaining stacks: ~80BB.",
   es:"FOLD. QQ en K-9-4-8 con donk bet del BB tight reg. ER = 9/(9+21.5) = 30%. Un tight reg (VPIP 22%) que pagó la c-bet en el flop y sale apostando el turn tiene rango muy polarizado hacia valor: KX fuerte, sets (99, 44), dos pares (K9, K8), quizás draws de straight (J-T). QQ solo supera los bluffs, pero un VPIP 22% casi no hace donk bets como bluff — su rango de donk beat en K-9-4-8 tiene mucho valor. No tienes el 30% de equity real. Foldea.",
   en:"FOLD. QQ on K-9-4-8 with BB tight reg donk bet. ER = 9/(9+21.5) = 30%. A tight reg (VPIP 22%) who called flop c-bet and leads turn has very polarized range toward value: strong KX, sets (99, 44), two pairs (K9, K8), maybe straight draws (J-T). QQ only beats bluffs, but VPIP 22% players almost never donk bet as a bluff — their donk range on K-9-4-8 is value-heavy. You don't have 30% real equity. Fold."},

  // ── ALL-IN FLOP / TURN (5) ───────────────────────────────────────────────

  // S610: Fish all-in flop, hero combo draw (NFD + OESD) → CALL
  {id:610,type:"facing",hand:"J♠ T♠",board:"A♠9♠8♣",street:"flop",open:true,
   ctx:"facing_allin",pos:"BTN",callPos:"BB",
   descEs:"NL25 · BTN vs BB · Fish recreativo (VPIP 68%, PFR 7%) · All-in en el flop\nPreflop: Hero abre BTN 2.5BB. BB paga. Bote: 5.5BB.\nFlop A♠9♠8♣: BB apuesta 5.5BB (pot). Hero sube a 15BB. BB va all-in (97.5BB total). Stacks 100BB efectivos.\nBote total si pagas: 195BB. Coste del call: 80BB.",
   descEn:"NL25 · BTN vs BB · Recreational fish (VPIP 68%, PFR 7%) · All-in on flop\nPreflop: Hero opens BTN 2.5BB. BB calls. Pot: 5.5BB.\nFlop A♠9♠8♣: BB bets 5.5BB (pot). Hero raises to 15BB. BB goes all-in (97.5BB total). Stacks 100BB effective.\nTotal pot if you call: 195BB. Cost of call: 80BB.",
   es:"PAGAR. J♠T♠ en A♠9♠8♣: flush draw de picas (9 outs) + OESD (J-T-9-8, completa con Q o 7, 8 outs) = combo draw de ~15 outs. ER ≈ 80/(80+115) ≈ 41%. Equidad real vs rango fish amplio (AX, 9X, 8X, draws peores): ~55-60%. El fish VPIP 68% va all-in con rango amplísimo que incluye pares mediocres y draws débiles. Superas el 41% con margen. Paga.",
   en:"CALL. J♠T♠ on A♠9♠8♣: spade flush draw (9 outs) + OESD (J-T-9-8, completes with Q or 7, 8 outs) = combo draw of ~15 outs. ER ≈ 80/(80+115) ≈ 41%. Real equity vs wide fish range (AX, 9X, 8X, weaker draws): ~55-60%. Fish VPIP 68% goes all-in with wide range including medium pairs and weak draws. You exceed 41% comfortably. Call."},

  // S611: Set de 7s vs fish all-in en flop → CALL
  {id:611,type:"facing",hand:"7♦ 7♣",board:"7♠K♣4♥",street:"flop",open:true,
   ctx:"facing_allin",pos:"BTN",callPos:"BB",
   descEs:"NL25 · BTN vs BB · Fish (VPIP 55%, PFR 8%) · All-in en el flop\nPreflop: Hero abre BTN 2.5BB. BB paga. Bote: 5.5BB.\nFlop 7♠K♣4♥: BB apuesta 5.5BB (pot). Hero sube a 16BB. BB va all-in (97.5BB total). Stacks 100BB efectivos.\nBote total si pagas: 195BB. Coste del call: 81.5BB.",
   descEn:"NL25 · BTN vs BB · Fish (VPIP 55%, PFR 8%) · All-in on flop\nPreflop: Hero opens BTN 2.5BB. BB calls. Pot: 5.5BB.\nFlop 7♠K♣4♥: BB bets 5.5BB (pot). Hero raises to 16BB. BB goes all-in (97.5BB total). Stacks 100BB effective.\nTotal pot if you call: 195BB. Cost of call: 81.5BB.",
   es:"PAGAR. Set de 7s (777) en K-7-4. ER ≈ 42%. Set de 7s tiene ~82-85% de equidad contra el rango del fish: KX (top pair), 44 (set inferior), draws de flush y straight prácticamente inexistentes en K74. El fish con VPIP 55% mete el dinero con top pair, middle pair, pares menores. Tu set aplasta su rango. Paga sin dudar.",
   en:"CALL. Set of 7s (777) on K-7-4. ER ≈ 42%. Set of 7s has ~82-85% equity against fish range: KX (top pair), 44 (worse set), flush and straight draws practically nonexistent on K74. Fish with VPIP 55% gets it in with top pair, middle pair, lower pairs. Your set crushes their range. Call without hesitation."},

  // S612: TPTK vs fish all-in flop → CALL
  {id:612,type:"facing",hand:"A♠ K♣",board:"A♦7♥3♦",street:"flop",open:true,
   ctx:"facing_allin",pos:"CO",callPos:"BB",
   descEs:"NL25 · CO vs BB · Fish recreativo (VPIP 62%, PFR 9%) · All-in en el flop\nPreflop: Hero abre CO 2.5BB. BB paga. Bote: 5.5BB.\nFlop A♦7♥3♦: BB apuesta 5.5BB (pot). Hero sube a 16BB. BB va all-in (97.5BB total). Stacks 100BB efectivos.\nBote total si pagas: 195BB. Coste del call: 81.5BB.",
   descEn:"NL25 · CO vs BB · Recreational fish (VPIP 62%, PFR 9%) · All-in on flop\nPreflop: Hero opens CO 2.5BB. BB calls. Pot: 5.5BB.\nFlop A♦7♥3♦: BB bets 5.5BB (pot). Hero raises to 16BB. BB goes all-in (97.5BB total). Stacks 100BB effective.\nTotal pot if you call: 195BB. Cost of call: 81.5BB.",
   es:"PAGAR. TPTK (AK) en A-7-3 vs fish all-in. ER ≈ 42%. El fish VPIP 62% va all-in con: AX kicker menor (AT, AJ, AQ), 7X, 3X, flush draw de diamantes, pares mediocres. AK tiene ~68-72% de equidad vs ese rango amplio. Superas el 42% con comodidad. Los únicos combos que baten a AK son AA (2 combos) y 77/33 (sets). El rango total del fish tiene mucho más valor para ti que contra ti. Paga.",
   en:"CALL. TPTK (AK) on A-7-3 vs fish all-in. ER ≈ 42%. Fish VPIP 62% goes all-in with: AX weaker kicker (AT, AJ, AQ), 7X, 3X, diamond flush draw, medium pairs. AK has ~68-72% equity vs that wide range. You exceed 42% comfortably. Only combos beating AK are AA (2 combos) and 77/33 (sets). Fish's total range benefits you far more than it hurts. Call."},

  // S613: Straight bajo vs reg all-in flop — drawing muerto → FOLD
  {id:613,type:"facing",hand:"6♥ 5♥",board:"9♣8♦7♠",street:"flop",open:false,
   ctx:"facing_allin",pos:"BB",callPos:"CO",
   descEs:"NL25 · BB vs CO · Reg (VPIP 26%, PFR 20%) · All-in en el flop\nPreflop: CO abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop 9♣8♦7♠: Hero checkea. CO apuesta 3.5BB. Hero sube a 12BB. CO va all-in (97.5BB total). Stacks 100BB efectivos.\nBote total si pagas: 195BB. Coste del call: 85.5BB.",
   descEn:"NL25 · BB vs CO · Reg (VPIP 26%, PFR 20%) · All-in on flop\nPreflop: CO opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop 9♣8♦7♠: Hero checks. CO bets 3.5BB. Hero raises to 12BB. CO goes all-in (97.5BB total). Stacks 100BB effective.\nTotal pot if you call: 195BB. Cost of call: 85.5BB.",
   es:"FOLD. 65 en 9-8-7: tienes straight (5-6-7-8-9) pero es el PEOR straight posible en este tablero. Cualquier T da straight mejor al rival (6-7-8-9-T). El rango del reg que relanza all-in aquí incluye JTs, T9s, J9s — manos con T que hacen straight superior o tienen muchos outs para hacerlo. ER ≈ 44%. Tu equidad real vs ese rango es ~20-25% — muy por debajo del 44% requerido. El straight bajo te da la ilusión de una mano fuerte, pero está casi muerto contra el rango del all-in del reg.",
   en:"FOLD. 65 on 9-8-7: you have a straight (5-6-7-8-9) but it's the WORST possible straight on this board. Any T gives villain a better straight (6-7-8-9-T). Reg's all-in range includes JTs, T9s, J9s — hands with T that make the superior straight or have many outs to do so. ER ≈ 44%. Your real equity vs that range is ~20-25% — well below the required 44%. The low straight gives the illusion of a strong hand, but it's almost dead against the reg's all-in range."},

  // S614: Reg all-in turn, hero solo top pair → FOLD
  {id:614,type:"facing",hand:"A♦ T♦",board:"T♠7♣3♥K♦",street:"turn",open:false,
   ctx:"facing_allin",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Reg (VPIP 25%, PFR 20%) · All-in en el turn\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop T♠7♣3♥: Hero checkea. BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB.\nTurn K♦: Hero checkea. BTN apuesta 9BB. Hero sube a 28BB. BTN va all-in (90BB total). Stacks 100BB efectivos.\nCoste del call: ~62BB más.",
   descEn:"NL25 · BB vs BTN · Reg (VPIP 25%, PFR 20%) · All-in on turn\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop T♠7♣3♥: Hero checks. BTN bets 3.5BB. Hero calls. Pot: 12.5BB.\nTurn K♦: Hero checks. BTN bets 9BB. Hero raises to 28BB. BTN goes all-in (90BB total). Stacks 100BB effective.\nCost of call: ~62BB more.",
   es:"FOLD. AT (top pair de Tens) en T-7-3-K vs all-in del reg en el turn. ER ≈ 62/(62+120.5) ≈ 34%. El reg (VPIP 25%) que paga el hero raise y relanza all-in en el turn tiene rango polarizado hacia lo más fuerte: KT (dos pares), TT/KK (sets), KX fuerte. AT apenas supera a AK (un split) y pierde contra toda su gama de valor. Tu equidad real vs ese rango es ~20-25% — muy por debajo del 34% requerido. Foldea.",
   en:"FOLD. AT (top pair of Tens) on T-7-3-K vs reg all-in on turn. ER ≈ 62/(62+120.5) ≈ 34%. Reg (VPIP 25%) who calls hero raise and goes all-in on turn has polarized range toward the strongest: KT (two pair), TT/KK (sets), strong KX. AT barely beats AK (split) and loses to all their value range. Your real equity vs that range is ~20-25% — well below the required 34%. Fold."},

  // ── TENDENCIAS DE POBLACIÓN + THIN CALLS (6) ────────────────────────────

  // S615: Jugador desconocido apuesta 3 calles, hero segunda pareja → FOLD
  {id:615,type:"facing",hand:"J♦ 9♦",board:"J♠T♣5♥8♦K♠",street:"river",open:false,
   ctx:"facing_river",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Jugador desconocido (menos de 50 manos, sin stats fiables)\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop J♠T♣5♥: Hero checkea. BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB.\nTurn 8♦: Hero checkea. BTN apuesta 9BB. Hero paga. Bote: 30.5BB.\nRiver K♠: Hero checkea. BTN apuesta 25BB (82% del bote).",
   descEn:"NL25 · BB vs BTN · Unknown player (less than 50 hands, no reliable stats)\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop J♠T♣5♥: Hero checks. BTN bets 3.5BB. Hero calls. Pot: 12.5BB.\nTurn 8♦: Hero checks. BTN bets 9BB. Hero calls. Pot: 30.5BB.\nRiver K♠: Hero checks. BTN bets 25BB (82% of pot).",
   es:"FOLD. J9 (par de Jotas, kicker débil) en J-T-5-8-K — tablero conectado completo. Sin reads, el sesgo por defecto en NL10-NL25 es fold vs jugador desconocido apostando las 3 calles. La tendencia de la población: muy pocos jugadores bluffean las 3 calles en NL25. El K del river fortalece el rango del rival (KJ, KT, K8). J9 tiene SDV insuficiente sin reads que apoyen el call. Foldea.",
   en:"FOLD. J9 (pair of jacks, weak kicker) on J-T-5-8-K — fully connected board. No reads, default bias in NL10-NL25 is fold vs unknown player betting all 3 streets. Population tendency: very few players bluff all 3 streets in NL25. K on river strengthens villain's range (KJ, KT, K8). J9 has insufficient SDV without reads supporting the call. Fold."},

  // S616: Fish pasivo apuesta river por primera vez, hero top pair kicker mala → FOLD
  {id:616,type:"facing",hand:"K♦ 8♦",board:"K♥Q♣3♠J♦A♦",street:"river",open:false,
   ctx:"facing_river",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Fish pasivo (VPIP 56%, PFR 7%, CBet River 11%, WTSD 45%)\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop K♥Q♣3♠: Hero checkea. BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB.\nTurn J♦: Hero checkea. BTN checkea. Bote: 12.5BB.\nRiver A♦: Hero checkea. BTN apuesta 10BB (80% del bote) — primera apuesta proactiva del rival.",
   descEn:"NL25 · BB vs BTN · Passive fish (VPIP 56%, PFR 7%, CBet River 11%, WTSD 45%)\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop K♥Q♣3♠: Hero checks. BTN bets 3.5BB. Hero calls. Pot: 12.5BB.\nTurn J♦: Hero checks. BTN checks. Pot: 12.5BB.\nRiver A♦: Hero checks. BTN bets 10BB (80% of pot) — villain's first proactive bet.",
   es:"FOLD. K8 (top pair kicker pésima) en K-Q-3-J-A. ER = 10/(10+22.5) = 31%. Fish pasivo (CBet River 11%) que apuesta el river por primera vez tiene rango extremadamente sesgado hacia valor: AK (dos pares), AX, KQ, KJ. Con WTSD 45% este fish llega al showdown pasivamente checkeando — solo apuesta cuando tiene mano muy fuerte. K8 no tiene el 31% de equity necesario vs su rango de river bet. Foldea.",
   en:"FOLD. K8 (top pair terrible kicker) on K-Q-3-J-A. ER = 10/(10+22.5) = 31%. Passive fish (CBet River 11%) betting river for the first time has extremely value-weighted range: AK (two pair), AX, KQ, KJ. With WTSD 45% this fish reaches showdown passively by checking — only bets when they have a strong hand. K8 doesn't have the required 31% equity vs their river bet range. Fold."},

  // S617: Aggro reg WWSF alto, apuesta river, hero underpair como bluff catcher → CALL
  {id:617,type:"facing",hand:"8♠ 8♦",board:"A♣K♥5♦2♣9♠",street:"river",open:true,
   ctx:"facing_river",pos:"BTN",callPos:"BB",
   descEs:"NL25 · BTN vs BB · Aggro reg (VPIP 32%, PFR 26%, CBet River 58%, WWSF 62%)\nPreflop: Hero abre BTN 2.5BB. BB paga. Bote: 5.5BB.\nFlop A♣K♥5♦: BB checkea. Hero apuesta 3.5BB. BB paga. Bote: 12.5BB.\nTurn 2♣: BB checkea. Hero apuesta 8BB. BB paga. Bote: 28.5BB.\nRiver 9♠: BB apuesta 22BB (77% del bote).",
   descEn:"NL25 · BTN vs BB · Aggro reg (VPIP 32%, PFR 26%, CBet River 58%, WWSF 62%)\nPreflop: Hero opens BTN 2.5BB. BB calls. Pot: 5.5BB.\nFlop A♣K♥5♦: BB checks. Hero bets 3.5BB. BB calls. Pot: 12.5BB.\nTurn 2♣: BB checks. Hero bets 8BB. BB calls. Pot: 28.5BB.\nRiver 9♠: BB bets 22BB (77% of pot).",
   es:"PAGAR. 88 como bluff catcher vs aggro reg. ER = 22/(22+50.5) = 30%. El aggro reg (CBet River 58%, WWSF 62%) usó línea check-call-call-lead river — típica de bluffs con draws fallidos: QJ, QT, JT (missed straight draws en tablero A-K-5-2). 88 gana vs toda esa gama de bluffs. Con WWSF 62% este rival genera suficientes bluffs para justificar el call. El sizing 77% es consistente con bluff o value mediocre. Paga.",
   en:"CALL. 88 as bluff catcher vs aggro reg. ER = 22/(22+50.5) = 30%. Aggro reg (CBet River 58%, WWSF 62%) used check-call-call-lead river line — typical of bluffs with missed draws: QJ, QT, JT (missed straight draws on A-K-5-2 board). 88 beats all those bluff hands. With WWSF 62% this opponent generates enough bluffs to justify the call. The 77% sizing is consistent with bluff or mediocre value. Call."},

  // S618: Thin call — reg checkea turn, apuesta river pequeño, top pair mediocre → CALL
  {id:618,type:"facing",hand:"Q♣ T♠",board:"Q♠8♦3♥6♣K♦",street:"river",open:true,
   ctx:"facing_river",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Reg (VPIP 28%, PFR 21%, CBet River 38%, WWSF 52%)\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop Q♠8♦3♥: Hero checkea. BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB.\nTurn 6♣: Hero checkea. BTN checkea. Bote: 12.5BB.\nRiver K♦: Hero checkea. BTN apuesta 7BB (56% del bote).",
   descEn:"NL25 · BB vs BTN · Reg (VPIP 28%, PFR 21%, CBet River 38%, WWSF 52%)\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop Q♠8♦3♥: Hero checks. BTN bets 3.5BB. Hero calls. Pot: 12.5BB.\nTurn 6♣: Hero checks. BTN checks. Pot: 12.5BB.\nRiver K♦: Hero checks. BTN bets 7BB (56% of pot).",
   es:"PAGAR (call thin). QT en Q-8-3-6-K. ER = 7/(7+19.5) = 26%. El BTN checkeó el turn — señal de que no tenía mano suficientemente fuerte para barrel (ni value ni semi-bluff potente). Eso amplía su rango de river bet hacia value mediocre (8X, KX débil) y bluffs de draws fallidos. CBet River 38% con turn check: mezcla de valor/bluff. QT (top pair kicker mediocre) supera los bluffs y algo del valor mediocre. ER 26% alcanzable. Call thin correcto.",
   en:"CALL (thin call). QT on Q-8-3-6-K. ER = 7/(7+19.5) = 26%. BTN checked turn — signal they didn't have a strong enough hand to barrel (no strong value or semi-bluff). That widens their river bet range toward mediocre value (8X, weak KX) and missed draw bluffs. CBet River 38% with turn check: mix of value/bluff. QT (top pair mediocre kicker) beats the bluffs and some mediocre value. 26% ER achievable. Correct thin call."},

  // S619: Nut flush completado en el flop, river empareja el tablero pero la nuts sigue siendo tuya → CALL
  {id:619,type:"facing",hand:"A♥ 5♥",board:"K♥9♥7♥3♣3♦",street:"river",open:true,
   ctx:"facing_river",pos:"BB",callPos:"BTN",
   descEs:"NL25 · BB vs BTN · Fish (VPIP 60%, PFR 11%, WTSD 42%)\nPreflop: BTN abre 2.5BB. Hero BB paga. Bote: 5.5BB.\nFlop K♥9♥7♥: Hero checkea (flush de Ases ya completada). BTN apuesta 3.5BB. Hero paga. Bote: 12.5BB.\nTurn 3♣: Hero checkea. BTN apuesta 7BB. Hero paga. Bote: 26.5BB.\nRiver 3♦: Hero checkea. BTN apuesta 20BB (75% del bote).",
   descEn:"NL25 · BB vs BTN · Fish (VPIP 60%, PFR 11%, WTSD 42%)\nPreflop: BTN opens 2.5BB. Hero BB calls. Pot: 5.5BB.\nFlop K♥9♥7♥: Hero checks (Ace-high flush already made). BTN bets 3.5BB. Hero calls. Pot: 12.5BB.\nTurn 3♣: Hero checks. BTN bets 7BB. Hero calls. Pot: 26.5BB.\nRiver 3♦: Hero checks. BTN bets 20BB (75% of pot).",
   es:"PAGAR. A♥5♥ tiene flush de Ases (la nuts, salvo escalera de color) desde el flop en K-9-7 con tres corazones. ER = 20/(20+46.5) = 30%. El river 3♦ empareja el tablero (K-9-7-3-3), pero para que el fish tenga full house necesitaría exactamente 33 (2 combos) o K3/93/73 — extremadamente improbable viniendo de un fish (VPIP 60%) que llevó la apuesta las 3 calles desde el flop con un rango amplio de value. Tu flush de Ases sigue siendo la mejor mano en ~95% de su rango. Paga sin dudar.",
   en:"CALL. A♥5♥ has the nut flush (the nuts barring a straight flush) since the flop on K-9-7 with three hearts. ER = 20/(20+46.5) = 30%. River 3♦ pairs the board (K-9-7-3-3), but for the fish to have a full house they'd need exactly 33 (2 combos) or K3/93/73 — extremely unlikely from a fish (VPIP 60%) who led betting all 3 streets from the flop with a wide value range. Your nut flush remains the best hand in ~95% of their range. Call without hesitation."},

  // S620: AQ sin pareja vs 3-bet + 3 barriles crecientes de un reg en tablero seco → FOLD
  {id:620,type:"facing",hand:"A♦ Q♦",board:"J♣9♠4♦2♥7♠",street:"river",open:false,
   ctx:"facing_river",pos:"CO",callPos:"BTN",
   descEs:"NL25 · CO vs BTN · Reg (VPIP 24%, PFR 19%, CBet River 45%, WWSF 49%)\nPreflop: Hero abre CO 2.5BB. BTN 3-bet a 8BB. Hero paga. Bote: 17BB.\nFlop J♣9♠4♦: BTN apuesta 9BB. Hero paga. Bote: 35BB.\nTurn 2♥: BTN apuesta 22BB. Hero paga. Bote: 79BB.\nRiver 7♠: BTN apuesta 60BB (76% del bote).",
   descEn:"NL25 · CO vs BTN · Reg (VPIP 24%, PFR 19%, CBet River 45%, WWSF 49%)\nPreflop: Hero opens CO 2.5BB. BTN 3-bets to 8BB. Hero calls. Pot: 17BB.\nFlop J♣9♠4♦: BTN bets 9BB. Hero calls. Pot: 35BB.\nTurn 2♥: BTN bets 22BB. Hero calls. Pot: 79BB.\nRiver 7♠: BTN bets 60BB (76% of pot).",
   es:"FOLD. AQ (as alto, sin pareja) en J-9-4-2-7 — no tienes ni un par. ER = 60/(60+139) = 30%. Necesitarías que el rival faroleara con frecuencia ≥30% tras 3-bet preflop + 2 barriles + overbet de river. Un reg que 3-betea preflop y dispara 3 calles con sizing creciente en un tablero seco y desconectado tiene rango polarizado: sets/overpares (JJ, 99, 44, QQ+), AJ/A9 (top pair). Sin pareja, AQ no le gana a nada de ese rango salvo bluffs puros, que un reg así rara vez ejecuta con 3 barriles. Foldea — esto es un river fold claro, no un thin call.",
   en:"FOLD. AQ (ace-high, no pair) on J-9-4-2-7 — you don't even have a pair. ER = 60/(60+139) = 30%. You'd need villain bluffing ≥30% across a preflop 3-bet + 2 barrels + river overbet. A reg who 3-bets preflop and fires 3 streets with increasing sizing on a dry, disconnected board has a polarized range: sets/overpairs (JJ, 99, 44, QQ+), AJ/A9 (top pair). With no pair, AQ beats nothing in that range except pure bluffs, which a reg like this rarely runs with 3 barrels. Fold — this is a clear river fold, not a thin call."},
];

const CATEGORY_DEFS = [
  { key: "open",   icon: "♠", es: "Apertura (OR)", en: "Opening (OR)" },
  { key: "iso",    icon: "♣", es: "ROL / ISO",      en: "ROL / ISO" },
  { key: "cbet",   icon: "♥", es: "C-Bet",          en: "C-Bet" },
  { key: "vbet",   icon: "♦", es: "Value Bet",      en: "Value Bet" },
  { key: "call",   icon: "⟵", es: "Pagar apert.",   en: "Calling Opens" },
  { key: "facing", icon: "⚡", es: "Facing Bets",    en: "Facing Bets" },
];

// ─── REPORT ISSUE MODAL ───────────────────────────────────────────────────────

function ReportModal({ onClose, sit, lang, user, p }) {
  const [reason, setReason] = useState(REPORT_REASONS[0].id);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleSubmit = async () => {
    if (!user) return;
    setStatus("sending");
    try {
      await addDoc(collection(db, "situationReports"), {
        situationType: sit.type || "open",
        situationId: sit.id ?? null,
        hand: sit.hand || null,
        board: sit.board || null,
        lang,
        reason,
        comment: comment.trim(),
        reporterUid: user.uid,
        reporterEmail: user.email,
        status: "open",
        createdAt: serverTimestamp(),
      });
      setStatus("success");
    } catch (_) {
      setStatus("error");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 14, padding: 20, maxWidth: 440, width: "100%" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{p.reportTitle}</div>
        {status === "success" ? (
          <div style={{ color: "#10b981", fontSize: 14, marginBottom: 14 }}>✓ {p.reportSuccess}</div>
        ) : !user ? (
          <div style={{ color: "#8b8fa8", fontSize: 14, marginBottom: 14 }}>{p.reportLoginRequired}</div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.reportReasonLabel}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {REPORT_REASONS.map(r => (
                <label key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: reason === r.id ? "#e8c96a" : "#c8cce0", cursor: "pointer" }}>
                  <input type="radio" name="reportReason" checked={reason === r.id} onChange={() => setReason(r.id)} />
                  {lang === "es" ? r.es : r.en}
                </label>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.reportCommentLabel}</div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={p.reportCommentPlaceholder}
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", background: "#0a0c14", border: "1px solid #1e2235", borderRadius: 8, padding: "10px 12px", color: "#e8e8e8", fontSize: 13, fontFamily: "inherit", marginBottom: 14, resize: "vertical" }}
            />
            {status === "error" && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{p.reportError}</div>}
          </>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "8px 16px", color: "#8b8fa8", cursor: "pointer", fontSize: 13 }}>
            {status === "success" ? (lang === "es" ? "Cerrar" : "Close") : p.reportCancel}
          </button>
          {status !== "success" && user && (
            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              style={{ background: "linear-gradient(135deg,#e8c96a 0%,#c9a84c 100%)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#0a0c14", fontWeight: 800, fontSize: 13, cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? p.reportSending : p.reportSubmit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditProposalModal({ onClose, sit, lang, user, p }) {
  const options = correctActionOptions(sit, p, lang);
  const currentIdx = options.findIndex(o =>
    o.open === !!sit.open && (o.size === null || o.size === sit.size)
  );
  const [choiceIdx, setChoiceIdx] = useState(currentIdx >= 0 ? currentIdx : 0);
  const [explEs, setExplEs] = useState(sit.es || "");
  const [explEn, setExplEn] = useState(sit.en || "");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error | needComment

  const handleSubmit = async () => {
    if (!user) return;
    if (!comment.trim()) { setStatus("needComment"); return; }
    setStatus("sending");
    const chosen = options[choiceIdx];
    try {
      await addDoc(collection(db, "editProposals"), {
        situationType: sit.type || "open",
        situationId: sit.id ?? null,
        hand: sit.hand || null,
        board: sit.board || null,
        lang,
        currentOpen: !!sit.open,
        currentSize: sit.size ?? null,
        currentEs: sit.es || "",
        currentEn: sit.en || "",
        currentLabel: options[currentIdx]?.label ?? null,
        proposedOpen: chosen.open,
        proposedSize: chosen.size,
        proposedEs: explEs.trim(),
        proposedEn: explEn.trim(),
        proposedLabel: chosen.label,
        comment: comment.trim(),
        proposerUid: user.uid,
        proposerEmail: user.email,
        status: "pending",
        votesUp: 0,
        votesDown: 0,
        createdAt: serverTimestamp(),
      });
      setStatus("success");
    } catch (_) {
      setStatus("error");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 14, padding: 20, maxWidth: 480, width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{p.editTitle}</div>
        {status === "success" ? (
          <div style={{ color: "#10b981", fontSize: 14, marginBottom: 14 }}>✓ {p.editSuccess}</div>
        ) : !user ? (
          <div style={{ color: "#8b8fa8", fontSize: 14, marginBottom: 14 }}>{p.editLoginRequired}</div>
        ) : (
          <>
            {currentIdx >= 0 && (
              <div style={{ fontSize: 12, color: "#5a5f78", marginBottom: 12 }}>
                {p.editCurrentLabel}: <span style={{ color: "#c8cce0" }}>{options[currentIdx].label}</span>
              </div>
            )}
            <div style={{ fontSize: 12, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.editCorrectLabel}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {options.map((o, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: choiceIdx === i ? "#e8c96a" : "#c8cce0", cursor: "pointer" }}>
                  <input type="radio" name="editChoice" checked={choiceIdx === i} onChange={() => setChoiceIdx(i)} />
                  {o.label}
                </label>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.editExplEsLabel}</div>
            <textarea
              value={explEs}
              onChange={e => setExplEs(e.target.value)}
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", background: "#0a0c14", border: "1px solid #1e2235", borderRadius: 8, padding: "10px 12px", color: "#e8e8e8", fontSize: 13, fontFamily: "inherit", marginBottom: 12, resize: "vertical" }}
            />
            <div style={{ fontSize: 12, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.editExplEnLabel}</div>
            <textarea
              value={explEn}
              onChange={e => setExplEn(e.target.value)}
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", background: "#0a0c14", border: "1px solid #1e2235", borderRadius: 8, padding: "10px 12px", color: "#e8e8e8", fontSize: 13, fontFamily: "inherit", marginBottom: 12, resize: "vertical" }}
            />
            <div style={{ fontSize: 12, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.editCommentLabel}</div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={p.editCommentPlaceholder}
              rows={2}
              style={{ width: "100%", boxSizing: "border-box", background: "#0a0c14", border: "1px solid #1e2235", borderRadius: 8, padding: "10px 12px", color: "#e8e8e8", fontSize: 13, fontFamily: "inherit", marginBottom: 12, resize: "vertical" }}
            />
            {status === "needComment" && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{p.editCommentRequired}</div>}
            {status === "error" && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{p.editError}</div>}
          </>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "8px 16px", color: "#8b8fa8", cursor: "pointer", fontSize: 13 }}>
            {status === "success" ? (lang === "es" ? "Cerrar" : "Close") : p.editCancel}
          </button>
          {status !== "success" && user && (
            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              style={{ background: "linear-gradient(135deg,#e8c96a 0%,#c9a84c 100%)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#0a0c14", fontWeight: 800, fontSize: 13, cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? p.editSending : p.editSubmit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PROPOSE NEW HAND MODAL ───────────────────────────────────────────────────

const POSITIONS = ["UTG", "MP", "CO", "BTN", "SB", "BB"];

function ProposeSituationModal({ onClose, lang, user, p, defaultCategory }) {
  const [category, setCategory] = useState(defaultCategory || "open");
  const [pos, setPos] = useState("BTN");
  const [hand, setHand] = useState("");
  const [board, setBoard] = useState("");
  const [callPos, setCallPos] = useState("BB");
  const [players, setPlayers] = useState(1); // 1 = HU, 2 = 3-way
  const [street, setStreet] = useState("flop");
  const [limpers, setLimpers] = useState(1);
  const [limperContext, setLimperContext] = useState("");
  const [contextText, setContextText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [correctExplain, setCorrectExplain] = useState("");
  const [wrongExplain, setWrongExplain] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error | invalid

  // Versión opcional en el otro idioma
  const otherLang = lang === "es" ? "en" : "es";
  const [addOtherLang, setAddOtherLang] = useState(false);
  const [contextText2, setContextText2] = useState("");
  const [options2, setOptions2] = useState(["", "", "", ""]);
  const [correctExplain2, setCorrectExplain2] = useState("");
  const [wrongExplain2, setWrongExplain2] = useState("");

  const setOption = (i, val) => setOptions(prev => prev.map((o, idx) => idx === i ? val : o));
  const setOption2 = (i, val) => setOptions2(prev => prev.map((o, idx) => idx === i ? val : o));

  const handleSubmit = async () => {
    if (!user) return;
    const filledOptions = options.map(o => o.trim());
    if (!hand.trim() || filledOptions.some(o => !o) || !correctExplain.trim()) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      // Contexto en el idioma principal (incluye el contexto de limpers para iso)
      let primaryDesc = contextText.trim();
      if (category === "iso" && limperContext.trim()) {
        primaryDesc = `${limperContext.trim()}${primaryDesc ? " — " + primaryDesc : ""}`;
      }

      const data = {
        type: category,
        community: true,
        pos,
        hand: hand.trim(),
        correctIndex,
        comment: comment.trim(),
        lang,
        authorUid: user.uid,
        authorEmail: user.email,
        status: "pending",
        votesUp: 0,
        votesDown: 0,
        createdAt: serverTimestamp(),
      };

      // Idioma principal
      data[lang === "es" ? "optionsEs" : "optionsEn"] = filledOptions;
      data[lang === "es" ? "correctExplainEs" : "correctExplainEn"] = correctExplain.trim();
      data[lang === "es" ? "wrongExplainEs" : "wrongExplainEn"] = wrongExplain.trim() || null;
      data[lang === "es" ? "descEs" : "descEn"] = primaryDesc || null;

      // Idioma secundario (opcional)
      if (addOtherLang) {
        const filledOptions2 = options2.map(o => o.trim());
        if (filledOptions2.every(o => o) && correctExplain2.trim()) {
          let secondaryDesc = contextText2.trim();
          data[otherLang === "es" ? "optionsEs" : "optionsEn"] = filledOptions2;
          data[otherLang === "es" ? "correctExplainEs" : "correctExplainEn"] = correctExplain2.trim();
          data[otherLang === "es" ? "wrongExplainEs" : "wrongExplainEn"] = wrongExplain2.trim() || null;
          data[otherLang === "es" ? "descEs" : "descEn"] = secondaryDesc || null;
        }
      }

      if (category === "cbet" || category === "vbet" || category === "facing") {
        data.board = board.trim() || null;
      }
      if (category === "cbet" || category === "vbet" || category === "call" || category === "facing") {
        data.callPos = callPos;
      }
      if (category === "cbet" || category === "vbet") {
        data.players = players;
      }
      if (category === "facing") {
        data.street = street;
      }
      if (category === "iso") {
        data.limpers = limpers;
      }

      await addDoc(collection(db, "communitySituations"), data);
      setStatus("success");
    } catch (_) {
      setStatus("error");
    }
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", background: "#0a0c14", border: "1px solid #1e2235", borderRadius: 8, padding: "10px 12px", color: "#e8e8e8", fontSize: 13, fontFamily: "inherit" };
  const labelStyle = { fontSize: 12, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 14 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 14, padding: 20, maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{p.proposeTitle}</div>
        {status === "success" ? (
          <div style={{ color: "#10b981", fontSize: 14, marginBottom: 14 }}>✓ {p.proposeSuccess}</div>
        ) : !user ? (
          <div style={{ color: "#8b8fa8", fontSize: 14, marginBottom: 14 }}>{p.proposeLoginRequired}</div>
        ) : (
          <>
            <div style={labelStyle}>{p.proposeCategoryLabel}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
              {CATEGORY_DEFS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  style={{ padding: "6px 12px", borderRadius: 16, border: category === c.key ? "1px solid #c9a84c" : "1px solid #1e2235", background: category === c.key ? "#c9a84c22" : "transparent", color: category === c.key ? "#e8c96a" : "#8b8fa8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  {c.icon} {lang === "es" ? c.es : c.en}
                </button>
              ))}
            </div>

            <div style={labelStyle}>{p.proposePosLabel}</div>
            <select value={pos} onChange={e => setPos(e.target.value)} style={inputStyle}>
              {POSITIONS.map(po => <option key={po} value={po}>{po}</option>)}
            </select>

            <div style={labelStyle}>{p.proposeHandLabel}</div>
            <input type="text" value={hand} onChange={e => setHand(e.target.value)} placeholder="A♠ K♦" style={inputStyle} />

            {(category === "cbet" || category === "vbet" || category === "facing") && (
              <>
                <div style={labelStyle}>{p.proposeBoardLabel}</div>
                <input type="text" value={board} onChange={e => setBoard(e.target.value)} placeholder="A♦ 7♣ 2♥" style={inputStyle} />
              </>
            )}

            {(category === "cbet" || category === "vbet" || category === "call" || category === "facing") && (
              <>
                <div style={labelStyle}>{p.proposeCallPosLabel}</div>
                <select value={callPos} onChange={e => setCallPos(e.target.value)} style={inputStyle}>
                  {POSITIONS.map(po => <option key={po} value={po}>{po}</option>)}
                </select>
              </>
            )}

            {(category === "cbet" || category === "vbet") && (
              <>
                <div style={labelStyle}>{p.proposePlayersLabel}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => setPlayers(1)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: players === 1 ? "1px solid #c9a84c" : "1px solid #1e2235", background: players === 1 ? "#c9a84c22" : "transparent", color: players === 1 ? "#e8c96a" : "#8b8fa8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{p.proposeHU}</button>
                  <button type="button" onClick={() => setPlayers(2)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: players === 2 ? "1px solid #c9a84c" : "1px solid #1e2235", background: players === 2 ? "#c9a84c22" : "transparent", color: players === 2 ? "#e8c96a" : "#8b8fa8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{p.propose3way}</button>
                </div>
              </>
            )}

            {category === "facing" && (
              <>
                <div style={labelStyle}>{p.proposeStreetLabel}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["flop", p.proposeStreetFlop], ["turn", p.proposeStreetTurn], ["river", p.proposeStreetRiver]].map(([k, lab]) => (
                    <button key={k} type="button" onClick={() => setStreet(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: street === k ? "1px solid #c9a84c" : "1px solid #1e2235", background: street === k ? "#c9a84c22" : "transparent", color: street === k ? "#e8c96a" : "#8b8fa8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{lab}</button>
                  ))}
                </div>
              </>
            )}

            {category === "iso" && (
              <>
                <div style={labelStyle}>{p.proposeLimpersLabel}</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <button type="button" onClick={() => setLimpers(1)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: limpers === 1 ? "1px solid #c9a84c" : "1px solid #1e2235", background: limpers === 1 ? "#c9a84c22" : "transparent", color: limpers === 1 ? "#e8c96a" : "#8b8fa8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{p.proposeLimper1}</button>
                  <button type="button" onClick={() => setLimpers(2)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: limpers === 2 ? "1px solid #c9a84c" : "1px solid #1e2235", background: limpers === 2 ? "#c9a84c22" : "transparent", color: limpers === 2 ? "#e8c96a" : "#8b8fa8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{p.proposeLimper2}</button>
                </div>
                <div style={labelStyle}>{p.proposeLimperContextLabel}</div>
                <input type="text" value={limperContext} onChange={e => setLimperContext(e.target.value)} placeholder={p.proposeLimperContextPlaceholder} style={inputStyle} />
              </>
            )}

            <div style={labelStyle}>{category === "iso" ? p.proposeContextOptional : p.proposeContextLabel}</div>
            <textarea value={contextText} onChange={e => setContextText(e.target.value)} placeholder={p.proposeContextPlaceholder} rows={3} style={{ ...inputStyle, resize: "vertical" }} />

            <div style={labelStyle}>{p.proposeOptionsLabel}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map((opt, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    title={p.proposeCorrectLabel}
                  />
                  <input type="text" value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`${p.proposeOptionPlaceholder} ${i + 1}`} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#5a5f78", marginTop: 6 }}>{p.proposeCorrectLabel}</div>

            <div style={labelStyle}>{p.proposeCorrectExplLabel}</div>
            <textarea value={correctExplain} onChange={e => setCorrectExplain(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />

            <div style={labelStyle}>{p.proposeWrongExplLabel}</div>
            <textarea value={wrongExplain} onChange={e => setWrongExplain(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />

            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setAddOtherLang(v => !v)}
                style={{ width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8, border: addOtherLang ? "1px solid #c9a84c" : "1px solid #1e2235", background: addOtherLang ? "#c9a84c22" : "transparent", color: addOtherLang ? "#e8c96a" : "#8b8fa8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                {p.proposeAddOtherLang}
              </button>
            </div>

            {addOtherLang && (
              <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: "2px solid #1e2235" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#c9a84c", marginBottom: 4 }}>{p.proposeOtherLangTitle}</div>

                <div style={labelStyle}>{p.proposeSecondaryContextLabel}</div>
                <textarea value={contextText2} onChange={e => setContextText2(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />

                <div style={labelStyle}>{p.proposeSecondaryOptionsLabel}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {options2.map((opt, i) => (
                    <input key={i} type="text" value={opt} onChange={e => setOption2(i, e.target.value)} placeholder={`${p.proposeOptionPlaceholder} ${i + 1}`} style={inputStyle} />
                  ))}
                </div>

                <div style={labelStyle}>{p.proposeSecondaryCorrectExplLabel}</div>
                <textarea value={correctExplain2} onChange={e => setCorrectExplain2(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />

                <div style={labelStyle}>{p.proposeSecondaryWrongExplLabel}</div>
                <textarea value={wrongExplain2} onChange={e => setWrongExplain2(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            )}

            <div style={labelStyle}>{p.proposeCommentLabel}</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />

            {status === "invalid" && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 10 }}>{p.proposeValidation}</div>}
            {status === "error" && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 10 }}>{p.proposeError}</div>}
          </>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "8px 16px", color: "#8b8fa8", cursor: "pointer", fontSize: 13 }}>
            {status === "success" ? (lang === "es" ? "Cerrar" : "Close") : p.proposeCancel}
          </button>
          {status !== "success" && user && (
            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              style={{ background: "linear-gradient(135deg,#e8c96a 0%,#c9a84c 100%)", border: "none", borderRadius: 8, padding: "8px 18px", color: "#0a0c14", fontWeight: 800, fontSize: 13, cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}
            >
              {status === "sending" ? p.proposeSending : p.proposeSubmit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PracticePage({ t, lang, onSessionComplete, user, overrides, communityHands }) {
  const p = t.practice;
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [currentOpts, setCurrentOpts] = useState([]);
  const [byType, setByType] = useState({});
  const [xpEarned, setXpEarned] = useState(0);
  const [selected, setSelected] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const community = communityHands || [];
  const byCommunity = (typ) => community.filter(h => h.type === typ);

  const CATEGORIES = {
    open:   [...SITUATIONS,       ...SITUATIONS_EXTRA,  ...byCommunity("open")],
    iso:    [...ISO_SITUATIONS,   ...ISO_SITUATIONS_EXTRA, ...byCommunity("iso")],
    cbet:   [...CBET_SITUATIONS,  ...CBET_SITUATIONS_EXTRA, ...byCommunity("cbet")],
    vbet:   [...VBET_SITUATIONS,  ...VBET_SITUATIONS_EXTRA, ...byCommunity("vbet")],
    call:   [...CALL_SITUATIONS,  ...CALL_SITUATIONS_EXTRA, ...byCommunity("call")],
    facing: [...FACING_SITUATIONS,...FACING_SITUATIONS_EXTRA, ...byCommunity("facing")],
  };

  const startSession = () => {
    const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
    let hands;
    if (selected.length === 0) {
      // Sin filtro: sesión estratificada de 12 manos (2 por categoría)
      hands = [
        ...pick(CATEGORIES.open,   2),
        ...pick(CATEGORIES.iso,    2),
        ...pick(CATEGORIES.cbet,   2),
        ...pick(CATEGORIES.vbet,   2),
        ...pick(CATEGORIES.call,   2),
        ...pick(CATEGORIES.facing, 2),
      ];
    } else {
      // Con filtro: 10 manos repartidas entre las categorías elegidas
      const n = selected.length;
      const base = Math.floor(10 / n);
      const extra = 10 % n;
      hands = selected.flatMap((cat, i) => pick(CATEGORIES[cat], base + (i < extra ? 1 : 0)));
    }
    hands = hands.sort(() => Math.random() - 0.5);
    setSession(hands);
    setIdx(0); setPicked(null); setScore(0); setDone(false); setByType({}); setXpEarned(0); setReportOpen(false); setEditOpen(false);
    setCurrentOpts(buildOptions(applyOverride(hands[0], overrides), t.practice, lang));
  };

  const handlePick = (opt) => {
    if (picked !== null) return;
    setPicked(opt);
    const sit = session[idx];
    const typ = sit.type || "open";
    setByType(prev => {
      const e = prev[typ] || { correct:0, total:0 };
      return { ...prev, [typ]: { correct: e.correct + (opt.correct?1:0), total: e.total+1 } };
    });
    if (opt.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx < session.length - 1) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setPicked(null);
      setReportOpen(false);
      setEditOpen(false);
      setCurrentOpts(buildOptions(applyOverride(session[nextIdx], overrides), t.practice, lang));
    } else {
      const finalScore = (picked && picked.correct ? score + 1 : score);
      if (onSessionComplete) {
        onSessionComplete(finalScore, byType)
          .then(earned => setXpEarned(earned || calcXP(finalScore, session.length)))
          .catch(() => setXpEarned(calcXP(finalScore, session.length)));
      } else {
        setXpEarned(calcXP(finalScore, session.length));
      }
      setDone(true);
    }
  };

  const posColors = { UTG:"#ef4444", MP:"#f97316", CO:"#eab308", BTN:"#10b981", SB:"#8b5cf6", BB:"#06b6d4" };

  // Postflop acting order (earliest to latest). Used to determine IP/OOP for the
  // cbet/vbet badge when the ctx label itself doesn't disambiguate (e.g. "vbet_check").
  const POSTFLOP_ORDER = ["SB", "BB", "UTG", "MP", "CO", "BTN"];
  const isOOP = (sit) => {
    if (!sit.ctx) return false;
    if (sit.ctx === "cb_3way") return true;
    if (sit.ctx === "cb_3way_ip") return false;
    if (sit.ctx.includes("oop")) return true;
    if (sit.ctx.includes("ip")) return false;
    if (sit.pos && sit.callPos && !sit.callPos.includes("+")) {
      const a = POSTFLOP_ORDER.indexOf(sit.pos);
      const b = POSTFLOP_ORDER.indexOf(sit.callPos);
      if (a >= 0 && b >= 0) return a < b;
    }
    return false;
  };

  // ── Start screen ──────────────────────────────────────────────
  if (!session) {
    const toggleCat = (key) => setSelected(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{p.title}</div>
        <div style={{ fontSize: 14, color: "#8b8fa8", marginBottom: 28 }}>{p.subtitle}</div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          {p.filterTitle}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
          <button
            onClick={() => setSelected([])}
            style={{ padding: "8px 16px", borderRadius: 20, border: selected.length === 0 ? "1px solid #c9a84c" : "1px solid #1e2235", background: selected.length === 0 ? "#c9a84c22" : "transparent", color: selected.length === 0 ? "#e8c96a" : "#8b8fa8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            🎲 {p.filterRandom}
          </button>
          {CATEGORY_DEFS.map(c => {
            const active = selected.includes(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleCat(c.key)}
                style={{ padding: "8px 16px", borderRadius: 20, border: active ? "1px solid #c9a84c" : "1px solid #1e2235", background: active ? "#c9a84c22" : "transparent", color: active ? "#e8c96a" : "#8b8fa8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {c.icon} {lang === "es" ? c.es : c.en}
              </button>
            );
          })}
        </div>

        <button onClick={startSession} style={{ background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 100%)", border: "none", borderRadius: 12, padding: "14px 36px", color: "#0a0c14", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3 }}>
          {p.start}
        </button>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────
  if (done) {
    const typeLabels = {
      open: { es:"Apertura (OR)", en:"Opening (OR)" },
      iso:  { es:"ROL / ISO",     en:"ROL / ISO"    },
      cbet: { es:"C-Bet",         en:"C-Bet"        },
      vbet: { es:"Value Bet",     en:"Value Bet"    },
      call: { es:"Pagar apert.", en:"Calling Opens" },
      facing: { es:"Facing Bets", en:"Facing Bets" },
    };
    const typeOrder = ["open","iso","cbet","vbet","call","facing"];
    const sessionSize = session.length;
    const scoreColor = score>=sessionSize*0.8?"#10b981":score>=sessionSize*0.5?"#c9a84c":"#f97316";
    const xp = xpEarned || calcXP(score, sessionSize);
    const worstType = typeOrder
      .filter(t => byType[t] && byType[t].total > 0)
      .sort((a,b) => (byType[a].correct/byType[a].total) - (byType[b].correct/byType[b].total))[0];
    return (
      <div style={{ maxWidth:540, margin:"0 auto", padding:"32px 16px" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>{score===sessionSize?"🏆":score>=sessionSize*0.67?"👍":"📚"}</div>
          <div style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:4 }}>{p.scoreTitle}</div>
          <div style={{ fontSize:52, fontWeight:800, color:scoreColor, lineHeight:1 }}>
            {score}<span style={{ fontSize:26, color:"#8b8fa8", fontWeight:400 }}>/{sessionSize}</span>
          </div>
          <div style={{ fontSize:13, color:"#b0b4cc", marginTop:6 }}>{score===sessionSize?p.perfect:score>=sessionSize*0.67?p.good:p.review}</div>
        </div>
        <div style={{ background:"#120f04", border:"1px solid #c9a84c44", borderRadius:12, padding:"14px 20px", marginBottom:12, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:26 }}>⭐</div>
          <div>
            <div style={{ fontSize:10, color:"#8b8fa8", textTransform:"uppercase", letterSpacing:1 }}>{lang==="es"?"XP ganado":"XP earned"}</div>
            <div style={{ fontSize:22, fontWeight:800, color:"#e8c96a" }}>+{xp} XP</div>
          </div>
          <div style={{ marginLeft:"auto", fontSize:12, color:"#8b8fa8", textAlign:"right" }}>
            <div>Base: +{score*10} XP</div>
            {xp-score*10>0 && <div style={{ color:"#10b981" }}>Bonus: +{xp-score*10} XP</div>}
          </div>
        </div>
        <div style={{ background:"#0d0f1a", border:"1px solid #1e2235", borderRadius:12, padding:"14px 20px", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#8b8fa8", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>
            {lang==="es"?"Por categoría":"By category"}
          </div>
          {typeOrder.filter(t => byType[t]).map(t => {
            const { correct, total } = byType[t];
            const pct = Math.round((correct/total)*100);
            const col = pct===100?"#10b981":pct>=67?"#c9a84c":"#ef4444";
            return (
              <div key={t} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:13, color:"#e8e8e8" }}>{lang==="es"?typeLabels[t].es:typeLabels[t].en}</span>
                    {t===worstType && total>1 && <span style={{ fontSize:10, background:"#2a1008", color:"#f97316", padding:"1px 6px", borderRadius:4 }}>{lang==="es"?"Repasar":"Review"}</span>}
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:col }}>{correct}/{total}</span>
                </div>
                <div style={{ height:4, background:"#1e2235", borderRadius:4 }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:4 }}/>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={startSession} style={{ background:"linear-gradient(135deg,#e8c96a 0%,#c9a84c 100%)", border:"none", borderRadius:12, padding:"14px 0", color:"#0a0c14", fontSize:16, fontWeight:800, cursor:"pointer", letterSpacing:0.3, width:"100%" }}>
          {p.playAgain}
        </button>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────────
  const sit = applyOverride(session[idx], overrides);
  const opts = currentOpts;
  const ctx = sit.community ? null : CTX[sit.ctx];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#8b8fa8" }}>{p.situation} {idx + 1} {p.of} {session.length}</span>
          <span style={{ fontSize: 12, color: "#c9a84c" }}>✓ {score}</span>
        </div>
        <div style={{ height: 4, background: "#1e2235", borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${(idx / session.length) * 100}%`, background: "#c9a84c", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Report issue / Propose change */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => setEditOpen(true)}
          style={{ background: "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "5px 10px", color: "#8b8fa8", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}
        >
          ✏️ {p.editBtn}
        </button>
        <button
          onClick={() => setReportOpen(true)}
          style={{ background: "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "5px 10px", color: "#8b8fa8", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}
        >
          🚩 {p.reportBtn}
        </button>
      </div>
      {reportOpen && (
        <ReportModal key={"r"+idx} sit={sit} lang={lang} user={user} p={p} onClose={() => setReportOpen(false)} />
      )}
      {editOpen && (
        <EditProposalModal key={"e"+idx} sit={sit} lang={lang} user={user} p={p} onClose={() => setEditOpen(false)} />
      )}

      {/* Situation card */}
      <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
        {sit.community && (
          <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: "#0a0c14", background: "#e8c96a", borderRadius: 6, padding: "2px 8px", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            👥 {lang === "es" ? "Mano de la comunidad" : "Community hand"}
          </div>
        )}
        {((sit.type === "vbet" || sit.type === "facing") && sit.descEs) || (sit.community && (sit.descEs || sit.descEn)) ? (
          <div style={{ background:"#0a0c14", border:"1px solid #1e2235", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#c9a84c", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>
              {lang==="es" ? "Historia de la mano" : "Hand history"}
            </div>
            {((lang==="es" ? sit.descEs : sit.descEn) || sit.descEs || sit.descEn).split("\n").map((line,li) => (
              <div key={li} style={{ fontSize:13, color: li===0 ? "#8b8fa8" : "#b0b4cc", lineHeight:1.6, marginBottom:2 }}>{line}</div>
            ))}
          </div>
        ) : null}
        {sit.type === "call" && sit.pos && sit.callPos && (
          <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: posColors[sit.pos] || "#c9a84c", fontWeight: 800 }}>{sit.pos}</span>
            <span>{lang === "es" ? "vs apertura de" : "vs open from"}</span>
            <span style={{ fontWeight: 700, color: "#c9a84c" }}>{sit.callPos}</span>
          </div>
        )}
        {(sit.type === "cbet" || sit.type === "vbet") && sit.pos && sit.callPos && (
          <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: posColors[sit.pos] || "#c9a84c", fontWeight: 800 }}>{sit.pos}</span>
            <span>vs</span>
            <span style={{ fontWeight: 700, color: "#c9a84c" }}>{sit.callPos}</span>
            <span style={{ color: "#1e2235" }}>·</span>
            <span>{sit.players === 1 ? (lang === "es" ? "Heads-up" : "Heads-up") : (lang === "es" ? "3-way" : "3-way")}</span>
            <span style={{ color: "#1e2235" }}>·</span>
            <span>{isOOP(sit) ? (lang === "es" ? "Fuera de posición" : "Out of position") : (lang === "es" ? "En posición" : "In position")}</span>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginBottom: 16 }}>
          {sit.pos && (
            <div>
              <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8 }}>{p.posLabel}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: posColors[sit.pos] || "#c9a84c" }}>{sit.pos}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8 }}>{p.handLabel}</div>
            <div style={{ fontSize: 26, fontFamily: "monospace", fontWeight: 700, color: "#fff", letterSpacing: 2 }}>{sit.hand}</div>
          </div>
          {sit.board && (
            <div>
              <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8 }}>{p.boardLabel}</div>
              <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 700, color: "#f59e0b", letterSpacing: 2 }}>{sit.board}</div>
            </div>
          )}
          {sit.players != null && sit.type !== "cbet" && sit.type !== "vbet" && (
            <div>
              <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8 }}>{p.playersLabel}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8c96a" }}>{sit.players === 1 ? "HU (2)" : `${sit.players + 1}-way`}</div>
            </div>
          )}
        </div>
        {!sit.community && (
          <div style={{ fontSize: 13, color: "#8b8fa8", borderTop: "1px solid #1e2235", paddingTop: 12 }}>
            {sit.type === "cbet" && sit.callPos ? (
              <span>
                <span style={{ color: "#c9a84c", fontWeight: 600 }}>{lang === "es" ? "Situación: " : "Situation: "}</span>
                {lang === "es" ? `Abriste desde ${sit.pos}. ${sit.callPos} ${ctx.es}` : `You opened from ${sit.pos}. ${sit.callPos} ${ctx.en}`}
              </span>
            ) : (
              <span><span style={{ color: "#c9a84c", fontWeight: 600 }}>{p.contextLabel}: </span>{lang === "es" ? ctx.es : ctx.en}</span>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {opts.map((opt, oi) => {
          const isSelected = picked?.id === opt.id;
          let borderColor = "#1e2235", bg = "transparent", color = "#c8cce0";
          if (picked) {
            if (opt.correct) { borderColor = "#10b981"; bg = "#10b98111"; color = "#10b981"; }
            else if (isSelected) { borderColor = "#ef4444"; bg = "#ef444411"; color = "#ef4444"; }
          }
          return (
            <div key={oi}>
              <button
                disabled={!!picked}
                onClick={() => handlePick(opt)}
                style={{ width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color, cursor: picked ? "default" : "pointer", fontSize: 14, fontWeight: 500 }}
              >
                {opt.label}
              </button>
              {picked && isSelected && (
                <div style={{ marginTop: 6, padding: "10px 14px", background: opt.correct ? "#10b98115" : "#ef444415", borderRadius: 8, border: `1px solid ${opt.correct ? "#10b98133" : "#ef444433"}`, fontSize: 13, color: opt.correct ? "#6ee7b7" : "#fca5a5", lineHeight: 1.6 }}>
                  {opt.correct ? "✓ " : "✗ "}{opt.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {picked && (
        <button onClick={handleNext} style={{ width: "100%", background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 100%)", border: "none", borderRadius: 10, padding: "13px", color: "#0a0c14", fontWeight: 800, fontSize: 15, cursor: "pointer", letterSpacing: 0.3 }}>
          {idx < session.length - 1 ? p.next : p.finish}
        </button>
      )}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

function LoginScreen({ lang }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEs = lang === "es";
  const txt = {
    loginTitle:    isEs ? "Iniciar sesión"        : "Sign in",
    registerTitle: isEs ? "Crear cuenta"          : "Create account",
    emailLabel:    isEs ? "Correo electrónico"    : "Email",
    passLabel:     isEs ? "Contraseña"            : "Password",
    loginBtn:      isEs ? "Entrar"                : "Sign in",
    registerBtn:   isEs ? "Crear cuenta"          : "Create account",
    toRegister:    isEs ? "¿No tienes cuenta? Regístrate" : "No account? Register",
    toLogin:       isEs ? "¿Ya tienes cuenta? Inicia sesión" : "Already have an account? Sign in",
    passHint:      isEs ? "Mínimo 6 caracteres"  : "Minimum 6 characters",
  };

  const firebaseErrorMsg = (code) => {
    const map = {
      "auth/invalid-email":          isEs ? "Correo no válido."                  : "Invalid email.",
      "auth/user-not-found":         isEs ? "No existe esa cuenta."              : "Account not found.",
      "auth/wrong-password":         isEs ? "Contraseña incorrecta."             : "Wrong password.",
      "auth/email-already-in-use":   isEs ? "Ese correo ya está registrado."     : "Email already in use.",
      "auth/weak-password":          isEs ? "La contraseña es demasiado corta."  : "Password is too short.",
      "auth/invalid-credential":     isEs ? "Correo o contraseña incorrectos."   : "Invalid email or password.",
      "auth/too-many-requests":      isEs ? "Demasiados intentos. Espera un poco." : "Too many attempts. Try again later.",
    };
    return map[code] || (isEs ? "Ha ocurrido un error. Inténtalo de nuevo." : "An error occurred. Please try again.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(firebaseErrorMsg(err.code));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#0a0c14", border: "1px solid #1e2235",
    borderRadius: 10, padding: "12px 14px",
    color: "#e8e8e8", fontSize: 15, outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#08090f", backgroundImage: "radial-gradient(ellipse at 30% 40%, #0d1a0a 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, #1a120a 0%, transparent 50%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Decorative suits */}
      <span style={{ position: "absolute", top: "6%", left: "4%", fontSize: 140, color: "#c9a84c", opacity: 0.03, lineHeight: 1, userSelect: "none" }}>♠</span>
      <span style={{ position: "absolute", bottom: "8%", right: "3%", fontSize: 120, color: "#ef4444", opacity: 0.04, lineHeight: 1, userSelect: "none" }}>♥</span>

      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 22, color: "#c9a84c" }}>♠</span>
          <span style={{ fontSize: 22, color: "#ef4444" }}>♥</span>
          <span style={{ fontSize: 22, color: "#ef4444" }}>♦</span>
          <span style={{ fontSize: 22, color: "#c9a84c" }}>♣</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 50%, #a07830 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 0.3 }}>Poker Cash Academy</div>
        <div style={{ width: 50, height: 2, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", margin: "10px auto 0" }} />
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360, background: "linear-gradient(135deg, #0e1018 0%, #0a0c14 100%)", border: "1px solid #c9a84c33", borderRadius: 18, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 8px 48px #00000088" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f5", marginBottom: 4 }}>
          {mode === "login" ? txt.loginTitle : txt.registerTitle}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, color: "#8b8fa8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>{txt.emailLabel}</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle} autoComplete="email"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, color: "#8b8fa8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>{txt.passLabel}</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            required style={inputStyle} autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
          {mode === "register" && <span style={{ fontSize: 11, color: "#8b8fa8" }}>{txt.passHint}</span>}
        </div>

        {error && (
          <div style={{ background: "#ef444415", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <button
          type="submit" disabled={loading}
          style={{ background: loading ? "#8a6d1e" : "linear-gradient(135deg, #e8c96a 0%, #c9a84c 100%)", border: "none", borderRadius: 10, padding: "13px", color: "#0a0c14", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer", letterSpacing: 0.3 }}
        >
          {loading ? "..." : mode === "login" ? txt.loginBtn : txt.registerBtn}
        </button>

        <button
          type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          style={{ background: "transparent", border: "none", color: "#c9a84c", fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          {mode === "login" ? txt.toRegister : txt.toLogin}
        </button>
      </form>
    </div>
  );
}


// ─── GAMIFICATION ─────────────────────────────────────────────────────────────
const XP_LEVELS = [
  { level:1, name:"Fish",     nameEn:"Fish",     min:0     },
  { level:2, name:"Reg NL2",  nameEn:"Reg NL2",  min:500   },
  { level:3, name:"Reg NL5",  nameEn:"Reg NL5",  min:1000  },
  { level:4, name:"Reg NL10", nameEn:"Reg NL10", min:3000  },
  { level:5, name:"Reg NL25", nameEn:"Reg NL25", min:7000  },
  { level:6, name:"Reg NL50", nameEn:"Reg NL50", min:15000 },
];
function getLevelInfo(xp) {
  let lvl = XP_LEVELS[0];
  for (const l of XP_LEVELS) { if (xp >= l.min) lvl = l; }
  const next = XP_LEVELS.find(l => l.min > xp);
  const pct  = next ? Math.round(((xp - lvl.min)/(next.min - lvl.min))*100) : 100;
  return { ...lvl, next, pct };
}
function calcXP(score, sessionSize = 12) {
  const base = score * 10;
  const pct = sessionSize > 0 ? score / sessionSize : 0;
  const ratio = sessionSize / 12;
  const bonus = pct === 1 ? 70 : pct >= 10/12 ? 45 : pct >= 8/12 ? 25 : pct >= 0.5 ? 10 : 0;
  return base + Math.round(bonus * ratio);
}
function todayStr() { return new Date().toISOString().split('T')[0]; }
function calcStreak(lastDate, cur) {
  const today = todayStr();
  if (!lastDate) return { streak:1, newDay:true };
  if (lastDate === today) return { streak:cur, newDay:false };
  const yd = new Date(); yd.setDate(yd.getDate()-1);
  return lastDate === yd.toISOString().split('T')[0]
    ? { streak:cur+1, newDay:true }
    : { streak:1,     newDay:true };
}

// ─── ADMIN: REPORTES ────────────────────────────────────────────────────────────────

function AdminReportsPage({ lang }) {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "situationReports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = filter === "all" ? reports : reports.filter(r => (r.status || "open") === filter);

  const setStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "situationReports", id), { status });
    } catch (e) {
      console.error(e);
    }
  };

  const reasonLabel = (id) => {
    const r = REPORT_REASONS.find(x => x.id === id);
    if (!r) return id;
    return lang === "es" ? r.es : r.en;
  };

  const statusColors = { open: "#e0a83a", resolved: "#4caf6e", dismissed: "#8b8fa8" };
  const filters = [
    { id: "open", es: "Abiertos", en: "Open" },
    { id: "resolved", es: "Resueltos", en: "Resolved" },
    { id: "dismissed", es: "Descartados", en: "Dismissed" },
    { id: "all", es: "Todos", en: "All" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ color: "#fff", fontSize: 22, marginBottom: 4 }}>
        {lang === "es" ? "Reportes de fallos" : "Bug reports"}
      </h2>
      <p style={{ color: "#8b8fa8", fontSize: 13, marginBottom: 16 }}>
        {lang === "es"
          ? "Revisa los fallos reportados por los usuarios en las situaciones de práctica."
          : "Review issues reported by users on practice situations."}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background: filter === f.id ? "#c9a84c22" : "#111320",
              border: `1px solid ${filter === f.id ? "#c9a84c" : "#1e2235"}`,
              borderRadius: 8, padding: "6px 14px", color: filter === f.id ? "#c9a84c" : "#8b8fa8",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}
          >
            {lang === "es" ? f.es : f.en}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: "#8b8fa8", fontSize: 13 }}>{lang === "es" ? "Cargando..." : "Loading..."}</p>
      )}
      {!loading && filtered.length === 0 && (
        <p style={{ color: "#8b8fa8", fontSize: 13 }}>
          {lang === "es" ? "No hay reportes en esta categoría." : "No reports in this category."}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(r => (
          <div key={r.id} style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  {r.situationType} · #{r.situationId}
                </div>
                <div style={{ color: "#c9a84c", fontSize: 12, marginTop: 2 }}>
                  {reasonLabel(r.reason)}
                </div>
              </div>
              <span style={{
                background: `${statusColors[r.status || "open"]}22`,
                color: statusColors[r.status || "open"],
                border: `1px solid ${statusColors[r.status || "open"]}55`,
                borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              }}>
                {r.status || "open"}
              </span>
            </div>

            {(r.hand || r.board) && (
              <div style={{ color: "#8b8fa8", fontSize: 12, marginTop: 8 }}>
                {r.hand && <span>{lang === "es" ? "Mano" : "Hand"}: <b style={{ color: "#cfd2e5" }}>{r.hand}</b></span>}
                {r.hand && r.board && <span> · </span>}
                {r.board && <span>{lang === "es" ? "Mesa" : "Board"}: <b style={{ color: "#cfd2e5" }}>{r.board}</b></span>}
              </div>
            )}

            {r.comment && (
              <div style={{ color: "#cfd2e5", fontSize: 13, marginTop: 8, background: "#0b0d18", borderRadius: 8, padding: 10 }}>
                {r.comment}
              </div>
            )}

            <div style={{ color: "#5a5f78", fontSize: 11, marginTop: 8 }}>
              {r.reporterEmail || (lang === "es" ? "Anónimo" : "Anonymous")}
              {r.lang ? ` · ${r.lang.toUpperCase()}` : ""}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {(r.status || "open") !== "resolved" && (
                <button
                  onClick={() => setStatus(r.id, "resolved")}
                  style={{ background: "#4caf6e22", border: "1px solid #4caf6e55", borderRadius: 8, padding: "5px 12px", color: "#4caf6e", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  {lang === "es" ? "Marcar resuelto" : "Mark resolved"}
                </button>
              )}
              {(r.status || "open") !== "dismissed" && (
                <button
                  onClick={() => setStatus(r.id, "dismissed")}
                  style={{ background: "#8b8fa822", border: "1px solid #8b8fa855", borderRadius: 8, padding: "5px 12px", color: "#8b8fa8", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  {lang === "es" ? "Descartar" : "Dismiss"}
                </button>
              )}
              {(r.status || "open") !== "open" && (
                <button
                  onClick={() => setStatus(r.id, "open")}
                  style={{ background: "#e0a83a22", border: "1px solid #e0a83a55", borderRadius: 8, padding: "5px 12px", color: "#e0a83a", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  {lang === "es" ? "Reabrir" : "Reopen"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMUNIDAD: MODERACIÓN DE PROPUESTAS ───────────────────────────────────────

function EditProposalCard({ proposal, lang, user, p }) {
  const [votes, setVotes] = useState({});
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "editProposals", proposal.id, "votes"), (snap) => {
      const v = {};
      snap.docs.forEach(d => { v[d.id] = d.data().value; });
      setVotes(v);
    });
    return () => unsub();
  }, [proposal.id]);

  const votesUp = Object.values(votes).filter(v => v === 1).length;
  const votesDown = Object.values(votes).filter(v => v === -1).length;
  const net = votesUp - votesDown;
  const myVote = user ? votes[user.uid] : undefined;

  // Resolución automática al alcanzar el umbral de votos netos (±5)
  useEffect(() => {
    if (proposal.status !== "pending") return;
    if (net >= 5) {
      updateDoc(doc(db, "editProposals", proposal.id), { status: "approved", votesUp, votesDown }).catch(() => {});
      const key = `${proposal.situationType}_${proposal.situationId}`;
      setDoc(doc(db, "situationOverrides", key), {
        type: proposal.situationType,
        id: proposal.situationId,
        open: proposal.proposedOpen ?? null,
        size: proposal.proposedSize ?? null,
        es: proposal.proposedEs || null,
        en: proposal.proposedEn || null,
        fromProposalId: proposal.id,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    } else if (net <= -5) {
      updateDoc(doc(db, "editProposals", proposal.id), { status: "rejected", votesUp, votesDown }).catch(() => {});
    }
  }, [net, proposal.status]);

  const vote = async (value) => {
    if (!user || voting) return;
    setVoting(true);
    try {
      await setDoc(doc(db, "editProposals", proposal.id, "votes", user.uid), { value, votedAt: serverTimestamp() });
    } catch (_) {}
    setVoting(false);
  };

  const statusColors = { pending: "#e0a83a", approved: "#4caf6e", rejected: "#ef4444" };
  const statusLabels = {
    pending: p.communityPending,
    approved: p.communityApproved,
    rejected: p.communityRejected,
  };

  return (
    <div style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {proposal.situationType} · #{proposal.situationId}
          </div>
          {(proposal.hand || proposal.board) && (
            <div style={{ color: "#8b8fa8", fontSize: 12, marginTop: 2 }}>
              {proposal.hand}{proposal.hand && proposal.board ? " · " : ""}{proposal.board}
            </div>
          )}
        </div>
        <span style={{
          background: `${statusColors[proposal.status] || statusColors.pending}22`,
          color: statusColors[proposal.status] || statusColors.pending,
          border: `1px solid ${(statusColors[proposal.status] || statusColors.pending)}55`,
          borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        }}>
          {statusLabels[proposal.status] || statusLabels.pending}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <div style={{ background: "#0b0d18", borderRadius: 8, padding: 10 }}>
          <div style={{ color: "#5a5f78", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.communityCurrent}</div>
          <div style={{ color: "#c8cce0", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{proposal.currentLabel}</div>
          <div style={{ color: "#8b8fa8", fontSize: 12, lineHeight: 1.5 }}>
            {lang === "es" ? proposal.currentEs : proposal.currentEn}
          </div>
        </div>
        <div style={{ background: "#0b0d1822", border: "1px solid #c9a84c33", borderRadius: 8, padding: 10 }}>
          <div style={{ color: "#c9a84c", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.communityProposed}</div>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{proposal.proposedLabel}</div>
          <div style={{ color: "#cfd2e5", fontSize: 12, lineHeight: 1.5 }}>
            {lang === "es" ? proposal.proposedEs : proposal.proposedEn}
          </div>
        </div>
      </div>

      {proposal.comment && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "#5a5f78", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.communityComment}</div>
          <div style={{ color: "#cfd2e5", fontSize: 13 }}>{proposal.comment}</div>
        </div>
      )}

      <div style={{ color: "#5a5f78", fontSize: 11, marginTop: 10 }}>
        {p.communityBy} {proposal.proposerEmail || "—"}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => vote(1)}
          disabled={!user || voting}
          style={{
            background: myVote === 1 ? "#4caf6e22" : "transparent",
            border: `1px solid ${myVote === 1 ? "#4caf6e" : "#1e2235"}`,
            borderRadius: 8, padding: "6px 12px", color: "#4caf6e", cursor: user ? "pointer" : "default", fontSize: 12, fontWeight: 600,
          }}
        >
          👍 {p.communityVoteUp} ({votesUp})
        </button>
        <button
          onClick={() => vote(-1)}
          disabled={!user || voting}
          style={{
            background: myVote === -1 ? "#ef444422" : "transparent",
            border: `1px solid ${myVote === -1 ? "#ef4444" : "#1e2235"}`,
            borderRadius: 8, padding: "6px 12px", color: "#ef4444", cursor: user ? "pointer" : "default", fontSize: 12, fontWeight: 600,
          }}
        >
          👎 {p.communityVoteDown} ({votesDown})
        </button>
        <span style={{ color: "#8b8fa8", fontSize: 12 }}>{p.communityNetVotes}: {net} / 5</span>
      </div>
    </div>
  );
}

function CommunitySituationCard({ situation, lang, user, p }) {
  const [votes, setVotes] = useState({});
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "communitySituations", situation.id, "votes"), (snap) => {
      const v = {};
      snap.docs.forEach(d => { v[d.id] = d.data().value; });
      setVotes(v);
    });
    return () => unsub();
  }, [situation.id]);

  const votesUp = Object.values(votes).filter(v => v === 1).length;
  const votesDown = Object.values(votes).filter(v => v === -1).length;
  const net = votesUp - votesDown;
  const myVote = user ? votes[user.uid] : undefined;

  // Resolución automática al alcanzar el umbral de votos netos (±5)
  useEffect(() => {
    if (situation.status !== "pending") return;
    if (net >= 5) {
      updateDoc(doc(db, "communitySituations", situation.id), { status: "approved", votesUp, votesDown }).catch(() => {});
    } else if (net <= -5) {
      updateDoc(doc(db, "communitySituations", situation.id), { status: "rejected", votesUp, votesDown }).catch(() => {});
    }
  }, [net, situation.status]);

  const vote = async (value) => {
    if (!user || voting) return;
    setVoting(true);
    try {
      await setDoc(doc(db, "communitySituations", situation.id, "votes", user.uid), { value, votedAt: serverTimestamp() });
    } catch (_) {}
    setVoting(false);
  };

  const statusColors = { pending: "#e0a83a", approved: "#4caf6e", rejected: "#ef4444" };
  const statusLabels = {
    pending: p.communityPending,
    approved: p.communityApproved,
    rejected: p.communityRejected,
  };

  const cat = CATEGORY_DEFS.find(c => c.key === situation.type);
  const desc = (lang === "es" ? situation.descEs : situation.descEn) || situation.descEs || situation.descEn || situation.ctxText;
  const opts = (lang === "es" ? situation.optionsEs : situation.optionsEn) || situation.optionsEs || situation.optionsEn || situation.options;
  const correctExplain = (lang === "es" ? situation.correctExplainEs : situation.correctExplainEn) || situation.correctExplainEs || situation.correctExplainEn || situation.correctExplain;
  const hasBothLangs = !!(situation.optionsEs && situation.optionsEn);

  return (
    <div style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {cat ? `${cat.icon} ${lang === "es" ? cat.es : cat.en}` : situation.type}
          </div>
          <div style={{ color: "#8b8fa8", fontSize: 12, marginTop: 2 }}>
            {situation.pos && <span style={{ fontWeight: 700, color: "#c9a84c" }}>{situation.pos}</span>}
            {situation.hand && <span> · {situation.hand}</span>}
            {situation.board && <span> · {situation.board}</span>}
            {situation.callPos && <span> · vs {situation.callPos}</span>}
          </div>
        </div>
        <span style={{
          background: `${statusColors[situation.status] || statusColors.pending}22`,
          color: statusColors[situation.status] || statusColors.pending,
          border: `1px solid ${(statusColors[situation.status] || statusColors.pending)}55`,
          borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        }}>
          {statusLabels[situation.status] || statusLabels.pending}
        </span>
      </div>

      {desc && (
        <div style={{ background: "#0b0d18", borderRadius: 8, padding: 10, marginTop: 10, color: "#cfd2e5", fontSize: 12, lineHeight: 1.5 }}>
          {desc}
        </div>
      )}

      {Array.isArray(opts) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {opts.map((opt, i) => (
            <div key={i} style={{
              padding: "6px 10px", borderRadius: 8, fontSize: 12,
              border: `1px solid ${i === situation.correctIndex ? "#4caf6e55" : "#1e2235"}`,
              background: i === situation.correctIndex ? "#4caf6e11" : "transparent",
              color: i === situation.correctIndex ? "#6ee7b7" : "#c8cce0",
            }}>
              {i === situation.correctIndex ? "✓ " : ""}{opt}
            </div>
          ))}
        </div>
      )}

      {correctExplain && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "#5a5f78", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.proposeCorrectExplLabel}</div>
          <div style={{ color: "#cfd2e5", fontSize: 13 }}>{correctExplain}</div>
        </div>
      )}

      {hasBothLangs && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#5a5f78" }}>🌐 ES / EN</div>
      )}

      {situation.comment && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "#5a5f78", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.communityComment}</div>
          <div style={{ color: "#cfd2e5", fontSize: 13 }}>{situation.comment}</div>
        </div>
      )}

      {situation.status === "approved" && (
        <div style={{ marginTop: 10, color: "#4caf6e", fontSize: 12, fontWeight: 600 }}>
          ✓ {p.newHandsAddedToPool}
        </div>
      )}

      <div style={{ color: "#5a5f78", fontSize: 11, marginTop: 10 }}>
        {p.communityProposedBy} {situation.authorEmail || "—"}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => vote(1)}
          disabled={!user || voting}
          style={{
            background: myVote === 1 ? "#4caf6e22" : "transparent",
            border: `1px solid ${myVote === 1 ? "#4caf6e" : "#1e2235"}`,
            borderRadius: 8, padding: "6px 12px", color: "#4caf6e", cursor: user ? "pointer" : "default", fontSize: 12, fontWeight: 600,
          }}
        >
          👍 {p.communityVoteUp} ({votesUp})
        </button>
        <button
          onClick={() => vote(-1)}
          disabled={!user || voting}
          style={{
            background: myVote === -1 ? "#ef444422" : "transparent",
            border: `1px solid ${myVote === -1 ? "#ef4444" : "#1e2235"}`,
            borderRadius: 8, padding: "6px 12px", color: "#ef4444", cursor: user ? "pointer" : "default", fontSize: 12, fontWeight: 600,
          }}
        >
          👎 {p.communityVoteDown} ({votesDown})
        </button>
        <span style={{ color: "#8b8fa8", fontSize: 12 }}>{p.communityNetVotes}: {net} / 5</span>
      </div>
    </div>
  );
}

function CommunityPage({ t, lang, user }) {
  const p = t.practice;
  const [proposals, setProposals] = useState([]);
  const [situations, setSituations] = useState([]);
  const [tab, setTab] = useState("edits"); // edits | newHands
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "editProposals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    const q2 = query(collection(db, "communitySituations"), orderBy("createdAt", "desc"));
    const unsub2 = onSnapshot(q2, (snap) => {
      setSituations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => { unsub(); unsub2(); };
  }, []);

  const items = tab === "edits" ? proposals : situations;
  const filtered = filter === "all" ? items
    : filter === "pending" ? items.filter(x => (x.status || "pending") === "pending")
    : items.filter(x => (x.status || "pending") !== "pending");

  const filters = [
    { id: "pending", label: p.communityFilterPending },
    { id: "resolved", label: p.communityFilterResolved },
    { id: "all", label: p.communityFilterAll },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ color: "#fff", fontSize: 22, marginBottom: 4 }}>{p.communityTitle}</h2>
      <p style={{ color: "#8b8fa8", fontSize: 13, marginBottom: 16 }}>{p.communityDesc}</p>

      {!user && (
        <div style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 10, padding: 12, color: "#8b8fa8", fontSize: 13, marginBottom: 16 }}>
          {p.communityLoginRequired}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => setTab("edits")}
          style={{
            background: tab === "edits" ? "#c9a84c22" : "#111320",
            border: `1px solid ${tab === "edits" ? "#c9a84c" : "#1e2235"}`,
            borderRadius: 8, padding: "6px 14px", color: tab === "edits" ? "#c9a84c" : "#8b8fa8",
            cursor: "pointer", fontSize: 13, fontWeight: 700,
          }}
        >
          {p.communityTabEdits}
        </button>
        <button
          onClick={() => setTab("newHands")}
          style={{
            background: tab === "newHands" ? "#c9a84c22" : "#111320",
            border: `1px solid ${tab === "newHands" ? "#c9a84c" : "#1e2235"}`,
            borderRadius: 8, padding: "6px 14px", color: tab === "newHands" ? "#c9a84c" : "#8b8fa8",
            cursor: "pointer", fontSize: 13, fontWeight: 700,
          }}
        >
          {p.communityTabNewHands}
        </button>
      </div>

      {tab === "newHands" && (
        <p style={{ color: "#8b8fa8", fontSize: 13, marginBottom: 12 }}>{p.newHandsDesc}</p>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background: filter === f.id ? "#c9a84c22" : "#111320",
              border: `1px solid ${filter === f.id ? "#c9a84c" : "#1e2235"}`,
              borderRadius: 8, padding: "6px 14px", color: filter === f.id ? "#c9a84c" : "#8b8fa8",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: "#8b8fa8", fontSize: 13 }}>{lang === "es" ? "Cargando..." : "Loading..."}</p>
      )}
      {!loading && filtered.length === 0 && (
        <p style={{ color: "#8b8fa8", fontSize: 13 }}>{tab === "edits" ? p.communityEmpty : p.newHandsEmpty}</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tab === "edits"
          ? filtered.map(pr => (
              <EditProposalCard key={pr.id} proposal={pr} lang={lang} user={user} p={p} />
            ))
          : filtered.map(s => (
              <CommunitySituationCard key={s.id} situation={s} lang={lang} user={user} p={p} />
            ))
        }
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState("es");
  const [page, setPage] = useState("home");
  const [completed, setCompleted] = useState(new Set());
  const [user, setUser] = useState(undefined);
  const [xpData, setXpData] = useState({ xp:0, level:1, streak:0, longestStreak:0, lastStudiedDate:null, totalCorrect:0, totalSessions:0, totalAnswered:0, categoryStats:{} });
  const [overrides, setOverrides] = useState({});
  const [proposeOpen, setProposeOpen] = useState(false);

  const t = content[lang];

  // Listen to community-approved overrides for situations
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "situationOverrides"), (snap) => {
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        map[`${data.type}_${data.id}`] = data;
      });
      setOverrides(map);
    }, () => {});
    return () => unsub();
  }, []);

  // Listen to community-approved new hands
  const [communityHands, setCommunityHands] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "communitySituations"), where("status", "==", "approved"));
    const unsub = onSnapshot(q, (snap) => {
      setCommunityHands(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load saved progress from Firestore
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            const completedArr = data.completedLessons || [];
            setCompleted(new Set(completedArr));
            // Retroactive XP: if xp=0 but lessons already done, grant XP retroactively
            let xp = data.xp || 0;
            if (xp === 0 && completedArr.length > 0) {
              xp = completedArr.length * 75;
              const lvRetro = getLevelInfo(xp);
              try { await setDoc(doc(db,"users",firebaseUser.uid),{xp,level:lvRetro.level},{merge:true}); } catch(_){}
            }
            const lvInfo = getLevelInfo(xp);
            setXpData({
              xp,
              level:          lvInfo.level,
              streak:         data.streak          || 0,
              longestStreak:  data.longestStreak   || 0,
              lastStudiedDate:data.lastStudiedDate  || null,
              totalCorrect:   data.totalCorrect    || 0,
              totalSessions:  data.totalSessions   || 0,
              totalAnswered:  data.totalAnswered    || 0,
              categoryStats:  data.categoryStats    || {},
            });
          }
        } catch (_) {}
        setUser(firebaseUser);
      } else {
        setUser(null);
        setCompleted(new Set());
      }
    });
    return unsub;
  }, []);

  const handleComplete = async (lessonId) => {
    const isFirst = !completed.has(lessonId);
    const next = new Set([...completed, lessonId]);
    setCompleted(next);
    const newXp  = xpData.xp + (isFirst ? 75 : 0);
    const lvInfo = getLevelInfo(newXp);
    if (isFirst) setXpData(prev => ({ ...prev, xp: newXp, level: lvInfo.level }));
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          completedLessons: Array.from(next),
          ...(isFirst ? { xp: newXp, level: lvInfo.level } : {}),
        }, { merge: true });
      } catch (_) {}
    }
  };

  const handleSessionComplete = async (score, byType) => {
    const sessionSize = Object.values(byType).reduce((sum, v) => sum + (v?.total || 0), 0) || 12;
    const earned     = calcXP(score, sessionSize);
    const { streak: newStreak, newDay } = calcStreak(xpData.lastStudiedDate, xpData.streak);
    const newXp      = xpData.xp + earned;
    const lvInfo     = getLevelInfo(newXp);
    const newLongest = Math.max(xpData.longestStreak, newStreak);
    const updated = {
      xp:             newXp,
      level:          lvInfo.level,
      streak:         newDay ? newStreak : xpData.streak,
      longestStreak:  newLongest,
      lastStudiedDate: newDay ? todayStr() : xpData.lastStudiedDate,
      totalCorrect:   xpData.totalCorrect + score,
      totalSessions:  xpData.totalSessions + 1,
      totalAnswered:  (xpData.totalAnswered || 0) + sessionSize,
      categoryStats:  (() => {
        const merged = { ...(xpData.categoryStats || {}) };
        Object.entries(byType).forEach(([typ, vals]) => {
          const prev = merged[typ] || { correct:0, total:0 };
          merged[typ] = { correct: prev.correct + vals.correct, total: prev.total + vals.total };
        });
        return merged;
      })(),
    };
    setXpData(updated);
    if (user) {
      try { await setDoc(doc(db, "users", user.uid), updated, { merge: true }); } catch(_) {}
    }
    return earned;
  };

  const handleLogout = () => {
    signOut(auth);
    setPage("home");
    setXpData({ xp:0, level:1, streak:0, longestStreak:0, lastStudiedDate:null, totalCorrect:0, totalSessions:0, totalAnswered:0, categoryStats:{} });
  };

  // Loading state while Firebase checks auth
  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", background: "#08090f", backgroundImage: "radial-gradient(ellipse at 20% 50%, #0d1a0a 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #1a120a 0%, transparent 50%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 32 }}>🃏</div>
      </div>
    );
  }

  // Not logged in → show login screen
  if (user === null) {
    return <LoginScreen lang={lang} />;
  }

  // Logged in → show app
  return (
    <div style={{ minHeight: "100vh", background: "#08090f", backgroundImage: "radial-gradient(ellipse at 20% 50%, #0d1a0a 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #1a120a 0%, transparent 50%)", color: "#e8e8e8", fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: "linear-gradient(180deg, #0d0f1a 0%, #0a0c15 100%)", borderBottom: "1px solid #c9a84c44", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          {page !== "home" && <span style={{ color: "#c9a84c", fontSize: 16, fontWeight: 700 }}>←</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, lineHeight: 1, color: "#c9a84c" }}>♠</span>
            <span style={{ fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 50%, #a07830 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 0.5 }}>
              {t.nav.title}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {xpData.streak > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:4, background:"#1e1208", border:"1px solid #f9730055", borderRadius:8, padding:"4px 10px" }}>
              <span style={{ fontSize:14 }}>🔥</span>
              <span style={{ fontSize:13, fontWeight:700, color:"#f97316" }}>{xpData.streak}</span>
            </div>
          )}
          {(() => { const lv = getLevelInfo(xpData.xp); return (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }} title={`${xpData.xp} XP`}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontSize:11, color:"#c9a84c", fontWeight:700 }}>Nv.{lv.level}</span>
                <span style={{ fontSize:10, color:"#8b8fa8" }}>{lang==="es"?lv.name:lv.nameEn}</span>
              </div>
              <div style={{ width:72, height:3, background:"#1e2235", borderRadius:4 }}>
                <div style={{ width:`${lv.pct}%`, height:"100%", background:"linear-gradient(90deg,#c9a84c,#e8c96a)", borderRadius:4 }}/>
              </div>
            </div>
          ); })()}
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            style={{ background: "#111320", border: "1px solid #c9a84c55", borderRadius: 8, padding: "5px 12px", color: "#c9a84c", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}
          >
            {lang === "en" ? "🇪🇸 ES" : "🇬🇧 EN"}
          </button>
          {user && (
            <button
              onClick={() => setPage("community")}
              title={lang === "es" ? "Comunidad" : "Community"}
              style={{ background: page === "community" ? "#c9a84c22" : "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "5px 11px", color: "#c9a84c", cursor: "pointer", fontSize: 13 }}
            >
              👥
            </button>
          )}
          {ADMIN_EMAILS.includes(user?.email) && (
            <button
              onClick={() => setPage("admin")}
              title={lang === "es" ? "Reportes" : "Reports"}
              style={{ background: page === "admin" ? "#c9a84c22" : "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "5px 11px", color: "#c9a84c", cursor: "pointer", fontSize: 13 }}
            >
              🛠️
            </button>
          )}
          <button
            onClick={handleLogout}
            title={lang === "es" ? "Cerrar sesión" : "Sign out"}
            style={{ background: "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "5px 11px", color: "#8b8fa8", cursor: "pointer", fontSize: 13 }}
          >
            ⎋
          </button>
        </div>
      </div>

      {page === "home" && <HomePage t={t} onNavigate={setPage} onPropose={() => setProposeOpen(true)} />}
      {page === "stats" && <StatsPage t={t} lang={lang} xpData={xpData} completed={completed} totalLessons={t.lessons.length} />}
      {page === "academia" && <AcademiaPage t={t} completed={completed} onComplete={handleComplete} lang={lang} />}
      {page === "practice" && <PracticePage t={t} lang={lang} onSessionComplete={handleSessionComplete} user={user} overrides={overrides} communityHands={communityHands} />}
      {page === "community" && user && <CommunityPage t={t} lang={lang} user={user} />}
      {page === "admin" && ADMIN_EMAILS.includes(user?.email) && <AdminReportsPage lang={lang} />}

      {proposeOpen && (
        <ProposeSituationModal lang={lang} user={user} p={t.practice} onClose={() => setProposeOpen(false)} />
      )}
    </div>
  );
}
// TEST_MARKER_12345
