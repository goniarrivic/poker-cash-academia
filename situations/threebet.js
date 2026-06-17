// ─── 3-BET / SQUEEZE — situaciones ───────────────────────────────────────────
// type:"3bet" — open=true → 3-bet (resubida) es correcto.
//               open=false, size:"call" → pagar es correcto.
//               open=false, size!=="call" → foldear es correcto.
// ctx: una de las claves threebet_* definidas en CTX (grinders-manual.jsx).
// IDs: 701-736 (rango reservado para situaciones de 3-bet/squeeze).
// IDs 737-741: situaciones movidas desde CALL_SITUATIONS (antes "pagar", ahora "3-bet").
// IDs 742-747: situaciones de 4-BET — facing4bet:true.
//   facing4bet:true cambia el significado de open/size:
//     open=true              → 5-bet all-in es correcto.
//     open=false, size:"call" → pagar el 4-bet es correcto.
//     open=false (sin size)   → foldear ante el 4-bet es correcto.
//   ctx: fourbet_value o fourbet_bluff (definidas en CTX, grinders-manual.jsx).
export const THREEBET_SITUATIONS_EXTRA = [
  // ── THREEBET_VALUE (7) ──────────────────────────────────────────────────
  {id:701,type:"3bet",hand:"A♠A♥",pos:"BB",callPos:"CO",open:true,size:"oop",ctx:"threebet_value",
   es:"AA es la mejor mano posible — 3-bet por valor siempre, sin importar la posición. Pagar o foldear con AA pierde un valor enorme.",
   en:"AA is the best possible hand — always 3-bet for value regardless of position. Calling or folding with AA gives up enormous value."},
  {id:702,type:"3bet",hand:"K♦K♣",pos:"SB",callPos:"BTN",open:true,size:"oop",ctx:"threebet_value",
   es:"KK es una mano premium para 3-bet por valor. Quieres aislar al abridor y construir el bote con la segunda mejor mano posible.",
   en:"KK is a premium hand for a value 3-bet. You want to isolate the opener and build the pot with the second-best possible hand."},
  {id:703,type:"3bet",hand:"A♣K♣",pos:"CO",callPos:"UTG",open:true,size:"ip",ctx:"threebet_value",
   es:"AKs es lo bastante fuerte para 3-betear por valor (y además juega muy bien si te pagan). 3-bet en vez de simplemente pagar.",
   en:"AKs is strong enough to 3-bet for value (and it also plays great if called). 3-bet instead of just calling."},
  {id:704,type:"3bet",hand:"Q♥Q♦",pos:"BTN",callPos:"CO",open:true,size:"ip",ctx:"threebet_value",
   es:"QQ es una mano de valor clara para 3-bet desde el botón frente a una apertura de CO.",
   en:"QQ is a clear value 3-bet from the button against a CO open."},
  {id:705,type:"3bet",hand:"A♠Q♠",pos:"BB",callPos:"BTN",open:true,size:"oop",ctx:"threebet_value",
   es:"AQs tiene suficiente valor para 3-betear frente a una apertura tardía del botón — domina muchas manos del rango amplio del BTN.",
   en:"AQs has enough value to 3-bet against a late button open — it dominates many hands in the BTN's wide range."},
  {id:706,type:"3bet",hand:"7♠7♣",pos:"SB",callPos:"BTN",open:false,ctx:"threebet_value",
   es:"77 no tiene suficiente valor para un 3-bet (sería una mano de valor demasiado fina contra el rango de apertura del BTN), y jugarla fuera de posición tampoco es atractivo. Fold.",
   en:"77 doesn't have enough value for a 3-bet (it would be too thin a value hand against the BTN's opening range), and playing it out of position isn't attractive either. Fold."},
  {id:707,type:"3bet",hand:"A♦J♦",pos:"CO",callPos:"MP",open:false,size:"call",ctx:"threebet_value",
   es:"AJs es una mano decente pero no lo bastante fuerte para un 3-bet por valor puro frente a MP (puede chocar con manos mejores como AQ/AK/JJ+). Pagar y jugar postflop con tu posición es mejor.",
   en:"AJs is a decent hand but not strong enough for a pure value 3-bet against MP (it can run into better hands like AQ/AK/JJ+). Calling and playing postflop with position is better."},

  // ── THREEBET_BLUFF (7) ──────────────────────────────────────────────────
  {id:708,type:"3bet",hand:"A♠5♠",pos:"BTN",callPos:"CO",open:true,size:"bluff",ctx:"threebet_bluff",
   es:"A5s es un farol de 3-bet ideal: bloquea las manos AA/AK/A5 del rango de CO con las que pagaría, y juega bien si te paga (suited, puede hacer color o escalera).",
   en:"A5s is an ideal bluff 3-bet: it blocks the AA/AK/A5 combos in CO's calling range, and it plays well if called (suited, can make a flush or straight)."},
  {id:709,type:"3bet",hand:"K♥9♥",pos:"SB",callPos:"BTN",open:true,size:"bluff",ctx:"threebet_bluff",
   es:"K9s bloquea combos KQ/KJ/K9 del rango amplio del BTN y tiene buena jugabilidad postflop si te paga — buen candidato de farol.",
   en:"K9s blocks KQ/KJ/K9 combos in the BTN's wide range and has good postflop playability if called — a solid bluff candidate."},
  {id:710,type:"3bet",hand:"Q♦J♦",pos:"BB",callPos:"CO",open:true,size:"bluff",ctx:"threebet_bluff",
   es:"QJs tiene buena equity y jugabilidad, además de bloquear AQ/KQ/QQ — un farol de 3-bet sólido desde la BB.",
   en:"QJs has good equity and playability, plus it blocks AQ/KQ/QQ — a solid bluff 3-bet from the BB."},
  {id:711,type:"3bet",hand:"7♣6♣",pos:"CO",callPos:"MP",open:false,ctx:"threebet_bluff",
   es:"76s no tiene los bloqueadores adecuados (no bloquea las manos de pago del rival) y 3-betear aquí solo añade varianza sin equity de bloqueo. Fold.",
   en:"76s doesn't have the right blockers (it doesn't block villain's calling hands), and 3-betting here only adds variance without blocker equity. Fold."},
  {id:712,type:"3bet",hand:"A♦4♦",pos:"BTN",callPos:"MP",open:true,size:"bluff",ctx:"threebet_bluff",
   es:"A4s bloquea las manos con As del rango de apertura de MP y tiene potencial de color — farol de 3-bet razonable desde el botón.",
   en:"A4s blocks Ax hands in MP's opening range and has flush potential — a reasonable bluff 3-bet from the button."},
  {id:713,type:"3bet",hand:"K♠T♠",pos:"SB",callPos:"CO",open:false,size:"call",ctx:"threebet_bluff",
   es:"KTs tiene cierto valor de bloqueo, pero contra el rango más fuerte de CO desde la SB (con multiway potencial), pagar es más sólido que arriesgarse con un 3-bet farol.",
   en:"KTs has some blocker value, but against CO's stronger range from the SB (with multiway potential), calling is more solid than risking a bluff 3-bet."},
  {id:714,type:"3bet",hand:"5♥4♥",pos:"BB",callPos:"BTN",open:true,size:"bluff",ctx:"threebet_bluff",
   es:"54s no bloquea mucho, pero contra el rango muy amplio del BTN desde la BB, un 3-bet farol con buena jugabilidad postflop y baja frecuencia de 4-bet del rival es rentable.",
   en:"54s doesn't block much, but against the BTN's very wide range from the BB, a bluff 3-bet with good postflop playability and a low villain 4-bet frequency is profitable."},

  // ── THREEBET_LINEAR (6) ─────────────────────────────────────────────────
  {id:715,type:"3bet",hand:"A♥J♣",pos:"BB",callPos:"BTN",open:true,size:"linear",ctx:"threebet_linear",
   es:"Tu rango de pago en la BB frente al BTN es débil y jugar fuera de posición multiway con AJo no es ideal. Mejor ir lineal: 3-bet con AJo en vez de pagar.",
   en:"Your calling range in the BB against the BTN is weak, and playing AJo out of position multiway isn't ideal. Better to go linear: 3-bet AJo instead of calling."},
  {id:716,type:"3bet",hand:"K♦Q♦",pos:"SB",callPos:"CO",open:true,size:"linear",ctx:"threebet_linear",
   es:"Desde la SB no tienes un rango de limp/call atractivo — KQs entra en tu rango lineal de 3-bet en vez de pagar y jugar fuera de posición multiway.",
   en:"From the SB you don't have an attractive limp/call range — KQs belongs in your linear 3-bet range instead of calling and playing out of position multiway."},
  {id:717,type:"3bet",hand:"A♣T♣",pos:"BB",callPos:"CO",open:true,size:"linear",ctx:"threebet_linear",
   es:"ATs es mejor 3-betearla linealmente desde la BB que pagarla — pagar te deja con un rango de manos dominadas jugando fuera de posición.",
   en:"ATs is better 3-bet linearly from the BB than called — calling leaves you with a range of dominated hands playing out of position."},
  {id:718,type:"3bet",hand:"Q♠J♠",pos:"SB",callPos:"BTN",open:true,size:"linear",ctx:"threebet_linear",
   es:"QJs frente a una apertura del BTN desde la SB: ir lineal con un 3-bet es mejor que pagar y entrar en un bote fuera de posición con un rango de pago débil.",
   en:"QJs against a BTN open from the SB: going linear with a 3-bet is better than calling and entering a pot out of position with a weak calling range."},
  {id:719,type:"3bet",hand:"9♣8♣",pos:"BB",callPos:"BTN",open:false,size:"call",ctx:"threebet_linear",
   es:"98s es una mano de pago razonable desde la BB (precio barato, buena jugabilidad postflop) — no necesita entrar en tu rango lineal de 3-bet; pagar es correcto aquí.",
   en:"98s is a reasonable calling hand from the BB (cheap price, good postflop playability) — it doesn't need to be in your linear 3-bet range; calling is correct here."},
  {id:720,type:"3bet",hand:"K♣9♣",pos:"SB",callPos:"BTN",open:false,ctx:"threebet_linear",
   es:"K9s no es lo bastante fuerte ni para un 3-bet lineal ni para pagar fuera de posición frente al rango amplio del BTN. Fold.",
   en:"K9s isn't strong enough for a linear 3-bet or for calling out of position against the BTN's wide range. Fold."},

  // ── THREEBET_VS_AGG (6) ─────────────────────────────────────────────────
  {id:721,type:"3bet",hand:"K♦Q♣",pos:"CO",callPos:"UTG",open:false,ctx:"threebet_vs_agg",
   es:"El abridor de UTG es muy agresivo (3-bet/4-bet con frecuencia) — frente a su apertura, KQo no aguanta bien un 4-bet. Foldear en vez de un 3-bet marginal.",
   en:"The UTG opener is very aggressive (3-bets/4-bets often) — against their open, KQo doesn't hold up well to a 4-bet. Fold instead of a marginal 3-bet."},
  {id:722,type:"3bet",hand:"A♠A♦",pos:"BTN",callPos:"MP",open:true,size:"value",ctx:"threebet_vs_agg",
   es:"Incluso contra un rival muy agresivo, AA siempre 3-betea por valor — de hecho su agresividad añade valor extra porque pagará o 4-beteará más seguido.",
   en:"Even against a very aggressive opponent, AA always 3-bets for value — in fact their aggression adds extra value since they'll call or 4-bet more often."},
  {id:723,type:"3bet",hand:"A♣5♣",pos:"BB",callPos:"BTN",open:false,ctx:"threebet_vs_agg",
   es:"Contra un BTN muy agresivo que 4-betea con frecuencia, los faroles de 3-bet con A5s pierden valor porque su rango de 4-bet es más amplio y más fuerte de lo habitual. Fold.",
   en:"Against a very aggressive BTN who 4-bets often, bluff 3-bets with A5s lose value because their 4-bet range is wider and stronger than usual. Fold."},
  {id:724,type:"3bet",hand:"J♥J♦",pos:"SB",callPos:"CO",open:true,size:"value",ctx:"threebet_vs_agg",
   es:"JJ sigue siendo un 3-bet por valor incluso frente a un CO agresivo — quieres aislar el bote, y JJ se defiende razonablemente bien de un 4-bet.",
   en:"JJ is still a value 3-bet even against an aggressive CO — you want to isolate the pot, and JJ defends reasonably well against a 4-bet."},
  {id:725,type:"3bet",hand:"K♠J♠",pos:"CO",callPos:"UTG",open:false,size:"call",ctx:"threebet_vs_agg",
   es:"KJs tiene equity decente, pero contra un UTG muy agresivo, pagar y ver el flop con posición es mejor que exponerte a un 4-bet con una mano que no quiere ese spot.",
   en:"KJs has decent equity, but against a very aggressive UTG, calling and seeing the flop with position is better than exposing yourself to a 4-bet with a hand that doesn't want that spot."},
  {id:726,type:"3bet",hand:"Q♦Q♠",pos:"BB",callPos:"BTN",open:true,size:"value",ctx:"threebet_vs_agg",
   es:"QQ 3-betea por valor incluso frente a un BTN muy agresivo — su rango de apertura amplio significa que QQ está claramente por delante en promedio.",
   en:"QQ 3-bets for value even against a very aggressive BTN — their wide opening range means QQ is clearly ahead on average."},

  // ── THREEBET_SIZING (4, stacks 40BB) ────────────────────────────────────
  {id:727,type:"3bet",hand:"A♥K♠",pos:"BTN",callPos:"CO",open:true,size:"deep40",ctx:"threebet_sizing",
   es:"A 40BB efectivos, el 3-bet en posición debe ser algo más pequeño en proporción (≈2.5-3x el open) para no comprometer demasiado el stack — pero AKo sigue siendo un 3-bet claro por valor.",
   en:"At 40BB effective, an in-position 3-bet should be proportionally a bit smaller (≈2.5-3x the open) to avoid over-committing the stack — but AKo is still a clear value 3-bet."},
  {id:728,type:"3bet",hand:"9♠9♣",pos:"SB",callPos:"BTN",open:true,size:"deep40",ctx:"threebet_sizing",
   es:"A 40BB, 99 gana valor de 3-bet — los stacks más cortos hacen que ganar el bote preflop o jugar un pote más pequeño postflop sea más sencillo con un par medio.",
   en:"At 40BB, 99 gains 3-bet value — shorter stacks make winning the pot preflop or playing a smaller postflop pot easier with a medium pair."},
  {id:729,type:"3bet",hand:"A♦2♦",pos:"BB",callPos:"BTN",open:false,ctx:"threebet_sizing",
   es:"A 40BB, los faroles de 3-bet ligeros (como A2s) pierden parte de su atractivo, porque el rival tiene menos incentivo para foldear ante un 4-bet/all-in más pequeño en bb. Fold.",
   en:"At 40BB, light bluff 3-bets (like A2s) lose some of their appeal, because the opponent has less incentive to fold to a smaller 4-bet/all-in in bb terms. Fold."},
  {id:730,type:"3bet",hand:"A♣A♥",pos:"CO",callPos:"MP",open:true,size:"deep40",ctx:"threebet_sizing",
   es:"AA siempre 3-betea por valor; a 40BB, usa un sizing que deje una proporción de stack razonable para poder 4-bet all-in o pagar un 4-bet cómodamente.",
   en:"AA always 3-bets for value; at 40BB, use a sizing that leaves a reasonable stack proportion so you can 4-bet all-in or comfortably call a 4-bet."},

  // ── THREEBET_SQUEEZE 1-6 ─────────────────────────────────────────────────
  {id:731,type:"3bet",hand:"Q♠Q♥",pos:"BTN",callPos:"UTG",open:true,size:"squeeze",ctx:"threebet_squeeze_1",
   es:"QQ en el BTN frente a la apertura de UTG + call de MP: squeeze por valor. QQ está por delante de ambos rangos en promedio y quieres reducir el número de jugadores y aislar el bote.",
   en:"QQ on the BTN against UTG's open + MP's call: a value squeeze. QQ is ahead of both ranges on average, and you want to reduce the number of players and isolate the pot."},
  {id:732,type:"3bet",hand:"A♠K♦",pos:"BB",callPos:"CO",open:true,size:"squeeze",ctx:"threebet_squeeze_2",
   es:"AKo en la BB frente a la apertura de CO + call del BTN: squeeze por valor. AKo juega mal multiway y fuera de posición si solo pagas, pero es una mano excelente para aislar con un squeeze grande.",
   en:"AKo in the BB against CO's open + BTN's call: a value squeeze. AKo plays poorly multiway and out of position if you just call, but it's an excellent hand to isolate with a big squeeze."},
  {id:733,type:"3bet",hand:"A♥5♣",pos:"CO",callPos:"UTG",open:false,ctx:"threebet_squeeze_3",
   es:"Contra dos rangos tight (apertura de UTG + call de MP), A5o no tiene ni el valor ni los bloqueadores para un squeeze rentable, y pagar para jugar multiway con A5o tampoco es atractivo. Fold.",
   en:"Against two tight ranges (UTG's open + MP's call), A5o has neither the value nor the blockers for a profitable squeeze, and calling to play multiway with A5o isn't attractive either. Fold."},
  {id:734,type:"3bet",hand:"J♠J♦",pos:"SB",callPos:"MP",open:true,size:"squeeze",ctx:"threebet_squeeze_4",
   es:"JJ en la SB frente a la apertura de MP + call del CO: squeeze por valor. No quieres jugar JJ fuera de posición multiway pagando — el squeeze aísla y construye el bote con una mano fuerte.",
   en:"JJ in the SB against MP's open + CO's call: a value squeeze. You don't want to play JJ out of position multiway by just calling — the squeeze isolates and builds the pot with a strong hand."},
  {id:735,type:"3bet",hand:"K♠Q♦",pos:"BTN",callPos:"MP",open:false,size:"call",ctx:"threebet_squeeze_5",
   es:"KQo en el BTN frente a una apertura del HJ y call del CO: tiene buena equity y posición, pero contra dos rangos ya comprometidos, pagar y ver el flop con posición y un bote más grande es preferible a un squeeze marginal.",
   en:"KQo on the BTN against an HJ open and a CO call: it has good equity and position, but against two already-committed ranges, calling and seeing the flop with position and a bigger pot is preferable to a marginal squeeze."}
  // ── DEFENDING VS 3-BET — Lección 10 ─────────────────────────────────────────
  // defending3bet:true → Hero abrió y el rival hizo un 3-bet — Hero decide cómo defender.
  // open=true → 4-bet es correcto
  // open=false, size:"call" → pagar el 3-bet es correcto
  // open=false (sin size) → foldear es correcto
  // IDs: 748-767

  // ── 4-BET POR VALOR (5) ──────────────────────────────────────────────────────
  {id:748,type:"3bet",hand:"A♠A♥",pos:"BTN",callPos:"BB",open:true,size:"value",defending3bet:true,ctx:"defending3bet_4bet",
   es:"AA vs 3-bet de la BB desde BTN: 4-bet por valor siempre. Tu mano domina absolutamente el rango de 3-bet del rival. Jugar el bote lo más grande posible preflop es la línea más rentable. 4-Bet.",
   en:"AA vs BB 3-bet from BTN: always 4-bet for value. Your hand completely dominates villain's 3-bet range. Playing for the biggest pot possible preflop is the most profitable line. 4-Bet."},
  {id:749,type:"3bet",hand:"K♦K♣",pos:"CO",callPos:"BTN",open:true,size:"value",defending3bet:true,ctx:"defending3bet_4bet",
   es:"KK vs 3-bet del BTN desde CO (IP): 4-bet por valor. KK quiere construir el bote y es demasiado fuerte para pagar sin resubir. Evitas que el BTN vea un flop barato con manos especulativas. 4-Bet.",
   en:"KK vs BTN 3-bet from CO (IP): 4-bet for value. KK wants to build the pot and is too strong to just call. You avoid letting BTN see a cheap flop with speculative hands. 4-Bet."},
  {id:750,type:"3bet",hand:"A♣K♣",pos:"HJ",callPos:"CO",open:true,size:"value",defending3bet:true,ctx:"defending3bet_4bet",
   es:"AKs vs 3-bet del CO desde HJ: 4-bet por valor. AKs tiene bloqueadores excelentes (bloquea AA/KK/AK del rival), suficiente equity y jugabilidad postflop. Construir el bote con 4-bet es superior a pagar. 4-Bet.",
   en:"AKs vs CO 3-bet from HJ: 4-bet for value. AKs has excellent blockers (blocks villain's AA/KK/AK), sufficient equity and postflop playability. Building the pot with a 4-bet is superior to calling. 4-Bet."},
  {id:751,type:"3bet",hand:"Q♥Q♦",pos:"UTG",callPos:"BB",open:true,size:"value",defending3bet:true,ctx:"defending3bet_4bet",
   es:"QQ vs 3-bet de la BB desde UTG: 4-bet por valor. Aunque OOP, QQ está claramente por delante del rango de 3-bet de la BB (que incluye manos como AJs, KQs, 88+). Construir el bote ahora es más rentable que pagar y enfrentar c-bets OOP. 4-Bet.",
   en:"QQ vs BB 3-bet from UTG: 4-bet for value. Even OOP, QQ is clearly ahead of BB's 3-bet range (which includes hands like AJs, KQs, 88+). Building the pot now is more profitable than calling and facing c-bets OOP. 4-Bet."},
  {id:752,type:"3bet",hand:"A♥K♦",pos:"CO",callPos:"SB",open:true,size:"value",defending3bet:true,ctx:"defending3bet_4bet",
   es:"AKo vs 3-bet del SB desde CO: 4-bet por valor. AKo domina la mayoría del rango de 3-bet del SB (QQ-, AQ-) y jugar OOP pagando es subóptimo. El 4-bet también cierra el bote si el SB foldea, ganando sin confrontación. 4-Bet.",
   en:"AKo vs SB 3-bet from CO: 4-bet for value. AKo dominates most of SB's 3-bet range (QQ-, AQ-) and calling OOP is suboptimal. The 4-bet also wins outright if SB folds. 4-Bet."},

  // ── PAGAR EL 3-BET IP (7) ────────────────────────────────────────────────────
  {id:753,type:"3bet",hand:"J♠J♦",pos:"CO",callPos:"BTN",open:false,size:"call",defending3bet:true,ctx:"defending3bet_call",
   es:"JJ vs 3-bet del BTN desde CO (IP): pagar. JJ tiene suficiente equity vs el rango de 3-bet del BTN y set value (12% de flopearte set). Un 4-bet aquí puede quedar dominado por KK/QQ/AA. En posición con JJ, pagar y ver el flop es la línea más sólida. Paga.",
   en:"JJ vs BTN 3-bet from CO (IP): call. JJ has sufficient equity vs BTN's 3-bet range and set value (12% to flop a set). A 4-bet here can be dominated by KK/QQ/AA. IP with JJ, calling and seeing a flop is the soundest line. Call."},
  {id:754,type:"3bet",hand:"A♦Q♦",pos:"BTN",callPos:"BB",open:false,size:"call",defending3bet:true,ctx:"defending3bet_call",
   es:"AQo vs 3-bet de la BB desde BTN (IP): pagar. AQo tiene buen equity vs el rango de 3-bet de la BB (que incluye manos que AQo domina: KQs, AJ, etc.), y estás IP con un flop por venir. Pagar y jugar postflop con posición es la línea óptima. Paga.",
   en:"AQo vs BB 3-bet from BTN (IP): call. AQo has good equity vs BB's 3-bet range (which includes hands AQo dominates: KQs, AJ, etc.) and you're IP with a flop to come. Calling and playing postflop with position is the optimal line. Call."},
  {id:755,type:"3bet",hand:"K♥Q♥",pos:"BTN",callPos:"SB",open:false,size:"call",defending3bet:true,ctx:"defending3bet_call",
   es:"KQs vs 3-bet del SB desde BTN (IP): pagar. KQs tiene excelente jugabilidad postflop, flush draw potencial y buen equity vs el rango de 3-bet del SB (que puede incluir manos especulativas de squeeze). En posición, pagar es la línea correcta. Paga.",
   en:"KQs vs SB 3-bet from BTN (IP): call. KQs has excellent postflop playability, flush draw potential and good equity vs SB's 3-bet range (which may include speculative squeeze hands). In position, calling is the correct line. Call."},
  {id:756,type:"3bet",hand:"T♣T♦",pos:"CO",callPos:"BTN",open:false,size:"call",defending3bet:true,ctx:"defending3bet_call",
   es:"TT vs 3-bet del BTN desde CO (IP): pagar. TT tiene set value + overpair potencial en tableros bajos. Es suficientemente fuerte para defender el 3-bet y demasiado especulativo para un 4-bet de valor. En posición, pagar es correcto. Paga.",
   en:"TT vs BTN 3-bet from CO (IP): call. TT has set value + overpair potential on low boards. Strong enough to defend the 3-bet and too speculative for a value 4-bet. In position, calling is correct. Call."},
  {id:757,type:"3bet",hand:"A♠J♠",pos:"HJ",callPos:"BTN",open:false,size:"call",defending3bet:true,ctx:"defending3bet_call",
   es:"AJs vs 3-bet del BTN desde HJ (IP): pagar. AJs tiene buena jugabilidad postflop (flush draw, top pair fuerte), no está dominado por la mayoría del rango de 3-bet del BTN y estás IP. Pagar y explotar la posición es correcto. Paga.",
   en:"AJs vs BTN 3-bet from HJ (IP): call. AJs has good postflop playability (flush draw, strong top pair), isn't dominated by most of BTN's 3-bet range, and you're IP. Calling and exploiting position is correct. Call."},
  {id:758,type:"3bet",hand:"9♣9♦",pos:"BTN",callPos:"BB",open:false,size:"call",defending3bet:true,ctx:"defending3bet_call",
   es:"99 vs 3-bet de la BB desde BTN (IP): pagar. 99 tiene set value y puede ser overpair en muchos boards. Con posición y un rango de 3-bet de la BB que puede ser amplio, pagar es rentable. No 4-beteas (99 no es valor 4-bet) ni foldeas. Paga.",
   en:"99 vs BB 3-bet from BTN (IP): call. 99 has set value and can be an overpair on many boards. With position and BB's potentially wide 3-bet range, calling is profitable. Don't 4-bet (99 isn't a value 4-bet) or fold. Call."},
  {id:766,type:"3bet",hand:"K♥T♥",pos:"BTN",callPos:"BB",open:false,size:"call",defending3bet:true,ctx:"defending3bet_call",
   es:"KTs vs 3-bet de la BB desde BTN (IP): pagar. KTs tiene demasiado equity real para convertirla en un 4-bet bluff (desperdicias equity) y demasiado valor para foldear. En posición con una mano suited de buen potencial, pagar es la línea óptima. Paga.",
   en:"KTs vs BB 3-bet from BTN (IP): call. KTs has too much real equity to turn into a 4-bet bluff (you waste equity) and too much value to fold. In position with a suited hand of good potential, calling is the optimal line. Call."},

  // ── FOLDEAR VS 3-BET (5) ─────────────────────────────────────────────────────
  {id:759,type:"3bet",hand:"A♥J♦",pos:"UTG",callPos:"CO",open:false,defending3bet:true,ctx:"defending3bet_fold",
   es:"AJo vs 3-bet del CO desde UTG (OOP): foldear. AJo OOP vs el rango ajustado del CO (QQ+, AK, AQs+) está frecuentemente dominado. La frecuencia de dominación (AK, AQ que superan AJ) hace que pagar sin posición sea -EV. Foldea.",
   en:"AJo vs CO 3-bet from UTG (OOP): fold. AJo OOP vs CO's tight range (QQ+, AK, AQs+) is frequently dominated. The domination frequency (AK, AQ that beat AJ) makes calling without position -EV. Fold."},
  {id:760,type:"3bet",hand:"K♠T♣",pos:"MP",callPos:"BB",open:false,defending3bet:true,ctx:"defending3bet_fold",
   es:"KTo vs 3-bet de la BB (reg ajustado) desde MP (OOP): foldear. KTo sin suit, OOP, vs un BB que solo 3-betea con premiums — tu mano está frecuentemente dominada y la jugabilidad postflop OOP con KTo es mala. Foldea.",
   en:"KTo vs tight BB 3-bet from MP (OOP): fold. KTo unsuited, OOP, vs a BB who only 3-bets premiums — your hand is frequently dominated and postflop playability OOP with KTo is poor. Fold."},
  {id:761,type:"3bet",hand:"T♥T♦",pos:"UTG",callPos:"BTN",open:false,defending3bet:true,ctx:"defending3bet_fold",
   es:"TT vs 3-bet del BTN desde UTG (OOP): foldear. TT OOP vs el rango de 3-bet del BTN (que incluye JJ+/AK que te dominan) y sin la ventaja posicional, el EV de pagar es negativo. Foldear es la línea más disciplinada en este spot. Foldea.",
   en:"TT vs BTN 3-bet from UTG (OOP): fold. TT OOP vs BTN's 3-bet range (which includes JJ+/AK that dominate you) and without positional advantage, calling EV is negative. Folding is the most disciplined line in this spot. Fold."},
  {id:762,type:"3bet",hand:"Q♦J♦",pos:"CO",callPos:"BB",open:false,defending3bet:true,ctx:"defending3bet_fold",
   es:"QJs vs 3-bet de la BB (regular ajustado) desde CO (OOP): foldear. QJs OOP vs el rango de 3-bet de un regular ajustado tiene poca equity y jugabilidad limitada fuera de posición. El rango del rival te domina con frecuencia. Foldea.",
   en:"QJs vs solid regular BB 3-bet from CO (OOP): fold. QJs OOP vs a tight regular's 3-bet range has little equity and limited playability out of position. Villain's range frequently dominates you. Fold."},
  {id:763,type:"3bet",hand:"8♣7♣",pos:"HJ",callPos:"BTN",open:false,defending3bet:true,ctx:"defending3bet_fold",
   es:"87s vs 3-bet del BTN desde HJ (OOP): foldear. Un suited connector especulativo OOP vs un 3-bet tiene muy poca equity directa y los implied odds no compensan jugar en un bote inflado sin posición. Foldea.",
   en:"87s vs BTN 3-bet from HJ (OOP): fold. A speculative suited connector OOP vs a 3-bet has very little direct equity and implied odds don't compensate for playing in an inflated pot without position. Fold."},

  // ── 4-BET BLUFF (3) ───────────────────────────────────────────────────────────
  {id:764,type:"3bet",hand:"A♠5♠",pos:"BTN",callPos:"BB",open:true,size:"bluff",defending3bet:true,ctx:"defending3bet_4bet",
   es:"A5s vs 3-bet de la BB desde BTN (IP): 4-bet bluff. A5s bloquea combos AA/AK del rango de 3-bet de la BB y tiene buena jugabilidad si te pagan (suited, wheel potential). El BTN puede 4-bet bluffear efectivamente frente al rango de la BB, que incluye muchos 3-bets especulativos. 4-Bet.",
   en:"A5s vs BB 3-bet from BTN (IP): 4-bet bluff. A5s blocks AA/AK combos in BB's 3-bet range and has good playability if called (suited, wheel potential). BTN can 4-bet bluff effectively vs BB's range, which includes many speculative 3-bets. 4-Bet."},
  {id:765,type:"3bet",hand:"A♦4♦",pos:"CO",callPos:"SB",open:true,size:"bluff",defending3bet:true,ctx:"defending3bet_4bet",
   es:"A4s vs 3-bet del SB desde CO (IP): 4-bet bluff. A4s bloquea manos con As del rango del SB y tiene jugabilidad postflop si te pagan. Desde CO vs un 3-bet del SB que puede ser un squeeze amplio, el 4-bet bluff con A4s es rentable. 4-Bet.",
   en:"A4s vs SB 3-bet from CO (IP): 4-bet bluff. A4s blocks Ax hands in SB's range and has postflop playability if called. From CO vs a SB 3-bet that could be a wide squeeze, the 4-bet bluff with A4s is profitable. 4-Bet."},
  {id:767,type:"3bet",hand:"A♣Q♥",pos:"MP",callPos:"BTN",open:false,defending3bet:true,ctx:"defending3bet_fold",
   es:"AQo vs 3-bet del BTN (reg sólido) desde MP (OOP): foldear. AQo OOP vs un BTN reg con rango de 3-bet ajustado (JJ+, AK, AQs) tiene una frecuencia alta de dominación. Pagar te deja jugando OOP con una mano frecuentemente dominada. Vs este perfil concreto, foldear es la opción más ajustada. Foldea.",
   en:"AQo vs solid BTN reg 3-bet from MP (OOP): fold. AQo OOP vs a BTN reg with a tight 3-bet range (JJ+, AK, AQs) has a high domination frequency. Calling leaves you playing OOP with a frequently dominated hand. Vs this specific profile, folding is the most disciplined option. Fold."},
];
