---
title: "Multi-agent systems: why several AI agents can beat one super-agent"
description: "One AI agent or several? Learn how specialised agents, orchestration and delegation work, what they cost and when a single agent is enough."
tags: [multi-agent, ai-agent, orchestration, ai, mcp]
date: 2026-10-31 08:00
image: /articles/multi-agent-systems/share.jpg
---

## Why would you need more than one AI agent?

Once you have an AI agent, a natural question follows:

> “Why not simply give it every tool and let it handle everything?”

At first, that sounds sensible.

One super-agent could:

- handle customer support,
- manage invoices,
- use the CRM,
- analyse documents,
- write code,
- prepare reports,
- send emails.

One AI to rule them all.

The problem is that this approach can become increasingly difficult to manage.

Too many instructions.

Too many tools.

Too many permissions.

Too many possible paths.

And eventually, it becomes harder to understand why the system made a particular decision.

A **multi-agent system** takes a different approach: several agents specialise in narrower tasks and work together.

OpenAI's current documentation describes two core patterns: a manager agent can call specialists as tools, or one agent can hand a task over to another specialist. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

**The goal is not to have as many agents as possible. The goal is to give each task to the right component.**

---

## What is a multi-agent system?

A simple agent:

```text
User
↓
AI agent
↓
Tools
↓
Result
````

A multi-agent system:

```text
                  ┌── Sales agent
                  │
User → Orchestrator
                  │
                  ├── Support agent
                  │
                  ├── Finance agent
                  │
                  └── Technical agent
```

The orchestrator can decide:

* which agent is needed,
* what task it receives,
* which order the agents should work in,
* when the results should be combined.

The specialists do not necessarily need to understand the entire system.

They only need to understand their own job.

**A good multi-agent system behaves more like a team than one all-purpose chatbot.**

---

## Why can specialisation help?

Imagine a customer-support system.

One agent needs to understand:

```text
- orders
- billing
- refunds
- product information
- technical issues
- contracts
- shipping
```

That means a large set of instructions and tools.

Instead, you could split it:

```text
Triage Agent
    ↓
    ├── Order Agent
    ├── Billing Agent
    ├── Technical Support Agent
    └── Product Agent
```

The Order Agent deals with orders.

The Billing Agent deals with invoices and payments.

The Technical Support Agent deals with technical issues.

**A narrower responsibility can mean a simpler prompt, fewer tools and tighter permissions.**

OpenAI's guidance similarly recommends adding specialists when they genuinely introduce different instructions, tools, policies or clearly separated responsibilities. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

---

## 1. Manager + specialists

One of the simplest patterns is a central manager agent.

```text
                    ┌── Research Agent
                    │
User → Manager ─────┼── Finance Agent
                    │
                    ├── Technical Agent
                    │
                    └── Writer Agent
```

The manager receives the user's request.

For example:

> “Analyse whether we should introduce a new subscription plan.”

The manager could divide the task into:

```text
Research Agent
→ market information

Finance Agent
→ revenue and cost analysis

Technical Agent
→ implementation requirements

Writer Agent
→ final summary
```

The manager then combines the results.

OpenAI describes this as the **manager pattern**, or “agents as tools”: the manager retains control of the workflow and final response while using specialists to perform bounded tasks. [OpenAI – A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)

---

## 2. Handoffs: when one agent passes the task to another

Another approach is for one agent to hand control to a specialist.

```text
User
↓
Triage Agent
↓
Technical Support Agent
↓
Billing Agent
```

For example:

> “My invoice is wrong, and because of that I cannot activate my subscription.”

The triage agent might recognise that the immediate problem is billing:

```text
Triage
↓
Billing Agent
```

The billing agent could later hand the issue to technical support:

```text
Billing
↓
Technical Support
```

OpenAI's Agents SDK calls this a **handoff**: execution control moves to the specialist. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

This is useful when **the specialist should take ownership of the next part of the task**, rather than simply performing a small helper function.

---

## 3. Parallel agents

One of the strongest potential benefits of multi-agent systems is parallel work.

Suppose a business wants to launch a new product.

A single agent might work sequentially:

```text
Market research
↓
Competitors
↓
Financial analysis
↓
Technical analysis
↓
Summary
```

With several agents:

```text
             ┌── Market research
             │
             ├── Competitor analysis
User → Orchestrator ── Financial analysis
             │
             └── Technical analysis
                       ↓
                   Aggregation
```

If those tasks are independent, they can potentially be performed at the same time.

OpenAI's multi-agent documentation explicitly identifies independent tasks such as reviewing separate documents or investigating different causes of a problem as suitable candidates for subagents. [OpenAI – Multi-agent](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)

Anthropic describes its own Research system using an orchestrator-worker architecture in which a lead agent delegates research tasks to specialised subagents that operate in parallel. [Anthropic – How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

**Parallel execution does not necessarily make a system cheaper, but for the right workflow it can significantly reduce elapsed time.**

---

## A practical example: business analysis

Imagine a company asks:

> “Should we introduce a new subscription service costing €125 per month?”

A single agent could try to do everything.

A multi-agent system might use:

### Research Agent

Looks at:

* the market,
* competitors,
* publicly available information.

### Finance Agent

Calculates:

* required customer numbers,
* revenue,
* costs,
* different financial scenarios.

### Product Agent

Examines:

* required features,
* technical requirements,
* integrations.

### Risk Agent

Looks for:

* business risks,
* technical risks,
* privacy or security concerns.

Then:

```text
Research ─────┐
Finance ──────┤
Product ──────┼→ Manager → Final report
Risk ─────────┘
```

The manager does not necessarily perform the work itself.

**It coordinates it.**

---

## Why can smaller prompts help?

A single “super-agent” prompt can eventually become:

```text
You are the company's general AI assistant.

Handle billing.
Handle orders.
Analyse contracts.
Write marketing material.
Help with technical issues.
Manage the CRM.
Send emails.
...
```

And then you add a large collection of tools.

A specialist can instead have:

```text
You are the company's billing specialist.

Your responsibilities:
- retrieve invoices
- check invoice status
- identify billing errors

You must not issue an invoice
without user approval.
```

That is much narrower.

**One benefit of specialisation is that the agent has a smaller decision space.**

---

## The number of tools matters too

Imagine an agent with 50 different tools.

It may have access to:

* CRM,
* ERP,
* invoicing,
* calendar,
* email,
* files,
* search,
* databases,
* online shop,
* warehouse,
* reporting,
* administration.

Every tool comes with:

* a name,
* a description,
* parameters,
* permissions,
* error handling.

At some point, the problem is no longer simply that the AI is “not smart enough”.

**There are simply too many possible actions to choose from.**

OpenAI's current guidance recommends improving tool names, parameters and descriptions first; only introduce multiple agents when this no longer produces sufficient improvement. [OpenAI – A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)

---

## But multi-agent systems are not free

This is the part that AI-agent marketing often underplays.

More agents can mean:

* more model calls,
* more tokens,
* more context,
* more data transfer,
* more logging,
* more infrastructure.

For a simple request:

```text
User
↓
1 agent
↓
Answer
```

A multi-agent workflow might look like:

```text
User
↓
Manager
↓
3 specialists
↓
Manager
↓
Answer
```

You could be making several model calls where one would have been enough.

**If one agent solves the problem reliably, adding more agents only adds cost and complexity.**

Microsoft's architecture guidance therefore recommends starting at the lowest level of complexity that reliably meets the requirements. If a single agent can solve the task, a multi-agent architecture is not necessary. [Microsoft – AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

---

## Latency can increase too

Multiple agents can also take more time.

If:

```text
Manager
↓
Agent A
↓
Agent B
↓
Agent C
↓
Manager
```

is sequential, each step adds latency.

But if:

```text
        ┌── Agent A
        │
Manager ├── Agent B
        │
        └── Agent C
             ↓
          Manager
```

the independent tasks can potentially run in parallel.

That makes orchestration an important design question:

> **Which tasks can run independently, and which depend on the result of another task?**

---

## You also create new failure modes

With one agent:

```text
Agent
↓
Wrong decision
```

With multiple agents:

```text
Agent A
↓
Wrong result
↓
Manager
↓
Bad aggregation
↓
Agent B
↓
Bad next decision
```

You can also introduce failures that do not exist in a single-agent system:

* routing to the wrong specialist,
* duplicated work,
* lost context,
* incorrect aggregation,
* circular handoffs,
* excessive agent calls,
* conflicting results.

Anthropic's description of its multi-agent research system notes that vague task descriptions led to duplicated research and gaps in coverage. [Anthropic – How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

**More agents do not automatically mean better results. They require better coordination.**

---

## Context becomes a separate problem

With one agent:

```text
User
↓
Agent
↓
Context
↓
Tool
```

With several agents, you need to decide what the next agent receives.

Everything?

Nothing?

Only the previous result?

For example:

```text
Research Agent
↓
10-page report
↓
Manager
↓
3 key findings
↓
Finance Agent
```

If you pass too much information, cost and noise increase.

If you pass too little, important information may disappear.

**Communication between agents needs to be designed as carefully as the agents themselves.**

---

## Not every agent needs the same model

This is another interesting possibility.

For example:

```text
Manager
→ stronger model

Simple classifier
→ cheaper model

Summariser
→ fast model

Complex analyst
→ stronger model
```

Not every task requires the same level of capability.

Using the most expensive model for a simple classification task may be unnecessary.

For a complex financial or technical analysis, a more capable model may be justified.

**One potential economic benefit of a multi-agent architecture is the ability to choose models per task.**

But this needs to be measured.

If the cheaper model makes enough mistakes to require retries or human intervention, the apparently cheaper setup may not actually be cheaper.

---

## Security boundaries can be useful too

This is particularly relevant in enterprise environments.

For example:

```text
Research Agent
→ web search only

Finance Agent
→ read-only financial data

Billing Agent
→ invoicing API

Admin Agent
→ critical operations
```

The agents do not need identical access.

Microsoft's multi-agent guidance highlights least privilege, simplicity, auditability and governance when designing interactions between agents and tools. [Microsoft – Multi-agent patterns](https://learn.microsoft.com/en-us/agents/architecture/multi-agent-patterns)

This means specialisation is not only a performance question.

**It can also be a security architecture.**

---

## MCP and multi-agent systems

When agents use different tools, **MCP**, the Model Context Protocol, becomes relevant.

MCP provides a standardised way for AI applications to connect to external tools and data.

For example:

```text
Manager Agent
      ↓
MCP
      ↓
CRM / ERP / Database
```

Or individual specialists can have different tool sets:

```text
Research Agent → Search MCP
Finance Agent  → Finance MCP
Support Agent  → CRM MCP
```

MCP is designed to support interoperability between AI applications and external context, resources and tools. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index)

**MCP primarily standardises the connection between agents and tools or data; it is not itself a multi-agent orchestration system.**

---

## And what about A2A?

If you are not just connecting agents inside your own application, but want independent agent systems to communicate, **Agent2Agent, or A2A**, becomes relevant.

A2A is an open standard designed to enable communication and interoperability between independent agents, potentially built with different frameworks, languages or vendors. [A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/)

In simplified form:

```text
Your AI Agent
      ↓
      A2A
      ↓
External specialist agent
```

For example, a travel system might look like:

```text
Travel Agent
↓
A2A
├── Flight Agent
├── Hotel Agent
└── Insurance Agent
```

The agents do not necessarily need access to each other's internal implementation.

**MCP is primarily about agent → tool/data, while A2A addresses agent → agent communication.**

---

## When is one agent enough?

Very often.

Examples include:

* customer-support chatbots,
* simple internal assistants,
* document summarisation,
* querying a single database,
* simple CRM assistants,
* well-defined automations.

Microsoft describes a single tool-using agent as a useful enterprise default because it can dynamically use tools while remaining easier to test and debug than a multi-agent architecture. [Microsoft – AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)

So the sensible starting point is:

> **Try to solve the problem with one agent first.**

Split it only when there is a concrete reason.

---

## When should you use multiple agents?

A multi-agent architecture can become justified when:

* different specialist domains are involved,
* there are too many tools,
* the prompt has become too complex,
* different security policies are required,
* independent tasks can run in parallel,
* you want different models for different tasks,
* separate agent systems need to communicate.

A simple decision tree:

```text
Can one agent solve it?
        ↓
       Yes
        ↓
    Keep one agent

       No
        ↓
Why not?

├── Too many tools?
│      ↓
│   Specialise
│
├── Multiple independent tasks?
│      ↓
│   Parallel agents
│
├── Different security boundary?
│      ↓
│   Separate agent
│
├── Different domain?
│      ↓
│   Specialist agent
│
└── External agent system?
       ↓
      A2A
```

---

## A good multi-agent system does not have to be complicated

The final architecture may be surprisingly simple:

```text
                 ┌── Research
                 │
User → Manager ──┼── Finance
                 │
                 └── Technical
                       ↓
                    Summary
```

The important thing is that every component has a clear responsibility.

### Manager

Responsible for:

* task decomposition,
* sequencing,
* result aggregation.

### Research Agent

Responsible for:

* information gathering,
* source analysis.

### Finance Agent

Responsible for:

* calculations,
* financial analysis.

### Technical Agent

Responsible for:

* technical feasibility,
* architecture.

**A good specialist does not know a little about everything. It performs one defined job well.**

---

## The biggest mistake: adding agents because you can

This is easy to do.

First:

```text
1 agent
```

Then:

```text
3 agents
```

Then:

```text
10 agents
```

Eventually:

```text
Manager
↓
Agent
↓
Agent
↓
Agent
↓
Agent
↓
Manager
↓
Agent
```

It works.

But nobody quite knows why.

OpenAI's documentation explicitly recommends adding specialists only when they materially improve capability isolation, policy isolation, prompt clarity or workflow legibility. [OpenAI – Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)

**Multi-agent is not the goal. It is an architectural tool.**

---

## How should you build one?

A sensible development process is:

```text
1. Solve it with one agent.
        ↓
2. Measure the failures.
        ↓
3. Identify the bottleneck.
        ↓
4. Define a specialist.
        ↓
5. Give it a narrow tool and prompt set.
        ↓
6. Choose: manager or handoff?
        ↓
7. Test separately and together.
        ↓
8. Measure cost and latency.
```

This is much better than designing a ten-agent architecture from day one.

---

## The future is not necessarily “more AI”

The more important change may be that **different capabilities can be composed**.

A business might have:

```text
Customer Agent
Finance Agent
Sales Agent
Technical Agent
Research Agent
```

These do not necessarily have to be separate products.

They can be components of a larger business workflow.

And with standards such as A2A, independent agent systems can potentially collaborate across organisational or vendor boundaries. The A2A specification is explicitly designed for interoperability between independent agents. [A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/)

This points towards a model in which one AI system does not necessarily try to solve everything.

**Instead, multiple specialists work together towards a shared goal.**

---

## The question is not how many agents you need

The wrong question is:

> “How many AI agents should we use?”

The better question is:

> **“Which responsibilities should be separated?”**

If one agent works well, keep it together.

If it is handling too many responsibilities, specialise.

If there are independent tasks, parallelise them.

If different permissions are required, separate them.

If you need to connect independent agent systems, investigate A2A.

And in every case, measure:

* accuracy,
* latency,
* token usage,
* cost,
* failure rate,
* need for human intervention.

**A good multi-agent system is not good because it has many agents. It is good because it distributes complexity where doing so creates a real benefit.**

**softwaredevelopment.hu — AI agents, automation, multi-agent systems and custom AI architecture for businesses.**

---

## Sources

* OpenAI: [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)
* OpenAI: [Multi-agent](https://developers.openai.com/api/docs/guides/agents-api/multi-agent)
* OpenAI: [A practical guide to building AI agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
* OpenAI: [Agents SDK](https://developers.openai.com/api/docs/guides/agents/sdk)
* OpenAI: [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)
* Anthropic: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
* Microsoft: [AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
* Microsoft: [Multi-agent patterns](https://learn.microsoft.com/en-us/agents/architecture/multi-agent-patterns)
* Model Context Protocol: [Server overview](https://modelcontextprotocol.io/specification/draft/server/index)
* A2A Protocol: [Agent2Agent Protocol Specification](https://a2a-protocol.org/dev/specification/)
* A2A Protocol: [Agent2Agent Protocol](https://a2a-protocol.org/v1.0.0/)
* arXiv: [Reinforcement Learning for LLM-based Multi-Agent Systems through Orchestration Traces](https://arxiv.org/abs/2605.02801)

```
