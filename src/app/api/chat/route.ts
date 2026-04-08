import { NextRequest, NextResponse } from 'next/server'

const AGENT_RESPONSES: Record<string, string> = {
  default: `Great question! I'm an AI assistant powered by AgentHub. Let me help you with that.

Based on your request, here are my thoughts:

1. **Analysis**: I've considered your input carefully and can provide detailed insights.
2. **Recommendation**: Based on current best practices, I'd suggest approaching this systematically.
3. **Next Steps**: Feel free to ask follow-up questions or provide more context so I can give you a more tailored response.

Would you like me to elaborate on any of these points?`,

  marketing: `Here's a comprehensive marketing plan outline for your startup:

**1. Market Research & Positioning**
- Identify your target audience segments
- Analyze competitor strategies and gaps
- Define your unique value proposition

**2. Brand Strategy**
- Develop a compelling brand story
- Create consistent visual identity
- Establish brand voice and messaging guidelines

**3. Digital Marketing Channels**
- Content marketing (blog, videos, podcasts)
- Social media strategy (LinkedIn, Twitter, Instagram)
- Email marketing campaigns
- SEO optimization

**4. Growth Tactics**
- Referral programs
- Partnership opportunities
- Paid advertising (Google Ads, social ads)
- Community building

**5. Metrics & KPIs**
- Customer acquisition cost (CAC)
- Return on ad spend (ROAS)
- Conversion rates
- Brand awareness metrics

Would you like me to dive deeper into any of these areas?`,

  market_analysis: `Here's my analysis of current market trends:

**Key Trends Shaping the Market:**

📈 **AI & Automation**
- AI adoption is accelerating across all industries
- Automation tools are becoming more accessible to SMBs
- Generative AI is transforming content creation and customer service

🌐 **Digital Transformation**
- Cloud-first strategies becoming the default
- Remote work infrastructure continues to evolve
- Cybersecurity spending is at an all-time high

🌱 **Sustainability & ESG**
- Consumer demand for sustainable products is growing
- ESG reporting is becoming mandatory in many regions
- Green tech investments are surging

📱 **Consumer Behavior**
- Mobile commerce continues to dominate
- Personalization expectations are higher than ever
- Social commerce is blending discovery and purchasing

💡 **Strategic Implications:**
Organizations that embrace these trends early will gain competitive advantages. I recommend focusing on AI integration and sustainability initiatives as key priorities.

Shall I analyze any specific industry or trend in more detail?`,

  research: `I'd be happy to help you write a research paper! Here's a structured approach:

**1. Research Paper Framework**

**Title & Abstract**
- Craft a compelling, specific title
- Write a 150-250 word abstract summarizing key findings

**Introduction**
- Establish the research context and significance
- State clear research questions or hypotheses
- Outline the paper's structure

**Literature Review**
- Survey existing scholarship on the topic
- Identify research gaps your paper addresses
- Build the theoretical framework

**Methodology**
- Describe your research design and approach
- Explain data collection and analysis methods
- Address ethical considerations

**Findings & Discussion**
- Present results clearly with supporting evidence
- Interpret findings in context of existing literature
- Discuss limitations and implications

**Conclusion**
- Summarize key contributions
- Suggest directions for future research

**2. Writing Tips**
- Use clear, concise academic language
- Cite sources properly and consistently
- Revise for clarity, coherence, and flow

What's your specific research topic? I can help develop the content further.`,

  business: `Let me review your business strategy with this comprehensive framework:

**Strategic Assessment Framework:**

**1. Vision & Mission Alignment**
- Is your vision inspiring and clear?
- Does your mission guide daily decisions?
- Are strategic goals SMART and time-bound?

**2. Market Position**
- Competitive advantage analysis
- Market share trends and growth potential
- Customer segmentation and targeting

**3. Financial Health**
- Revenue growth trajectory
- Unit economics and profitability path
- Cash flow management and runway

**4. Operational Excellence**
- Key process efficiencies
- Technology stack assessment
- Team capabilities and gaps

**5. Risk Assessment**
- Market risks and mitigation strategies
- Operational vulnerabilities
- Regulatory considerations

**6. Growth Strategy**
- Short-term (0-6 months): Quick wins and stabilization
- Medium-term (6-18 months): Scaling and optimization
- Long-term (18+ months): Market expansion and innovation

**Key Questions to Consider:**
- What differentiates you from competitors?
- Are you focused on the right customer segments?
- Is your unit economics sustainable at scale?

Please share specific details about your business, and I'll provide a more targeted analysis!`,
}

function generateResponse(message: string, agentId: string | null, chatHistory: Array<{ role: string; content: string }>): string {
  const lowerMessage = message.toLowerCase()

  // Check if this is the first message in a chat (no history or only the user's current message)
  const isFirstMessage = chatHistory.length <= 1

  if (!isFirstMessage) {
    // For follow-up messages, provide contextual responses
    if (lowerMessage.includes('more detail') || lowerMessage.includes('elaborate') || lowerMessage.includes('tell me more')) {
      return `Absolutely! Let me expand on that point.

**Additional Details:**

When we dive deeper into this topic, several important nuances emerge:

- **Practical Application**: The key is to implement these strategies incrementally, measuring impact at each stage.
- **Industry Examples**: Companies like Stripe, Notion, and Linear have successfully applied similar approaches with measurable results.
- **Common Pitfalls**: Avoid the trap of trying to do everything at once. Prioritize based on impact and effort.

Would you like me to provide specific examples or walk through a step-by-step implementation plan?`
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('great') || lowerMessage.includes('helpful')) {
      return `You're welcome! I'm glad I could help. 😊

If you have any more questions or need further assistance, don't hesitate to ask. I'm here to help you succeed!`
    }

    if (lowerMessage.includes('how') || lowerMessage.includes('step')) {
      return `Here's a step-by-step approach:

**Step 1: Foundation**
- Start with a clear definition of your goals
- Gather necessary resources and stakeholder alignment
- Set measurable milestones

**Step 2: Execution**
- Begin with the highest-impact activities
- Iterate quickly based on feedback
- Document learnings as you go

**Step 3: Optimization**
- Analyze results against your milestones
- Identify what worked and what didn't
- Refine your approach for the next iteration

**Step 4: Scaling**
- Standardize successful processes
- Train team members
- Automate where possible

Each step builds on the previous one, so it's important to validate before moving forward. Would you like me to elaborate on any particular step?`
    }

    // Generic follow-up
    return `That's a great follow-up question! Based on our conversation so far, here are my thoughts:

The key insight here is that context matters. What works in one situation may need adjustment in another. I'd recommend:

1. **Assess your current state** - Where are you now vs. where you want to be?
2. **Identify blockers** - What's preventing progress?
3. **Prioritize actions** - What will have the biggest impact?
4. **Measure and iterate** - Track progress and adjust course

Feel free to share more details so I can provide a more specific recommendation!`
  }

  // First message routing based on content
  if (lowerMessage.includes('marketing') || lowerMessage.includes('startup') || lowerMessage.includes('campaign')) {
    return AGENT_RESPONSES.marketing
  }
  if (lowerMessage.includes('market trend') || lowerMessage.includes('market analysis') || lowerMessage.includes('trend')) {
    return AGENT_RESPONSES.market_analysis
  }
  if (lowerMessage.includes('research') || lowerMessage.includes('paper') || lowerMessage.includes('academic')) {
    return AGENT_RESPONSES.research
  }
  if (lowerMessage.includes('business') || lowerMessage.includes('strategy') || lowerMessage.includes('review')) {
    return AGENT_RESPONSES.business
  }

  return AGENT_RESPONSES.default
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, agentId, chatHistory } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

    const response = generateResponse(
      message,
      agentId || null,
      chatHistory || []
    )

    return NextResponse.json({
      message: response,
      agentId: agentId || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
