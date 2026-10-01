---
title: "The A2A Protocol: How Do AI Agents Talk to Each Other?"
description: "Learn how A2A lets AI agents discover each other, delegate tasks and collaborate, and how it differs from MCP in multi-agent systems."
tags: [a2a, ai-agent, multi-agent, mcp, automation]
date: 2026-10-30 08:00
image: /articles/a2a-protocol/share.jpg
---

## What happens when an AI agent needs help?

In the previous articles, we looked at how an AI agent can use external tools through MCP.

But consider a more complex system.

You have a customer-service agent that receives this request:

> “I returned the product. When will I get my refund?”

The customer-service agent can handle the conversation, but perhaps it does not manage invoices or refunds.

Instead of connecting every system directly to the same agent, it could ask another specialised agent for help.

**That is where the Agent2Agent Protocol, or A2A, comes in.**

A2A is an open standard designed to let independent AI agents communicate and collaborate, even when they were built using different frameworks, programming languages or vendors. It was originally developed by Google and is now hosted within the Linux Foundation ecosystem. The current official specification is version 1.0.0. ([A2A Protocol](https://a2a-protocol.org/v1.0.0/), [Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/))

---

## A2A is not another chatbot

It is important to separate a few concepts.

A2A is not an AI model.

It is not an agent framework.

And it is not the agent itself.

**A2A is a communication protocol for agents.**

Simplified:

```text
Agent A
   ↓
   A2A
   ↓
Agent B
```

One agent can delegate a task, request information, exchange context, receive a result or track a longer-running task.

The official A2A specification is designed so that agents can collaborate without needing access to each other's internal state, memory or tools. ([A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/))

That is important.

An agent can effectively be a black box.

Another agent only needs to know:

- what it can do,
- where it is available,
- which tasks it supports,
- how to communicate with it,
- and what kind of result it can return.

---

## A2A and MCP: what is the difference?

This is one of the most important distinctions in today's agent architecture.

**MCP connects an agent to tools and resources.**

**A2A connects an agent to other agents.**

A simple picture:

```text
                    AI Agent
                   /        \
                MCP          A2A
                 ↓             ↓
          Tools / Data      Other Agents
```

MCP can give an agent access to:

- databases,
- CRMs,
- files,
- GitHub,
- APIs,
- internal business systems.

A2A allows the agent to communicate with another agent.

The official A2A documentation describes them as complementary layers: MCP handles the relationship between an agent and tools or resources, while A2A handles collaboration between agents. ([A2A Protocol – A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/))

A real system can use both:

```text
Customer Agent
      │
      │ A2A
      ↓
Billing Agent
      │
      │ MCP
      ↓
Billing Database
```

---

## 1. Agent discovery – how does one agent find another?

Before two agents can collaborate, one needs to know that the other exists.

It also needs to know what the other agent can actually do.

This is where the **Agent Card** comes in.

An Agent Card is a structured JSON document that acts as an agent's digital business card.

It can describe:

- the agent's name,
- description,
- service endpoint,
- capabilities,
- skills,
- supported interaction formats,
- authentication requirements.

According to the official documentation, the Agent Card lets a client agent understand a remote agent's capabilities and how to interact with it securely. ([A2A Protocol – Agent Discovery](https://a2a-protocol.org/dev/topics/agent-discovery/))

A simplified example:

```text
Agent Card

Name:
Billing Agent

Description:
Handles invoices and refunds

Skills:
- check_invoice
- calculate_refund
- process_refund

Endpoint:
https://billing.example.com/a2a
```

The calling agent can now decide:

> “This agent can handle refunds. I should delegate this part of the task.”

---

## 2. Delegation – handing over a task

Suppose a Customer Service Agent receives:

> “I returned the product. When will I get my refund?”

The agent recognises that this is a billing-related task.

The process might look like:

```text
Customer
  ↓
Customer Service Agent
  ↓
“This is a billing task”
  ↓
Billing Agent
  ↓
Refund information
  ↓
Customer Service Agent
  ↓
Customer
```

The Customer Service Agent does not need to know how the Billing Agent works internally.

It does not need to know:

- which database it uses,
- which model it uses,
- which framework it uses,
- or which tools it uses internally.

**It only needs to understand its advertised capabilities and A2A interface.**

This is one of the important ideas behind multi-agent systems.

---

## 3. An agent is not just another function call

At first, it may seem simpler to expose another agent as a tool.

Sometimes that can work.

But an agent can be considerably more complex than a typical function.

A tool might look like:

```text
get_customer(id)
```

An agent may instead:

- reason about a task,
- ask for clarification,
- perform multiple steps,
- work for a longer period,
- use several tools,
- maintain state,
- and produce different kinds of results.

A2A therefore treats agents as more than simple function calls. The official documentation supports multi-turn, stateful and longer-running interactions. ([A2A Protocol – What is A2A?](https://a2a-protocol.org/dev/topics/what-is-a2a/))

---

## 4. Tasks – the unit of collaboration

In A2A, a **Task** represents a stateful unit of work.

This becomes useful when an agent cannot respond immediately.

For example:

> “Analyse our complete sales dataset and prepare a report.”

That might take several minutes.

The client should not have to keep one request open until everything is finished.

Instead, the task can have a lifecycle:

```text
submitted
   ↓
working
   ↓
input-required
   ↓
working
   ↓
completed
```

The A2A specification treats tasks as stateful units of work with associated messages and results. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

This makes A2A suitable for more than simple request-and-response interactions.

---

## 5. Messages and artifacts

Agents do not have to exchange only plain text.

A2A distinguishes between **Messages** and **Artifacts**.

A Message is part of the communication.

For example:

> “I found the invoice, but I need the return date before I can calculate the refund.”

An Artifact is a concrete result, such as:

- a document,
- an image,
- structured JSON,
- a file,
- an analysis,
- or another generated output.

The A2A specification separates communication from task outputs: Messages support interaction and status communication, while Artifacts represent concrete results produced by a task. ([A2A Protocol – Specification](https://a2a-protocol.org/dev/specification/))

That matters because the output of an agent is not always a single sentence.

---

## A complete business example: travel planning

Consider this request:

> “Plan a three-day business trip to Berlin with flights and a hotel.”

One agent could try to handle everything.

A multi-agent architecture could instead use:

```text
Travel Agent
   │
   ├── A2A → Flight Agent
   │
   ├── A2A → Hotel Agent
   │
   └── A2A → Calendar Agent
```

### 1. Travel Agent

The main agent interprets the goal.

It identifies the need for:

- flights,
- accommodation,
- calendar availability.

### 2. Flight Agent

The Travel Agent delegates:

> “Find suitable flights to Berlin for the requested dates.”

The Flight Agent uses its own systems.

Internally, it might use MCP:

```text
Flight Agent
    ↓ MCP
Airline API
    ↓
Flight data
```

### 3. Hotel Agent

The Travel Agent asks another agent:

> “Find suitable business accommodation near the city centre.”

The Hotel Agent uses its own data sources.

### 4. Results come back

```text
Flight Agent
      ↓
3 flight options

Hotel Agent
      ↓
5 hotel options

Calendar Agent
      ↓
Available dates
```

### 5. The main agent assembles the result

The Travel Agent combines the information and presents an itinerary to the user.

The important point is:

**The Travel Agent does not need direct access to every underlying system.**

It delegates specialised work to specialised agents.

---

## A multi-agent architecture

A larger enterprise system might look like this:

```text
                    User
                      ↓
                Orchestrator
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       Sales       Support      Finance
       Agent        Agent        Agent
          │           │           │
         MCP         MCP         MCP
          ↓           ↓           ↓
        CRM         Tickets       ERP
```

A2A can handle communication between the agents.

Inside each agent, MCP can provide access to its own tools and data.

**A2A provides the communication between agents; MCP provides the tool and resource layer inside each agent.**

---

## Communication is more than request and response

A2A supports several interaction patterns.

For a short task, request/response may be enough.

For a longer-running operation, the system may need:

- streaming,
- status updates,
- push notifications,
- asynchronous processing.

The official A2A documentation describes request/response, Server-Sent Events streaming and push notifications as supported interaction mechanisms. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

This matters for longer business processes.

For example:

```text
09:00 → Task started
09:01 → Searching data
09:03 → Waiting for external system
09:05 → 60% complete
09:08 → Completed
```

The client does not necessarily need to remain blocked while the remote agent works.

---

## Why is it useful for an agent to be a “black box”?

Imagine that your company has a tax agent.

Another agent only needs to know:

```text
Tax Agent

Skills:
- calculate_tax
- explain_tax_rule
- validate_tax_data
```

It does not need to know:

- the underlying model,
- internal prompts,
- memory architecture,
- database,
- MCP tools.

That creates a strong abstraction boundary.

If the Tax Agent's internal implementation changes later, other agents may not need to change at all.

**One of A2A's core goals is interoperability between agents built with different frameworks, languages and vendors.** ([A2A Protocol](https://a2a-protocol.org/))

---

## What about security?

When agents communicate with each other, authentication and authorisation are just as important as in any other enterprise system.

An Agent Card can declare authentication requirements.

The A2A documentation describes credentials such as OAuth tokens or API keys as being passed through HTTP headers rather than as part of the A2A message content itself. ([A2A Protocol – Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/))

Important questions include:

- Who is allowed to call this agent?
- Which tasks can it accept?
- What information can it disclose?
- Which other agents can it contact?
- Which actions require human approval?
- How are delegated tasks logged?

This becomes particularly important because **one agent may trigger actions through another agent**.

A permission problem can therefore propagate across multiple steps.

---

## A2A + MCP: where it gets really interesting

The two protocols are not alternatives.

An agent could look like this:

```text
Customer Agent
     │
     │ A2A
     ↓
Billing Agent
     │
     ├── MCP → Invoice Database
     ├── MCP → ERP
     └── MCP → Payment API
```

The roles are now clear.

**A2A: “Talk to another agent.”**

**MCP: “Use a tool or access a resource.”**

The official A2A documentation explicitly describes MCP and A2A as complementary: MCP gives an individual agent access to tools and resources, while A2A gives that agent the ability to collaborate with other agents. ([A2A Protocol – A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/))

---

## When does a multi-agent system make sense?

Not every problem needs multiple agents.

For a simple task, this may be enough:

```text
User
 ↓
One Agent
 ↓
MCP Tools
 ↓
Result
```

A multi-agent architecture becomes more interesting when:

- different specialist domains are involved,
- different teams or systems own different tasks,
- different permissions are required,
- agents use different data sources,
- specialised agents perform distinct roles,
- or agents belonging to different organisations need to collaborate.

For example:

```text
One agent:
“Handle the entire company process.”

Multiple agents:
“Sales agent → CRM
 Finance agent → ERP
 Support agent → tickets
 Legal agent → documents”
```

The second architecture also introduces more complexity.

More agents do not automatically mean a better system.

---

## Are we heading towards networks of agents?

One of A2A's goals is an ecosystem where agents are not isolated applications.

An agent can discover another agent, learn about its capabilities, delegate work and process the result.

```text
                  Agent A
                 /       \
              A2A         A2A
               ↓           ↓
           Agent B      Agent C
              │             │
             MCP           MCP
              ↓             ↓
            Tools         Tools
```

This is no longer a simple chatbot architecture.

It is closer to a **distributed software system in which AI agents perform specialised roles and collaborate toward a common goal.**

The official A2A documentation positions the protocol as an interoperability layer for agents built with different frameworks and by different vendors. ([A2A Protocol](https://a2a-protocol.org/v1.0.0/))

## When should you use MCP, and when A2A?

If an AI agent needs access to a database, API, file or another tool, **MCP** may be the appropriate integration layer.

If an AI agent needs help from another autonomous agent, **A2A** is designed for that communication.

Together, they can form an architecture like this:

```text
User
 ↓
Agent A
 │
 ├── MCP → own tools
 │
 └── A2A → Agent B
              │
              ├── MCP → own tools
              └── A2A → Agent C
```

**MCP connects an agent to its capabilities. A2A connects an agent to other agents.**

That distinction is likely to become increasingly important as AI systems move from individual assistants towards specialised, interconnected agentic systems.

**softwaredevelopment.hu — AI, automation and custom software solutions for businesses.**

---

## Sources

- A2A Protocol: [A2A Protocol 1.0.0](https://a2a-protocol.org/v1.0.0/)
- A2A Protocol: [What is A2A?](https://a2a-protocol.org/dev/topics/what-is-a2a/)
- A2A Protocol: [Core Concepts and Components](https://a2a-protocol.org/latest/topics/key-concepts/)
- A2A Protocol: [Agent Discovery](https://a2a-protocol.org/dev/topics/agent-discovery/)
- A2A Protocol: [A2A and MCP](https://a2a-protocol.org/dev/topics/a2a-and-mcp/)
- A2A Protocol: [Protocol Specification](https://a2a-protocol.org/dev/specification/)
- Google Developers Blog: [Announcing the Agent2Agent Protocol](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- Google Developers Blog: [Developer’s Guide to AI Agent Protocols](https://developers.googleblog.com/developers-guide-to-ai-agent-protocols/)
