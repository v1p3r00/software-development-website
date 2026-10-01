---
title: "Agentic AI: How Does an AI Plan and Carry Out a Task on Its Own?"
description: "How agentic AI plans tasks, uses tools, remembers context, learns from feedback and knows when a human needs to step in."
tags: [agentic-ai, ai-agent, automation, ai, business]
date: 2026-10-27 08:00
image: /articles/agentic-ai/share.jpg
---

## AI that does more than answer

In the previous article, we looked at AI agents: systems that can do more than generate text by using tools and performing actions.

**Agentic AI is a broader concept.** It describes AI systems that can pursue a goal by planning what to do, using tools, observing the results and adapting their approach.

Microsoft, for example, describes agents as systems that can act autonomously, plan and loop through multiple steps, use tools and maintain state or memory. ([Microsoft](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility-ai-agent))

The idea can be summarised quite simply:

> **Instead of telling the AI exactly what to do at every step, you give it a goal, tools and boundaries, and it works out the path between them.**

---

## What happens with a simple chatbot?

A traditional chatbot might work like this:

```text
Question
  ↓
AI model
  ↓
Answer
```

If you ask:

> “Write a short proposal for building a website.”

the model can generate the text.

But it may not know:

- who the customer is,
- which prices you use,
- whether you have capacity,
- what you proposed previously,
- whether it is allowed to send the email,
- or whether a CRM record should be created.

That requires more than text generation.

---

## Agentic AI turns a goal into a process

An agentic system looks more like this:

```text
Goal
 ↓
Plan
 ↓
Gather information
 ↓
Use a tool
 ↓
Check the result
 ↓
Plan the next step
 ↓
Use another tool
 ↓
Check again
 ↓
Task complete / ask a human
```

OpenAI's agent documentation describes this as an agent loop: the model decides what to do, calls tools when necessary, receives their results and continues until it reaches a genuine stopping point. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/running-agents))

**This feedback loop is one of the defining characteristics of agentic AI.**

---

## 1. Planning – breaking a goal into steps

Imagine asking an AI system:

> “Prepare a market analysis for next month.”

That is not one operation.

An agent might break it down into something like:

```text
1. Define the market
2. Gather relevant data
3. Identify major competitors
4. Compare pricing
5. Analyse changes
6. Prepare a summary
7. Verify sources
8. Produce the final report
```

The agent does not necessarily have to follow exactly this plan.

**One of the important differences from traditional automation is that the next step can depend on what happened in the previous step.**

If a data source is unavailable, the system might try another one. If important information is missing, it may search for it elsewhere.

---

## 2. Tool use – connecting the AI to the real world

A model can only work with the information available to it.

An agent can use tools.

These might include:

- web search,
- CRM systems,
- ERP systems,
- databases,
- email,
- calendars,
- file systems,
- webshop APIs,
- GitHub,
- internal company applications.

Google Cloud lists tools as one of the core building blocks of agents because they define what an agent can actually do beyond generating text. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents))

This means that an agent's capabilities are not determined only by the model behind it.

Just as important are:

**What data can it access? Which tools can it use? And which actions are those tools allowed to perform?**

---

## 3. Memory – maintaining state

An agent working on a longer task needs to know where it is and what has already happened.

Different forms of memory and state can be used.

### Short-term memory

The current conversation or task context.

### Working memory

Intermediate results collected during the task.

### Long-term memory

Information deliberately retained for future tasks.

For example, a sales agent might remember a customer's preferred products or previously agreed commercial terms.

Google Cloud distinguishes long-term knowledge and memory from the short-term context required for an ongoing task. ([Google Cloud](https://cloud.google.com/resources/core-concepts-ai-agents))

**Memory does not mean storing everything forever.** Stored information still needs access controls, retention rules and appropriate privacy protections.

---

## 4. The feedback loop – what happens when something goes wrong?

This is one of the most interesting parts of agentic AI.

A simple automation might look like:

```text
Step 1
 ↓
Step 2
 ↓
Step 3
 ↓
Done
```

If step two fails, the workflow usually stops.

An agentic system can instead receive the failure, interpret it and decide whether another approach makes sense.

```text
Task
 ↓
Tool call
 ↓
Error
 ↓
AI evaluates the result
 ↓
Alternative?
 ├── Yes → another tool / another attempt
 └── No → human intervention
```

Anthropic describes agents in a similar self-directed loop: they plan, act, observe the result, adjust their approach and repeat. ([Anthropic](https://www.anthropic.com/research/trustworthy-agents))

That does not mean an agent will always find the correct solution.

**The ability to retry or adapt is not a guarantee of correctness.**

---

## A practical business example: a customer service agent

Consider an online shop.

A customer writes:

> “My order still hasn't arrived. Can you tell me what happened?”

A simple chatbot could provide a generic response.

An agentic system could investigate the case itself.

### 1. Understand the problem

The agent identifies the request as a delivery issue.

### 2. Find the order

It queries the webshop database:

```text
Customer → #48152
Order → #48152
Status → shipped
Courier → XYZ
Tracking → 123456
```

### 3. Check the courier

The agent calls the courier API.

The result:

```text
Last update:
Package arrived at regional depot
Delay: 2 days
```

### 4. Adapt the response

The agent now knows that the package has not simply disappeared. It is still moving but is delayed.

### 5. Check company policy

Suppose the company policy says that a two-day delay does not automatically qualify for compensation.

The agent should therefore not invent a refund.

### 6. Respond to the customer

The customer receives a specific answer based on the actual order data.

If the package is lost or compensation is required, however, the agent can stop.

```text
Normal delay
→ automatic response

Lost package
→ human support

Refund
→ approval required
```

**A useful agent is not one that can do everything. It is one that knows how far it is allowed to go.**

---

## Human-in-the-loop – humans do not disappear

One common misconception is that agentic AI means removing people from the process.

In many business applications, the opposite is more sensible.

The agent can handle low-risk work while humans make decisions at critical points.

Google Cloud explicitly documents a human-in-the-loop pattern for situations requiring human oversight, subjective judgement or approval of critical actions. ([Google Cloud](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system))

For example:

```text
Find information
→ AI

Prepare report
→ AI

Draft quotation
→ AI

Send high-value quotation
→ Human

Issue refund
→ Human
```

The human does not need to review every action. They only need to intervene where their judgement adds meaningful value.

---

## Guardrails – boundaries around the agent

Greater autonomy also means greater risk.

That is why agentic systems need guardrails: rules and checks that define what the agent can and cannot do.

OpenAI's documentation separates input, output and tool-level guardrails and also supports human approval for high-risk actions. ([OpenAI](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals))

Typical controls include:

- maximum number of steps,
- maximum cost,
- approved tool lists,
- access permissions,
- blocked operations,
- human approval points,
- time limits,
- audit logs.

Microsoft similarly recommends least-privilege access, approval for sensitive actions and reliable mechanisms for pausing or stopping agents. ([Microsoft](https://learn.microsoft.com/en-us/security/zero-trust/sfi/manage-agentic-risk))

A useful architecture therefore looks like:

```text
                ┌───────────────┐
                │   AI Agent    │
                └───────┬───────┘
                        ↓
                 Guardrails
                        ↓
                  Tool access
                        ↓
               External systems
                        ↓
               Human approval
                when required
```

The important point is that **the model should not be the only security boundary**.

Authentication, authorisation, deterministic rules and standard software security controls still matter.

---

## Where does agentic AI work well today?

Not every problem needs an agent.

Agentic systems are particularly interesting for tasks that:

- involve multiple steps,
- move between several systems,
- contain unstructured information,
- require repeated decisions,
- but still operate within clear boundaries.

### Software development

Agents can search a codebase, modify files, run tests and use the results to decide what to change next.

Anthropic describes Claude Code as an agent that can autonomously write, debug and edit code. ([Anthropic](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents))

### Research and analysis

An agent can gather information from several sources, organise the findings and prepare an initial analysis.

### Customer service

For suitable cases, an agent can combine information from orders, customer records and delivery systems and resolve the issue without requiring a human for every step.

### Internal business processes

Examples include document research, report preparation, collecting information and updating CRM records.

---

## Where does it still struggle?

Agentic AI is not magic.

A 2025 Microsoft Research report on human-in-the-loop agentic systems notes that agents are becoming increasingly capable at complex, multi-step tasks but still fall short of human-level performance across many domains, including computer use, software development and research. ([Microsoft Research](https://www.microsoft.com/en-us/research/publication/magentic-ui-report/))

Agentic systems can be particularly difficult when:

- the goal is ambiguous,
- reliable data is unavailable,
- the task depends heavily on subjective judgement,
- errors are very expensive,
- actions cannot easily be undone,
- or the agent has too many permissions.

A bad answer from a chatbot is one problem.

A bad chain of decisions from an agent can create several connected problems.

---

## Agentic AI or traditional automation?

Not every process should become an agent.

If the process is always the same:

```text
Input
→ validation
→ database
→ email
→ done
```

a traditional deterministic workflow is often simpler and more predictable.

If the process looks more like:

```text
Task arrives
→ interpret it
→ find information
→ choose between several possible paths
→ use the result to decide what happens next
→ ask a human in some cases
```

then an agentic approach may make sense.

**Agents are not replacements for workflows. They are useful when part of the workflow cannot be fully specified in advance.**

---

## How should a business get started?

A company does not need to build a completely autonomous agent from day one.

A safer approach is to increase autonomy gradually.

```text
1. AI suggests
   ↓
2. AI prepares
   ↓
3. AI uses tools
   ↓
4. AI executes low-risk actions automatically
   ↓
5. Human approves critical actions
   ↓
6. More parts become autonomous
```

The system should also be evaluated continuously.

Anthropic's 2026 guidance on agent evaluations highlights why agents are harder to evaluate than simple model responses: they operate over multiple turns, call tools, modify state and adapt based on intermediate results. ([Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents))

**The goal is not maximum autonomy. The goal is the right amount of autonomy.**

---

## So where does agentic AI actually belong?

Agentic AI becomes particularly useful when a task is too complex for a simple chatbot but still structured enough to operate safely with clear permissions, rules and human oversight.

The important question for a business is therefore not simply whether it should “use agents”.

It is **which tasks should be handled by AI, which should remain deterministic, and where human judgement should remain part of the process.**

**softwaredevelopment.hu — AI, automation and custom software solutions for businesses.**

---

## Sources

- OpenAI: [A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- OpenAI: [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
- OpenAI: [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)
- Anthropic: [Trustworthy agents in practice](https://www.anthropic.com/research/trustworthy-agents)
- Anthropic: [Our framework for developing safe and trustworthy agents](https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents)
- Anthropic: [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- Google Cloud: [Core concepts of AI agents](https://cloud.google.com/resources/core-concepts-ai-agents)
- Google Cloud: [Choose a design pattern for your agentic AI system](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system)
- Microsoft: [AI agent shared responsibility model](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility-ai-agent)
- Microsoft Research: [Magentic-UI: Towards Human-in-the-loop Agentic Systems](https://www.microsoft.com/en-us/research/publication/magentic-ui-report/)
