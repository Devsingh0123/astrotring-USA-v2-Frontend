/**
 * Vedic Astrology Simulation Engine
 * Generates deep, authentic chart-aware readings mirroring Melooha's tone and precision.
 * Handles both Vaani (Personal Chart-bound) and Astropedia (Universal Encyclopedia).
 */

export function generateAstrologyResponse({ question, engine = "vaani", user, birthDetails }) {
  const userName = user?.name || birthDetails?.fullName || birthDetails?.name || user?.email?.split("@")[0] || "Seeker"
  const firstName = userName.split(" ")[0]
  const lowerQ = (question || "").toLowerCase()

  // ================= ASTROPEDIA ENGINE (Universal Free Encyclopedia) =================
  if (engine === "astropedia") {
    return generateAstropediaResponse(question, lowerQ)
  }

  // ================= VAANI ENGINE (Personal Chart-Bound Readings) =================
  // 1. Higher Studies / Education Query
  if (lowerQ.includes("higher studies") || lowerQ.includes("education") || lowerQ.includes("study") || lowerQ.includes("university")) {
    return {
      openingThought: `Inspecting your 5th house of intellect and 9th house of higher wisdom, ${firstName}...`,
      thinkingSteps: [
        "Analyzing 9th house ruler and Jupiter (Guru) transit influence",
        "Examining D24 (Chaturvimshamsa) educational harmonics and Rahu axis",
      ],
      paragraphs: [
        `${firstName}, your chart indicates that higher studies will not be a straight academic progression, but a specialized deep-dive that pivots your career trajectory.`,
        `Jupiter’s influence on your 9th house supports acquiring deep theoretical or research-oriented knowledge, especially in specialized fields rather than conventional management. If you are considering foreign education or advanced certifications, the planetary placements strongly favor programs that emphasize analytical or self-directed research.`,
        `The current dasha period encourages disciplined study, though Rahu’s aspect can occasionally trigger hesitation between two distinct academic fields. Trust the choice that builds hard, verifiable technical competency over generalized credentials.`,
        `A highly auspicious educational milestone opens up as transit Jupiter forms a trine to your natal Mercury, clearing examination hurdles and securing admission.`,
      ],
      astrologyBehind: [
        "1) 9th House of Higher Learning: fortified by benefic Jupiter aspect, granting depth in philosophy and specialized study",
        "2) 5th House of Buddhi (Intellect): strong connection with Mercury indicates quick conceptual absorption",
        "3) D24 (Chaturvimshamsa) alignment: indicates academic success through investigative and structured discipline",
        "4) Transit Jupiter trine natal Mercury: facilitates clear mental retention and favorable examination outcomes",
      ],
      suggestedQuestions: [
        "Is foreign education indicated in my birth chart?",
        "Which academic field aligns best with my 10th house?",
        "When is the best astrological window to apply for programs?",
        "How can I strengthen my concentration according to my chart?",
      ],
      offer: {
        title: "Special Offer: 12 Questions Pack",
        description: "Your question balance is ZERO. Top up with Gold Pack using promo code: QUICKGOLD",
        promoCode: "QUICKGOLD",
        discountPercent: 67,
        questionsCount: 12,
      },
    }
  }

  // 2. Lagna / What does it say about me?
  if (lowerQ.includes("lagna") || lowerQ.includes("say about me") || lowerQ.includes("who am i") || lowerQ.includes("ascendant")) {
    return {
      openingThought: `Examining your rising Lagna and the placement of your Ascendant Lord, ${firstName}...`,
      thinkingSteps: [
        "Calculating Lagna degree, nakshatra pada, and elemental constitution",
        "Evaluating Lagna Lord strength in Shadbala and Navamsa (D9)",
      ],
      paragraphs: [
        `${firstName}, your rising Lagna represents your physical vitality, primary life compass, and how you instinctively process external reality.`,
        `Because your Lagna is placed in a Dharma Trikona, your life is built on finding authentic alignment with what you do, rather than simply going along with conventional expectations. You possess a naturally reflective demeanor with an observant analytical mind that assesses situations thoroughly before taking action.`,
        `Your primary strength is resilience under pressure and the ability to maintain ethical clarity when others panic. Your core vulnerability lies in periodic self-doubt—taking responsibility for outcomes that were outside your control.`,
        `As your current dasha advances, your Lagna Lord gains increasing directional strength (Digbala), encouraging you to step out of quiet backstage execution and into visible, self-directed leadership.`,
      ],
      astrologyBehind: [
        "1) Lagna placement in Dharma Trikona: endows native with an instinctive pursuit of purpose and moral integrity",
        "2) Lagna Lord dignity in D1 & D9: grants bodily resilience and recovery from periods of mental fatigue",
        "3) Moon-Lagna axis: sharp perceptive intelligence coupled with deliberate decision-making pace",
        "4) Digbala (Directional Strength): planetary placements support gradual ascension into authority",
      ],
      suggestedQuestions: [
        "What is the connection between my Lagna and my career?",
        "Which gemstone or planetary remedy strengthens my Lagna Lord?",
        "How does my Lagna interact with my Moon sign?",
        "Which houses in my chart are currently most supportive?",
      ],
      offer: {
        title: "Special Offer: 12 Questions Pack",
        description: "Your question balance is ZERO. Top up with Gold Pack using promo code: QUICKGOLD",
        promoCode: "QUICKGOLD",
        discountPercent: 67,
        questionsCount: 12,
      },
    }
  }

  // 3. Property / Real Estate Query
  if (lowerQ.includes("property") || lowerQ.includes("buy property") || lowerQ.includes("home") || lowerQ.includes("land") || lowerQ.includes("house")) {
    return {
      openingThought: `Inspecting your 4th house (Sukha Bhava), 4th Lord dignity, and Mars (Bhumi Karaka), ${firstName}...`,
      thinkingSteps: [
        "Analyzing 4th house occupancy and aspectual associations",
        "Evaluating Mars (Karaka for immovable property) and D4 (Chaturthamsa) harmonics",
      ],
      paragraphs: [
        `${firstName}, the acquisition of immovable property in your chart is deeply tied to Mars and the strength of your 4th house of domestic peace and land holdings.`,
        `Your chart shows auspicious promise for property ownership, but specifically indicates that purchases made with thorough legal due diligence yield long-term capital appreciation. Impulsive agreements or buying property jointly with distant acquaintances should be avoided.`,
        `Regarding timing: The current planetary transits indicate a favorable negotiation window approaching over the coming quarters as Jupiter casts its aspect on the 4th cusp. This window is particularly auspicious for residential property or land in quiet, well-connected areas.`,
        `Before finalizing registrations, ensure that dates align with a waxing Moon (Shukla Paksha) and avoid days influenced by retrograde Mercury to prevent paperwork delays.`,
      ],
      astrologyBehind: [
        "1) 4th House (Sukha & Bhumi Bhava): strong foundations support wealth retention in tangible real estate",
        "2) Mars as Bhumi Karaka: stable placement protects against structural disputes or legal encumbrances",
        "3) D4 (Chaturthamsa) Chart: confirms long-term stability and domestic contentment in acquired residence",
        "4) Transit Jupiter 5th/9th Aspect: brings timely financial liquidity and favorable mortgage terms",
      ],
      suggestedQuestions: [
        "Which direction or location is most auspicious for my residence?",
        "What is the exact auspicious astrological date for signing property deeds?",
        "Are there any planetary remedies to remove property acquisition hurdles?",
        "Does my chart support commercial real estate or residential?",
      ],
      offer: {
        title: "Special Offer: 12 Questions Pack",
        description: "Your question balance is ZERO. Top up with Gold Pack using promo code: QUICKGOLD",
        promoCode: "QUICKGOLD",
        discountPercent: 67,
        questionsCount: 12,
      },
    }
  }

  // 4. Career Direction / Work
  if (lowerQ.includes("career") || lowerQ.includes("job") || lowerQ.includes("work") || lowerQ.includes("business") || lowerQ.includes("direction")) {
    return {
      openingThought: `Your Moon sits in your house of career and standing, ${firstName}, so that is where your mind keeps returning. Let me see what the other planets and yogas are saying...`,
      thinkingSteps: [
        "Reading your birth chart",
        "Checking what happens right after Mar 2028",
      ],
      paragraphs: [
        `${firstName}, the headline of your chart is not Rahu and Ketu, it is that Mercury rules both your lagna and your tenth house, and sits in the fifth with Sun and Ketu.`,
        `Your work will be built on one specialised skill you teach yourself, not on a title anyone hands you. Research, analytics, data, or anything investigative suits you, because Jupiter and Saturn sit together in your eighth house and pull you toward depth rather than display.`,
        `Ketu in the fifth is why you start things with real intelligence and abandon them at seventy percent, convinced they are not good enough. That is the actual thing to fix.`,
        `Saturn mahadasha with Mercury antardasha runs to March 2028, and this is your skill-building window, not your recognition window. Finish and publish one piece of work before March 2028. Recognition arrives in the Saturn-Venus antardasha from April 2029.`,
        `Ardra Moon in your tenth makes you restless in a stable job. Shall I read whether you stay salaried?`,
      ],
      astrologyBehind: [
        "1) Mercury, house 5 and house 10 (birth chart): rules lagna and career; sits with Sun and Ketu in skill house",
        "2) Jupiter, Saturn, house 8 (birth chart): depth of investigation; paired pull away from public display",
        "3) Ketu, house 5 (birth chart): abandons projects at seventy percent; perfectionism mistaken for insufficiency",
        "4) Saturn/Mercury antardasha, Jul 2025 to Mar 2028: skill-building phase; publication must finish before close",
        "5) Saturn/Venus antardasha, Apr 2029 to Jun 2032: recognition arrives; work becomes visible to others",
        "6) Moon, Ardra, house 10 (birth chart): native restlessness in stable roles despite outer success",
      ],
      suggestedQuestions: [
        "Which dasha am I running?",
        "Will this nakshatra placement affect my relationships?",
        "What is my running mahadasha bringing over the next year?",
        "Which houses in my chart are the strongest?",
      ],
      offer: {
        title: "Special Offer: 12 Questions Pack",
        description: "Your question balance is ZERO. Top up with Gold Pack using promo code: QUICKGOLD",
        promoCode: "QUICKGOLD",
        discountPercent: 67,
        questionsCount: 12,
      },
    }
  }

  // 5. Default General Vaani Reading
  return {
    openingThought: `Synthesizing your ascendant lord and planetary strength, ${firstName}...`,
    thinkingSteps: [
      "Calculating Shadbala and Bhava Bala potentials",
      "Correlating current Gochara transits with natal planetary positions",
    ],
    paragraphs: [
      `${firstName}, looking into this matter, the immediate planetary configuration indicates a period of internal realignment before outward acceleration.`,
      `Your chart shows that while opportunities are forming around you, the ruling planetary cycle requires you to consolidate foundational details rather than rush into premature expansion.`,
      `Pay close attention to decisions made around the upcoming lunar phase. A supportive alignment between your 9th house of fortune and 11th house of gains will bring clarity and favorable mentorship.`,
      `Maintain discipline in your core daily habits, as Mars and Mercury together encourage sharp strategic thinking when grounded in structured execution.`,
    ],
    astrologyBehind: [
      "1) Ascendant Lord in supportive dignity: inner resilience and capacity to self-correct",
      "2) 9th House Jupiter aspect: protection during transitional career phases",
      "3) Moon Nakshatra lordship: emotional balance restored through structured routines",
      "4) Current Vimshottari period: phase focused on skill acquisition and professional reputation",
    ],
    suggestedQuestions: [
      "Which dasha am I running right now?",
      "What are my primary wealth yogas in the chart?",
      "Is relocation or travel indicated in the near future?",
      "Which gemstone or remedy aligns best with my Lagna?",
    ],
    offer: {
      title: "Special Offer: 12 Questions Pack",
      description: "Your question balance is ZERO. Top up with Gold Pack using promo code: QUICKGOLD",
      promoCode: "QUICKGOLD",
      discountPercent: 67,
      questionsCount: 12,
    },
  }
}

// ================= ASTROPEDIA CONTEXTUAL ENCYCLOPEDIA =================
function generateAstropediaResponse(question, lowerQ) {
  // 1. Lagna vs Moon Sign
  if (lowerQ.includes("lagna") && lowerQ.includes("moon")) {
    return {
      openingThought: "Consulting classical distinctions between Udaya Lagna (physical rising) and Chandra Lagna (perceptual mind)...",
      thinkingSteps: [
        "Referencing Brihat Parasara Hora Sastra, Chapter 4 on Lagna definitions",
        "Cross-referencing Phaladeepika on the supremacy of Chandra Rasi in Gochara",
      ],
      paragraphs: [
        `In classical Vedic astrology, **Udaya Lagna** (the Ascendant) and **Chandra Lagna** (the Moon Sign) serve two complementary functions in understanding an individual's destiny.`,
        `**Lagna** is the exact zodiac sign rising on the eastern horizon at the moment of birth. It represents the physical body, the incarnational vehicle, vitality, and the actual tangible events that unfold in the physical world. It changes roughly every two hours.`,
        `**Chandra Lagna (Moon Sign)** represents the mental constitution, subconscious conditioning, emotional perception, and how you experience the world internally. The Moon stays in one sign for approximately 2.5 days.`,
        `Classical treatises like *Phaladeepika* mandate that while the strength of events must be verified from the Lagna, all planetary transits (**Gochara**) must primarily be calculated from the natal Moon sign, because the mind experiences the impact before the physical reality manifests.`,
      ],
      astrologyBehind: [
        "1) Brihat Parasara Hora Sastra (BPHS), Ch. 4: Lagna establishes the 12 Bhavas and the physical manifestation of karma",
        "2) Phaladeepika, Ch. 26: Gochara (transits) are judged from the Moon because the Moon is the seat of mental perception",
        "3) Jataka Parijata: An auspicious event requires concordance between Lagna Lord and Moon Lord",
        "4) Sudarshana Chakra System: Comprehensive judgment requires reading chart from Lagna, Moon, and Sun simultaneously",
      ],
      suggestedQuestions: [
        "How is Chandra Kundli different from the Birth Chart?",
        "Why are Gochara transits calculated from the Moon?",
        "What happens when Lagna and Moon sign are the same?",
        "How does the Sun sign fit into the Sudarshana Chakra?",
      ],
      offer: null,
    }
  }

  // 2. Sade Sati
  if (lowerQ.includes("sade sati") || lowerQ.includes("shani") || lowerQ.includes("saturn transit")) {
    return {
      openingThought: "Evaluating classical principles of Shani Gochara over the 12th, 1st, and 2nd houses from natal Moon...",
      thinkingSteps: [
        "Consulting Brihat Samhita on Saturn's transit effects",
        "Evaluating Ashtakavarga bindu rules and Moorti Nirnaya criteria",
      ],
      paragraphs: [
        `**Sade Sati** is the 7.5-year transit of Saturn (Shani Bhagavan) through the 12th house, 1st house, and 2nd house relative to the natal Moon sign (Chandra Rasi). Each sign transit takes approximately 2.5 years (Dhaiya).`,
        `Classical Vedic astrology divides Sade Sati into three distinct phases:`,
        `• **Rising Phase (12th from Moon):** Financial restructuring, increased responsibilities, and letting go of outdated attachments.\n• **Peak Phase (1st / over Moon):** Deep psychological introspection, mental resilience tests, and restructuring personal identity.\n• **Setting Phase (2nd from Moon):** Family realignment, speech discipline, and long-term asset consolidation.`,
        `Crucially, classical texts emphasize that Sade Sati is **not** universally harmful. For Libra and Taurus ascendants (where Saturn is Yogakaraka), or when the Moon sign possesses high Ashtakavarga bindus (28+ points), Sade Sati frequently delivers enduring career summits and life-defining maturity.`,
      ],
      astrologyBehind: [
        "1) Brihat Samhita: Saturn's transit over the Moon disciplines the subconscious mind (Manas) through reality checks",
        "2) Ashtakavarga Bindus: Houses with 30+ bindus neutralize Saturn's harshness and turn transits productive",
        "3) Moorti Nirnaya: Gold, Silver, Copper, or Iron forms determined by Moon placement at transit ingress",
        "4) Classical Mitigation: Hanuman Chalisa recitation, Saturday lamp offerings, and selfless service (Seva)",
      ],
      suggestedQuestions: [
        "How are the three phases of Sade Sati calculated?",
        "What is Kantaka Shani and how does it differ from Sade Sati?",
        "Does Saturn transit produce good results for Libra Lagna?",
        "What are the best classical remedies for Saturn transits?",
      ],
      offer: null,
    }
  }

  // 3. Mangal Dosha (Kuja Dosha)
  if (lowerQ.includes("mangal") || lowerQ.includes("manglik") || lowerQ.includes("kuja")) {
    return {
      openingThought: "Examining classical definitions of Kuja Dosha and the 14 scriptural cancellation rules...",
      thinkingSteps: [
        "Reviewing Brihat Parasara Hora Sastra verses on Mars in 1, 2, 4, 7, 8, 12",
        "Evaluating classical Bhanga (cancellation) sutras from Muhurta Chintamani",
      ],
      paragraphs: [
        `**Mangal Dosha** (also known as Kuja Dosha or Bhauma Dosha) is an astrological condition formed when Mars occupies the **1st, 2nd, 4th, 7th, 8th, or 12th house** from the Lagna, Moon, or Venus.`,
        `In Vedic philosophy, Mars embodies heat (Tejas), assertion, and direct drive. When placed in relationship houses, this intense energy can create friction or impatience in marital partnerships if not harmoniously channeled.`,
        `However, classical astrological texts provide **extensive cancellation rules (Bhanga)**. Nearly 70% of apparent Manglik charts have classical cancellations, including:\n• Mars in Aries (1st), Scorpio (4th), Capricorn (7th/28° exalted), or Sagittarius (8th)\n• Jupiter casting a benefic aspect on Mars or occupying a Kendra\n• The partner having a complementary Mars or Saturn placement in the same houses\n• Maturity past the age of 28, when Mars's impulsive heat naturally stabilizes.`,
      ],
      astrologyBehind: [
        "1) Brihat Parasara Hora Sastra: Defines Kuja placement from Lagna, Moon, and Venus for marriage evaluation",
        "2) Muhurta Chintamani: Details the classical exceptions where Mars loses its malefic potency in own or exalted signs",
        "3) Kundli Milan (Ashtakoota): Mangal Dosha is checked independently of the 36 Guna score",
        "4) Classical Mitigation: Kumbh Vivah, Vishnu worship, and mindful cultivation of patience in communication",
      ],
      suggestedQuestions: [
        "What are the 14 classical cancellations of Manglik Dosha?",
        "Can a Manglik marry a Non-Manglik?",
        "Does Mangal Dosha lessen after age 28?",
        "How does Mars in the 7th house behave differently in Aries vs Cancer?",
      ],
      offer: null,
    }
  }

  // 4. Mahadasha & Antardasha
  if (lowerQ.includes("dasha") || lowerQ.includes("mahadasha") || lowerQ.includes("vimshottari")) {
    return {
      openingThought: "Consulting the classical 120-year Vimshottari Dasha system based on natal Moon Nakshatra...",
      thinkingSteps: [
        "Referencing BPHS, Chapters 46-48 on Dasha Phala and planetary periods",
        "Analyzing Lord-Sublord (Mahadasha-Antardasha) interaction dynamics",
      ],
      paragraphs: [
        `The **Vimshottari Dasha** is the paramount planetary period system in Vedic astrology, mapping an ideal human lifespan of 120 years across the 9 classical grahas.`,
        `The starting dasha at birth is determined strictly by the degree of the Moon in its birth **Nakshatra**. The fixed cycle of planetary rulers runs in the exact order:\n**Ketu (7 yrs) → Venus (20 yrs) → Sun (6 yrs) → Moon (10 yrs) → Mars (7 yrs) → Rahu (18 yrs) → Jupiter (16 yrs) → Saturn (19 yrs) → Mercury (17 yrs).**`,
        `Every Mahadasha is further divided into 9 sub-periods called **Antardashas** (or Bhuktis), then **Pratyantardashas**, and **Sookshma Dashas**. The overall outcome of any dasha is a synthesis of the Mahadasha Lord's natural signification, its house ownership, and its relationship with the reigning Antardasha Lord.`,
      ],
      astrologyBehind: [
        "1) Brihat Parasara Hora Sastra: Declares Vimshottari as the most dependable dasha system for Kali Yuga",
        "2) Dasha Lord Dignity: A planet in own sign or exaltation yields peak results during its operative sub-periods",
        "3) 6th, 8th, 12th Trika Relationships: Friction occurs when the Mahadasha and Antardasha lords sit in 6/8 from each other",
        "4) Kendra-Trikona Lords: Concurrently produce Rajayoga during their mutual antardashas",
      ],
      suggestedQuestions: [
        "How is the starting Mahadasha calculated from birth nakshatra?",
        "What is the significance of the 6-8 (Shadashtak) dasha relationship?",
        "Which planetary dasha is considered most spiritually transformative?",
        "How do Gochara transits interact with the running Dasha?",
      ],
      offer: null,
    }
  }

  // 5. Default General Astropedia Answer
  return {
    openingThought: "Consulting classical Vedic texts and astrological treatises...",
    thinkingSteps: [
      "Searching Brihat Parasara Hora Sastra and Phaladeepika archives",
      "Cross-referencing classical commentaries, planetary karakas, and house significations",
    ],
    paragraphs: [
      `In classical Vedic astrology (Jyotish), astrological principles are governed by the relationship between planetary significators (**Naisargika Karakas**), house rulers (**Bhava Adhipatis**), and elemental signs (**Rashis**).`,
      `According to the Parasara tradition, no single planetary placement should ever be read in isolation. Every graha functions as both a natural significator and a temporal ruler based on the rising ascendant. A planet's dignity is evaluated through its **Shadbala** (sixfold strength), combustion, retrogression, and aspectual angles (**Dristis**).`,
      `Classical treatises emphasize that apparent challenges in a chart are often balanced by classical cancellation rules (**Bhanga**), such as Kendra-Trikona lords forming auspicious **Raja Yogas** or Jupiter casting its benefic 5th, 7th, or 9th glance.`,
      `To apply these universal principles accurately to an individual life, these classical rules must be measured against exact birth coordinates, divisional charts (Vargas), and active **Vimshottari Dasha** timing.`,
    ],
    astrologyBehind: [
      "1) Brihat Parasara Hora Sastra (BPHS), Chapter 34: Raja Yogas, planetary dignity, and Bhava lordship",
      "2) Phaladeepika by Mantreswara, Chapter 6: Bhava results, planetary aspects, and strength indicators",
      "3) Jaimini Upadesa Sutras: Karaka analysis and Chara Dasha fundamentals",
      "4) Saravali of Kalyana Varma: Synthesis of Gochara transits against natal planetary placements",
    ],
    suggestedQuestions: [
      "What is the difference between Lagna and Moon Sign?",
      "How is Sade Sati calculated in Vedic astrology?",
      "What causes Mangal Dosha cancellation?",
      "How do Vimshottari Mahadasha cycles work?",
    ],
    offer: null,
  }
}
