---
title: "Function calling and tool use: how can an AI use APIs and databases?"
description: "How can AI systems use APIs, databases and external tools? Function calling and tool use explained with a practical example and security principles."
tags: [function-calling, tool-use, ai-agent, api, mcp]
date: 2026-11-02 08:00
image: /articles/function-calling-and-tool-use/share.jpg
---

## What happens when AI can do more than answer?

A traditional chatbot works roughly like this:

```text
User
↓
AI
↓
Text response
```text

You ask:

> “What is the total value of this order?”

The AI can answer.

But where would it get the information?

If the data lives in a database, the language model does not automatically have access to it.

This is where **function calling** and the broader concept of **tool use** come in.

The model can decide that it needs to use an available tool, provide structured arguments for that tool, and then let the application execute the actual operation. Google's Gemini documentation explicitly describes this separation: the model selects the function and arguments, while the application is responsible for executing the function. [Google – Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling)

**This is one of the key steps from a chatbot towards a real AI agent.**

---

## What is function calling?

The simplest example is a weather function.

You give the AI:

```text
get_weather(city)
```text

The user asks:

> “What's the weather like in Budapest?”

The model does not necessarily try to guess.

It can request:

```text
get_weather({
  "city": "Budapest"
})
```text

Your backend executes the function.

The API returns something like:

```text
{
  "temperature": 18,
  "condition": "rain"
}
```text

You send that result back to the AI, which produces the user-facing response.

```text
User
↓
AI
↓
"get_weather Budapest"
↓
Backend
↓
Weather API
↓
18 °C, rain
↓
AI
↓
"It is currently 18 °C and raining in Budapest."
```text

**The model does not necessarily call the API itself. It requests the tool call; your application executes it.**

The OpenAI Responses API similarly supports connecting models to external data and functions through tools, including function calling and remote MCP. [OpenAI – Developer quickstart](https://platform.openai.com/docs/quickstart)

---

## What is the difference between function calling and tool use?

The two terms are often used interchangeably.

**Function calling** usually means allowing a model to request a structured call to a function.

For example:

```text
get_customer(id)
create_invoice(customer_id, amount)
send_email(to, subject, body)
```text

**Tool use** is broader.

A tool might be:

- an API,
- a database query,
- a search engine,
- a calculator,
- a file system,
- a code execution environment,
- a browser,
- another AI system,
- a function exposed through an MCP server.

Hugging Face describes tool use as allowing language models to call external functions as part of generating a response. [Hugging Face – Tool use](https://huggingface.co/docs/transformers/main//chat_extras)

**Function calling is therefore one common implementation of tool use.**

---

## The AI is actually making a decision

Imagine you give an AI three tools:

```text
get_customer
get_order
create_invoice
```text

The user says:

> “Look up order 12345 and tell me who it belongs to.”

The AI does not need all three.

It may request:

```text
get_order(12345)
```text

The result might contain:

```text
customer_id = 678
```text

The AI can then request:

```text
get_customer(678)
```text

And finally answer:

> “Order 12345 belongs to Peter Kovacs.”

That is already a multi-step process.

Gemini's documentation supports both sequential and parallel function-calling workflows. [Google – Function calling](https://ai.google.dev/gemini-api/docs/function-calling)

---

## A simple worked example

Imagine an online shop.

The database contains:

```text
customers
orders
products
```text

And you have an AI assistant.

The application exposes:

```text
get_order_status(order_id)
```text

The user asks:

> “Where is my order 8421?”

The process could look like this:

```text
1. User:
   "Where is my order 8421?"

2. AI:
   get_order_status(8421)

3. Backend:
   SELECT status
   FROM orders
   WHERE id = 8421

4. Database:
   SHIPPED

5. Backend → AI:
   {"status": "shipped"}

6. AI:
   "Your order has already been handed to the courier."
```text

The important point is that **the AI does not need direct database access**.

Your backend decides what it is allowed to do.

---

## Why not just give the AI the database?

Because this:

```text
AI
↓
Entire database
```text

would be a poor architecture in many business systems.

A more controlled design is:

```text
AI
↓
get_order_status
↓
Backend
↓
Authorised query
↓
Database
```text

The model only gets access to what the tool exposes.

If the tool only returns order status, the AI does not need access to:

- passwords,
- bank details,
- other customers,
- internal tables,
- administrative data.

**A tool is a controlled gateway between an AI system and your business systems.**

---

## Tool definitions matter

The model needs some way to understand what tools are available.

For example:

```text
Name:
get_order_status

Description:
Returns the current status of a customer's order.

Parameters:
order_id: integer
```text

The model can then use that information to decide when the tool is relevant.

OpenAI function tools use a name, description and JSON Schema-style parameter definition. The API also supports strict schema enforcement for function arguments. [OpenAI – Responses API reference](https://platform.openai.com/docs/api-reference/responses)

Google's documentation similarly highlights the importance of the function name, purpose, parameters and parameter descriptions. [Google – Function calling](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)

**A tool description is not merely documentation. It is part of the information the model uses to decide whether and how to use the tool.**

---

## The model is not the execution layer

This is an important distinction.

The model might request:

```text
create_invoice(
    customer_id=123,
    amount=250000
)
```text

That does not mean an invoice has been created.

Your application still needs to:

1. validate the arguments,
2. check permissions,
3. execute the operation,
4. handle errors,
5. return the result.

Google's official documentation explicitly states that executing custom function code is the application's responsibility. [Google – Function calling](https://ai.google.dev/gemini-api/docs/function-calling)

Hugging Face describes the same loop: the model generates a tool call, the application executes the function, and the result is added back to the conversation. [Hugging Face – Tool use](https://huggingface.co/docs/transformers/main//chat_extras)

---

## The complete AI-tool loop

An agentic system often works like this:

```text
User
↓
AI
↓
Does it need external data?
↓
Yes
↓
Select tool
↓
Generate arguments
↓
Backend validates
↓
Execute tool
↓
Return result
↓
AI
↓
Enough information?
↓
No → another tool
↓
Yes
↓
Final response
```text

This loop can run several times.

And that is what makes agents interesting.

**The AI is not just generating an answer; it can also select the next operation needed to complete the task.**

---

## Example: a customer-support agent

Imagine an online shop with an AI assistant.

Available tools:

```text
search_orders
get_order
get_product
check_stock
create_return_request
```text

The user asks:

> “I want to return order 8421. Is the product still in stock?”

The AI might perform:

```text
get_order(8421)
↓
get_product(product_id)
↓
check_stock(product_id)
↓
AI response
```text

Then the user says:

> “Start the return as well.”

Now the system has a tool that performs an action:

```text
create_return_request(order_id=8421)
```text

This is where security becomes particularly important.

---

## Not all tools are equally risky

A `get_weather` call is usually read-only.

A `create_invoice` call modifies data.

A `delete_customer` call has much more serious consequences.

It is useful to think in at least three categories:

```text
READ
↓
Retrieve information

WRITE
↓
Modify information

DESTRUCTIVE
↓
Delete / financial / irreversible action
```text

MCP defines tools as executable functions that models can use to retrieve information or perform actions, and the MCP ecosystem also discusses annotations that describe tool behaviour and risk. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index) [MCP – Tool Annotations as Risk Vocabulary](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/)

**The greater the impact of a tool, the stronger the controls around it should be.**

---

## Least privilege: give it only what it needs

This is one of the most important security principles.

If the AI only needs order status, do not give it full database access.

Not:

```text
AI
↓
DB_ADMIN
```text

But:

```text
AI
↓
get_order_status
↓
Only the required data
```text

The same applies to APIs.

If the agent only needs to read the CRM, do not give it permission to delete records.

If it should manage one customer's information, do not give it access to the entire company.

**The AI's permissions should be as narrow as practical.**

---

## Validation is mandatory

Suppose you have:

```text
refund_order(order_id, amount)
```text

The AI generates:

```text
refund_order(
    order_id=8421,
    amount=999999999
)
```text

Your backend should never simply execute that request.

It should check:

- whether the order exists,
- whether the user is authorised,
- whether that amount is actually refundable,
- whether the order is eligible,
- whether a refund has already been issued.

Tool arguments are therefore **untrusted input, even when they were generated by an AI model.**

```text
AI output
↓
Schema validation
↓
Business validation
↓
Authorisation
↓
Execution
```text

---

## The confirmation rule

Some operations should not happen automatically.

For example:

- transferring money,
- issuing an invoice,
- deleting an order,
- sending an email,
- accepting a contract,
- deleting a user.

The system can instead ask:

> “You are about to refund €3,100 for order 8421. Do you want to approve this?”

Only then:

```text
USER CONFIRMED
↓
refund_order(...)
```text

Google's function-calling documentation specifically recommends validating significant actions with the user before execution when they have meaningful consequences. [Google – Function calling](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)

---

## What happens if the AI chooses the wrong tool?

It can happen.

The user says:

> “Delete my old order.”

The model might select:

```text
delete_order
```text

But how does it know:

- which order?
- whether the user really wants deletion?
- whether the user has permission?
- whether deletion is allowed?

That is why the agent cannot be the only security layer.

**Your backend must validate everything even after the AI has “decided”.**

---

## Using APIs with AI

One of the most practical uses of function calling is connecting existing APIs.

A business might have:

- a CRM,
- an invoicing system,
- an online shop,
- a warehouse system,
- a calendar.

You can put an AI layer over them.

```text
                 ┌── CRM
                 │
AI Agent ─ Tools ├── Invoicing
                 │
                 ├── Online shop
                 │
                 ├── Warehouse
                 │
                 └── Calendar
```text

The user can then ask:

> “Check whether we have 20 of these in stock and reserve them if we do.”

The agent can first check stock.

If enough units are available, it can call another tool.

This is no longer just a chatbot.

**It becomes a natural-language interface to your existing business systems.**

---

## What about databases?

You do not necessarily need to generate SQL with the AI.

Often, a controlled tool is safer:

```text
find_customer_orders(
    customer_id
)
```text

rather than:

```text
execute_sql(
    "SELECT * FROM ..."
)
```text

With the first approach, you define exactly what the model can query.

The second gives it considerably more freedom.

There are legitimate cases for AI-generated SQL, particularly in controlled analytics environments where queries are validated and run against a restricted, read-only data source.

But for a production business database:

**do not give an LLM unrestricted SQL access just because it is convenient.**

---

## Tool calling and MCP

Once you start connecting several AI systems to several tools, **MCP**, or Model Context Protocol, becomes relevant.

MCP is a protocol for connecting AI applications with external context, resources and tools.

In MCP, tools are executable functions that AI applications can use to retrieve information or perform actions. [Model Context Protocol – Server overview](https://modelcontextprotocol.io/specification/draft/server/index)

In simplified form:

```text
AI application
↓
MCP client
↓
MCP server
↓
Tools
↓
CRM / Database / API / Files
```text

MCP is not the AI itself.

It is not a database either.

**It is a standardised communication layer through which AI applications can access tools and other context.**

---

## Why does this matter to businesses?

Because you do not necessarily have to build a completely separate integration for every AI application.

A company could create its own MCP server:

```text
Company MCP Server

Tools:
- search_customer
- get_order
- check_stock
- create_invoice
- create_support_ticket
```text

Different AI clients could then use those tools with appropriate permissions.

The 28 July 2026 MCP specification includes mechanisms around tool calls, routing and authorisation, among other protocol changes. [Model Context Protocol – 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)

That is one reason MCP has become an important part of the conversation around agentic systems.

---

## Tool use is not magic

It is important to clear up one misconception.

The AI does not simply “log into your business system” and start browsing the database.

Developers still need to create:

- the tool,
- its parameters,
- permissions,
- validation,
- execution logic,
- error handling,
- logging.

The AI can then **decide when and with which arguments to request an available tool.**

The 2023 Toolformer research explored how language models could learn to use external APIs, including deciding when to call them, what arguments to provide and how to incorporate the returned results. [arXiv – Toolformer](https://arxiv.org/abs/2302.04761)

---

## A good agent architecture

A simple business system might look like:

```text
                    ┌── CRM Tool
                    │
                    ├── Order Tool
User → AI Agent ────┼── Invoice Tool
                    │
                    ├── Database Tool
                    │
                    └── Email Tool
                           ↓
                     Security Layer
                           ↓
                    Business Backend
```text

The security layer might provide:

- authentication,
- authorisation,
- input validation,
- rate limiting,
- audit logging,
- confirmation,
- transaction limits.

**The AI should be the decision and coordination layer, not the only security layer.**

---

## When should you use tool use?

It is particularly useful when AI needs to:

- retrieve current information,
- use a CRM,
- check orders,
- access invoicing data,
- work with calendars,
- connect APIs,
- process files,
- perform calculations,
- coordinate multi-step business processes.

It is much less interesting when the AI only needs to generate text.

---

## The key idea

Function calling does not automatically turn a chatbot into an agent.

But it provides one of the most important capabilities:

**AI can initiate actions beyond generating text.**

The process becomes:

```text
Understand the request
↓
Select a tool
↓
Generate arguments
↓
Backend validates
↓
Tool executes
↓
Result returned
↓
AI interprets it
↓
Next step
↓
Response
```text

With several tools available, an AI system can coordinate increasingly complex workflows.

But one rule remains essential:

> **The AI can decide what it wants to try. Your system must decide whether it is actually allowed to do it.**

That is the difference between an interesting demo and a business AI system that can be used safely.

**softwaredevelopment.hu — AI agents, API integrations, MCP and custom business automation.**

---

## Sources

- OpenAI: [Developer quickstart – Extend the model with tools](https://platform.openai.com/docs/quickstart)
- OpenAI: [Responses API reference](https://platform.openai.com/docs/api-reference/responses)
- Anthropic: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Google AI for Developers: [Function calling with the Gemini API](https://ai.google.dev/gemini-api/docs/function-calling)
- Google AI for Developers: [Using tools with Gemini API](https://ai.google.dev/gemini-api/docs/tools)
- Google AI for Developers: [Function calling – Generate Content API](https://ai.google.dev/gemini-api/docs/generate-content/function-calling)
- Microsoft Learn: [How to use function calling with Microsoft Foundry Models](https://learn.microsoft.com/en-sg/azure/ai-foundry/openai/how-to/function-calling)
- Microsoft Learn: [Fine-tuning and tool calling](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/fine-tuning-functions)
- Hugging Face: [Tool use](https://huggingface.co/docs/transformers/main//chat_extras)
- Hugging Face: [Expanding Chat Templates with Tools and Documents](https://huggingface.co/docs/transformers/main/chat_template_tools_and_documents)
- Model Context Protocol: [Server overview](https://modelcontextprotocol.io/specification/draft/server/index)
- Model Context Protocol: [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- Model Context Protocol: [Tool Annotations as Risk Vocabulary](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/)
- arXiv: [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761)
