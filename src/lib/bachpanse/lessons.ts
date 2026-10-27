export interface StoryCard {
  emoji?: string;
  title: string;
  text: string;
  art: "coin" | "piggy" | "scale" | "target" | "shield" | "wallet" | "cart";
}

export interface QuizQuestion {
  q: string;
  options: [string, string, string];
  answer: number;
  explain: string;
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  cards: StoryCard[];
  quiz: QuizQuestion[];
}

export interface LearnModule {
  id: number;
  title: string;
  emoji: string;
  blurb: string;
  lessons: Lesson[];
}

export const MODULES: LearnModule[] = [
  {
    id: 1,
    title: "What is money",
    emoji: "🪙",
    blurb: "Where money comes from and what it does",
    lessons: [
      {
        id: "m1l1",
        title: "Money then and now",
        emoji: "🪙",
        cards: [
          { title: "Before money", text: "Long ago people swapped things — 3 mangoes for 1 chicken! That was called barter.", art: "coin" },
          { title: "Coins arrive", text: "Swapping was hard. So people made coins from metal that everyone agreed had value.", art: "coin" },
          { title: "Notes and digital", text: "Today we have notes, coins and even money on your parent's phone. All of it is money.", art: "wallet" },
          { title: "Money's job", text: "Money is a tool: it helps us buy, save and plan. It only works when people trust it.", art: "shield" },
        ],
        quiz: [
          { q: "What did people use before coins?", options: ["Barter — swapping things", "Credit cards", "Bitcoin"], answer: 0, explain: "Barter came first: goods were swapped directly for other goods." },
          { q: "Why were coins invented?", options: ["They look nice", "Barter was hard to agree on", "To collect taxes"], answer: 1, explain: "Coins gave everyone one agreed way to pay." },
          { q: "Money on a phone is…", options: ["Not real money", "Still money", "A game"], answer: 1, explain: "Digital money is real money stored electronically." },
        ],
      },
      {
        id: "m1l2",
        title: "What money can do",
        emoji: "💡",
        cards: [
          { title: "Spend", text: "Money buys things you need today — food, books, a bus ride.", art: "cart" },
          { title: "Save", text: "Money kept aside can grow into something bigger later.", art: "piggy" },
          { title: "Share", text: "Money can help others too — a gift, or help for someone in need.", art: "target" },
          { title: "Choose", text: "Every rupee can only do one job at a time. You choose its job!", art: "scale" },
        ],
        quiz: [
          { q: "Money kept aside for later is called…", options: ["Spending", "Saving", "Losing"], answer: 1, explain: "Saving means keeping money instead of spending it now." },
          { q: "Can one rupee do two jobs at once?", options: ["Yes", "No", "Only on weekends"], answer: 1, explain: "Each rupee is spent or saved once — that's why choices matter." },
          { q: "Which is NOT a use of money?", options: ["Buying food", "Saving for a goal", "Erasing itself"], answer: 2, explain: "Money can't erase itself — it just moves from place to place." },
        ],
      },
      {
        id: "m1l3",
        title: "Where money comes from",
        emoji: "🌱",
        cards: [
          { title: "Work earns money", text: "Grown-ups earn money by working. Effort becomes earnings.", art: "coin" },
          { title: "Your pocket money", text: "Parents give pocket money so you can practise handling money safely.", art: "wallet" },
          { title: "Rewards", text: "Doing a good job — like a chore — can earn a small reward too.", art: "target" },
          { title: "It's limited", text: "Money doesn't grow on trees. It's limited, so we use it wisely.", art: "scale" },
        ],
        quiz: [
          { q: "Most grown-up money comes from…", options: ["Working", "Finding it", "Printing it"], answer: 0, explain: "Work and effort are how people earn money." },
          { q: "Pocket money is a chance to…", options: ["Practise money skills", "Buy anything ever", "Never count"], answer: 0, explain: "It's a safe way to learn earning, spending and saving." },
          { q: "Money is…", options: ["Unlimited", "Limited", "Fake"], answer: 1, explain: "Money is limited, so planning helps." },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Needs vs wants",
    emoji: "⚖️",
    blurb: "Telling the must-haves from the nice-to-haves",
    lessons: [
      {
        id: "m2l1",
        title: "What is a need?",
        emoji: "🍎",
        cards: [
          { title: "Needs keep you going", text: "Food, water, a home, school things — needs are what you truly must have.", art: "scale" },
          { title: "Needs come first", text: "Smart money habits start with covering needs before anything else.", art: "target" },
          { title: "Same rupee, two choices", text: "A samosa is a want; a bus fare to school is a need.", art: "cart" },
          { title: "Ask yourself", text: "\"What happens if I don't get this?\" If the answer is trouble, it's probably a need.", art: "coin" },
        ],
        quiz: [
          { q: "Which is a need?", options: ["A new video game", "School notebooks", "Extra stickers"], answer: 1, explain: "School supplies are needed for learning." },
          { q: "Needs should be bought…", options: ["Last", "Never", "First"], answer: 2, explain: "Cover needs before spending on wants." },
          { q: "A good test for a need is…", options: ["What happens without it?", "Is it shiny?", "Is it cheap?"], answer: 0, explain: "If skipping it causes real trouble, it's a need." },
        ],
      },
      {
        id: "m2l2",
        title: "Wants are okay too",
        emoji: "🎮",
        cards: [
          { title: "Wants make life fun", text: "Wants — games, treats, toys — aren't bad. They just come after needs.", art: "cart" },
          { title: "Plan your wants", text: "You can enjoy wants by planning a small amount for them.", art: "wallet" },
          { title: "The waiting trick", text: "Want something? Wait a day. Still want it? Plan for it!", art: "piggy" },
          { title: "Balance", text: "Happy money = needs covered + some planned fun.", art: "scale" },
        ],
        quiz: [
          { q: "Wants are…", options: ["Bad and banned", "Fine, if planned", "Always needs"], answer: 1, explain: "Wants are fine — plan a little for them after needs." },
          { q: "The waiting trick means…", options: ["Buying instantly", "Waiting before buying", "Never buying"], answer: 1, explain: "Waiting helps you see if you really want it." },
          { q: "Happy money means…", options: ["Needs + planned fun", "All wants", "No spending"], answer: 0, explain: "Cover needs, then enjoy some planned wants." },
        ],
      },
      {
        id: "m2l3",
        title: "Spotting tricks in ads",
        emoji: "📢",
        cards: [
          { title: "Ads want your money", text: "Ads are made to make wants feel like needs. Don't fall for it!", art: "shield" },
          { title: "\"Limited time!\"", text: "Urgency makes you buy fast. Real needs can wait 24 hours.", art: "coin" },
          { title: "\"Everyone has it!\"", text: "Someone else's want isn't yours. Your plan matters more.", art: "scale" },
          { title: "You decide", text: "Next ad you see, ask: need or want? Then decide calmly.", art: "target" },
        ],
        quiz: [
          { q: "Ads try to make wants feel like…", options: ["Needs", "Boring", "Illegal"], answer: 0, explain: "That's how ads get you to spend fast." },
          { q: "\"Buy now, limited stock!\" is a…", options: ["Urgency trick", "Savings plan", "Rule"], answer: 0, explain: "Urgency pushes quick decisions. Take your time." },
          { q: "If a friend has something…", options: ["You must too", "You decide if YOU want it", "It's a need"], answer: 1, explain: "Your plan and your needs come first." },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Saving",
    emoji: "🐷",
    blurb: "Making small amounts grow into goals",
    lessons: [
      {
        id: "m3l1",
        title: "Why save?",
        emoji: "🐷",
        cards: [
          { title: "Big things need saving", text: "A cricket bat, a gift for Mom — big wishes come from small savings.", art: "piggy" },
          { title: "Pay yourself first", text: "When money arrives, put some aside BEFORE spending the rest.", art: "coin" },
          { title: "A little adds up", text: "₹50 a week is ₹200 a month — that's ₹2,400 a year!", art: "target" },
          { title: "Emergencies", text: "Savings also help when something unexpected happens.", art: "shield" },
        ],
        quiz: [
          { q: "When should you save?", options: ["After spending all", "Before spending", "Never"], answer: 1, explain: "Pay yourself first — save a bit as soon as money arrives." },
          { q: "₹50 every week for a year is about…", options: ["₹260", "₹2,400", "₹50"], answer: 1, explain: "Small steady savings grow big: 50 × 52 ≈ 2,600." },
          { q: "Savings also help with…", options: ["Surprises", "Nothing", "Ads"], answer: 0, explain: "An emergency fund handles the unexpected." },
        ],
      },
      {
        id: "m3l2",
        title: "Goal power",
        emoji: "🎯",
        cards: [
          { title: "Name your goal", text: "A goal with a name — \"New cricket bat\" — is easier to hit.", art: "target" },
          { title: "Know the target", text: "Find out the price. Now you know exactly how much to save.", art: "scale" },
          { title: "Track progress", text: "Watching your ring fill up keeps you going. Progress is fun!", art: "piggy" },
          { title: "Celebrate", text: "Reaching a goal feels amazing — enjoy it, you earned it!", art: "coin" },
        ],
        quiz: [
          { q: "A named goal helps because…", options: ["It's easier to stay motivated", "It's a rule", "Ads like it"], answer: 0, explain: "A clear goal keeps you saving towards something real." },
          { q: "First step for a goal?", options: ["Guess", "Find the price", "Buy now"], answer: 1, explain: "Knowing the target amount tells you how long to save." },
          { q: "Tracking progress is…", options: ["Motivating", "Pointless", "Hard"], answer: 0, explain: "Seeing progress makes saving fun." },
        ],
      },
      {
        id: "m3l3",
        title: "Where savings live",
        emoji: "🏦",
        cards: [
          { title: "The jar system", text: "Three jars: Save, Spend, Share. Split money in when it arrives.", art: "wallet" },
          { title: "Bank accounts", text: "Banks keep money safe and can add a little extra called interest.", art: "piggy" },
          { title: "Growing money", text: "Interest means your money earns money just for staying put.", art: "coin" },
          { title: "Start small", text: "You don't need much to start — the habit matters most.", art: "target" },
        ],
        quiz: [
          { q: "The three jars are…", options: ["Save, Spend, Share", "Eat, Play, Sleep", "Big, Small, Tiny"], answer: 0, explain: "A simple way to plan every rupee's job." },
          { q: "Interest is…", options: ["A fee", "Money your money earns", "A tax"], answer: 1, explain: "Banks pay interest for keeping money with them." },
          { q: "To start saving you need…", options: ["A lot of money", "A small start and a habit", "A job"], answer: 1, explain: "Small, steady habits beat big rare deposits." },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Budgeting",
    emoji: "📋",
    blurb: "Giving every rupee a plan",
    lessons: [
      {
        id: "m4l1",
        title: "What is a budget?",
        emoji: "📋",
        cards: [
          { title: "A plan for money", text: "A budget says where each rupee will go BEFORE the month starts.", art: "wallet" },
          { title: "In and out", text: "Write what comes in (pocket money) and what you'll spend.", art: "scale" },
          { title: "Three buckets", text: "Needs, wants, savings — give each bucket its share.", art: "target" },
          { title: "It's yours", text: "A budget isn't a punishment. It's your money's map.", art: "coin" },
        ],
        quiz: [
          { q: "A budget is…", options: ["A money plan", "A tax", "A bill"], answer: 0, explain: "It's a plan made before spending starts." },
          { q: "A simple budget has buckets…", options: ["Needs, wants, savings", "Left, right", "Big, small"], answer: 0, explain: "Three buckets cover everything simply." },
          { q: "Make a budget…", options: ["Before the month", "After running out", "Never"], answer: 0, explain: "Plan first, then follow the plan." },
        ],
      },
      {
        id: "m4l2",
        title: "Making your plan",
        emoji: "✏️",
        cards: [
          { title: "List your money in", text: "Pocket money ₹1,000? That's your monthly total to plan.", art: "coin" },
          { title: "Cover needs", text: "Bus fare, notebooks — give needs their share first.", art: "scale" },
          { title: "Save a slice", text: "Put 10–20% towards your goal before fun money.", art: "piggy" },
          { title: "Enjoy the rest", text: "Whatever's left is guilt-free want money!", art: "cart" },
        ],
        quiz: [
          { q: "Plan your money in order…", options: ["Needs, savings, wants", "Wants, needs, savings", "Random"], answer: 0, explain: "Needs first, savings next, wants with what remains." },
          { q: "A good savings share is…", options: ["10–20%", "0%", "100%"], answer: 0, explain: "A slice for goals, room for fun." },
          { q: "Leftover money after planning is…", options: ["Guilt-free fun money", "Forgetting money", "Lost"], answer: 0, explain: "Planned spending = zero guilt." },
        ],
      },
      {
        id: "m4l3",
        title: "Sticking to it",
        emoji: "🧭",
        cards: [
          { title: "Check weekly", text: "A 2-minute weekly check keeps your plan on track.", art: "target" },
          { title: "Slips happen", text: "Overspent once? Fix it next week. Don't give up.", art: "shield" },
          { title: "Adjust", text: "Prices change. Update your plan when life changes.", art: "scale" },
          { title: "Feel the win", text: "Month ends with money left? You won. Do it again!", art: "coin" },
        ],
        quiz: [
          { q: "How often should you check your budget?", options: ["Weekly (2 min)", "Never", "Yearly"], answer: 0, explain: "Small frequent checks catch slips early." },
          { q: "If you overspend once…", options: ["Quit budgeting", "Adjust and continue", "Hide it"], answer: 1, explain: "Slips are normal — adjust and keep going." },
          { q: "Money left at month's end means…", options: ["Your plan worked", "You wasted it", "Bad luck"], answer: 0, explain: "That's a budgeting win!" },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Smart spending",
    emoji: "🛒",
    blurb: "Getting the most from every rupee",
    lessons: [
      {
        id: "m5l1",
        title: "Compare before buying",
        emoji: "🔍",
        cards: [
          { title: "Same thing, two prices", text: "Shops charge different prices. Checking two shops can save real money.", art: "scale" },
          { title: "Price per unit", text: "Bigger packs aren't always cheaper — compare the per-item price.", art: "cart" },
          { title: "Quality counts", text: "The cheapest thing that breaks twice is expensive.", art: "shield" },
          { title: "Ask first", text: "Before buying, ask: do I have something like this already?", art: "coin" },
        ],
        quiz: [
          { q: "Comparing prices means…", options: ["Checking more than one shop", "Buying instantly", "Ignoring price"], answer: 0, explain: "A quick comparison often saves a lot." },
          { q: "Bigger packs are…", options: ["Always cheaper", "Not always cheaper", "Never cheaper"], answer: 1, explain: "Always check the per-item price." },
          { q: "The cheapest item can be…", options: ["The best deal", "Costly if it breaks", "Always worth it"], answer: 1, explain: "Quality matters — cheap-but-broken is expensive." },
        ],
      },
      {
        id: "m5l2",
        title: "Spending traps",
        emoji: "⚠️",
        cards: [
          { title: "In-app purchases", text: "Games are built to make spending feel tiny. ₹199 many times adds up fast!", art: "cart" },
          { title: "Auto-renewals", text: "Subscriptions quietly renew. Check what you're paying monthly.", art: "wallet" },
          { title: "Peer pressure", text: "Buying to impress friends costs twice — money and your own plan.", art: "shield" },
          { title: "Pause rule", text: "About to spend? Pause, breathe, count to ten, then decide.", art: "coin" },
        ],
        quiz: [
          { q: "Small game purchases…", options: ["Add up fast", "Are free forever", "Don't matter"], answer: 0, explain: "Many small spends become one big spend." },
          { q: "Subscriptions can…", options: ["Auto-renew quietly", "Pause themselves", "Pay you"], answer: 0, explain: "Review what renews every month." },
          { q: "The pause rule helps you…", options: ["Spend faster", "Decide calmly", "Win games"], answer: 1, explain: "A pause beats an impulse buy." },
        ],
      },
      {
        id: "m5l3",
        title: "Value > price",
        emoji: "💎",
        cards: [
          { title: "What's it worth to YOU?", text: "A ₹200 book you read beats a ₹200 toy you ignore.", art: "scale" },
          { title: "Cost per use", text: "₹500 shoes worn 100 times = ₹5 per wear. Great deal!", art: "coin" },
          { title: "Experiences", text: "Money on memories — a trip, a game with family — often lasts longer.", art: "target" },
          { title: "Happy spending", text: "Smart spending isn't no spending. It's spending that you still feel good about later.", art: "piggy" },
        ],
        quiz: [
          { q: "Cost per use helps you see…", options: ["Real value", "Shop names", "Taxes"], answer: 0, explain: "Divide price by uses to find real value." },
          { q: "Which ₹200 is smarter?", options: ["A book you'll read", "A toy you'll ignore", "Same"], answer: 0, explain: "Value depends on what you'll actually use." },
          { q: "Smart spending means…", options: ["Never spending", "Spending you feel good about", "Spending all"], answer: 1, explain: "It's about feeling good later, not spending zero." },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Staying safe with money",
    emoji: "🛡️",
    blurb: "Scams, OTPs and keeping money safe",
    lessons: [
      {
        id: "m6l1",
        title: "What is an OTP?",
        emoji: "🔐",
        cards: [
          { title: "A secret key", text: "An OTP is a one-time code that unlocks a payment. It's as good as cash!", art: "shield" },
          { title: "NEVER share it", text: "No bank, no shop, NO ONE will ever ask for your OTP — not even 'police' or 'bank staff'.", art: "coin" },
          { title: "Scammers pretend", text: "\"You won a prize! Share this code.\" That's a scam. Delete and tell an adult.", art: "scale" },
          { title: "Tell an adult", text: "If anything feels odd about money, tell your parents right away.", art: "target" },
        ],
        quiz: [
          { q: "Who can ask for your OTP?", options: ["Nobody — ever", "The bank", "A prize caller"], answer: 0, explain: "Real banks never ask for OTPs. Anyone who does is a scammer." },
          { q: "An OTP is like…", options: ["A spare key to your money", "A game code", "A coupon"], answer: 0, explain: "Sharing it is like handing over your wallet." },
          { q: "Something feels odd about a payment. You…", options: ["Share the OTP", "Tell a parent", "Ignore it"], answer: 1, explain: "Always tell a trusted adult first." },
        ],
      },
      {
        id: "m6l2",
        title: "Spotting scams",
        emoji: "🎣",
        cards: [
          { title: "Too good = not true", text: "Free phones, easy money, surprise prizes — if it sounds too good, it's a hook.", art: "shield" },
          { title: "Strangers asking", text: "Unknown calls or messages asking for money details are warnings.", art: "coin" },
          { title: "Fake urgency", text: "\"Act now or lose it!\" Pressure is a scammer's favourite tool.", art: "scale" },
          { title: "Check with adults", text: "Verify anything about money with a parent before acting.", art: "target" },
        ],
        quiz: [
          { q: "\"You won ₹1 lakh! Send ₹500 fee.\" This is…", options: ["A scam", "Real luck", "A bank offer"], answer: 0, explain: "Real prizes never ask you to pay first." },
          { q: "Pressure to act fast is…", options: ["A scam sign", "Good service", "Normal"], answer: 0, explain: "Urgency stops you from thinking — that's the trick." },
          { q: "Unknown caller asks for card details. You…", options: ["Share them", "Hang up and tell an adult", "Negotiate"], answer: 1, explain: "Never share details with unknown callers." },
        ],
      },
      {
        id: "m6l3",
        title: "Your data is yours",
        emoji: "🧑‍🔐",
        cards: [
          { title: "Personal info", text: "Your name, school, address and photos are private. Think before sharing.", art: "shield" },
          { title: "Strong PINs", text: "No 1234 or your birthday. Mix numbers only you would guess.", art: "coin" },
          { title: "Ask permission", text: "Before signing up for any app or game, ask your parents.", art: "scale" },
          { title: "You're in charge", text: "Knowing how to stay safe makes you the boss of your money and data.", art: "target" },
        ],
        quiz: [
          { q: "A strong PIN is…", options: ["1234", "Not your birthday", "Your name"], answer: 1, explain: "Easy-to-guess PINs are weak PINs." },
          { q: "Before joining a new app, you should…", options: ["Ask your parents", "Share your address", "Pay a fee"], answer: 0, explain: "Check with a trusted adult first." },
          { q: "Your school and address are…", options: ["Public info", "Private info", "Ad material"], answer: 1, explain: "Personal details stay private unless a parent says it's okay." },
        ],
      },
    ],
  },
];

export const BADGES: { id: string; name: string; emoji: string; description: string }[] = [
  { id: "first-lesson", name: "First Steps", emoji: "🌟", description: "Complete your first lesson" },
  { id: "module-1", name: "Money Basics", emoji: "🪙", description: "Finish the 'What is money' module" },
  { id: "streak-5", name: "On Fire", emoji: "🔥", description: "Learn 5 days in a row" },
  { id: "quiz-ace", name: "Quiz Ace", emoji: "🧠", description: "Score 3/3 on any quiz" },
  { id: "goal-reached", name: "Goal Getter", emoji: "🏆", description: "Reach a savings goal" },
  { id: "practice-pro", name: "Practice Pro", emoji: "🎮", description: "Score 8+ in Shop smart" },
  { id: "module-all", name: "Money Master", emoji: "👑", description: "Finish all 6 modules" },
  { id: "saver-500", name: "Super Saver", emoji: "💪", description: "Save ₹1,000 or more in goals" },
];

export const DAILY_CHALLENGES: { q: string; options: [string, string, string]; answer: number; explain: string }[] = [
  { q: "Your bus fare to school is a…", options: ["Need", "Want", "Scam"], answer: 0, explain: "Getting to school is essential — that's a need." },
  { q: "Best first move when you get ₹100?", options: ["Spend it all", "Save a part first", "Lend it to a stranger"], answer: 1, explain: "Pay yourself first, then spend." },
  { q: "A caller asks for the OTP your parent just got. This is…", options: ["A scam", "A bank", "A friend"], answer: 0, explain: "Nobody legitimate ever asks for an OTP." },
  { q: "Which helps you compare prices?", options: ["Buying at the first shop", "Checking two shops", "Guessing"], answer: 1, explain: "A quick comparison often saves money." },
  { q: "Waiting a day before buying a want is called…", options: ["The waiting trick", "Procrastination", "Losing money"], answer: 0, explain: "It helps you see if you truly want it." },
  { q: "The three jars are Save, Spend and…", options: ["Share", "Shout", "Sleep"], answer: 0, explain: "Save, Spend, Share — a classic money plan." },
];
