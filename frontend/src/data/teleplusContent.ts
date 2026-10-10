/**
 * TelePlus Official Content Source of Truth
 * 
 * Sourced directly from the official TelePlus content specification document.
 * This canonical file supplies text and structured data across the entire application.
 */

export interface GameContentDetails {
  id: string;
  name: string;
  genre: string;
  competitionCycle: 'weekly' | 'monthly';
  overview: string;
  howToPlay: string[];
  skillFocus: string[];
  gameDuration?: string;
  gameDurationNotes?: string[];
  difficultyProgression?: { range: string; activeBalloons: string; speed: string; diameter: string }[];
  balloonColors?: { name: string; hex: string }[];
  visualDirection?: string;
  visualRule?: string;
  importantRules?: string[];
}

export const TELEPLUS_GAMES_CONTENT: GameContentDetails[] = [
  // 1.1 CANDY BLAST
  {
    id: 'candy-blast',
    name: 'Candy Blast',
    genre: 'Match-and-Clear Puzzle',
    competitionCycle: 'weekly',
    overview:
      'Candy Blast is a fast-paced match-and-clear puzzle game where players identify matching candies, create combinations, build combos, and achieve the highest possible score through accuracy, timing, planning, and consistency.\n\nThe game becomes progressively more challenging throughout the session, requiring players to make increasingly difficult decisions and maintain strong performance.',
    howToPlay: [
      'Start the game.',
      'Identify matching candies on the game board.',
      'Move or swap candies to create valid matches.',
      'Create larger combinations whenever possible.',
      'Use special combinations strategically.',
      'Maintain combos and avoid unnecessary mistakes.',
      'As the game progresses, the challenges become more difficult.',
      'Continue playing with increasing accuracy and precision to achieve a higher score.',
      'Your highest valid score for the applicable day contributes to the leaderboard according to the competition rules.',
    ],
    skillFocus: [
      'Reaction speed',
      'Accuracy',
      'Planning',
      'Precision',
      'Combo management',
      'Decision-making',
      'Consistency',
    ],
  },

  // 1.2 COLOR QUICK
  {
    id: 'color-rush',
    name: 'Color Quick',
    genre: 'Fast-Reaction Color Match',
    competitionCycle: 'weekly',
    overview:
      'Color Rush is a fast-reaction game that challenges players to recognize and respond to colors quickly and accurately.\n\nThe game begins with a meaningful challenge and progressively increases in speed and difficulty, requiring concentration and rapid decision-making.',
    howToPlay: [
      'Start the game.',
      'Watch the active color carefully.',
      'Identify the correct color.',
      'Tap or select the corresponding gaming control.',
      'Respond as quickly and accurately as possible.',
      'Avoid incorrect selections.',
      'Continue through increasingly difficult color challenges.',
      'Maintain fast and accurate reactions to achieve a higher score.',
    ],
    skillFocus: [
      'Reaction speed',
      'Color recognition',
      'Accuracy',
      'Concentration',
      'Timing',
      'Decision-making',
      'Consistency',
    ],
  },

  // 1.3 WORLD LEGENDS
  {
    id: 'world-legends',
    name: 'World Legends',
    genre: 'Knowledge & Word Puzzle',
    competitionCycle: 'weekly',
    overview:
      'World Legends is a knowledge-based skill game that challenges players through progressively more difficult questions, words, or knowledge challenges.\n\nPlayers must combine knowledge, accuracy, decision-making, and response speed to achieve a high score.',
    howToPlay: [
      'Start the game.',
      'Read and understand the presented challenge.',
      'Select or provide the correct response.',
      'Respond accurately and as quickly as possible.',
      'Continue through increasingly difficult challenges.',
      'Avoid incorrect answers.',
      'Maintain consistent performance throughout the session.',
      'Achieve the highest possible score through knowledge, accuracy, and speed.',
    ],
    skillFocus: [
      'Knowledge',
      'Accuracy',
      'Reaction time',
      'Decision-making',
      'Concentration',
      'Consistency',
    ],
  },

  // 1.4 POP PIANO
  {
    id: 'pop-piano',
    name: 'Pop Piano',
    genre: 'Timing & Rhythm Reaction',
    competitionCycle: 'monthly',
    overview:
      'Pop Piano is a timing and reaction-based piano game where players interact with piano elements at the correct time.\n\nThe game requires increasingly precise timing and concentration as gameplay progresses.',
    howToPlay: [
      'Start the game.',
      'Watch the incoming piano elements carefully.',
      'Tap the correct piano element at the correct time.',
      'Maintain accurate timing.',
      'Avoid incorrect taps and missed elements.',
      'Maintain combos where possible.',
      'As the session progresses, timing and patterns become more demanding.',
      'Continue performing accurately to achieve a higher score.',
    ],
    skillFocus: [
      'Timing',
      'Reaction speed',
      'Precision',
      'Rhythm',
      'Concentration',
      'Consistency',
    ],
    visualRule:
      'The existing black-and-white piano design remains unchanged. The green rope/cable must not be part of the game. The existing black lower failure boundary is the failure area.',
  },

  // 1.5 HILL CLIMB
  {
    id: 'hill-rider',
    name: 'Hill Climb',
    genre: 'Skill-Based 3D Physics Driving',
    competitionCycle: 'monthly',
    overview:
      'Hill Climb is a skill-based driving game where players control a vehicle across challenging terrain while maintaining balance, control, timing, and precision.\n\nThe game progressively increases in difficulty and requires increasingly careful vehicle control.',
    howToPlay: [
      'Start the Hill Climb session.',
      'Control the vehicle carefully across the terrain.',
      'Balance acceleration and vehicle movement.',
      'Adapt to increasingly difficult hills and terrain.',
      'Avoid losing control.',
      'Maintain the best possible driving performance.',
      'Continue for the complete 2-minute gameplay session.',
      'Achieve the highest possible score through skilled driving and consistent control.',
    ],
    gameDuration: 'Exactly 2 minutes / 120 seconds.',
    gameDurationNotes: [
      'The timer begins when gameplay starts.',
      'When 120 seconds is reached, the gameplay session ends.',
      'If the game is paused: Vehicle movement freezes, Physics freeze, Timer freezes.',
      'The remaining gameplay time is preserved.',
      'Paused time does not count toward the 2-minute session.',
    ],
    skillFocus: [
      'Vehicle control',
      'Balance',
      'Timing',
      'Precision',
      'Reaction',
      'Terrain management',
      'Consistency',
    ],
    visualDirection:
      'The existing white background direction should remain. The game may receive surrounding presentation polish, but it should not be converted into a dark game.',
  },

  // 1.6 POP COLOR
  {
    id: 'archery-strike', // mapped to pop balloon id in registry
    name: 'Pop Color',
    genre: 'Fast-Paced Reaction Balloon Pop',
    competitionCycle: 'monthly',
    overview:
      'Pop Balloon is a fast-paced reaction game where players must accurately pop moving colored balloons while avoiding incorrect taps and missed balloons.\n\nThe game becomes progressively faster and more demanding, requiring excellent reaction speed, precision, target tracking, and concentration.',
    howToPlay: [
      'Start the game.',
      'Complete the 3-2-1-GO countdown.',
      'Multiple colored balloons appear immediately.',
      'Tap the actual colored balloons accurately.',
      'Balloons progressively become faster and more challenging.',
      'Avoid tapping empty areas.',
      'Avoid tapping anything that is not an actual colored balloon.',
      'Do not allow a balloon to reach the bottom unpopped.',
      'Maintain accurate reactions and combos.',
      'Continue playing throughout the 2-minute session.',
    ],
    difficultyProgression: [
      { range: '0–10 seconds', activeBalloons: '3–5 active balloons', speed: '300–360 px/s', diameter: '55–65 px diameter' },
      { range: '10–30 seconds', activeBalloons: '4–5 active balloons', speed: '360–410 px/s', diameter: '50–60 px diameter' },
      { range: '30–60 seconds', activeBalloons: '4–6 active balloons', speed: '410–460 px/s', diameter: '46–56 px diameter' },
      { range: '60–90 seconds', activeBalloons: '5–6 active balloons', speed: '460–510 px/s', diameter: '44–52 px diameter' },
      { range: '90–110 seconds', activeBalloons: '5–7 active balloons', speed: '500–550 px/s', diameter: '42–50 px diameter' },
      { range: '110–120 seconds', activeBalloons: '5–7 active balloons', speed: '520–560 px/s', diameter: '40–48 px diameter' },
    ],
    balloonColors: [
      { name: 'Red', hex: '#FF3B30' },
      { name: 'Blue', hex: '#007AFF' },
      { name: 'Green', hex: '#34C759' },
      { name: 'Yellow', hex: '#FFD60A' },
      { name: 'Purple', hex: '#AF52DE' },
      { name: 'Orange', hex: '#FF9500' },
      { name: 'Pink', hex: '#FF2D55' },
    ],
    skillFocus: [
      'Reaction speed',
      'Accuracy',
      'Precision',
      'Target tracking',
      'Timing',
      'Concentration',
      'Consistency',
    ],
  },

  // 1.7 DAMA (3D Draughts / Checkers)
  {
    id: 'dama',
    name: 'Dama',
    genre: 'Championship 3D Draughts / Checkers',
    competitionCycle: 'monthly',
    overview:
      'Dama is a premium single-player 3D draughts game against an advanced tactical computer AI.\n\nFeaturing an authentic elevated perspective, rich wooden textures, cylindrical pieces with beveled edges, mandatory captures, multi-jumps, and king crowning across progressive difficulty tiers.',
    howToPlay: [
      'Select your white pieces to reveal legal diagonal moves and jump opportunities.',
      'Tap any highlighted dark destination square to move or capture.',
      'Jumps and multi-captures are strictly mandatory whenever available.',
      'Reach the opposite back rank to crown your piece into a powerful 4-way King.',
      'Capture all computer pieces or restrict the opponent from making legal moves to win.',
    ],
    skillFocus: [
      'Strategy',
      'Tactics',
      'Forward planning',
      'Position evaluation',
      'Board control',
      'Trap detection',
      'Endgame mastery',
    ],
    visualDirection:
      'Elevated 3D perspective on a rich mahogany and dark walnut table, beveled board edges, realistic lighting, and tactile wooden piece interactions.',
  },

  // 1.8 SOCCER PING PONG (3D Sports Arcade)
  {
    id: 'soccer-ping-pong',
    name: 'Soccer Ping Pong',
    genre: '3D Sports Arcade & Teqball',
    competitionCycle: 'monthly',
    overview:
      'Soccer Ping Pong is a fast-paced 3D football table tennis game combining rapid ball control, sweet-spot power strikes, and sharp spin volleys across 20 progressive difficulty stages.\n\nFeaturing 6 authentic stadium tiers ranging from daylight training grounds to night floodlight arenas and the ultimate World Championship Stadium.',
    howToPlay: [
      'Slide your striker paddle left and right across the baseline to intercept incoming shots.',
      'Time your returns precisely as the ball enters the glowing Sweet-Spot zone for high-velocity power shots.',
      'Target bullseye rings, bounce off spring bumpers, and maneuver around moving defender obstacles.',
      'Maintain continuous rally streaks to multiply your score and earn 3 gold stars.',
      'Keep your 3 soccer balls in play to complete each stage and unlock subsequent championship levels.',
    ],
    skillFocus: [
      'Reflex speed',
      'Timing precision',
      'Sweet-spot accuracy',
      'Trajectory prediction',
      'Combo maintenance',
      'Spin control',
      'Hand-eye coordination',
    ],
    visualDirection:
      'Realistic 3D football, manicured turf lawn stripes, center net, dynamic floodlight beams, stadium grandstands, and pyrotechnic victory celebrations.',
  },

  // 1.9 SORT (3D Color-Sorting Puzzle)
  {
    id: 'sorting-balls',
    name: 'Sort',
    genre: '3D Color-Sorting Puzzle',
    competitionCycle: 'weekly',
    overview:
      'Sorting Balls is a relaxing and mentally engaging 3D color sorting puzzle game featuring 40 progressive stages.\n\nSort vibrant glossy 3D spheres between transparent glass test cylinders until every tube contains exclusively matching colors. Features realistic glass reflections, smooth trajectory arcs, and strict progressive locking.',
    howToPlay: [
      'Tap any tube to select its top ball, which lifts and hovers above the tube opening.',
      'Tap an available destination tube to transfer the floating ball.',
      'A ball can only be placed into an empty tube or onto a matching ball color.',
      'Sort all 4 balls of each color into their dedicated tube to solve the level.',
      'Use the Undo button to reverse your last move, or tap +1 to add an extra empty tube.',
    ],
    skillFocus: [
      'Spatial planning',
      'Color perception',
      'Step-ahead prediction',
      'Problem solving',
      'Pattern recognition',
      'Logical deduction',
    ],
    visualDirection:
      'Deep navy/charcoal arena (#171B26), white top application bar, warm orange tactile controls, transparent 3D glass sorting tubes with silver rims, and glossy high-saturation spherical balls.',
  },

  // EMOJI SORT (3D Emoji Sorting Tournament Puzzle)
  {
    id: 'emoji-sorting-ball',
    name: 'Emoji Sort',
    genre: '3D Emoji Sorting Tournament Puzzle',
    competitionCycle: 'weekly',
    overview:
      'Emoji Sorting Ball is a tournament 3D puzzle challenge featuring 40 progressive stages.\n\nSort stylized 3D vinyl emoji spheres between color-coded crystal tubes until every cylinder contains exclusively identical emoji types. Features multi-ball sequential transfers, par moves scoring, and tournament leaderboard tracking.',
    howToPlay: [
      'Tap any tube to select and lift its top emoji sphere (or contiguous matching group).',
      'Tap an available destination tube with matching emoji or empty space to transfer.',
      'Contiguous matching emojis transfer together in an efficient sequential wave.',
      'Solve all tubes with 4 matching emojis to complete the level and claim tournament bonuses.',
      'Use Undo, Hints, or Add Extra Buffer Tube when facing complex layouts.',
    ],
    skillFocus: [
      'Visual discrimination',
      'Emoji recognition',
      'Move sequence planning',
      'Combinatorial optimization',
      'Buffer tube management',
    ],
    visualDirection:
      'Midnight violet arena (#060411), 8-tube vibrant mandatory palette (Coral, Aqua, Royal Violet, Golden Amber, Emerald, Rose Pink, Electric Blue, Lime), stylized 3D vinyl emoji spheres, and tactile tournament controls.',
  },
];

// =========================================================================
// 2. FAQ CONTENT (Section 12 in Document)
// =========================================================================
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const TELEPLUS_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is GameSwiper?',
    answer:
      'GameSwiper is the premier mobile gaming entertainment portal for EthioTelecom users, offering instant access to high-quality skill-based games with zero ads or coin limits.',
  },
  {
    id: 'faq-2',
    question: 'What is the subscription price?',
    answer:
      'GameSwiper costs 2 Birr per day. To subscribe, send OK to 7198. It provides unlimited access to all games without ads, coins, or interruptions.',
  },
  {
    id: 'faq-3',
    question: 'How do I subscribe to GameSwiper?',
    answer:
      'To subscribe, send OK to 7198 from your mobile device. GameSwiper costs 2 Birr per day and gives you full access to all games.',
  },
  {
    id: 'faq-4',
    question: 'How do I cancel or stop my subscription?',
    answer:
      'You can stop or cancel your GameSwiper subscription at any time by sending STOP to 7198.',
  },
  {
    id: 'faq-5',
    question: 'Are all games free to play?',
    answer:
      'Yes! All 27 games on GameSwiper are 100% free to play. Once subscribed, you have unlimited access to every single game without coin requirements or entry fees.',
  },
  {
    id: 'faq-6',
    question: 'How do I track my high scores?',
    answer:
      'Your personal records and best scores are automatically tracked. You can view all your personal best scores directly in the Profile tab under "My High Scores".',
  },
  {
    id: 'faq-7',
    question: 'How is my privacy protected?',
    answer:
      'To ensure complete user privacy, all player phone numbers (MSISDNs) are masked across all screens (for example: 091*****890). Your full mobile number is never publicly exposed.',
  },
  {
    id: 'faq-8',
    question: 'How do I track my games and high scores?',
    answer:
      'Open the Profile tab and tap "My Games" or "My High Scores" to view your personal best scores alongside a direct Play button.',
  },
  {
    id: 'faq-9',
    question: 'What if I encounter gameplay or connection issues?',
    answer:
      'GameSwiper is built for low-latency web play. If your connection drops momentarily, your local personal best scores are preserved. For further assistance, access Help & Support from your Profile tab.',
  },
];

// =========================================================================
// 3. HELP & SUPPORT CONTENT (Section 13 in Document)
// =========================================================================
export interface SupportTopic {
  id: string;
  title: string;
  content: string[];
  steps?: string[];
  note?: string;
}

export const TELEPLUS_SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: 'sub-support',
    title: 'Subscription Support',
    content: [
      'GameSwiper costs 2 Birr per day.',
      'Subscription shortcode: 7198 (Send OK to 7198).',
      'For subscription-related problems, provide:',
      '• Mobile number',
      '• Approximate subscription time',
      '• Any confirmation message received',
      '• Description of the problem',
    ],
  },
  {
    id: 'unsub-support',
    title: 'Unsubscription Support',
    content: [
      'To unsubscribe from GameSwiper, send STOP to 7198.',
      'If the service does not stop after sending STOP to 7198, provide:',
      '• Mobile number',
      '• Approximate time sent',
      '• Any error received',
    ],
  },
  {
    id: 'charging-support',
    title: 'Charging Support',
    content: [
      'GameSwiper subscription fee is 2 Birr/day.',
      'For charging-related issues, provide:',
      '• Mobile number',
      '• Approximate charging time',
      '• Relevant confirmation message',
      '• Description of the issue',
    ],
  },
  {
    id: 'game-access-support',
    title: 'Game Access & Performance',
    content: ['If a game does not load or perform correctly, follow these troubleshooting steps:'],
    steps: [
      'Check your internet connection.',
      'Reload the game.',
      'Restart the session.',
      'Try again.',
      'Contact support if the issue continues.',
    ],
  },
  {
    id: 'score-issues',
    title: 'Score Issues',
    content: [
      'When reporting a score issue, provide:',
      '• Mobile number',
      '• Game name',
      '• Approximate gameplay time',
      '• Description of what happened',
      '• Any available screenshot or evidence',
    ],
  },
  {
    id: 'leaderboard-issues',
    title: 'Leaderboard Issues',
    content: [
      'For leaderboard questions, provide:',
      '• Mobile number',
      '• Competition period',
      '• Game played',
      '• Approximate score',
      '• Date of gameplay',
    ],
  },
  {
    id: 'prize-support',
    title: 'Prize Support',
    content: [
      'Prize winners may need to complete verification before receiving a prize.',
      'Support may request information necessary to verify:',
      '• Participation',
      '• Mobile number',
      '• Score',
      '• Ranking',
      '• Identity',
      '• Other relevant eligibility information',
    ],
  },
  {
    id: 'technical-problems',
    title: 'Technical Problems',
    content: [
      'Technical issues may include:',
      '• Game not loading',
      '• Game freezing',
      '• Gameplay interruption',
      '• Score not displaying correctly',
      '• Leaderboard not updating',
      '• Subscription access problems',
      '• Other service errors',
      'Provide as much detail as possible when contacting support.',
    ],
  },
  {
    id: 'account-security',
    title: 'Account & Security',
    content: [
      'Users should protect their mobile account and should not share sensitive authentication information with other people.',
      'Do not attempt to manipulate game scores, access other users’ accounts, or interfere with the service.',
    ],
    note: 'Important: A GameSwiper support phone number/contact address should only be added when the official support contact is provided. Do not invent one.',
  },
];

// =========================================================================
// 4. SUBSCRIPTION CONTENT (Sections 9 & 10 in Document)
// =========================================================================
export interface SubscriptionPackage {
  package: string;
  price: string;
  subscribeCmd: string;
  unsubscribeCmd: string;
  smsBody: string;
  unsubBody: string;
  recipient: string;
}

export const TELEPLUS_SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
  {
    package: 'Daily',
    price: '2 Birr/day',
    subscribeCmd: 'Send OK to 7198',
    unsubscribeCmd: 'Send STOP to 7198',
    smsBody: 'OK',
    unsubBody: 'STOP',
    recipient: '7198',
  },
];

export const TELEPLUS_SUBSCRIPTION_INFO = {
  ussdInfo: 'Subscription is available by sending OK to 7198.',
  afterSubscription:
    'After successful subscription, the user can access GameSwiper games. GameSwiper costs 2 Birr per day. Subscription charges and renewal operate daily.',
  renewal:
    'The daily package renews at 2 Birr per day. Users should ensure sufficient mobile balance is available for renewal.',
  unsubscription:
    'Users can cancel or stop the service at any time by sending STOP to 7198.',
};

// =========================================================================
// 5. PRICING CONTENT (Section 11 in Document)
// =========================================================================
export const TELEPLUS_TOP10_PRIZES = [
  { rank: '1st', prize: '50,000 ETB' },
  { rank: '2nd', prize: '40,000 ETB' },
  { rank: '3rd', prize: '35,000 ETB' },
  { rank: '4th', prize: '30,000 ETB' },
  { rank: '5th', prize: '25,000 ETB' },
  { rank: '6th', prize: '20,000 ETB' },
  { rank: '7th', prize: '15,000 ETB' },
  { rank: '8th', prize: '10,000 ETB' },
  { rank: '9th', prize: '5,000 ETB' },
  { rank: '10th', prize: '3,000 ETB' },
];

export const TELEPLUS_TOTAL_PRIZE_VALUE = '233,000 ETB per applicable competition period.';

// =========================================================================
// 6. TERMS & CONDITIONS CONTENT (Section 14 in Document)
// =========================================================================
export interface TermSection {
  number: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  table?: { col1: string; col2: string }[];
}

export const TELEPLUS_TERMS_SECTIONS: TermSection[] = [
  {
    number: '14.1',
    title: 'Introduction',
    paragraphs: [
      'These Terms & Conditions govern the use of the GameSwiper gaming service.',
      'By accessing or using GameSwiper, the user agrees to comply with these Terms & Conditions and the applicable service rules.',
    ],
  },
  {
    number: '14.2',
    title: 'Service',
    paragraphs: [
      'GameSwiper provides mobile gaming entertainment, skill-based games, competitions, leaderboards, and prize opportunities.',
      'The available games and features may be updated from time to time.',
    ],
  },
  {
    number: '14.3',
    title: 'Eligibility',
    paragraphs: [
      'Users must meet the eligibility requirements applicable to the GameSwiper service.',
      'Additional eligibility conditions may apply to particular games, competitions, promotions, or prizes.',
    ],
  },
  {
    number: '14.4',
    title: 'Registration and Account',
    paragraphs: [
      'Users may be required to register or provide the information necessary to access the service.',
      'Users are responsible for ensuring that information provided during registration is accurate.',
    ],
  },
  {
    number: '14.5',
    title: 'Subscription',
    paragraphs: [
      'GameSwiper provides:',
    ],
    bulletPoints: [
      'Daily subscription — 2 Birr/day',
      'Subscribe by sending OK to 7198',
      'Full, unlimited access to all games without coin restrictions.',
    ],
  },
  {
    number: '14.6',
    title: 'Renewal',
    paragraphs: [
      'Subscription renews daily at 2 Birr per day according to service terms.',
      'Users should ensure that sufficient balance is available where required for renewal.',
    ],
  },
  {
    number: '14.7',
    title: 'Unsubscription',
    paragraphs: [
      'Users may stop their subscription by sending STOP to 7198 at any time without penalty.',
    ],
  },
  {
    number: '14.8',
    title: 'Games',
    paragraphs: [
      'GameSwiper currently provides skill-based games including Candy Blast, Color Rush, World Legends, Pop Piano, Hill Climb, Pop Balloon, and other featured titles.',
      'Each game has its own gameplay mechanics and rules.',
    ],
  },
  {
    number: '14.9',
    title: 'Skill-Based Gameplay',
    paragraphs: [
      'GameSwiper games are designed around player skill.',
      'Performance may depend on factors such as reaction, timing, accuracy, precision, and decision-making.',
    ],
  },
  {
    number: '14.10',
    title: 'Game Duration',
    paragraphs: [
      'Applicable games may have specific session durations.',
      'Other game durations are determined by the applicable game configuration.',
    ],
  },
  {
    number: '14.11',
    title: 'Scoring',
    paragraphs: [
      'Scores are calculated using game-specific performance factors, combos, and multipliers.',
      'Only genuine player skill determines ranking.',
    ],
  },
  {
    number: '14.12',
    title: 'Daily Gameplay & Scoring',
    paragraphs: [
      'For each game played, the user’s personal best score is recorded and tracked.',
      'All 27 games offer unlimited gameplay attempts with immediate score recording and personal achievement tracking.',
    ],
  },
  {
    number: '14.13',
    title: 'Free Catalog Access',
    paragraphs: [
      'All 27 games are 100% free to play for active subscribers to shortcode 7198.',
      'There are no paywalls, entry fees, or coin deductions to enjoy any title.',
    ],
  },
  {
    number: '14.14',
    title: 'Skill-Based Gaming Experience',
    paragraphs: [
      'Every game is purely skill-based, allowing subscribers to test reflexes, problem-solving, and strategy in a safe, ad-free mobile environment.',
    ],
  },
  {
    number: '14.15',
    title: 'FairPlay Integrity',
    paragraphs: [
      'GameSwiper maintains strict fair play guidelines across all games.',
      'Automated bots, scripts, and score manipulation are prohibited.',
    ],
  },
  {
    number: '14.16',
    title: 'Account Verification',
    paragraphs: [
      'GameSwiper verifies active EthioTelecom mobile line subscriptions via shortcode 7198 to ensure seamless, secure access.',
    ],
  },
  {
    number: '14.17',
    title: 'Winner Selection and Ties',
    paragraphs: [
      'Winners are determined according to the applicable leaderboard and competition rules.',
      'Where multiple users have identical scores or rankings, applicable tie-breaking or verification procedures may be used.',
    ],
  },
  {
    number: '14.18',
    title: 'Fair Play',
    paragraphs: [
      'Users must not:',
    ],
    bulletPoints: [
      'Use bots',
      'Automate gameplay',
      'Manipulate scores',
      'Exploit software errors',
      'Use unauthorized software',
      'Modify the game',
      'Interfere with the service',
      'Attempt to obtain an unfair advantage',
      'Access or manipulate another user’s account',
      'Circumvent technical controls',
    ],
  },
  {
    number: '14.19',
    title: 'Disqualification',
    paragraphs: [
      'GameSwiper may invalidate scores, remove leaderboard entries, withhold prizes, suspend participation, or take other appropriate action where there is evidence of rule violations or unfair gameplay.',
    ],
  },
  {
    number: '14.20',
    title: 'Service Availability',
    paragraphs: [
      'GameSwiper aims to provide continuous service but availability may be affected by maintenance, technical issues, network conditions, system upgrades, third-party dependencies, or other circumstances outside reasonable control.',
    ],
  },
  {
    number: '14.21',
    title: 'Updates',
    paragraphs: [
      'GameSwiper may modify games, game mechanics, scoring, features, competitions, prize structures, or service functionality.',
      'Applicable updates may be communicated through appropriate service channels.',
    ],
  },
  {
    number: '14.22',
    title: 'Data and Privacy',
    paragraphs: [
      'User information may be processed as necessary to provide the service, manage subscriptions, operate games, maintain leaderboards, prevent abuse, provide support, and perform prize verification.',
      'Personal information should be handled in accordance with applicable privacy requirements and GameSwiper privacy practices.',
    ],
  },
  {
    number: '14.23',
    title: 'Charges and Mobile Data',
    paragraphs: [
      'Subscription charges are separate from mobile data charges unless otherwise specified.',
      'Users are responsible for applicable data/network costs associated with accessing the service.',
    ],
  },
  {
    number: '14.24',
    title: 'Intellectual Property',
    paragraphs: [
      'GameSwiper service content, software, graphics, game designs, interfaces, branding, and other protected materials remain the property of their respective rights holders.',
      'Users may not reproduce, modify, distribute, reverse engineer, or commercially exploit protected service content without authorization.',
    ],
  },
  {
    number: '14.25',
    title: 'Liability',
    paragraphs: [
      'GameSwiper is not responsible for circumstances outside its reasonable control, including certain network, connectivity, device, technical, or third-party service issues.',
      'Nothing in these Terms should exclude rights or obligations that cannot legally be excluded.',
    ],
  },
  {
    number: '14.26',
    title: 'Changes to Terms',
    paragraphs: [
      'These Terms & Conditions may be updated when necessary.',
      'Users should review the latest version of the Terms before continuing to use the service.',
    ],
  },
  {
    number: '14.27',
    title: 'Suspension or Termination',
    paragraphs: [
      'GameSwiper may suspend or terminate access where necessary, including for terms violations, fair-play violations, abuse, security concerns, technical reasons, or service discontinuation.',
    ],
  },
  {
    number: '14.28',
    title: 'Complaints and Disputes',
    paragraphs: [
      'Users should first contact the applicable GameSwiper support channel to resolve service-related complaints.',
      'Applicable laws and dispute-resolution requirements will apply.',
    ],
  },
  {
    number: '14.29',
    title: 'Governing Law',
    paragraphs: [
      'The service and these Terms are subject to applicable Ethiopian laws and regulations.',
      'Specific legal provisions should be finalized through the appropriate legal/compliance review before publication.',
    ],
  },
  {
    number: '14.30',
    title: 'Acceptance',
    paragraphs: [
      'By registering for, subscribing to, or using GameSwiper, the user confirms that they have read and accepted the applicable Terms & Conditions.',
    ],
  },
];

// =========================================================================
// 7. PRIVACY POLICY CONTENT (Section 14.24 & GameSwiper Privacy Practices)
// =========================================================================
export const TELEPLUS_PRIVACY_POLICY = {
  title: 'GameSwiper Privacy Policy',
  summary:
    'GameSwiper is committed to protecting user privacy and handling personal information responsibly, transparently, and securely in accordance with applicable laws and telecommunications standards.',
  sections: [
    {
      title: 'Data Collection & Processing',
      paragraphs: [
        'User information is processed strictly as necessary to provide the gaming service, manage subscriptions, operate skill-based games, calculate leaderboards, prevent unfair gameplay, provide customer support, and complete required prize verifications.',
      ],
      bulletPoints: [
        'Mobile phone number (MSISDN) for subscription management and authentication.',
        'Game session scores, accuracy metrics, and gameplay timestamps.',
      ],
    },
    {
      title: 'Masked Identity & Public Display Protection',
      paragraphs: [
        'To protect subscriber identity, phone numbers are masked across all views (e.g., 091*****890). Your full mobile number is never publicly displayed.',
      ],
    },
    {
      title: 'Zero Unnecessary Device Permissions',
      paragraphs: [
        'GameSwiper operates within your browser or mobile web container with zero invasive device permissions. The service does not request access to device contacts, microphone, camera, or external file storage.',
      ],
    },
    {
      title: 'Data Security & Fair Play Integrity',
      paragraphs: [
        'All score submissions and subscription commands are transmitted over secure TLS encrypted connections. Access controls and audit logging prevent unauthorized access and data manipulation.',
      ],
    },
    {
      title: 'Regulatory Compliance & Legal Review Status',
      paragraphs: [
        'This Privacy Policy reflects the current data processing practices of the GameSwiper gaming service. Official additional regulatory compliance provisions will be published upon conclusion of scheduled regulatory reviews.',
      ],
    },
  ],
};
