---
description: Ask questions about your meetings - silently fetches context and answers directly.
---
Answer questions about meetings using Fathom recordings. The agent will silently fetch relevant meetings and transcripts, then directly answer your question.

<UserRequest>
  $ARGUMENTS
</UserRequest>

**How It Works**
- Ask any question about your meetings naturally
- The agent silently identifies relevant meetings and fetches transcripts
- You get a direct, thorough answer - no intermediate output

**Example Questions**
- "What did we decide about the API design in yesterday's meeting?"
- "What were Carter's concerns about the deployment?"
- "What action items came out of the planning session?"
- "What was discussed about performance in the last engineering sync?"

**Explicit Operations** (when you want to see the data)
- "List my meetings from last week" → Shows meeting list
- "Show me the transcript from [meeting]" → Shows full transcript
- "What meetings did I have with [person]?" → Shows filtered meeting list

**Guidelines**
1. Be specific about topics, people, or timeframes for better results
2. If the agent can't find a relevant meeting, provide more context
3. For quotes or exact wording, ask explicitly: "What exactly did X say about Y?"
