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
} from "firebase/firestore";

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

// ─── CONTENT ─────────────────────────────────────────────────────────────────

const content = {
  es: {
    nav: { title: "Poker Cash Academy", back: "Inicio" },
    home: { welcome: "Poker Cash Academy", subtitle: "Domina el cash game. Un concepto a la vez." },
    menu: { academia: "Academy", academiaSubtitle: "Lecciones estructuradas paso a paso" },
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
              {
                type: "rangeBlock",
                label: "Rango de apertura UTG (~14%)",
                hands: [
                  { group: "Pares", cards: "AA, KK, QQ, JJ, TT, 99, 88, 77" },
                  { group: "Ases suited", cards: "AKs, AQs, AJs, ATs, A9s" },
                  { group: "Ases offsuit", cards: "AKo, AQo" },
                  { group: "Broadways suited", cards: "KQs, KJs, QJs, JTs" },
                  { group: "Broadways offsuit", cards: "KQo" },
                ],
              },
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
              {
                type: "rangeBlock",
                label: "Rango de apertura MP (~20%)",
                hands: [
                  { group: "Pares", cards: "AA-66" },
                  { group: "Ases suited", cards: "AKs, AQs, AJs, ATs, A9s, A8s" },
                  { group: "Ases offsuit", cards: "AKo, AQo, AJo" },
                  { group: "Broadways suited", cards: "KQs, KJs, KTs, QJs, QTs, JTs" },
                  { group: "Broadways offsuit", cards: "KQo, KJo" },
                  { group: "Suited connectors", cards: "T9s" },
                ],
              },
              {
                type: "text",
                content:
                  "La diferencia principal respecto a UTG es que añadimos 66 y 77 (ya teníamos 77 en UTG en algunas variantes, pero aquí lo consolidamos), y ampliamos los broadway suited como KTs, QTs y JTs. También empezamos a abrir AJo, que desde UTG solíamos evitar por su dificultad de navegación multiway.",
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
                type: "rangeBlock",
                label: "Rango de apertura CO (~27%)",
                hands: [
                  { group: "Pares", cards: "AA-55" },
                  { group: "Ases suited", cards: "AKs-A5s" },
                  { group: "Ases offsuit", cards: "AKo, AQo, AJo, ATo" },
                  { group: "Broadways suited", cards: "KQs, KJs, KTs, K9s, QJs, QTs, Q9s, JTs, J9s, T9s" },
                  { group: "Broadways offsuit", cards: "KQo, KJo, QJo" },
                  { group: "Suited connectors", cards: "98s, 87s, 76s" },
                ],
              },
              {
                type: "text",
                content:
                  "Desde CO empezamos a abrir suited connectors medios como 98s, 87s y 76s. Estas manos tienen excelente jugabilidad en botes en posición y con blinds por detrás que pueden pagar calles. También ampliamos los ases suited hasta A5s — los bajos (A5s-A2s) tienen valor adicional como manos de 3-bet bluff con blockers.",
              },
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
              {
                type: "rangeBlock",
                label: "Rango de apertura BTN (~42%)",
                hands: [
                  { group: "Pares", cards: "AA-22" },
                  { group: "Ases suited", cards: "AKs-A2s" },
                  { group: "Ases offsuit", cards: "AKo-A8o" },
                  { group: "Kings suited", cards: "KQs-K6s" },
                  { group: "Kings offsuit", cards: "KQo, KJo, KTo" },
                  { group: "Broadways suited", cards: "QJs-Q8s, JTs-J8s, T9s-T7s" },
                  { group: "Broadways offsuit", cards: "QJo, QTo, JTo" },
                  { group: "Suited connectors/gappers", cards: "98s-96s, 87s-85s, 76s-74s, 65s, 64s, 54s, 53s" },
                ],
              },
              {
                type: "text",
                content:
                  "Desde BTN abrimos todos los pares (incluyendo 22), todos los ases suited (A2s-AKs) y prácticamente todo el espectro de broadways. Los suited connectors y gappers con cierta conectividad también entran. Manos como 74s o 64s parecen débiles, pero en posición con implied odds y solo los blinds detrás, son aperturas rentables.",
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
                  "Sin embargo, cuando los jugadores anteriores han foldeado y solo tienes al BB detrás, la situación es diferente: estás jugando heads-up, y el BB tampoco tiene posición preflop (ya puso la ciega entera). Esto te permite abrir relativamente amplio, pero debes hacerlo con un tamaño mayor para compensar la desventaja posicional postflop.",
              },
              {
                type: "rangeBlock",
                label: "Rango de apertura SB vs BB (~35%)",
                hands: [
                  { group: "Pares", cards: "AA-22" },
                  { group: "Ases suited", cards: "AKs-A2s" },
                  { group: "Ases offsuit", cards: "AKo-A7o" },
                  { group: "Kings suited", cards: "KQs-K7s" },
                  { group: "Kings offsuit", cards: "KQo, KJo, KTo, K9o" },
                  { group: "Broadways suited", cards: "QJs-Q8s, JTs-J8s, T9s-T8s" },
                  { group: "Broadways offsuit", cards: "QJo, QTo, JTo" },
                  { group: "Suited connectors/gappers", cards: "98s-96s, 87s-85s, 76s-74s, 65s-63s, 54s, 53s" },
                ],
              },
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
            title: "BB — Big Blind",
            body: [
              {
                type: "positionHeader",
                name: "BB",
                range: "Defensa amplia",
                size: "No aplica",
                color: "#06b6d4",
              },
              {
                type: "text",
                content:
                  "El Big Blind es una posición única: ya has puesto 1 BB de forma obligatoria, lo que te da un descuento en cualquier call. Si hay un open de 3x y tú estás en BB, solo te cuesta 2 BB adicionales para ver el flop con pot odds de 3:2. Esto significa que debes defender mucho más amplio de lo que parecería intuitivo.",
              },
              {
                type: "text",
                content:
                  "El BB no 'abre' el bote en el sentido tradicional — en lugar de eso, defiende (call o 3-bet) frente a las aperturas de los demás. Si todos foldean y solo queda el SB, el BB puede levantar (squeeze) con un rango amplio, pero esa es una situación especial.",
              },
              {
                type: "callout",
                label: "Minimum Defense Frequency (MDF)",
                content:
                  "La MDF es la frecuencia mínima con la que debes defender para que el rival no pueda abrir con cualquier mano y ganar. Con un open de 3x (el rival arrisga 2 BB para ganar 1.5 BB de blinds), la MDF aproximada es del 50%. Defender menos del 50% regala EV al abridor.",
              },
              {
                type: "rangeBlock",
                label: "Defensa BB vs open de BTN (3x) — ~50%",
                hands: [
                  { group: "3-bet para valor", cards: "AA, KK, QQ, JJ, AKs, AKo" },
                  { group: "3-bet bluff / mixto", cards: "A5s-A2s, K4s-K2s, Q4s, J4s, T4s" },
                  { group: "Call (valor)", cards: "TT-22, AQs-A6s, KQs-K7s, QJs-Q8s, JTs-J8s, T9s-T7s, 98s-96s, 87s-85s, 76s-74s, 65s-63s" },
                  { group: "Call (broadway offsuit)", cards: "AQo, AJo, ATo, A9o, KQo, KJo, KTo, QJo, QTo, JTo" },
                ],
              },
              {
                type: "text",
                content:
                  "La defensa del BB es el spot más estudiado del poker moderno. Debes balancear entre calls y 3-bets, incluir algunos 3-bet bluffs (con manos tipo A3s que tienen blocker a los ases del rival y no juegan bien como call), y nunca defender tan estrecho que el rival pueda abrir con cualquier dos cartas de forma rentable.",
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
                      { label: "Foldear — K5s es demasiado débil", correct: false, explanation: "K5s entra perfectamente en el rango del BTN (~42%). No es una mano premium, pero tiene flush draw potencial y contra nits que foldean mucho, robar los blinds es directamente rentable." },
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
            title: "Rangos de ISO — BTN vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_BTN", range: "~50%", size: "4x BB", color: "#10b981" },
              { type: "text", content: "Desde el BTN con un solo limper delante, tu rango de ISO es enorme: aproximadamente el 50% de las manos. La combinación de posición perfecta (actúas último en todas las calles), el rango débil del limper y el hecho de que solo hay dos jugadores detrás (SB y BB, que suelen foldear) lo justifica." },
              { type: "rangeBlock", label: "ISO BTN vs 1 limper (~50%)", hands: [
                { group: "Pares", cards: "AA-22 (todos)" },
                { group: "Ases suited", cards: "AKs-A2s (todos)" },
                { group: "Ases offsuit", cards: "AKo-A6o" },
                { group: "Kings suited", cards: "KQs-K5s" },
                { group: "Kings offsuit", cards: "KQo, KJo, KTo, K9o" },
                { group: "Queens suited", cards: "QJs-Q7s" },
                { group: "Queens offsuit", cards: "QJo, QTo" },
                { group: "Jacks suited", cards: "JTs-J7s" },
                { group: "Jacks offsuit", cards: "JTo" },
                { group: "Suited connectors/gappers", cards: "T9s-T6s, 98s-95s, 87s-84s, 76s-73s, 65s-63s, 54s, 53s" },
              ]},
              { type: "callout", label: "¿Por qué tan amplio?", content: "Porque incluso manos mediocres tienen +EV en esta situación: el limper tiene un rango capped y débil, tú tienes posición, y la iniciativa hace que seas tú quien dicta el ritmo de la mano postflop. Manos como Q7s o 73s que no abrirías normalmente se vuelven ISOs rentables desde BTN." },
            ],
          },
          {
            title: "Rangos de ISO — CO vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_CO", range: "~32%", size: "4x BB", color: "#eab308" },
              { type: "text", content: "Desde CO con un limper delante, el rango es más ajustado que desde BTN porque tienes al BTN y los blinds por detrás — cualquiera puede cold-callear o 3-betear. Aun así, el ISO desde CO sigue siendo más amplio que el open estándar de CO." },
              { type: "rangeBlock", label: "ISO CO vs 1 limper (~32%)", hands: [
                { group: "Pares", cards: "AA-44" },
                { group: "Ases suited", cards: "AKs-A4s" },
                { group: "Ases offsuit", cards: "AKo-A9o" },
                { group: "Kings suited", cards: "KQs-K8s" },
                { group: "Kings offsuit", cards: "KQo, KJo, KTo" },
                { group: "Broadway suited", cards: "QJs-Q8s, JTs-J8s, T9s-T7s" },
                { group: "Broadway offsuit", cards: "QJo, JTo" },
                { group: "Suited connectors", cards: "98s-96s, 87s-85s, 76s-74s, 65s, 64s" },
              ]},
              { type: "callout", label: "Ajuste con BTN agresivo", content: "Si el BTN es un jugador que 3-betea mucho, ajusta el rango de ISO desde CO hacia arriba: elimina las manos más débiles (A4s, K8s, 64s) que no aguantan bien un 3-bet y conserva las que tienen respuesta clara (AA-77, AJs+, KQs)." },
            ],
          },
          {
            title: "Rangos de ISO — MP vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_MP", range: "~24%", size: "4x BB", color: "#f97316" },
              { type: "text", content: "Desde MP el ISO es considerablemente más ajustado. Tienes a CO, BTN y los blinds por detrás — cuatro jugadores que pueden entrar al bote o hacerte 3-bet. Solo deberías ISO desde MP con manos que aguanten presión y que tengan clara ventaja sobre el rango del limper." },
              { type: "rangeBlock", label: "ISO MP vs 1 limper (~24%)", hands: [
                { group: "Pares", cards: "AA-55" },
                { group: "Ases suited", cards: "AKs-A7s" },
                { group: "Ases offsuit", cards: "AKo-AJo" },
                { group: "Kings suited", cards: "KQs-K9s" },
                { group: "Kings offsuit", cards: "KQo, KJo" },
                { group: "Broadway suited", cards: "QJs-Q9s, JTs-J9s, T9s-T8s" },
                { group: "Broadway offsuit", cards: "QJo" },
                { group: "Suited connectors", cards: "98s, 97s, 87s" },
              ]},
              { type: "callout", label: "La regla práctica desde MP", content: "Si dudarías en abrir la mano desde MP en un spot normal, probablemente tampoco deberías hacer ISO. El hecho de que haya un limper no cambia dramáticamente el rango desde MP — sí amplía ligeramente, pero la presión de los jugadores por detrás sigue siendo la misma." },
            ],
          },
          {
            title: "ISO vs 2+ limpers",
            body: [
              { type: "text", content: "Con dos o más limpers, el bote crece pero también crecen los problemas: más jugadores = más probabilidades de que alguien tenga una mano fuerte o floppe algo. El ISO con múltiples limpers requiere manos con más potencial de equidad en botes multiway." },
              { type: "callout", label: "Tamaño con 2 limpers", content: "2 limpers → ISO a 5BB mínimo. 3 limpers → ISO a 6BB. El objetivo es el mismo: hacer que el bote sea caro para jugadores que entrarían barato." },
              { type: "rangeBlock", label: "ISO BTN vs 2 limpers (~40%)", hands: [
                { group: "Pares", cards: "AA-22 (todos)" },
                { group: "Ases suited", cards: "AKs-A3s" },
                { group: "Ases offsuit", cards: "AKo-A8o" },
                { group: "Kings suited", cards: "KQs-K6s" },
                { group: "Kings offsuit", cards: "KQo, KJo, KTo" },
                { group: "Broadway suited", cards: "QJs-Q8s, JTs-J8s, T9s-T7s" },
                { group: "Broadway offsuit", cards: "QJo, QTo" },
                { group: "Suited connectors", cards: "98s-96s, 87s-85s, 76s-74s, 65s, 64s, 54s" },
              ]},
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
              { type:"callout", label:"Ventaja de Rango", content:"Cuando tu rango completo es más fuerte que el del rival en un tablero concreto. Ejemplo: abres desde UTG y el BB paga. El flop es A♠7♦2♣. Tu rango UTG tiene muchas más manos fuertes en este tablero (AA, A7s, A2s, 77, 22, AKs, AQs, etc.) que el BB que pagó. Tienes ventaja de rango clara — C-bet muy amplio." },
              { type:"callout", label:"Ventaja de Nuts", content:"Cuando tienes más manos muy fuertes (nuts) que el rival en ese tablero, aunque no tengas ventaja de rango global. Ejemplo: BTN vs BB en 9♠8♠7♦. Aunque el BB tiene buena equidad aquí, el BTN tiene más combos de sets y straights (abriste rangos amplios preflop). Esa ventaja de nuts justifica usar tamaños grandes con las mejores manos." },
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
        title: "4. Juego Explotativo",
        summary: "Leer al rival y ajustar tu estrategia para maximizar el profit.",
        comingSoon: true,
      },
      {
        id: 5,
        title: "5. Bankroll y Mentalidad",
        summary: "Gestión de bankroll, tilt y hábitos de estudio.",
        comingSoon: true,
      },
    ],
  },
  en: {
    nav: { title: "Poker Cash Academy", back: "Home" },
    home: { welcome: "Poker Cash Academy", subtitle: "Master cash game. One concept at a time." },
    menu: { academia: "Academy", academiaSubtitle: "Structured lessons step by step" },
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
              { type: "positionHeader", name: "UTG", range: "~14%", size: "3x BB", color: "#ef4444" },
              {
                type: "text",
                content:
                  "UTG is the hardest position. You act first out of 6 players and have everyone behind you with the ability to 3-bet or cold call. This means your range must be the tightest at the table: only open hands that can withstand heavy pressure.",
              },
              {
                type: "rangeBlock",
                label: "UTG opening range (~14%)",
                hands: [
                  { group: "Pairs", cards: "AA, KK, QQ, JJ, TT, 99, 88, 77" },
                  { group: "Suited aces", cards: "AKs, AQs, AJs, ATs, A9s" },
                  { group: "Offsuit aces", cards: "AKo, AQo" },
                  { group: "Broadway suited", cards: "KQs, KJs, QJs, JTs" },
                  { group: "Broadway offsuit", cards: "KQo" },
                ],
              },
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
              { type: "positionHeader", name: "MP", range: "~20%", size: "2.5–3x BB", color: "#f97316" },
              {
                type: "text",
                content:
                  "From MP you have a slightly better position than UTG: one player has already acted before you, and if that player folded, only CO, BTN, SB, and BB remain. This lets you expand the range moderately.",
              },
              {
                type: "rangeBlock",
                label: "MP opening range (~20%)",
                hands: [
                  { group: "Pairs", cards: "AA-66" },
                  { group: "Suited aces", cards: "AKs, AQs, AJs, ATs, A9s, A8s" },
                  { group: "Offsuit aces", cards: "AKo, AQo, AJo" },
                  { group: "Broadway suited", cards: "KQs, KJs, KTs, QJs, QTs, JTs" },
                  { group: "Broadway offsuit", cards: "KQo, KJo" },
                  { group: "Suited connectors", cards: "T9s" },
                ],
              },
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
              { type: "positionHeader", name: "CO", range: "~27%", size: "2.5x BB", color: "#eab308" },
              {
                type: "text",
                content:
                  "The Cutoff is one of the most profitable positions at the table. You only have BTN, SB, and BB behind you. BTN can call or 3-bet you, but the blinds will play postflop out of position. This allows you to open a considerably wider range.",
              },
              {
                type: "rangeBlock",
                label: "CO opening range (~27%)",
                hands: [
                  { group: "Pairs", cards: "AA-55" },
                  { group: "Suited aces", cards: "AKs-A5s" },
                  { group: "Offsuit aces", cards: "AKo, AQo, AJo, ATo" },
                  { group: "Broadway suited", cards: "KQs, KJs, KTs, K9s, QJs, QTs, Q9s, JTs, J9s, T9s" },
                  { group: "Broadway offsuit", cards: "KQo, KJo, QJo" },
                  { group: "Suited connectors", cards: "98s, 87s, 76s" },
                ],
              },
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
              { type: "positionHeader", name: "BTN", range: "~42%", size: "2.5x BB", color: "#10b981" },
              {
                type: "text",
                content:
                  "The Button is the most powerful position in poker. You act last on all postflop streets, giving you full control over pot size, the ability to bluff more effectively, and the advantage of seeing all actions before deciding. This justifies opening almost twice as many hands as UTG.",
              },
              {
                type: "rangeBlock",
                label: "BTN opening range (~42%)",
                hands: [
                  { group: "Pairs", cards: "AA-22" },
                  { group: "Suited aces", cards: "AKs-A2s" },
                  { group: "Offsuit aces", cards: "AKo-A8o" },
                  { group: "Kings suited", cards: "KQs-K6s" },
                  { group: "Kings offsuit", cards: "KQo, KJo, KTo" },
                  { group: "Broadway suited", cards: "QJs-Q8s, JTs-J8s, T9s-T7s" },
                  { group: "Broadway offsuit", cards: "QJo, QTo, JTo" },
                  { group: "Suited connectors/gappers", cards: "98s-96s, 87s-85s, 76s-74s, 65s, 64s, 54s, 53s" },
                ],
              },
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
              { type: "positionHeader", name: "SB", range: "~35%", size: "3x BB", color: "#8b5cf6" },
              {
                type: "text",
                content:
                  "The Small Blind is the most complex position in the game. You must post half a blind and, if you open, you will always play postflop out of position against the BB. This makes SB structurally the hardest seat to open and play hands from.",
              },
              {
                type: "rangeBlock",
                label: "SB opening range vs BB (~35%)",
                hands: [
                  { group: "Pairs", cards: "AA-22" },
                  { group: "Suited aces", cards: "AKs-A2s" },
                  { group: "Offsuit aces", cards: "AKo-A7o" },
                  { group: "Kings suited", cards: "KQs-K7s" },
                  { group: "Kings offsuit", cards: "KQo, KJo, KTo, K9o" },
                  { group: "Broadway suited", cards: "QJs-Q8s, JTs-J8s, T9s-T8s" },
                  { group: "Broadway offsuit", cards: "QJo, QTo, JTo" },
                  { group: "Suited connectors/gappers", cards: "98s-96s, 87s-85s, 76s-74s, 65s-63s, 54s, 53s" },
                ],
              },
              {
                type: "callout",
                label: "Size: 3x BB from SB",
                content:
                  "We open to 3x from SB to compensate for the positional disadvantage by reducing callers, and because the BB already has 1 BB in — a 2.5x open gives them too good odds to defend an extremely wide range.",
              },
            ],
          },
          {
            title: "BB — Big Blind",
            body: [
              { type: "positionHeader", name: "BB", range: "Wide defense", size: "N/A", color: "#06b6d4" },
              {
                type: "text",
                content:
                  "The Big Blind is a unique position: you've already posted 1 BB, giving you a discount on any call. If there's a 3x open and you're in the BB, it only costs you 2 additional BB to see the flop at 3:2 pot odds. This means you must defend much wider than would seem intuitive.",
              },
              {
                type: "callout",
                label: "Minimum Defense Frequency (MDF)",
                content:
                  "MDF is the minimum frequency you must defend so the villain can't profitably open with any two cards. With a 3x open (risking 2 BB to win 1.5 BB in blinds), the approximate MDF is 50%. Defending less than 50% gives the opener free EV.",
              },
              {
                type: "rangeBlock",
                label: "BB defense vs BTN open (3x) — ~50%",
                hands: [
                  { group: "3-bet for value", cards: "AA, KK, QQ, JJ, AKs, AKo" },
                  { group: "3-bet bluff / mixed", cards: "A5s-A2s, K4s-K2s, Q4s, J4s, T4s" },
                  { group: "Call (value)", cards: "TT-22, AQs-A6s, KQs-K7s, QJs-Q8s, JTs-J8s, T9s-T7s, 98s-96s, 87s-85s, 76s-74s, 65s-63s" },
                  { group: "Call (broadway offsuit)", cards: "AQo, AJo, ATo, A9o, KQo, KJo, KTo, QJo, QTo, JTo" },
                ],
              },
              {
                type: "text",
                content:
                  "BB defense is the most studied spot in modern poker. You must balance between calls and 3-bets, include some 3-bet bluffs (with hands like A3s that block villain's aces and don't play well as calls), and never defend so tight that the opener can profitably open any two cards.",
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
            title: "ISO ranges — BTN vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_BTN", range: "~50%", size: "4x BB", color: "#10b981" },
              { type: "text", content: "From the BTN with a single limper in front, your ISO range is huge: approximately 50% of hands. The combination of perfect position (you act last on all postflop streets), the limper's weak range, and the fact that only two players are behind (SB and BB, who usually fold) all justify this." },
              { type: "rangeBlock", label: "ISO BTN vs 1 limper (~50%)", hands: [
                { group: "Pairs", cards: "AA-22 (all)" },
                { group: "Suited aces", cards: "AKs-A2s (all)" },
                { group: "Offsuit aces", cards: "AKo-A6o" },
                { group: "Kings suited", cards: "KQs-K5s" },
                { group: "Kings offsuit", cards: "KQo, KJo, KTo, K9o" },
                { group: "Queens suited", cards: "QJs-Q7s" },
                { group: "Queens offsuit", cards: "QJo, QTo" },
                { group: "Jacks suited", cards: "JTs-J7s" },
                { group: "Jacks offsuit", cards: "JTo" },
                { group: "Suited connectors/gappers", cards: "T9s-T6s, 98s-95s, 87s-84s, 76s-73s, 65s-63s, 54s, 53s" },
              ]},
              { type: "callout", label: "Why so wide?", content: "Because even mediocre hands are +EV here: the limper has a capped, weak range, you have position, and initiative means you dictate the pace of the hand postflop. Hands like Q7s or 73s that you wouldn't normally open become profitable ISOs from BTN." },
            ],
          },
          {
            title: "ISO ranges — CO vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_CO", range: "~32%", size: "4x BB", color: "#eab308" },
              { type: "text", content: "From CO with a limper in front, the range is tighter than BTN because you have BTN and the blinds behind — any of whom can cold-call or 3-bet. Even so, the CO ISO range is still wider than the standard CO open." },
              { type: "rangeBlock", label: "ISO CO vs 1 limper (~32%)", hands: [
                { group: "Pairs", cards: "AA-44" },
                { group: "Suited aces", cards: "AKs-A4s" },
                { group: "Offsuit aces", cards: "AKo-A9o" },
                { group: "Kings suited", cards: "KQs-K8s" },
                { group: "Kings offsuit", cards: "KQo, KJo, KTo" },
                { group: "Broadway suited", cards: "QJs-Q8s, JTs-J8s, T9s-T7s" },
                { group: "Broadway offsuit", cards: "QJo, JTo" },
                { group: "Suited connectors", cards: "98s-96s, 87s-85s, 76s-74s, 65s, 64s" },
              ]},
              { type: "callout", label: "Adjustment with aggressive BTN", content: "If BTN is a player who 3-bets a lot, tighten your CO ISO range upward: remove weaker hands (A4s, K8s, 64s) that don't handle a 3-bet well and keep those with a clear response (AA-77, AJs+, KQs)." },
            ],
          },
          {
            title: "ISO ranges — MP vs 1 limper",
            body: [
              { type: "positionHeader", name: "ISO_MP", range: "~24%", size: "4x BB", color: "#f97316" },
              { type: "text", content: "From MP the ISO is considerably tighter. You have CO, BTN and the blinds behind — four players who can enter the pot or 3-bet you. Only ISO from MP with hands that can withstand pressure and have a clear edge over the limper's range." },
              { type: "rangeBlock", label: "ISO MP vs 1 limper (~24%)", hands: [
                { group: "Pairs", cards: "AA-55" },
                { group: "Suited aces", cards: "AKs-A7s" },
                { group: "Offsuit aces", cards: "AKo-AJo" },
                { group: "Kings suited", cards: "KQs-K9s" },
                { group: "Kings offsuit", cards: "KQo, KJo" },
                { group: "Broadway suited", cards: "QJs-Q9s, JTs-J9s, T9s-T8s" },
                { group: "Broadway offsuit", cards: "QJo" },
                { group: "Suited connectors", cards: "98s, 97s, 87s" },
              ]},
              { type: "callout", label: "The practical rule from MP", content: "If you'd hesitate to open the hand from MP in a standard spot, you probably shouldn't ISO either. The presence of a limper doesn't dramatically change the range from MP — it does widen it slightly, but the pressure from players behind remains the same." },
            ],
          },
          {
            title: "ISO vs 2+ limpers",
            body: [
              { type: "text", content: "With two or more limpers, the pot grows but so do the problems: more players means higher probability that someone has a strong hand or flops something. ISO with multiple limpers requires hands with more equity potential in multiway pots." },
              { type: "callout", label: "Sizing with 2 limpers", content: "2 limpers → ISO to at least 5BB. 3 limpers → ISO to 6BB. The goal is the same: make the pot expensive for players who would enter cheaply." },
              { type: "rangeBlock", label: "ISO BTN vs 2 limpers (~40%)", hands: [
                { group: "Pairs", cards: "AA-22 (all)" },
                { group: "Suited aces", cards: "AKs-A3s" },
                { group: "Offsuit aces", cards: "AKo-A8o" },
                { group: "Kings suited", cards: "KQs-K6s" },
                { group: "Kings offsuit", cards: "KQo, KJo, KTo" },
                { group: "Broadway suited", cards: "QJs-Q8s, JTs-J8s, T9s-T7s" },
                { group: "Broadway offsuit", cards: "QJo, QTo" },
                { group: "Suited connectors", cards: "98s-96s, 87s-85s, 76s-74s, 65s, 64s, 54s" },
              ]},
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
              { type:"callout", label:"Range Advantage", content:"When your overall range is stronger than the villain's on a specific board. Example: you open from UTG and BB calls. Flop is A♠7♦2♣. Your UTG range has far more strong hands on this board (AA, A7s, A2s, 77, 22, AKs, AQs, etc.) than the BB who called. You have clear range advantage — C-bet very widely." },
              { type:"callout", label:"Nut Advantage", content:"When you have more very strong hands (nuts) than the villain on that board, even without overall range advantage. Example: BTN vs BB on 9♠8♠7♦. Even though BB has decent equity here, BTN has more sets and straight combos (you opened wide preflop). That nut advantage justifies using large sizes with your best hands." },
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
        title: "4. Exploitative Play",
        summary: "Reading your opponent and adjusting strategy to maximize profit.",
        comingSoon: true,
      },
      {
        id: 5,
        title: "5. Bankroll & Mindset",
        summary: "Bankroll management, tilt control, and study habits.",
        comingSoon: true,
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
            <RangeGrid position={block.name} lang={lang} />
          </div>
        );

        if (block.type === "rangeBlock") return (
          <div key={i} style={{ background: "#111320", border: "1px solid #1e2235", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", background: "#1e2030", fontSize: 12, fontWeight: 700, color: "#e8c96a", textTransform: "uppercase", letterSpacing: 0.8 }}>{block.label}</div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {block.hands.map((row, j) => (
                <div key={j} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "#8b8fa8", minWidth: 120 }}>{row.group}</span>
                  <span style={{ fontSize: 13, color: "#dde1f5", fontFamily: "monospace", fontWeight: 600 }}>{row.cards}</span>
                </div>
              ))}
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

function HomePage({ t, onNavigate }) {
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
  { id:41, pos:"MP",  hand:"5♣ 5♦", code:"55",  open:false, size:"3x", ctx:"neutral", es:"55 no está en el rango MP. Necesitas CO o BTN para jugar estos pares pequeños.", en:"55 is not in the MP range. You need CO or BTN to play these small pairs." },
  { id:42, pos:"MP",  hand:"A♦ 6♦", code:"A6s", open:false, size:"3x", ctx:"neutral", es:"A6s no está en el rango MP. Los ases bajos suited entran desde CO.", en:"A6s is not in the MP range. Low suited aces enter from CO." },
  { id:43, pos:"MP",  hand:"K♥ 8♥", code:"K8s", open:false, size:"3x", ctx:"neutral", es:"K8s no está en el rango MP. Desde MP solo K9s y superiores suited.", en:"K8s is not in the MP range. From MP only K9s and higher suited." },
  { id:44, pos:"MP",  hand:"9♠ 8♠", code:"98s", open:false, size:"3x", ctx:"neutral", es:"98s no está en el rango MP. Suited connectors medios entran desde CO.", en:"98s is not in the MP range. Medium suited connectors enter from CO." },
  { id:45, pos:"MP",  hand:"8♦ 7♦", code:"87s", open:false, size:"3x", ctx:"neutral", es:"87s no está en el rango MP. Demasiado especulativo desde posición media.", en:"87s is not in the MP range. Too speculative from middle position." },
  { id:46, pos:"MP",  hand:"A♣ T♥", code:"ATo", open:false, size:"3x", ctx:"neutral", es:"ATo no está en el rango MP. Offsuit ace con kicker media — mejor esperar CO.", en:"ATo is not in the MP range. Offsuit ace with medium kicker — better to wait for CO." },
  { id:47, pos:"MP",  hand:"J♠ 9♥", code:"J9o", open:false, size:"3x", ctx:"neutral", es:"J9o no está en ningún rango de apertura. Offsuit gapper demasiado débil.", en:"J9o is not in any opening range. Offsuit gapper too weak to open." },
  { id:48, pos:"MP",  hand:"7♣ 6♣", code:"76s", open:false, size:"3x", ctx:"neutral", es:"76s no está en el rango MP. Suited connector bajo que necesita posición tardía.", en:"76s is not in the MP range. Low suited connector that needs late position." },
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
  { id:61, pos:"CO",  hand:"4♥ 4♣", code:"44",  open:false, size:"2.5x", ctx:"neutral", es:"44 no está en el rango CO. Los pares muy pequeños necesitan BTN para abrirse.", en:"44 is not in the CO range. Very small pairs need the BTN to be opened." },
  { id:62, pos:"CO",  hand:"A♠ 3♠", code:"A3s", open:false, size:"2.5x", ctx:"neutral", es:"A3s no está en el rango CO. Los ases muy bajos suited entran desde BTN y SB.", en:"A3s is not in the CO range. Very low suited aces enter from BTN and SB." },
  { id:63, pos:"CO",  hand:"K♣ 5♣", code:"K5s", open:false, size:"2.5x", ctx:"neutral", es:"K5s no está en el rango CO. Desde CO solo abrimos K9s y superiores.", en:"K5s is not in the CO range. From CO we only open K9s and above." },
  { id:64, pos:"CO",  hand:"Q♥ 7♥", code:"Q7s", open:false, size:"2.5x", ctx:"neutral", es:"Q7s no está en el rango CO. Demasiado débil para abrir incluso desde CO.", en:"Q7s is not in the CO range. Too weak to open even from CO." },
  { id:65, pos:"CO",  hand:"J♦ 7♦", code:"J7s", open:false, size:"2.5x", ctx:"neutral", es:"J7s no está en el rango CO. Suited gapper demasiado débil.", en:"J7s is not in the CO range. Suited gapper too weak." },
  { id:66, pos:"CO",  hand:"Q♠ 9♥", code:"Q9o", open:false, size:"2.5x", ctx:"neutral", es:"Q9o no está en el rango CO. Offsuit y kicker débil.", en:"Q9o is not in the CO range. Offsuit with a weak kicker." },
  { id:67, pos:"CO",  hand:"Q♣ 9♣", code:"Q9s", open:false, size:"2.5x", ctx:"agg_btn",  es:"Q9s normalmente abre desde CO, pero con BTN que 3-betea el 18% es fold: demasiado débil para pagar o 4-betear.", en:"Q9s normally opens from CO, but with BTN 3-betting 18% it's a fold: too weak to call or 4-bet." },
  // ── BTN opens ────────────────────────────────────────────────
  { id:68, pos:"BTN", hand:"4♦ 4♣", code:"44",  open:true,  size:"2.5x", ctx:"neutral", es:"44 entra en el rango BTN. Desde el button todos los pares se abren.", en:"44 is in the BTN range. From the button all pairs are opened." },
  { id:69, pos:"BTN", hand:"3♠ 3♥", code:"33",  open:true,  size:"2.5x", ctx:"neutral", es:"33 entra en el rango BTN. Set mining es rentable en posición.", en:"33 is in the BTN range. Set mining is profitable in position." },
  { id:70, pos:"BTN", hand:"2♣ 2♦", code:"22",  open:true,  size:"2.5x", ctx:"neutral", es:"22 entra en el rango BTN. El par más bajo es apertura válida desde el button.", en:"22 is in the BTN range. The lowest pair is a valid open from the button." },
  { id:71, pos:"BTN", hand:"A♦ 4♦", code:"A4s", open:true,  size:"2.5x", ctx:"neutral", es:"A4s entra en el rango BTN. Todos los ases suited se abren desde el button.", en:"A4s is in the BTN range. All suited aces are opened from the button." },
  { id:72, pos:"BTN", hand:"A♠ 2♠", code:"A2s", open:true,  size:"2.5x", ctx:"neutral", es:"A2s entra en el rango BTN. Incluso el ace-deuce suited abre desde el button.", en:"A2s is in the BTN range. Even ace-deuce suited opens from the button." },
  { id:73, pos:"BTN", hand:"K♣ 7♣", code:"K7s", open:true,  size:"2.5x", ctx:"neutral", es:"K7s entra en el rango BTN. Desde el button abrimos K6s y superiores suited.", en:"K7s is in the BTN range. From the button we open K6s and above suited." },
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
  { id:97,  pos:"SB", hand:"K♠ 8♠", code:"K8s", open:true,  size:"3x", ctx:"neutral",    es:"K8s entra en el rango SB. El rango SB es más amplio que CO al jugar solo contra BB.", en:"K8s is in the SB range. The SB range is wider than CO when playing only against BB." },
  { id:98,  pos:"SB", hand:"K♥ 7♥", code:"K7s", open:true,  size:"3x", ctx:"neutral",    es:"K7s entra en el rango SB. Kings suited medios son aperturas válidas heads-up.", en:"K7s is in the SB range. Medium suited kings are valid opens heads-up." },
  { id:99,  pos:"SB", hand:"J♣ 8♣", code:"J8s", open:true,  size:"3x", ctx:"neutral",    es:"J8s entra en el rango SB. Suited connector con buen potencial postflop.", en:"J8s is in the SB range. Suited connector with good postflop potential." },
  { id:100, pos:"SB", hand:"T♠ 8♠", code:"T8s", open:true,  size:"3x", ctx:"neutral",    es:"T8s entra en el rango SB. Suited connector rentable desde SB vs BB.", en:"T8s is in the SB range. Profitable suited connector from SB vs BB." },
  { id:101, pos:"SB", hand:"8♥ 6♥", code:"86s", open:true,  size:"3x", ctx:"neutral",    es:"86s entra en el rango SB. Suited connector bajo pero jugable heads-up.", en:"86s is in the SB range. Low suited connector but playable heads-up." },
  { id:102, pos:"SB", hand:"K♣ 9♥", code:"K9o", open:true,  size:"3x", ctx:"neutral",    es:"K9o entra en el rango SB vs BB. Offsuit con buena kicker para jugar heads-up.", en:"K9o is in the SB range vs BB. Offsuit with a good kicker for heads-up play." },
  { id:103, pos:"SB", hand:"Q♠ T♠", code:"QTs", open:true,  size:"3x", ctx:"passive_bb", es:"QTs entra en el rango SB. Con un BB pasivo que raramente 3-betea, ampliar el rango ofensivo es correcto.", en:"QTs is in the SB range. With a passive BB who rarely 3-bets, widening the offensive range is correct." },
  // ── SB folds ─────────────────────────────────────────────────
  { id:104, pos:"SB", hand:"K♦ 3♦", code:"K3s", open:false, size:"3x", ctx:"agg_bb",    es:"K3s no está en el rango SB estándar (mínimo K7s suited). Con BB agresivo la situación empeora aún más — ni siquiera en mesa neutral abrirías K3s desde SB.", en:"K3s is not in the standard SB range (minimum K7s suited). With an aggressive BB the situation gets even worse — you wouldn't open K3s from SB even at a neutral table." },
  { id:105, pos:"SB", hand:"Q♣ 4♣", code:"Q4s", open:false, size:"3x", ctx:"agg_bb",    es:"Q4s no está en el rango SB vs un BB agresivo. Demasiado débil para pagar un 3-bet OOP.", en:"Q4s is not in the SB range vs an aggressive BB. Too weak to call a 3-bet OOP." },
  { id:106, pos:"SB", hand:"J♥ 4♥", code:"J4s", open:false, size:"3x", ctx:"neutral",   es:"J4s no está en el rango SB. El gapper es demasiado grande para ser jugable.", en:"J4s is not in the SB range. The gap is too large to be playable." },
  { id:107, pos:"SB", hand:"T♦ 3♦", code:"T3s", open:false, size:"3x", ctx:"neutral",   es:"T3s no está en el rango SB. Demasiado débil incluso heads-up.", en:"T3s is not in the SB range. Too weak even heads-up." },
  { id:108, pos:"SB", hand:"K♠ 2♣", code:"K2o", open:false, size:"3x", ctx:"neutral",   es:"K2o no está en el rango SB. King offsuit necesita al menos K9o para abrir.", en:"K2o is not in the SB range. Offsuit king needs at least K9o to open." },
  { id:109, pos:"SB", hand:"Q♥ 3♠", code:"Q3o", open:false, size:"3x", ctx:"neutral",   es:"Q3o no está en el rango SB. Queen offsuit con kicker muy baja es fold.", en:"Q3o is not in the SB range. Queen offsuit with very low kicker is a fold." },
  { id:110, pos:"SB", hand:"9♣ 2♣", code:"92s", open:false, size:"3x", ctx:"neutral",   es:"92s no está en el rango SB. El gapper hace esta mano injugable.", en:"92s is not in the SB range. The gap makes this hand unplayable." },
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
  {id:309,type:"cbet",hand:"9♥9♦",board:"7♦5♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"99 overpair en tablero bajo seco. C-bet 33% con alta frecuencia.",en:"99 overpair on a low dry board. C-bet 33% at high frequency.", pos:"CO", callPos:"BTN"},
  {id:310,type:"cbet",hand:"K♠J♠",board:"K♣7♦2♠",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Top pair con buena kicker en tablero seco. C-bet 33% — estándar.",en:"Top pair with good kicker on dry board. C-bet 33% — standard.", pos:"CO", callPos:"BTN"},
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
  {id:323,type:"cbet",hand:"9♥9♠",board:"9♦8♠7♦",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Set de 9s en tablero monotone-style. C-bet 67% — mano de valor muy fuerte pero tablero peligroso con draws.",en:"Set of nines on a very connected board. C-bet 67% — very strong value hand but dangerous board full of draws.", pos:"CO", callPos:"BTN"},
  {id:324,type:"cbet",hand:"J♦T♦",board:"J♠9♠8♥",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + gutshot en tablero muy mojado. C-bet 67% — protege tu mano y construye bote con equity.",en:"Top pair + gutshot on very wet board. C-bet 67% — protect your hand and build pot with equity.", pos:"BTN", callPos:"BB"},
  {id:325,type:"cbet",hand:"A♥Q♥",board:"Q♠J♥T♥",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + nut flush draw en tablero de rainbow a tres colores. C-bet 67% — draw potente + valor.",en:"Top pair + nut flush draw on rainbow three-suit board. C-bet 67% — strong draw + value.", pos:"BTN", callPos:"BB"},
  {id:326,type:"cbet",hand:"K♠Q♠",board:"Q♥J♠T♠",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Top pair + flush draw en tablero conectado peligroso. C-bet 67% — extrae valor y cobra por los draws.",en:"Top pair + flush draw on dangerous connected board. C-bet 67% — extract value and charge for draws.", pos:"CO", callPos:"BTN"},
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
  {id:342,type:"cbet",hand:"K♣K♥",board:"Q♦8♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"KK overpair OOP en tablero seco. C-bet 33% — construye bote con mano fuerte. No hay draws.",en:"KK overpair OOP on dry board. C-bet 33% — build pot with strong hand. No draws.", pos:"UTG", callPos:"BB"},
  {id:343,type:"cbet",hand:"A♦J♦",board:"A♠9♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair OOP en tablero seco. C-bet 33% para extraer valor.",en:"Top pair OOP on dry board. C-bet 33% to extract value.", pos:"CO", callPos:"BTN"},
  {id:344,type:"cbet",hand:"Q♠Q♦",board:"J♣7♦2♠",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"QQ overpair OOP en tablero seco de J. C-bet 33% — extraes valor de JX y manos más débiles.",en:"QQ overpair OOP on dry jack-high board. C-bet 33% — extract value from JX and weaker hands.", pos:"UTG", callPos:"BB"},
  {id:345,type:"cbet",hand:"K♦Q♦",board:"K♣8♦3♠",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair OOP en tablero seco. C-bet 33% por valor.",en:"Top pair OOP on dry board. C-bet 33% for value.", pos:"CO", callPos:"BTN"},
  {id:346,type:"cbet",hand:"A♥T♥",board:"A♦6♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair + backdoor flush draw OOP en tablero seco. C-bet 33% — valor + algo de potencial.",en:"Top pair + backdoor flush draw OOP on dry board. C-bet 33% — value + some potential.", pos:"UTG", callPos:"BB"},
  {id:347,type:"cbet",hand:"J♠J♦",board:"T♦6♣2♠",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"JJ overpair OOP en tablero bajo seco. C-bet 33% — mano fuerte en tablero favorable.",en:"JJ overpair OOP on low dry board. C-bet 33% — strong hand on favorable board.", pos:"CO", callPos:"BTN"},
  {id:348,type:"cbet",hand:"T♣T♦",board:"8♠5♦2♣",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"TT overpair OOP en tablero muy seco. C-bet 33% con alta frecuencia — nadie tiene nada aquí.",en:"TT overpair OOP on very dry board. C-bet 33% at high frequency — nobody has anything here.", pos:"UTG", callPos:"BB"},
  {id:349,type:"cbet",hand:"A♣8♣",board:"A♦7♣3♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"Top pair buena kicker OOP en tablero seco. C-bet 33% por valor.",en:"Top pair good kicker OOP on dry board. C-bet 33% for value.", pos:"CO", callPos:"BTN"},
  {id:350,type:"cbet",hand:"Q♦Q♣",board:"9♦5♣2♥",players:1,open:true, size:"small",ctx:"cb_hu_oop",    es:"QQ overpair OOP en tablero muy bajo. C-bet 33% — tienes la mano más fuerte probable.",en:"QQ overpair OOP on very low board. C-bet 33% — you likely have the strongest hand.", pos:"UTG", callPos:"BB"},
  // ── OOP, should CHECK ── 15 situations ────────────────────────────────────
  {id:351,type:"cbet",hand:"K♠Q♠",board:"9♠8♠7♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Mano perdida OOP en tablero muy mojado. Sin equidad real. El rival tiene mejor posición y rango que conecta. Checkea.",en:"Missed hand OOP on very wet board. No real equity. Villain has better position and connecting range. Check.", pos:"CO", callPos:"BTN"},
  {id:352,type:"cbet",hand:"A♦Q♦",board:"J♠T♠9♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Sin par OOP en tablero extremadamente conectado. No apostar — checkea y evalúa la apuesta del rival.",en:"No pair OOP on extremely connected board. Don't bet — check and evaluate villain's bet.", pos:"UTG", callPos:"BB"},
  {id:353,type:"cbet",hand:"J♣T♣",board:"A♠K♦Q♦",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"JT en tablero A-K-Q = broadway straight (A-K-Q-J-T). Tienes el nuts straight OOP. C-bet 67% — incluso OOP, la mano es demasiado fuerte para checkear. Cobra al rival que tiene draws o pares de broadway.",en:"JT on A-K-Q board = broadway straight (A-K-Q-J-T). You have the nut straight OOP. C-bet 67% — even OOP, the hand is too strong to check. Charge the villain who has draws or broadway pairs.", pos:"CO", callPos:"BTN"},
  {id:354,type:"cbet",hand:"7♦6♦",board:"K♠Q♣J♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Missed suited connector OOP en tablero de tres cartas altas. Sin fold equity relevante. Checkea.",en:"Missed suited connector OOP on three-high-card board. No relevant fold equity. Check.", pos:"SB", callPos:"BTN"},
  {id:355,type:"cbet",hand:"9♣8♣",board:"A♦K♣Q♥",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Sin nada OOP en tablero de tres cartas altas. Bluffear aquí es tirar fichas. Checkea.",en:"Nothing OOP on three-high-card board. Bluffing here is wasting chips. Check.", pos:"UTG", callPos:"BB"},
  {id:356,type:"cbet",hand:"A♠5♠",board:"8♠7♠6♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"A5s OOP en tablero muy conectado que favorece al caller. Backdoor flush no es suficiente. Checkea.",en:"A5s OOP on very connected board favoring the caller. Backdoor flush isn't enough. Check.", pos:"CO", callPos:"BTN"},
  {id:357,type:"cbet",hand:"K♥J♥",board:"T♠9♠8♦",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Gutshot OOP en tablero muy conectado. Poca fold equity. El rival tiene más equity aquí. Checkea.",en:"Gutshot OOP on very connected board. Low fold equity. Villain has more equity here. Check.", pos:"UTG", callPos:"BB"},
  {id:358,type:"cbet",hand:"Q♣J♦",board:"A♠K♠Q♣",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Par de damas OOP en tablero peligroso. El rival puede tener AK, AQ, KQ, flush draw. Checkea.",en:"Pair of queens OOP on dangerous board. Villain can have AK, AQ, KQ, flush draw. Check.", pos:"CO", callPos:"BTN"},
  {id:359,type:"cbet",hand:"5♠5♦",board:"J♣T♣9♥",players:1,open:false,size:null,ctx:"cb_hu_oop",       es:"Underpair OOP en tablero muy conectado. Sin equity real. Checkea.",en:"Underpair OOP on very connected board. No real equity. Check.", pos:"SB", callPos:"BTN"},
  {id:360,type:"cbet",hand:"A♦2♦",board:"K♠Q♠J♦",players:1,open:false,size:null,ctx:"cb_hu_ip_fish",   es:"A2s sin par en tablero de tres cartas altas vs calling station. No bluffees. Checkea.",en:"A2s no pair on three-high-card board vs calling station. Don't bluff. Check.", pos:"BTN", callPos:"BB"},
  // ── OOP, wet board, C-bet large — 5 situations ────────────────────────────
  {id:361,type:"cbet",hand:"A♠A♦",board:"J♠T♠9♦",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"AA OOP en tablero extremadamente peligroso. C-bet 67% — mano premium pero debes cobrar a los draws YA.",en:"AA OOP on extremely dangerous board. C-bet 67% — premium hand but you must charge the draws NOW.", pos:"CO", callPos:"BTN"},
  {id:362,type:"cbet",hand:"K♣K♦",board:"9♠8♣7♠",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"KK OOP en tablero mojado. C-bet 67% — overpair fuerte pero tablero peligroso. Cobra a los draws.",en:"KK OOP on wet board. C-bet 67% — strong overpair but dangerous board. Charge the draws.", pos:"CO", callPos:"BTN"},
  {id:363,type:"cbet",hand:"T♠T♦",board:"T♣9♣8♦",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Set de tens OOP en tablero conectado. C-bet 67% — set fuerte pero necesita cobrar a los draws.",en:"Set of tens OOP on connected board. C-bet 67% — strong set but needs to charge the draws.", pos:"CO", callPos:"BTN"},
  {id:364,type:"cbet",hand:"A♥J♥",board:"J♠T♥9♠",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Top pair + flush draw OOP en tablero peligroso. C-bet 67% — draw + valor justifican tamaño grande.",en:"Top pair + flush draw OOP on dangerous board. C-bet 67% — draw + value justify large size.", pos:"CO", callPos:"BTN"},
  {id:365,type:"cbet",hand:"Q♠Q♦",board:"Q♣J♠T♣",players:1,open:true, size:"large",ctx:"cb_hu_oop",    es:"Set OOP en tablero con straight draws y flush draw. C-bet 67% — cobra YA, no puedes dormir este set.",en:"Set OOP on board with straight and flush draws. C-bet 67% — charge NOW, can't slow-play this set.", pos:"UTG", callPos:"BB"},
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
  {id:390,type:"cbet",hand:"5♦5♣",board:"A♦5♠2♣",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Set de 5s en tablero de as. C-bet 67% — set poderoso, cobra al rival que tiene AX.",en:"Set of fives on ace board. C-bet 67% — powerful set, charge the villain who has AX.", pos:"CO", callPos:"BTN"},
  {id:391,type:"cbet",hand:"Q♣T♣",board:"Q♦T♦8♣",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Dos pares top IP en tablero con flush draw. C-bet 67% — mano fuerte pero vulnerable a flushes.",en:"Top two pair IP on board with flush draw. C-bet 67% — strong but vulnerable to flushes.", pos:"BTN", callPos:"BB"},
  {id:392,type:"cbet",hand:"A♠8♣",board:"8♦8♠3♣",players:1,open:true, size:"small",ctx:"cb_hu_ip",     es:"Trips (8s) + top kicker. C-bet 33% small — tablero seco, no hay draws, extrae valor tranquilamente.",en:"Trips (eights) + top kicker. C-bet 33% small — dry board, no draws, extract value calmly.", pos:"BTN", callPos:"BB"},
  {id:393,type:"cbet",hand:"J♠9♠",board:"J♦9♣4♥",players:1,open:true, size:"large",ctx:"cb_hu_ip",     es:"Dos pares top IP en tablero con possible flush draws en colores. C-bet 67% — protege tu mano.",en:"Top two pair IP on board with potential flush draws. C-bet 67% — protect your hand.", pos:"BTN", callPos:"BB"},
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

function PracticePage({ t, lang }) {
  const p = t.practice;
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [currentOpts, setCurrentOpts] = useState([]);

  const ALL_SITUATIONS = [...SITUATIONS, ...ISO_SITUATIONS, ...CBET_SITUATIONS];

  const startSession = () => {
    const shuffled = [...ALL_SITUATIONS].sort(() => Math.random() - 0.5);
    const hands = shuffled.slice(0, 10);
    setSession(hands);
    setIdx(0); setPicked(null); setScore(0); setDone(false);
    setCurrentOpts(buildOptions(hands[0], t.practice, lang));
  };

  const handlePick = (opt) => {
    if (picked !== null) return;
    setPicked(opt);
    if (opt.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx < 9) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setPicked(null);
      setCurrentOpts(buildOptions(session[nextIdx], t.practice, lang));
    } else {
      setDone(true);
    }
  };

  const posColors = { UTG:"#ef4444", MP:"#f97316", CO:"#eab308", BTN:"#10b981", SB:"#8b5cf6", BB:"#06b6d4" };

  // ── Start screen ──────────────────────────────────────────────
  if (!session) return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{p.title}</div>
      <div style={{ fontSize: 14, color: "#8b8fa8", marginBottom: 36 }}>{p.subtitle}</div>
      <button onClick={startSession} style={{ background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 100%)", border: "none", borderRadius: 12, padding: "14px 36px", color: "#0a0c14", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3 }}>
        {p.start}
      </button>
    </div>
  );

  // ── Results screen ────────────────────────────────────────────
  if (done) return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>{score === 10 ? "🏆" : score >= 7 ? "👍" : "📚"}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{p.scoreTitle}</div>
      <div style={{ fontSize: 48, fontWeight: 800, color: score >= 8 ? "#10b981" : score >= 5 ? "#c9a84c" : "#f97316", margin: "16px 0" }}>
        {score} / 10
      </div>
      <div style={{ fontSize: 15, color: "#b0b4cc", marginBottom: 36 }}>
        {score === 10 ? p.perfect : score >= 7 ? p.good : p.review}
      </div>
      <button onClick={startSession} style={{ background: "linear-gradient(135deg, #e8c96a 0%, #c9a84c 100%)", border: "none", borderRadius: 12, padding: "14px 36px", color: "#0a0c14", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3 }}>
        {p.playAgain}
      </button>
    </div>
  );

  // ── Question screen ───────────────────────────────────────────
  const sit = session[idx];
  const opts = currentOpts;
  const ctx = CTX[sit.ctx];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#8b8fa8" }}>{p.situation} {idx + 1} {p.of} 10</span>
          <span style={{ fontSize: 12, color: "#c9a84c" }}>✓ {score}</span>
        </div>
        <div style={{ height: 4, background: "#1e2235", borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${(idx / 10) * 100}%`, background: "#c9a84c", borderRadius: 4, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Situation card */}
      <div style={{ background: "#0d0f1a", border: "1px solid #1e2235", borderRadius: 14, padding: "20px", marginBottom: 16 }}>
        {sit.type === "cbet" && sit.pos && sit.callPos && (
          <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: posColors[sit.pos] || "#c9a84c", fontWeight: 800 }}>{sit.pos}</span>
            <span>vs</span>
            <span style={{ fontWeight: 700, color: "#c9a84c" }}>{sit.callPos}</span>
            <span style={{ color: "#1e2235" }}>·</span>
            <span>{sit.players === 1 ? (lang === "es" ? "Heads-up" : "Heads-up") : (lang === "es" ? "3-way" : "3-way")}</span>
            <span style={{ color: "#1e2235" }}>·</span>
            <span>{sit.ctx && sit.ctx.includes("oop") ? (lang === "es" ? "Fuera de posición" : "Out of position") : (lang === "es" ? "En posición" : "In position")}</span>
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
          {sit.players != null && sit.type !== "cbet" && (
            <div>
              <div style={{ fontSize: 11, color: "#8b8fa8", textTransform: "uppercase", letterSpacing: 0.8 }}>{p.playersLabel}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8c96a" }}>{sit.players === 1 ? "HU (2)" : `${sit.players + 1}-way`}</div>
            </div>
          )}
        </div>
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
          {idx < 9 ? p.next : p.finish}
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

// ─── APP SHELL ────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState("es");
  const [page, setPage] = useState("home");
  const [completed, setCompleted] = useState(new Set());
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  const t = content[lang];

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load saved progress from Firestore
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setCompleted(new Set(data.completedLessons || []));
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
    const next = new Set([...completed, lessonId]);
    setCompleted(next);
    // Save to Firestore
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          completedLessons: Array.from(next),
        }, { merge: true });
      } catch (_) {}
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setPage("home");
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
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            style={{ background: "#111320", border: "1px solid #c9a84c55", borderRadius: 8, padding: "5px 12px", color: "#c9a84c", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}
          >
            {lang === "en" ? "🇪🇸 ES" : "🇬🇧 EN"}
          </button>
          <button
            onClick={handleLogout}
            title={lang === "es" ? "Cerrar sesión" : "Sign out"}
            style={{ background: "transparent", border: "1px solid #1e2235", borderRadius: 8, padding: "5px 11px", color: "#8b8fa8", cursor: "pointer", fontSize: 13 }}
          >
            ⎋
          </button>
        </div>
      </div>

      {page === "home" && <HomePage t={t} onNavigate={setPage} />}
      {page === "academia" && <AcademiaPage t={t} completed={completed} onComplete={handleComplete} lang={lang} />}
      {page === "practice" && <PracticePage t={t} lang={lang} />}
    </div>
  );
}
